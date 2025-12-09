import { useCallback, useRef } from 'react';

// Web Audio API для синтеза звуков (без внешних файлов)
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

// Звук клика - короткий "pop"
export const playClick = () => {
  if (!audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
};

// Звук победы - радостная мелодия
export const playWin = () => {
  if (!audioContext) return;

  const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.15);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + i * 0.15 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);

    oscillator.start(audioContext.currentTime + i * 0.15);
    oscillator.stop(audioContext.currentTime + i * 0.15 + 0.3);
  });
};

// Звук проигрыша - грустный звук
export const playLose = () => {
  if (!audioContext) return;

  const notes = [400, 350, 300]; // Нисходящая мелодия

  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.2);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime + i * 0.2);
    gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + i * 0.2 + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.2 + 0.4);

    oscillator.start(audioContext.currentTime + i * 0.2);
    oscillator.stop(audioContext.currentTime + i * 0.2 + 0.4);
  });
};

// Хук для использования в компонентах
export const useSound = () => {
  const isEnabledRef = useRef(true);

  const click = useCallback(() => {
    if (isEnabledRef.current) {
      // Resume audio context on user interaction (browser policy)
      if (audioContext?.state === 'suspended') {
        audioContext.resume();
      }
      playClick();
    }
  }, []);

  const win = useCallback(() => {
    if (isEnabledRef.current) {
      if (audioContext?.state === 'suspended') {
        audioContext.resume();
      }
      playWin();
    }
  }, []);

  const lose = useCallback(() => {
    if (isEnabledRef.current) {
      if (audioContext?.state === 'suspended') {
        audioContext.resume();
      }
      playLose();
    }
  }, []);

  return { click, win, lose };
};

export default useSound;
