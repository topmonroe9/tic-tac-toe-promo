import { useState, useEffect, useCallback } from 'react';
import Board from './Board';
import WinModal from './WinModal';
import LoseModal from './LoseModal';
import DrawModal from './DrawModal';
import { checkWinner, checkDraw, getComputerMove, generatePromoCode } from '../utils/gameLogic';

const PLAYER = 'X';
const COMPUTER = 'O';
const BLOCK_DURATION = 10 * 60 * 1000; // 10 минут в миллисекундах
const MAX_DRAW_ATTEMPTS = 3;

const Game = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameStatus, setGameStatus] = useState('playing'); // playing, playerWin, computerWin, draw
  const [winningLine, setWinningLine] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [drawAttempts, setDrawAttempts] = useState(() => {
    const saved = localStorage.getItem('drawAttempts');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [blockEndTime, setBlockEndTime] = useState(() => {
    const saved = localStorage.getItem('blockEndTime');
    return saved ? parseInt(saved, 10) : null;
  });
  const [isBlocked, setIsBlocked] = useState(false);

  // Проверка блокировки при загрузке
  useEffect(() => {
    if (blockEndTime) {
      const now = Date.now();
      if (now < blockEndTime) {
        setIsBlocked(true);
        setGameStatus('draw');
      } else {
        // Блокировка истекла
        localStorage.removeItem('blockEndTime');
        localStorage.removeItem('drawAttempts');
        setBlockEndTime(null);
        setDrawAttempts(0);
      }
    }
  }, [blockEndTime]);

  // Отправка сообщения в Telegram
  const sendToTelegram = async (message) => {
    try {
      await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
    } catch (error) {
      console.error('Failed to send to Telegram:', error);
    }
  };

  // Ход компьютера
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(board, COMPUTER);
        if (computerMove !== null) {
          const newBoard = [...board];
          newBoard[computerMove] = COMPUTER;
          setBoard(newBoard);

          const result = checkWinner(newBoard);
          if (result) {
            setWinningLine(result.line);
            setGameStatus('computerWin');
            sendToTelegram('Проигрыш');
          } else if (checkDraw(newBoard)) {
            handleDraw();
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 700); // Небольшая задержка для реалистичности

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus, board]);

  // Обработка ничьей
  const handleDraw = () => {
    const newAttempts = drawAttempts + 1;
    setDrawAttempts(newAttempts);
    localStorage.setItem('drawAttempts', newAttempts.toString());

    if (newAttempts >= MAX_DRAW_ATTEMPTS) {
      const endTime = Date.now() + BLOCK_DURATION;
      setBlockEndTime(endTime);
      localStorage.setItem('blockEndTime', endTime.toString());
      setIsBlocked(true);
    }

    setGameStatus('draw');
  };

  // Ход игрока
  const handleCellClick = (index) => {
    if (
      board[index] !== null ||
      !isPlayerTurn ||
      gameStatus !== 'playing' ||
      isBlocked
    ) {
      return;
    }

    const newBoard = [...board];
    newBoard[index] = PLAYER;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinningLine(result.line);
      const code = generatePromoCode();
      setPromoCode(code);
      setGameStatus('playerWin');
      sendToTelegram(`Победа! Промокод выдан: ${code}`);
      // Сбросить попытки ничьей при победе
      localStorage.removeItem('drawAttempts');
      setDrawAttempts(0);
    } else if (checkDraw(newBoard)) {
      handleDraw();
    } else {
      setIsPlayerTurn(false);
    }
  };

  // Начать заново
  const resetGame = useCallback(() => {
    // Проверить, не истекла ли блокировка
    if (blockEndTime && Date.now() >= blockEndTime) {
      localStorage.removeItem('blockEndTime');
      localStorage.removeItem('drawAttempts');
      setBlockEndTime(null);
      setDrawAttempts(0);
      setIsBlocked(false);
    }

    if (!isBlocked || (blockEndTime && Date.now() >= blockEndTime)) {
      setBoard(Array(9).fill(null));
      setIsPlayerTurn(true);
      setGameStatus('playing');
      setWinningLine(null);
      setPromoCode('');
      setIsBlocked(false);
    }
  }, [isBlocked, blockEndTime]);

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
          {gameStatus === 'playing' && (
            isPlayerTurn ? '💕 Ваш ход!' : '🤔 Компьютер думает...'
          )}
        </p>
      </div>

      {/* Игровое поле */}
      <div className="w-full max-w-xs sm:max-w-sm">
        <Board
          board={board}
          onCellClick={handleCellClick}
          winningLine={winningLine}
          disabled={!isPlayerTurn || gameStatus !== 'playing' || isBlocked}
        />
      </div>

      {/* Кнопка сброса */}
      {gameStatus === 'playing' && !isBlocked && (
        <button
          onClick={resetGame}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
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
