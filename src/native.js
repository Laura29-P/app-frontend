import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

export const isNative = Capacitor.isNativePlatform();

export async function openCheckout(url) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.hostname !== 'checkout.stripe.com') {
    throw new Error('La dirección de pago no es válida.');
  }
  if (isNative) {
    await Browser.open({ url, toolbarColor: '#2563eb' });
  } else {
    window.location.assign(url);
  }
}

export function checkoutReturnPath(rawUrl) {
  let url;
  try { url = new URL(rawUrl); } catch { return null; }
  if (url.protocol !== 'aventurakids:' || url.hostname !== 'billing' || url.pathname !== '/return') return null;
  const status = url.searchParams.get('subscription');
  if (status === 'cancelled') return '/?subscription=cancelled';
  const session = url.searchParams.get('session_id');
  if (status !== 'success' || !/^cs_[a-zA-Z0-9_]{1,250}$/.test(session || '')) return null;
  return '/?subscription=success&session_id=' + encodeURIComponent(session);
}

export async function initializeNative() {
  if (!isNative) return;
  const acceptReturn = ({ url }) => {
    const path = checkoutReturnPath(url);
    if (path && window.location.pathname + window.location.search !== path) window.location.replace(path);
  };
  await App.addListener('appUrlOpen', acceptReturn);
  const launch = await App.getLaunchUrl();
  if (launch?.url) acceptReturn(launch);
}
