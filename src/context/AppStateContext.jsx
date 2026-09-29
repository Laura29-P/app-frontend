import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { EXERCISE_BANK, TOTAL_EXERCISES } from '../data/exercises.js';
import { rewardCorrectAnswer } from '../data/rewards.js';

const STORAGE_KEY = 'aventura_learning_app_responsive_v1';
const CLIENT_ID_KEY = 'aventura_learning_client_id';
const AUTH_STORAGE_KEY = 'aventura_learning_auth';
import { API_URL } from '../api.js';
const DAILY_MISSION_MINUTES = 10;
const PLAN_LIMITS = {
  basic: { subjects: ['math'], maxExercisesPerSubject: 5 },
  family: { subjects: ['math', 'english'], maxExercisesPerSubject: 10 },
  premium: { subjects: ['math', 'english', 'geo'], maxExercisesPerSubject: 10 },
};

function normalizePlanKey(planKey) {
  if (!planKey) return 'basic';

  const value = String(planKey).trim().toLowerCase();

  if (value === 'pro' || value === 'premium') return 'premium';
  if (value === 'familiar') return 'family';
  if (value === 'basico') return 'basic';

  return value;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createDailyMission() {
  return {
    date: todayKey(),
    status: 'available',
    correctCount: 0,
    startedAt: null,
    expiresAt: null,
  };
}

function completedExerciseCount(completedExercises = {}) {
  return Object.values(completedExercises).filter(Boolean).length;
}

const initialState = {
  ageGroup: 'peques',
  stars: 0,
  selectedCharacter: 'luna',
  ownedCharacters: ['luna'],
  completedExercises: {},
  currentSubject: 'math',
  currentIndexInSubject: 0,
  activeView: 'home',
  previousView: 'home',
  dailyMission: createDailyMission(),
};

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = { ...initialState, ...JSON.parse(raw) };
      const normalized = saved.dailyMission?.date === todayKey() ? saved : { ...saved, dailyMission: createDailyMission() };
      return normalized.ageGroup === 'grandes' && completedExerciseCount(normalized.completedExercises) < TOTAL_EXERCISES
        ? { ...normalized, ageGroup: 'peques' }
        : normalized;
    }
  } catch (e) {
    console.warn('Storage no disponible');
  }
  return initialState;
}

function reducer(state, action) {
  switch (action.type) {
    case 'NAVIGATE': {
      const previousView = state.activeView !== 'game' ? state.activeView : state.previousView;
      return { ...state, previousView, activeView: action.view };
    }
    case 'SELECT_AGE':
      if (action.group === 'grandes' && completedExerciseCount(state.completedExercises) < TOTAL_EXERCISES) return state;
      return { ...state, ageGroup: action.group };
    case 'START_SUBJECT':
      return {
        ...state,
        currentSubject: action.subject,
        currentIndexInSubject: action.index,
        previousView: state.activeView !== 'game' ? state.activeView : state.previousView,
        activeView: 'game',
      };
    case 'START_DAILY_MISSION': {
      const now = Date.now();
      return {
        ...state,
        dailyMission: {
          date: todayKey(),
          status: 'active',
          correctCount: 0,
          startedAt: now,
          expiresAt: now + DAILY_MISSION_MINUTES * 60 * 1000,
        },
        currentSubject: action.subject,
        currentIndexInSubject: action.index,
        previousView: state.activeView !== 'game' ? state.activeView : state.previousView,
        activeView: 'game',
      };
    }
    case 'ANSWER_CORRECT': {
      return rewardCorrectAnswer(state, action.exerciseId);
    }
    case 'DAILY_MISSION_CORRECT': {
      if (state.dailyMission.status !== 'active') return state;
      const correctCount = state.dailyMission.correctCount + 1;
      return {
        ...state,
        stars: correctCount === 3 ? state.stars + 3 : state.stars,
        dailyMission: {
          ...state.dailyMission,
          correctCount,
          status: correctCount === 3 ? 'completed' : 'active',
        },
      };
    }
    case 'FAIL_DAILY_MISSION':
      if (state.dailyMission.status !== 'active') return state;
      return { ...state, dailyMission: { ...state.dailyMission, status: 'failed' } };
    case 'ADVANCE_QUESTION':
      return { ...state, currentIndexInSubject: state.currentIndexInSubject + 1 };
    case 'RESET_PROGRESS':
      return { ...state, stars: 0, completedExercises: {} };
    case 'SET_STARS':
      return { ...state, stars: action.stars };
    case 'SET_CHARACTER':
      return {
        ...state,
        stars: action.stars ?? state.stars,
        selectedCharacter: action.selectedCharacter,
        ownedCharacters: action.ownedCharacters ?? state.ownedCharacters,
      };
    case 'HYDRATE_PROGRESS':
      return {
        ...state,
        ageGroup: action.progress.age_group === 'grandes' && completedExerciseCount(action.progress.completed_exercises) < TOTAL_EXERCISES
          ? 'peques'
          : action.progress.age_group,
        stars: action.progress.stars,
        selectedCharacter: action.progress.selected_character || 'luna',
        ownedCharacters: action.progress.owned_characters || ['luna'],
        completedExercises: action.progress.completed_exercises || {},
        currentSubject: action.progress.current_subject,
        currentIndexInSubject: action.progress.current_index_in_subject,
      };
    default:
      return state;
  }
}

const AppStateContext = createContext(null);

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersistedState);
  const [serverReady, setServerReady] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)) || null;
    } catch (e) {
      return null;
    }
  });
  const [authReady, setAuthReady] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState('');
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const clientId = useRef(localStorage.getItem(CLIENT_ID_KEY));

  if (!clientId.current) {
    clientId.current = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, clientId.current);
  }

  useEffect(() => {
    setAuthReady(true);
  }, []);

  useEffect(() => {
    setSubscription(null);
    setSubscriptionSuccess(false);
    setSubscriptionError('');
    if (!auth?.token) {
      setSubscriptionLoading(false);
      return undefined;
    }
    let cancelled = false;
    let timer;
    const controller = new AbortController();
    const params = new URLSearchParams(window.location.search);
    let pendingSession = params.get('subscription') === 'success' ? params.get('session_id') : null;
    const clearReturnParams = () => {
      const url = new URL(window.location.href);
      ['subscription', 'session_id', 'plan'].forEach((key) => url.searchParams.delete(key));
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    };
    if (params.get('subscription') === 'cancelled') clearReturnParams();
    if (params.get('subscription') === 'success') dispatch({ type: 'NAVIGATE', view: 'plans' });
    setSubscriptionLoading(true);

    const refresh = async () => {
      let confirmationError = '';
      try {
        const headers = { Accept: 'application/json', Authorization: `Bearer ${auth.token}` };
        if (pendingSession) {
          const response = await fetch(`${API_URL}/billing/confirm`, {
            method: 'POST', signal: controller.signal,
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: JSON.stringify({ session_id: pendingSession }),
          });
          const data = await response.json().catch(() => ({}));
          if (cancelled) return;
          if (response.ok) {
            pendingSession = null;
            setSubscriptionSuccess(true);
            clearReturnParams();
          } else {
            confirmationError = data.message || 'No se pudo confirmar tu compra. Volveremos a intentarlo.';
            if ([403, 422].includes(response.status)) {
              pendingSession = null;
              clearReturnParams();
            }
          }
        }
        const response = await fetch(`${API_URL}/account/access`, { headers, signal: controller.signal });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || 'No se pudo comprobar tu acceso.');
        if (!cancelled) {
          setSubscription(data);
          setSubscriptionError(confirmationError);
        }
      } catch (error) {
        if (!cancelled) setSubscriptionError(error.message || 'No se pudo comprobar tu acceso.');
      } finally {
        if (!cancelled) {
          setSubscriptionLoading(false);
          timer = window.setTimeout(refresh, 5000);
        }
      }
    };
    refresh();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [auth?.token]);

  useEffect(() => {
    if (!auth?.token || !subscription) return;
    if (!subscription.can_access) {
      setProgressLoaded(true);
      setServerReady(true);
      return;
    }

    setProgressLoaded(false);
    fetch(`${API_URL}/progress?client_id=${encodeURIComponent(clientId.current)}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` },
    })
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 404) {
            setProgressLoaded(true);
            return null;
          }
          return null;
        }

        const progress = await response.json();
        if (progress) dispatch({ type: 'HYDRATE_PROGRESS', progress });
        return progress;
      })
      .catch(() => null)
      .finally(() => {
        setProgressLoaded(true);
        setServerReady(true);
      });
  }, [auth?.token, subscription?.can_access, subscription?.plan]);

  // Persistir automáticamente cada vez que cambia el estado (equivalente a saveState()).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* almacenamiento no disponible */
    }
  }, [state]);

  useEffect(() => {
    if (!serverReady || !progressLoaded || !auth?.token || !subscription?.can_access) return;

    fetch(`${API_URL}/progress`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${auth.token}` },
      body: JSON.stringify({
        client_id: clientId.current,
        age_group: state.ageGroup,
        stars: state.stars,
        completed_exercises: state.completedExercises,
        current_subject: state.currentSubject,
        current_index_in_subject: state.currentIndexInSubject,
        owned_characters: state.ownedCharacters,
        selected_character: state.selectedCharacter,
      }),
    }).catch(() => {});
  }, [serverReady, progressLoaded, auth?.token, subscription?.can_access, state.ageGroup, state.stars, state.completedExercises, state.currentSubject, state.currentIndexInSubject, state.ownedCharacters, state.selectedCharacter]);

  async function requestAuth(path, payload) {
    const response = await fetch(`${API_URL}/auth/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        data.message || data.detail || `El servidor respondió ${response.status} para POST ${API_URL}/auth/${path}.`
      );
    }

    const session = { token: data.token || data.access_token, user: data.user || { email: payload.email, name: payload.name } };
    if (!session.token) throw new Error('El servidor no devolvió una sesión válida.');
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    setAuth(session);
    return session;
  }

  const login = (payload) => requestAuth('login', payload);
  const register = (payload) => requestAuth('register', payload);
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  };

  // Progreso derivado (equivalente a updateUI() en el original).
  const progress = useMemo(() => {
    const limits = PLAN_LIMITS[subscription?.plan] || PLAN_LIMITS.basic;
    const completedIds = Object.keys(state.completedExercises).filter(
      (id) => state.completedExercises[id]
    );
    const totalCompleted = completedIds.length;
    const percent = Math.round((totalCompleted / TOTAL_EXERCISES) * 100);

    const bySubject = Object.fromEntries(
      Object.keys(EXERCISE_BANK).map((subjectKey) => {
        const completed = EXERCISE_BANK[subjectKey].slice(0, limits.maxExercisesPerSubject).filter(
          (q) => state.completedExercises[q.id]
        ).length;
        return [subjectKey, completed];
      })
    );

    const badgesCount = Object.values(bySubject).filter((count) => count === 10).length;

    return { totalCompleted, percent, bySubject, badgesCount };
  }, [state.completedExercises, subscription?.plan]);

  const isGrandeUnlocked = progress.totalCompleted >= TOTAL_EXERCISES;

  const actions = useMemo(
    () => ({
      navigate: (view) => dispatch({ type: 'NAVIGATE', view }),
      selectAge: (group) => {
        if (group === 'grandes' && !isGrandeUnlocked) return;
        dispatch({ type: 'SELECT_AGE', group });
      },
      startSubject: (subjectKey) => {
        const planKey = normalizePlanKey(subscription?.plan || 'basic');
        const limits = PLAN_LIMITS[planKey] || PLAN_LIMITS.basic;
        if (!limits.subjects.includes(subjectKey)) {
          dispatch({ type: 'NAVIGATE', view: 'plans' });
          return;
        }
        const questions = EXERCISE_BANK[subjectKey].slice(0, limits.maxExercisesPerSubject);
        const firstUnfinished = questions.findIndex((q) => !state.completedExercises[q.id]);
        dispatch({
          type: 'START_SUBJECT',
          subject: subjectKey,
          index: firstUnfinished !== -1 ? firstUnfinished : 0,
        });
      },
      startSubjectAt: (subjectKey, index) => {
        const limits = PLAN_LIMITS[subscription?.plan] || PLAN_LIMITS.basic;
        if (!limits.subjects.includes(subjectKey) || index >= limits.maxExercisesPerSubject) return;
        dispatch({ type: 'START_SUBJECT', subject: subjectKey, index });
      },
      startDailyMission: () => {
        const subjectKey = 'math';
        const limits = PLAN_LIMITS[subscription?.plan] || PLAN_LIMITS.basic;
        const questions = EXERCISE_BANK[subjectKey].slice(0, limits.maxExercisesPerSubject);
        const firstUnfinished = questions.findIndex((q) => !state.completedExercises[q.id]);
        dispatch({
          type: 'START_DAILY_MISSION',
          subject: subjectKey,
          index: firstUnfinished !== -1 ? firstUnfinished : 0,
        });
      },
      playNextAvailable: () => {
        const limits = PLAN_LIMITS[subscription?.plan] || PLAN_LIMITS.basic;
        const subjects = limits.subjects;
        for (const s of subjects) {
          const questions = EXERCISE_BANK[s].slice(0, limits.maxExercisesPerSubject);
          const idx = questions.findIndex((q) => !state.completedExercises[q.id]);
          if (idx !== -1) {
            dispatch({ type: 'START_SUBJECT', subject: s, index: idx });
            return;
          }
        }
        dispatch({ type: 'START_SUBJECT', subject: 'math', index: 0 });
      },
      exitGame: () => {
        dispatch({ type: 'NAVIGATE', view: state.previousView === 'game' ? 'home' : state.previousView });
      },
      answerCorrect: (exerciseId) => dispatch({ type: 'ANSWER_CORRECT', exerciseId }),
      dailyMissionCorrect: () => dispatch({ type: 'DAILY_MISSION_CORRECT' }),
      failDailyMission: () => dispatch({ type: 'FAIL_DAILY_MISSION' }),
      advanceQuestion: () => dispatch({ type: 'ADVANCE_QUESTION' }),
      resetProgress: () => dispatch({ type: 'RESET_PROGRESS' }),
      setStars: (stars) => dispatch({ type: 'SET_STARS', stars }),
      setCharacter: (selectedCharacter, ownedCharacters, stars) => dispatch({
        type: 'SET_CHARACTER',
        selectedCharacter,
        ownedCharacters,
        stars,
      }),
    }),
    [isGrandeUnlocked, state.completedExercises, state.previousView, subscription?.plan]
  );

  const value = useMemo(() => ({ state, progress, isGrandeUnlocked, auth, authReady, subscription, subscriptionLoading, subscriptionError, subscriptionSuccess, setSubscriptionSuccess, login, register, logout, ...actions }), [state, progress, isGrandeUnlocked, auth, authReady, subscription, subscriptionLoading, subscriptionError, subscriptionSuccess, actions]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState debe usarse dentro de <AppStateProvider>');
  return ctx;
}
