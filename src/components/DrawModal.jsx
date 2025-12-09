import { useState, useEffect } from 'react';

const DrawModal = ({ attemptsLeft, isBlocked, blockEndTime, onPlayAgain }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isBlocked || !blockEndTime) return;

    const totalDuration = 10 * 60 * 1000; // 10 минут

    const updateTimer = () => {
      const now = Date.now();
      const remaining = blockEndTime - now;

      if (remaining <= 0) {
        setTimeLeft('');
        setProgress(100);
        onPlayAgain(); // Разблокировать
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);

      // Прогресс
      const elapsed = totalDuration - remaining;
      setProgress((elapsed / totalDuration) * 100);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isBlocked, blockEndTime, onPlayAgain]);

  if (isBlocked) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-modal-in">
          <div className="text-center">
            <div className="mb-4 text-6xl animate-bounce-in">
              ⏰
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-rose-gold mb-2">
              Небольшой перерыв
            </h2>

            <p className="text-gray-600 mb-6">
              У вас закончились попытки. Подождите немного, и можно будет сыграть снова!
            </p>

            <div className="bg-gradient-to-r from-pink-50 to-lavender-50 rounded-2xl p-6 mb-4">
              <p className="text-xs text-gray-500 mb-2">Осталось подождать:</p>
              <p className="font-mono text-4xl font-bold text-pink-500">
                {timeLeft}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-lavender-400 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="text-sm text-gray-500">
              Время пролетит незаметно! ☕
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="glass-strong rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-modal-in">
        <div className="text-center">
          <div className="mb-4 text-6xl animate-bounce-in">
            🤝
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-mint-500 mb-2">
            Ничья!
          </h2>

          <p className="text-gray-600 mb-4">
            Отличная игра! Вы сыграли вничью с компьютером.
          </p>

          <div className="bg-gradient-to-r from-mint-50 to-lavender-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              Осталось попыток: <span className="font-bold text-pink-500">{attemptsLeft}</span> из 3
            </p>
            {/* Индикатор попыток */}
            <div className="flex justify-center gap-2 mt-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all ${
                    i < attemptsLeft
                      ? 'bg-pink-400'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-mint-400 to-mint-500 text-white font-semibold py-3.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Попробовать ещё раз
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawModal;
