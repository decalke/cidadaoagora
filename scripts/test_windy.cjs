const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Node{
 constructor(tag='div'){this.tag=tag;this.children=[];this.attrs={};this.events={};this.dataset={};this.value='';}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
}
const root=new Node();root.id='test';root.dataset={lat:'-27.25',lon:'-50.5',zoom:'7',location:'Santa Catarina'};
const created=[];const document={querySelectorAll:()=>[root],createElement:tag=>{const n=new Node(tag);created.push(n);return n;}};
vm.runInNewContext(fs.readFileSync('clima/windy-map.js','utf8'),{document,Number,Object,URLSearchParams});
assert(!created.some(n=>n.tag==='iframe'),'Nenhum iframe antes de ativar');
const [toolbar,status,holder]=root.children,[label,activate,close]=toolbar.children,select=label.children[0];
select.value='rain';select.events.change();assert(!created.some(n=>n.tag==='iframe'));
activate.events.click();assert.equal(holder.children.length,1);let frame=holder.children[0];
let u=new URL(frame.src);assert.equal(u.origin,'https://embed.windy.com');assert.equal(u.searchParams.get('lat'),'-27.25');assert.equal(u.searchParams.get('overlay'),'rain');assert(!u.searchParams.has('key'));
select.value='temp';select.events.change();assert.equal(new URL(frame.src).searchParams.get('overlay'),'temp');
select.value='invalid';select.events.change();assert.equal(new URL(frame.src).searchParams.get('overlay'),'wind');
close.events.click();assert.equal(holder.children.length,0);assert.equal(holder.hidden,true);assert.equal(activate.hidden,false);
activate.events.click();assert.equal(holder.children.length,1);assert.equal(created.filter(n=>n.tag==='iframe').length,2);
const headers=fs.readFileSync('_headers','utf8');assert(headers.includes('frame-src https://embed.windy.com '));
for(const slug of ['blumenau','itajai','santa-catarina']){const html=fs.readFileSync(`clima/${slug}/index.html`,'utf8');assert(html.includes('data-windy-map'));assert(html.includes('windy-map.js'));assert(!html.includes('<iframe'));}
console.log('PASS: sem conexão antes do clique, coordenadas, camadas, desativação, reativação e três páginas');
