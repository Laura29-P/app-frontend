import React, { useState } from 'react';
import { API_URL } from '../api.js';
import { useAppState } from '../context/AppStateContext.jsx';

const PLAN_OPTIONS = [
  {
    key: 'basic',
    name: 'Básico',
    price: '50 MXN / mes',
    badge: 'Inicial',
    description: 'Perfecto para empezar con una base divertida y ligera.',
    features: [
      'Acceso a Matemáticas',
      'Hasta 5 ejercicios por tema',
      'Ideal para empezar a aprender',
    ],
    accent: 'from-amber-100 to-orange-50',
    border: 'border-amber-200',
    button: 'bg-amber-500 text-white',
    recommended: false,
  },
  {
    key: 'family',
    name: 'Familiar',
    price: '20 MXN / mes',
    badge: 'Más popular',
    description: 'Añade más variedad para seguir aprendiendo en varios ámbitos.',
    features: [
      'Todo lo del plan Básico',
      'Acceso a Matemáticas e Inglés',
      'Hasta 10 ejercicios por tema',
      'Más desafíos y progreso',
    ],
    accent: 'from-sky-100 to-blue-50',
    border: 'border-sky-200',
    button: 'bg-sky-600 text-white',
    recommended: true,
  },
  {
    key: 'premium',
    name: 'Pro',
    price: '150 MXN / mes',
    badge: 'Completo',
    description: 'La opción máxima para explorar todo el contenido educativo.',
    features: [
      'Todo lo del plan Familiar',
      'Acceso a Matemáticas, Inglés y Geografía',
      'Ejercicios avanzados y más libertad',
      'Experiencia completa para toda la familia',
    ],
    accent: 'from-violet-100 to-fuchsia-50',
    border: 'border-violet-200',
    button: 'bg-violet-600 text-white',
    recommended: false,
  },
];

export default function Plans() {
  const { auth, subscription, subscriptionSuccess, subscriptionError } = useAppState();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const currentPlan = subscription?.plan || 'basic';

  const startCheckout = async (planKey) => {
    if (!auth?.token || checkoutLoading) return;
    setCheckoutLoading(true);

    try {
      const response = await fetch(`${API_URL}/billing/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ plan: planKey }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No se pudo iniciar el pago.');
      window.location.assign(data.url);
    } catch (error) {
      alert(error.message || 'No se pudo iniciar tu compra.');
      setCheckoutLoading(false);
    }
  };

  return (
    <section className="w-full py-4 animate-pop">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center rounded-full bg-primary-container px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-on-primary-container">
          Planes
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black text-on-surface">Elige tu aventura</h1>
        <p className="mt-2 text-sm sm:text-base text-on-surface-variant font-semibold">
          Cada plan incluye contenido pensado para aprender jugando, con niveles adaptados a cada edad.
        </p>
        {subscriptionError && <p role="alert" className="mt-4 text-sm font-bold text-error">{subscriptionError}</p>}
        {subscriptionSuccess && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>¡Pago confirmado! Tu plan ya está activo.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLAN_OPTIONS.map((plan) => {
          const isCurrent = currentPlan === plan.key;

          return (
            <div
              key={plan.key}
              className={`relative overflow-hidden rounded-[28px] border-2 p-5 sm:p-6 shadow-sm ${plan.border} bg-gradient-to-br ${plan.accent}`}
            >
              {plan.recommended && (
                <div className="absolute right-4 top-4 rounded-full bg-sky-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                  {plan.badge}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-on-surface-variant">{plan.badge}</p>
                  <h2 className="mt-2 text-2xl font-black text-on-surface">{plan.name}</h2>
                </div>
                {isCurrent && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-900">
                    Actual
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-3xl sm:text-4xl font-black text-on-surface">{plan.price}</span>
              </div>

              <p className="mt-3 text-sm font-semibold text-on-surface-variant">{plan.description}</p>

              <ul className="mt-5 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm font-bold text-on-surface">
                    <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[12px] text-emerald-600">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => startCheckout(plan.key)}
                className={`mt-6 w-full rounded-full px-4 py-3 text-sm font-black shadow-sm transition hover:brightness-105 ${plan.button} ${isCurrent ? 'opacity-75 cursor-default' : ''}`}
                disabled={isCurrent || checkoutLoading}
              >
                {isCurrent ? 'Plan actual' : checkoutLoading ? 'Abriendo pago...' : `Elegir ${plan.name}`}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
