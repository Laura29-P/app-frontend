import React from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

const SUBJECT_LABELS = { math: 'Matemáticas', english: 'Inglés', geo: 'Geografía' };
const SUBJECT_BADGE_ICONS = { math: '📐', english: '🗣️', geo: '🗺️' };

export default function CompletionModal({ open, onClose, subjectKey }) {
  const { state, navigate } = useAppState();

  if (!open) return null;

  const subjName = SUBJECT_LABELS[subjectKey] || '';
  const badgeIcon = SUBJECT_BADGE_ICONS[subjectKey] || '🎖️';

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-4 animate-pop border-2 border-primary-container">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-amber-100 flex items-center justify-center text-5xl sm:text-6xl shadow-inner animate-bounce">
          🏆
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl sm:text-3xl font-black text-on-surface">
            ¡Misión {subjName} Superada!
          </h3>
          <p className="text-xs sm:text-sm font-bold text-on-surface-variant">
            ¡Completaste con éxito los 10 desafíos!
          </p>
        </div>
        <div className="w-full bg-surface-container-low rounded-2xl p-4 flex items-center justify-around">
          <div className="flex flex-col items-center">
            <span className="text-[11px] uppercase text-on-surface-variant font-bold">Total Estrellas</span>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-black text-xl">{state.stars}</span>
            </div>
          </div>
          <div className="h-10 w-px bg-outline-variant" />
          <div className="flex flex-col items-center">
            <span className="text-[11px] uppercase text-on-surface-variant font-bold">Insignia</span>
            <span className="text-3xl">{badgeIcon}</span>
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-2.5 pt-2">
          <button
            className="flex-1 py-3.5 rounded-full bg-primary-container text-on-primary-container font-black text-sm shadow-[0_4px_0_0_#684200] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5"
            onClick={() => {
              onClose();
              navigate('progress');
            }}
          >
            <span className="material-symbols-outlined text-[20px]">map</span>
            <span>Ver mapa</span>
          </button>
          <button
            className="flex-1 py-3.5 rounded-full bg-surface-container text-on-surface font-extrabold text-sm hover:bg-surface-variant active:scale-95 transition-all"
            onClick={() => {
              onClose();
              navigate('subjects');
            }}
          >
            Otras materias
          </button>
        </div>
      </div>
    </div>
  );
}
