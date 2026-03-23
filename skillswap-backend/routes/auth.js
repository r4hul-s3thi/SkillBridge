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

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const user = formatUser(rows[0]);
    const token = signToken(user);
    generateMatchesForUser(user.id).catch(() => {});
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
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

// POST /api/auth/oauth  (Google / GitHub — frontend sends profile after OAuth redirect)
router.post('/oauth', async (req, res) => {
  const { name, email, avatar } = req.body;
  if (!name || !email)
    return res.status(400).json({ message: 'Name and email are required' });

  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;
    if (rows.length > 0) {
      // existing user — update avatar if changed
      await db.query('UPDATE users SET avatar = COALESCE(?, avatar) WHERE id = ?', [avatar, rows[0].id]);
      const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [rows[0].id]);
      user = formatUser(updated[0]);
    } else {
      const [result] = await db.query(
        'INSERT INTO users (name, email, avatar) VALUES (?, ?, ?)',
        [name, email, avatar || null]
      );
      const [created] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
      user = formatUser(created[0]);
      generateMatchesForUser(user.id).catch(() => {});
    }
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/auth/profile  — update name, bio, location, avatar
router.patch('/profile', auth, async (req, res) => {
  const { name, bio, location, avatar } = req.body;
  try {
    await db.query(
      'UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), location = COALESCE(?, location), avatar = COALESCE(?, avatar) WHERE id = ?',
      [name, bio, location, avatar, req.user.id]
    );
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    res.json(formatUser(rows[0]));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
