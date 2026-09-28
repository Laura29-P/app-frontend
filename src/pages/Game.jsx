import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext.jsx';
import { EXERCISE_BANK } from '../data/exercises.js';
import { useSoundEffects, useSpeech } from '../hooks/useSoundEffects.js';
import { useConfetti } from '../hooks/useConfetti.js';
import CompletionModal from '../components/CompletionModal.jsx';

const SUBJECT_STYLES = {
  math: {
    tag: 'text-amber-700',
    bar: 'bg-primary-container',
    pill: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  english: {
    tag: 'text-sky-700',
    bar: 'bg-secondary-container',
    pill: 'bg-sky-100 text-sky-900 border-sky-200',
  },
  geo: {
    tag: 'text-emerald-700',
    bar: 'bg-tertiary-container',
    pill: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
};

const FEEDBACK_DEFAULT = {
  variant: 'default',
  icon: 'touch_app',
  title: 'Elige tu respuesta',
  subtitle: 'Toca la opción correcta para ganar ⭐.',
  emoji: '💡',
};

const FEEDBACK_CORRECT = {
  variant: 'correct',
  icon: 'sentiment_very_satisfied',
  title: '¡Excelente trabajo!',
  subtitle: '¡Respuesta correcta! Has ganado +1 ⭐',
  emoji: '🎉',
};

const FEEDBACK_WRONG = {
  variant: 'wrong',
  icon: 'error',
  title: '¡Casi lo logras!',
  subtitle: 'Esa no es la respuesta. ¡Usa la pista o inténtalo de nuevo!',
  emoji: '💪',
};

export default function Game() {
  const { state, subscription, exitGame, answerCorrect, advanceQuestion, dailyMissionCorrect, failDailyMission } = useAppState();
  const { playBeep } = useSoundEffects();
  const { speak } = useSpeech();
  const { fireConfetti } = useConfetti();

  const maxExercises = subscription?.plan_limits?.max_exercises_per_subject || 5;
  const questions = (EXERCISE_BANK[state.currentSubject] || []).slice(0, maxExercises);
  const question = questions[state.currentIndexInSubject];

  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(FEEDBACK_DEFAULT);
  const [disabledIndices, setDisabledIndices] = useState([]);
  const [hintUsed, setHintUsed] = useState(false);
  const [shakeIndex, setShakeIndex] = useState(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [missionTimeLeft, setMissionTimeLeft] = useState(0);

  const autoTimerRef = useRef(null);
  const shakeTimerRef = useRef(null);
  const isDailyMission = state.dailyMission.status === 'active';

  useEffect(() => {
    if (state.dailyMission.status !== 'active' || !state.dailyMission.expiresAt) {
      setMissionTimeLeft(0);
      return undefined;
    }

    const updateMissionClock = () => {
      const secondsLeft = Math.max(0, Math.ceil((state.dailyMission.expiresAt - Date.now()) / 1000));
      setMissionTimeLeft(secondsLeft);
      if (secondsLeft === 0) failDailyMission();
    };

    updateMissionClock();
    const interval = window.setInterval(updateMissionClock, 1000);
    return () => window.clearInterval(interval);
  }, [state.dailyMission.status, state.dailyMission.expiresAt, failDailyMission]);

  // Reinicia el estado local del ejercicio cada vez que cambia la pregunta,
  // equivalente a loadGameQuestion() en la versión original.
  useEffect(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setAnswered(false);
    setFeedback(FEEDBACK_DEFAULT);
    setDisabledIndices([]);
    setHintUsed(false);
    setShakeIndex(null);
  }, [state.currentSubject, state.currentIndexInSubject]);

  useEffect(
    () => () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    },
    []
  );

  if (!question) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[50vh] py-10 px-4">
        <div className="w-full max-w-md rounded-3xl border border-surface-container bg-surface-container-lowest p-6 text-center shadow-sm">
          <div className="text-5xl mb-3">🔒</div>
          <p className="text-xs font-black uppercase tracking-wider text-secondary">Contenido bloqueado</p>
          <h2 className="mt-2 text-2xl font-black text-on-surface">Este tema no está disponible en tu plan</h2>
          <p className="mt-2 text-sm font-semibold text-on-surface-variant">
            Actualiza tu plan para desbloquear más materias y ejercicios.
          </p>
          <button
            className="mt-5 rounded-full bg-primary-container text-on-primary-container px-5 py-3 font-black"
            onClick={() => window.history.back()}
          >
            Volver
          </button>
        </div>
      </section>
    );
  }

  const style = SUBJECT_STYLES[question.subject];
  const percent = Math.round(((state.currentIndexInSubject + 1) / questions.length) * 100);

  const handleAdvance = () => {
    if (state.currentIndexInSubject < questions.length - 1) {
      advanceQuestion();
    } else {
      setShowCompletion(true);
      playBeep('correct');
      fireConfetti();
    }
  };

  const handleAnswerSelect = (option, index) => {
    if (answered) return;

    if (option.correct) {
      setAnswered(true);
      playBeep('correct');
      fireConfetti();
      answerCorrect(question.id);
      if (state.dailyMission.status === 'active') dailyMissionCorrect();
      setFeedback(FEEDBACK_CORRECT);

      autoTimerRef.current = setTimeout(() => {
        handleAdvance();
      }, 1400);
    } else {
      if (state.dailyMission.status === 'active') failDailyMission();
      playBeep('wrong');
      setShakeIndex(index);
      shakeTimerRef.current = setTimeout(() => setShakeIndex(null), 450);
      setFeedback(FEEDBACK_WRONG);
    }
  };

  const applyHint = () => {
    if (answered || hintUsed) return;
    const wrongIndices = question.options
      .map((opt, idx) => ({ opt, idx }))
      .filter(({ opt, idx }) => !opt.correct && !disabledIndices.includes(idx))
      .slice(0, 2)
      .map(({ idx }) => idx);

    setDisabledIndices((prev) => [...prev, ...wrongIndices]);
    setHintUsed(true);
    setFeedback({ variant: 'hint', icon: null, title: 'Pista Mágica ✨', subtitle: question.hint, emoji: '🔍' });
  };

  const handleRepeat = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setAnswered(false);
    setFeedback(FEEDBACK_DEFAULT);
    setDisabledIndices([]);
    setHintUsed(false);
    setShakeIndex(null);
  };

  const feedbackBannerClass =
    feedback.variant === 'correct'
      ? 'bg-tertiary-container text-on-tertiary-container animate-pop'
      : feedback.variant === 'wrong'
      ? 'bg-error-container text-on-error-container'
      : 'bg-surface-container-high';

  const missionClock = `${String(Math.floor(missionTimeLeft / 60)).padStart(2, '0')}:${String(missionTimeLeft % 60).padStart(2, '0')}`;

  const feedbackIconClass =
    feedback.variant === 'correct'
      ? 'text-tertiary'
      : feedback.variant === 'wrong'
      ? 'text-error'
      : 'text-secondary';

  return (
    <section className="flex flex-col gap-4 py-2 w-full max-w-3xl mx-auto">
      {/* Encabezado del ejercicio */}
      <div className="flex flex-col gap-2.5 bg-surface-container-lowest p-4 sm:p-5 rounded-3xl shadow-sm border border-surface-container">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="Cerrar y volver"
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-variant tap-bounce transition-colors"
              onClick={exitGame}
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
            <div className="flex flex-col">
              <span className={`text-xs font-black uppercase tracking-wider ${style.tag}`}>
                {question.subjectName.toUpperCase()}
              </span>
              <span className="text-sm sm:text-base font-black text-on-surface">
                Paso {state.currentIndexInSubject + 1} de {questions.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1.5 rounded-full font-black text-sm sm:text-base">
            <span
              className="material-symbols-outlined text-amber-500 text-[20px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
            <span>{state.stars}</span>
          </div>
        </div>
        {isDailyMission && (
          <div className={`flex items-center justify-between gap-3 rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm font-black ${state.dailyMission.status === 'active' ? 'bg-orange-100 text-orange-900' : state.dailyMission.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            <span>
              {state.dailyMission.status === 'active'
                ? `Misión del día: ${state.dailyMission.correctCount} de 3 correctos`
                : state.dailyMission.status === 'completed'
                ? '¡Misión del día completada! +3 ⭐'
                : 'Misión del día perdida'}
            </span>
            {state.dailyMission.status === 'active' && <span className="tabular-nums">⏱ {missionClock}</span>}
          </div>
        )}
        <div className="w-full bg-surface-container h-3 rounded-full overflow-hidden p-0.5 border border-surface-container-high">
          <div className={`${style.bar} h-full rounded-full transition-all duration-300`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Área central del ejercicio */}
      <div className="flex flex-col items-center text-center gap-2 px-2 mt-2">
        <div className={`inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs sm:text-sm font-extrabold border ${style.pill}`}>
          <span className="material-symbols-outlined text-[18px]">{question.icon}</span>
          <span>{question.badge}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-on-surface leading-tight mt-1">{question.title}</h2>

        {question.speechWord && (
          <div className="pt-1">
            <button
              className="inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container hover:brightness-105 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black shadow-[0_3px_0_0_#006493] active:translate-y-0.5 active:shadow-none transition-all tap-bounce"
              onClick={() => speak(question.speechWord, 'en-US')}
            >
              <span className="text-[18px]">🔊</span>
              <span>Escuchar pronunciación</span>
            </button>
          </div>
        )}
      </div>

      {/* Tarjeta visual */}
      <div className="relative w-full bg-surface-container-lowest rounded-3xl p-6 sm:p-8 shadow-sm border border-surface-container flex flex-col items-center justify-center overflow-hidden min-h-[160px] sm:min-h-[190px]">
        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl flex items-center justify-center p-3 text-5xl sm:text-6xl shadow-inner transition-transform bg-surface-container-high">
          {question.visualEmoji}
        </div>
        <span className="text-base sm:text-lg font-black text-on-surface mt-3">{question.visualTitle}</span>
      </div>

      {/* Grid de respuestas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {question.options.map((opt, index) => {
          const isDisabled = disabledIndices.includes(index);
          const isShaking = shakeIndex === index;
          const isCorrectSelected = answered && opt.correct;

          let className =
            'w-full min-h-[68px] sm:min-h-[76px] p-4 rounded-2xl font-extrabold text-base sm:text-lg flex items-center justify-center text-center gap-2.5 tap-bounce transition-all border-2';

          if (isCorrectSelected) {
            className +=
              ' bg-tertiary-container text-on-tertiary-container font-black text-lg sm:text-xl shadow-[0_4px_0_0_#006d37] border-tertiary';
          } else if (isShaking) {
            className +=
              ' animate-shake bg-error-container text-on-error-container border-error shadow-[0_4px_0_0_#ba1a1a]';
          } else if (isDisabled) {
            className +=
              ' bg-surface-container-lowest text-on-surface opacity-30 line-through cursor-not-allowed border-surface-container shadow-[0_4px_0_0_#dbe1ff]';
          } else {
            className +=
              ' bg-surface-container-lowest text-on-surface shadow-[0_4px_0_0_#dbe1ff] border-surface-container hover:border-secondary/40';
          }

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              disabled={isDisabled}
              className={className}
              onClick={() => handleAnswerSelect(opt, index)}
            >
              {isCorrectSelected && <span className="material-symbols-outlined text-[24px]">check_circle</span>}
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {/* Cajón de feedback y acciones */}
      <div className="w-full bg-surface-container-lowest rounded-3xl p-4 sm:p-6 shadow-md border border-surface-container flex flex-col gap-4">
        <div className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all ${feedbackBannerClass}`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center shrink-0">
              {feedback.icon && (
                <span className={`material-symbols-outlined text-[24px] ${feedbackIconClass}`}>{feedback.icon}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-sm sm:text-base leading-tight">{feedback.title}</span>
              <span className="text-xs sm:text-sm text-on-surface-variant font-bold">{feedback.subtitle}</span>
            </div>
          </div>
          <span className="text-3xl">{feedback.emoji}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="flex-1 py-3 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_0_0_#d1d9fa] active:translate-y-0.5 active:shadow-none transition-all tap-bounce disabled:opacity-40"
            onClick={applyHint}
            disabled={answered || hintUsed}
          >
            <span className="material-symbols-outlined text-[20px] text-primary">lightbulb</span>
            <span>Ver Pista</span>
          </button>
          <button
            className="flex-1 py-3 px-4 rounded-2xl bg-surface-container-high hover:bg-surface-variant text-on-surface font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_2px_0_0_#d1d9fa] active:translate-y-0.5 active:shadow-none transition-all tap-bounce"
            onClick={handleRepeat}
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">replay</span>
            <span>Reintentar</span>
          </button>
        </div>

        <button
          className="w-full py-4 rounded-full bg-primary-container text-on-primary-container font-black text-base shadow-[0_4px_0_0_#684200] hover:brightness-105 active:translate-y-1 active:shadow-none flex items-center justify-center gap-2 transition-all tap-bounce disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!answered}
          onClick={handleAdvance}
        >
          <span>Siguiente ejercicio</span>
          <span className="material-symbols-outlined text-[22px]">arrow_forward</span>
        </button>
      </div>

      <CompletionModal
        open={showCompletion}
        subjectKey={state.currentSubject}
        onClose={() => setShowCompletion(false)}
      />
    </section>
  );
}
