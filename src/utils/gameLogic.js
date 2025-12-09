// Выигрышные комбинации
const WINNING_COMBINATIONS = [
  [0, 1, 2], // верхний ряд
  [3, 4, 5], // средний ряд
  [6, 7, 8], // нижний ряд
  [0, 3, 6], // левая колонка
  [1, 4, 7], // средняя колонка
  [2, 5, 8], // правая колонка
  [0, 4, 8], // диагональ
  [2, 4, 6], // обратная диагональ
];

// Проверка победителя
export const checkWinner = (board) => {
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: combination };
    }
  }
  return null;
};

// Проверка ничьей
export const checkDraw = (board) => {
  return board.every((cell) => cell !== null) && !checkWinner(board);
};

// Получить пустые ячейки
const getEmptyCells = (board) => {
  return board
    .map((cell, index) => (cell === null ? index : null))
    .filter((index) => index !== null);
};

// Найти выигрышный ход
const findWinningMove = (board, player) => {
  const emptyCells = getEmptyCells(board);

  for (const index of emptyCells) {
    const testBoard = [...board];
    testBoard[index] = player;
    if (checkWinner(testBoard)) {
      return index;
    }
  }
  return null;
};

// Найти блокирующий ход
const findBlockingMove = (board, player) => {
  const opponent = player === 'X' ? 'O' : 'X';
  return findWinningMove(board, opponent);
};

// Случайный ход
const getRandomMove = (board) => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return null;
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// ИИ для компьютера (лёгкий уровень)
// 30% шанс сделать случайный ход вместо оптимального
export const getComputerMove = (board, computerSymbol = 'O') => {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return null;

  // 30% шанс сделать случайный ход (сделать ИИ проигрывающим)
  if (Math.random() < 0.3) {
    return getRandomMove(board);
  }

  // Попробовать выиграть
  const winningMove = findWinningMove(board, computerSymbol);
  if (winningMove !== null) {
    return winningMove;
  }

  // Попробовать заблокировать
  const blockingMove = findBlockingMove(board, computerSymbol);
  if (blockingMove !== null) {
    return blockingMove;
  }

  // Занять центр если свободен
  if (board[4] === null) {
    return 4;
  }

  // Занять угол если свободен
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Любой свободный ход
  return getRandomMove(board);
};

// Генерация 5-значного промокода
export const generatePromoCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
