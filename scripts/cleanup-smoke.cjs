// Visual cleanup acceptance checks; original test files remain intact.
const { resolve } = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ? resolve(process.env.PLAYWRIGHT_MODULE) : 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.SMOKE_URL || 'http://127.0.0.1:5175';
const output = 'docs/figures';
async function main() {
  fs.mkdirSync(output,{recursive:true});
  const browser=await chromium.launch({headless:true,channel:'chrome'});
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[],external=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{const url=new URL(route.request().url());if(/^https?:/.test(url.protocol)&&url.origin!==new URL(base).origin){external.push(url.href);return route.abort();}return route.continue();});
  await page.goto(base+'/?mode=compare',{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:'Same power cut. Different people in the dark.',exact:true}).waitFor();
  assert.equal(await page.locator('.people-results article').count(),3);
  assert.equal(await page.locator('.brand svg').count(),0);
  assert.deepEqual(await page.getByRole('tablist',{name:'Comparison views'}).getByRole('tab').allTextContents(),['Two plans','What changed?']);
  assert.equal(await page.locator('.map-toolbar').isVisible(),false);
  const mapBox=await page.locator('[data-map=typical]').boundingBox();
  assert.ok(mapBox.y<800,`Map starts below laptop fold: ${mapBox.y}`);
  console.log('Desktop map begins at',mapBox.y);
  await page.screenshot({path:output+'/cleanup_desktop_default.png'});
  await page.locator('#alpha').fill('0');
  await page.getByRole('button',{name:'20%',exact:true}).click();
  assert.equal(await page.locator('[data-plan=aware] h2').innerText(),'Business-cost optimized');
  assert.match(await page.locator('.objective-note').innerText(),/cost only.*zero weight/);
  const data=JSON.parse(fs.readFileSync('public/data/app.json','utf8'));
  const extreme=data.records.find(r=>r.solved&&r.alpha===0&&r.target_key==='20'&&!r.cap);
  const expected=extreme.weighted.h_human>extreme.baseline.h_human?'Higher':'Lower';
  assert.match(await page.locator('.people-results article').nth(1).innerText(),new RegExp(expected));
  await page.screenshot({path:output+'/cleanup_desktop_cost_only.png'});
  await page.locator('#alpha').fill('2');
  await page.getByRole('button',{name:'Elliott',exact:true}).click();
  await page.screenshot({path:output+'/cleanup_desktop_middle.png'});
  await page.getByText('Filters',{exact:true}).click();
  await page.locator('#zone-search').fill('141');
  await page.locator('.search-results button').filter({hasText:'Zone 141'}).click();
  assert.equal(await page.locator('#compare-zone').inputValue(),'141');
  assert.equal(await page.locator('.map-toolbar').isVisible(),false);
  await page.screenshot({path:output+'/cleanup_desktop_selected.png'});
  await page.getByRole('tab',{name:'Evidence',exact:true}).click();
  await page.getByRole('tab',{name:'County summary',exact:true}).click();
  assert.equal(await page.locator('.county-summary').isVisible(),true);
  await page.getByRole('tab',{name:'Plan range',exact:true}).click();
  assert.equal(await page.locator('.distribution-section').isVisible(),true);
  await page.getByRole('tab',{name:'Compare',exact:true}).click();
  await page.getByText('How to use',{exact:true}).click();
  assert.equal(await page.locator('.how-to-help li').count(),3);
  await page.getByText('How to use',{exact:true}).click();
  await page.getByText('More options',{exact:true}).click();
  await page.getByRole('checkbox',{name:/Limit county concentration/}).check();
  assert.ok(new URL(page.url()).searchParams.get('cap')==='1');
  await page.getByRole('button',{name:'Reset',exact:true}).click();
  for(const width of [320,375,390,414,768,1440]) {
    await page.setViewportSize({width,height:width<700?844:900});
    await page.goto(base+'/?mode=compare',{waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`root overflow at ${width}`);
    const report=await page.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,p,button,input,select,summary,pre,code')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).visibility!=='hidden';}).map(el=>{const s=getComputedStyle(el);return {text:el.textContent.slice(0,60),size:s.fontSize,weight:s.fontWeight,font:s.fontFamily};}).filter(x=>!['12px','14px','16px','20px','32px','48px'].includes(x.size)||!['400','600'].includes(x.weight)||!/Inter/.test(x.font)));
    assert.deepEqual(report,[],`Typography drift at ${width}`);
    console.log('Responsive / typography:',width,'passed');
    if(width===390){
      assert.equal(await page.locator('[data-plan=typical]').isVisible(),true);
      assert.equal(await page.locator('[data-plan=aware]').isVisible(),false);
      assert.equal(await page.locator('.zone-sheet').isVisible(),false);
      await page.screenshot({path:output+'/cleanup_phone_default.png'});
      await page.locator('#alpha').fill('0');await page.locator('#alpha').fill('2');
      await page.screenshot({path:output+'/cleanup_phone_middle.png'});
      await page.getByRole('group',{name:'Displayed plan'}).getByRole('button',{name:'Vulnerability-aware',exact:true}).click();
      assert.equal(await page.locator('[data-plan=typical]').isVisible(),false);
      assert.equal(await page.locator('[data-plan=aware]').isVisible(),true);
      await page.locator('[data-plan=aware]').scrollIntoViewIfNeeded();
      await page.screenshot({path:output+'/cleanup_phone_other_plan.png'});
      await page.locator('[data-map=aware]').scrollIntoViewIfNeeded();
      const point=await page.locator('[data-map=aware] path[data-zone="69"]').evaluate(el=>{const b=el.getBBox();for(let i=1;i<20;i++)for(let j=1;j<20;j++){const pt=new DOMPoint(b.x+b.width*i/20,b.y+b.height*j/20);if(el.isPointInFill(pt)){const p=pt.matrixTransform(el.getScreenCTM());return {x:p.x,y:p.y};}}});
      assert.ok(point,'a real point inside the selected tract');
      await page.mouse.click(point.x,point.y);
      assert.equal(await page.locator('.zone-sheet').isVisible(),true);
      assert.equal(await page.locator('.zone-sheet #sheet-zone').inputValue(),'69');
      await page.screenshot({path:output+'/cleanup_phone_selected.png'});
      await page.getByRole('button',{name:'Close',exact:true}).click();
      assert.equal(await page.locator('.zone-sheet').isVisible(),false);
    }
    for(const mode of ['explore','prepare','evidence']){
      await page.getByRole('tab',{name:mode==='prepare'?/Prepare/:mode[0].toUpperCase()+mode.slice(1),exact:mode!=='prepare'}).click();
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${mode} overflow at ${width}`);
    }
  }
  await page.goto(base+'/?mode=compare&section=counties',{waitUntil:'networkidle'});
  assert.equal(await page.getByRole('tab',{name:'Evidence',exact:true}).getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('.county-summary').isVisible(),true);
  for(const file of ['manifest.webmanifest','apple-touch-icon.png','icon-192.png','icon-512.png'])assert.ok((await page.request.get(base+'/'+file)).ok(),file);
  assert.deepEqual(errors,[],'browser exceptions');assert.deepEqual(external,[],'outside requests');
  await browser.close();
  console.log('Cleanup browser acceptance and screenshots passed.');
}
main().catch(error=>{console.error(error);process.exit(1);});
