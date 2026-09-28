import React from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

const SUBJECTS = [
  {
    key: 'math',
    emoji: '🧮',
    tag: 'Mundo de Números',
    title: 'Matemáticas',
    desc: 'Conteo, sumas, restas, series numéricas y formas geométricas adaptadas a los niños.',
    border: 'border-amber-300',
    iconBg: 'bg-amber-100',
    chip: 'bg-amber-100 text-amber-900 border-amber-200',
    textAccent: 'text-amber-900',
    barColor: 'bg-primary-container',
    btn: 'bg-primary-container text-on-primary-container shadow-[0_4px_0_0_#684200]',
    btnIcon: 'sports_esports',
    btnLabel: '¡Jugar Matemáticas!',
  },
  {
    key: 'english',
    emoji: '🗣️',
    tag: 'English Adventure',
    title: 'Inglés',
    desc: '10 misiones auditivas con pronunciación en inglés de animales, colores y comida.',
    border: 'border-sky-300',
    iconBg: 'bg-sky-100',
    chip: 'bg-sky-100 text-sky-900 border-sky-200',
    textAccent: 'text-sky-900',
    barColor: 'bg-secondary-container',
    btn: 'bg-secondary text-white shadow-[0_4px_0_0_#003855]',
    btnIcon: 'volume_up',
    btnLabel: '¡Practicar Inglés!',
  },
  {
    key: 'geo',
    emoji: '🧭',
    tag: 'Explorador Global',
    title: 'Geografía',
    desc: 'Continentes, países, banderas, montañas, ríos famosos y animales del planeta.',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-100',
    chip: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    textAccent: 'text-emerald-900',
    barColor: 'bg-tertiary-container',
    btn: 'bg-tertiary text-white shadow-[0_4px_0_0_#003c1c]',
    btnIcon: 'explore',
    btnLabel: '¡Explorar Planeta!',
  },
];

export default function Subjects() {
  const { progress, startSubject, subscription } = useAppState();
  const availableSubjects = subscription?.plan_limits?.subjects || ['math'];
  const maxExercises = subscription?.plan_limits?.max_exercises_per_subject || 5;

  return (
    <section className="flex flex-col gap-6 py-2 animate-pop w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-container pb-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface">Nuestras Materias</h2>
          <p className="text-sm font-semibold text-on-surface-variant">
            Elige un mundo del conocimiento y conquista sus 10 desafíos interactivos.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-on-surface-variant">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
          <span>{availableSubjects.length} Materia{availableSubjects.length === 1 ? '' : 's'} disponibles</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {SUBJECTS.filter((s) => availableSubjects.includes(s.key)).map((s) => {
          const completed = Math.min(progress.bySubject[s.key], maxExercises);
          const percent = Math.round((completed / maxExercises) * 100);
          return (
            <div
              key={s.key}
              className={`rounded-3xl bg-surface-container-lowest p-6 border-2 ${s.border} shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-5`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className={`w-16 h-16 rounded-2xl ${s.iconBg} flex items-center justify-center text-3xl shadow-inner`}>
                    {s.emoji}
                  </div>
                  <span className={`text-xs font-black border px-3 py-1 rounded-full ${s.chip}`}>
                    {completed} / {maxExercises}
                  </span>
                </div>
                <div>
                  <span className={`text-[11px] font-black uppercase tracking-wider ${s.textAccent}`}>{s.tag}</span>
                  <h3 className="text-xl font-black text-on-surface">{s.title}</h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant mt-1">{s.desc}</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <div className={`flex justify-between text-xs font-black ${s.textAccent}`}>
                  <span>Progreso de misión</span>
                  <span>{percent}%</span>
                </div>
                <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden">
                  <div
                    className={`${s.barColor} h-full rounded-full transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <button
                  className={`w-full mt-2 py-3.5 rounded-full font-black text-sm hover:brightness-105 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 tap-bounce ${s.btn}`}
                  onClick={() => startSubject(s.key)}
                >
                  <span className="material-symbols-outlined text-[20px]">{s.btnIcon}</span>
                  <span>{s.btnLabel}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
