import React from 'react';

export default function PlanLock({ compact = false }) {
  return (
    <div className={`flex ${compact ? 'items-center gap-2' : 'flex-col items-center gap-2 text-center'} rounded-2xl border border-slate-300 bg-white/85 px-3 py-2 text-slate-700`}>
      <span className="material-symbols-outlined text-[20px] text-slate-500" aria-hidden="true">lock</span>
      <div>
        <p className="text-xs font-black">Contenido bloqueado</p>
        <p className="text-[11px] font-bold">Debes tener uno de estos planes:</p>
        <div className="mt-1 flex flex-wrap gap-1">
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-800">Plan Familiar</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800">Plan Pro</span>
        </div>
      </div>
    </div>
  );
}
