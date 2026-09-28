import React, { useState } from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

export default function Auth() {
  const { login, register } = useAppState();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegistering = mode === 'register';

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (isRegistering && !form.name.trim()) {
      setError('Escribe tu nombre para crear la cuenta.');
      return;
    }

    setSubmitting(true);
    try {
      if (isRegistering) {
        await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      } else {
        await login({ email: form.email.trim(), password: form.password });
      }
    } catch (requestError) {
      setError(requestError.message || 'No pudimos completar la solicitud. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 flex items-center justify-center">
      <section className="w-full max-w-md bg-surface rounded-[2rem] border border-surface-container-high shadow-[0_20px_60px_rgba(18,26,51,0.12)] p-6 sm:p-9">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-primary text-white text-3xl shadow-lg shadow-primary/20 mb-5">
            <span className="material-symbols-outlined text-[34px]">rocket_launch</span>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-secondary">Aventura Kids</p>
          <h1 className="text-3xl font-black text-on-surface mt-2">
            {isRegistering ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-on-surface-variant mt-2">
            {isRegistering ? 'Guarda tu progreso y empieza a aprender.' : 'Continúa donde lo dejaste.'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-surface-container mb-7">
          <button
            type="button"
            className={`py-2.5 rounded-xl text-sm font-black transition-colors ${!isRegistering ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`py-2.5 rounded-xl text-sm font-black transition-colors ${isRegistering ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Registrarme
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <label className="block">
              <span className="block text-sm font-black text-on-surface mb-2">Nombre</span>
              <input
                name="name"
                value={form.name}
                onChange={updateField}
                autoComplete="name"
                className="w-full rounded-2xl border border-surface-container-high bg-white px-4 py-3.5 text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="Tu nombre"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="block text-sm font-black text-on-surface mb-2">Correo electrónico</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              autoComplete="email"
              className="w-full rounded-2xl border border-surface-container-high bg-white px-4 py-3.5 text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="tu@correo.com"
              required
            />
          </label>

          <label className="block">
            <span className="block text-sm font-black text-on-surface mb-2">Contraseña</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
              className="w-full rounded-2xl border border-surface-container-high bg-white px-4 py-3.5 text-on-surface outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="Mínimo 8 caracteres"
              minLength={8}
              required
            />
          </label>

          {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-white font-black shadow-lg shadow-primary/20 transition hover:bg-primary-container disabled:opacity-60 tap-bounce"
          >
            {submitting ? 'Conectando...' : isRegistering ? 'Crear cuenta' : 'Entrar a mi aventura'}
          </button>
        </form>
      </section>
    </main>
  );
}