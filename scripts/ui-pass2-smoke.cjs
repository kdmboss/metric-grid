const {resolve}=require('node:path');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE?
  resolve(process.env.PLAYWRIGHT_MODULE):'playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const base=process.env.SMOKE_URL||'http://127.0.0.1:5175';
const output='docs/figures/ui-pass2';
const errors=[],external=[],browsers=[];
async function prepare(page){
  page.on('pageerror',error=>errors.push(error.message));
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(/^https?:/.test(url.protocol)&&url.origin!==new URL(base).origin){
      external.push(url.href);return route.abort();
    }
    return route.continue();
  });
  await page.goto(base+'/?mode=compare',{waitUntil:'networkidle'});
  await page.locator('.planning-app').waitFor();
  await page.evaluate(()=>document.fonts.ready);
}
async function screenshot(page,name,fullPage=false){
  await page.screenshot({path:`${output}/${name}.png`,fullPage,animations:'disabled'});
}
async function assertMaps(page){
  const maps=page.locator('#compare-plans .map-canvas:visible');
  for(let i=0;i<await maps.count();i++){
    const box=await maps.nth(i).boundingBox();
    assert.ok(box.height>=520,`Small map: ${box.height}`);
    const paths=maps.nth(i).locator('path.tract');
    assert.equal(await paths.count(),183);
    const colors=await paths.evaluateAll(es=>new Set(es.map(e=>getComputedStyle(e).fill)).size);
    assert.ok(colors>3,'Map must show varied tract fills');
  }
}
async function mapPoint(page,id,zone){
  return page.locator(`[data-map=${id}] [data-zone="${zone}"]`).evaluate(path=>{
    const box=path.getBBox(),matrix=path.getScreenCTM();
    for(const y of [.5,.4,.6,.3,.7,.2,.8])for(const x of [.5,.4,.6,.3,.7,.2,.8]){
      const point=new DOMPoint(box.x+box.width*x,box.y+box.height*y);
      if(path.isPointInFill(point)){const screen=point.matrixTransform(matrix);
        if(document.elementFromPoint(screen.x,screen.y)?.closest('[data-zone]')===path)return screen.toJSON();}
    }
    throw Error('No interior point found');
  });
}
async function selectZone(page,id){
  await page.locator('details.map-filters>summary').click();
  await page.locator('#zone-search').fill(String(id));
  await page.locator('.search-results button').filter({hasText:`Zone ${id}`}).first().click();
}
async function mapSnapshot(page){
  await page.locator('.comparison-maps').evaluate(el=>el.scrollIntoView({block:'start'}));
}
async function desktop(){
  const browser=await chromium.launch({channel:'chrome',headless:true});browsers.push(browser);
  const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await prepare(page);await assertMaps(page);
  assert.equal(await page.locator('.people-results article').count(),3);
  assert.equal(await page.locator('.compare-map-title>span:visible').count(),2);
  await screenshot(page,'01-chromium-default');
  await screenshot(page,'01-chromium-default-full',true);
  await selectZone(page,69);
  assert.equal(await page.locator('#compare-plans .selected-zone-outline').count(),2);
  assert.equal(await page.locator('#compare-plans .zone-pin').count(),2);
  await mapSnapshot(page);await screenshot(page,'02-chromium-selected');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#compare-plans .selected-zone-outline').count(),0);
  // Clicking empty SVG space also clears the shared selection.
  await selectZone(page,69);await mapSnapshot(page);
  const svg=page.locator('[data-map=typical]');const box=await svg.boundingBox();
  await page.mouse.click(box.x+5,box.y+5);
  assert.equal(await page.locator('#compare-zone').inputValue(),'0');
  // Wheel zoom is anchored at the pointer and updates both cameras.
  const point={x:box.x+box.width*.4,y:box.y+box.height*.4};
  const before=await svg.locator('.map-transform').getAttribute('transform');
  await page.mouse.move(point.x,point.y);await page.mouse.wheel(0,-180);
  await page.waitForTimeout(150);
  const after=await svg.locator('.map-transform').getAttribute('transform');
  assert.notEqual(before,after);
  assert.equal(after,await page.locator('[data-map=aware] .map-transform').getAttribute('transform'));
  await page.locator('details.map-filters>summary').click();
  await page.locator('#county-filter').selectOption('Union County');
  await page.locator('details.map-filters>summary').click();
  await mapSnapshot(page);await screenshot(page,'03-chromium-union');
  await page.locator('details.map-filters>summary').click();
  await page.locator('#county-filter').selectOption('');
  await page.locator('details.map-filters>summary').click();
  await selectZone(page,69);
  await page.locator('#compare-plans .add-zone').click();
  await page.getByRole('tab',{name:'Prepare',exact:true}).click();
  assert.equal(await page.locator('.shortlist-item').count(),1);
  assert.notEqual(await page.locator('.note-fields select').evaluate(el=>getComputedStyle(el).backgroundImage),'none');
  await screenshot(page,'04-chromium-prepare',true);
  const arrows=await page.locator('.arrow-icon:visible').evaluateAll(es=>es.map(icon=>{
    const a=icon.getBoundingClientRect(),b=icon.closest('button,a').getBoundingClientRect();
    return Math.abs(a.y+a.height/2-b.y-b.height/2);
  }));
  assert.ok(arrows.length&&arrows.every(delta=>delta<1),'Arrow icons must share the control centerline');
  await page.getByRole('tab',{name:'Evidence',exact:true}).click();
  await page.getByRole('tab',{name:'Methods & sources',exact:true}).click();
  await page.getByRole('heading',{name:'What this can and can’t tell you'}).waitFor();
  await screenshot(page,'05-chromium-methods',true);
  // All current scenario settings retain truthful labels and protected exclusions.
  await page.getByRole('tab',{name:'Compare',exact:true}).click();
  await page.locator('#alpha').fill('0');
  assert.equal(await page.locator('[data-plan=aware] h2').innerText(),'Business-cost optimized');
  assert.equal(await page.locator('path.protected-tract.is-cut').count(),0);
  for(const width of [320,375,390,414,768,1440]){
    await page.setViewportSize({width,height:900});
    for(const mode of ['Compare','Explore','Prepare','Evidence']){
      await page.getByRole('tab',{name:mode,exact:true}).click();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),
        `${mode} overflows at ${width}`);
    }
  }
  await browser.close();console.log('Chromium: maps, arrows, shared selection, zoom, all modes and widths passed.');
}
async function safari(){
  const browser=await webkit.launch({headless:true});browsers.push(browser);
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,
    isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  await prepare(page);await assertMaps(page);
  await screenshot(page,'01-webkit-iphone-default');
  await page.locator('.comparison-maps').scrollIntoViewIfNeeded();
  await screenshot(page,'02-webkit-iphone-map');
  const point=await mapPoint(page,'typical',69);
  await page.touchscreen.tap(point.x,point.y);
  await page.locator('.zone-sheet[open]').waitFor();
  assert.equal(await page.locator('#sheet-zone').inputValue(),'69');
  const sheet=await page.locator('.zone-sheet').boundingBox();
  assert.ok(sheet.y>=0&&sheet.y+sheet.height<=845,'Sheet must fit the visible phone viewport');
  assert.equal(await page.locator('.zone-sheet').evaluate(el=>getComputedStyle(el).opacity),'1');
  await screenshot(page,'06-webkit-iphone-bottom-sheet');
  await page.getByRole('button',{name:'Close',exact:true}).click();
  // Pointer-pinch input exercises Safari's two-finger path without a network map library.
  const svg=page.locator('[data-map=typical]'),box=await svg.boundingBox();
  const center={x:box.x+box.width/2,y:box.y+box.height/2};
  const before=await svg.locator('.map-transform').getAttribute('transform');
  await svg.evaluate(el=>{el.setPointerCapture=()=>{};});
  for(const [id,x] of [[21,center.x-30],[22,center.x+30]])
    await svg.dispatchEvent('pointerdown',{pointerId:id,pointerType:'touch',clientX:x,
      clientY:center.y,button:0,bubbles:true});
  await svg.dispatchEvent('pointermove',{pointerId:22,pointerType:'touch',
    clientX:center.x+70,clientY:center.y,button:0,bubbles:true});
  const after=await svg.locator('.map-transform').getAttribute('transform');
  assert.notEqual(before,after);
  await svg.dispatchEvent('pointercancel',{pointerId:21,pointerType:'touch'});
  await page.getByRole('button',{name:'Vulnerability-aware',exact:true}).click();
  assert.equal(await page.locator('[data-map=aware]').isVisible(),true);
  assert.equal(await page.locator('[data-map=typical]').isVisible(),false);
  for(const width of [320,375,390,414]){
    await page.setViewportSize({width,height:844});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  await browser.close();console.log('WebKit iPhone: actual tract tap, bottom sheet, pinch, plan toggle and widths passed.');
}
(async()=>{
 fs.mkdirSync(output,{recursive:true});await desktop();await safari();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 console.log('No browser errors or external runtime requests.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>Promise.all(browsers.map(b=>b.close())));
