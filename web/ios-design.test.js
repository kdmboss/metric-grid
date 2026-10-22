import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const sourceFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? sourceFiles(`${dir}/${entry.name}`)
      : /\.jsx?$/.test(entry.name) && !entry.name.includes('.test.')
        ? [`${dir}/${entry.name}`]
        : [],
  );

test('font-family token is Plus Jakarta Sans and is bundled, not fetched', () => {
  const tokens = readFileSync('tokens.css', 'utf8');
  assert.match(tokens, /--font-body:[^;]*Plus Jakarta Sans/);
  assert.doesNotMatch(tokens, /Inter\b/);
  assert.match(readFileSync('web/main.jsx', 'utf8'), /@fontsource-variable\/plus-jakarta-sans/);
  assert.doesNotMatch(readFileSync('index.html', 'utf8'), /fonts\.googleapis/);
});

test('no <select> renders anywhere in the app shell', () => {
  for (const file of sourceFiles('web'))
    assert.doesNotMatch(readFileSync(file, 'utf8'), /<select[\s>]/, `${file} renders a <select>`);
});

test('type scale tokens follow the Apple text styles', () => {
  const tokens = readFileSync('tokens.css', 'utf8');
  for (const [name, spec] of [
    ['large-title', '700 34px/41px'],
    ['title1', '700 28px/34px'],
    ['title2', '700 22px/28px'],
    ['title3', '600 20px/25px'],
    ['headline', '600 17px/22px'],
    ['body-text', '400 17px/22px'],
    ['callout', '400 16px/21px'],
    ['subhead', '400 15px/20px'],
    ['footnote', '400 13px/18px'],
    ['caption', '500 12px/16px'],
  ])
    assert.ok(tokens.includes(`--font-${name}: ${spec}`), name);
});
