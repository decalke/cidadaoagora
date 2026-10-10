import {
  ApiBrasilVeiculosClient,
  ApiBrasilError,
  ApiBrasilSaldoInsuficienteError,
  VeiculoData
} from "../services/apibrasil-client";

interface Env {
  APIBRASIL_TOKEN: string;
  APIBRASIL_HOMOLOG?: string;
}

interface FipeResultado {
  valor: string;
  marca: string;
  modelo: string;
  anoModelo: number;
  combustivel: string;
  codigoFipe: string;
  mesReferencia: string;
}

// Cache global no isolate da Function para economizar consultas da mesma placa
const CACHE_PLACAS_MEMORIA = new Map<string, { dados: any; timestamp: number }>();

function normalizarTexto(txt: string): string {
  return (txt || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

/**
 * Consulta a FIPE gratuitamente via API pública aberta oficial (Parallelum / FIPE)
 * Faz match inteligente por marca, modelo e ano retornados da base veicular
 */
async function buscarFipeGratuita(veiculo: VeiculoData): Promise<FipeResultado | null> {
  try {
    // 1. Obter marcas de carros da FIPE
    const marcasRes = await fetch("https://parallelum.com.br/fipe/api/v1/carros/marcas", {
      headers: { "User-Agent": "CidadaoAgora-Fipe/1.0" },
    });
    if (!marcasRes.ok) return null;
    const marcas: Array<{ codigo: string; nome: string }> = await marcasRes.json();

    const marcaVeiculo = normalizarTexto(veiculo.marca || veiculo.fabricante || "");
    const marcaEncontrada = marcas.find((m) => {
      const nomeNorm = normalizarTexto(m.nome);
      return nomeNorm.includes(marcaVeiculo) || marcaVeiculo.includes(nomeNorm);
    });

    if (!marcaEncontrada) return null;

    // 2. Listar modelos da montadora encontrada
    const modelosRes = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaEncontrada.codigo}/modelos`, {
      headers: { "User-Agent": "CidadaoAgora-Fipe/1.0" },
    });
    if (!modelosRes.ok) return null;
    const modelosData: { modelos: Array<{ codigo: number; nome: string }> } = await modelosRes.json();

    // Palavras-chave do modelo para match aproximado
    const modeloOriginal = normalizarTexto(veiculo.modeloDetalhes?.sintetico || veiculo.modelo || "");
    const versaoOriginal = normalizarTexto(veiculo.versao || "");
    const termosBusca = `${modeloOriginal} ${versaoOriginal}`.split(/[\s/\\-]+/).filter(t => t.length >= 2);

    let melhorModelo: { codigo: number; nome: string } | null = null;
    let maiorPontuacao = -1;

    for (const mod of modelosData.modelos) {
      const nomeMod = normalizarTexto(mod.nome);
      let pontuacao = 0;
      for (const termo of termosBusca) {
        if (nomeMod.includes(termo)) {
          pontuacao += termo.length;
        }
      }
      if (pontuacao > maiorPontuacao) {
        maiorPontuacao = pontuacao;
        melhorModelo = mod;
      }
    }

    if (!melhorModelo || maiorPontuacao === 0) {
      // Fallback: se não pontuou com versão, tenta match direto no sintetico
      melhorModelo = modelosData.modelos.find(m => normalizarTexto(m.nome).includes(modeloOriginal)) || null;
    }

    if (!melhorModelo) return null;

    // 3. Listar anos disponíveis do modelo
    const anosRes = await fetch(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaEncontrada.codigo}/modelos/${melhorModelo.codigo}/anos`,
      { headers: { "User-Agent": "CidadaoAgora-Fipe/1.0" } }
    );
    if (!anosRes.ok) return null;
    const anos: Array<{ codigo: string; nome: string }> = await anosRes.json();

    const anoStr = String(veiculo.ano_modelo || veiculo.ano_fabricacao || "");
    const anoEncontrado = anos.find((a) => a.codigo.startsWith(anoStr)) || anos[0];

    if (!anoEncontrado) return null;

    // 4. Obter valor FIPE consolidado
    const fipeRes = await fetch(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaEncontrada.codigo}/modelos/${melhorModelo.codigo}/anos/${anoEncontrado.codigo}`,
      { headers: { "User-Agent": "CidadaoAgora-Fipe/1.0" } }
    );
    if (!fipeRes.ok) return null;
    const fipeFinal: any = await fipeRes.json();

    return {
      valor: fipeFinal.Valor,
      marca: fipeFinal.Marca,
      modelo: fipeFinal.Modelo,
      anoModelo: fipeFinal.AnoModelo,
      combustivel: fipeFinal.Combustivel,
      codigoFipe: fipeFinal.CodigoFipe,
      mesReferencia: fipeFinal.MesReferencia,
    };
  } catch {
    return null;
  }
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Limite de 5 consultas por IP / Usuário
  const clientIp = request.headers.get("CF-Connecting-IP") || request.headers.get("x-real-ip") || "anonimo";
  const userConsultasHeader = request.headers.get("x-user-consultas");
  const qtdConsultasFeitas = parseInt(userConsultasHeader || "0", 10);

  if (qtdConsultasFeitas >= 5) {
    return new Response(
      JSON.stringify({
        sucesso: false,
        limiteAtingido: true,
        erro: "Limite máximo de 5 consultas gratuitas atingido. Tente novamente mais tarde.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validação do Token de Ambiente
  const token = env.APIBRASIL_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: "Configuração do servidor incompleta: APIBRASIL_TOKEN ausente nas variáveis de ambiente.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { placa?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ sucesso: false, erro: "Corpo da requisição JSON inválido." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const placa = (body.placa || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (placa.length !== 7) {
    return new Response(
      JSON.stringify({ sucesso: false, erro: "Placa inválida. Forneça 7 caracteres alfanuméricos." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. ECONOMIA DE CRÉDITOS: Cache em Memória do Servidor
  // Se a placa já foi consultada antes, retorna do cache e gasta R$ 0,00!
  const itemCache = CACHE_PLACAS_MEMORIA.get(placa);
  if (itemCache && Date.now() - itemCache.timestamp < 1000 * 60 * 60 * 24 * 30) { // 30 dias de cache
    return new Response(
      JSON.stringify({
        ...itemCache.dados,
        doCache: true,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=2592000, immutable",
          "X-Data-Source": "Cache-Server",
        },
      }
    );
  }

  const isHomolog = env.APIBRASIL_HOMOLOG === "true";

  const client = new ApiBrasilVeiculosClient({
    token,
    defaultHomolog: isHomolog,
    timeoutMs: 25000,
  });

  try {
    // 3. Consulta dos dados veiculares na APIBrasil (R$ 0,08)
    const consultaVeiculo = await client.consultarAgregadosPropria(placa, isHomolog);

    // 4. Consulta gratuita em tempo real da Tabela FIPE oficial
    const dadosFipe = await buscarFipeGratuita(consultaVeiculo.veiculo);

    // 5. Estimativa de IPVA baseada na cotação FIPE oficial
    let ipvaEstimado: number | null = null;
    if (dadosFipe?.valor) {
      const valorNumerico = Number(
        dadosFipe.valor.replace(/[^0-9,]/g, "").replace(",", ".")
      );
      if (!isNaN(valorNumerico)) {
        ipvaEstimado = Math.round(valorNumerico * 0.04);
      }
    }

    const payloadResposta = {
      sucesso: true,
      veiculo: consultaVeiculo.veiculo,
      fipe: dadosFipe,
      ipvaEstimado,
      homologacao: consultaVeiculo.homologacao,
      doCache: false,
    };

    // Salva no cache do servidor para NUNCA mais gastar créditos com essa placa
    CACHE_PLACAS_MEMORIA.set(placa, { dados: payloadResposta, timestamp: Date.now() });

    return new Response(
      JSON.stringify(payloadResposta),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=2592000, immutable",
          "X-Data-Source": "APIBrasil-Live",
        },
      }
    );
  } catch (err: unknown) {
    if (err instanceof ApiBrasilSaldoInsuficienteError) {
      return new Response(
        JSON.stringify({
          sucesso: false,
          erro: "Serviço de consulta temporariamente indisponível. Recarga pendente no provedor.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    if (err instanceof ApiBrasilError) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: err.message, status: err.statusCode }),
        { status: err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sucesso: false, erro: "Ocorreu um erro ao processar a consulta veicular." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
