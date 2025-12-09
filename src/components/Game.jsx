import { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import WinModal from './WinModal';
import LoseModal from './LoseModal';
import DrawModal from './DrawModal';

const BLOCK_DURATION = 10 * 60 * 1000; // 10 минут
const MAX_DRAW_ATTEMPTS = 3;

const Game = () => {
  const [gameToken, setGameToken] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing');
  const [winningLine, setWinningLine] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [drawAttempts, setDrawAttempts] = useState(() => {
    const saved = localStorage.getItem('drawAttempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [blockEndTime, setBlockEndTime] = useState(() => {
    const saved = localStorage.getItem('blockEndTime');
    return saved ? parseInt(saved, 10) : null;
  });
  const [isBlocked, setIsBlocked] = useState(false);

  // Запустить новую игру
  const startGame = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.gameToken) {
        setGameToken(data.gameToken);
        setBoard(data.board);
        setGameStatus(data.status);
        setIsPlayerTurn(data.isPlayerTurn);
        setWinningLine(null);
        setPromoCode('');
      }
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Проверка блокировки при загрузке
  useEffect(() => {
    if (blockEndTime) {
      const now = Date.now();
      if (now < blockEndTime) {
        setIsBlocked(true);
        setGameStatus('draw');
      } else {
        localStorage.removeItem('blockEndTime');
        localStorage.removeItem('drawAttempts');
        setBlockEndTime(null);
        setDrawAttempts(0);
        startGame();
      }
    } else {
      startGame();
    }
  }, []);

  // Ход игрока
  const handleCellClick = async (index) => {
    if (
      !gameToken ||
      board[index] !== null ||
      !isPlayerTurn ||
      gameStatus !== 'playing' ||
      isBlocked ||
      isLoading
    ) {
      return;
    }

    try {
      setIsLoading(true);
      setIsPlayerTurn(false);

      // Оптимистичное обновление UI
      const optimisticBoard = [...board];
      optimisticBoard[index] = 'X';
      setBoard(optimisticBoard);

      const response = await fetch('/api/game/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameToken, cellIndex: index }),
      });

      const data = await response.json();

      if (data.error) {
        console.error('Move error:', data.error);
        setBoard(board); // Откат
        setIsPlayerTurn(true);
        return;
      }

      // Обновить состояние из ответа сервера
      setGameToken(data.gameToken);
      setBoard(data.board);
      setWinningLine(data.winningLine);

      if (data.status === 'playerWin') {
        setGameStatus('playerWin');
        setPromoCode(data.promoCode);
        localStorage.removeItem('drawAttempts');
        setDrawAttempts(0);
      } else if (data.status === 'computerWin') {
        setGameStatus('computerWin');
      } else if (data.status === 'draw') {
        handleDrawResult(data.drawAttempts);
      } else {
        setIsPlayerTurn(true);
      }
    } catch (error) {
      console.error('Failed to make move:', error);
      setBoard(board); // Откат
      setIsPlayerTurn(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка ничьей
  const handleDrawResult = (serverDrawAttempts) => {
    setDrawAttempts(serverDrawAttempts);
    localStorage.setItem('drawAttempts', serverDrawAttempts.toString());

    if (serverDrawAttempts >= MAX_DRAW_ATTEMPTS) {
      const endTime = Date.now() + BLOCK_DURATION;
      setBlockEndTime(endTime);
      localStorage.setItem('blockEndTime', endTime.toString());
      setIsBlocked(true);
    }

    setGameStatus('draw');
  };

  // Начать заново
  const resetGame = useCallback(async () => {
    // Проверить, не истекла ли блокировка
    if (blockEndTime && Date.now() >= blockEndTime) {
      localStorage.removeItem('blockEndTime');
      localStorage.removeItem('drawAttempts');
      setBlockEndTime(null);
      setDrawAttempts(0);
      setIsBlocked(false);
    }

    if (!isBlocked || (blockEndTime && Date.now() >= blockEndTime)) {
      setIsBlocked(false);
      await startGame();
    }
  }, [isBlocked, blockEndTime, startGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* Заголовок */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 via-lavender-400 to-mint-400 bg-clip-text text-transparent mb-2">
          Крестики-Нолики
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          Побеждай и получай промокоды!
        </p>
      </div>

      {/* Легенда */}
      <div className="flex gap-6 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 text-pink-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <span className="text-sm text-gray-600">Вы</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 text-lavender-400">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </div>
          <span className="text-sm text-gray-600">Компьютер</span>
        </div>
      </div>

      {/* Статус хода */}
      <div className="mb-4 sm:mb-6 px-4 py-2 bg-white/70 rounded-full shadow-md">
        <p className="text-sm font-medium text-gray-600">
          {isLoading ? (
            '🤔 Компьютер думает...'
          ) : gameStatus === 'playing' ? (
            isPlayerTurn ? '💕 Ваш ход!' : '🤔 Компьютер думает...'
          ) : null}
        </p>
      </div>

      {/* Игровое поле */}
      <div className="w-full max-w-xs sm:max-w-sm">
        <Board
          board={board}
          onCellClick={handleCellClick}
          winningLine={winningLine}
          disabled={!isPlayerTurn || gameStatus !== 'playing' || isBlocked || isLoading}
        />
      </div>

      {/* Кнопка сброса */}
      {gameStatus === 'playing' && !isBlocked && (
        <button
          onClick={resetGame}
          disabled={isLoading}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          Начать заново
        </button>
      )}

      {/* Модальные окна */}
      {gameStatus === 'playerWin' && (
        <WinModal promoCode={promoCode} onPlayAgain={resetGame} />
      )}

      {gameStatus === 'computerWin' && (
        <LoseModal onPlayAgain={resetGame} />
      )}

      {gameStatus === 'draw' && (
        <DrawModal
          attemptsLeft={MAX_DRAW_ATTEMPTS - drawAttempts}
          isBlocked={isBlocked}
          blockEndTime={blockEndTime}
          onPlayAgain={resetGame}
        />
      )}
    </div>
  );
};

export default Game;
