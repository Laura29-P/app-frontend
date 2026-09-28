import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
const worker = await readFile('dist/sw.js', 'utf8');

function harness() {
  const handlers = {};
  const state = { cached: [], deleted: [], skipWaiting: false, claimed: false, offline: false };
  const cache = {
    addAll: async (urls) => { state.cached = urls; },
    match: async (url) => ({ cached: url }),
  };
  const context = {
    URL,
    self: {
      location: { origin: 'https://aventura.example' },
      addEventListener: (name, handler) => { handlers[name] = handler; },
      skipWaiting: () => { state.skipWaiting = true; },
      clients: { claim: async () => { state.claimed = true; } },
    },
    caches: {
      open: async () => cache,
      keys: async () => ['aventura-static-old', 'another-app-cache'],
      delete: async (key) => { state.deleted.push(key); },
    },
    fetch: async (request) => {
      if (state.offline) throw new Error('offline');
      return { network: request.url };
    },
  };
  vm.runInNewContext(worker, context);
  async function lifecycle(name) {
    let work;
    handlers[name]({ waitUntil: (promise) => { work = promise; } });
    await work;
  }
  async function request(path, options = {}) {
    let result;
    handlers.fetch({
      request: { url: new URL(path, context.self.location.origin).href, method: 'GET', mode: 'cors', ...options },
      respondWith: (promise) => { result = promise; },
    });
    return result;
  }
  return { handlers, state, lifecycle, request };
}

test('Android manifest has a stable identity, standalone display and valid PNG icons', async () => {
  assert.equal(manifest.id, '/');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  assert.equal(manifest.display, 'standalone');
  for (const size of ['192x192', '512x512']) assert.ok(manifest.icons.some((icon) => icon.sizes === size && icon.purpose === 'any'));
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
  for (const icon of manifest.icons) {
    const png = await readFile(`dist${icon.src}`);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, icon.sizes);
  }
});

test('installation precaches public build files, never HTML app shell or API data', async () => {
  const app = harness();
  await app.lifecycle('install');
  assert.ok(app.state.cached.includes('/offline.html'));
  assert.ok(app.state.cached.some((url) => url.endsWith('.js')));
  assert.ok(!app.state.cached.includes('/index.html'));
  for (const url of app.state.cached) {
    assert.ok(!url.startsWith('/api/'));
    await readFile(`dist${url}`);
  }
  assert.equal(app.state.skipWaiting, false);
});

test('authenticated API, mutations, Stripe and external resources bypass the worker', async () => {
  const app = harness();
  assert.equal(await app.request('/api/account/access'), undefined);
  assert.equal(await app.request('/api/progress', { method: 'PUT' }), undefined);
  assert.equal(await app.request('/api/billing/confirm', { method: 'POST' }), undefined);
  assert.equal(await app.request('https://checkout.stripe.com/c/pay/test', { mode: 'navigate' }), undefined);
  assert.equal(await app.request('https://fonts.googleapis.com/css2'), undefined);
});

test('navigation uses network, preserves payment query and offers an offline fallback', async () => {
  const app = harness();
  const path = '/?subscription=success&session_id=cs_test_example';
  const online = await app.request(path, { mode: 'navigate' });
  assert.equal(online.network, `https://aventura.example${path}`);
  app.state.offline = true;
  const offline = await app.request(path, { mode: 'navigate' });
  assert.equal(offline.cached, '/offline.html');
});

test('activation only deletes this app caches; updates require explicit message', async () => {
  const app = harness();
  await app.lifecycle('activate');
  assert.deepEqual(app.state.deleted, ['aventura-static-old']);
  assert.equal(app.state.claimed, true);
  assert.equal(app.state.skipWaiting, false);
  app.handlers.message({ data: { type: 'SKIP_WAITING' } });
  assert.equal(app.state.skipWaiting, true);
});
