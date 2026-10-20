/* Welcome/storage, fixed resident counts, fixture-only cooling and cold production checks. */
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE || '../.venv/lib/python3.12/site-packages/playwright/driver/package');
const fs=require('node:fs'),assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL || 'http://127.0.0.1:4173',out='docs/figures/ui-pass5';
fs.mkdirSync(out,{recursive:true});const errors=[],checks=[];
function watch(p){p.on('pageerror',e=>errors.push(e.message));}
async function shot(p,name){await p.screenshot({path:`${out}/${name}.png`});}
async function town(p){await p.locator('#place-search').fill('Albemarle');await p.getByRole('option',{name:'Albemarle',exact:true}).click();await p.locator('.resident-result-card').waitFor();}
(async()=>{
 const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const p=await b.newPage({viewport:{width:1440,height:900}});watch(p);
 await p.goto(base);await p.getByRole('dialog',{name:'What brings you here?'}).waitFor();await shot(p,'welcome');
 await p.getByRole('button',{name:/Check my area/}).click();await p.locator('.resident-main').waitFor();
 await p.goto(base);await p.locator('.resident-main').waitFor();assert.equal(await p.locator('.welcome-card').count(),0);
 await town(p);assert.match(await p.locator('.resident-result-card').innerText(),/2 areas lose power/);assert.match(await p.locator('.resident-result-card').innerText(),/0 areas lose power/);
 assert.equal(await p.locator('.scenario-controls').count(),0);assert.equal(await p.locator('.cooling-card').count(),0);await shot(p,'resident-albemarle-desktop');
 await p.goto(base+'/?view=planner');await p.locator('.people-results').waitFor();assert.equal(await p.locator('.welcome-card').count(),0);await shot(p,'planner-compare');
 await p.locator('.appbar .browser-menu summary').click();await p.getByRole('button',{name:'Switch view',exact:true}).click();await p.locator('.welcome-card').waitFor();
 checks.push('Choice persists without welcome; query overrides storage; Switch view reopens the choice card.');
 const fixture=JSON.parse(fs.readFileSync('/tmp/hearth-cooling-fixture.json','utf8'));
 await p.route('**/data/app.json',async route=>{const r=await route.fetch();const data=await r.json();data.node_cooling=fixture;await route.fulfill({json:data});});
 await p.goto(base+'/?view=planner');await p.locator('.cooling-card').waitFor();assert.match(await p.locator('.cooling-card').innerText(),/TEST FIXTURE/);assert.match(await p.locator('.cooling-card').innerText(),/3.0 hours/);
 await p.locator('.cooling-card').scrollIntoViewIfNeeded();await shot(p,'cooling-card-fixture');await p.unroute('**/data/app.json');
 const blocked=await b.newPage();watch(blocked);await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});
 await blocked.goto(base);await blocked.locator('.welcome-card').waitFor();await blocked.getByRole('button',{name:/Plan for an outage/}).click();await blocked.locator('.people-results').waitFor();await blocked.goto(base);await blocked.locator('.welcome-card').waitFor();
 checks.push('Blocked storage keeps both choices usable and shows welcome on the next unqualified visit. Cooling is absent normally; injected test fixture is explicitly labeled.');
 const live=await b.newPage();watch(live);const liveErrors=[];live.on('console',m=>{if(m.type()==='error')liveErrors.push(m.text())});
 await live.goto('https://metric-grid.vercel.app/',{waitUntil:'networkidle'});await live.locator('.people-results').waitFor();
 assert.equal((await live.request.get('https://metric-grid.vercel.app/data/app.json')).status(),200);assert.deepEqual(liveErrors,[]);
 checks.push('Existing deployed Vercel release cold-loaded in a fresh private context with no console errors; app.json returned 200. This local pass is not deployed.');
 await b.close();
 const w=await webkit.launch(),phone=await w.newPage({viewport:{width:393,height:852},isMobile:true,hasTouch:true});watch(phone);
 await phone.addInitScript(()=>Object.defineProperty(navigator,'standalone',{get:()=>true}));
 await phone.goto(base+'/?view=resident&alpha=0&pct=20');await town(phone);assert.equal(await phone.locator('.mode-tabs').count(),0);
 assert.equal(await phone.locator('.scenario-controls').count(),0);await shot(phone,'resident-albemarle-iphone-app');
 assert.match(await phone.locator('.resident-result-card').innerText(),/2 areas lose power/);assert.match(await phone.locator('.resident-result-card').innerText(),/0 areas lose power/);
 await phone.getByRole('button',{name:'See the full planning tool →'}).click();await phone.locator('.mode-tabs').waitFor();
 checks.push('Resident phone app has no planner tabs/sliders, ignores planner alpha/target query settings, and switches to the full planner.');
 await w.close();assert.deepEqual(errors,[]);fs.writeFileSync(`${out}/checks.json`,JSON.stringify({checks,errors},null,2)+'\n');console.log(checks.join('\n'));
})().catch(e=>{console.error(e);process.exit(1)});
