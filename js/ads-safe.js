// Inicializador seguro e responsivo do Google AdSense
// Evita erros "No slot size for availableWidth=0" e chamadas duplicadas
(function() {
  function initAdSlot(ins) {
    if (!ins || ins.getAttribute('data-ad-status') === 'filled' || ins.getAttribute('data-adsbygoogle-status')) {
      return;
    }
    
    // Verifica se o elemento está visível no DOM e possui largura maior que zero
    const rect = ins.getBoundingClientRect();
    const parentRect = ins.parentElement ? ins.parentElement.getBoundingClientRect() : { width: 0 };
    const availableWidth = rect.width || parentRect.width;

    if (availableWidth > 0 && rect.height >= 0) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.warn('AdSense init skipped:', e);
      }
    }
  }

  function setupAdSense() {
    const adElements = document.querySelectorAll('ins.adsbygoogle');
    if (!adElements.length) return;

    if ('IntersectionObserver' in window && 'ResizeObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            initAdSlot(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '200px 0px' });

      adElements.forEach(ins => {
        // Se já tem largura visível imediatamente, aguarda o render ou observa
        const rect = ins.getBoundingClientRect();
        if (rect.width > 0) {
          initAdSlot(ins);
        } else {
          io.observe(ins);
          // Fallback com ResizeObserver no container pai
          if (ins.parentElement) {
            const ro = new ResizeObserver((pEntries) => {
              for (let pEntry of pEntries) {
                if (pEntry.contentRect.width > 0) {
                  initAdSlot(ins);
                  ro.disconnect();
                  io.unobserve(ins);
                }
              }
            });
            ro.observe(ins.parentElement);
          }
        }
      });
    } else {
      // Fallback clássico pós-carregamento com checagem de largura
      window.addEventListener('load', () => {
        setTimeout(() => {
          adElements.forEach(ins => initAdSlot(ins));
        }, 300);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAdSense);
  } else {
    setupAdSense();
  }
  
  // Expõe helper global caso scripts dinâmicos precisem re-iniciar
  window.refreshAdSenseSlots = setupAdSense;
})();
