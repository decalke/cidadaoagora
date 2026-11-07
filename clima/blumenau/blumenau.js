(() => {
  'use strict';
  const BASE='https://defesacivil.blumenau.sc.gov.br', $=id=>document.getElementById(id);
  const numeric=x=>typeof x==='number' && Number.isFinite(x);
  const fmt=x=>numeric(x)?x.toLocaleString('pt-BR',{maximumFractionDigits:2}):'—';
  const date=x=>Number.isFinite(Date.parse(x))?new Date(x).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'}):'Horário não informado';
  const fresh=(x,m=90)=>{const age=Date.now()-Date.parse(x);return age>=0 && age<m*60000;};
  const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let sources={}, inmet=null, loading=false, stationLimit=12, streetLimit=24, shelterLimit=12;
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function link(text,url){const n=el('a',text);n.href=url;n.target='_blank';n.rel='noopener noreferrer';return n;}
  function card(root,title){const n=el('article',undefined,'card');n.append(el('h3',title));root.append(n);return n;}
  const src=key=>sources[key]||{};
  const available=key=>src(key).ok===true && fresh(src(key).collectedAt);
  function note(root,key){root.append(el('p','Fonte: AlertaBlu · cópia consultada em '+date(src(key).collectedAt)+(src(key).ok===false?' · última coleta falhou':''),'source-note'));}
  function unavailable(root){root.append(el('p','Dados indisponíveis ou desatualizados. Consulte a fonte oficial.','notice'));}
  function state(text,old=false){return el('span',text,'state '+(old?'old':norm(text).includes('alerta')?'danger':/aten|observ/.test(norm(text))?'warn':''));}
  function series(root,readings,label,unit){
    const points=readings.filter(p=>numeric(p.value)&&Number.isFinite(Date.parse(p.time))).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
    if(points.length<2)return;
    const first=Date.parse(points[0].time),last=Date.parse(points.at(-1).time),low=Math.min(...points.map(p=>p.value)),high=Math.max(...points.map(p=>p.value));
    if(last<=first)return;
    const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 500 140');svg.setAttribute('role','img');svg.setAttribute('aria-label',`${label}: mínimo ${fmt(low)} ${unit}; máximo ${fmt(high)} ${unit}. Valores na tabela abaixo.`);
    points.forEach(p=>{const n=document.createElementNS(ns,'circle');n.setAttribute('cx',String(8+(Date.parse(p.time)-first)/(last-first)*484));n.setAttribute('cy',String(125-(p.value-low)/(high-low||1)*110));n.setAttribute('r','3');n.setAttribute('fill','currentColor');svg.append(n);});
    root.append(svg,el('p',`Histórico recebido · ${date(points[0].time)} → ${date(points.at(-1).time)}`,'muted'));
    const details=el('details'),table=el('table'),wrap=el('div',undefined,'table-wrap'),head=el('tr');head.append(el('th','Horário'),el('th',label+' ('+unit+')'));table.append(head);
    points.slice().reverse().forEach(p=>{const tr=el('tr');tr.append(el('td',date(p.time)),el('td',fmt(p.value)));table.append(tr);});wrap.append(table);details.append(el('summary','Consultar histórico em tabela'),wrap);root.append(details);
  }
  function river(){
    const root=$('nivel');root.replaceChildren(el('h3','Rio Itajaí-Açu · Blumenau'));
    const data=src('rio').data, points=(data?.readings||[]).filter(p=>numeric(p.value)&&Number.isFinite(Date.parse(p.time))).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)),last=points.at(-1);
    if(!available('rio')||!last||!fresh(last.time)){unavailable(root);if(last)root.append(el('p','Última medição recebida: '+date(last.time),'muted'));}
    else {root.append(el('p',fmt(last.value)+' m','value'),el('p','Medição: '+date(last.time),'muted'));series(root,points,'Nível','m');}
    root.append(link('Classificações e orientações oficiais ↗',BASE+'/c/meteorologia/legenda_nivel_rio'));note(root,'rio');
    const t=$('temperatura');t.replaceChildren(el('h3','Temperatura observada'));
    const temps=(src('temperatura').data||[]).filter(p=>numeric(p.value)&&Number.isFinite(Date.parse(p.time))).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)),latest=temps.at(-1);
    if(available('temperatura')&&latest&&fresh(latest.time)){t.append(el('p',fmt(latest.value)+' °C','value'),el('p','Medição: '+date(latest.time),'muted'));series(t,temps,'Temperatura','°C');}else unavailable(t);
    t.append(link('Previsão detalhada do AlertaBlu ↗',BASE+'/p/detalhada'));note(t,'temperatura');
  }
  function regions(){
    const root=$('situacao');root.replaceChildren();const groups=src('situacao').data?.groups;
    if(!Array.isArray(groups)||!groups.length){unavailable(root);return;}
    groups.forEach(g=>{const c=card(root,g.name),current=available('situacao')&&fresh(g.time,180);if(!current)c.append(state('Último comunicado · condição atual não confirmada',true));
      c.append(el('p','Publicado em '+date(g.time),'muted'));
      (g.regions||[]).forEach(r=>{const p=el('div',undefined,'reading');p.append(el('strong',r.name),state(r.condition,!current));c.append(p);const details=el('details');details.append(el('summary','Bairros da região'),el('p',(r.neighborhoods||[]).join(', ')));c.append(details);});note(c,'situacao');});
  }
  function stations(){
    const root=$('estacoes');root.replaceChildren();const q=norm($('estacao-busca').value),type=$('estacao-tipo').value;
    const rows=(src('chuva').data||[]).filter(s=>{
      if(type==='local'&&!['Central','Norte','Sul','Leste','Oeste'].includes(s.region))return false;
      if(type==='rios'&&!numeric(s.level))return false;
      if(type==='sensores'&&!Object.keys(s.sensors||{}).length)return false;
      return norm(s.name+' '+s.region).includes(q);
    });
    $('estacao-resumo').textContent=`${rows.length} estação(ões) · exibindo ${Math.min(stationLimit,rows.length)}. Fonte: AlertaBlu e redes indicadas no cadastro.`;
    rows.slice(0,stationLimit).forEach(s=>{const c=card(root,s.name),current=available('chuva')&&!s.disabled&&fresh(s.time);
      c.append(el('p',s.region+' · rede: '+s.provider,'muted'),state(current?'Medição recente':s.disabled?'Estação desativada':'Medição indisponível',!current),el('p','Medição: '+date(s.time),'muted'));
      const metrics=el('div',undefined,'metric-row');[['h01','Chuva 1h'],['h24','Chuva 24h'],['h72','Chuva 72h']].forEach(([k,label])=>{const p=el('p',label);p.append(el('strong',current&&numeric(s.rain?.[k])?fmt(s.rain[k])+' mm':'—'));metrics.append(p);});c.append(metrics);
      if(numeric(s.level))c.append(el('p',current?'Nível nesta estação: '+fmt(s.level)+' m':'Nível indisponível.'));
      if(Object.keys(s.sensors||{}).length){const d=el('details');d.append(el('summary','Sensores de solo'));Object.entries(s.sensors).forEach(([k,v])=>d.append(el('p',k+': '+(current?fmt(v):'—'))));d.append(el('p','Identificadores e valores conforme a fonte. Unidade/profundidade não especificadas neste arquivo; o portal não calcula risco.','muted'));c.append(d);}
    });
    if(!rows.length)root.append(el('p','Nenhuma estação disponível para este filtro.'));$('mais-estacoes').hidden=rows.length<=stationLimit;
  }
  function streets(){
    const root=$('ruas');root.replaceChildren();const source=src('cotas'),q=norm($('rua-busca').value.trim());
    $('mais-ruas').hidden=true;
    if(!Array.isArray(source.data)){$('cota-status').textContent='Cadastro indisponível. Consulte a tabela oficial.';return;}
    const old=!source.ok||!fresh(source.collectedAt,10080);
    if(q.length<2){$('cota-status').textContent=`${source.data.length.toLocaleString('pt-BR')} trechos cadastrados. Busque pelo nome. Cópia de ${date(source.collectedAt)}${old?' · cadastro possivelmente desatualizado':''}.`;return;}
    const rows=source.data.filter(s=>norm(s.street+' '+s.neighborhood+' '+s.note).includes(q));
    $('cota-status').textContent=`${rows.length} trecho(s) · exibindo ${Math.min(rows.length,streetLimit)}. Cópia de ${date(source.collectedAt)}${old?' · cadastro possivelmente desatualizado':''}.`;
    rows.slice(0,streetLimit).forEach(s=>{const c=card(root,s.street);c.append(el('p',s.neighborhood,'eyebrow'),el('p','Cota cadastrada: '+fmt(s.level)+' m','value'),el('p',s.note||'Trecho não especificado.'),link('Confirmar na tabela oficial ↗',BASE+'/p/cotas'));});
    if(!rows.length)root.append(el('p','Nenhum trecho localizado. Isso não indica ausência de risco de inundação.'));$('mais-ruas').hidden=rows.length<=streetLimit;
  }
  function shelters(){
    const root=$('lista-abrigos');root.replaceChildren();const q=norm($('abrigo-busca').value),rows=(src('abrigos').data||[]).filter(s=>norm(s.designacao+' '+s.bairro+' '+s.logradouro).includes(q));
    $('abrigo-status').textContent=`${rows.length} abrigo(s) cadastrado(s). Consulta à fonte em ${date(src('abrigos').collectedAt)}.`;
    rows.slice(0,shelterLimit).forEach(s=>{const c=card(root,s.designacao);c.append(el('p',s.bairro,'eyebrow'),el('p',s.logradouro),state('Abertura atual não confirmada',true),el('p','Último status cadastrado: '+(s.estado||'Não informado')+' · sem horário individual.','muted'));
      const phone=String(s.telefone||'').replace(/\D/g,'');if(phone.length>=10&&phone.length<=13){const a=el('a','Telefone cadastrado: '+s.telefone);a.href='tel:'+phone;c.append(a);}
      c.append(el('p','Confirme o acolhimento e as condições do caminho com a Defesa Civil.'),link('Abrir cadastro oficial ↗',BASE+'/p/abrigos'));});
    if(!rows.length)root.append(el('p','Nenhum abrigo encontrado no cadastro para esta busca.'));$('mais-abrigos').hidden=rows.length<=shelterLimit;
  }
  function dams(){const root=$('lista-barragens');root.replaceChildren();const rows=src('barragens').data;
    if(!Array.isArray(rows)||!rows.length){unavailable(root);return;}
    rows.forEach(s=>{const c=card(root,s.name),current=available('barragens')&&fresh(s.time);if(current)c.append(el('p',fmt(s.capacity)+'%','value'),el('p','Ocupação da capacidade informada pela fonte.'),el('p',s.gates));else unavailable(c);c.append(el('p','Leitura: '+date(s.time),'muted'));note(c,'barragens');});
  }
  function notices(){const local=$('aviso-local');local.replaceChildren(el('h3','Comunicados municipais'));
    local.append(el('p',available('aviso')?(src('aviso').data?.present?'A fonte municipal disponibiliza um aviso. Leia o comunicado completo e sua validade no AlertaBlu.':'O arquivo consultado não trouxe aviso. Confira os comunicados no AlertaBlu; isso não indica ausência de risco.'):'Consulta a comunicados indisponível ou antiga. Abra o AlertaBlu.'),link('Avisos meteorológicos do AlertaBlu ↗',BASE+'/p/aviso-meteorologico'));note(local,'aviso');
    const root=$('avisos-inmet');root.replaceChildren();
    if(!inmet?.complete||!fresh(inmet.collectedAt,180)||!Array.isArray(inmet.alerts)){root.append(el('p','Avisos INMET indisponíveis ou desatualizados.','notice'),link('Consultar INMET ↗','https://avisos.inmet.gov.br/'));return;}
    const active=inmet.alerts.filter(a=>a.cities?.includes('4202404')&&Date.parse(a.start)<=Date.now()&&Date.parse(a.end)>Date.now());
    active.forEach(a=>{const c=card(root,'INMET · '+a.event);c.append(el('p',({Moderate:'Perigo potencial',Severe:'Perigo',Extreme:'Grande perigo'}[a.severity]||'Severidade não informada')),el('p','Vigente até '+date(a.end)),link('Ler aviso original ↗',typeof a.url==='string'&&a.url.startsWith('https://avisos.inmet.gov.br/')?a.url:'https://avisos.inmet.gov.br/'));});
    if(!active.length)root.append(el('p',inmet.unmapped?'Há avisos sem associação municipal. Consulte o INMET.':'Nenhum aviso INMET vigente localizado para Blumenau nesta cópia. Ausência de aviso não garante ausência de risco.','notice'));
  }
  const resources=[
    ['Previsão detalhada','Previsão meteorológica produzida pela equipe municipal.','/p/detalhada'],
    ['Tendência de 15 dias','Consulte o horizonte e as incertezas na publicação oficial.','/p/15-dias'],
    ['Previsão hidrológica','Nível previsto e notas técnicas, quando publicados pelo AlertaBlu.','/d/nivel-do-rio'],
    ['Mapa de inundação','Camadas e cenários oficiais de inundação.','/m/inundacao'],
    ['Áreas de risco','Consulta geológica e hidrológica no mapa da Defesa Civil.','/m/risco'],
    ['Ruas alagadas','Confira as ocorrências divulgadas pelo município.','/p/ruas-alagadas'],
    ['Rotas de fuga','Acesse as indicações oficiais. O painel não calcula trajetos seguros.','/intranet/defesacivil/rotas/rotas2_mapa'],
    ['Diques','Informações oficiais sobre a infraestrutura de proteção.','/c/operacoes/diques'],
    ['Planos de contingência','Procedimentos e documentos para preparação.','/c/operacoes/planos_contingencia'],
    ['Histórico de enchentes','Registros publicados de eventos anteriores.','/p/enchentes'],
    ['Histórico de chuva','Resumos pluviométricos diários.','/d/resumo/pluviometrico/diario'],
    ['Aplicativo AlertaBlu','Alertas e serviços municipais no aplicativo oficial.','/c/meteorologia/aplicativo'],
    ['Alertas por SMS','Saiba como cadastrar o CEP nos canais oficiais.','/c/meteorologia/sms'],
    ['Cartilhas de prevenção','Orientações públicas de preparação e resposta.','/c/institucional/cartilhas'],
    ['Câmeras e imagens','Não foi identificada uma transmissão pública de câmera incorporável. Consulte os recursos visuais na origem.','/m/monitora']
  ];
  resources.forEach(([title,description,path])=>{const c=card($('recursos'),title);c.className+=' resource';c.append(el('p',description),link('Acessar fonte oficial ↗',BASE+path));});
  function render(){river();regions();stations();streets();shelters();dams();notices();const n=Object.keys(sources).filter(available).length;$('status').textContent=`${n} de 8 fontes com cópia recente. Verifique também o horário de cada dado.`;
    const root=$('fontes');root.replaceChildren();Object.entries(sources).forEach(([k,s])=>{const p=el('p',`${k} · ${date(s.collectedAt)} · ${s.ok?'coleta concluída':'última coleta falhou'} · `,'source-note');const path={rio:'/d/nivel-do-rio',chuva:'/m/monitora',situacao:'/m/monitora',temperatura:'/p/detalhada',abrigos:'/p/abrigos',aviso:'/p/aviso-meteorologico',cotas:'/p/cotas',barragens:'/d/barragens'}[k];if(path)p.append(link('Abrir fonte',BASE+path));root.append(p);});}
  async function get(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
  async function load(){if(loading)return;loading=true;$('atualizar').disabled=true;try{const [a,b]=await Promise.allSettled([get('../data/blumenau.json'),get('../data/avisos.json')]);sources=a.status==='fulfilled'&&a.value?.sources&&typeof a.value.sources==='object'?a.value.sources:{};inmet=b.status==='fulfilled'?b.value:null;render();}finally{loading=false;$('atualizar').disabled=false;}}
  [['estacao-busca',()=>{stationLimit=12;stations();}],['rua-busca',()=>{streetLimit=24;streets();}],['abrigo-busca',()=>{shelterLimit=12;shelters();}]].forEach(([id,fn])=>$(id).addEventListener('input',fn));
  $('estacao-tipo').addEventListener('change',()=>{stationLimit=12;stations();});
  $('mais-estacoes').addEventListener('click',()=>{stationLimit+=12;stations();});$('mais-ruas').addEventListener('click',()=>{streetLimit+=24;streets();});$('mais-abrigos').addEventListener('click',()=>{shelterLimit+=12;shelters();});$('atualizar').addEventListener('click',load);
  setInterval(()=>{if(!document.hidden)load();},300000);setInterval(()=>{if(!document.hidden)render();},60000);load();
})();
