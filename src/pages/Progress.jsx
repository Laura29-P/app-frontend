import React from 'react';
import { useAppState } from '../context/AppStateContext.jsx';
import { EXERCISE_BANK } from '../data/exercises.js';

const GRIDS = [
  {
    key: 'math',
    number: 1,
    emoji: '🧮',
    title: 'Matemáticas',
    border: 'border-amber-200',
    textAccent: 'text-amber-800',
    linkColor: 'text-primary',
    dividerBorder: 'border-amber-100',
  },
  {
    key: 'english',
    number: 2,
    emoji: '🗣️',
    title: 'Inglés',
    border: 'border-sky-200',
    textAccent: 'text-sky-800',
    linkColor: 'text-secondary',
    dividerBorder: 'border-sky-100',
  },
  {
    key: 'geo',
    number: 3,
    emoji: '🧭',
    title: 'Geografía',
    border: 'border-emerald-200',
    textAccent: 'text-emerald-800',
    linkColor: 'text-tertiary',
    dividerBorder: 'border-emerald-100',
  },
];

const BADGES = [
  { key: 'math', emoji: '📐', title: 'Genio Numérico', sub: '10 Matemáticas', on: 'bg-amber-100 border-2 border-amber-300' },
  { key: 'english', emoji: '🗣️', title: 'Super Políglota', sub: '10 Inglés', on: 'bg-sky-100 border-2 border-sky-300' },
  { key: 'geo', emoji: '🗺️', title: 'Gran Navegante', sub: '10 Geografía', on: 'bg-emerald-100 border-2 border-emerald-300' },
];

export default function ProgressPage() {
  const { state, progress, startSubjectAt, resetProgress } = useAppState();

  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar tu progreso y estrellas para comenzar de nuevo la aventura?')) {
      resetProgress();
    }
  };

  return (
    <section className="flex flex-col gap-6 py-2 animate-pop w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface">Mapa de Logros</h2>
          <p className="text-sm font-semibold text-on-surface-variant">
            Toca cualquier nivel para jugar directamente o repasar su contenido.
          </p>
        </div>
        <button
          className="text-xs font-bold text-error bg-error-container/50 hover:bg-error-container px-4 py-2 rounded-full tap-bounce flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          onClick={handleReset}
        >
          <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          Reiniciar progreso
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <div className="rounded-3xl bg-surface-container-lowest p-4 sm:p-6 flex flex-col items-center text-center shadow-sm border border-surface-container">
          <span className="text-3xl sm:text-4xl mb-1">⭐</span>
          <span className="font-black text-xl sm:text-3xl text-primary">{state.stars}</span>
          <span className="text-[11px] sm:text-xs uppercase font-extrabold text-on-surface-variant mt-1">Estrellas Ganadas</span>
        </div>
        <div className="rounded-3xl bg-surface-container-lowest p-4 sm:p-6 flex flex-col items-center text-center shadow-sm border border-surface-container">
          <span className="text-3xl sm:text-4xl mb-1">🏆</span>
          <span className="font-black text-xl sm:text-3xl text-secondary">{progress.totalCompleted}/30</span>
          <span className="text-[11px] sm:text-xs uppercase font-extrabold text-on-surface-variant mt-1">Misiones Completas</span>
        </div>
        <div className="rounded-3xl bg-surface-container-lowest p-4 sm:p-6 flex flex-col items-center text-center shadow-sm border border-surface-container">
          <span className="text-3xl sm:text-4xl mb-1">🎖️</span>
          <span className="font-black text-xl sm:text-3xl text-tertiary">{progress.badgesCount}/3</span>
          <span className="text-[11px] sm:text-xs uppercase font-extrabold text-on-surface-variant mt-1">Medallas de Maestría</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {GRIDS.map((g) => (
          <div
            key={g.key}
            className={`rounded-3xl bg-surface-container-lowest p-5 sm:p-6 shadow-sm border-2 ${g.border} flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{g.emoji}</span>
                  <div>
                    <h3 className="font-black text-base text-on-surface">
                      {g.number}. {g.title}
                    </h3>
                    <span className={`text-[11px] font-bold ${g.textAccent}`}>
                      {progress.bySubject[g.key]} de 10 misiones
                    </span>
                  </div>
                </div>
                <button
                  className={`text-xs font-black hover:underline ${g.linkColor}`}
                  onClick={() => startSubjectAt(g.key, 0)}
                >
                  Jugar
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2.5">
                {EXERCISE_BANK[g.key].map((q, index) => {
                  const isDone = !!state.completedExercises[q.id];
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => startSubjectAt(g.key, index)}
                      className={
                        isDone
                          ? 'w-full aspect-square rounded-2xl bg-tertiary text-white flex flex-col items-center justify-center font-black text-xs sm:text-sm shadow-sm tap-bounce hover:brightness-110 transition-all'
                          : 'w-full aspect-square rounded-2xl bg-surface-container text-on-surface flex flex-col items-center justify-center font-black text-xs sm:text-sm hover:bg-surface-variant tap-bounce border border-surface-container-high transition-all'
                      }
                    >
                      <span>{index + 1}</span>
                      {isDone && <span className="material-symbols-outlined text-[14px]">star</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={`mt-4 pt-3 border-t ${g.dividerBorder} flex items-center justify-between text-[11px] font-bold text-on-surface-variant`}>
              <span>Misiones 1-10</span>
              <span>Objetivo: 10 ⭐</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-sm border border-surface-container flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-base sm:text-lg text-on-surface">Medallas de Maestría Desbloqueables</h4>
          <span className="text-xs font-bold text-on-surface-variant">Completa los 10 ejercicios de cada materia</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          {BADGES.map((b) => {
            const unlocked = progress.bySubject[b.key] === 10;
            return (
              <div
                key={b.key}
                className={`p-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                  unlocked ? b.on : 'bg-surface-container opacity-50 grayscale'
                }`}
              >
                <span className="text-4xl">{b.emoji}</span>
                <span className="text-sm font-black">{b.title}</span>
                <span className="text-xs text-on-surface-variant font-bold">{b.sub}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
