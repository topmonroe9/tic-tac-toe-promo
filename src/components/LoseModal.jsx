import { useEffect, useState } from 'react';
import { playLose } from '../hooks/useSound';

const LoseModal = ({ onPlayAgain }) => {
  const [shake, setShake] = useState(true);

  useEffect(() => {
    // Звук проигрыша
    playLose();

    // Убрать shake после анимации
    const timer = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className={`glass-strong rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-modal-in ${shake ? 'animate-shake' : ''}`}>
        <div className="text-center">
          {/* Иконка */}
          <div className="mb-4 text-6xl animate-bounce-in">
            💫
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-lavender-500 mb-2">
            Почти получилось!
          </h2>

          <p className="text-gray-600 mb-6">
            В этот раз победа досталась компьютеру, но не расстраивайтесь — удача любит настойчивых!
          </p>

          <div className="bg-gradient-to-r from-lavender-50 to-mint-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600">
              Попробуйте ещё раз — промокод на скидку ждёт вас!
            </p>
          </div>

          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-lavender-400 to-lavender-500 text-white font-semibold py-3.5 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Сыграть ещё раз
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoseModal;
