import React from 'react';
import { useAppState } from '../context/AppStateContext.jsx';
import PlanLock from '../components/PlanLock.jsx';

const SUBJECT_CARDS = [
  {
    key: 'math',
    title: 'Matemáticas',
    emoji: '🧮',
    desc: 'Conteo, sumas, restas y figuras geométricas divertidas.',
    from: 'from-amber-50',
    to: 'to-orange-100/70',
    border: 'border-amber-200/90',
    chip: 'bg-amber-200/90 text-amber-950 border-amber-300',
    iconBg: 'bg-primary-container text-on-primary-container',
    arrow: 'text-primary',
  },
  {
    key: 'english',
    title: 'Inglés',
    emoji: '🗣️',
    desc: 'Vocabulario básico, animales, colores y pronunciación por voz.',
    from: 'from-sky-50',
    to: 'to-blue-100/70',
    border: 'border-sky-200/90',
    chip: 'bg-sky-200/90 text-sky-950 border-sky-300',
    iconBg: 'bg-secondary-container text-on-secondary-container',
    arrow: 'text-secondary',
  },
  {
    key: 'geo',
    title: 'Geografía',
    emoji: '🌍',
    desc: 'Planeta Tierra, continentes, océanos y maravillas naturales.',
    from: 'from-emerald-50',
    to: 'to-teal-100/70',
    border: 'border-emerald-200/90',
    chip: 'bg-emerald-200/90 text-emerald-950 border-emerald-300',
    iconBg: 'bg-tertiary-container text-on-tertiary-container',
    arrow: 'text-tertiary',
  },
];

export default function Home() {
  const { state, progress, navigate, selectAge, isGrandeUnlocked, subscription, startSubject, playNextAvailable, startDailyMission } = useAppState();
  const availableSubjects = subscription?.plan_limits?.subjects || ['math'];
  const maxExercises = subscription?.plan_limits?.max_exercises_per_subject || 5;
  const basicPlan = subscription?.plan === 'basic';
  const mission = state.dailyMission;
  const missionLabel = mission.status === 'completed'
    ? '¡Misión completada! Ganaste +3 ⭐ extra'
    : mission.status === 'failed'
    ? 'Misión perdida por hoy. Vuelve mañana para intentarlo'
    : mission.status === 'active'
    ? `Llevas ${mission.correctCount} de 3 ejercicios correctos`
    : 'Supera 3 ejercicios seguidos sin fallar y gana +3 ⭐ extra';

  return (
    <section className="flex flex-col gap-6 py-2 animate-pop w-full">
      {/* Hero + Progreso general */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 via-primary-container to-amber-500 p-6 sm:p-8 text-on-primary-fixed shadow-md flex flex-col justify-between min-h-[220px]">
          <div className="absolute -right-6 -bottom-8 w-44 sm:w-52 h-44 sm:h-52 opa3city-25 select-none pointer-events-none">
            <span className="text-9xl sm:text-[120px]">🚀</span>
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <div className="inline-flex items-center gap-2 bg-white/40 px-3 py-1 rounded-full w-max text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 shadow-sm">
              <span>¡Hola, Pequeño Explorador!</span> 🌟
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-amber-950 leading-tight tracking-tight">
              ¿Qué descubriremos hoy?
            </h2>
            <p className="text-sm sm:text-base font-bold text-amber-950/90 max-w-md">
              Aprende jugando con misiones interactivas de Matemáticas, Inglés y Geografía.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-amber-950/15 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-950 text-[20px]">face</span>
              <span className="text-xs sm:text-sm font-black text-amber-950">Nivel de edad seleccionado:</span>
            </div>
            <div className="flex bg-white/40 p-1 rounded-full text-xs font-black shadow-inner">
              <button
                className={`px-4 py-1.5 rounded-full transition-all ${
                  state.ageGroup === 'peques' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-950/80 hover:text-amber-950'
                }`}
                onClick={() => selectAge('peques')}
              >
                Peques (5-11)
              </button>
              <button
                disabled={!isGrandeUnlocked}
                title={isGrandeUnlocked ? 'Cambiar a Grandes (11-14)' : 'Completa las 30 misiones de Peques para desbloquear'}
                className={`px-4 py-1.5 rounded-full transition-all ${
                  state.ageGroup === 'grandes' ? 'bg-white text-amber-950 shadow-sm' : 'text-amber-950/80 hover:text-amber-950'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={() => selectAge('grandes')}
              >
                {isGrandeUnlocked ? 'Grandes (11-14)' : '🔒 Grandes (11-14)'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-3xl bg-surface-container-lowest p-6 shadow-sm border border-surface-container flex flex-col justify-between gap-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container/25 border border-secondary-container/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
              </div>
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-secondary">Misiones Globales</span>
                <h3 className="font-extrabold text-base sm:text-lg text-on-surface">Progreso General</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant">
                  <span className="font-black text-on-surface">{progress.totalCompleted}</span> de 30 misiones superadas
                </p>
              </div>
            </div>
            <span className="text-lg sm:text-xl font-black text-secondary bg-secondary-fixed/50 px-3 py-1 rounded-2xl">
              {progress.percent}%
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="w-full bg-surface-container h-3.5 rounded-full overflow-hidden p-0.5 border border-surface-container-high">
              <div
                className="bg-gradient-to-r from-secondary via-secondary-container to-tertiary h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-bold text-on-surface-variant">
              <span>0 Inicio</span>
              <span>15 Mitad de camino</span>
              <span>30 Gran Maestro</span>
            </div>
          </div>

          <button
            className="w-full py-4 px-6 rounded-2xl sm:rounded-full bg-primary-container text-on-primary-container font-black text-base shadow-[0_4px_0_0_#684200] hover:brightness-105 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 tap-bounce"
            onClick={playNextAvailable}
          >
            <span className="material-symbols-outlined text-[24px]">play_circle</span>
            <span>Continuar aventura</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de materias */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-on-surface">Explora por Materia</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant font-semibold">
              Descubre retos divertidos adaptados a cada área temática
            </p>
          </div>
          <button
            className="text-xs sm:text-sm font-extrabold text-secondary hover:underline flex items-center gap-1"
            onClick={() => navigate('subjects')}
          >
            <span>Ver todas</span>
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {SUBJECT_CARDS.map((card) => {
            const locked = !availableSubjects.includes(card.key);
            return (
            <div
              key={card.key}
              className={`rounded-3xl p-5 bg-gradient-to-br ${card.from} ${card.to} border-2 ${card.border} flex flex-col justify-between gap-4 ${locked ? 'opacity-75' : 'cursor-pointer tap-bounce hover:shadow-md'} shadow-sm transition-all group`}
              onClick={locked ? undefined : () => startSubject(card.key)}
            >
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl ${card.iconBg} flex items-center justify-center text-3xl shadow-inner font-black group-hover:scale-105 transition-transform`}>
                  {card.emoji}
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${card.chip}`}>
                  {Math.min(progress.bySubject[card.key], maxExercises)}/{maxExercises}
                </span>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base sm:text-lg text-on-surface">{card.title}</h4>
                  {locked ? <PlanLock compact /> : <span className={`material-symbols-outlined ${card.arrow} group-hover:translate-x-1 transition-transform`}>arrow_forward</span>}
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant mt-1">{card.desc}</p>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Misión del día */}
      <div className="rounded-3xl bg-gradient-to-r from-surface-container-high to-surface-container-lowest p-5 border border-surface-container flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-2xl shadow-inner shrink-0">
            🎁
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-200/70 px-2.5 py-0.5 rounded-full mb-0.5">
              <span>Misión del Día</span>
            </div>
            <p className="text-sm sm:text-base font-extrabold text-on-surface">
              {missionLabel}
            </p>
          </div>
        </div>
        {mission.status === 'available' ? (
          <button
            className="text-xs sm:text-sm font-black bg-primary text-white hover:bg-primary/90 px-4 py-2.5 rounded-full shadow-sm tap-bounce shrink-0 self-end sm:self-auto"
            onClick={startDailyMission}
          >
            ¡Aceptar desafío!
          </button>
        ) : (
          <span className={`text-xs sm:text-sm font-black px-4 py-2.5 rounded-full shrink-0 self-end sm:self-auto ${mission.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-surface-container text-on-surface-variant'}`}>
            {mission.status === 'completed' ? 'Completada hoy' : mission.status === 'failed' ? 'Fallida hoy' : 'En curso'}
          </span>
        )}
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 p-5 sm:p-6 border-2 border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/80 flex items-center justify-center text-2xl shadow-inner shrink-0">🧠</div>
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-sky-800">Reto extra</span>
            <h3 className="text-lg font-black text-sky-950">Memoria de parejas</h3>
            <p className="text-sm font-semibold text-sky-900/80">Encuentra las cartas iguales y consigue puntos.</p>
          </div>
        </div>
        {basicPlan ? <PlanLock /> : <button
          className="text-sm font-black bg-sky-600 text-white hover:bg-sky-700 px-5 py-3 rounded-full shadow-sm tap-bounce shrink-0 self-end sm:self-auto flex items-center gap-2"
          onClick={() => navigate('memory-game')}
        >
          <span className="material-symbols-outlined text-[20px]">playing_cards</span>
          Jugar ahora
        </button>}
      </div>

      <button disabled={basicPlan} className="rounded-3xl bg-white border border-surface-container p-5 flex items-center justify-between gap-4 text-left shadow-sm tap-bounce disabled:opacity-75" onClick={() => navigate('characters')}>
        <span className="flex items-center gap-3"><span className="text-4xl">🧸</span><span><span className="block text-xs font-black uppercase tracking-wider text-secondary">Personalización</span><span className="block text-lg font-black text-on-surface">Mis personajes</span><span className="block text-sm font-semibold text-on-surface-variant">Cambia tu sprite usando estrellas.</span></span></span>
        {basicPlan ? <PlanLock compact /> : <span className="material-symbols-outlined text-secondary">chevron_right</span>}
      </button>
    </section>
  );
}
