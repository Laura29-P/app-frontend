import { useCallback, useEffect, useRef, useState } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';

const NativeSpeech = registerPlugin('NativeSpeech');

// Hook que encapsula el AudioContext para reproducir "beeps" sintetizados,
// equivalente a playBeep() en la versión original.
export function useSoundEffects() {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      audioCtxRef.current = new AudioCtx();
    }
    return () => {
      audioCtxRef.current?.close?.();
    };
  }, []);

  const playBeep = useCallback((type) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'correct') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      /* audio no disponible */
    }
  }, []);

  return { playBeep };
}

// Hook para pronunciación con Web Speech API, equivalente a speak().
export function useSpeech() {
  const [speechError, setSpeechError] = useState('');
  const utteranceRef = useRef(null);
  const stop = useCallback(() => {
    if (Capacitor.isNativePlatform()) NativeSpeech.stop().catch(() => {});
    else window.speechSynthesis?.cancel();
    utteranceRef.current = null;
  }, []);
  useEffect(() => () => stop(), [stop]);
  const speak = useCallback(async (text, lang = 'en-US') => {
    setSpeechError('');
    if (Capacitor.isNativePlatform()) {
      try { await NativeSpeech.speak({ text, lang }); }
      catch (error) { setSpeechError(error.message || 'No se pudo reproducir la voz de Android.'); }
      return;
    }
    if (!window.speechSynthesis) {
      setSpeechError('Este navegador no tiene voz disponible. Prueba desde Chrome o la aplicación Android.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang === lang) || voices.find((item) => item.lang.startsWith(lang.split('-')[0]));
    if (voice) utterance.voice = voice;
    utterance.onerror = (event) => {
      if (!['canceled', 'interrupted'].includes(event.error)) setSpeechError('No se pudo reproducir el audio. Revisa el volumen multimedia y la voz de inglés del dispositivo.');
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak, stop, speechError };
}
