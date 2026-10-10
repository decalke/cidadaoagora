// ==========================================
// INFOCIDADÃO - LÓGICA PRINCIPAL DO PORTAL
// ==========================================

// Base Oficial de CNAEs com Fallback Inteligente
function getCNAEDatabase() {
  if (typeof window !== 'undefined' && window.CNAE_DATABASE && window.CNAE_DATABASE.length > 50) {
    return window.CNAE_DATABASE;
  }
  return CNAE_FALLBACK;
}

const CNAE_FALLBACK = [
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
  if (cnaeContainer) {
    renderCNAEList(getCNAEDatabase());
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
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-300">
        <i data-lucide="search-x" class="w-8 h-8 mx-auto text-slate-300 mb-2"></i>
        Nenhum CNAE encontrado para o termo ou código pesquisado.
        <p class="text-xs text-slate-400 mt-1">Tente pesquisar por palavras parciais (ex: pet, animal, roupa, frete) ou dígitos do código.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const exibidos = items.slice(0, 50);
  const totalTexto = items.length > 50 
    ? `<div class="text-xs text-slate-500 font-medium pb-1 flex items-center justify-between">
         <span>Exibindo os primeiros <strong>50</strong> de <strong>${items.length}</strong> resultados encontrados:</span>
         <span class="text-[11px] text-sky-600 font-semibold">Refine a busca para filtrar</span>
       </div>`
    : `<div class="text-xs text-slate-500 font-medium pb-1">
         <strong>${items.length}</strong> atividade(s) encontrada(s):
       </div>`;

  container.innerHTML = totalTexto + exibidos.map(item => `
    <div class="p-4 rounded-xl border border-slate-200 hover:border-sky-400 transition-colors bg-white shadow-sm space-y-2">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-800 font-mono">
            CNAE: ${item.codigo}
          </span>
          <h4 class="font-semibold text-slate-900 text-sm mt-1">${item.descricao}</h4>
          ${item.sinonimos ? `<span class="text-[11px] text-slate-400 block mt-0.5">Termos relacionados: ${item.sinonimos}</span>` : ''}
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
  if (window.lucide) window.lucide.createIcons();
}

function filtrarCNAE() {
  const inputEl = document.getElementById('input-cnae');
  if (!inputEl) return;
  const db = getCNAEDatabase();
  const rawQuery = inputEl.value.trim();
  if (!rawQuery) {
    renderCNAEList(db.slice(0, 30));
    return;
  }

  // Normalização do texto de busca (sem acentos e minúsculo)
  const normalizar = (str) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const queryNorm = normalizar(rawQuery);
  const apenasNumeros = rawQuery.replace(/\D/g, "");

  const filtrados = db.filter(item => {
    // 1. Busca por código formatado ou apenas dígitos numéricos
    if (apenasNumeros && item.codigo_limpo && item.codigo_limpo.includes(apenasNumeros)) {
      return true;
    }
    if (item.codigo && item.codigo.toLowerCase().includes(queryNorm)) {
      return true;
    }

    // 2. Busca por texto da descrição oficial
    const descNorm = normalizar(item.descricao);
    if (descNorm.includes(queryNorm)) {
      return true;
    }

    // 3. Busca por sinônimos populares (ex: pet shop, ração, barbeiro, pedreiro)
    if (item.sinonimos) {
      const sinNorm = normalizar(item.sinonimos);
      if (sinNorm.includes(queryNorm)) {
        return true;
      }
    }

    // 4. Busca por palavras individuais (todas as palavras devem bater)
    const palavras = queryNorm.split(/\s+/).filter(p => p.length > 2);
    if (palavras.length > 1) {
      const matchTodas = palavras.every(p => descNorm.includes(p) || (item.sinonimos && normalizar(item.sinonimos).includes(p)));
      if (matchTodas) return true;
    }

    return false;
  });

  renderCNAEList(filtrados);
}

// ==========================================
// AUTOCOMPLETAR E SUGESTÕES EM TEMPO REAL
// ==========================================
function aoDigitarCNAE(valor) {
  filtrarCNAE();
  
  const boxSugestoes = document.getElementById('cnae-sugestoes');
  if (!boxSugestoes) return;

  const termo = (valor || "").trim();
  if (termo.length < 2) {
    boxSugestoes.innerHTML = '';
    boxSugestoes.classList.add('hidden');
    return;
  }

  const normalizar = (str) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const termoNorm = normalizar(termo);
  const apenasNum = termo.replace(/\D/g, "");
  const db = getCNAEDatabase();

  // Localiza as top 6 sugestões mais relevantes
  const sugestoes = db.filter(item => {
    if (apenasNum && item.codigo_limpo && item.codigo_limpo.startsWith(apenasNum)) return true;
    const descNorm = normalizar(item.descricao);
    if (descNorm.includes(termoNorm)) return true;
    if (item.sinonimos && normalizar(item.sinonimos).includes(termoNorm)) return true;
    return false;
  }).slice(0, 6);

  if (sugestoes.length === 0) {
    boxSugestoes.innerHTML = '';
    boxSugestoes.classList.add('hidden');
    return;
  }

  boxSugestoes.innerHTML = sugestoes.map(item => `
    <div onclick="selecionarSugestaoCNAE('${item.codigo}')" class="p-3 hover:bg-sky-50 cursor-pointer flex items-center justify-between gap-3 text-left transition-colors">
      <div class="flex items-center gap-2 overflow-hidden">
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 font-mono shrink-0">${item.codigo}</span>
        <span class="text-xs text-slate-800 font-medium truncate">${item.descricao}</span>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${item.mei ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
        ${item.mei ? 'MEI' : 'Não MEI'}
      </span>
    </div>
  `).join('');

  boxSugestoes.classList.remove('hidden');
}

function selecionarSugestaoCNAE(codigo) {
  const inputEl = document.getElementById('input-cnae');
  if (inputEl) {
    inputEl.value = codigo;
    filtrarCNAE();
  }
  fecharSugestoes();
}

function fecharSugestoes() {
  const boxSugestoes = document.getElementById('cnae-sugestoes');
  if (boxSugestoes) {
    boxSugestoes.classList.add('hidden');
  }
}

// Fecha dropdown ao clicar fora
document.addEventListener('click', (e) => {
  const container = document.getElementById('form-cnae');
  if (container && !container.contains(e.target)) {
    fecharSugestoes();
  }
});

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

// Base de contingência caso dados_placas.js não esteja disponível
const FAIXAS_ESTADOS_FALLBACK = [
  { de: "AAA", ate: "BEZ", estado: "Paraná", uf: "PR", detran: "https://www.detran.pr.gov.br/" },
  { de: "BFA", ate: "GKI", estado: "São Paulo", uf: "SP", detran: "https://www.detran.sp.gov.br/" },
  { de: "GKJ", ate: "HOK", estado: "Minas Gerais", uf: "MG", detran: "https://www.detran.mg.gov.br/" },
  { de: "HOL", ate: "HQE", estado: "Maranhão", uf: "MA", detran: "https://www.detran.ma.gov.br/" },
  { de: "HQF", ate: "HTW", estado: "Mato Grosso do Sul", uf: "MS", detran: "https://www.detran.ms.gov.br/" },
  { de: "HTX", ate: "HZA", estado: "Ceará", uf: "CE", detran: "https://www.detran.ce.gov.br/" },
  { de: "HZB", ate: "IAP", estado: "Sergipe", uf: "SE", detran: "https://www.detran.se.gov.br/" },
  { de: "IAQ", ate: "JDO", estado: "Rio Grande do Sul", uf: "RS", detran: "https://www.detran.rs.gov.br/" },
  { de: "JDP", ate: "JKR", estado: "Bahia", uf: "BA", detran: "https://www.detran.ba.gov.br/" },
  { de: "JKS", ate: "JSZ", estado: "Bahia", uf: "BA", detran: "https://www.detran.ba.gov.br/" },
  { de: "JTA", ate: "JWE", estado: "Pará", uf: "PA", detran: "https://www.detran.pa.gov.br/" },
  { de: "JWF", ate: "JXY", estado: "Amazonas", uf: "AM", detran: "https://www.detran.am.gov.br/" },
  { de: "JXZ", ate: "KAU", estado: "Mato Grosso", uf: "MT", detran: "https://www.detran.mt.gov.br/" },
  { de: "KAV", ate: "KFC", estado: "Goiás", uf: "GO", detran: "https://www.detran.go.gov.br/" },
  { de: "KFD", ate: "KME", estado: "Pernambuco", uf: "PE", detran: "https://www.detran.pe.gov.br/" },
  { de: "KMF", ate: "LVE", estado: "Rio de Janeiro", uf: "RJ", detran: "https://www.detran.rj.gov.br/" },
  { de: "LVF", ate: "LWQ", estado: "Piauí", uf: "PI", detran: "https://www.detran.pi.gov.br/" },
  { de: "LWS", ate: "LZJ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "LZK", ate: "PUZ", estado: "Rio Grande do Sul", uf: "RS", detran: "https://www.detran.rs.gov.br/" },
  { de: "OKD", ate: "OKH", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "QHA", ate: "QJZ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "QTK", ate: "QTM", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RAA", ate: "RAJ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RDS", ate: "REB", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RKW", ate: "RLP", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "RLQ", ate: "RLZ", estado: "Paraíba", uf: "PB", detran: "https://www.detran.pb.gov.br/" },
  { de: "RMA", ate: "RMC", estado: "Tocantins", uf: "TO", detran: "https://www.detran.to.gov.br/" },
  { de: "RMD", ate: "RNZ", estado: "Minas Gerais", uf: "MG", detran: "https://www.detran.mg.gov.br/" },
  { de: "ROA", ate: "ROZ", estado: "Maranhão", uf: "MA", detran: "https://www.detran.ma.gov.br/" },
  { de: "RPA", ate: "RPZ", estado: "Bahia", uf: "BA", detran: "https://www.detran.ba.gov.br/" },
  { de: "RTA", ate: "RVZ", estado: "Minas Gerais", uf: "MG", detran: "https://www.detran.mg.gov.br/" },
  { de: "RXK", ate: "RYZ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" },
  { de: "SXA", ate: "SXZ", estado: "Santa Catarina", uf: "SC", detran: "https://www.detran.sc.gov.br/" }
];

// Mapa de conversão do 5º caractere (Mercosul <-> Antigo)
// No padrão Mercosul: 0=A, 1=B, 2=C, 3=D, 4=E, 5=F, 6=G, 7=H, 8=I, 9=J
const LETRA_PARA_NUMERO = { A: '0', B: '1', C: '2', D: '3', E: '4', F: '5', G: '6', H: '7', I: '8', J: '9' };
const NUMERO_PARA_LETRA = { '0': 'A', '1': 'B', '2': 'C', '3': 'D', '4': 'E', '5': 'F', '6': 'G', '7': 'H', '8': 'I', '9': 'J' };

function obterFaixasEstados() {
  if (typeof window !== 'undefined' && window.FAIXAS_ESTADOS_BRASIL && window.FAIXAS_ESTADOS_BRASIL.length) {
    return window.FAIXAS_ESTADOS_BRASIL;
  }
  if (typeof global !== 'undefined' && global.FAIXAS_ESTADOS_BRASIL && global.FAIXAS_ESTADOS_BRASIL.length) {
    return global.FAIXAS_ESTADOS_BRASIL;
  }
  return FAIXAS_ESTADOS_FALLBACK;
}

function identificarEstadoPlaca(letras) {
  const lista = obterFaixasEstados();
  for (const item of lista) {
    if (letras >= item.de && letras <= item.ate) {
      return item;
    }
  }
  return { 
    de: letras, 
    ate: letras, 
    estado: "Brasil (SENATRAN)", 
    uf: "BR", 
    detran: "https://portalservicos.senatran.serpro.gov.br/" 
  };
}

// ==========================================
// MÓDULO 4.1: FABRICANTES E MODELOS FIPE OFICIAIS
// ==========================================

const FABRICANTES_BRASIL = [
  {
    marca: "Volkswagen",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
    modelos: [
      { modelo: "Gol 1.0 Flex 12V 5p", preco: "R$ 48.900,00", ano: "2021/2022" },
      { modelo: "Polo Track 1.0 MPI Flex", preco: "R$ 79.800,00", ano: "2023/2024" },
      { modelo: "T-Cross 200 TSI 1.0 Flex Aut.", preco: "R$ 115.400,00", ano: "2022/2023" },
      { modelo: "Nivus Comfortline 1.0 TSI Flex", preco: "R$ 108.900,00", ano: "2022/2023" }
    ]
  },
  {
    marca: "Chevrolet",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Chevrolet-logo.png",
    modelos: [
      { modelo: "Onix Hatch 1.0 Flex", preco: "R$ 68.500,00", ano: "2022/2023" },
      { modelo: "Onix Plus 1.0 Turbo Flex Aut.", preco: "R$ 84.900,00", ano: "2023/2023" },
      { modelo: "Tracker Premier 1.2 Turbo Flex", preco: "R$ 128.900,00", ano: "2023/2024" },
      { modelo: "S10 High Country 2.8 Diesel 4x4", preco: "R$ 239.000,00", ano: "2022/2023" }
    ]
  },
  {
    marca: "Fiat",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/12/Fiat_Automobiles_logo.svg",
    modelos: [
      { modelo: "Strada Freedom 1.3 Flex CD", preco: "R$ 96.500,00", ano: "2023/2023" },
      { modelo: "Mobi Like 1.0 Fire Flex", preco: "R$ 54.900,00", ano: "2022/2023" },
      { modelo: "Argo Drive 1.0 Flex", preco: "R$ 68.900,00", ano: "2022/2023" },
      { modelo: "Fastback Impetus 1.0 Turbo Flex", preco: "R$ 126.900,00", ano: "2023/2024" }
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

// Tabela aproximada de alíquotas de IPVA para automóveis por Estado (%)
const ALIQUOTAS_IPVA_ESTADOS = {
  SP: 4.0, RJ: 4.0, MG: 4.0,
  PR: 3.5, DF: 3.5, GO: 3.75,
  RS: 3.0, BA: 2.5, PE: 3.0, CE: 3.0,
  SC: 2.0, ES: 2.0, AC: 2.0, MT: 3.0, MS: 3.0,
  AM: 2.0, PA: 2.5, MA: 2.5, PB: 2.5, RN: 3.0,
  AL: 3.0, SE: 3.0, PI: 2.5, RO: 2.0, RR: 3.0,
  AP: 3.0, TO: 3.5
};

let estadoPlacaAtual = { uf: "SP", estado: "São Paulo" };

async function verificarPlacaUnificada(event) {
  event.preventDefault();
  const input = document.getElementById('input-placa');
  if (!input) return;
  let raw = input.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (raw.length !== 7) {
    alert("Digite uma placa válida com 7 caracteres (letras e números). Exemplo: ABC1D23 ou ABC1234");
    return;
  }

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const btnOriginalHtml = submitBtn ? submitBtn.innerHTML : "";
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Buscando...</span>
    `;
  }

  const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
  const padraoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

  let tipo = "";
  let formatada = "";
  let placaAntigaEquiv = "";

  const letras = raw.slice(0, 3);
  const infoEstado = identificarEstadoPlaca(letras);
  estadoPlacaAtual = infoEstado;

  const elVisualHeader = document.getElementById('res-placa-header');

  if (padraoMercosul.test(raw)) {
    tipo = "Padrão Mercosul (Oficial PIV)";
    formatada = `${raw.slice(0, 3)} ${raw.slice(3, 4)}${raw.slice(4, 5)}${raw.slice(5)}`;
    
    const letraMercosul = raw.charAt(4);
    const digitoAntigo = LETRA_PARA_NUMERO[letraMercosul] || "X";
    placaAntigaEquiv = `${raw.slice(0, 3)}-${raw.charAt(3)}${digitoAntigo}${raw.slice(5)} (Padrão Antigo)`;

    if (elVisualHeader) {
      elVisualHeader.className = "bg-blue-700 text-white px-3 py-1 flex items-center justify-between font-sans";
      elVisualHeader.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block"></span>
          <span class="text-[10px] font-black tracking-widest uppercase">BRASIL</span>
        </div>
        <span class="text-[9px] font-bold tracking-wider opacity-90">MERCOSUL</span>
      `;
    }
  } else if (padraoAntigo.test(raw)) {
    tipo = "Padrão Cinza (Pré-Mercosul)";
    formatada = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    
    const digitoAntigo = raw.charAt(4);
    const letraMercosul = NUMERO_PARA_LETRA[digitoAntigo] || "A";
    placaAntigaEquiv = `${raw.slice(0, 3)}${raw.charAt(3)}${letraMercosul}${raw.slice(5)} (Mercosul)`;

    if (elVisualHeader) {
      elVisualHeader.className = "bg-slate-700 text-white px-3 py-1 flex items-center justify-between font-sans";
      elVisualHeader.innerHTML = `
        <span class="text-[10px] font-black tracking-widest uppercase">${infoEstado.uf} - BRASIL</span>
        <span class="text-[9px] font-bold tracking-wider opacity-90">PADRÃO CINZA</span>
      `;
    }
  } else {
    tipo = "Padrão Especial de Identificação";
    formatada = raw;
    placaAntigaEquiv = "Não aplicável";
  }

  // Preenche dados da placa decodificada
  const elTituloEstado = document.getElementById('placa-estado-titulo');
  if (elTituloEstado) elTituloEstado.innerText = `${infoEstado.estado} (${infoEstado.uf})`;

  const elPlacaTipo = document.getElementById('placa-tipo');
  if (elPlacaTipo) elPlacaTipo.innerText = tipo;

  const elPlacaFormatada = document.getElementById('placa-formatada');
  if (elPlacaFormatada) elPlacaFormatada.innerText = formatada;

  const elResUf = document.getElementById('res-veiculo-uf');
  if (elResUf) elResUf.innerText = `${infoEstado.estado} - ${infoEstado.uf}`;

  const elResAntiga = document.getElementById('res-veiculo-antiga');
  if (elResAntiga) elResAntiga.innerText = placaAntigaEquiv;

  const elResSerie = document.getElementById('res-veiculo-serie');
  if (elResSerie) elResSerie.innerText = `Faixa Oficial: ${infoEstado.de} a ${infoEstado.ate}`;

  // Configura botões oficiais diretos para o DETRAN do Estado
  const botoesContainer = document.getElementById('placa-botoes-oficiais');
  if (botoesContainer) {
    botoesContainer.innerHTML = `
      <a href="${infoEstado.detran}" target="_blank" rel="noopener noreferrer" class="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm">
        Consultar Débitos no DETRAN ${infoEstado.uf} Oficial
        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
      </a>
      <a href="https://portalservicos.senatran.serpro.gov.br/" target="_blank" rel="noopener noreferrer" class="text-xs font-semibold bg-white border border-slate-300 hover:border-slate-500 text-slate-700 px-3.5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm">
        SENATRAN Federal (Consulta Nacional RENAVAM)
        <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i>
      </a>
    `;
  }

  // 1. Verificação de Cache Local no Navegador (Gasta R$ 0,00 e é instantâneo)
  const cacheKey = `placa_cache_${raw}`;
  const dadosEmCache = localStorage.getItem(cacheKey);

  if (dadosEmCache) {
    try {
      const dataCached = JSON.parse(dadosEmCache);
      // Se o cache tiver o dado do veículo E o valor da FIPE preenchido, usa do cache!
      if (dataCached.veiculo && dataCached.fipe?.valor) {
        exibirDadosVeiculoReal(dataCached.veiculo, dataCached.fipe, dataCached.ipvaEstimado);
        console.log(`[Cache Local] Veículo e FIPE carregados da memória local: ${raw}`);
        finalizarBuscaVisual(submitBtn, btnOriginalHtml);
        return;
      } else {
        // Se o cache anterior era incompleto (sem FIPE), limpa para forçar busca nova
        localStorage.removeItem(cacheKey);
      }
    } catch (e) {
      localStorage.removeItem(cacheKey);
    }
  }

  // 2. Limite de 5 consultas por usuário (salvo no navegador)
  const MAX_CONSULTAS = 5;
  const hoje = new Date().toISOString().slice(0, 10);
  let usoDiario = JSON.parse(localStorage.getItem('uso_consultas_placa') || '{"data":"","contador":0}');

  if (usoDiario.data !== hoje) {
    usoDiario = { data: hoje, contador: 0 };
  }

  if (usoDiario.contador >= MAX_CONSULTAS) {
    alert("Você atingiu o limite de 5 consultas gratuitas por hoje para preservar os recursos do portal. Tente novamente amanhã!");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = btnOriginalHtml;
    }
    popularSeletoresFipe();
    return;
  }

  // 3. Chamada à API para obter o veículo real e a Tabela FIPE
  try {
    const apiRes = await fetch('/api/veiculo', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-consultas': String(usoDiario.contador)
      },
      body: JSON.stringify({ placa: raw })
    });

    if (apiRes.ok) {
      const data = await apiRes.json();
      if (data.sucesso && data.veiculo) {
        // Se a FIPE não veio do backend, busca diretamente no navegador (grátis)
        if (!data.fipe?.valor) {
          data.fipe = await consultarFipeNoCliente(data.veiculo);
        }

        // Incrementa o contador de consultas do usuário
        usoDiario.contador += 1;
        localStorage.setItem('uso_consultas_placa', JSON.stringify(usoDiario));

        // Salva os dados completos desta placa no cache do navegador
        localStorage.setItem(cacheKey, JSON.stringify(data));

        exibirDadosVeiculoReal(data.veiculo, data.fipe, data.ipvaEstimado);
      } else {
        popularSeletoresFipe();
      }
    } else {
      const erroData = await apiRes.json().catch(() => ({}));
      if (erroData.limiteAtingido) {
        alert(erroData.erro || "Limite de 5 consultas atingido.");
      }
      popularSeletoresFipe();
    }
  } catch (err) {
    console.warn("API de consulta veicular indisponível no momento. Usando catálogo FIPE local.", err);
  } finally {
    finalizarBuscaVisual(submitBtn, btnOriginalHtml);
  }
}

async function consultarFipeNoCliente(veiculo) {
  try {
    let codMarca = veiculo.marcaDetalhes?.fipeId ? String(veiculo.marcaDetalhes.fipeId) : null;
    if (!codMarca || isNaN(Number(codMarca))) {
      const resMarcas = await fetch('https://parallelum.com.br/fipe/api/v1/carros/marcas');
      if (!resMarcas.ok) return null;
      const marcas = await resMarcas.json();
      const mStr = (veiculo.marca || veiculo.fabricante || '').toUpperCase();
      const mEncontrada = marcas.find(m => m.nome.toUpperCase().includes(mStr) || mStr.includes(m.nome.toUpperCase()));
      if (mEncontrada) codMarca = mEncontrada.codigo;
    }
    if (!codMarca) return null;

    const resModelos = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codMarca}/modelos`);
    if (!resModelos.ok) return null;
    const { modelos } = await resModelos.json();

    const modStr = (veiculo.modelo || '').toUpperCase();
    const verStr = (veiculo.versao || '').toUpperCase();
    const termos = `${modStr} ${verStr}`.replace(/[()\/\\-]/g, ' ').split(/\s+/).filter(t => t.length >= 3);

    let melhorMod = null;
    let maxPts = -1;

    for (const m of modelos) {
      const nMod = m.nome.toUpperCase();
      let pts = 0;
      if (modStr && nMod.includes(modStr)) pts += 10;
      for (const t of termos) {
        if (nMod.includes(t) || (t.length >= 5 && nMod.includes(t.slice(0, 5)))) pts += 5;
      }
      if (pts > maxPts) {
        maxPts = pts;
        melhorMod = m;
      }
    }

    if (!melhorMod || maxPts <= 0) {
      melhorMod = modelos.find(m => m.nome.toUpperCase().includes(modStr)) || null;
    }
    if (!melhorMod) return null;

    const resAnos = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codMarca}/modelos/${melhorMod.codigo}/anos`);
    if (!resAnos.ok) return null;
    const anos = await resAnos.json();

    const anoDesejado = String(veiculo.ano_modelo || veiculo.ano_fabricacao || '');
    let anoObj = anos.find(a => a.codigo.startsWith(anoDesejado)) || anos[0];
    if (!anoObj) return null;

    const resFipe = await fetch(`https://parallelum.com.br/fipe/api/v1/carros/marcas/${codMarca}/modelos/${melhorMod.codigo}/anos/${anoObj.codigo}`);
    if (!resFipe.ok) return null;
    const fipeFinal = await resFipe.json();

    return {
      valor: fipeFinal.Valor,
      marca: fipeFinal.Marca,
      modelo: fipeFinal.Modelo,
      anoModelo: fipeFinal.AnoModelo,
      combustivel: fipeFinal.Combustivel,
      codigoFipe: fipeFinal.CodigoFipe,
      mesReferencia: fipeFinal.MesReferencia
    };
  } catch (e) {
    console.warn("Erro ao buscar FIPE no cliente:", e);
    return null;
  }
}

function finalizarBuscaVisual(submitBtn, originalHtml) {
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalHtml;
  }
  if (typeof window !== 'undefined' && window.lucide) {
    window.lucide.createIcons();
  }
  const resultContainer = document.getElementById('result-placa');
  if (resultContainer) {
    resultContainer.classList.remove('hidden');
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

const LOGOS_MONTADORAS = {
  "VOLKSWAGEN": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
  "VW": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Volkswagen_logo_2019.svg",
  "CHEVROLET": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Chevrolet-logo.png",
  "GM": "https://upload.wikimedia.org/wikipedia/commons/1/1e/Chevrolet-logo.png",
  "FIAT": "https://upload.wikimedia.org/wikipedia/commons/1/12/Fiat_Automobiles_logo.svg",
  "HYUNDAI": "https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg",
  "TOYOTA": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Toyota_carlogo.svg",
  "JEEP": "https://upload.wikimedia.org/wikipedia/commons/1/17/Jeep_logo.svg",
  "RENAULT": "https://upload.wikimedia.org/wikipedia/commons/b/b7/Renault_2021_Textlogo.svg",
  "HONDA": "https://upload.wikimedia.org/wikipedia/commons/3/38/Honda.svg",
  "FORD": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Ford_motor_company_logo.svg",
  "NISSAN": "https://upload.wikimedia.org/wikipedia/commons/8/82/Nissan_logo.png",
  "PEUGEOT": "https://upload.wikimedia.org/wikipedia/commons/f/f6/Peugeot_2021_Logo.svg",
  "CITROEN": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Citro%C3%ABn_2022.svg",
  "CITROËN": "https://upload.wikimedia.org/wikipedia/commons/b/bd/Citro%C3%ABn_2022.svg",
  "MITSUBISHI": "https://upload.wikimedia.org/wikipedia/commons/5/50/Mitsubishi_Motors_Logo.svg",
  "BMW": "https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg",
  "MERCEDES": "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg",
  "MERCEDES-BENZ": "https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg",
  "AUDI": "https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg",
  "CHERY": "https://upload.wikimedia.org/wikipedia/commons/2/25/Chery_logo.png",
  "CAOA CHERY": "https://upload.wikimedia.org/wikipedia/commons/2/25/Chery_logo.png",
  "BYD": "https://upload.wikimedia.org/wikipedia/commons/0/05/BYD_Auto_logo.svg",
  "GWM": "https://upload.wikimedia.org/wikipedia/commons/e/ee/Great_Wall_Motor_Logo.svg"
};

function obterLogoMarca(marcaStr) {
  if (!marcaStr) return null;
  const upper = marcaStr.toUpperCase().trim();
  for (const [chave, url] of Object.entries(LOGOS_MONTADORAS)) {
    if (upper.includes(chave) || chave.includes(upper)) {
      return url;
    }
  }
  return null;
}

function exibirDadosVeiculoReal(veiculo, fipe, ipvaEstimado) {
  const elNomeModelo = document.getElementById('res-fipe-modelo-nome');
  if (elNomeModelo) {
    elNomeModelo.innerText = `${veiculo.marca || ''} ${veiculo.modelo || ''} ${veiculo.versao || ''}`.trim();
  }

  const elAno = document.getElementById('res-fipe-ano');
  if (elAno) {
    elAno.innerText = `${veiculo.ano_fabricacao || ''}/${veiculo.ano_modelo || ''}`;
  }

  const elCombustivel = document.getElementById('res-fipe-combustivel');
  if (elCombustivel) {
    elCombustivel.innerText = veiculo.combustivel || 'Flex / Gasolina';
  }

  const elPreco = document.getElementById('res-fipe-preco');
  if (elPreco) {
    elPreco.innerText = fipe?.valor || 'Consulte FIPE oficial';
  }

  const elCodigo = document.getElementById('res-fipe-codigo');
  if (elCodigo) {
    elCodigo.innerText = fipe?.codigoFipe ? `Código FIPE: ${fipe.codigoFipe}` : (veiculo.chassi ? `Chassi Mascarado: ${veiculo.chassi.slice(0, 8)}...` : '');
  }

  const elMesRef = document.getElementById('res-fipe-mes-ref');
  if (elMesRef) {
    elMesRef.innerText = fipe?.mesReferencia || 'Mês Atual';
  }

  // Atualiza o logo oficial da montadora correspondente
  const logoContainer = document.getElementById('res-fipe-logo-container');
  const imgLogo = document.getElementById('res-fipe-logo');
  const marcaAlvo = veiculo.marca || veiculo.fabricante || fipe?.marca || '';
  const urlLogo = obterLogoMarca(marcaAlvo);

  if (imgLogo && logoContainer) {
    if (urlLogo) {
      imgLogo.src = urlLogo;
      imgLogo.alt = marcaAlvo;
      imgLogo.classList.remove('hidden');
      logoContainer.innerHTML = `<img id="res-fipe-logo" src="${urlLogo}" alt="${marcaAlvo}" class="max-h-full max-w-full object-contain">`;
    } else {
      // Fallback elegante com as iniciais da montadora caso não haja logo cadastrado
      const inicial = marcaAlvo.slice(0, 3).toUpperCase() || 'VEI';
      logoContainer.innerHTML = `
        <div class="w-full h-full rounded-xl bg-amber-500 text-white font-black text-sm flex items-center justify-center tracking-wider shadow-inner">
          ${inicial}
        </div>
      `;
    }
  }

  // Preenche dados do IPVA
  const aliquotaPadrao = ALIQUOTAS_IPVA_ESTADOS[estadoPlacaAtual.uf] || 3.0;
  const elIpvaBadge = document.getElementById('res-ipva-uf-badge');
  if (elIpvaBadge) elIpvaBadge.innerText = `${estadoPlacaAtual.estado} (${aliquotaPadrao}%)`;

  const elIpvaVenal = document.getElementById('res-ipva-venal');
  if (elIpvaVenal) elIpvaVenal.innerText = fipe?.valor || 'Base FIPE';

  const elIpvaAliquota = document.getElementById('res-ipva-aliquota');
  if (elIpvaAliquota) elIpvaAliquota.innerText = `${aliquotaPadrao.toFixed(1)}% ao ano`;

  const elIpvaValor = document.getElementById('res-ipva-valor');
  if (elIpvaValor) {
    if (ipvaEstimado) {
      elIpvaValor.innerText = formatarMoeda(ipvaEstimado);
    } else if (fipe?.valor) {
      const valorNum = parseFloat(fipe.valor.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
      elIpvaValor.innerText = formatarMoeda(valorNum * (aliquotaPadrao / 100));
    }
  }
}

// Funções para controle da Seção Oficial da Tabela FIPE
function popularSeletoresFipe() {
  const selectMarca = document.getElementById('select-fipe-marca');
  if (!selectMarca) return;

  selectMarca.innerHTML = FABRICANTES_BRASIL.map((fab, idx) => `
    <option value="${idx}">${fab.marca}</option>
  `).join('');

  selectMarca.selectedIndex = 0;
  atualizarModelosFipe(0, 0);
}

function atualizarModelosFipe(marcaIndex, modeloIndex) {
  const fab = FABRICANTES_BRASIL[marcaIndex];
  const selectModelo = document.getElementById('select-fipe-modelo');
  if (!selectModelo || !fab) return;

  selectModelo.innerHTML = fab.modelos.map((m, idx) => `
    <option value="${idx}">${m.modelo} (${m.ano}) - ${m.preco}</option>
  `).join('');

  const modIdx = (typeof modeloIndex === 'number') ? modeloIndex : 0;
  selectModelo.selectedIndex = modIdx;
  aplicarDadosVeiculoFipe(fab, fab.modelos[modIdx]);
}

function aoMudarMarcaFipe() {
  const selectMarca = document.getElementById('select-fipe-marca');
  if (!selectMarca) return;
  const marcaIndex = parseInt(selectMarca.value) || 0;
  atualizarModelosFipe(marcaIndex, 0);
}

function aoMudarModeloFipe() {
  const selectMarca = document.getElementById('select-fipe-marca');
  const selectModelo = document.getElementById('select-fipe-modelo');
  if (!selectMarca || !selectModelo) return;
  const marcaIndex = parseInt(selectMarca.value) || 0;
  const modeloIndex = parseInt(selectModelo.value) || 0;

  const fab = FABRICANTES_BRASIL[marcaIndex];
  if (fab && fab.modelos[modeloIndex]) {
    aplicarDadosVeiculoFipe(fab, fab.modelos[modeloIndex]);
  }
}

function aplicarDadosVeiculoFipe(fab, mod) {
  const elNome = document.getElementById('res-fipe-modelo-nome');
  if (elNome) elNome.innerText = `${fab.marca} ${mod.modelo}`;

  const elPreco = document.getElementById('res-fipe-preco');
  if (elPreco) elPreco.innerText = mod.preco;

  const elAno = document.getElementById('res-fipe-ano');
  if (elAno) elAno.innerText = mod.ano;

  const elCodigo = document.getElementById('res-fipe-codigo');
  if (elCodigo) elCodigo.innerText = `Referência Oficial FIPE`;

  const elMes = document.getElementById('res-fipe-mes-ref');
  if (elMes) {
    const dataRef = new Date();
    const nomeMes = dataRef.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    elMes.innerText = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  }
  
  const imgLogo = document.getElementById('res-fipe-logo');
  if (imgLogo) {
    imgLogo.src = fab.logo;
    imgLogo.alt = fab.marca;
  }

  // Atualiza a Estimativa de IPVA baseada no Estado da Placa
  const uf = estadoPlacaAtual.uf || "SP";
  const aliq = ALIQUOTAS_IPVA_ESTADOS[uf] || 3.0;

  const elIpvaBadge = document.getElementById('res-ipva-uf-badge');
  if (elIpvaBadge) elIpvaBadge.innerText = `${estadoPlacaAtual.estado} (${uf}) - ${aliq.toFixed(2)}%`;

  const elIpvaVenal = document.getElementById('res-ipva-venal');
  if (elIpvaVenal) elIpvaVenal.innerText = mod.preco;

  const elIpvaAliq = document.getElementById('res-ipva-aliquota');
  if (elIpvaAliq) elIpvaAliq.innerText = `${aliq.toFixed(2)} %`;

  const elIpvaValor = document.getElementById('res-ipva-valor');
  if (elIpvaValor) {
    const valorNumerico = parseFloat(mod.preco.replace(/[^0-9]/g, '')) / 100 || 0;
    const valorIpva = (valorNumerico * aliq) / 100;
    elIpvaValor.innerText = valorIpva.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
}

// Inicializa os seletores da FIPE automaticamente ao carregar a página
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    popularSeletoresFipe();
  });
}



