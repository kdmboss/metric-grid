// Acceptance checks for the map-first workspace. Uses the existing Playwright runtime.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const base = process.env.SMOKE_URL || 'http://127.0.0.1:5173';
const output = path.resolve('artifacts');

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXECUTABLE ? { executablePath: process.env.BROWSER_EXECUTABLE } : { channel: 'chrome' }) });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errors = [], external = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin && /^https?:/.test(url.protocol)) { external.push(url.href); return route.abort(); }
    return route.continue();
  });
  await page.goto(base);
  await page.getByRole('heading', { name: /Same power cut/ }).waitFor();
  assert.match(await page.locator('.people-results').innerText(), /5,484[\s\S]*8,896[\s\S]*73%[\s\S]*2,543/);
  assert.equal(await page.locator('.community-section').count(), 0);
  assert.equal(await page.locator('.author-story').count(), 0);
  assert.equal(await page.getByRole('tab', { name: 'Compare', exact: true }).getAttribute('aria-selected'), 'true');
  assert.equal(await page.locator('#compare-plans').isVisible(), true);
  assert.equal(await page.locator('.priority-section').isVisible(), false);
  assert.equal(await page.locator('#panel-evidence').isVisible(), false);
  assert.equal(await page.locator('.brand').first().innerText(), 'METRIC-Grid');
  assert.match(await page.title(), /METRIC-Grid/);
  assert.match(await page.locator('.story-eyebrow').innerText(), /Christmas Eve 2022.*6:14 a.m..*10 °F[\s\S]*500,000/);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: `${output}/ui_first_screen_1440.png` });
  await page.screenshot({ path: `${output}/ui_full_page_1440.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('tab', { name: 'Two plans', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('#compare-changes').isVisible(), true);
  await page.keyboard.press('Home');
  assert.equal(await page.locator('#compare-plans').isVisible(), true);
  await page.locator('.map-options summary').click();
  assert.equal(await page.getByRole('checkbox', { name: 'Difference map', exact: true }).isChecked(), false);
  await page.getByRole('checkbox', { name: 'Difference map', exact: true }).check();
  assert.equal(await page.locator('#compare-changes').isVisible(), true);
  await page.locator('.map-options summary').click();
  await page.getByRole('checkbox', { name: 'Difference map', exact: true }).uncheck();
  assert.equal(await page.locator('[data-map=difference]').count(), 0);
  await page.getByRole('checkbox', { name: 'Show difference map', exact: true }).check();
  await page.getByRole('tab', { name: 'Explore', exact: true }).click();
  assert.equal(await page.locator('#panel-explore .tract').count(), 183);
  console.log('Compare-first navigation, official branding, sourced opener, and empty optional content passed.');

  await page.selectOption('#map-layer', 'heat');
  assert.match(await page.locator('#panel-explore .workspace-legend').innerText(), /Electric-heat homes/);
  await page.selectOption('#map-layer', 'load');
  assert.match(await page.locator('#panel-explore .workspace-legend').innerText(), /modeled MW/);
  await page.selectOption('#county-filter', 'Union County');
  assert.ok(await page.locator('#panel-explore .filtered-out').count() > 0);
  const transform = () => page.locator('#panel-explore .map-transform').getAttribute('transform');
  const fitted = await transform();
  await page.getByRole('button', { name: 'Zoom in explore map', exact: true }).click();
  assert.notEqual(await transform(), fitted);
  const svg = page.locator('#panel-explore .interactive-map'); const rect = await svg.boundingBox();
  const beforePan = await transform();
  await page.mouse.move(rect.x + rect.width * .5, rect.y + rect.height * .5); await page.mouse.down(); await page.mouse.move(rect.x + rect.width * .5 + 55, rect.y + rect.height * .5 + 30, { steps: 8 }); await page.mouse.up();
  assert.notEqual(await transform(), beforePan);
  await page.getByRole('button', { name: 'Reset explore map view' }).click();
  assert.equal(await transform(), fitted);
  await page.selectOption('#county-filter', '');
  console.log('Layers, county fitting, zoom, pan, and reset passed.');
  await page.selectOption('#map-layer', 'vulnerability');
  await page.locator('.map-options summary').click();
  await page.getByRole('checkbox', { name: 'Protected facilities', exact: true }).uncheck();
  assert.equal(await page.locator('#panel-explore .protected-tract').count(), 0);
  await page.getByRole('checkbox', { name: 'District boundary', exact: true }).uncheck();
  assert.equal(await page.locator('#panel-explore .district-boundary').count(), 0);
  await page.getByRole('checkbox', { name: 'Protected facilities', exact: true }).check();
  await page.getByRole('checkbox', { name: 'District boundary', exact: true }).check();
  await page.locator('.map-options summary').click();
  await page.locator('#zone-search').fill('37025041507');
  await page.locator('.search-results button').first().click();
  assert.equal(await page.locator('#zone').inputValue(), '17');
  await page.locator('#zone-search').fill('zzzz-no-match');
  assert.match(await page.locator('.search-results').innerText(), /No matching/);
  await page.locator('#zone-search').fill('');
  await page.selectOption('#zone', '9');
  assert.match(await page.locator('#panel-explore .zone-note').innerText(), /SVI is missing/);
  await page.selectOption('#zone', '17');
  console.log('Search, overlays, and missing-data inspection passed.');
  const mapTarget = page.locator('#panel-explore path[data-zone="141"]');
  await mapTarget.click({ force: true });
  // Complex multipolygons can have an empty bounding-box center; select using a real path point.
  const chosen = await page.locator('#zone').inputValue();
  if (chosen !== '141') {
    const p = await mapTarget.evaluate(el => { const box = el.getBBox(); const svg = el.ownerSVGElement; for (let x = box.x; x <= box.x + box.width; x += box.width / 20) for (let y = box.y; y <= box.y + box.height; y += box.height / 20) if (el.isPointInFill(new DOMPoint(x, y))) { const pt = new DOMPoint(x, y).matrixTransform(el.getScreenCTM()); return { x: pt.x, y: pt.y }; } });
    await page.mouse.click(p.x, p.y);
  }
  assert.equal(await page.locator('#zone').inputValue(), '141');
  console.log('Map selection passed.');
  await page.getByRole('button', { name: /Add to planning shortlist/ }).filter({ visible: true }).click();
  await page.getByRole('tab', { name: /Prepare/ }).click();
  assert.equal(await page.locator('.shortlist-item').count(), 1);
  await page.getByLabel('Planning note for zone 141', { exact: true }).fill('=formula fixture, "quoted"\nInvestigate backup power.');
  await page.getByLabel('Follow-up for zone 141', { exact: true }).selectOption('Backup-power investigation');
  await page.reload(); await page.locator('.shortlist-item').waitFor();
  console.log('Shortlist editing and persistence passed.');
  assert.match(await page.getByLabel('Planning note for zone 141', { exact: true }).inputValue(), /Investigate backup/);
  const downloadPromise = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV ↓' }).click();
  const download = await downloadPromise; await download.saveAs(`${output}/shortlist.csv`);
  const csv = fs.readFileSync(`${output}/shortlist.csv`, 'utf8'); assert.match(csv, /reference_date/); assert.match(csv, /2013_usd/); assert.match(csv, /'\=formula fixture/);
  await page.getByRole('button', { name: 'Print view', exact: true }).click();
  assert.match(await page.locator('.print-sheet').innerText(), /2013 dollars[\s\S]*not an operational switching tool/);
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: `${output}/shortlist.pdf`, format: 'A4' });
  await page.emulateMedia({ media: 'screen' });
  if (await page.getByRole('button', { name: 'Close print view', exact: true }).count()) await page.getByRole('button', { name: 'Close print view', exact: true }).first().click();
  await page.getByRole('button', { name: 'Clear shortlist', exact: true }).click();
  assert.equal(await page.locator('.shortlist-item').count(), 0);
  await page.getByRole('button', { name: 'Undo clear', exact: true }).click();
  assert.equal(await page.locator('.shortlist-item').count(), 1);
  await page.getByRole('button', { name: 'Remove zone 141', exact: true }).click();
  assert.match(await page.locator('.empty-shortlist').innerText(), /Start with a place/);

  await page.getByRole('tab', { name: 'Explore', exact: true }).click();
  await page.locator('[data-map=explore] .tract').first().dispatchEvent('mouseenter');
  // React mouseenter uses mouseover internally.
  await page.locator('[data-map=explore] .tract').first().dispatchEvent('mouseover');
  assert.equal(await page.locator('#panel-explore .map-hover').count(), 1);
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  await page.getByRole('tab', { name: 'Explore', exact: true }).click();
  assert.equal(await page.locator('#panel-explore .map-hover').count(), 0);
  await page.locator('[data-map=explore] .tract').first().dispatchEvent('mouseover');
  await page.locator('[data-map=explore] .tract').first().dispatchEvent('mouseout');
  assert.equal(await page.locator('#panel-explore .map-hover').count(), 0);
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  const frozen = await page.evaluate(() => fetch('/data/app.json').then(r => r.json()));
  for (const record of frozen.records.filter(r => r.solved)) {
    await page.evaluate(r => {
      const q = new URLSearchParams({ mode: 'compare', section: 'plans', alpha: r.alpha, pct: r.target_key === 'elliott' ? '' : r.target_key, cap: r.cap ? '1' : '0', zone: '69' });
      history.pushState(null, '', `?${q}`); window.dispatchEvent(new PopStateEvent('popstate'));
    }, record);
    await page.waitForFunction(r => ['typical', 'aware'].every((id, i) => { const actual = [...document.querySelectorAll(`[data-map=${id}] .is-cut`)].map(n => Number(n.dataset.zone)).sort((a, b) => a - b); return JSON.stringify(actual) === JSON.stringify([...(i ? r.weighted : r.baseline).zone_ids].sort((a, b) => a - b)); }), record);
    for (const id of ['typical', 'aware']) {
      const protectedIds = frozen.zones.features.filter(f => f.properties.protected).map(f => f.properties.zone_id);
      assert.equal(await page.locator(`[data-map=${id}] .protected-tract.is-cut`).count(), 0);
      assert.equal(await page.locator(`[data-map=${id}] .is-cut`).evaluateAll((nodes, protectedIds) => nodes.some(n => protectedIds.includes(Number(n.dataset.zone))), protectedIds), false);
    }
  }
  await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
  console.log('Tooltip tab/leave regression and protected-zone rendering across all 40 scenarios passed.');
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  await page.getByRole('tab', { name: 'What changed?', exact: true }).click();
  assert.equal(await page.getByRole('checkbox', { name: 'Show difference map' }).isChecked(), true);
  assert.equal(await page.locator('[data-map=difference] .tract').count(), 183);
  assert.equal((await page.locator('[data-category-count]').allTextContents()).reduce((sum, v) => sum + Number(v.replaceAll(',', '')), 0), 183);
  await page.getByRole('tab', { name: 'County summary', exact: true }).click();
  assert.equal(await page.locator('#summary-county').inputValue(), 'Union County');
  const unionMw = await page.locator('[data-county-plan=weighted-mw]').innerText();
  await page.selectOption('#summary-county', 'Anson County');
  assert.notEqual(await page.locator('[data-county-plan=weighted-mw]').innerText(), unionMw);
  await page.selectOption('#summary-county', 'Union County');
  await page.getByRole('tab', { name: 'What changed?', exact: true }).click();
  for (const id of ['typical', 'aware', 'difference']) {
    await page.getByRole('tab', { name: id === 'difference' ? 'What changed?' : 'Two plans', exact: true }).click();
    assert.equal(await page.locator(`[data-map=${id}] .county-labels text`).count(), 9);
    assert.equal(await page.locator(`[data-map=${id}] .selected-zone-outline`).count(), 1);
    assert.equal(await page.locator(`[data-map=${id}] .county-labels text`).evaluateAll(labels => labels.every(label => {
      const point = new DOMPoint(Number(label.getAttribute('x')), Number(label.getAttribute('y')));
      return [...label.ownerSVGElement.querySelectorAll('path[data-zone]')].some(path => path.isPointInFill(point));
    })), true);
  }
  await page.getByRole('button', { name: 'Zoom to selected zone on difference map', exact: true }).click();
  const views = await page.locator('#panel-compare .map-transform').evaluateAll(nodes => nodes.map(n => n.getAttribute('transform')));
  assert.equal(new Set(views).size, 1);
  assert.doesNotMatch(views[0], /scale\(1\)/);
  await page.getByRole('button', { name: 'Reset difference map view', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Show difference map' }).uncheck();
  assert.equal(await page.locator('[data-map=difference]').count(), 0);
  await page.getByRole('checkbox', { name: 'Show difference map' }).check();
  await page.locator('.map-options summary').click();
  await page.getByRole('checkbox', { name: 'Protected facilities', exact: true }).uncheck();
  assert.equal(await page.locator('[data-map=difference] .protected-tract').count(), 26);
  await page.getByRole('checkbox', { name: 'Protected facilities', exact: true }).check();
  await page.locator('.map-options summary').click();
  for (const id of ['typical', 'aware', 'difference']) {
    await page.getByRole('tab', { name: id === 'difference' ? 'What changed?' : 'Two plans', exact: true }).click();
    const file = `${output}/map_${id}.png`;
    await page.locator(`[data-map=${id}]`).screenshot({ path: file });
    execFileSync(process.env.PYTHON || '.venv/bin/python', ['-c', 'from PIL import Image, ImageStat; import sys; im=Image.open(sys.argv[1]).convert("RGB"); assert max(ImageStat.Stat(im).stddev)>8, "Flat map pixels"; assert len(im.getcolors(im.width*im.height))>20, "Insufficient map color variance"', file]);
  }
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.getByRole('tab', { name: 'What changed?', exact: true }).click();
  await page.locator('.difference-panel').screenshot({ path: `${output}/ui_what_changed.png` });
  await page.getByRole('tab', { name: 'County summary', exact: true }).click();
  await page.locator('.county-summary').screenshot({ path: `${output}/ui_county_summary.png` });
  await page.setViewportSize({ width: 1440, height: 1000 });
  console.log('Difference counts, local label placement, selected outlines, synchronized selected-zone zoom, county summaries, and pixel-variance map checks passed.');
  await page.locator('#alpha').fill('0');
  assert.match(await page.locator('.people-results').innerText(), /13,098[\s\S]*52% higher/);
  await page.screenshot({ path: `${output}/ui_cost_priority.png` });
  await page.locator('#alpha').fill('4');
  await page.screenshot({ path: `${output}/ui_priority1.png` });
  await page.getByRole('checkbox', { name: /Limit county concentration/ }).check();
  assert.match(await page.locator('.concentration-strip').innerText(), /cap is applied to both plans/);
  await page.screenshot({ path: `${output}/ui_cap_on.png` });
  await page.getByRole('button', { name: '20%', exact: true }).click();
  assert.match(await page.locator('.people-results').innerText(), /337.3/);
  await page.getByRole('tab', { name: 'Two plans', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom in typical map', exact: true }).click();
  assert.equal(await page.locator('[data-map=typical] .map-transform').getAttribute('transform'), await page.locator('[data-map=aware] .map-transform').getAttribute('transform'));
  await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
  assert.match(await page.locator('.people-results').innerText(), /5,484/);
  await page.screenshot({ path: `${output}/ui_compare_full.png`, fullPage: true });
  await page.getByRole('button', { name: 'Export scenario ↓', exact: true }).click();
  await page.getByRole('tab', { name: 'Plan range', exact: true }).click();
  assert.equal(await page.locator('.distribution-section').isVisible(), true);
  assert.equal(await page.locator('#compare-plans').isVisible(), false);
  await page.getByRole('tab', { name: 'Evidence', exact: true }).click();
  assert.equal(await page.locator('#robust').isVisible(), true);
  await page.getByRole('button', { name: 'Methods & sources', exact: true }).click();
  await page.locator('.district-sentence').waitFor({ state: 'visible' });
  assert.match(await page.locator('.district-sentence').innerText(), /not observed utility circuit values/);
  await page.getByRole('tab', { name: 'Forecast', exact: true }).click();
  assert.equal(await page.locator('#forecast').isVisible(), true);
  assert.equal(await page.locator('#robust').isVisible(), false);
  await page.getByRole('tab', { name: 'Explore', exact: true }).click();
  await page.locator('.examples-disclosure summary').click();
  assert.equal(await page.locator('.example-locations article').count(), 3);

  for (const width of [320, 375, 390, 414, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.getByRole('tab', { name: 'Explore', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Horizontal overflow at ${width}`);
    const clipped = await page.evaluate(() => [...document.querySelectorAll('button,select,input,h1,h2,.people-results article')].filter(el => { const r = el.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || (el.tagName === 'BUTTON' && el.scrollWidth > el.clientWidth + 2)); }).map(el => el.textContent.trim()));
    assert.deepEqual(clipped, [], `Clipped controls at ${width}`);
    await page.getByRole('tab', { name: 'Compare', exact: true }).click();
    await page.getByRole('tab', { name: 'Two plans', exact: true }).click();
    await page.evaluate(() => window.scrollTo(0, 0));
    if (width === 390 || width === 1024 || width === 1440) await page.screenshot({ path: `${output}/ui_${width === 390 ? 'phone_390' : width === 1024 ? 'tablet_1024' : 'first_screen_1440'}.png` });
    if (width === 390) await page.screenshot({ path: `${output}/ui_phone_full.png`, fullPage: true });
    await page.getByRole('tab', { name: 'Compare', exact: true }).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Compare overflow at ${width}`);
    if (width === 390) { await page.getByRole('tab', { name: 'What changed?', exact: true }).click(); await page.setViewportSize({ width, height: 1400 }); await page.locator('.difference-panel').screenshot({ path: `${output}/ui_what_changed_phone.png` }); await page.getByRole('tab', { name: 'County summary', exact: true }).click(); await page.locator('.county-summary').screenshot({ path: `${output}/ui_county_summary_phone.png` }); await page.setViewportSize({ width, height: 900 }); }
    console.log(`Responsive layout: ${width}px passed`);
  }
  await page.goto(`${base}/?alpha=1&pct=10&cap=1&zone=23&mode=compare`); await page.locator('#compare-zone').waitFor();
  assert.equal(await page.locator('#compare-zone').inputValue(), '23'); assert.equal(await page.locator('#alpha').inputValue(), '4');
  await page.goto(`${base}/?alpha=nope&pct=NaN&zone=9999&mode=invalid`); await page.locator('#compare-zone').waitFor();
  assert.match(await page.locator('.people-results').innerText(), /5,484/);
  assert.equal(await page.getByRole('tab', { name: 'Compare', exact: true }).getAttribute('aria-selected'), 'true');
  assert.deepEqual(errors, []); assert.deepEqual(external, []);
  console.log('Passed: maps, synchronized zoom/pan, layers, filters, search, both priority extremes, county cap, deep links, shortlist CRUD/persistence/CSV/print/undo, evidence, empty optional content, and no external requests.');

  const failedStorage = await browser.newContext();
  await failedStorage.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage fixture unavailable'); } }); });
  const failedPage = await failedStorage.newPage(); await failedPage.goto(base);
  await failedPage.getByText(/Browser storage is unavailable/).waitFor();
  console.log('Storage failure is visible; session-only planning remains usable.');
  await failedStorage.close();

  const contentPage = await context.newPage();
  await contentPage.route('**/data/app.json', async route => {
    const response = await route.fetch(); const json = await response.json();
    json.content = { quotes: [{ name: 'Acceptance fixture', role: 'Test only', quote: '<img src=x onerror=window.__injected=true>' }], story: '<script>window.__injected=true</script>' };
    await route.fulfill({ response, json });
  });
  await contentPage.goto(base); await contentPage.getByRole('tab', { name: 'Evidence', exact: true }).click(); await contentPage.locator('.author-story').waitFor();
  assert.match(await contentPage.locator('.author-story').innerText(), /<script>/);
  assert.equal(await contentPage.locator('.community-section img').count(), 0);
  assert.equal(await contentPage.evaluate(() => window.__injected), undefined);
  console.log('Optional content is rendered as safe text.');
  const missingPage = await context.newPage();
  await missingPage.route('**/data/app.json', route => route.fulfill({ status: 404, body: 'Not found' }));
  await missingPage.goto(base);
  await missingPage.getByRole('heading', { name: 'The scenario data is unavailable.' }).waitFor();
  console.log('Missing deployment data shows a recovery state.');
  await browser.close();
}
main().catch(e => { console.error(e); process.exit(1); });
