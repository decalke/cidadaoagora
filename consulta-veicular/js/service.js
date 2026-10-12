/**
 * Consulta Veicular - Camada de Serviços & Dados Demonstrativos
 * 
 * Este módulo provê a lógica de validação de placas, máscara,
 * geração de dados demonstrativos/fictícios e callbacks de progresso
 * para simular a consulta antes da integração com APIs reais.
 */

const ConsultaVeicularService = (function() {
  const STORAGE_KEY_VEICULO = 'consulta_veicular_veiculo_ativo';
  const STORAGE_KEY_PAGAMENTO = 'consulta_veicular_pagamento_status';

  // Validação de formato da placa brasileira
  function validarPlaca(placaRaw) {
    if (!placaRaw) return false;
    const limpo = placaRaw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (limpo.length !== 7) return false;
    const padraoMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
    const padraoAntigo = /^[A-Z]{3}[0-9]{4}$/;
    return padraoMercosul.test(limpo) || padraoAntigo.test(limpo);
  }

  // Detecta padrão da placa
  function obterTipoPlaca(placaRaw) {
    const limpo = (placaRaw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(limpo)) return 'Mercosul';
    if (/^[A-Z]{3}[0-9]{4}$/.test(limpo)) return 'Antigo (Cinza)';
    return 'Especial';
  }

  // Aplica máscara visual
  function formatarPlaca(placaRaw) {
    if (!placaRaw) return '';
    const limpo = placaRaw.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (limpo.length <= 3) return limpo;
    if (limpo.length === 7) {
      if (/^[A-Z]{3}[0-9]{4}$/.test(limpo)) {
        return `${limpo.slice(0, 3)}-${limpo.slice(3)}`;
      }
      return `${limpo.slice(0, 3)}${limpo.slice(3, 4)}${limpo.slice(4, 5)}${limpo.slice(5)}`;
    }
    return limpo;
  }

  // Mascara de ocultação para a tela prévia (ex: ABC1*23)
  function ocultarPlaca(placaRaw) {
    const limpo = (placaRaw || 'ABC1D23').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (limpo.length >= 7) {
      return `${limpo.slice(0, 3)} • ${limpo.slice(3, 4)}*${limpo.slice(5, 7)}`;
    }
    return `${limpo.slice(0, 3)} • ***`;
  }

  // Gerador de Dados Demonstrativos Fictícios
  function gerarDadosFicticios(placaRaw) {
    const limpo = (placaRaw || 'ABC1D23').toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Modelos fictícios para atender à regra "Não use marcas ou logos reais"
    const catalogoFicticio = [
      {
        marca: "Veloce Motors",
        modelo: "Strada Cross 1.0 Turbo Flex",
        categoria: "SUV Compacto",
        anoFab: 2023,
        anoMod: 2024,
        cor: "Vermelho Carmim",
        combustivel: "Flex (Etanol / Gasolina)",
        fipeEstimada: 89400,
        ipvaEstimado: 3576,
        fotoUrl: "../img/hero-carro-suv-vermelho.jpg",
        risco: "baixo",
        scoreRisco: 96,
        leilao: { consta: false, tipo: "Nada consta", detalhe: "Nenhuma passagem por leilão público, financeiro ou judicial." },
        sinistro: { consta: false, tipo: "Nada consta", detalhe: "Sem registro de indenização integral ou danos estruturais." },
        debitos: { total: 0, multas: 0, ipvaPendente: false, detalhe: "Veículo 100% quitado e sem débitos estaduais." },
        restricoes: { consta: false, judiciais: false, administrativas: false, detalhe: "Livre de quaisquer restrições judiciais (Renajud) ou administrativas." },
        gravame: { consta: false, detalhe: "Sem alienação fiduciária ativa no SNG (Quitado)." },
        recall: { pendente: false, detalhe: "Todas as campanhas preventivas atendidas." },
        quilometragem: { media: "28.400 km", evolucao: "Consistente com ano/modelo (Auditoria realizada em vistorias oficiais)" },
        proprietarios: 1
      },
      {
        marca: "Aura Automóveis",
        modelo: "Prestige Sedan 2.0 Turbo",
        categoria: "Sedan Médio Executivo",
        anoFab: 2022,
        anoMod: 2023,
        cor: "Azul Cobalto Metálico",
        combustivel: "Gasolina / Híbrido Leve",
        fipeEstimada: 124800,
        ipvaEstimado: 4992,
        fotoUrl: "../img/hero-carro-sedan-azul.jpg",
        risco: "baixo",
        scoreRisco: 92,
        leilao: { consta: false, tipo: "Nada consta", detalhe: "Histórico limpo sem histórico de leiloeiros." },
        sinistro: { consta: false, tipo: "Nada consta", detalhe: "Histórico aprovado em todas as seguradoras nacionais." },
        debitos: { total: 0, multas: 0, ipvaPendente: false, detalhe: "Sem débitos ou autuações pendentes no DETRAN." },
        restricoes: { consta: false, judiciais: false, administrativas: false, detalhe: "Situação cadastral totalmente regular." },
        gravame: { consta: false, detalhe: "Gravame baixado." },
        recall: { pendente: false, detalhe: "Nenhum recall ativo." },
        quilometragem: { media: "41.200 km", evolucao: "Registro regular verificado." },
        proprietarios: 2
      },
      {
        marca: "Titan Veículos",
        modelo: "Horizon Trekker 1.6 16V",
        categoria: "Crossover Utilitário",
        anoFab: 2021,
        anoMod: 2021,
        cor: "Prata Lunar",
        combustivel: "Flex",
        fipeEstimada: 68900,
        ipvaEstimado: 2756,
        fotoUrl: "../img/hero-carro-suv-vermelho.jpg",
        risco: "medio",
        scoreRisco: 74,
        leilao: { consta: true, tipo: "Recuperado de Financiamento", detalhe: "Passagem por leilão financeiro (banco) sem avarias físicas ou danos estruturais." },
        sinistro: { consta: false, tipo: "Nada consta", detalhe: "Sem registro de colisão grave ou perda total." },
        debitos: { total: 320.50, multas: 1, ipvaPendente: false, detalhe: "1 multa leve registrada por excesso de velocidade em rodovia estadual." },
        restricoes: { consta: false, judiciais: false, administrativas: false, detalhe: "Veículo apto para transferência após liquidação de multa simples." },
        gravame: { consta: false, detalhe: "Alienação baixada no SNG." },
        recall: { pendente: false, detalhe: "Em conformidade." },
        quilometragem: { media: "59.800 km", evolucao: "Progressão verificada." },
        proprietarios: 2
      }
    ];

    // Escolhe cenário com base no último caractere para consistência
    const charCode = limpo.charCodeAt(limpo.length - 1) || 0;
    const indice = charCode % catalogoFicticio.length;
    const veiculoBase = JSON.parse(JSON.stringify(catalogoFicticio[indice]));

    veiculoBase.placa = limpo;
    veiculoBase.placaFormatada = formatarPlaca(limpo);
    veiculoBase.placaOculta = ocultarPlaca(limpo);
    veiculoBase.tipoPlaca = obterTipoPlaca(limpo);
    veiculoBase.ufRegistro = "SP";
    veiculoBase.municipioRegistro = "São Paulo";
    veiculoBase.chassiFicticio = `9BW***${limpo.slice(0, 3)}***${limpo.slice(3)}`;
    veiculoBase.renavamFicticio = `00${Math.abs(charCode * 1234567).toString().slice(0, 9)}`;
    veiculoBase.dataConsulta = new Date().toLocaleDateString('pt-BR');
    veiculoBase.horaConsulta = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    veiculoBase.codigoLaudo = `CV-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`;

    // Timeline de Eventos Históricos Fictícios
    veiculoBase.timeline = [
      { data: `15/01/${veiculoBase.anoFab}`, titulo: "Primeiro Emplacamento Oficial", detalhe: "Faturamento como veículo zero km e emissão do CRV inicial.", tipo: "positivo" },
      { data: `22/10/${veiculoBase.anoFab + 1}`, titulo: "Vistoria Periódica de Licenciamento", detalhe: "Emissão de CRLV digital e aprovação em laudo de emissões.", tipo: "positivo" },
      { data: `11/04/${veiculoBase.anoFab + 2}`, titulo: "Transferência de Propriedade", detalhe: "Mudança regular de titularidade realizada no órgão de trânsito.", tipo: "informativo" },
      { data: `05/01/2026`, titulo: "Licenciamento Anual Quitado", detalhe: "Exercício regular devidamente atualizado.", tipo: "positivo" }
    ];

    if (veiculoBase.leilao.consta) {
      veiculoBase.timeline.splice(2, 0, {
        data: `18/08/${veiculoBase.anoFab + 1}`,
        titulo: "Passagem por Leilão Financeiro",
        detalhe: "Retomada amigável por instituição bancária e venda via leiloeiro credenciado.",
        tipo: "alerta"
      });
    }

    return veiculoBase;
  }

  // Simulação de Consulta Assíncrona com Etapas Progressivas
  function consultarVeiculoMock(placaRaw, onEtapa) {
    return new Promise((resolve, reject) => {
      if (!validarPlaca(placaRaw)) {
        reject(new Error("Formato de placa inválido. Digite 7 caracteres no formato Mercosul ou antigo."));
        return;
      }

      const etapas = [
        { pct: 20, msg: "Verificando formato e identificação cadastral preliminar..." },
        { pct: 45, msg: "Consultando bases de leiloeiros e histórico de apreensões..." },
        { pct: 70, msg: "Checando registros de seguradoras, sinistros e batidas..." },
        { pct: 90, msg: "Verificando débitos de IPVA, multas e restrições ativas..." },
        { pct: 100, msg: "Compilando laudo cautelar demonstrativo do veículo..." }
      ];

      let passo = 0;
      function proximoPasso() {
        if (passo < etapas.length) {
          if (typeof onEtapa === 'function') {
            onEtapa(etapas[passo]);
          }
          passo++;
          setTimeout(proximoPasso, 400);
        } else {
          const dados = gerarDadosFicticios(placaRaw);
          salvarVeiculoAtual(dados);
          resolve(dados);
        }
      }

      proximoPasso();
    });
  }

  function salvarVeiculoAtual(dados) {
    try {
      sessionStorage.setItem(STORAGE_KEY_VEICULO, JSON.stringify(dados));
    } catch(e) {}
  }

  function obterVeiculoAtual() {
    try {
      const item = sessionStorage.getItem(STORAGE_KEY_VEICULO);
      if (item) return JSON.parse(item);
    } catch(e) {}
    // Fallback padrão para exibição inicial caso abra direto a tela de relatório
    return gerarDadosFicticios('ABC1D23');
  }

  function registrarPagamento(plano, valor) {
    const registro = {
      pago: true,
      plano: plano || 'Relatório Completo',
      valor: valor || 9.90,
      transacaoId: `TX-PIX-${Date.now()}`,
      dataHora: new Date().toISOString()
    };
    try {
      sessionStorage.setItem(STORAGE_KEY_PAGAMENTO, JSON.stringify(registro));
    } catch(e) {}
    return registro;
  }

  function verificarStatusPagamento() {
    try {
      const item = sessionStorage.getItem(STORAGE_KEY_PAGAMENTO);
      if (item) return JSON.parse(item);
    } catch(e) {}
    return { pago: false };
  }

  return {
    validarPlaca,
    formatarPlaca,
    ocultarPlaca,
    obterTipoPlaca,
    gerarDadosFicticios,
    consultarVeiculoMock,
    salvarVeiculoAtual,
    obterVeiculoAtual,
    registrarPagamento,
    verificarStatusPagamento
  };
})();

// Exportação global
if (typeof window !== 'undefined') {
  window.ConsultaVeicularService = ConsultaVeicularService;
}
