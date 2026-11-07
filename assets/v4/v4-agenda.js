/* Agenda local. Exportação de eventos de dia inteiro conforme RFC 5545. */
(() => {
  'use strict';
  const CATEGORIES={conta:'Conta',documento:'Documento',trabalho:'Trabalho',estudo:'Estudo',outro:'Outro compromisso'};
  const validDate=value=>{
    if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
    const [year,month,day]=value.split('-').map(Number);if(year<1900||year>9998||month<1||month>12||day<1)return false;
    const max=[31,year%4===0&&(year%100!==0||year%400===0)?29:28,31,30,31,30,31,31,30,31,30,31][month-1];return day<=max;
  };
  const nextDate=value=>{if(!validDate(value))throw Error('Data inválida');const [y,m,d]=value.split('-').map(Number),date=new Date(Date.UTC(y,m-1,d+1));return date.toISOString().slice(0,10);};
  const escapeText=value=>String(value).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').replace(/\\/g,'\\\\').replace(/\r\n|\n|\r/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
  function foldLine(value){
    const encoder=new TextEncoder();let line='',bytes=0,result=[];
    for(const char of value){const size=encoder.encode(char).length;if(bytes+size>75){result.push(line);line=' ';bytes=1;}line+=char;bytes+=size;}
    result.push(line);return result.join('\r\n');
  }
  function normalize(input){
    if(!Array.isArray(input))return [];
    const ids=new Set(),result=[];
    for(const x of input.slice(0,500)){
      if(!x||typeof x.id!=='string'||!/^[a-zA-Z0-9-]{1,80}$/.test(x.id)||ids.has(x.id)||typeof x.title!=='string'||!x.title.trim()||x.title.length>120||!validDate(x.date)||!Object.hasOwn(CATEGORIES,x.category)||typeof x.note!=='string'||x.note.length>600||typeof x.done!=='boolean')continue;
      ids.add(x.id);result.push({id:x.id,title:x.title.trim(),date:x.date,category:x.category,note:x.note,done:x.done});
    }
    return result;
  }
  function calendar(input,now=new Date()){
    const items=normalize(input).filter(x=>!x.done).sort((a,b)=>a.date.localeCompare(b.date));
    if(!items.length)throw Error('Sem compromissos pendentes para exportar.');
    const dtstamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
    const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Cidadao Agora//Agenda Cidada//PT-BR','CALSCALE:GREGORIAN'];
    items.forEach(x=>lines.push('BEGIN:VEVENT','UID:'+x.id+'@agenda.cidadaoagora.com.br','DTSTAMP:'+dtstamp,'DTSTART;VALUE=DATE:'+x.date.replace(/-/g,''),'DTEND;VALUE=DATE:'+nextDate(x.date).replace(/-/g,''),'SUMMARY:'+escapeText(x.title),'DESCRIPTION:'+escapeText(CATEGORIES[x.category]+(x.note?'\n'+x.note:'')),'TRANSP:TRANSPARENT','END:VEVENT'));
    lines.push('END:VCALENDAR');return lines.map(foldLine).join('\r\n')+'\r\n';
  }
  if(typeof module!=='undefined'&&module.exports){module.exports={validDate,nextDate,escapeText,foldLine,normalize,calendar};return;}
  if(!document.querySelector('[data-agenda]'))return;
  const $=id=>document.getElementById(id),KEY='cidadao_agenda_v1';let items=[],persist=false;
  const status=text=>$('agenda-status').textContent=text;
  const dateLabel=value=>{const [y,m,d]=value.split('-');return `${d}/${m}/${y}`;};
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
  function storageMessage(text){$('agenda-storage-status').textContent=text;}
  function save(){
    if(!persist)return;
    try{localStorage.setItem(KEY,JSON.stringify(items));storageMessage('Salvo neste navegador. Os registros não são sincronizados com outros aparelhos.');}
    catch{storageMessage('O navegador não permitiu salvar. As alterações atuais ficarão apenas nesta página; baixe o calendário antes de fechar.');}
  }
  function render(focus=null){
    const list=$('agenda-list');list.replaceChildren();const filter=$('agenda-filter').value,sorted=items.slice().sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title,'pt-BR'));
    const visible=sorted.filter(x=>filter==='todos'||(filter==='concluidos'?x.done:!x.done)),pending=items.filter(x=>!x.done),past=pending.filter(x=>x.date<today()).length;
    $('agenda-summary').textContent=`${pending.length} pendente(s), ${items.length-pending.length} concluído(s)${past?' · '+past+' com data anterior a hoje':''}.`;
    $('agenda-export').disabled=!pending.length;$('agenda-clear').disabled=!items.length;
    if(!visible.length){const p=document.createElement('p');p.className='agenda-empty';p.textContent=items.length?'Nenhum registro neste filtro.':'Sua agenda está vazia. Adicione seu primeiro compromisso.';list.append(p);}
    const actionButtons=new Map();
    visible.forEach((x,index)=>{
      const row=document.createElement('article');row.className='agenda-item'+(x.done?' done':'');const content=document.createElement('div'),title=document.createElement('h3'),meta=document.createElement('p'),note=document.createElement('p'),actions=document.createElement('div');title.textContent=x.title;
      const time=document.createElement('time');time.dateTime=x.date;time.className='agenda-date';time.textContent=dateLabel(x.date);const category=document.createElement('span');category.className='agenda-tag';category.textContent=CATEGORIES[x.category];meta.append(time,category);note.textContent=x.note;
      if(!x.done&&x.date<today()){const old=document.createElement('p');old.textContent='Data anterior a hoje · confira se já foi resolvido.';content.append(old);}
      content.prepend(title,meta);if(x.note)content.append(note);actions.className='agenda-actions';
      const neighbor=visible[index+1]?.id||visible[index-1]?.id;
      const toggle=document.createElement('button');toggle.type='button';toggle.textContent=x.done?'Reabrir':'Marcar concluído';toggle.setAttribute('aria-label',(x.done?'Reabrir ':'Marcar concluído: ')+x.title);toggle.addEventListener('click',()=>{x.done=!x.done;save();render({id:x.id,alternateId:neighbor,action:'toggle'});status(x.done?'Compromisso concluído.':'Compromisso reaberto.');});
      const remove=document.createElement('button');remove.type='button';remove.textContent='Excluir';remove.setAttribute('aria-label','Excluir '+x.title);remove.addEventListener('click',()=>{items=items.filter(y=>y.id!==x.id);save();render({id:neighbor,action:'remove'});status('Compromisso excluído.');});actions.append(toggle,remove);row.append(content,actions);list.append(row);actionButtons.set(x.id,{toggle,remove});
    });
    if(focus?.action){const target=actionButtons.get(focus.id)||actionButtons.get(focus.alternateId)||actionButtons.values().next().value; (target?.[focus.action]||$('agenda-title')).focus();}
  }
  try{const raw=localStorage.getItem(KEY);if(raw!==null){const parsed=JSON.parse(raw);items=normalize(parsed);persist=true;$('agenda-save').checked=true;storageMessage('Agenda carregada deste navegador. O salvamento local está ativado.');if(!Array.isArray(parsed)||items.length!==parsed.length)status('Alguns registros salvos eram inválidos e foram desconsiderados.');}}
  catch{storageMessage('Não foi possível ler uma agenda salva. Você pode usar esta página sem salvar.');}
  $('agenda-form').addEventListener('submit',e=>{
    e.preventDefault();if(items.length>=500){status('Limite de 500 registros atingido. Exclua os que não precisa mais.');return;}
    const title=$('agenda-title').value.trim(),date=$('agenda-date').value,category=$('agenda-category').value,note=$('agenda-note').value;
    if(!title||title.length>120||!validDate(date)||!Object.hasOwn(CATEGORIES,category)||note.length>600){status('Informe um título, uma data válida e uma categoria.');return;}
    const id=globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
    items.push({id,title,date,category,note,done:false});save();render();$('agenda-form').reset();$('agenda-title').focus();status('Compromisso adicionado.');
  });
  $('agenda-save').addEventListener('change',()=>{persist=$('agenda-save').checked;if(persist)save();else{try{localStorage.removeItem(KEY);storageMessage('Salvamento desativado e cópia salva removida. Os registros atuais ficam apenas nesta página.');}catch{storageMessage('Salvamento desativado, mas não foi possível remover a cópia anterior. Apague os dados deste site nas configurações do navegador.');}}});
  $('agenda-filter').addEventListener('change',render);
  $('agenda-clear').addEventListener('click',()=>{$('agenda-clear-confirm').hidden=false;$('agenda-clear-yes').focus();});
  $('agenda-clear-no').addEventListener('click',()=>{$('agenda-clear-confirm').hidden=true;$('agenda-clear').focus();});
  $('agenda-clear-yes').addEventListener('click',()=>{
    items=[];persist=false;$('agenda-save').checked=false;let erased=true;
    try{localStorage.removeItem(KEY);storageMessage('Cópia salva removida. O salvamento local está desativado.');}
    catch{erased=false;storageMessage('Não foi possível remover a cópia salva. Apague os dados deste site nas configurações do navegador.');}
    render();$('agenda-clear-confirm').hidden=true;status(erased?'Todos os registros desta agenda foram apagados.':'Registros removidos desta página; a cópia salva não pôde ser apagada.');$('agenda-title').focus();
  });
  $('agenda-export').addEventListener('click',()=>{try{const blob=new Blob([calendar(items)],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='minha-agenda-cidada.ics';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Calendário baixado. Importe o arquivo no seu aplicativo e configure os lembretes lá.');}catch(error){status(error.message||'Não foi possível baixar o calendário.');}});
  render();
})();
