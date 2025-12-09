export const config = {
  runtime: 'edge',
};

// Simple HMAC-based token signing using Web Crypto API
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

export default async function handler(request) {
  // CORS headers
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
      status: 405,
      headers,
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
      status: 500,
      headers,
    });
  }

  // Initial game state
  const gameState = {
    board: [null, null, null, null, null, null, null, null, null],
    isPlayerTurn: true,
    status: 'playing', // playing | playerWin | computerWin | draw
    drawAttempts: 0,
    createdAt: Date.now(),
  };

  try {
    const gameToken = await signToken(gameState, secret);

    return new Response(JSON.stringify({
      gameToken,
      board: gameState.board,
      status: gameState.status,
      isPlayerTurn: gameState.isPlayerTurn,
    }), {
      status: 200,
      headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create game' }), {
      status: 500,
      headers,
    });
  }
}
