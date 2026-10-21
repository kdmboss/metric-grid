/* Pass 6 display regressions. No model fixtures or scenario calculations are modified. */
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE || '../.venv/lib/python3.12/site-packages/playwright/driver/package');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:4173',out='docs/figures/ui-pass6';fs.mkdirSync(out,{recursive:true});
const errors=[],checks=[];function watch(p){p.on('pageerror',e=>errors.push(e.message));}
async function shot(p,name,fullPage=false){await p.screenshot({path:`${out}/${name}.png`,fullPage});}
async function planner(p,extra=''){await p.goto(base+'/?view=planner'+extra);await p.locator('.people-results').waitFor();}
async function resident(p){await p.goto(base+'/?view=resident');await p.locator('#place-search').fill('Albemarle');await p.getByRole('option',{name:'Albemarle',exact:true}).click();await p.locator('.resident-result-card').waitFor();}
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);await planner(p);
 const edges=await p.locator('.people-results article').evaluateAll(es=>es.map(e=>['.result-label',':scope > strong',':scope > p'].map(s=>e.querySelector(s).getBoundingClientRect().left)));
 for(const xs of edges)assert.ok(Math.max(...xs)-Math.min(...xs)<1,JSON.stringify(xs));
 assert.equal(await p.locator('.scenario-rail [data-area-disclaimer]').count(),0);await shot(p,'desktop-default');
 await planner(p,'&zone=69');await p.waitForTimeout(250);
 const boxes=await p.locator('.compare-map:visible').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));assert.equal(boxes.length,2);assert.ok(boxes.every(r=>r.width>=500));assert.ok(boxes[1].y>=boxes[0].bottom);
 const panel=await p.locator('.desktop-selection').boundingBox();assert.ok(boxes.every(r=>r.right<=panel.x));
 await p.locator('.compare-map:visible').first().scrollIntoViewIfNeeded();await shot(p,'desktop-panel-open');await shot(p,'desktop-panel-open-full-page',true);
 await p.setViewportSize({width:1200,height:900});await planner(p,'&zone=69');await p.waitForTimeout(250);
 assert.ok((await p.locator('.compare-map:visible').evaluateAll(es=>es.map(e=>e.clientWidth))).every(w=>w>=500));
 for(const line of await p.locator('.people-results article > p').all())assert.ok(await line.evaluate(e=>e.scrollWidth<=e.clientWidth));
 checks.push('Desktop KPI left edges align; selected desktop maps stack at >=500px and remain beside the panel at 1440 and 1200px.');
 await p.setViewportSize({width:1440,height:900});await resident(p);
 assert.equal(await p.locator('[data-area-disclaimer]').count(),1);
 const body=await p.locator('body').innerText();assert.equal((body.match(/Not a prediction for your home\./g)||[]).length,1);assert.ok(!body.includes('Across the district, total homes cut'));
 const labels=await p.locator('.resident-answer-row .status').allTextContents();assert.deepEqual(labels,['2 of 8 areas lose power','All 8 stay on']);
 for(const e of await p.locator('.resident-answer-row .status').all())assert.ok(await e.evaluate(e=>e.scrollWidth<=e.clientWidth));
 await shot(p,'resident-albemarle-desktop');checks.push('Resident page has one replay disclaimer and the two requested count pills, without district totals or repeated map caveats.');await b.close();
 const w=await webkit.launch();const phone=await w.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});watch(phone);await phone.addInitScript(()=>Object.defineProperty(navigator,'standalone',{get:()=>true}));
 await resident(phone);assert.equal(await phone.locator('[data-area-disclaimer]').count(),1);await shot(phone,'resident-albemarle-iphone-app');
 await planner(phone);const toggle=await phone.locator('.mobile-plan-toggle').boundingBox(),filter=await phone.locator('.map-filters > summary').boundingBox();assert.ok(Math.abs(toggle.y-filter.y)<=2);assert.ok(filter.x>=toggle.x+toggle.width);
 assert.equal(await phone.locator('.map-task-hint').isVisible(),false);
 assert.ok((await phone.locator('.people-results article').evaluateAll(es=>es.map(e=>e.clientHeight))).every(h=>h<=112));
 const shown=await phone.evaluate(()=>{const bottom=document.querySelector('.mode-tabs').getBoundingClientRect().top;return [...document.querySelectorAll('.compare-map path[data-zone]')].some(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<bottom&&r.bottom>104})});assert.ok(shown,'No district tract visible on first screen');
 await shot(phone,'iphone-app-compare-first-screen');checks.push('Phone tiles capped at 112px; filter and segmented control share a row; district begins on the first app screen.');
 const safari=await w.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});watch(safari);await planner(safari);
 const t=await safari.locator('.mobile-plan-toggle').boundingBox(),f=await safari.locator('.map-filters > summary').boundingBox();assert.ok(Math.abs(t.y-f.y)<=2);await shot(safari,'iphone-safari-compare');
 for(const width of [320,375,414,768]){await safari.setViewportSize({width,height:900});await planner(safari);assert.ok(await safari.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 await w.close();assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/checks.json`,JSON.stringify({checks,errors,limitation:'Standalone iPhone display mode emulated in WebKit.'},null,2)+'\n');console.log(checks.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
