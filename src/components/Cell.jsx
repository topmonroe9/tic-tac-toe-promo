import { memo } from 'react';

const Cell = memo(function Cell({ value, onClick, isWinning, disabled }) {
  const renderSymbol = () => {
    if (value === 'X') {
      // Сердечко для игрока
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-12 h-12 sm:w-16 sm:h-16 text-pink-400 drop-shadow-md animate-pulse-soft"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    }
    if (value === 'O') {
      // Цветочек для компьютера
      return (
        <svg
          viewBox="0 0 24 24"
          className="w-12 h-12 sm:w-16 sm:h-16 text-lavender-400 drop-shadow-md"
          fill="currentColor"
        >
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" />
          <path d="M20 12C20 13.1 19.1 14 18 14C16.9 14 16 13.1 16 12C16 10.9 16.9 10 18 10C19.1 10 20 10.9 20 12Z" />
          <path d="M4 12C4 13.1 4.9 14 6 14C7.1 14 8 13.1 8 12C8 10.9 7.1 10 6 10C4.9 10 4 10.9 4 12Z" />
          <path d="M12 18C13.1 18 14 18.9 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18Z" />
          <path d="M17 5C17.8 5 18.5 5.2 19.1 5.6C18.3 6.4 17.8 7.5 17.8 8.7C17.8 9.9 18.3 11 19.1 11.8C18.5 12.2 17.8 12.4 17 12.4C14.8 12.4 13 10.6 13 8.4C13 6.2 14.8 5 17 5Z" />
          <path d="M7 5C9.2 5 11 6.2 11 8.4C11 10.6 9.2 12.4 7 12.4C6.2 12.4 5.5 12.2 4.9 11.8C5.7 11 6.2 9.9 6.2 8.7C6.2 7.5 5.7 6.4 4.9 5.6C5.5 5.2 6.2 5 7 5Z" />
          <path d="M7 19C6.2 19 5.5 18.8 4.9 18.4C5.7 17.6 6.2 16.5 6.2 15.3C6.2 14.1 5.7 13 4.9 12.2C5.5 11.8 6.2 11.6 7 11.6C9.2 11.6 11 13.4 11 15.6C11 17.8 9.2 19 7 19Z" />
          <path d="M17 11.6C17.8 11.6 18.5 11.8 19.1 12.2C18.3 13 17.8 14.1 17.8 15.3C17.8 16.5 18.3 17.6 19.1 18.4C18.5 18.8 17.8 19 17 19C14.8 19 13 17.8 13 15.6C13 13.4 14.8 11.6 17 11.6Z" />
          <circle cx="12" cy="12" r="4" className="text-mint-300" fill="currentColor" />
        </svg>
      );
    }
    return null;
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        aspect-square w-full
        bg-white/80 backdrop-blur-sm
        rounded-2xl shadow-lg
        flex items-center justify-center
        transition-all duration-300
        hover:bg-white hover:shadow-xl hover:scale-105
        disabled:cursor-not-allowed disabled:hover:scale-100
        ${isWinning ? 'ring-4 ring-pink-300 bg-pink-50' : ''}
        ${!value && !disabled ? 'hover:bg-pink-50' : ''}
      `}
    >
      {renderSymbol()}
    </button>
  );
});

export default Cell;
