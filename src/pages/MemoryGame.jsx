import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

import { API_URL } from '../api.js';
const CARDS = ['🌈', '🚀', '🌍', '🦋', '🎸', '🍎', '⭐', '🐳'];

function createDeck() {
  return [...CARDS, ...CARDS]
    .sort(() => Math.random() - 0.5)
    .map((emoji, index) => ({ id: index, emoji, matched: false }));
}

export default function MemoryGame() {
  const { auth, navigate, state } = useAppState();
  const [cards, setCards] = useState(createDeck);
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startedAt, setStartedAt] = useState(Date.now);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const compareTimer = useRef(null);

  const matchedPairs = cards.filter((card) => card.matched).length / 2;
  const score = Math.max(0, Math.round((matchedPairs / CARDS.length) * 100 - Math.max(0, moves - CARDS.length) * 2));

  useEffect(() => () => clearTimeout(compareTimer.current), []);

  useEffect(() => {
    if (matchedPairs !== CARDS.length || finished) return;

    setFinished(true);
    setSaving(true);
    const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const clientId = localStorage.getItem('aventura_learning_client_id');

    fetch(`${API_URL}/mini-games/memory/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: JSON.stringify({ client_id: clientId, score, moves, duration_seconds: durationSeconds }),
    })
      .then((response) => {
        if (response.ok) setSaved(true);
      })
      .catch(() => {})
      .finally(() => setSaving(false));
  }, [auth?.token, finished, matchedPairs, moves, score, startedAt]);

  const resetGame = () => {
    clearTimeout(compareTimer.current);
    setCards(createDeck());
    setFlipped([]);
    setMoves(0);
    setStartedAt(Date.now());
    setFinished(false);
    setSaving(false);
    setSaved(false);
  };

  const selectCard = (card) => {
    if (finished || card.matched || flipped.some((item) => item.id === card.id) || flipped.length === 2) return;

    const nextFlipped = [...flipped, card];
    setFlipped(nextFlipped);
    if (nextFlipped.length !== 2) return;

    setMoves((value) => value + 1);
    if (nextFlipped[0].emoji === nextFlipped[1].emoji) {
      setCards((current) => current.map((item) => (
        item.emoji === card.emoji ? { ...item, matched: true } : item
      )));
      setFlipped([]);
      return;
    }

    compareTimer.current = setTimeout(() => setFlipped([]), 700);
  };

  return (
    <section className="flex flex-col gap-5 py-2 w-full max-w-2xl mx-auto animate-pop">
      <div className="flex items-center justify-between gap-3">
        <button
          aria-label="Volver al inicio"
          className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface border border-surface-container-high tap-bounce"
          onClick={() => navigate('home')}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-wider text-secondary">Mini juego</span>
          <h2 className="text-2xl sm:text-3xl font-black text-on-surface">Memoria de parejas</h2>
        </div>
        <button
          aria-label="Reiniciar juego"
          title="Reiniciar juego"
          className="w-11 h-11 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center tap-bounce"
          onClick={resetGame}
        >
          <span className="material-symbols-outlined">refresh</span>
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-3xl bg-surface-container-lowest border border-surface-container p-4 shadow-sm">
        <div>
          <p className="text-xs font-bold text-on-surface-variant">Parejas</p>
          <p className="text-xl font-black text-on-surface">{matchedPairs}/{CARDS.length}</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-bold text-on-surface-variant">Movimientos</p>
          <p className="text-xl font-black text-on-surface">{moves}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-bold text-on-surface-variant">Puntos</p>
          <p className="text-xl font-black text-amber-600">{score}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) => {
          const isVisible = card.matched || flipped.some((item) => item.id === card.id);
          return (
            <button
              key={card.id}
              aria-label={isVisible ? `Carta ${card.emoji}` : 'Carta oculta'}
              className={`aspect-square rounded-2xl sm:rounded-3xl border-2 text-3xl sm:text-5xl flex items-center justify-center transition-all tap-bounce ${
                isVisible
                  ? 'bg-amber-100 border-amber-300 shadow-inner'
                  : 'bg-secondary-container border-secondary text-transparent shadow-[0_4px_0_0_#006493]'
              }`}
              onClick={() => selectCard(card)}
            >
              {isVisible ? card.emoji : '?'}
            </button>
          );
        })}
      </div>

      {finished && (
        <div className="rounded-3xl bg-tertiary-container text-on-tertiary-container p-5 text-center animate-pop">
          <p className="text-2xl font-black">¡Completaste todas las parejas! 🎉</p>
          <p className="mt-1 font-bold">Lograste {score} puntos en {moves} movimientos.</p>
          <p className="mt-2 text-sm font-semibold">{saving ? 'Guardando resultado...' : saved ? 'Resultado guardado en tu progreso.' : 'Resultado disponible en esta sesión.'}</p>
          <button
            className="mt-4 px-5 py-2.5 rounded-full bg-white text-tertiary font-black shadow-sm tap-bounce"
            onClick={resetGame}
          >
            Jugar de nuevo
          </button>
        </div>
      )}

      {!finished && (
        <p className="text-center text-sm font-bold text-on-surface-variant">Encuentra las 8 parejas con la menor cantidad de movimientos.</p>
      )}
    </section>
  );
}
