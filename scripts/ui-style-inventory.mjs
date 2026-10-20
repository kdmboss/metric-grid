import {readFileSync,readdirSync} from 'node:fs';
import {parse} from '@babel/parser';
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?
  files(`${dir}/${entry.name}`):[`${dir}/${entry.name}`]);}
function walk(node,visit){
  if(!node||typeof node!=='object')return;
  visit(node);
  for(const value of Object.values(node)){
    if(Array.isArray(value))value.forEach(item=>walk(item,visit));
    else if(value&&typeof value==='object')walk(value,visit);
  }
}
export function uiStyleInventory(){
  const classes=new Set(),tags=new Set(['html','body']);
  function collect(node){walk(node,value=>{
    const text=value.type==='StringLiteral'?value.value:
      value.type==='TemplateElement'?value.value.cooked:null;
    if(typeof text==='string')for(const name of text.split(/\s+/))
      if(/^[A-Za-z][\w-]*$/.test(name))classes.add(name);
  });}
  for(const file of files('web').filter(f=>/\.(js|jsx)$/.test(f)&&!f.includes('.test.'))){
    const ast=parse(readFileSync(file,'utf8'),{sourceType:'module',plugins:['jsx']});
    walk(ast,node=>{
      if(node.type==='JSXOpeningElement'&&/^[a-z]/.test(node.name.name))tags.add(node.name.name);
      if(node.type==='JSXAttribute'&&node.name.name==='className')collect(node.value);
      if(node.type==='ObjectProperty'&&node.key.name==='className')collect(node.value);
      if(node.type==='FunctionDeclaration'&&node.id.name==='tractClasses')collect(node.body);
    });
  }
  // These suffixes come from the layer, plan and chart keys in current data-driven JSX.
  for(const name of ['h','c','hh','dashed','observed','county-plan-baseline','county-plan-weighted'])
    classes.add(name);
  for(let i=0;i<5;i++){classes.add(`ramp-${i}`);classes.add(`vulnerability-${i}`);}
  for(const key of ['only-baseline','only-aware','both','neither','protected'])
    classes.add(`difference-${key}`);
  return {classes,tags};
}
export function unusedSelectorNames(selector,inventory){
  const names=[];
  for(const match of selector.matchAll(/\.([A-Za-z_][\w-]*)/g))
    if(!inventory.classes.has(match[1]))names.push(`class .${match[1]}`);
  const plain=selector.replace(/\[[^\]]*\]/g,'');
  for(const match of plain.matchAll(/(?:^|[\s>+~,(])([a-z][\w-]*)/g))
    if(!inventory.tags.has(match[1])&&!['from','to'].includes(match[1]))names.push(`tag ${match[1]}`);
  return names;
}
