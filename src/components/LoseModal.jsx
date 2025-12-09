const LoseModal = ({ onPlayAgain }) => {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          {/* Иконка */}
          <div className="mb-4 text-6xl">
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
            className="w-full bg-gradient-to-r from-lavender-400 to-lavender-500 text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Сыграть ещё раз
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoseModal;
