const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const activeClients = new Set();

function initWebSocketServer(server) {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const token = req.headers['sec-websocket-protocol'];

    try {
      if (!token) throw new Error();
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      ws.user = payload;
      activeClients.add(ws);
    } catch (error) {
      ws.close(1008, 'Unauthorized');
      return;
    }

    ws.on('close', () => activeClients.delete(ws));
    ws.on('error', () => activeClients.delete(ws));
  });
}

function broadcastTickerUpdate(update) {
  const message = JSON.stringify({
    type: 'TICKER_UPDATE',
    payload: {
      ticker: update.ticker,
      price: update.price
    }
  });

  for (const client of activeClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

module.exports = { initWebSocketServer, broadcastTickerUpdate };