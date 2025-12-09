import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { playWin } from '../hooks/useSound';

const WinModal = ({ promoCode, onPlayAgain }) => {
  const [copied, setCopied] = useState(false);

  // Confetti и звук при появлении
  useEffect(() => {
    // Запускаем confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#f472b6', '#a78bfa', '#6ee7b7', '#fbbf24']; // pink, lavender, mint, gold

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    // Финальный взрыв
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors
      });
    }, 300);

    // Звук победы
    playWin();
  }, []);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-modal-in relative overflow-hidden">
        {/* Декоративные звёзды */}
        <div className="absolute -top-2 left-1/4 text-3xl animate-float" style={{ animationDelay: '0s' }}>✨</div>
        <div className="absolute -top-1 right-1/4 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>⭐</div>
        <div className="absolute top-4 right-6 text-xl animate-float" style={{ animationDelay: '1s' }}>✨</div>

        <div className="text-center relative z-10">
          {/* Иконка победы */}
          <div className="mb-4 text-6xl animate-bounce-in">
            🎉
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-500 to-lavender-500 bg-clip-text text-transparent mb-2">
            Поздравляем!
          </h2>

          <p className="text-gray-600 mb-6">
            Вы выиграли! Вот ваш промокод на скидку:
          </p>

          {/* Промокод с кнопкой копирования */}
          <div className="bg-gradient-to-r from-pink-100 to-lavender-100 rounded-2xl p-4 mb-4 relative">
            <p className="text-xs text-gray-500 mb-2">Ваш промокод:</p>
            <div className="flex items-center justify-center gap-3">
              <p className="font-mono text-3xl sm:text-4xl font-bold text-pink-500 tracking-wider">
                {promoCode}
              </p>
            </div>
          </div>

          {/* Кнопка копирования */}
          <button
            onClick={copyCode}
            className={`w-full mb-4 py-2.5 px-4 rounded-xl font-medium transition-all duration-300 ${
              copied
                ? 'bg-mint-400 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            {copied ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Скопировано!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Скопировать промокод
              </span>
            )}
          </button>

          <p className="text-sm text-gray-500 mb-6">
            Сохраните его и используйте при следующем заказе!
          </p>

          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-3.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Сыграть ещё раз
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinModal;
