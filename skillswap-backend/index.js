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

app.get('/', (req, res) => res.send('SkillBridge API is running!'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 8080;

async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255),
      avatar VARCHAR(500),
      bio TEXT,
      location VARCHAR(150),
      rating DECIMAL(3,2) DEFAULT 0.00,
      total_sessions INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_name VARCHAR(100) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('offer', 'want')),
      level VARCHAR(20) DEFAULT 'Intermediate' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      user1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
      compatibility_score INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user1_id, user2_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      participant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(200) NOT NULL,
      date TIMESTAMP NOT NULL,
      duration INT NOT NULL DEFAULT 60,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      from_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (from_user_id, to_user_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS collab_posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      skills_have TEXT NOT NULL,
      skills_needed TEXT NOT NULL,
      project_type VARCHAR(100),
      status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS collab_requests (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
      requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (post_id, requester_id)
    )
  `);

  console.log('✅ Database tables ready');
}

db.query('SELECT 1')
  .then(async () => {
    console.log('✅ PostgreSQL connected');
    await initDB();
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });
