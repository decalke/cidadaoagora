(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const num = x => typeof x === 'number' && Number.isFinite(x);
  const format = x => num(x) ? x.toLocaleString('pt-BR', {maximumFractionDigits: 2}) : '—';
  const date = x => Number.isFinite(Date.parse(x)) ? new Date(x).toLocaleString('pt-BR', {timeZone: 'America/Sao_Paulo'}) : 'Horário não informado';
  const fresh = (x, minutes) => { const age = Date.now() - Date.parse(x); return age >= 0 && age < minutes * 60000; };
  const names = {normalidade:'Normalidade', atencao:'Atenção', alerta:'Alerta', emergencia:'Emergência'};
  let snapshot = null, alerts = null, loading = false;
  function el(tag, text, cls) { const node = document.createElement(tag); if(text !== undefined) node.textContent = text; if(cls) node.className = cls; return node; }
  function link(text, url) { const a = el('a', text); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
  function valid(s, key) {
    const quality = s.qualidade?.[key];
    return fresh(snapshot?.collectedAt, 90) && fresh(s.medido_em, 60) &&
      (!quality || (quality.estado === 'atual' && fresh(quality.medido_em || s.medido_em, 60)));
  }
  function chart(s, card) {
    const points = (s.serie_12_h || []).filter(p => num(p.nivel_rio_m) && Number.isFinite(Date.parse(p.medido_em))).sort((a,b)=>Date.parse(a.medido_em)-Date.parse(b.medido_em));
    if(points.length < 2) return;
    const start = Date.parse(points[0].medido_em), end = Date.parse(points.at(-1).medido_em);
    if(end <= start) return;
    const low = Math.min(...points.map(p=>p.nivel_rio_m)), high = Math.max(...points.map(p=>p.nivel_rio_m));
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns,'svg');
    svg.setAttribute('viewBox','0 0 300 100'); svg.setAttribute('role','img');
    svg.setAttribute('aria-label',`Histórico recebido: mínimo ${format(low)} m e máximo ${format(high)} m. Consulte os valores na tabela.`);
    // Pontos independentes: não unir lacunas na série.
    points.forEach(p=>{const c=document.createElementNS(ns,'circle'); c.setAttribute('cx',String(8+(Date.parse(p.medido_em)-start)/(end-start)*284)); c.setAttribute('cy',String(90-(p.nivel_rio_m-low)/(high-low||1)*80)); c.setAttribute('r','2'); c.setAttribute('fill','currentColor'); svg.append(c);});
    card.append(svg,el('p',`${date(points[0].medido_em)} → ${date(points.at(-1).medido_em)}`, 'muted'));
    const details=el('details'), summary=el('summary','Consultar histórico recebido'), table=el('table');
    const head=el('tr');head.append(el('th','Data e hora'),el('th','Nível (m)'));table.append(head);
    points.slice().reverse().forEach(p=>{const row=el('tr');row.append(el('td',date(p.medido_em)),el('td',format(p.nivel_rio_m)));table.append(row);});details.append(summary,table);card.append(details);
  }
  function render() {
    const root=$('estacoes'); root.replaceChildren();
    const query=$('filtro').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const stations=(snapshot?.rios || []).filter(s=>(s.codigo+' '+s.nome).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query));
    stations.forEach(s=>{
      const card=el('article',undefined,'card'), current=valid(s,'nivel_rio_m') && num(s.nivel_rio_m);
      card.append(el('p',s.codigo,'eyebrow'),el('h3',s.nome));
      card.append(el('span',current ? (names[s.situacao] || 'Situação não informada') : 'Medição indisponível', 'badge '+(current && names[s.situacao] ? s.situacao : '')));
      card.append(el('p',current ? format(s.nivel_rio_m)+' m' : '—','value'));
      card.append(el('p',current ? ({subindo:'↑ Subindo',descendo:'↓ Descendo',estavel:'→ Estável'}[s.tendencia] || 'Tendência não informada') : 'Sem medição válida recente. Consulte a fonte oficial.'));
      card.append(el('p','Medição: '+date(s.medido_em),'muted'));
      if(current) {
        const thresholds=[['atencao_m','Atenção'],['alerta_m','Alerta'],['emergencia_m','Emergência']].filter(([k])=>num(s[k])).map(([k,n])=>n+': '+format(s[k])+' m');
        if(thresholds.length)card.append(el('p','Cotas oficiais desta estação · '+thresholds.join(' · '),'muted'));
        chart(s,card);
      }
      card.append(el('p','Fonte: '+(s.fonte || 'Defesa Civil de Itajaí'),'muted'));root.append(card);
    });
    if(!stations.length)root.append(el('p',snapshot ? 'Nenhuma estação encontrada para este filtro.' : 'Medições indisponíveis. Acesse o monitoramento oficial.'));
    const rain=$('pluviometros');rain.replaceChildren();
    (snapshot?.chuvas || []).forEach(s=>{
      const card=el('article',undefined,'card');card.append(el('p',s.codigo,'eyebrow'),el('h3',s.nome));
      const latest=(s.historico_monitoramento || []).filter(p=>fresh(p.medido_em,60)).sort((a,b)=>Date.parse(b.medido_em)-Date.parse(a.medido_em))[0];
      const values=el('div',undefined,'rain-values');
      [['chuva_1_h_mm','Última 1h'],['chuva_24_h_mm','Últimas 24h']].forEach(([key,label])=>{
        const p=el('p',label), sample=num(s[key])?s:latest;
        const ok=valid(s,key) && sample && fresh(sample.medido_em,60) && num(sample[key]);
        p.append(el('strong',ok ? format(sample[key])+' mm' : '—'));values.append(p);
      });
      card.append(values,el('p','Medição: '+date(s.medido_em),'muted'),el('p','— indica valor indisponível ou vencido.','muted'));rain.append(card);
    });
    if(!snapshot?.chuvas?.length)rain.append(el('p','Acumulados indisponíveis. Consulte os pluviômetros oficiais.'));
    const box=$('alertas');box.replaceChildren();
    if(!alerts?.complete || !fresh(alerts.collectedAt,180) || !Array.isArray(alerts.alerts))box.append(el('p','Cópia de avisos indisponível ou desatualizada. Consulte o INMET.','notice'));
    else {
      const active=alerts.alerts.filter(a=>a.cities?.includes('4208203') && Date.parse(a.start)<=Date.now() && Date.parse(a.end)>Date.now());
      active.forEach(a=>{const card=el('article',undefined,'card');card.append(el('h3',a.event),el('p',({Moderate:'Perigo potencial',Severe:'Perigo',Extreme:'Grande perigo'}[a.severity] || 'Severidade não informada')),el('p','Válido até '+date(a.end)),link('Ler aviso e orientações oficiais ↗', typeof a.url==='string' && a.url.startsWith('https://avisos.inmet.gov.br/') ? a.url : 'https://avisos.inmet.gov.br/'));box.append(card);});
      if(!active.length)box.append(el('p',alerts.unmapped ? 'Não foi possível associar todos os avisos aos municípios. Consulte o INMET.' : 'Nenhum aviso vigente localizado para Itajaí na cópia consultada. Isso não garante ausência de risco.','notice'));
      box.append(el('p','Fonte consultada em '+date(alerts.collectedAt),'muted'));
    }
    $('status').textContent=snapshot ? (fresh(snapshot.collectedAt,90) ? 'Cópia municipal coletada em ' : 'Cópia municipal desatualizada · ')+date(snapshot.collectedAt) : 'Fonte municipal indisponível neste painel.';
  }
  async function get(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);return r.json();}
  async function load(){if(loading)return;loading=true;$('atualizar').disabled=true;try{const results=await Promise.allSettled([get('../data/itajai.json'),get('../data/avisos.json')]);snapshot=results[0].status==='fulfilled'?results[0].value:null;alerts=results[1].status==='fulfilled'?results[1].value:null;render();}finally{loading=false;$('atualizar').disabled=false;}}
  $('filtro').addEventListener('input',render);$('atualizar').addEventListener('click',load);
  setInterval(()=>{if(!document.hidden)load();},300000);setInterval(render,60000);load();
})();
