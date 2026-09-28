import React from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

const NAV_ITEMS = [
  { key: 'home', label: 'Inicio', icon: 'home' },
  { key: 'subjects', label: 'Materias', icon: 'school' },
  { key: 'progress', label: 'Progreso', icon: 'map' },
];

export default function BottomNav() {
  const { state, navigate, subscription } = useAppState();
  const progressLocked = subscription?.plan === 'basic';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl border-t border-surface-container-high pb-safe shadow-[0_-2px_16px_rgba(18,26,51,0.06)]">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-4">
        {NAV_ITEMS.map((item) => {
          const active = state.activeView === item.key;
          return (
            <button
              key={item.key}
              disabled={item.key === 'progress' && progressLocked}
              title={item.key === 'progress' && progressLocked ? 'Debes tener Plan Familiar o Plan Pro' : item.label}
              className={`flex flex-col items-center justify-center flex-1 h-full tap-bounce transition-colors ${
                active ? 'text-primary font-black' : 'text-on-surface-variant font-bold'
              }`}
              onClick={() => navigate(item.key)}
            >
              <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
              <span className="text-[11px] mt-0.5">{item.key === 'progress' && progressLocked ? '🔒 Perfil' : item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
