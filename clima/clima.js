/* Dados oficiais: IBGE, INMET e NOAA. Sem dados meteorológicos simulados. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const labels=['Sem aviso localizado','Perigo potencial','Perigo / grande perigo','Indisponível'];
  const marks=['●','▲','!','—'];
  const fmt=n=>Number(n).toLocaleString('pt-BR');
  const norm=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const date=s=>new Date(s).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'});
  let states=[],cities=[],snapshot=null,selected=null,lastFocus,requestVersion=0;
  const active=a=>Date.parse(a.start)<=Date.now()&&Date.parse(a.end)>Date.now();
  const fresh=()=>snapshot?.complete&&Date.now()-Date.parse(snapshot.collectedAt)>=0&&Date.now()-Date.parse(snapshot.collectedAt)<3*3600000;
  const severity=a=>({Moderate:1,Severe:2,Extreme:2})[a.severity]??3;
  const cityAlerts=c=>snapshot?.alerts?.filter(a=>a.cities.includes(c.id)&&active(a))||[];
  function cityRisk(c){if(!fresh())return 3;const found=cityAlerts(c);if(found.length)return Math.max(...found.map(severity));return snapshot.unmapped?3:0}
  function stateRisk(s){if(!fresh())return 3;const values=cities.filter(c=>c.uf===s.uf).map(cityRisk);return values.includes(2)?2:values.includes(1)?1:values.includes(3)?3:0}
  function split(items,x=0,y=0,w=100,h=100){if(items.length===1)return[{...items[0],x,y,w,h}];if(!items.length)return[];const total=items.reduce((s,a)=>s+a.pop,0);let n=1,part=items[0].pop;while(n<items.length-1&&part+items[n].pop<=total/2)part+=items[n++].pop;const r=part/total;return w>=h?[...split(items.slice(0,n),x,y,w*r,h),...split(items.slice(n),x+w*r,y,w*(1-r),h)]:[...split(items.slice(0,n),x,y,w,h*r),...split(items.slice(n),x,y+h*r,w,h*(1-r))]}
  function el(tag,text,cls){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(cls)node.className=cls;return node}
  function sourceLink(text,url){const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a}
  function render(){
    const items=(selected?cities.filter(c=>c.uf===selected.uf):states).map(t=>({...t,risk:selected?cityRisk(t):stateRisk(t)})).sort((a,b)=>b.pop-a.pop);
    $('map-title').textContent=selected?selected.name:'Brasil · avisos INMET';$('estado-atual').textContent=selected?' › '+selected.uf:'';
    $('map-desc').textContent='Área proporcional à população residente · Censo IBGE 2022.';
    $('map-foot').textContent=selected?'A cor considera avisos vigentes associados pelo INMET ao código do município.':'A cor do estado resume o aviso vigente mais grave localizado em seus municípios.';
    $('treemap').replaceChildren();$('lista').replaceChildren();const filter=+$('filtro').value;
    split(items).forEach(t=>{
      const text=t.name+' · '+labels[t.risk]+' · '+fmt(t.pop)+' habitantes';
      const b=el('button',undefined,'tile r'+t.risk+(filter!==-1&&filter!==t.risk?' dim':''));b.type='button';b.title=text;b.setAttribute('aria-label',text);
      Object.assign(b.style,{left:t.x+'%',top:t.y+'%',width:t.w+'%',height:t.h+'%'});
      if(t.w>5&&t.h>7)b.append(el('strong',selected?t.name:t.uf));
      if(t.w>14&&t.h>16)b.append(el('small',marks[t.risk]+' '+labels[t.risk]),el('small',fmt(t.pop)+' hab.'));
      const action=()=>{if(selected)openCity(t);else{selected=t;$('filtro').value=-1;render();$('brasil').focus()}};b.addEventListener('click',action);$('treemap').append(b);
      if(filter===-1||filter===t.risk){const row=el('button',marks[t.risk]+' '+text);row.type='button';row.addEventListener('click',action);$('lista').append(row)}
    });
    $('count-perigo').textContent=fresh()?states.filter(s=>stateRisk(s)===2).length+' / 27':'—';
    $('count-atencao').textContent=fresh()?states.filter(s=>stateRisk(s)===1).length+' / 27':'—';
    $('data-status').textContent=snapshot?'INMET consultado em '+date(snapshot.collectedAt)+(fresh()?' · atualização periódica':' · cópia desatualizada; classificação indisponível'):'Avisos INMET indisponíveis. Consulte a fonte oficial.';
  }
  function alertBlock(a){const box=el('details',undefined,'official-alert');box.append(el('summary',a.event+' · '+({Moderate:'Perigo potencial',Severe:'Perigo',Extreme:'Grande perigo'}[a.severity]||a.severity)),el('p','Validade: '+date(a.start)+' até '+date(a.end)),el('p',a.description),el('p',a.instruction),sourceLink('Consultar aviso original no INMET →',a.url));return box}
  async function openCity(c){
    lastFocus=document.activeElement;const version=++requestVersion,content=$('cidade-detalhes');content.replaceChildren();content.append(el('h2',c.name+' / '+c.uf));content.firstChild.id='cidade-titulo';
    const risk=cityRisk(c);content.append(el('div',marks[risk]+' '+labels[risk],'city-status r'+risk),el('p','População residente: '+fmt(c.pop)+' · IBGE, Censo 2022.'));
    if(risk===0)content.append(el('p','Nenhum aviso vigente foi localizado para este código no feed consultado. Isso não é garantia de ausência de risco.'));
    if(risk===3)content.append(el('p','Não foi possível confirmar a situação dos avisos. Consulte diretamente o INMET e a Defesa Civil local.'));
    cityAlerts(c).forEach(a=>content.append(alertBlock(a)));
    const upcoming=(snapshot?.alerts||[]).filter(a=>a.cities.includes(c.id)&&Date.parse(a.start)>Date.now()&&Date.parse(a.end)>Date.now());
    if(fresh()&&upcoming.length){content.append(el('h3','Avisos com início futuro'));upcoming.forEach(a=>content.append(alertBlock(a)))}
    const forecast=el('section');forecast.append(el('h3','Previsão do INMET'),el('p','Consultando a fonte oficial…'));content.append(forecast);content.insertBefore(forecast,content.children[3]||null);
    $('detalhes').showModal();$('fechar').focus();
    try{
      const response=await fetch('https://apiprevmet3.inmet.gov.br/previsao/'+encodeURIComponent(c.id),{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Fonte indisponível');const json=await response.json();
      if(version!==requestVersion)return;const days=json[c.id];if(!days||typeof days!=='object')throw Error('Previsão não encontrada');
      forecast.replaceChildren(el('h3','Previsão do INMET'));
      const entries=Object.entries(days).filter(([key])=>/^\d{2}\/\d{2}\/\d{4}$/.test(key)).sort(([a],[b])=>a.split('/').reverse().join('-').localeCompare(b.split('/').reverse().join('-')));
      const today=new Date().toLocaleDateString('en-CA',{timeZone:'America/Sao_Paulo'});let count=0;
      for(const [day,value]of entries){const iso=day.split('/').reverse().join('-');if(iso<today)continue;const periods=value.manha||value.tarde||value.noite?Object.entries(value).filter(([key])=>['manha','tarde','noite'].includes(key)):[['dia',value]];
        const card=el('details',undefined,'forecast-day');card.open=count===0;card.append(el('summary',day));
        for(const [period,p]of periods){if(!p||typeof p!=='object')continue;const heading={manha:'Manhã',tarde:'Tarde',noite:'Noite',dia:'Dia'}[period];card.append(el('p',heading+': '+(p.resumo||'Descrição não informada')));const number=n=>n!==null&&n!==''&&n!==undefined&&Number.isFinite(Number(n))?String(n)+' °C':'não informada';card.append(el('p','Mínima: '+number(p.temp_min)+' · Máxima: '+number(p.temp_max)));if(p.int_vento)card.append(el('p','Vento: '+p.int_vento+(p.dir_vento?' · '+p.dir_vento:'')));}
        forecast.append(card);count++;
      }
      if(!count)throw Error('Sem previsão válida para hoje ou dias seguintes');
      forecast.append(el('p','Consultado em '+date(new Date().toISOString())+'. Valores previstos, não medições de estação.'),sourceLink('Fonte: INMET · previsão por município','https://portal.inmet.gov.br/'));
    }catch(error){if(version!==requestVersion)return;forecast.replaceChildren(el('h3','Previsão do INMET'),el('p','Previsão indisponível no momento. Nenhum valor foi estimado pelo portal.'),sourceLink('Consultar o INMET','https://portal.inmet.gov.br/'))}
  }
  function search(){const q=norm($('busca').value.trim());$('resultados').replaceChildren();if(q.length<2)return;const matches=cities.filter(c=>norm(c.name+' '+c.uf+' '+c.id).includes(q));$('resultados').append(el('p',matches.length+' município(s) na base do Censo 2022.','small'));matches.slice(0,15).forEach(c=>{const b=el('button');b.type='button';b.append(el('strong',c.name+' / '+c.uf),el('span',labels[cityRisk(c)]));b.addEventListener('click',()=>{selected=states.find(s=>s.uf===c.uf);$('filtro').value=-1;render();openCity(c)});$('resultados').append(b)});if(matches.length>15)$('resultados').append(el('p','Digite mais letras para refinar os 15 resultados exibidos.','small'))}
  function showAlerts(){const target=$('alert-list');target.replaceChildren();if(!fresh()){target.append(el('p','Avisos indisponíveis ou cópia desatualizada. Consulte a fonte oficial.','notice'));return}const list=snapshot.alerts.filter(active).sort((a,b)=>severity(b)-severity(a));if(!list.length)target.append(el('p','Nenhum aviso vigente no feed consultado. Isso não garante ausência de risco.','notice'));list.slice(0,8).forEach(a=>{const card=el('div',undefined,'alert');card.append(sourceLink(a.event+' · '+({Moderate:'Perigo potencial',Severe:'Perigo',Extreme:'Grande perigo'}[a.severity]||a.severity),a.url),el('p',a.area||'Veja a área no aviso original.'),el('p','Até '+date(a.end)));target.append(card)});if(list.length>8)target.append(sourceLink('Ver todos os avisos no INMET →','https://avisos.inmet.gov.br/'))}
  async function load(){
    try{const r=await fetch('data/municipios.json',{cache:'no-cache'});if(!r.ok)throw Error();const data=await r.json();states=data.states;cities=data.cities;$('total-municipios').textContent=fmt(cities.length)+' municípios / unidades estatísticas · Censo 2022';$('busca-ajuda').textContent='Busque por nome, UF ou código IBGE. População: Censo 2022.'}catch{$('data-status').textContent='Base de municípios indisponível. Tente recarregar a página.';return}
    try{const r=await fetch('data/avisos.json',{cache:'no-cache'});if(!r.ok)throw Error();snapshot=await r.json()}catch{snapshot=null}
    render();showAlerts();search();
    try{const r=await fetch('data/enso.json',{cache:'no-cache'});if(!r.ok)throw Error();const e=await r.json();if(!e.source.startsWith('https://www.cpc.ncep.noaa.gov/'))throw Error();const statuses={'El Niño Advisory':'El Niño · aviso NOAA','La Niña Advisory':'La Niña · aviso NOAA','El Niño Watch':'El Niño · monitoramento NOAA','La Niña Watch':'La Niña · monitoramento NOAA','Not Active':'Sem aviso ENSO ativo'};const issued=Date.parse(e.issued+'T12:00:00Z');const aged=Date.now()-issued>45*86400000;const title=statuses[e.status]||'Consultar boletim oficial';$('resumo-cenario').textContent=aged?'Boletim desatualizado':title;$('enso-status').textContent=title;$('enso-issued').textContent='Boletim de '+new Date(issued).toLocaleDateString('pt-BR',{timeZone:'UTC'})+' · fonte consultada em '+date(e.collectedAt)+(aged?' · consulte a NOAA para atualização':'');$('enso-source').href=e.source}catch{$('resumo-cenario').textContent='Indisponível';$('enso-status').textContent='Não foi possível carregar o boletim oficial.'}
  }
  $('brasil').addEventListener('click',()=>{selected=null;$('filtro').value=-1;render()});$('filtro').addEventListener('change',render);$('busca').addEventListener('input',search);$('buscar').addEventListener('click',()=>{search();$('resultados').querySelector('button')?.focus()});$('busca').addEventListener('keydown',e=>{if(e.key==='Enter')$('buscar').click();if(e.key==='Escape'){$('busca').value='';search()}});$('fechar').addEventListener('click',()=>$('detalhes').close());$('detalhes').addEventListener('close',()=>{requestVersion++;lastFocus?.focus()});$('atualizar').addEventListener('click',load);
  setInterval(()=>{if(cities.length){render();showAlerts()}},60000);
  load();window.lucide?.createIcons();
})();
