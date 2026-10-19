// Verify rendered text and semantic graphic colors against their actual backgrounds.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(process.env.SMOKE_URL || 'http://127.0.0.1:5173');
  await page.locator('#compare-zone').waitFor();
  for (const width of [1440, 390]) for (const screen of ['plans', 'changes', 'counties', 'range', 'robust', 'forecast', 'methods']) {
    const evidence = ['robust', 'forecast', 'methods'].includes(screen);
    await page.getByRole('tab', { name: evidence ? 'Evidence' : 'Compare', exact: true }).click();
    await page.locator(`#${evidence ? 'evidence' : 'compare'}-tab-${screen}`).click();
    await page.setViewportSize({ width, height: 1000 });

    const result = await page.evaluate(() => {
      const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      function rgb(color) { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); }
      function lum(color) { const [r, g, b] = rgb(color).map(c => { const v = c / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; }
      function ratio(a, b) { const values = [lum(a), lum(b)].sort((a, b) => b - a); return (values[0] + .05) / (values[1] + .05); }
      function bg(el) { while (el) { const color = getComputedStyle(el).backgroundColor; if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color; el = el.parentElement; } return getComputedStyle(document.body).backgroundColor; }
      const iterator = document.createNodeIterator(document.body, NodeFilter.SHOW_TEXT), failures = [];
      let node, min = 100, count = 0;
      while ((node = iterator.nextNode())) {
        if (!node.textContent.trim()) continue;
        const el = node.parentElement;
        if (!el || ['SCRIPT', 'STYLE', 'OPTION', 'TITLE', 'NOSCRIPT'].includes(el.tagName.toUpperCase()) || el.closest('[hidden],.sr-only,.inline-help:not([open])>p') || !el.getClientRects().length) continue;
        const style = getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || el.closest('button:disabled')) continue;
        const fg = el.namespaceURI.includes('svg') ? style.fill : style.color;
        if (fg === 'none') continue;
        const value = ratio(fg, bg(el)), large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
        const need = large ? 3 : 4.5;
        min = Math.min(min, value); count++;
        if (value < need) failures.push({ text: node.textContent.trim().slice(0, 70), ratio: value, need, color: fg, bg: bg(el) });
      }
      const css = getComputedStyle(document.documentElement), token = name => css.getPropertyValue(name).trim();
      const graphics = [['cut vs highest map shade', '--color-warning', '--color-map4'], ['district boundary vs map', '--color-positive', '--color-paper'], ['plan dots vs chart', '--color-dot', '--color-sidebar'], ['focus vs page', '--color-accent', '--color-paper']].map(([label, a, b]) => ({ label, ratio: ratio(token(a), token(b)) }));
      return { count, min, failures, graphics };
    });
    console.log(`${width}px ${screen}: ${result.count} text nodes checked; lowest contrast ${result.min.toFixed(2)}:1.`);
    if (result.failures.length) console.log(JSON.stringify(result.failures.slice(0, 12), null, 2));
    console.log(result.graphics.map(g => `${g.label}: ${g.ratio.toFixed(2)}:1`).join('\n'));
    assert.equal(result.failures.length, 0);
    assert.ok(result.graphics.every(g => g.ratio >= 3));

  }
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
