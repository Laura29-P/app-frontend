import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

import { API_URL } from '../api.js';
import { isNative, openCheckout } from '../native.js';

export default function SubscriptionGate({ children }) {
  const { auth, logout, subscription: access, subscriptionLoading: loading, subscriptionError } = useAppState();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('basic');
  const [error, setError] = useState('');


  const startCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ plan: selectedPlan, client: isNative ? 'android' : 'web' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No se pudo iniciar el pago.');
      await openCheckout(data.url);
      setCheckoutLoading(false);
    } catch (checkoutError) {
      setError(checkoutError.message);
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface font-black">Comprobando acceso...</div>;
  if (access?.can_access) return children;

  return (
    <div className="min-h-screen bg-background px-5 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl bg-surface-container-lowest border border-surface-container p-7 text-center shadow-md">
        <div className="text-6xl mb-4" aria-hidden="true">🔒</div>
        <p className="text-xs font-black uppercase tracking-wider text-secondary">Aventura Kids</p>
        <h1 className="text-2xl font-black text-on-surface mt-2">{access ? 'Tu prueba terminó' : 'No se pudo comprobar tu acceso'}</h1>
        <p className="text-sm font-semibold text-on-surface-variant mt-3">Para seguir jugando y viendo tus personajes, un adulto debe activar la suscripción.</p>
        <div className="grid grid-cols-3 gap-2 mt-5">
          {[
            ['basic', 'Básico'],
            ['family', 'Familiar'],
            ['premium', 'Premium'],
          ].map(([value, label]) => (
            <button
              key={value}
              className={`rounded-2xl border-2 px-2 py-2 text-xs font-black ${selectedPlan === value ? 'border-primary bg-primary-container text-on-primary-container' : 'border-surface-container text-on-surface-variant'}`}
              onClick={() => setSelectedPlan(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="w-full mt-6 rounded-full bg-primary-container text-on-primary-container py-3.5 font-black tap-bounce disabled:opacity-60"
          onClick={startCheckout}
          disabled={checkoutLoading}
        >
          {checkoutLoading ? 'Abriendo pago...' : 'Activar suscripción'}
        </button>
        {(error || subscriptionError) && <p className="mt-4 text-sm font-bold text-error">{error || subscriptionError}</p>}
        <button className="mt-5 text-sm font-black text-secondary hover:underline" onClick={logout}>Cerrar sesión</button>
      </section>
    </div>
  );
}
