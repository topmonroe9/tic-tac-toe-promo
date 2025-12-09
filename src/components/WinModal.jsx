const WinModal = ({ promoCode, onPlayAgain }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-float">
        {/* Конфетти/звёзды декорация */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-4xl">
          ✨
        </div>

        <div className="text-center">
          {/* Иконка победы */}
          <div className="mb-4 text-6xl animate-pulse-soft">
            🎉
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-bold text-pink-500 mb-2">
            Поздравляем!
          </h2>

          <p className="text-gray-600 mb-6">
            Вы выиграли! Вот ваш промокод на скидку:
          </p>

          {/* Промокод */}
          <div className="bg-gradient-to-r from-pink-100 to-lavender-100 rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Ваш промокод:</p>
            <p className="font-mono text-3xl sm:text-4xl font-bold text-pink-500 tracking-wider">
              {promoCode}
            </p>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            Сохраните его и используйте при следующем заказе!
          </p>

          <button
            onClick={onPlayAgain}
            className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Сыграть ещё раз
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinModal;
