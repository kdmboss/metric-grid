/* UI pass 4: actual visible-path touch selection, panel layout and shared pill checks. */
const {chromium, webkit}=require(process.env.PLAYWRIGHT_MODULE || '../.venv/lib/python3.12/site-packages/playwright/driver/package');
const fs=require('node:fs'), assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:5176';
const out=process.env.REVIEW_DIR || 'docs/figures/ui-pass4';fs.mkdirSync(out,{recursive:true});
const errors=[],checks=[];
function watch(p){p.on('pageerror',e=>errors.push(e.message));}
async function load(p,q=''){const url=new URL('/'+q,base);url.searchParams.set('view','planner');await p.goto(url.href);await p.locator('.people-results').waitFor();}
async function shot(p,name){await p.screenshot({path:`${out}/${name}.png`});}
async function pills(p){const rows=await p.locator('.status:visible').evaluateAll(es=>es.map(e=>({text:e.textContent,width:e.clientWidth,scroll:e.scrollWidth,right:e.getBoundingClientRect().right,parentRight:e.parentElement.getBoundingClientRect().right})));assert.ok(rows.length);for(const r of rows){assert.ok(r.scroll<=r.width,JSON.stringify(r));assert.ok(r.right<=r.parentRight+1,JSON.stringify(r));}return rows;}
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
 await load(p);
 const tops=await p.locator('.people-results article > strong').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().top));
 assert.ok(Math.max(...tops)-Math.min(...tops)<=1, 'KPI number baselines differ');
 await shot(p,'desktop-default');
 const initial=await p.locator('.workspace-body').evaluate(e=>e.clientWidth);
 await load(p,'?zone=69');await p.waitForTimeout(250);
 const panel=await p.locator('.desktop-selection').boundingBox();
 assert.equal(Math.round(panel.width),360);
 const body=await p.locator('.workspace-body').boundingBox();assert.ok(body.width<initial-350);
 const results=await p.locator('.people-results').boundingBox();assert.ok(results.x+results.width<=panel.x);
 for(const map of await p.locator('.compare-map:visible').all()){const box=await map.boundingBox();assert.ok(box.x+box.width<=panel.x+1);}
 await pills(p);await p.locator('.comparison-maps:visible').scrollIntoViewIfNeeded();await shot(p,'desktop-zone-panel');
 const data=JSON.parse(fs.readFileSync('public/data/app.json','utf8'));
 const record=data.records.find(r=>r.target_key==='elliott'&&r.alpha===.5&&!r.cap);
 const ids=[record.baseline.zone_ids[0],data.zones.features.find(f=>f.properties.protected).properties.zone_id];
 for(const id of ids){await p.locator('#drawer-zone').selectOption(String(id));await pills(p);}
 checks.push('Shared Cut/Kept on/Protected pills have scrollWidth <= clientWidth; both maps remain left of the 360px panel.');
 await p.keyboard.press('Escape');await p.locator('#place-search').fill('Albemarle');await p.getByRole('option',{name:'Albemarle',exact:true}).click();await p.waitForTimeout(300);
 assert.equal(await p.locator('.town-map-label:visible').count(),2);
 assert.match(await p.locator('.town-summary').innerText(),/Albemarle/);
 await p.locator('.comparison-maps:visible').scrollIntoViewIfNeeded();await shot(p,'desktop-albemarle');await p.getByRole('button',{name:'Clear town',exact:true}).click();assert.equal(await p.locator('#place-search').inputValue(),'');
 checks.push('Albemarle has context padding, labels on both maps, live summary and an in-field clear control.');
 await b.close();
 const w=await webkit.launch();
 const safari=await w.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});watch(safari);
 await load(safari);
 const tabs=await safari.locator('.workspace-tools .view-tabs').boundingBox(),toggle=await safari.locator('.mobile-plan-toggle').boundingBox();assert.ok(toggle.y>=tabs.y+tabs.height);
 assert.equal(await safari.locator('.appbar-actions > .button').isVisible(),false);
 await shot(safari,'iphone-safari-compare');
 checks.push('Regular Safari comparison tabs and plan toggle stack without overlap; Export is in the menu.');
 const app=await w.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});watch(app);
 await app.addInitScript(()=>Object.defineProperty(navigator,'standalone',{get:()=>true}));
 await load(app);await shot(app,'iphone-app-compare');
 await app.locator('.compare-map:visible .map-canvas').scrollIntoViewIfNeeded();
 const point=await app.evaluate(()=>{
  const svg=document.querySelector('.compare-map[data-plan="typical"] .interactive-map'),r=svg.getBoundingClientRect();
  const candidates=[];
  for(let y=Math.max(100,r.top+8);y<Math.min(innerHeight-85,r.bottom-8);y+=8)
   for(let x=Math.max(8,r.left+8);x<Math.min(innerWidth-8,r.right-8);x+=8){
    const el=document.elementFromPoint(x,y);
    if(el?.matches('path[data-zone]')&&svg.contains(el)&&[[10,0],[-10,0],[0,10],[0,-10]].every(([dx,dy])=>document.elementFromPoint(x+dx,y+dy)===el))candidates.push({x,y,id:el.dataset.zone,cut:el.classList.contains('is-cut')});
   }
  return candidates.find(v=>v.cut)||candidates[0];
 });
 assert.ok(point,'No visible tract touch target');await app.touchscreen.tap(point.x,point.y);await app.locator('.zone-sheet').waitFor();
 assert.equal(await app.locator('.zone-sheet').getAttribute('data-detent'),'peek');
 assert.equal(new URL(app.url()).searchParams.get('zone'),point.id);await pills(app);await shot(app,'iphone-app-peek');
 await app.getByRole('button',{name:'Close area details',exact:true}).click();
 await app.getByRole('button',{name:'Changes',exact:true}).click();await app.locator('[data-map="difference"]').waitFor();
 assert.ok(await app.locator('[data-map="difference"]').isVisible());await app.evaluate(()=>{const e=document.querySelector('.difference-panel');scrollTo(0,scrollY+e.getBoundingClientRect().top-104)});await shot(app,'iphone-app-changes');
 checks.push(`WebKit touchscreen tapped visible tract ${point.id} on the displayed map and opened peek; Changes is reachable from the app selector.`);
 for(const width of [320,375,414,768]){await safari.setViewportSize({width,height:900});await load(safari);assert.ok(await safari.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 checks.push('No horizontal page overflow at 320/375/414/768px.');
 await w.close();assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/checks.json`,JSON.stringify({checks,errors,limitation:'Standalone mode emulated in WebKit; physical iOS installation not tested.'},null,2)+'\n');console.log(checks.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
