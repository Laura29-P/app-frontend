import { useCallback } from 'react';
import confetti from 'canvas-confetti';

// Hook envoltorio de canvas-confetti, equivalente a fireConfetti().
export function useConfetti() {
  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffa800', '#36b5fd', '#3ad478', '#ff6b6b'],
    });
  }, []);

  return { fireConfetti };
}
