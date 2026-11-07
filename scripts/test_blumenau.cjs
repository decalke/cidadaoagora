// Executa o controlador sem rede para conferir filtros e validade dos dados.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Node{
 constructor(tag='div',text=''){this.tag=tag;this.textContent=text;this.children=[];this.attrs={};this.value='';this.events={};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
}
const text=n=>n.textContent+' '+n.children.map(text).join(' ');
const html=fs.readFileSync('clima/blumenau/index.html','utf8'),source=fs.readFileSync('clima/blumenau/blumenau.js','utf8');
async function run(mode){
 const data=JSON.parse(fs.readFileSync('clima/data/blumenau.json','utf8'));
 const now=new Date().toISOString();
 for(const s of Object.values(data.sources)){s.collectedAt=mode==='stale'?'2000-01-01T00:00:00Z':now;s.ok=mode!=='failed';}
 data.sources.rio.data.readings=[{time:now,value:2},{time:new Date(Date.now()-3600000).toISOString(),value:1.5}];
 if(mode==='future')data.sources.rio.data.readings=[{time:'2099-01-01T00:00:00Z',value:99}];
 const alerts={complete:true,collectedAt:now,alerts:[{cities:['4202404'],start:'2000-01-01',end:'2099-01-01',event:'Chuva teste',severity:'Severe',url:'javascript:alert(1)'}]};
 const nodes={};for(const id of html.matchAll(/id="([^"]+)"/g))nodes[id[1]]=new Node();nodes['estacao-tipo'].value='local';
 const document={hidden:false,getElementById(id){assert(nodes[id],`ID ausente: ${id}`);return nodes[id];},createElement:t=>new Node(t),createElementNS:(_,t)=>new Node(t)};
 vm.runInNewContext(source,{document,Date,Number,Promise,setInterval:()=>{},fetch:async url=>({ok:mode!=='offline',json:async()=>url.includes('blumenau.json')?data:alerts})});
 await new Promise(r=>setTimeout(r,25));
 if(mode==='offline'){assert(text(nodes.nivel).includes('indisponíveis'));assert(text(nodes['lista-abrigos']).includes('Nenhum abrigo'));return;}
 if(mode==='current')assert(text(nodes.nivel).includes('2 m'));
 else assert(text(nodes.nivel).includes('indisponíveis'));
 assert(!text(nodes['lista-abrigos']).includes('Abertura confirmada'));
 nodes['rua-busca'].value='São Rafael';nodes['rua-busca'].events.input();assert(nodes.ruas.children.length>0);assert(text(nodes.ruas).includes('Cota cadastrada'));
 nodes['rua-busca'].value='zzzznaoexiste';nodes['rua-busca'].events.input();assert(text(nodes.ruas).includes('não indica ausência de risco'));
 nodes['estacao-busca'].value='zzzz';nodes['estacao-busca'].events.input();assert(text(nodes.estacoes).includes('Nenhuma estação'));
 assert(text(nodes['avisos-inmet']).includes('Chuva teste'));
 const a=nodes['avisos-inmet'].children[0].children.at(-1);assert.equal(a.href,'https://avisos.inmet.gov.br/');
}
(async()=>{for(const mode of ['current','stale','failed','future','offline'])await run(mode);console.log('PASS: controlador, filtros, cotas, validade, falha de rede, datas futuras, links e abrigos');})().catch(e=>{console.error(e);process.exitCode=1;});
