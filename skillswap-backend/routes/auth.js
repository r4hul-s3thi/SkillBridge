const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const auth = require('../middleware/auth');
const generateMatchesForUser = require('../utils/generateMatches');

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function formatUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    bio: row.bio,
    location: row.location,
    rating: parseFloat(row.rating) || 0,
    totalSessions: row.total_sessions || 0,
  };
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashed]
    );
    const user = formatUser(result.rows[0]);
    const token = signToken(user);
    generateMatchesForUser(user.id).catch(() => {});
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ message: 'Invalid email or password' });

    const formatted = formatUser(user);
    const token = signToken(formatted);
    res.json({ user: formatted, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/oauth', async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: 'Name and email are required' });

  try {
    const existing = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;
    if (existing.rows.length > 0) {
      // Never overwrite existing user data — just return current DB state
      user = formatUser(existing.rows[0]);
    } else {
      const created = await db.query(
        'INSERT INTO users (name, email, avatar) VALUES ($1, $2, $3) RETURNING *',
        [name, email, avatar || null]
      );
      user = formatUser(created.rows[0]);
      generateMatchesForUser(user.id).catch(() => {});
    }
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/profile', auth, async (req, res) => {
  const { name, bio, location, avatar } = req.body;
  try {
    // Allow explicitly clearing avatar by passing empty string
    const avatarValue = avatar === '' ? null : (avatar || undefined);
    const result = await db.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        bio = COALESCE($2, bio),
        location = COALESCE($3, location),
        avatar = CASE WHEN $4::text IS NOT NULL THEN $4::text ELSE avatar END
       WHERE id = $5 RETURNING *`,
      [name || null, bio || null, location || null, avatarValue ?? null, req.user.id]
    );
    res.json(formatUser(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
