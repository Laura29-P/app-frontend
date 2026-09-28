import React from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

const TITLE_MAP = {
  home: 'Aprendizaje',
  subjects: 'Materias',
  progress: 'Mi Progreso',
  plans: 'Planes',
  game: 'Sesión de Juego',
  'memory-game': 'Mini juego',
};

const DESK_NAV_ITEMS = [
  { key: 'home', label: 'Inicio', icon: 'home' },
  { key: 'subjects', label: 'Materias', icon: 'school' },
  { key: 'progress', label: 'Mapa de Logros', icon: 'map' },
];

const CHARACTER_EMOJIS = { luna: '🦊', niko: '🐼', sol: '🦁', mara: '🐬' };

export default function Header() {
  const { state, navigate, selectAge, isGrandeUnlocked, subscription, logout } = useAppState();
  const progressLocked = subscription?.plan === 'basic';
  const planOrder = ['basic', 'family', 'premium'];
  const planLabels = {
    basic: 'Básico',
    family: 'Familiar',
    premium: 'Pro',
  };

  const normalizePlanKey = (planKey) => {
    const value = String(planKey || 'basic').trim().toLowerCase();
    if (value === 'pro' || value === 'premium') return 'premium';
    if (value === 'familiar') return 'family';
    if (value === 'basico') return 'basic';
    return value;
  };

  const currentPlan = normalizePlanKey(subscription?.plan || 'basic');
  const currentPlanIndex = planOrder.indexOf(currentPlan);
  const nextPlan = currentPlanIndex >= 0 && currentPlanIndex < planOrder.length - 1 ? planOrder[currentPlanIndex + 1] : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl pt-safe shadow-[0_2px_16px_rgba(18,26,51,0.06)] border-b border-surface-container/60">
      <div className="max-w-7xl mx-auto h-16 sm:h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <button
            aria-label="Inicio"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-1 bg-white border border-surface-container tap-bounce shrink-0 text-2xl"
            onClick={() => navigate('home')}
          >
            {CHARACTER_EMOJIS[state.selectedCharacter] || CHARACTER_EMOJIS.luna}
          </button>
          <div className="cursor-pointer" onClick={() => navigate('home')}>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-secondary leading-none">
                Aventura
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full">
                KIDS
              </span>
            </div>
            <span className="text-lg sm:text-xl font-black text-on-surface leading-tight">
              {TITLE_MAP[state.activeView] || 'Aventura'}
            </span>
          </div>
        </div>

        {/* Navegación central (desktop) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 bg-surface-container/70 p-1.5 rounded-full border border-surface-container-high shadow-inner">
          {DESK_NAV_ITEMS.map((item) => {
            const active = state.activeView === item.key;
            return (
              <button
                key={item.key}
                className={`px-5 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                  active
                    ? 'bg-white text-primary shadow-sm font-black'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/60 font-bold'
                }`}
                onClick={() => navigate(item.key)}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Acciones a la derecha */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center bg-surface-container p-1 rounded-full text-xs font-bold border border-surface-container-high">
            <span className="px-2 text-[11px] text-on-surface-variant font-bold">Edad:</span>
            <button
              className={`px-3 py-1 rounded-full transition-all ${
                state.ageGroup === 'peques'
                  ? 'bg-white text-on-surface font-black shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface font-bold'
              }`}
              onClick={() => selectAge('peques')}
            >
              Peques (5-7)
            </button>
            <button
              disabled={!isGrandeUnlocked}
              title={isGrandeUnlocked ? 'Cambiar a Grandes (11-14)' : 'Completa las 30 misiones de Peques para desbloquear'}
              className={`px-3 py-1 rounded-full transition-all ${
                state.ageGroup === 'grandes'
                  ? 'bg-white text-on-surface font-black shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface font-bold disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
              onClick={() => selectAge('grandes')}
            >
              {isGrandeUnlocked ? 'Grandes (11-14)' : '🔒 Grandes (11-14)'}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-orange-100/90 text-orange-900 border border-orange-200 px-3 py-1.5 rounded-full font-black text-xs shadow-sm">
            <span className="text-base">🔥</span>
            <span className="hidden md:inline text-[11px] font-extrabold uppercase tracking-wide">Racha:</span>
            <span>3 Días</span>
          </div>

          <div className="flex items-center gap-1.5 bg-amber-100/90 border border-amber-300 text-amber-950 px-3 sm:px-4 py-1.5 rounded-full shadow-sm">
            <span
              className="material-symbols-outlined text-primary-container text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span className="font-extrabold text-sm sm:text-base">{state.stars}</span>
          </div>

          {subscription?.subscription_status === 'active' ? (
            <button
              type="button"
              onClick={() => navigate('plans')}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-2 text-xs sm:text-sm font-black shadow-sm hover:brightness-105"
              title="Ver planes disponibles"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
              </span>
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>{planLabels[currentPlan] || 'Plan activo'}</span>
            </button>
          ) : nextPlan ? (
            <button
              type="button"
              onClick={() => navigate('plans')}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-2 text-xs sm:text-sm font-black shadow-sm hover:brightness-105"
              title="Ver planes disponibles"
            >
              <span className="material-symbols-outlined text-[18px]">upgrade</span>
              <span>Ver planes</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('plans')}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-3 py-2 text-xs sm:text-sm font-black shadow-sm hover:brightness-105"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Plan activo</span>
            </button>
          )}

          <button
            aria-label="Ver Perfil y Progreso"
            disabled={progressLocked}
            title={progressLocked ? 'Debes tener Plan Familiar o Plan Pro' : 'Ver Perfil y Progreso'}
            className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant border border-surface-container-high tap-bounce"
            onClick={() => navigate('progress')}
          >
            <span className={`material-symbols-outlined text-[22px] ${progressLocked ? 'text-slate-400' : 'text-primary'}`}>{progressLocked ? 'lock' : 'military_tech'}</span>
          </button>
          <button
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant border border-surface-container-high tap-bounce"
            onClick={logout}
          >
            <span className="material-symbols-outlined text-[22px]">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
