/* Incorporação oficial Windy: nenhuma conexão externa antes da ativação. */
(() => {
  'use strict';
  const layers = {wind:'Vento previsto',rain:'Chuva e trovoadas previstas',temp:'Temperatura prevista'};
  document.querySelectorAll('[data-windy-map]').forEach(root => {
    const latitude=Number(root.dataset.lat),longitude=Number(root.dataset.lon),zoom=Number(root.dataset.zoom||9);
    if(!Number.isFinite(latitude)||latitude < -90||latitude > 90||!Number.isFinite(longitude)||longitude < -180||longitude > 180)return;
    const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
    const toolbar=el('div',undefined,'windy-toolbar'),label=el('label','Camada do mapa'),select=el('select');
    select.id=(root.id||'windy')+'-layer';label.htmlFor=select.id;
    Object.entries(layers).forEach(([value,text])=>{const option=el('option',text);option.value=value;select.append(option);});select.value='wind';label.append(select);
    const activate=el('button','Ativar mapa Windy'),close=el('button','Desativar mapa');activate.type=close.type='button';close.hidden=true;
    toolbar.append(label,activate,close);
    const status=el('p','O mapa está desativado. Ao ativá-lo, seu navegador se conecta ao Windy, que recebe dados de conexão e aplica sua política de privacidade.','windy-status');status.setAttribute('role','status');
    const holder=el('div',undefined,'windy-frame');holder.hidden=true;
    const external=el('a','Abrir esta região no Windy ↗');external.target='_blank';external.rel='noopener noreferrer';external.href=`https://www.windy.com/?${latitude},${longitude},${zoom}`;
    const privacy=el('a','Privacidade do Windy ↗');privacy.href='https://account.windy.com/agreements/privacy-policy';privacy.target='_blank';privacy.rel='noopener noreferrer';
    const links=el('p',undefined,'windy-links');links.append(external,privacy);
    root.append(toolbar,status,holder,links);
    let frame=null;
    function update(){
      if(!frame)return;
      const overlay=Object.hasOwn(layers,select.value)?select.value:'wind';
      const params=new URLSearchParams({type:'map',location:'coordinates',metricRain:'default',metricTemp:'default',metricWind:'default',zoom:String(zoom),overlay,product:'ecmwf',level:'surface',lat:String(latitude),lon:String(longitude)});
      status.textContent='Carregando '+layers[overlay].toLowerCase()+'…';
      frame.src='https://embed.windy.com/embed.html?'+params.toString();
      frame.title=`Mapa Windy · ${root.dataset.location||'região'} · ${layers[overlay]}`;
    }
    activate.addEventListener('click',()=>{
      if(frame)return;
      frame=el('iframe');frame.setAttribute('allowfullscreen','');frame.referrerPolicy='strict-origin-when-cross-origin';
      frame.addEventListener('load',()=>{status.textContent='Quadro do Windy carregado. Confira a camada, o horário e a legenda no mapa. Se ele não aparecer, use o link para abrir o Windy.';});
      holder.append(frame);holder.hidden=false;activate.hidden=true;close.hidden=false;update();
    });
    select.addEventListener('change',()=>{if(frame)update();});
    close.addEventListener('click',()=>{holder.replaceChildren();frame=null;holder.hidden=true;activate.hidden=false;close.hidden=true;status.textContent='Mapa desativado. Para voltar a consultar, clique em Ativar mapa Windy.';});
  });
})();
