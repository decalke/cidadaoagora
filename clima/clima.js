/* Protótipo inteiramente fictício. Não consulta APIs nem armazena buscas. */
(() => {
  'use strict';
  const labels = ['Normal', 'Atenção', 'Perigo', 'Sem dados'];
  const marks = ['●', '▲', '!', '—'];
  const states = window.CLIMA_DEMO.map(([id,name,pop,risk,...cities]) => ({id,name,pop,risk,cities}));
  const cities = states.flatMap(s => s.cities.map((name,i) => ({id:s.id+i,name,state:s.id,pop:+(s.pop*[.45,.2,.1][i]).toFixed(2),risk:i===0?s.risk:s.risk===3?3:(s.risk+i)%3})));
  const $ = id => document.getElementById(id);
  const fmt = n => n.toLocaleString('pt-BR',{maximumFractionDigits:2});
  const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let selected = null;
  let lastFocus;
  function split(items,x=0,y=0,w=100,h=100){
    if(items.length===1)return [{...items[0],x,y,w,h}];
    const total=items.reduce((s,a)=>s+a.pop,0);let n=1,part=items[0].pop;
    while(n<items.length-1&&part+items[n].pop<=total/2)part+=items[n++].pop;
    const r=part/total;
    return w>=h?[...split(items.slice(0,n),x,y,w*r,h),...split(items.slice(n),x+w*r,y,w*(1-r),h)]:[...split(items.slice(0,n),x,y,w,h*r),...split(items.slice(n),x,y+h*r,w,h*(1-r))];
  }
  function render(){
    const items=selected?cities.filter(c=>c.state===selected.id):states;
    const filter=+$('filtro').value;
    $('map-title').textContent=selected?selected.name:'Brasil em perspectiva';
    $('estado-atual').textContent=selected?' › '+selected.id:'';
    $('map-desc').textContent=selected?'Amostra de localidades · populações fictícias.':'Área dos blocos proporcional à população fictícia.';
    $('map-foot').textContent=selected?'Clique em uma localidade para ver detalhes. A amostra não representa todo o estado.':'Clique em um estado para explorar a amostra de cidades.';
    $('treemap').setAttribute('aria-label',selected?'Localidades de '+selected.name+' por população fictícia':'Estados por população fictícia');
    $('treemap').replaceChildren();$('lista').replaceChildren();
    split(items).forEach(t=>{
      const button=document.createElement('button');button.type='button';button.className='tile r'+t.risk+(filter!==-1&&filter!==t.risk?' dim':'');
      Object.assign(button.style,{left:t.x+'%',top:t.y+'%',width:t.w+'%',height:t.h+'%'});
      const text=`${t.name}: ${labels[t.risk]}; população fictícia ${fmt(t.pop)} milhões`;
      button.title=text;button.setAttribute('aria-label',text+'. Abrir '+(selected?'detalhes':'localidades'));
      const strong=document.createElement('strong');strong.textContent=selected?t.name:t.id;button.append(strong);
      const meta=document.createElement('small');meta.textContent=marks[t.risk]+' '+labels[t.risk];button.append(meta);
      if(t.w>16&&t.h>19){const name=document.createElement('span');name.textContent=(selected?'':t.name+' · ')+fmt(t.pop)+' mi hab.';button.append(name)}
      const action=()=>{if(selected)openCity(t);else{selected=t;$('filtro').value=-1;render();$('brasil').focus()}};
      button.addEventListener('click',action);$('treemap').append(button);
      if(filter===-1||filter===t.risk){const row=document.createElement('button');row.type='button';row.textContent=marks[t.risk]+' '+text;row.addEventListener('click',action);$('lista').append(row)}
    });
  }
  function openCity(city){
    lastFocus=document.activeElement;
    const content=$('cidade-detalhes');content.replaceChildren();
    const title=document.createElement('h2');title.id='cidade-titulo';title.textContent=city.name+' / '+city.state;content.append(title);
    const status=document.createElement('div');status.className='city-status r'+city.risk;status.textContent=marks[city.risk]+' '+labels[city.risk];content.append(status);
    const population=document.createElement('p');population.textContent='População fictícia: '+fmt(city.pop)+' milhões de habitantes.';content.append(population);
    if(city.risk===3){const missing=document.createElement('p');missing.textContent='Indicadores indisponíveis nesta simulação. Ausência de dados não significa ausência de risco.';content.append(missing)}else{
      const metrics=document.createElement('div');metrics.className='city-metrics';
      [['Temperatura fictícia',city.risk===2?'36 °C':'28 °C'],['Chuva fictícia em 24h',city.risk===2?'95 mm':'18 mm']].forEach(([label,value])=>{const box=document.createElement('div');box.textContent=label;const strong=document.createElement('strong');strong.textContent=value;box.append(strong);metrics.append(box)});content.append(metrics);
      const desc=document.createElement('p');desc.textContent=['Condições sem risco elevado identificado na simulação.','Condições fictícias que pedem acompanhamento.','Cenário fictício de risco elevado por calor ou chuva intensa, conforme a região.'][city.risk];content.append(desc);
    }
    const advice=document.createElement('p');advice.textContent='Para uma situação real, consulte os canais oficiais de meteorologia e da Defesa Civil do seu município.';content.append(advice);
    $('detalhes').showModal();$('fechar').focus();
  }
  function search(){
    const query=norm($('busca').value.trim());$('resultados').replaceChildren();if(!query)return;
    const matches=cities.filter(c=>norm(c.name+' '+c.state).includes(query));
    const summary=document.createElement('p');summary.className='small';summary.textContent=matches.length?matches.length+' resultado(s) na amostra.': 'Nenhuma localidade encontrada. Experimente Manaus ou São Paulo.';$('resultados').append(summary);
    matches.slice(0,12).forEach(c=>{const b=document.createElement('button');b.type='button';const name=document.createElement('strong');name.textContent=c.name+' / '+c.state;const label=document.createElement('span');label.textContent=marks[c.risk]+' '+labels[c.risk];b.append(name,label);b.addEventListener('click',()=>{selected=states.find(s=>s.id===c.state);$('filtro').value=-1;render();openCity(c)});$('resultados').append(b)});
    if(matches.length>12){const hint=document.createElement('p');hint.textContent='Mostrando os primeiros 12 resultados. Digite mais letras para refinar.';$('resultados').append(hint)}
  }
  $('count-perigo').textContent=states.filter(s=>s.risk===2).length+' / 27';
  $('count-atencao').textContent=states.filter(s=>s.risk===1).length+' / 27';
  $('brasil').addEventListener('click',()=>{selected=null;$('filtro').value=-1;render()});
  $('filtro').addEventListener('change',render);
  $('busca').addEventListener('input',search);
  $('buscar').addEventListener('click',()=>{search();$('resultados').querySelector('button')?.focus()});
  $('busca').addEventListener('keydown',e=>{if(e.key==='Enter'){$('buscar').click()}if(e.key==='Escape'){$('busca').value='';search()}});
  $('fechar').addEventListener('click',()=>$('detalhes').close());
  $('detalhes').addEventListener('close',()=>lastFocus?.focus());
  $('detalhes').addEventListener('click',e=>{if(e.target===$('detalhes')){const r=$('detalhes').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detalhes').close()}});
  ['RS','AM','RJ','PA'].forEach((uf,i)=>{const c=cities.find(city=>city.state===uf);const b=document.createElement('button');b.type='button';b.className='alert';const small=document.createElement('small');small.textContent='! PERIGO · SIMULAÇÃO';const name=document.createElement('strong');name.textContent=c.name+' / '+uf;const p=document.createElement('p');p.textContent=['Chuva intensa e possibilidade de alagamentos.','Calor intenso e redução do nível dos rios.','Chuva intensa e risco de deslizamentos.','Chuvas persistentes e risco de inundação.'][i];const link=document.createElement('span');link.textContent='Ver detalhes fictícios →';b.append(small,name,p,link);b.addEventListener('click',()=>openCity(c));$('alert-list').append(b)});

  const scenarios={
    moderado:{title:'Aquecimento moderado',temp:28.4,values:[.2,.4,.7,.9,1.2,1.4],prob:[70,20,10]},
    intenso:{title:'Super El Niño · aquecimento intenso',temp:29.6,values:[.4,.8,1.3,1.8,2.2,2.6],prob:[85,10,5]}
  };
  function scenarioChange(){
    const key=document.querySelector('input[name="cenario"]:checked').value;
    const s=scenarios[key],months=['Junho','Julho','Agosto','Setembro','Outubro','Novembro'];
    $('resumo-cenario').textContent=key==='intenso'?'Aquecimento intenso':'Aquecimento moderado';
    $('pacifico-temp').textContent=fmt(s.temp)+' °C';
    $('pacifico-anomalia').textContent='+'+fmt(s.values.at(-1))+' °C';
    $('cenario-titulo').textContent=s.title+' · simulação';
    const points=s.values.map((v,i)=>(i?'L':'M')+(30+i*89)+' '+(140-v/3*120)).join('');
    $('grafico-linha').setAttribute('d',points);$('grafico-area').setAttribute('d',points+'L475 140H30Z');
    const series=s.values.map((v,i)=>months[i]+': +'+fmt(v)+' °C').join('; ');
    $('serie-valores').textContent=series+'. Todos os valores são fictícios.';
    $('grafico-descricao').textContent='Série fictícia. '+series;
    $('prob-legenda').replaceChildren();
    ['nino','neutro','nina'].forEach((name,i)=>{
      $('prob-'+name).style.width=s.prob[i]+'%';
      const li=document.createElement('li');li.textContent=['El Niño','Neutro','La Niña'][i]+': '+s.prob[i]+'%';$('prob-legenda').append(li);
    });
  }
  document.querySelectorAll('input[name="cenario"]').forEach(input=>input.addEventListener('change',scenarioChange));
  scenarioChange();
  render();window.lucide?.createIcons();
})();
