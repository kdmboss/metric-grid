/* Layout-only regression checks across the existing app views. */
const {webkit,chromium}=require('../.venv/lib/python3.12/site-packages/playwright/driver/package');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:4173',out='docs/figures/ios-spacing';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],checks=[];
 const b=await webkit.launch();
 for(const width of [320,375,414,768]){
  const p=await b.newPage({viewport:{width,height:896},hasTouch:true});
  p.on('pageerror',e=>errors.push(e.message));
  await p.addInitScript(()=>Object.defineProperty(navigator,'standalone',{get:()=>true}));
  for(const mode of ['compare','explore','prepare','evidence']){
   await p.goto(`${base}/?view=planner&mode=${mode}`);
   await p.locator('.planning-app').waitFor();
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${mode}: horizontal overflow`);
   if(mode==='prepare'){
    const boxes=await p.evaluate(()=>{
     const rect=s=>document.querySelector(s).getBoundingClientRect().toJSON();
     const r=rect('.empty-shortlist'),i=rect('.empty-shortlist > span'),h=rect('.empty-shortlist h3');
     return {actions:rect('.prepare-actions'),card:r,icon:i,title:h,county:rect('.county-import-disclosure')};
    });
    assert.ok(boxes.card.y-boxes.actions.bottom>=19,`${width}: export/card gap`);
    assert.ok(boxes.county.y-boxes.card.bottom>=19,`${width}: card/import gap`);
    assert.ok(Math.abs(boxes.icon.x+boxes.icon.width/2-boxes.card.x-boxes.card.width/2)<1,`${width}: icon not centered`);
    assert.ok(Math.abs(boxes.title.x+boxes.title.width/2-boxes.card.x-boxes.card.width/2)<1,`${width}: title not centered`);
    assert.equal(await p.locator('.empty-shortlist > span .interface-icon').count(),1);
    assert.equal(await p.locator('.native-header summary .interface-icon').count(),1);
    if(width!==768)await p.screenshot({path:`${out}/prepare-${width}.png`,fullPage:true});
   }
  }
  for(const section of ['counties','range','robust','forecast','methods']){
   await p.goto(`${base}/?view=planner&mode=evidence&section=${section}`);
   await p.locator('.planning-app').waitFor();
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} evidence ${section}: overflow`);
  }
  if(width<=414){
   await p.locator('.native-header summary').click();
   const menu=await p.locator('.native-header .menu-content').boundingBox();
   assert.ok(menu.x>=0&&menu.x+menu.width<=width,`${width}: menu outside screen`);
  }
  await p.goto(`${base}/?view=planner&mode=compare&section=changes`);
  await p.locator('.difference-panel').waitFor();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===414)await p.screenshot({path:`${out}/changes-${width}.png`,fullPage:true});
  await p.goto(`${base}/?view=planner&mode=compare&zone=69`);await p.locator('.zone-sheet').waitFor();
  if(width<=414){
   await p.getByRole('button',{name:'Resize area details'}).click();
   await p.getByRole('button',{name:'Resize area details'}).click();
   const pills=await p.locator('.zone-sheet .status').evaluateAll(es=>es.map(e=>e.scrollWidth<=e.clientWidth));
   assert.ok(pills.every(Boolean));
   await p.getByRole('button',{name:'Add to shortlist',exact:true}).click();
   await p.goto(`${base}/?view=planner&mode=prepare`);await p.locator('.shortlist-item').waitFor();
   if(width===414)await p.screenshot({path:`${out}/prepare-populated-${width}.png`,fullPage:true});
  }
  if(width===414){await p.goto(`${base}/?view=planner&mode=compare`);await p.locator('.people-results').waitFor();await p.screenshot({path:`${out}/compare-${width}.png`});}
  await p.goto(`${base}/?view=resident`);await p.locator('#place-search').fill('Albemarle');
  await p.getByRole('option',{name:'Albemarle',exact:true}).click();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(width===414)await p.screenshot({path:`${out}/resident-${width}.png`,fullPage:true});
  checks.push(`${width}px: all four tabs, Changes, resident result, centered empty state and section spacing passed.`);
  await p.close();
 }
 await b.close();
 const chrome=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await chrome.newPage({viewport:{width:1440,height:900}});p.on('pageerror',e=>errors.push(e.message));
 for(const mode of ['compare','explore','prepare','evidence']){
  await p.goto(`${base}/?view=planner&mode=${mode}`);await p.locator('.planning-app').waitFor();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  if(mode==='prepare')await p.screenshot({path:`${out}/prepare-desktop.png`,fullPage:true});
 }
 await chrome.close();assert.deepEqual(errors,[]);
 checks.push('1440px desktop: all four tabs render without overflow; no page errors across either browser engine.');
 fs.writeFileSync(`${out}/checks.json`,JSON.stringify({checks,errors,note:'WebKit app-mode checks are browser emulation, separate from native captures.'},null,2)+'\n');
 console.log(checks.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
