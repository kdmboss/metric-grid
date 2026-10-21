import test from 'node:test';
import assert from 'node:assert/strict';
import { isNative, isAppShell, lightImpact, initializeNativeShell } from './platform.js';

test('native bridges are safe and inert outside a native host', async () => {
  assert.equal(isNative(), false);
  assert.equal(isAppShell(), false);
  await lightImpact();
  assert.doesNotThrow(initializeNativeShell);
});
