const assert=require('node:assert/strict');
const {validDate,nextDate,escapeText,foldLine,normalize,calendar}=require('../assets/v4/v4-agenda.js');
assert(validDate('2028-02-29'));
for(const value of ['2026-02-29','2026-04-31','2000-00-20','2000-01-00','2026-1-01','2026-01-01T00:00:00Z','1800-01-01','9999-12-31','<script>',null])assert(!validDate(value),String(value));
assert.equal(nextDate('2026-12-31'),'2027-01-01');
assert.equal(nextDate('2028-02-28'),'2028-02-29');
assert.equal(nextDate('2028-02-29'),'2028-03-01');
assert.equal(nextDate('2026-02-28'),'2026-03-01');
const item={id:'test-id',title:'Conta de luz',date:'2026-11-07',category:'conta',note:'Conferir valores',done:false};
assert.equal(normalize([item,item]).length,1);
assert.equal(normalize([{...item,id:'a\r\nBEGIN:VEVENT'},item]).length,1);
assert.equal(normalize([{...item,date:'2026-02-30'}]).length,0);
assert.deepEqual(normalize([{...item,date:'2026-02-30'},item]),[item],'Um registro corrompido não consome o ID de um posterior válido');
assert.deepEqual(normalize([{...item,title:''},item]),[item]);
assert.deepEqual(normalize({}),[]);
assert.equal(escapeText('a,b;c\\d\r\nBEGIN:VEVENT'),'a\\,b\\;c\\\\d\\nBEGIN:VEVENT');
const malicious={...item,title:'Conta\r\nBEGIN:VEVENT',note:'Pagar, conferir; comprovante\\arquivo\nEND:VEVENT'};
const ics=calendar([malicious,{...item,id:'done',done:true}],new Date('2026-11-07T17:00:00Z'));
assert(ics.includes('DTSTART;VALUE=DATE:20261107\r\n'));
assert(ics.includes('DTEND;VALUE=DATE:20261108\r\n'));
assert(ics.includes('DTSTAMP:20261107T170000Z\r\n'));
assert.equal(ics.match(/^BEGIN:VEVENT$/gm).length,1);
assert.equal(ics.match(/^END:VEVENT$/gm).length,1);
assert(!ics.includes('VALARM'));
assert(!ics.includes('TZID'));
assert(!ics.includes('done@'));
assert(ics.endsWith('END:VCALENDAR\r\n'));
assert.throws(()=>calendar([{...item,done:true}]));
const value='SUMMARY:'+('á😀'.repeat(90));
const folded=foldLine(value);
for(const line of folded.split('\r\n'))assert(Buffer.byteLength(line,'utf8')<=75);
assert.equal(folded.replace(/\r\n /g,''),value);
console.log('PASS: agenda, datas civis, anos bissextos, virada do ano, IDs, eventos de dia inteiro, escape e dobramento UTF-8 do ICS.');

// Integração com formulário, opt-in e falhas do armazenamento, sem rede.
const fs=require('node:fs'),vm=require('node:vm');
class Node{
 constructor(){this.children=[];this.value='';this.events={};this.textContent='';this.checked=false;}
 append(...nodes){this.children.push(...nodes);}
 prepend(...nodes){this.children.unshift(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(){}
 addEventListener(event,fn){this.events[event]=fn;}
  focus(){Node.lastFocused=this;}
 reset(){}
}
function interfaceRun(blocked=false){
 const nodes={};for(const match of fs.readFileSync('servicos/agenda-cidada.html','utf8').matchAll(/id="([^"]+)"/g))nodes[match[1]]=new Node();nodes['agenda-filter'].value='pendentes';
 const store=new Map(),writes=[];
 const storage={getItem:k=>{if(blocked)throw Error('bloqueado');return store.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error('bloqueado');writes.push(v);store.set(k,v);},removeItem:k=>{if(blocked)throw Error('bloqueado');store.delete(k);}};
 const document={querySelector:()=>new Node(),getElementById:id=>{assert(nodes[id],id);return nodes[id];},createElement:()=>new Node(),body:new Node()};
 vm.runInNewContext(fs.readFileSync('assets/v4/v4-agenda.js','utf8'),{document,localStorage:storage,TextEncoder,Date,Math,Number,Object,Set,Error});
 nodes['agenda-title'].value='Conta de água';nodes['agenda-date'].value='2026-12-15';nodes['agenda-category'].value='conta';nodes['agenda-note'].value='<script>não executa</script>';
 nodes['agenda-form'].events.submit({preventDefault(){}});
 assert(nodes['agenda-summary'].textContent.includes('1 pendente'));
 assert.equal(writes.length,0,'Só grava após optar pelo salvamento');
 nodes['agenda-save'].checked=true;nodes['agenda-save'].events.change();
 if(blocked)assert(nodes['agenda-storage-status'].textContent.includes('não permitiu salvar'));
 else assert.equal(writes.length,1);
 const row=nodes['agenda-list'].children[0],toggle=row.children[1].children[0];toggle.events.click();
 assert(nodes['agenda-summary'].textContent.includes('1 concluído'));
 assert.equal(nodes['agenda-export'].disabled,true);
 nodes['agenda-clear'].events.click();assert.equal(nodes['agenda-clear-confirm'].hidden,false);
 nodes['agenda-clear-yes'].events.click();assert(nodes['agenda-summary'].textContent.includes('0 pendente'));
 if(blocked)assert(nodes['agenda-status'].textContent.includes('não pôde ser apagada'));
 else assert.equal(store.size,0);
 assert.equal(Node.lastFocused,nodes['agenda-title']);
 if(!blocked){
   // O primeiro sai do filtro de pendentes: foco acompanha o próximo item.
   for(const [title,date] of [['Primeiro','2026-12-01'],['Segundo','2026-12-02']]){
     nodes['agenda-title'].value=title;nodes['agenda-date'].value=date;nodes['agenda-form'].events.submit({preventDefault(){}});
   }
   nodes['agenda-list'].children[0].children[1].children[0].events.click();
   assert.equal(Node.lastFocused,nodes['agenda-list'].children[0].children[1].children[0]);
   nodes['agenda-filter'].value='todos';nodes['agenda-filter'].events.change();
   // Reabrir no filtro todos mantém o foco no mesmo compromisso.
   nodes['agenda-list'].children[0].children[1].children[0].events.click();
   assert.equal(Node.lastFocused,nodes['agenda-list'].children[0].children[1].children[0]);
   // Excluir posiciona o foco na ação equivalente do vizinho.
   nodes['agenda-list'].children[0].children[1].children[1].events.click();
   assert.equal(Node.lastFocused,nodes['agenda-list'].children[0].children[1].children[1]);
   nodes['agenda-list'].children[0].children[1].children[1].events.click();
   assert.equal(Node.lastFocused,nodes['agenda-title'],'Lista vazia retorna foco ao formulário');
 }
}
interfaceRun();interfaceRun(true);
console.log('PASS: formulário, conclusão, salvamento opcional, apagar tudo, armazenamento bloqueado e foco após mudanças na lista.');
