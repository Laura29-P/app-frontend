import React, { useEffect, useState } from 'react';
import { useAppState } from '../context/AppStateContext.jsx';

import { API_URL } from '../api.js';
const CHARACTERS = [
  { id: 'luna', name: 'Luna', emoji: '🦊', price: 0, color: 'from-orange-100 to-amber-200' },
  { id: 'niko', name: 'Niko', emoji: '🐼', price: 5, color: 'from-slate-100 to-sky-200' },
  { id: 'sol', name: 'Sol', emoji: '🦁', price: 10, color: 'from-yellow-100 to-orange-200' },
  { id: 'mara', name: 'Mara', emoji: '🐬', price: 15, color: 'from-cyan-100 to-emerald-200' },
];

export default function Characters() {
  const { auth, navigate, state, setCharacter } = useAppState();
  const [owned, setOwned] = useState(['luna']);
  const [selected, setSelected] = useState('luna');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/characters?client_id=${encodeURIComponent(localStorage.getItem('aventura_learning_client_id'))}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${auth.token}` },
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data) {
          setOwned(data.owned_characters || ['luna']);
          setSelected(data.selected_character || 'luna');
          setCharacter(data.selected_character || 'luna', data.owned_characters || ['luna'], data.stars);
        }
      })
      .catch(() => {});
  }, [auth.token]);

  const chooseCharacter = async (character) => {
    setLoading(character.id);
    setMessage('');
    const isOwned = owned.includes(character.id);
    try {
      const response = await fetch(`${API_URL}/characters/${character.id}/${isOwned ? 'select' : 'purchase'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ client_id: localStorage.getItem('aventura_learning_client_id') }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'No se pudo cambiar el personaje.');
      setOwned(data.owned_characters);
      setSelected(data.selected_character);
        setCharacter(data.selected_character, data.owned_characters, data.stars);
      setMessage(isOwned ? `${character.name} es tu personaje activo.` : `¡Compraste a ${character.name}!`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="w-full max-w-3xl mx-auto py-2 flex flex-col gap-5 animate-pop">
      <div className="flex items-center justify-between">
        <button aria-label="Volver" className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center tap-bounce" onClick={() => navigate('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="text-center"><span className="text-xs font-black uppercase tracking-wider text-secondary">Personaliza tu aventura</span><h1 className="text-2xl font-black">Mis personajes</h1></div>
        <div className="bg-amber-100 text-amber-900 px-3 py-2 rounded-full font-black">⭐ {state.stars}</div>
      </div>
      <p className="text-center text-sm font-semibold text-on-surface-variant">Gana 3 estrellas por cada acierto, incluso al repetir ejercicios, y compra personajes. No se realizan cobros de dinero aquí.</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CHARACTERS.map((character) => {
          const isOwned = owned.includes(character.id);
          const active = selected === character.id;
          return (
            <article key={character.id} className={`rounded-3xl bg-gradient-to-br ${character.color} p-4 border-2 ${active ? 'border-primary shadow-md' : 'border-white/70'} text-center`}>
              <div className="text-6xl py-3" aria-hidden="true">{character.emoji}</div>
              <h2 className="font-black text-on-surface">{character.name}</h2>
              <p className="text-xs font-bold text-on-surface-variant mt-1">{isOwned ? active ? 'Activo' : 'Comprado' : `${character.price} ⭐`}</p>
              <button className="w-full mt-3 rounded-full bg-white/80 py-2 text-xs font-black tap-bounce disabled:opacity-60" onClick={() => chooseCharacter(character)} disabled={loading === character.id || active}>
                {loading === character.id ? '...' : active ? 'Elegido' : isOwned ? 'Elegir' : 'Comprar'}
              </button>
            </article>
          );
        })}
      </div>
      {message && <p className="text-center text-sm font-black text-secondary">{message}</p>}
    </section>
  );
}
