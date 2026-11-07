(() => {
  'use strict';
  const logo='<a class="v4-logo" href="/" aria-label="Cidadão Agora, início"><span class="v4-logo-mark">c<span>↗</span></span><span>cidadão<b>agora</b><small>Seu dia, mais simples.</small></span></a>';
  const nav='<a href="/#ferramentas">Ferramentas</a><a href="/clima/">Clima</a><a href="/conteudo/noticias">Notícias</a><a href="/conteudo/politica">Política</a><a href="/guias/">Guias</a>';
  function productAds(){
    if(document.getElementById('v4-product-ads'))return;
    const products=[
      {name:'Carregador Baseus Enerfill FN22',detail:'USB-C · 30 W · preto',icon:'⚡',url:'https://www.mercadolivre.com.br/carregador-rapido-baseus-enerfill-fn22-usb-c-30w-preto/p/MLB75921161?pdp_filters=item_id%3AMLB7285918242'},
      {name:'Cabo Baseus USB-C para USB-C',detail:'100 W · 2 metros · preto',icon:'↔',url:'https://www.mercadolivre.com.br/cabo-carregador-baseus-usb-c-para-usb-c-100w-de-2m-cor-preto/p/MLB36402495?pdp_filters=item_id%3AMLB7725432042'},
      {name:'Suporte magnético TOPK D37',detail:'Para celular · fixação na saída de ar do carro',icon:'▣',url:'https://www.mercadolivre.com.br/suporte-magnetico-celular-carro-topk-d37-ima-n52-saida-ar/up/MLBU5094080629'}
    ];
    const css=document.createElement('link');css.rel='stylesheet';css.href='/assets/v4/product-ads.css?v=1';document.head.append(css);
    const section=document.createElement('aside');section.id='v4-product-ads';section.className='v4-product-ads';section.setAttribute('aria-labelledby','v4-product-ads-title');
    const inner=document.createElement('div');inner.className='v4-width';
    const label=document.createElement('p');label.className='v4-product-ad-label';label.textContent='PUBLICIDADE · LINKS PARA O MERCADO LIVRE';
    const title=document.createElement('h2');title.id='v4-product-ads-title';title.textContent='Acessórios para o seu dia a dia';
    const grid=document.createElement('div');grid.className='v4-product-ad-grid';
    products.forEach(product=>{
      const card=document.createElement('article');card.className='v4-product-ad-card';
      const icon=document.createElement('span');icon.className='v4-product-ad-icon';icon.setAttribute('aria-hidden','true');icon.textContent=product.icon;
      const name=document.createElement('h3');name.textContent=product.name;
      const detail=document.createElement('p');detail.textContent=product.detail;
      const link=document.createElement('a');link.href=product.url;link.target='_blank';link.rel='sponsored nofollow noopener noreferrer';link.textContent='Ver no Mercado Livre ↗';link.setAttribute('aria-label','Ver '+product.name+' no Mercado Livre (abre em nova aba)');
      card.append(icon,name,detail,link);grid.append(card);
    });
    const note=document.createElement('p');note.className='v4-product-ad-note';note.textContent='Confira preço, compatibilidade, frete e disponibilidade no anúncio. A compra é realizada no Mercado Livre.';
    inner.append(label,title,grid,note);section.append(inner);
    // Bloco independente após o conteúdo; não interfere em formulários ou alertas.
    const footer=document.querySelector('body > .v4-footer');
    if(footer)document.body.insertBefore(section,footer);else document.body.append(section);
  }
  function initialize(){
    document.body.classList.add('v4-site');
    document.querySelectorAll('body>header,body>footer,#menu-mobile').forEach(n=>n.remove());
    document.querySelectorAll('body>.edition-bar,body>.masthead,body>.demo').forEach(n=>n.remove());
    const header=document.createElement('header');header.className='v4-header';header.innerHTML='<div class="v4-width">'+logo+'<nav aria-label="Principal">'+nav+'</nav><a class="v4-header-cta" href="/#ferramentas">O que você precisa? <span>↗</span></a><button type="button" id="v4-menu-toggle" aria-expanded="false" aria-controls="v4-mobile-menu" aria-label="Abrir navegação">☰</button></div><nav id="v4-mobile-menu" aria-label="Navegação no celular" hidden>'+nav+'</nav>';document.body.prepend(header);
    const toggle=document.getElementById('v4-menu-toggle'),menu=document.getElementById('v4-mobile-menu');toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));toggle.setAttribute('aria-label',expanded?'Abrir navegação':'Fechar navegação');menu.hidden=expanded});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){menu.hidden=true;toggle.setAttribute('aria-expanded','false')}});
    const footer=document.createElement('footer');footer.className='v4-footer';footer.innerHTML='<div class="v4-width"><div class="v4-footer-top"><div>'+logo+'<p>Informação, serviços e boas ideias<br>para a vida acontecer.</p></div><nav aria-label="Explore"><strong>Explore</strong>'+nav+'</nav><nav aria-label="Transparência"><strong>Prazer, Cidadão Agora.</strong><a href="/conteudo/sobre">Sobre o portal</a><a href="/conteudo/contato">Fale com a gente</a><a href="/conteudo/politica-privacidade">Privacidade</a><a href="/conteudo/termos-de-uso">Termos de uso</a><button type="button" id="v4-cookie-settings">Preferências de privacidade</button></nav></div><div class="v4-footer-bottom"><span>© '+new Date().getFullYear()+' Cidadão Agora</span><span>Portal independente. Não somos um site do governo.</span><a href="#">De volta ao topo ↑</a></div></div>';document.body.append(footer);
    productAds();
    document.getElementById('lgpd-banner')?.remove();document.getElementById('modal-cookies')?.remove();
    let consent='';try{consent=localStorage.getItem('cidadao_consent_v4')||''}catch{}
    function optionalServices(){
      if(document.getElementById('v4-analytics-script'))return;
      window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments)};window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'granted',ad_user_data:'granted',ad_personalization:'denied'});window.gtag('js',new Date());window.gtag('config','G-C8ZSTXP9WQ',{allow_google_signals:false,allow_ad_personalization_signals:false});
      const analytics=document.createElement('script');analytics.id='v4-analytics-script';analytics.async=true;analytics.src='https://www.googletagmanager.com/gtag/js?id=G-C8ZSTXP9WQ';document.head.append(analytics);
      const ads=document.createElement('script');ads.async=true;ads.crossOrigin='anonymous';ads.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1173007636108448';ads.addEventListener('load',()=>{document.querySelectorAll('ins.adsbygoogle:not([data-adsbygoogle-status])').forEach(()=>{try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch{}})});document.head.append(ads);
    }
    function showConsent(){
      document.getElementById('v4-cookie')?.remove();const banner=document.createElement('div');banner.id='v4-cookie';banner.className='v4-cookie';banner.setAttribute('role','region');banner.setAttribute('aria-label','Preferências de privacidade');banner.innerHTML='<strong>Você escolhe sua privacidade.</strong><p>As ferramentas funcionam com recursos essenciais. Com sua permissão, ativamos métricas e anúncios do Google. <a href="/conteudo/politica-privacidade">Entenda como usamos os dados.</a></p><div><button type="button" data-consent="essential">Só essenciais</button><button type="button" data-consent="all">Permitir opcionais</button></div>';banner.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{consent=button.dataset.consent;try{localStorage.setItem('cidadao_consent_v4',consent)}catch{}if(consent==='all')optionalServices();else window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});banner.remove()}));document.body.append(banner);
    }
    window.abrirConfiguracoesCookies=showConsent;document.getElementById('v4-cookie-settings').addEventListener('click',showConsent);if(consent==='all')optionalServices();else if(!consent)showConsent();
    if(!document.querySelector('.v4-home')&&!document.querySelector('.v4-tools')&&!document.querySelector('.v4-newsroom')&&!location.pathname.startsWith('/clima'))document.body.classList.add('v4-internal');
    // Identificação explícita das ilustrações em conteúdo jornalístico.
    if(/^\/(noticias|politica|atualidades)\/[^/]+/.test(location.pathname)){
      document.querySelectorAll('main img').forEach(image=>{if(/imagens\.ebc|agenciabrasil|flickr/.test(image.src)){image.src='/assets/v4/brasil-cotidiano.webp';image.alt='Ilustração do cotidiano brasileiro gerada por inteligência artificial; não retrata o fato noticiado.';const caption=document.createElement('p');caption.className='v4-image-caption';caption.textContent='Ilustração gerada por IA. Não retrata o acontecimento noticiado.';image.insertAdjacentElement('afterend',caption)}});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize);else initialize();
})();
