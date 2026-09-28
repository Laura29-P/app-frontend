import { build, loadEnv } from 'vite';
import { spawnSync } from 'node:child_process';

const settings = loadEnv('android', process.cwd(), 'VITE_');
const api = process.env.VITE_API_URL || settings.VITE_API_URL;
let url;
try { url = new URL(api); } catch { throw new Error('Configura VITE_API_URL con la URL HTTPS del backend antes de compilar Android.'); }
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.hostname === 'localhost') {
  throw new Error('Android necesita una API HTTPS pública, sin credenciales ni parámetros en la URL.');
}
await build({ mode: 'android', define: { 'import.meta.env.VITE_API_URL': JSON.stringify(api.replace(/\/$/, '')) } });
const result = spawnSync(process.execPath, ['node_modules/@capacitor/cli/bin/capacitor', 'sync', 'android'], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
