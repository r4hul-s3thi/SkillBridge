require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

const allowedOrigins = [
  /^http:\/\/localhost(:\d+)?$/,
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/collabs', require('./routes/collabs'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

app.get('/', (req, res) => res.send('SkillSwap API is running. Frontend: http://localhost:5173'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 8080;

db.query('SELECT 1')
  .then(() => {
    console.log('✅ PostgreSQL connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });
