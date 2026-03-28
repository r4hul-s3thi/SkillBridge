const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/leaderboard
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.avatar, u.location, u.rating, u.total_sessions,
        COUNT(DISTINCT s.id) as skill_count
       FROM users u
       LEFT JOIN skills s ON s.user_id = u.id
       GROUP BY u.id
       ORDER BY (u.rating * 20 + u.total_sessions) DESC
       LIMIT 20`
    );
    res.json(rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      location: r.location,
      rating: parseFloat(r.rating) || 0,
      totalSessions: r.total_sessions || 0,
      skillCount: r.skill_count || 0,
      score: Math.round((parseFloat(r.rating) || 0) * 20 + (r.total_sessions || 0)),
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
