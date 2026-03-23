const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/ratings
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*,
        u.id as fu_id, u.name as fu_name, u.email as fu_email, u.avatar as fu_avatar,
        u.rating as fu_rating, u.total_sessions as fu_total_sessions
       FROM ratings r
       JOIN users u ON u.id = r.from_user_id
       WHERE r.to_user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    const ratings = rows.map((r) => ({
      id: r.id,
      fromUser: {
        id: r.fu_id,
        name: r.fu_name,
        email: r.fu_email,
        avatar: r.fu_avatar,
        rating: parseFloat(r.fu_rating) || 0,
        totalSessions: r.fu_total_sessions || 0,
      },
      toUserId: r.to_user_id,
      rating: r.rating,
      feedback: r.feedback,
      createdAt: r.created_at,
    }));

    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/ratings
router.post('/', auth, async (req, res) => {
  const { toUserId, rating, feedback } = req.body;
  if (!toUserId || !rating)
    return res.status(400).json({ message: 'toUserId and rating are required' });
  if (rating < 1 || rating > 5)
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });

  try {
    const [result] = await db.query(
      'INSERT INTO ratings (from_user_id, to_user_id, rating, feedback) VALUES (?, ?, ?, ?)',
      [req.user.id, toUserId, rating, feedback || null]
    );

    // Recalculate the recipient's average rating
    const [avgRows] = await db.query(
      'SELECT AVG(rating) as avg_rating FROM ratings WHERE to_user_id = ?',
      [toUserId]
    );
    const newAvg = parseFloat(avgRows[0].avg_rating).toFixed(2);
    await db.query('UPDATE users SET rating = ? WHERE id = ?', [newAvg, toUserId]);

    const [fromUser] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const u = fromUser[0];
    res.status(201).json({
      id: result.insertId,
      fromUser: {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        rating: parseFloat(u.rating) || 0,
        totalSessions: u.total_sessions || 0,
      },
      toUserId,
      rating,
      feedback: feedback || '',
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'You have already rated this user' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
