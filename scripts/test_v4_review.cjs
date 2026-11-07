// Regressões observadas na revisão: entrada inválida, storage e catálogo.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
class Node{
 constructor(tag='div'){this.tag=tag;this.children=[];this.value='';this.textContent='';this.dataset={};this.attrs={};this.style={};this.events={};this.classList={toggle(){}};}
 append(...n){this.children.push(...n);}
 replaceChildren(...n){this.children=n;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
 focus(){this.focused=true;}
 scrollIntoView(){}
 querySelector(tag){return this.children.flatMap(n=>[n,...n.children]).find(n=>n.tag===tag);}
}
function tool(page,blocked=false,saved=null){
 const ids={budget:['renda','moradia','alimentacao','transporte','saude','outros','budget-balance','budget-expense','budget-percent','budget-bar','budget-guidance','budget-save','budget-clear'],shopping:['shopping-form','item-name','item-quantity','item-price','shopping-list','shopping-total','shopping-count','shopping-budget','shopping-budget-result','shopping-clear','shopping-copy'],unit:['a-price','a-quantity','b-price','b-quantity','unit-type','unit-a','unit-b','unit-winner','unit-detail']}[page];
 const nodes=Object.fromEntries([...ids,'tool-status'].map(id=>[id,new Node()]));nodes['unit-type']&&(nodes['unit-type'].value='g');
 const storage={getItem(){if(blocked)throw Error();return saved},setItem(k,v){if(blocked)throw Error();this.value=v;},removeItem(){if(blocked)throw Error();}};
 const document={getElementById:id=>nodes[id],querySelector:()=>({dataset:{tool:page}}),querySelectorAll:()=>Object.values(nodes),createElement:tag=>new Node(tag)};
 vm.runInNewContext(fs.readFileSync('assets/v4/v4-tools.js','utf8'),{document,localStorage:storage,navigator:{clipboard:{writeText:async()=>{}}},Number,Object,JSON});
 return {nodes,storage,input(id,value){nodes[id].value=value;nodes[id].events.input?.();},click(id){nodes[id].events.click();}};
}
{
 const t=tool('unit');for(const [id,value] of Object.entries({'a-price':'5','a-quantity':'500','b-price':'12','b-quantity':'1000'}))t.input(id,value);
 assert(t.nodes['unit-winner'].textContent.includes('Produto A'));assert(t.nodes['unit-a'].textContent.includes('10,00'));
 t.input('a-price','');assert.equal(t.nodes['unit-a'].textContent,'—');assert.equal(t.nodes['unit-b'].textContent,'—');
 t.input('a-price','1e309');assert.equal(t.nodes['unit-a'].textContent,'—');
}
{
 const t=tool('budget',true);t.input('renda','1000');t.input('moradia','600');assert(t.nodes['budget-balance'].textContent.includes('400,00'));
 t.input('moradia','-1');assert.equal(t.nodes['budget-balance'].textContent,'—');t.click('budget-save');assert(t.nodes['tool-status'].textContent.includes('Corrija'));
 t.input('moradia','Infinity');assert.equal(t.nodes['budget-expense'].textContent,'—');t.click('budget-clear');assert.equal(t.nodes.renda.value,'');assert(t.nodes['tool-status'].textContent.includes('Não foi possível apagar'));
}
{
 const t=tool('shopping',true),n=t.nodes;const submit=()=>n['shopping-form'].events.submit({preventDefault(){}});
 n['item-name'].value='Arroz';n['item-quantity'].value='1';n['item-price'].value='';submit();assert.equal(n['shopping-list'].children.length,0);
 n['item-price'].value='0';submit();assert.equal(n['shopping-list'].children.length,1);assert(n['tool-status'].textContent.includes('Não foi possível salvar'));
 n['item-name'].value='Inválido';n['item-quantity'].value='Infinity';n['item-price'].value='1';submit();assert.equal(n['shopping-list'].children.length,1);
 t.input('shopping-budget','-1');assert(n['shopping-budget-result'].textContent.includes('limite válido'));
}
async function home(){
 const ids=['v4-search','v4-grid','v4-count','v4-search-go','ferramentas','v4-mini-income','v4-mini-expense','v4-mini-result','v4-mini-caption','v4-date','v4-news'];const nodes=Object.fromEntries(ids.map(id=>[id,new Node()]));
 const service={title:'Clima',description:'Previsão',href:'/clima/',category:'consultar-dados',keywords:'chuva'};let requests=0;
 const filters=['all','favorites'].map(value=>{const n=new Node();n.dataset.filter=value;return n;});
 const document={querySelector:s=>nodes[s.slice(1)],querySelectorAll:()=>filters,createElement:t=>new Node(t)};
 vm.runInNewContext(fs.readFileSync('assets/v4/v4-home.js','utf8'),{document,window:{},localStorage:{getItem:()=>null,setItem(){throw Error();}},fetch:async url=>{if(url.includes('editorial'))return{ok:true,json:async()=>({items:[]})};requests++;return{ok:requests>1,json:async()=>[service]}},Date,Number,JSON,Set});
 await new Promise(r=>setTimeout(r,0));assert(nodes['v4-count'].textContent.includes('Não foi possível'));const retry=nodes['v4-grid'].children[0];assert.equal(retry.tag,'button');
 nodes['v4-search'].events.input();assert.equal(nodes['v4-grid'].children[0],retry);retry.events.click();await new Promise(r=>setTimeout(r,0));assert.equal(nodes['v4-grid'].children.length,1);
 nodes['v4-grid'].children[0].children[0].events.click();assert(nodes['v4-grid'].children[0].children[0].focused);assert(nodes['v4-count'].textContent.includes('não permitiu salvar'));
 nodes['v4-mini-income'].value='-5';nodes['v4-mini-income'].events.input();assert.equal(nodes['v4-mini-result'].textContent,'—');
 nodes['v4-mini-income'].value='Infinity';nodes['v4-mini-income'].events.input();assert.equal(nodes['v4-mini-result'].textContent,'—');
 assert.equal(nodes['v4-count'].attrs.role,'status');
}
home().then(()=>console.log('PASS: comparador, orçamento, compras, favoritos acessíveis e recuperação do catálogo')).catch(e=>{console.error(e);process.exitCode=1;});
