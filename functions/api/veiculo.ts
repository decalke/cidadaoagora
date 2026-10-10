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

/**
 * Consulta a FIPE gratuitamente via API pública aberta (Parallelum / Fipe API)
 * Cruzando os dados de marca, modelo e ano obtidos da APIBrasil.
 */
async function buscarFipeGratuita(veiculo: VeiculoData): Promise<FipeResultado | null> {
  try {
    // 1. Listar marcas de carros
    const marcasRes = await fetch("https://parallelum.com.br/fipe/api/v1/carros/marcas", {
      headers: { "User-Agent": "CidadaoAgora-FipeBot/1.0" },
    });
    if (!marcasRes.ok) return null;
    const marcas: Array<{ codigo: string; nome: string }> = await marcasRes.json();

    const marcaVeiculo = (veiculo.marca || veiculo.fabricante || "").toUpperCase();
    const marcaEncontrada = marcas.find((m) =>
      m.nome.toUpperCase().includes(marcaVeiculo) || marcaVeiculo.includes(m.nome.toUpperCase())
    );

    if (!marcaEncontrada) return null;

    // 2. Listar modelos da marca
    const modelosRes = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaEncontrada.codigo}/modelos`, {
      headers: { "User-Agent": "CidadaoAgora-FipeBot/1.0" },
    });
    if (!modelosRes.ok) return null;
    const modelosData: { modelos: Array<{ codigo: number; nome: string }> } = await modelosRes.json();

    const nomeModelo = (veiculo.modeloDetalhes?.sintetico || veiculo.modelo || "").toUpperCase();
    const modeloEncontrado = modelosData.modelos.find((mod) =>
      mod.nome.toUpperCase().includes(nomeModelo) || nomeModelo.includes(mod.nome.toUpperCase())
    );

    if (!modeloEncontrado) return null;

    // 3. Listar anos disponíveis do modelo
    const anosRes = await fetch(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos`,
      { headers: { "User-Agent": "CidadaoAgora-FipeBot/1.0" } }
    );
    if (!anosRes.ok) return null;
    const anos: Array<{ codigo: string; nome: string }> = await anosRes.json();

    const anoStr = String(veiculo.ano_modelo);
    const anoEncontrado = anos.find((a) => a.codigo.startsWith(anoStr));

    if (!anoEncontrado) return null;

    // 4. Buscar valor FIPE final
    const fipeRes = await fetch(
      `https://parallelum.com.br/fipe/api/v1/carros/marcas/${marcaEncontrada.codigo}/modelos/${modeloEncontrado.codigo}/anos/${anoEncontrado.codigo}`,
      { headers: { "User-Agent": "CidadaoAgora-FipeBot/1.0" } }
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

  const isHomolog = env.APIBRASIL_HOMOLOG === "true";

  const client = new ApiBrasilVeiculosClient({
    token,
    defaultHomolog: isHomolog,
    timeoutMs: 25000,
  });

  try {
    // 1. Consulta dos dados veiculares na APIBrasil (R$ 0,08 ou Grátis em homolog)
    const consultaVeiculo = await client.consultarAgregadosPropria(placa, isHomolog);

    // 2. Consulta gratuita do valor de mercado na FIPE
    const dadosFipe = await buscarFipeGratuita(consultaVeiculo.veiculo);

    // 3. Estimativa de IPVA (média de 3% a 4% sobre a FIPE caso disponível)
    let ipvaEstimado: number | null = null;
    if (dadosFipe?.valor) {
      const valorNumerico = Number(
        dadosFipe.valor.replace(/[^0-9,]/g, "").replace(",", ".")
      );
      if (!isNaN(valorNumerico)) {
        ipvaEstimado = Math.round(valorNumerico * 0.04); // Alíquota estimada SP/RJ/MG: 4%
      }
    }

    return new Response(
      JSON.stringify({
        sucesso: true,
        veiculo: consultaVeiculo.veiculo,
        fipe: dadosFipe,
        ipvaEstimado,
        homologacao: consultaVeiculo.homologacao,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=86400", // Cache por 24h para economizar chamadas
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
