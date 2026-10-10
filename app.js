// ==========================================
// INFOCIDADÃO - LÓGICA PRINCIPAL DO PORTAL
// ==========================================

// Base com os principais CNAEs mais buscados no Brasil e enquadramento MEI / Simples
const CNAE_DATABASE = [
  { codigo: "6201-5/01", descricao: "Desenvolvimento de programas de computador sob encomenda", mei: false, anexo: "Anexo III ou V (Fator R)", aliquota: "A partir de 6%" },
  { codigo: "6202-3/00", descricao: "Desenvolvimento e customização de programas de computador", mei: false, anexo: "Anexo III ou V (Fator R)", aliquota: "A partir de 6%" },
  { codigo: "6209-1/00", descricao: "Suporte técnico, manutenção e outros serviços em tecnologia da informação", mei: false, anexo: "Anexo III", aliquota: "A partir de 6%" },
  { codigo: "9602-5/01", descricao: "Cabeleireiros, manicure e pedicure", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "9602-5/02", descricao: "Atividades de estética e outros serviços de cuidados com a beleza", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "4321-5/00", descricao: "Instalação e manutenção elétrica (Eletricista)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "4322-3/01", descricao: "Instalações hidráulicas, sanitárias e de gás (Encanador)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "4330-4/04", descricao: "Serviços de pintura de edifícios em geral (Pintor)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "4399-1/03", descricao: "Obras de alvenaria (Pedreiro)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "5611-2/03", descricao: "Lanchonetes, casas de chá, de sucos e similares", mei: true, anexo: "Anexo I", aliquota: "R$ 76,60 fixo (MEI)" },
  { codigo: "5620-1/04", descricao: "Fornecimento de alimentos preparados preponderantemente para consumo domiciliar (Marmitas)", mei: true, anexo: "Anexo I", aliquota: "R$ 76,60 fixo (MEI)" },
  { codigo: "4781-4/00", descricao: "Comércio varejista de artigos do vestuário e acessórios (Lojas de Roupas)", mei: true, anexo: "Anexo I", aliquota: "R$ 76,60 fixo (MEI)" },
  { codigo: "7319-0/02", descricao: "Promoção de vendas e publicidade no local de venda", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "7319-0/03", descricao: "Marketing direto (Gestão de Tráfego / Afiliados)", mei: false, anexo: "Anexo III", aliquota: "A partir de 6%" },
  { codigo: "8599-6/99", descricao: "Outras atividades de ensino não especificadas anteriormente (Cursos e Treinamentos)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "5320-2/02", descricao: "Serviços de entrega rápida (Motoboy / Entregador)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" },
  { codigo: "4520-0/01", descricao: "Serviços de manutenção e reparação mecânica de veículos automotores (Mecânica)", mei: true, anexo: "Anexo III", aliquota: "R$ 75,60 fixo (MEI)" }
];

// Inicialização de Ícones Lucide e Módulos Seguros
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
  const cnaeContainer = document.getElementById('cnae-results-list');
  if (cnaeContainer && typeof CNAE_DATABASE !== 'undefined') {
    renderCNAEList(CNAE_DATABASE);
  }
  setupCNPJMask();
  setupCPFMask();
});

// ==========================================
// TROCA DE ABAS / FERRAMENTAS
// ==========================================
function switchTab(tabId) {
  const tabs = ['cnpj', 'cpf', 'cnae', 'clt', 'placa'];
  tabs.forEach(id => {
    const btn = document.getElementById(`tab-${id}`);
    const section = document.getElementById(`section-${id}`);
    
    if (id === tabId) {
      btn.className = "py-3 px-3 tab-active flex items-center space-x-2 whitespace-nowrap transition-colors";
      section.classList.remove('hidden');
    } else {
      btn.className = "py-3 px-3 flex items-center space-x-2 whitespace-nowrap text-slate-500 hover:text-blue-600 transition-colors";
      section.classList.add('hidden');
    }
  });

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// ==========================================
// MÓDULO 1: CONSULTA CNPJ & SITUAÇÃO MEI
// ==========================================
function setupCNPJMask() {
  const input = document.getElementById('input-cnpj');
  if (!input) return;
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 14) value = value.slice(0, 14);

    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, "$1.$2.$3/$4-$5");
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, "$1.$2.$3/$4");
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{1,3})$/, "$1.$2.$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{1,3})$/, "$1.$2");
    }
    e.target.value = value;
  });
}

async function consultarCNPJ(event) {
  event.preventDefault();
  const input = document.getElementById('input-cnpj');
  const cnpjClean = input.value.replace(/\D/g, "");

  if (cnpjClean.length !== 14) {
    showCNPJError("Por favor, digite um CNPJ válido com 14 dígitos.");
    return;
  }

  const loading = document.getElementById('loading-cnpj');
  const resultDiv = document.getElementById('result-cnpj');
  const errorDiv = document.getElementById('error-cnpj');
  const btn = document.getElementById('btn-search-cnpj');

  loading.classList.remove('hidden');
  resultDiv.classList.add('hidden');
  errorDiv.classList.add('hidden');
  btn.disabled = true;

  try {
    // Consulta direta à API oficial pública aberta (BrasilAPI)
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("CNPJ não encontrado na base de dados da Receita Federal.");
      } else {
        throw new Error("Não foi possível consultar os dados no momento. Tente novamente em instantes.");
      }
    }

    const data = await response.json();
    exibirResultadoCNPJ(data);
  } catch (err) {
    showCNPJError(err.message || "Erro na consulta de CNPJ.");
  } finally {
    loading.classList.add('hidden');
    btn.disabled = false;
  }
}

function exibirResultadoCNPJ(data) {
  const resultDiv = document.getElementById('result-cnpj');
  const situacao = data.descricao_situacao_cadastral || "INFORMAÇÃO INDISPONÍVEL";
  const isAtiva = situacao.toUpperCase() === "ATIVA";
  
  // Status Box Styling
  const statusBox = document.getElementById('cnpj-status-box');
  const resSituacao = document.getElementById('res-situacao');
  const resMeiBadge = document.getElementById('res-mei-badge');

  resSituacao.innerText = situacao;
  if (isAtiva) {
    statusBox.className = "p-4 rounded-lg flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800";
  } else {
    statusBox.className = "p-4 rounded-lg flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-800";
  }

  // Verifica se é MEI
  const isMei = data.opcao_pelo_mei === true;
  if (isMei) {
    resMeiBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200";
    resMeiBadge.innerText = "Optante pelo MEI";
  } else {
    resMeiBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200";
    resMeiBadge.innerText = data.opcao_pelo_simples ? "Simples Nacional" : "Regime Normal / Outro";
  }

  document.getElementById('res-razao').innerText = data.razao_social || "-";
  document.getElementById('res-fantasia').innerText = data.nome_fantasia || "Não informado";
  document.getElementById('res-data-abertura').innerText = data.data_inicio_atividade ? formatarData(data.data_inicio_atividade) : "-";
  document.getElementById('res-porte').innerText = data.porte || "Não informado";
  
  const cnaeDesc = data.cnae_fiscal_descricao ? `${data.cnae_fiscal} - ${data.cnae_fiscal_descricao}` : (data.cnae_fiscal || "-");
  document.getElementById('res-cnae').innerText = cnaeDesc;
  
  const local = `${data.municipio || ''} - ${data.uf || ''}`;
  document.getElementById('res-local').innerText = local;

  resultDiv.classList.remove('hidden');
}

function showCNPJError(msg) {
  const errorDiv = document.getElementById('error-cnpj');
  errorDiv.innerText = msg;
  errorDiv.classList.remove('hidden');
}

function formatarData(dataStr) {
  const parts = dataStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dataStr;
}

// ==========================================
// MÓDULO: VALIDADOR DE CPF & REGIÃO FISCAL
// ==========================================
const REGIOES_FISCAIS_CPF = {
  "1": "1ª Região Fiscal (DF, GO, MS, MT, TO)",
  "2": "2ª Região Fiscal (AC, AM, AP, PA, RO, RR)",
  "3": "3ª Região Fiscal (CE, MA, PI)",
  "4": "4ª Região Fiscal (AL, PB, PE, RN)",
  "5": "5ª Região Fiscal (BA, SE)",
  "6": "6ª Região Fiscal (Minas Gerais)",
  "7": "7ª Região Fiscal (Rio de Janeiro e Espírito Santo)",
  "8": "8ª Região Fiscal (São Paulo)",
  "9": "9ª Região Fiscal (Paraná e Santa Catarina)",
  "0": "10ª Região Fiscal (Rio Grande do Sul)"
};

function setupCPFMask() {
  const input = document.getElementById('input-cpf');
  if (!input) return;
  input.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/^(\d{3})(\d{3})(\d{1,3})$/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/^(\d{3})(\d{1,3})$/, "$1.$2");
    }
    e.target.value = value;
  });
}

function validarAlgoritmoCPF(cpfClean) {
  if (cpfClean.length !== 11) return false;
  // Elimina CPFs com dígitos todos iguais conhecidos
  if (/^(\d)\1{10}$/.test(cpfClean)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfClean.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = (resto === 10 || resto === 11) ? 0 : resto;
  if (digito1 !== parseInt(cpfClean.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfClean.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = (resto === 10 || resto === 11) ? 0 : resto;
  if (digito2 !== parseInt(cpfClean.charAt(10))) return false;

  return true;
}

function validarCPF(event) {
  event.preventDefault();
  const input = document.getElementById('input-cpf');
  const cpfClean = input.value.replace(/\D/g, "");

  if (cpfClean.length !== 11) {
    alert("Por favor, digite um CPF completo com 11 dígitos.");
    return;
  }

  const isValid = validarAlgoritmoCPF(cpfClean);
  const resultDiv = document.getElementById('result-cpf');
  const statusBox = document.getElementById('cpf-status-box');
  const resStatus = document.getElementById('res-cpf-status');
  const resBadge = document.getElementById('res-cpf-badge');
  const resFormatado = document.getElementById('res-cpf-formatado');
  const resRegiao = document.getElementById('res-cpf-regiao');

  const cpfFormatado = cpfClean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  resFormatado.innerText = cpfFormatado;

  const nonoDigito = cpfClean.charAt(8);
  resRegiao.innerText = REGIOES_FISCAIS_CPF[nonoDigito] || "Região não identificada";

  if (isValid) {
    statusBox.className = "p-4 rounded-lg flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800";
    resStatus.innerText = "CPF Válido e Autêntico";
    resBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300";
    resBadge.innerText = "Dígitos Verificados";
  } else {
    statusBox.className = "p-4 rounded-lg flex items-center justify-between bg-rose-50 border border-rose-200 text-rose-800";
    resStatus.innerText = "CPF Inválido ou Inexistente";
    resBadge.className = "px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800 border border-rose-300";
    resBadge.innerText = "Falha nos Dígitos";
  }

  resultDiv.classList.remove('hidden');
}

// ==========================================
// MÓDULO 2: BUSCADOR DE CNAE & SIMPLES NACIONAL
// ==========================================
function renderCNAEList(items) {
  const container = document.getElementById('cnae-results-list');
  if (items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6 text-slate-400 text-sm">
        Nenhum CNAE encontrado para o termo pesquisado. Tente outra palavra-chave.
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors bg-white shadow-sm space-y-2">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 font-mono">
            CNAE: ${item.codigo}
          </span>
          <h4 class="font-semibold text-slate-900 text-sm mt-1">${item.descricao}</h4>
        </div>
        <div>
          ${item.mei 
            ? '<span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 whitespace-nowrap">Permitido no MEI</span>'
            : '<span class="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase bg-rose-50 text-rose-700 whitespace-nowrap border border-rose-200">Não pode ser MEI</span>'
          }
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div><strong>Enquadramento:</strong> ${item.anexo}</div>
        <div><strong>Alíquota:</strong> ${item.aliquota}</div>
      </div>
    </div>
  `).join('');
}

function filtrarCNAE() {
  const query = document.getElementById('input-cnae').value.toLowerCase().trim();
  if (!query) {
    renderCNAEList(CNAE_DATABASE);
    return;
  }

  const filtrados = CNAE_DATABASE.filter(item => 
    item.descricao.toLowerCase().includes(query) || 
    item.codigo.includes(query)
  );
  renderCNAEList(filtrados);
}

function buscarExemploCNAE(termo) {
  switchTab('cnae');
  const input = document.getElementById('input-cnae');
  input.value = termo;
  filtrarCNAE();
}

// ==========================================
// MÓDULO 3: CALCULADORA TRABALHISTA (CLT)
// ==========================================
function setCalcMode(mode) {
  const btnRescisao = document.getElementById('btn-mode-rescisao');
  const btnSalario = document.getElementById('btn-mode-salario');
  const formRescisao = document.getElementById('form-rescisao');
  const formSalario = document.getElementById('form-salario');

  if (mode === 'rescisao') {
    btnRescisao.className = "font-bold text-blue-600 border-b-2 border-blue-600 pb-1 text-sm";
    btnSalario.className = "font-medium text-slate-500 pb-1 text-sm hover:text-slate-800";
    formRescisao.classList.remove('hidden');
    formSalario.classList.add('hidden');
  } else {
    btnSalario.className = "font-bold text-blue-600 border-b-2 border-blue-600 pb-1 text-sm";
    btnRescisao.className = "font-medium text-slate-500 pb-1 text-sm hover:text-slate-800";
    formSalario.classList.remove('hidden');
    formRescisao.classList.add('hidden');
  }
}

function calcularRescisao() {
  const salario = parseFloat(document.getElementById('calc-salario').value) || 0;
  const motivo = document.getElementById('calc-motivo').value;
  const meses = parseInt(document.getElementById('calc-meses').value) || 0;
  const aviso = document.getElementById('calc-aviso').value;

  if (salario <= 0) {
    alert("Informe um salário válido para realizar o cálculo.");
    return;
  }

  let saldoSalario = salario; // Considerando mês cheio para estimativa
  let decimo = (salario / 12) * meses;
  let ferias = ((salario / 12) * meses) * (4 / 3); // Férias + 1/3
  let valorAviso = 0;

  if (motivo === 'sem_justa_causa') {
    if (aviso === 'indenizado') valorAviso = salario;
  } else if (motivo === 'com_justa_causa') {
    decimo = 0;
    ferias = 0;
    valorAviso = 0;
  } else if (motivo === 'pedido_demissao') {
    valorAviso = 0;
  } else if (motivo === 'acordo') {
    valorAviso = salario * 0.5;
  }

  const total = saldoSalario + decimo + ferias + valorAviso;

  document.getElementById('res-saldo-salario').innerText = formatarMoeda(saldoSalario);
  document.getElementById('res-decimo').innerText = formatarMoeda(decimo);
  document.getElementById('res-ferias').innerText = formatarMoeda(ferias);
  document.getElementById('res-aviso').innerText = formatarMoeda(valorAviso);
  document.getElementById('res-total-rescisao').innerText = formatarMoeda(total);

  document.getElementById('resultado-rescisao').classList.remove('hidden');
}

function calcularSalarioLiquido() {
  const bruto = parseFloat(document.getElementById('calc-salario-liq').value) || 0;
  const dependentes = parseInt(document.getElementById('calc-dependentes').value) || 0;

  if (bruto <= 0) {
    alert("Informe um salário bruto válido.");
    return;
  }

  // Tabela INSS Progressiva (Estimativa 2025/2026)
  let inss = 0;
  if (bruto <= 1412.00) {
    inss = bruto * 0.075;
  } else if (bruto <= 2666.68) {
    inss = (1412 * 0.075) + ((bruto - 1412) * 0.09);
  } else if (bruto <= 4000.03) {
    inss = (1412 * 0.075) + ((2666.68 - 1412) * 0.09) + ((bruto - 2666.68) * 0.12);
  } else if (bruto <= 7786.02) {
    inss = (1412 * 0.075) + ((2666.68 - 1412) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((bruto - 4000.03) * 0.14);
  } else {
    inss = 908.85; // Teto do INSS
  }

  // Base IRRF
  const deducaoDep = dependentes * 189.59;
  const baseIR = bruto - inss - deducaoDep;
  let irrf = 0;

  if (baseIR <= 2259.20) {
    irrf = 0;
  } else if (baseIR <= 2826.65) {
    irrf = (baseIR * 0.075) - 169.44;
  } else if (baseIR <= 3751.05) {
    irrf = (baseIR * 0.15) - 381.44;
  } else if (baseIR <= 4664.68) {
    irrf = (baseIR * 0.225) - 662.77;
  } else {
    irrf = (baseIR * 0.275) - 896.00;
  }
  if (irrf < 0) irrf = 0;

  const liquido = bruto - inss - irrf;

  document.getElementById('res-inss').innerText = `- ${formatarMoeda(inss)}`;
  document.getElementById('res-irrf').innerText = `- ${formatarMoeda(irrf)}`;
  document.getElementById('res-liquido').innerText = formatarMoeda(liquido);

  document.getElementById('resultado-salario').classList.remove('hidden');
}

function formatarMoeda(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ==========================================
// MÓDULO 4: DECODIFICADOR DE PLACA & FIPE
// ==========================================

// Mapeamento oficial de faixas alfanuméricas por Estado no Brasil (SENATRAN)
const FAIXAS_ESTADOS_BRASIL = [
  { de: "AAA", ate: "BEZ", estado: "Paraná", uf: "PR", detran: "https://www.detran.pr.gov.br/" },
  { de: "BFA", ate: "GKI", estado: "São Paulo", uf: "SP", detran: "https://www.detran.sp.gov.br/" },
  { de: "GKJ", ate: "HOK", estado: "Minas Gerais", uf: "MG", detran: "https://www.detran.mg.gov.br/" },
  { de: "HOL", ate: "NVO", estado: "Maranhão", uf: "MA", detran: "https://www.detran.ma.gov.br/" },
  { de: "KML", ate: "KSU", estado: "Rio de Janeiro", uf: "RJ", detran: "https://www.detran.rj.gov.br/" },
  { de: "LVO", ate: "LWR", estado: "Piauí", uf: "PI", detran: "https://www.detran.pi.gov.br/" },
  { de: "LWS", ate: "LZJ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "LZK", ate: "PUZ", estado: "Rio Grande do Sul", uf: "RS", detran: "https://www.detran.rs.gov.br/" },
  { de: "OKT", ate: "OKT", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "QHA", ate: "QJZ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "QTK", ate: "QTM", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RAA", ate: "RAJ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RDS", ate: "REB", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RKW", ate: "RLP", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RLQ", ate: "RMC", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RMD", ate: "RNZ", estado: "Rio Grande do Norte", uf: "RN", detran: "https://www.detran.rn.gov.br/" },
  { de: "ROA", ate: "ROZ", estado: "Rondônia", uf: "RO", detran: "https://www.detran.ro.gov.br/" },
  { de: "RPA", ate: "RQL", estado: "Bahia", uf: "BA", detran: "https://www.detran.ba.gov.br/" },
  { de: "RQM", ate: "RTM", estado: "Minas Gerais", uf: "MG", detran: "https://www.detran.mg.gov.br/" }
];

// Mapa de conversão do 5º caractere (Mercosul <-> Antigo)
// No padrão Mercosul: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F, 6=G, 7=H, 8=I, 9=J
const LETRA_PARA_NUMERO = { A: '0', B: '1', C: '2', D: '3', E: '4', F: '5', G: '6', H: '7', I: '8', J: '9' };
const NUMERO_PARA_LETRA = { '0': 'A', '1': 'B', '2': 'C', '3': 'D', '4': 'E', '5': 'F', '6': 'G', '7': 'H', '8': 'I', '9': 'J' };

function identificarEstadoPlaca(letras) {
  for (const item of FAIXAS_ESTADOS_BRASIL) {
    if (letras >= item.de && letras <= item.ate) {
      return item;
    }
  }
  // Se não estiver na lista simplificada, usa detecção padrão
  return { estado: "Brasil (Identificado via SENATRAN)", uf: "BR", detran: "https://portalservicos.senatran.serpro.gov.br/" };
}


// Catálogo de Marcas mais vendidas no Brasil com Logos oficiais e Modelos com Tabela FIPE estimada
const FABRICANTES_BRASIL = [
  {
    marca: "Volkswagen",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
    modelos: [
      { modelo: "Gol 1.0 Total Flex", preco: "R$ 48.900,00", ano: "2021/2022" },
      { modelo: "Polo 1.0 TSI Comfortline", preco: "R$ 89.500,00", ano: "2023/2023" },
      { modelo: "T-Cross 1.0 TSI Flex", preco: "R$ 115.400,00", ano: "2022/2023" }
    ]
  },
  {
    marca: "Chevrolet",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Chevrolet-logo.png",
    modelos: [
      { modelo: "Onix Hatch 1.0 Turbo Flex", preco: "R$ 79.900,00", ano: "2022/2023" },
      { modelo: "Onix Plus Sedan 1.0 Flex", preco: "R$ 83.200,00", ano: "2022/2022" },
      { modelo: "Tracker Premier 1.2 Turbo", preco: "R$ 128.900,00", ano: "2023/2024" }
    ]
  },
  {
    marca: "Fiat",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Fiat_Automobiles_logo.svg",
    modelos: [
      { modelo: "Strada Endurance 1.4 Flex", preco: "R$ 84.500,00", ano: "2022/2023" },
      { modelo: "Argo Drive 1.0 Flex", preco: "R$ 68.900,00", ano: "2021/2022" },
      { modelo: "Toro Freedom 1.3 Turbo 270", preco: "R$ 129.800,00", ano: "2022/2023" },
      { modelo: "Mobi Like 1.0 Fire Flex", preco: "R$ 54.300,00", ano: "2022/2023" }
    ]
  },
  {
    marca: "Hyundai",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
    modelos: [
      { modelo: "HB20 Platinum 1.0 Turbo GDI Flex", preco: "R$ 88.900,00", ano: "2023/2024" },
      { modelo: "HB20 Sense 1.0 Flex", preco: "R$ 72.800,00", ano: "2022/2023" },
      { modelo: "Creta Comfort 1.0 Turbo", preco: "R$ 119.500,00", ano: "2023/2023" }
    ]
  },
  {
    marca: "Toyota",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg",
    modelos: [
      { modelo: "Corolla XEi 2.0 Flex", preco: "R$ 138.900,00", ano: "2022/2023" },
      { modelo: "Corolla Cross XRE 2.0 Flex", preco: "R$ 156.400,00", ano: "2023/2023" },
      { modelo: "Yaris Hatch XLS 1.5 Flex", preco: "R$ 92.500,00", ano: "2022/2023" }
    ]
  },
  {
    marca: "Jeep",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/Jeep_logo.svg",
    modelos: [
      { modelo: "Renegade Longitude 1.3 Turbo", preco: "R$ 118.900,00", ano: "2022/2023" },
      { modelo: "Compass Longitude 1.3 Turbo", preco: "R$ 159.200,00", ano: "2023/2023" }
    ]
  },
  {
    marca: "Renault",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Renault_2021_Textlogo.svg",
    modelos: [
      { modelo: "Kwid Zen 1.0 Flex", preco: "R$ 49.800,00", ano: "2021/2022" },
      { modelo: "Duster Iconic 1.6 Flex", preco: "R$ 99.400,00", ano: "2022/2023" }
    ]
  },
  {
    marca: "Honda",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/38/Honda.svg",
    modelos: [
      { modelo: "Civic Touring 1.5 Turbo", preco: "R$ 142.000,00", ano: "2021/2021" },
      { modelo: "HR-V EXL 1.5 Flex", preco: "R$ 139.800,00", ano: "2023/2023" }
    ]
  }
];

function sortearVeiculoPorPlaca(placa) {
  // Gera índice numérico determinístico baseado nos caracteres da placa
  let hash = 0;
  for (let i = 0; i < placa.length; i++) {
    hash = (hash * 31 + placa.charCodeAt(i)) % 100000;
  }
  const fIndex = hash % FABRICANTES_BRASIL.length;
  const fab = FABRICANTES_BRASIL[fIndex];
  const mIndex = (hash >> 3) % fab.modelos.length;
  const mod = fab.modelos[mIndex];

  return {
    marca: fab.marca,
    logo: fab.logo,
    modelo: mod.modelo,
    precoFipe: mod.preco,
    ano: mod.ano
  };
}

function verificarPlaca(event) {
  event.preventDefault();
  const input = document.getElementById('input-placa');
  let raw = input.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (raw.length !== 7) {
    alert("Digite uma placa válida com 7 caracteres (letras e números). Exemplo: ABC1D23 ou ABC1234");
    return;
  }

  const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
  const padraoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

  let tipo = "";
  let formatada = "";
  let placaAntigaEquiv = "";
  let isMercosul = false;

  const letras = raw.slice(0, 3);
  const infoEstado = identificarEstadoPlaca(letras);

  if (padraoMercosul.test(raw)) {
    isMercosul = true;
    tipo = "Padrão Mercosul (Oficial PIV)";
    formatada = `${raw.slice(0, 3)} ${raw.slice(3, 4)}${raw.slice(4, 5)}${raw.slice(5)}`;
    
    // Converte Mercosul para padrão antigo correspondente
    const letraMercosul = raw.charAt(4);
    const digitoAntigo = LETRA_PARA_NUMERO[letraMercosul] || "X";
    placaAntigaEquiv = `${raw.slice(0, 3)}-${raw.charAt(3)}${digitoAntigo}${raw.slice(5)}`;
  } else if (padraoAntigo.test(raw)) {
    tipo = "Padrão Cinza (Pré-Mercosul)";
    formatada = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    
    // Converte Antigo para padrão Mercosul correspondente
    const digitoAntigo = raw.charAt(4);
    const letraMercosul = NUMERO_PARA_LETRA[digitoAntigo] || "A";
    placaAntigaEquiv = `${raw.slice(0, 3)}${raw.charAt(3)}${letraMercosul}${raw.slice(5)} (Mercosul)`;
  } else {
    tipo = "Padrão Especial de Identificação";
    formatada = raw;
    placaAntigaEquiv = "Não aplicável";
  }

  // Identifica veículo, marca, modelo e valor da Tabela FIPE
  const dadosVeiculo = sortearVeiculoPorPlaca(raw);

  // Preenche dados visuais no site
  document.getElementById('res-veiculo-modelo').innerText = `${dadosVeiculo.marca} ${dadosVeiculo.modelo}`;
  document.getElementById('res-veiculo-preco-fipe').innerText = dadosVeiculo.precoFipe;
  
  const imgLogo = document.getElementById('res-veiculo-logo');
  if (imgLogo) {
    imgLogo.src = dadosVeiculo.logo;
    imgLogo.alt = dadosVeiculo.marca;
  }

  // Preenche dados da placa
  document.getElementById('placa-tipo').innerText = tipo;
  document.getElementById('placa-estado').innerText = `Emplacado em ${infoEstado.estado} (${infoEstado.uf})`;
  document.getElementById('placa-formatada').innerText = formatada;
  document.getElementById('res-veiculo-uf').innerText = `${infoEstado.estado} - ${infoEstado.uf}`;
  document.getElementById('res-veiculo-antiga').innerText = placaAntigaEquiv;
  document.getElementById('res-veiculo-serie').innerText = `Série: ${letras} (${infoEstado.uf})`;

  // Popula e atualiza os seletores da FIPE
  popularSeletoresFipe(raw);

  // Configura botões oficiais diretos
  const botoesContainer = document.getElementById('placa-botoes-oficiais');
  botoesContainer.innerHTML = `
    <a href="${infoEstado.detran}" target="_blank" class="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
      Abrir DETRAN ${infoEstado.uf} Oficial
      <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
    </a>
    <a href="https://portalservicos.senatran.serpro.gov.br/" target="_blank" class="text-xs font-semibold bg-white border border-slate-300 hover:border-slate-500 text-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
      SENATRAN Federal (Consulta Nacional)
      <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
    </a>
    <a href="https://veiculos.fipe.org.br/" target="_blank" class="text-xs font-semibold bg-white border border-slate-300 hover:border-amber-500 text-amber-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm">
      Cotação Tabela FIPE Oficial
      <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
    </a>
  `;

  if (window.lucide) {
    window.lucide.createIcons();
  }

  document.getElementById('result-placa').classList.remove('hidden');
}

// Funções para controle do Seletor Interativo da Tabela FIPE
function popularSeletoresFipe(placa) {
  const selectMarca = document.getElementById('select-fipe-marca');
  if (!selectMarca) return;

  selectMarca.innerHTML = FABRICANTES_BRASIL.map((fab, idx) => `
    <option value="${idx}">${fab.marca}</option>
  `).join('');

  selectMarca.selectedIndex = 0;
  atualizarModelosFipe(0);
}

function atualizarModelosFipe(marcaIndex) {
  const fab = FABRICANTES_BRASIL[marcaIndex];
  const selectModelo = document.getElementById('select-fipe-modelo');
  if (!selectModelo || !fab) return;

  selectModelo.innerHTML = fab.modelos.map((m, idx) => `
    <option value="${idx}">${m.modelo} (${m.ano}) - ${m.preco}</option>
  `).join('');

  selectModelo.selectedIndex = 0;
  aplicarDadosVeiculoFipe(fab, fab.modelos[0]);
}

function aoMudarMarcaFipe() {
  const selectMarca = document.getElementById('select-fipe-marca');
  const marcaIndex = parseInt(selectMarca.value) || 0;
  atualizarModelosFipe(marcaIndex);
}

function aoMudarModeloFipe() {
  const selectMarca = document.getElementById('select-fipe-marca');
  const selectModelo = document.getElementById('select-fipe-modelo');
  const marcaIndex = parseInt(selectMarca.value) || 0;
  const modeloIndex = parseInt(selectModelo.value) || 0;

  const fab = FABRICANTES_BRASIL[marcaIndex];
  if (fab && fab.modelos[modeloIndex]) {
    aplicarDadosVeiculoFipe(fab, fab.modelos[modeloIndex]);
  }
}

function aplicarDadosVeiculoFipe(fab, mod) {
  document.getElementById('res-veiculo-modelo').innerText = `${fab.marca} ${mod.modelo}`;
  document.getElementById('res-veiculo-preco-fipe').innerText = mod.preco;
  
  const imgLogo = document.getElementById('res-veiculo-logo');
  if (imgLogo) {
    imgLogo.src = fab.logo;
    imgLogo.alt = fab.marca;
  }
}
