export const config = {
  runtime: 'edge',
};

// ==================== TOKEN FUNCTIONS ====================

async function signToken(payload, secret) {
  const encoder = new TextEncoder();
  const data = JSON.stringify(payload);
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  const dataBase64 = btoa(data);
  return `${dataBase64}.${signatureBase64}`;
}

async function verifyToken(token, secret) {
  try {
    const [dataBase64, signatureBase64] = token.split('.');
    if (!dataBase64 || !signatureBase64) return null;

    const data = atob(dataBase64);
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));

    if (!isValid) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// ==================== GAME LOGIC ====================

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6], // diagonals
];

function checkWinner(board) {
  for (const [a, b, c] of WINNING_COMBINATIONS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function checkDraw(board) {
  return board.every(cell => cell !== null) && !checkWinner(board);
}

function getEmptyCells(board) {
  return board.map((cell, i) => cell === null ? i : null).filter(i => i !== null);
}

function findWinningMove(board, player) {
  for (const i of getEmptyCells(board)) {
    const testBoard = [...board];
    testBoard[i] = player;
    if (checkWinner(testBoard)) return i;
  }
  return null;
}

// AI: Easy level (30% random moves)
function getComputerMove(board) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return null;

  // 30% chance of random move
  if (Math.random() < 0.3) {
    return empty[Math.floor(Math.random() * empty.length)];
  }

  // Try to win
  const winMove = findWinningMove(board, 'O');
  if (winMove !== null) return winMove;

  // Block player
  const blockMove = findWinningMove(board, 'X');
  if (blockMove !== null) return blockMove;

  // Take center
  if (board[4] === null) return 4;

  // Take corner
  const corners = [0, 2, 6, 8].filter(i => board[i] === null);
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Random
  return empty[Math.floor(Math.random() * empty.length)];
}

function generatePromoCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ==================== TELEGRAM ====================

async function sendTelegram(message) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });
  } catch (e) {
    console.error('Telegram error:', e);
  }
}

// ==================== HANDLER ====================

export default async function handler(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers,
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500, headers,
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers,
    });
  }

  const { gameToken, cellIndex } = body;

  if (!gameToken || cellIndex === undefined) {
    return new Response(JSON.stringify({ error: 'Missing gameToken or cellIndex' }), {
      status: 400, headers,
    });
  }

  // Verify token
  const gameState = await verifyToken(gameToken, secret);
  if (!gameState) {
    return new Response(JSON.stringify({ error: 'Invalid game token' }), {
      status: 401, headers,
    });
  }

  // Validate game state
  if (gameState.status !== 'playing') {
    return new Response(JSON.stringify({ error: 'Game already ended' }), {
      status: 400, headers,
    });
  }

  if (!gameState.isPlayerTurn) {
    return new Response(JSON.stringify({ error: 'Not your turn' }), {
      status: 400, headers,
    });
  }

  // Validate move
  if (cellIndex < 0 || cellIndex > 8 || gameState.board[cellIndex] !== null) {
    return new Response(JSON.stringify({ error: 'Invalid move' }), {
      status: 400, headers,
    });
  }

  // Apply player move
  const board = [...gameState.board];
  board[cellIndex] = 'X';

  let status = 'playing';
  let promoCode = null;
  let winningLine = null;
  let computerMove = null;

  // Check player win
  const playerWin = checkWinner(board);
  if (playerWin) {
    status = 'playerWin';
    winningLine = playerWin.line;
    promoCode = generatePromoCode();
    await sendTelegram(`Победа! Промокод выдан: ${promoCode}`);
  } else if (checkDraw(board)) {
    status = 'draw';
  } else {
    // Computer move
    computerMove = getComputerMove(board);
    if (computerMove !== null) {
      board[computerMove] = 'O';

      const computerWin = checkWinner(board);
      if (computerWin) {
        status = 'computerWin';
        winningLine = computerWin.line;
        await sendTelegram('Проигрыш');
      } else if (checkDraw(board)) {
        status = 'draw';
      }
    }
  }

  // Update game state
  const newGameState = {
    ...gameState,
    board,
    status,
    isPlayerTurn: status === 'playing',
    drawAttempts: status === 'draw' ? gameState.drawAttempts + 1 : gameState.drawAttempts,
  };

  const newToken = await signToken(newGameState, secret);

  return new Response(JSON.stringify({
    gameToken: newToken,
    board,
    status,
    computerMove,
    winningLine,
    promoCode,
    drawAttempts: newGameState.drawAttempts,
  }), {
    status: 200,
    headers,
  });
}
