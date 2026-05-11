const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { initWebSocketServer } = require('./wsServer');
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stock');
const tradeRoutes = require('./routes/trade');

dotenv.config();

connectDB().catch((error) => {
  process.exit(1);
});

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowed = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    if (!origin || allowed.some(o => origin.startsWith(o)) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trade', tradeRoutes);

const server = http.createServer(app);
initWebSocketServer(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});