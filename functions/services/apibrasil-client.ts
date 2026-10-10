/**
 * Cliente de Integração com APIBrasil - Endpoint: Agregados Própria
 * Ambiente: Cloudflare Pages / Workers / Node.js (Fetch API & Web Standards)
 */

export interface AgregadosPropriaRequest {
  tipo: "agregados-propria";
  placa: string;
  homolog: boolean;
}

export interface MarcaDetalhes {
  nome: string;
  fipeId?: string;
}

export interface ModeloDetalhes {
  nome: string;
  sintetico?: string;
}

export interface VeiculoData {
  placa: string;
  placaMercosul: string;
  chassi: string;
  fabricante: string;
  marca: string;
  marcaDetalhes?: MarcaDetalhes;
  modelo: string;
  modeloDetalhes?: ModeloDetalhes;
  versao?: string;
  ano_fabricacao: number;
  ano_modelo: number;
  motor_descricao?: string;
  transmissao_descricao?: string;
  combustivel?: string;
  tipo_veiculo?: string;
  especie?: string;
  cor?: string;
  numero_carroceria?: string;
  tipo_carroceria?: string;
  nacionalidade?: string;
  numero_motor?: string;
  potencia?: number;
  carga?: number;
  numero_caixa_cambio?: string;
  numero_eixo_traseiro?: string;
  numero_terceiro_eixo?: string;
  quantidade_eixo?: number;
  quantidade_portas?: number;
  cilindradas?: number;
  capacidade_max_tracao?: number;
  peso_bruto_total?: number;
  quantidade_lugares?: number;
  tipo_montagem?: number;
  uf_jurisdicao: string;
  cidade: string;
  pais_fabricacao?: string;
  documento_faturado?: string;
  tipo_faturado?: string;
  uf_faturado?: string;
}

export interface UserDetails {
  first_name: string;
  email: string;
  cellphone: string;
  notification: string;
}

export interface ExtraChargeItem {
  name: string;
  price: string | number;
}

export interface ExtraCharges {
  total: string | number;
  items?: ExtraChargeItem[];
}

export interface RawAgregadosResponse {
  user?: UserDetails;
  balance?: string | number;
  balance_before?: string | number;
  tax?: string | number;
  extra_charges?: ExtraCharges;
  status_code?: number;
  error: boolean;
  message: string;
  valor_consulta?: number;
  api_limit_for?: string;
  homolog?: boolean;
  data?: VeiculoData;
}

export interface AgregadosPropriaResult {
  veiculo: VeiculoData;
  saldoRestante: number;
  custoConsulta: number;
  custoTotalComExtras: number;
  homologacao: boolean;
  mensagem: string;
}

// ---------------------------------------------------------------------------
// CLASSES DE ERRO CUSTOMIZADAS
// ---------------------------------------------------------------------------

export class ApiBrasilError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly isTerminal: boolean = false,
    public readonly rawResponse?: unknown
  ) {
    super(message);
    this.name = "ApiBrasilError";
  }
}

export class ApiBrasilSaldoInsuficienteError extends ApiBrasilError {
  constructor(message = "Saldo insuficiente na APIBrasil (HTTP 402). Recarga necessária.") {
    super(message, 402, true);
    this.name = "ApiBrasilSaldoInsuficienteError";
  }
}

// ---------------------------------------------------------------------------
// UTILITÁRIO: CONVERSOR DE MOEDA / NUMÉRICO RESILIENTE (PT-BR e EN)
// ---------------------------------------------------------------------------

export function parseBrCurrencyToNumber(value: string | number | undefined | null): number {
  if (value === undefined || value === null) return 0;
  if (typeof value === "number") return isNaN(value) ? 0 : value;

  const raw = value.trim();
  if (!raw) return 0;

  // Se contiver vírgula: trata como formato brasileiro ("154,380" ou "497,84")
  if (raw.includes(",")) {
    const sanitized = raw.replace(/\./g, "").replace(",", ".");
    const parsed = Number(sanitized);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Se for notação pura com ponto ("0.19" ou "154.380")
  const parsed = Number(raw);
  return isNaN(parsed) ? 0 : parsed;
}

// ---------------------------------------------------------------------------
// CLIENTE PRINCIPAL
// ---------------------------------------------------------------------------

export interface ApiBrasilClientConfig {
  token: string;
  baseUrl?: string;
  defaultHomolog?: boolean;
  timeoutMs?: number;
  maxRetries?: number;
}

export class ApiBrasilVeiculosClient {
  private readonly token: string;
  private readonly baseUrl: string;
  private readonly defaultHomolog: boolean;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;

  constructor(config: ApiBrasilClientConfig) {
    if (!config.token || config.token.trim() === "") {
      throw new Error("Token da APIBrasil não configurado. Verifique a variável de ambiente.");
    }
    this.token = config.token.trim();
    this.baseUrl = (config.baseUrl || "https://gateway.apibrasil.io/api/v2").replace(/\/$/, "");
    this.defaultHomolog = config.defaultHomolog ?? true;
    this.timeoutMs = config.timeoutMs ?? 20000; // 20 segundos de timeout padrão
    this.maxRetries = config.maxRetries ?? 2;   // Máximo de 2 retries (apenas 5xx / timeout)
  }

  /**
   * Consulta dados veiculares pelo endpoint Agregados Própria
   * @param placa Placa no padrão antigo (ABC1234) ou Mercosul (ABC1D23)
   * @param homolog Sobrescreve o modo homologação se informado
   */
  async consultarAgregadosPropria(
    placa: string,
    homolog?: boolean
  ): Promise<AgregadosPropriaResult> {
    const placaLimpa = placa.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!placaLimpa || placaLimpa.length !== 7) {
      throw new ApiBrasilError(`Placa inválida: '${placa}'. Deve conter 7 caracteres alfanuméricos.`, 400, true);
    }

    const payload: AgregadosPropriaRequest = {
      tipo: "agregados-propria",
      placa: placaLimpa,
      homolog: homolog ?? this.defaultHomolog,
    };

    const endpointUrl = `${this.baseUrl}/consulta/veiculos/credits`;

    let attempt = 0;
    let delayMs = 1000;

    while (true) {
      attempt++;
      try {
        return await this.executarChamada(endpointUrl, payload);
      } catch (err: unknown) {
        if (err instanceof ApiBrasilSaldoInsuficienteError) {
          throw err;
        }

        if (err instanceof ApiBrasilError && err.isTerminal) {
          throw err;
        }

        const isNetworkOrTimeout = err instanceof Error && (err.name === "AbortError" || err.message.includes("timeout"));
        const is5xx = err instanceof ApiBrasilError && err.statusCode >= 500 && err.statusCode <= 599;

        // Repete APENAS timeout e 5xx até o teto estipulado. NUNCA 4xx!
        if ((isNetworkOrTimeout || is5xx) && attempt <= this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          delayMs *= 2; // Recuo exponencial
          continue;
        }

        throw err;
      }
    }
  }

  private async executarChamada(
    url: string,
    body: AgregadosPropriaRequest
  ): Promise<AgregadosPropriaResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new ApiBrasilError(`Tempo limite de ${this.timeoutMs}ms esgotado ao contatar APIBrasil.`, 408, false);
      }
      throw new ApiBrasilError(
        `Falha de conexão com gateway APIBrasil: ${fetchError instanceof Error ? fetchError.message : "Desconhecido"}`,
        503,
        false
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // ARMADILHA 4: HTTP 402 Saldo Insuficiente
    if (response.status === 402) {
      throw new ApiBrasilSaldoInsuficienteError();
    }

    // Tratamento de erros HTTP 4xx (Não sofrem retry)
    if (response.status >= 400 && response.status < 500) {
      const errText = await response.text();
      throw new ApiBrasilError(`Erro do cliente (${response.status}): ${errText}`, response.status, true);
    }

    // Tratamento de erros HTTP 5xx (Passíveis de retry)
    if (!response.ok) {
      const errText = await response.text();
      throw new ApiBrasilError(`Erro do servidor APIBrasil (${response.status}): ${errText}`, response.status, false);
    }

    // Leitura do corpo JSON
    let parsed: RawAgregadosResponse;
    try {
      parsed = (await response.json()) as RawAgregadosResponse;
    } catch {
      throw new ApiBrasilError("Resposta recebida da APIBrasil não é um JSON válido.", 502, false);
    }

    // ARMADILHA 1: HTTP 200 porém com error === true no corpo
    if (parsed.error === true) {
      throw new ApiBrasilError(parsed.message || "Erro retornado pela APIBrasil no corpo da resposta.", 200, true, parsed);
    }

    if (!parsed.data) {
      throw new ApiBrasilError("A requisição foi aceita mas não retornou o objeto 'data' com os dados do veículo.", 200, true, parsed);
    }

    // ARMADILHA 2: Conversão resiliente de string BR para número
    const saldo = parseBrCurrencyToNumber(parsed.balance);
    const custo = parseBrCurrencyToNumber(parsed.tax ?? parsed.valor_consulta);

    // ARMADILHA 5: Soma de extra_charges caso existam
    const custoExtras = parseBrCurrencyToNumber(parsed.extra_charges?.total);
    const custoTotal = custo + custoExtras;

    return {
      veiculo: parsed.data,
      saldoRestante: saldo,
      custoConsulta: custo,
      custoTotalComExtras: custoTotal,
      homologacao: Boolean(parsed.homolog ?? (parsed.api_limit_for === "homolog")),
      mensagem: parsed.message,
    };
  }
}
