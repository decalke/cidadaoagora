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
 * Faz match inteligente e de alta precisão usando fipeId e termos de marca/modelo/versão.
 */
async function buscarFipeGratuita(veiculo: VeiculoData): Promise<FipeResultado | null> {
  try {
    let codigoMarca: string | null = null;

    // 1. Se a APIBrasil já entregou o fipeId da marca (ex: Hyundai fipeId = 26 ou VW = 59)
    if (veiculo.marcaDetalhes?.fipeId) {
      codigoMarca = String(veiculo.marcaDetalhes.fipeId).trim();
    }

    // Caso não tenha fipeId numérico direto, busca pelo nome da marca
    if (!codigoMarca || isNaN(Number(codigoMarca))) {
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
      if (marcaEncontrada) {
        codigoMarca = marcaEncontrada.codigo;
      }
    }

    if (!codigoMarca) return null;

    // 2. Listar modelos da montadora
    const modelosRes = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos`, {
      headers: { "User-Agent": "CidadaoAgora-Fipe/1.0" },
    });
    if (!modelosRes.ok) return null;
    const modelosData: { modelos: Array<{ codigo: number; nome: string }> } = await modelosRes.json();

    // Palavras-chave para correspondência inteligente
    const modeloStr = normalizarTexto(veiculo.modelo || "");
    const versaoStr = normalizarTexto(veiculo.versao || "");
    const textoCompleto = `${modeloStr} ${versaoStr}`;

    // Extrai palavras com mais de 2 letras descartando ruídos como (NACIONAL), / etc.
    const palavrasChave = textoCompleto
      .replace(/[()\/\\-]/g, " ")
      .split(/\s+/)
      .map(p => p.trim())
      .filter(p => p.length >= 3 && !["NACIONAL", "IMPORTADO", "FLEX", "GASOLINA", "ALCOOL"].includes(p));

    let melhorModelo: { codigo: number; nome: string } | null = null;
    let maiorPontuacao = -1;

    for (const mod of modelosData.modelos) {
      const nomeMod = normalizarTexto(mod.nome);
      let pontuacao = 0;

      // Se contém o nome principal do modelo (ex: "HB20" ou "GOL" ou "TORO")
      if (modeloStr && nomeMod.includes(modeloStr)) {
        pontuacao += 10;
      }

      for (const palavra of palavrasChave) {
        // Verifica se a palavra está contida inteira ou como prefixo (ex: PLATINU -> PLATINUM)
        if (nomeMod.includes(palavra) || (palavra.length >= 5 && nomeMod.includes(palavra.slice(0, 5)))) {
          pontuacao += 5;
        }
      }

      if (pontuacao > maiorPontuacao) {
        maiorPontuacao = pontuacao;
        melhorModelo = mod;
      }
    }

    if (!melhorModelo || maiorPontuacao <= 0) {
      melhorModelo = modelosData.modelos.find(m => normalizarTexto(m.nome).includes(modeloStr)) || null;
    }

    if (!melhorModelo) return null;

    // 3. Listar anos disponíveis do modelo
    const anosRes = await fetch(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos/${melhorModelo.codigo}/anos`,
      { headers: { "User-Agent": "CidadaoAgora-Fipe/1.0" } }
    );
    if (!anosRes.ok) return null;
    const anos: Array<{ codigo: string; nome: string }> = await anosRes.json();

    const anoDesejado = String(veiculo.ano_modelo || veiculo.ano_fabricacao || "");
    let anoEncontrado = anos.find(a => a.codigo.startsWith(anoDesejado));

    if (!anoEncontrado && veiculo.ano_fabricacao) {
      anoEncontrado = anos.find(a => a.codigo.startsWith(String(veiculo.ano_fabricacao)));
    }

    if (!anoEncontrado) {
      anoEncontrado = anos[0]; // fallback para ano mais próximo
    }

    if (!anoEncontrado) return null;

    // 4. Obter valor FIPE consolidado
    const fipeRes = await fetch(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${codigoMarca}/modelos/${melhorModelo.codigo}/anos/${anoEncontrado.codigo}`,
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
  } catch (err) {
    console.error("Erro na busca gratuita FIPE:", err);
    return null;
  }
}

// CORS restrito ao domínio próprio — nunca aberto para qualquer origem
const ALLOWED_ORIGINS = new Set([
  "https://cidadaoagora.com.br",
  "https://www.cidadaoagora.com.br",
]);

function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.has(origin)
    ? origin
    : "https://cidadaoagora.com.br";
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-user-consultas",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

// Rate limiting por IP real (CF-Connecting-IP) — não pode ser burlado pelo cliente
const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;       // máximo de 10 consultas por IP
const RATE_LIMIT_WINDOW = 3600 * 1000; // janela de 1 hora em ms

function verificarRateLimitIP(ip: string): boolean {
  const agora = Date.now();
  const entrada = RATE_LIMIT_MAP.get(ip);

  if (!entrada || agora > entrada.resetAt) {
    RATE_LIMIT_MAP.set(ip, { count: 1, resetAt: agora + RATE_LIMIT_WINDOW });
    return true; // permitido
  }

  if (entrada.count >= RATE_LIMIT_MAX) {
    return false; // bloqueado
  }

  entrada.count++;
  return true; // permitido
}

export async function onRequestOptions(context: { request: Request }): Promise<Response> {
  return new Response(null, { status: 204, headers: getCorsHeaders(context.request) });
}

function responderComCors(dados: any, request: Request, status = 200, headersExtras: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(dados), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...getCorsHeaders(request),
      ...headersExtras,
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 1. Rate limiting por IP real (CF-Connecting-IP) — não pode ser burlado pelo cliente
  const clientIP = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!verificarRateLimitIP(clientIP)) {
    return responderComCors({
      sucesso: false,
      limiteAtingido: true,
      erro: "Limite de consultas atingido. Tente novamente em 1 hora.",
    }, request, 429);
  }

  // Validação do Token de Ambiente
  const token = env.APIBRASIL_TOKEN;
  if (!token) {
    return responderComCors({
      sucesso: false,
      erro: "Configuração do servidor incompleta: APIBRASIL_TOKEN ausente nas variáveis de ambiente.",
    }, request, 500);
  }

  let body: { placa?: string };
  try {
    body = await request.json();
  } catch {
    return responderComCors({ sucesso: false, erro: "Corpo da requisição JSON inválido." }, request, 400);
  }

  const placa = (body.placa || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (placa.length !== 7) {
    return responderComCors({ sucesso: false, erro: "Placa inválida. Forneça 7 caracteres alfanuméricos." }, request, 400);
  }

  // 2. ECONOMIA DE CRÉDITOS: Cache em Memória do Servidor
  const itemCache = CACHE_PLACAS_MEMORIA.get(placa);
  if (itemCache && Date.now() - itemCache.timestamp < 1000 * 60 * 60 * 24 * 30) {
    return responderComCors(
      {
        ...itemCache.dados,
        doCache: true,
      },
      request,
      200,
      {
        "Cache-Control": "public, max-age=2592000, immutable",
        "X-Data-Source": "Cache-Server",
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

    return responderComCors(payloadResposta, request, 200, {
      "Cache-Control": "public, max-age=2592000, immutable",
      "X-Data-Source": "APIBrasil-Live",
    });
  } catch (err: unknown) {
    if (err instanceof ApiBrasilSaldoInsuficienteError) {
      return responderComCors({
        sucesso: false,
        erro: "Serviço de consulta temporariamente indisponível. Recarga pendente no provedor.",
      }, request, 503);
    }

    if (err instanceof ApiBrasilError) {
      const statusCode = err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
      return responderComCors({ sucesso: false, erro: err.message, status: err.statusCode }, request, statusCode);
    }

    return responderComCors({ sucesso: false, erro: "Ocorreu um erro ao processar a consulta veicular." }, request, 500);
  }
}
