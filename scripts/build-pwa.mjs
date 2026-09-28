import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, relative, sep } from 'node:path';

const root = resolve('dist');
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? filesIn(resolve(directory, entry.name)) : resolve(directory, entry.name)))).flat();
}
const files = (await filesIn(root)).filter((path) => !path.endsWith(`${sep}sw.js`)).sort();
const hash = createHash('sha256');
for (const path of files) hash.update(relative(root, path)).update(await readFile(path));
const version = hash.digest('hex').slice(0, 16);
// Only public, build-generated files are cached. API responses and payment URLs never are.
const assets = files.filter((path) => !path.endsWith(`${sep}index.html`))
  .map((path) => '/' + relative(root, path).split(sep).join('/'));
const worker = `const CACHE = 'aventura-static-${version}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('aventura-static-') && key !== CACHE)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin
    || url.pathname === '/api' || url.pathname.startsWith('/api/')) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match('/offline.html'))));
  } else if (!url.search && ASSETS.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
`;
await writeFile(resolve(root, 'sw.js'), worker);
console.log(`PWA ${version}: ${assets.length} public assets, network-only API.`);
