import React, { useEffect, useState } from 'react';

export default function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [update, setUpdate] = useState(null);
  const [offline, setOffline] = useState(!navigator.onLine);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const offerInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const installed = () => setInstallPrompt(null);
    const connection = () => setOffline(!navigator.onLine);
    window.addEventListener('beforeinstallprompt', offerInstall);
    window.addEventListener('appinstalled', installed);
    window.addEventListener('online', connection);
    window.addEventListener('offline', connection);
    return () => {
      window.removeEventListener('beforeinstallprompt', offerInstall);
      window.removeEventListener('appinstalled', installed);
      window.removeEventListener('online', connection);
      window.removeEventListener('offline', connection);
    };
  }, []);

  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator) || !window.isSecureContext) return;
    let disposed = false;
    let registration;
    let installingWorker;
    const onState = () => {
      if (!disposed && installingWorker?.state === 'installed' && navigator.serviceWorker.controller) {
        setUpdate(registration);
      }
    };
    const onUpdate = () => {
      installingWorker?.removeEventListener('statechange', onState);
      installingWorker = registration.installing;
      installingWorker?.addEventListener('statechange', onState);
    };
    const checkUpdate = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) registration?.update().catch(() => {});
    };
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((reg) => {
      if (disposed) return;
      registration = reg;
      if (reg.waiting) setUpdate(reg);
      reg.addEventListener('updatefound', onUpdate);
      if (reg.installing) onUpdate();
    }).catch((error) => console.warn('No se pudo activar la PWA:', error));
    document.addEventListener('visibilitychange', checkUpdate);
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', checkUpdate);
      registration?.removeEventListener('updatefound', onUpdate);
      installingWorker?.removeEventListener('statechange', onState);
    };
  }, []);

  const install = async () => {
    if (!installPrompt || installing) return;
    setInstalling(true);
    try {
      await installPrompt.prompt();
      await installPrompt.userChoice;
    } finally {
      setInstallPrompt(null);
      setInstalling(false);
    }
  };
  const applyUpdate = () => {
    if (!update?.waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
    update.waiting.postMessage({ type: 'SKIP_WAITING' });
  };
  if (!offline && !installPrompt && !update) return null;
  return (
    <aside aria-label="Aplicación" className="fixed z-50 left-3 right-3 bottom-24 md:left-auto md:right-6 md:bottom-6 md:max-w-sm rounded-2xl bg-white border border-blue-200 shadow-lg p-4 text-sm text-slate-800">
      {offline ? <p role="status">Sin conexión. Conéctate para guardar tu progreso y comprobar tu plan.</p> : update ? <>
        <p>Hay una nueva versión. Actualiza al terminar tu ejercicio.</p>
        <button onClick={applyUpdate} className="mt-2 rounded-full bg-blue-600 px-4 py-2 font-bold text-white">Actualizar</button>
      </> : <>
        <p>Ten Aventura Kids en la pantalla de inicio.</p>
        <button onClick={install} disabled={installing} className="mt-2 rounded-full bg-blue-600 px-4 py-2 font-bold text-white">Instalar aplicación</button>
        <button onClick={() => setInstallPrompt(null)} className="ml-3 p-2 font-bold">Ahora no</button>
      </>}
    </aside>
  );
}
