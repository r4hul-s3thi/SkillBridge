const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT m.*,
        u.id as mu_id, u.name as mu_name, u.email as mu_email,
        u.avatar as mu_avatar, u.bio as mu_bio, u.location as mu_location,
        u.rating as mu_rating, u.total_sessions as mu_total_sessions
       FROM matches m
       JOIN users u ON u.id = CASE WHEN m.user1_id = $1 THEN m.user2_id ELSE m.user1_id END
       WHERE m.user1_id = $2 OR m.user2_id = $3
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.id, req.user.id]
    );

    const matches = await Promise.all(
      result.rows.map(async (r) => {
        const mySkills = await db.query('SELECT skill_name, type FROM skills WHERE user_id = $1', [req.user.id]);
        const theirSkills = await db.query('SELECT skill_name, type FROM skills WHERE user_id = $1', [r.mu_id]);

        const myOffer = mySkills.rows.filter((s) => s.type === 'offer').map((s) => s.skill_name);
        const myWant = mySkills.rows.filter((s) => s.type === 'want').map((s) => s.skill_name);
        const theirOffer = theirSkills.rows.filter((s) => s.type === 'offer').map((s) => s.skill_name);
        const theirWant = theirSkills.rows.filter((s) => s.type === 'want').map((s) => s.skill_name);

        return {
          id: r.id,
          user1Id: r.user1_id,
          user2Id: r.user2_id,
          status: r.status,
          compatibilityScore: r.compatibility_score,
          matchedUser: {
            id: r.mu_id,
            name: r.mu_name,
            email: r.mu_email,
            avatar: r.mu_avatar,
            bio: r.mu_bio,
            location: r.mu_location,
            rating: parseFloat(r.mu_rating) || 0,
            totalSessions: r.mu_total_sessions || 0,
          },
          matchedSkills: {
            offer: myOffer.filter((s) => theirWant.includes(s)),
            want: theirOffer.filter((s) => myWant.includes(s)),
          },
        };
      })
    );

    res.json(matches);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'active'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  try {
    const result = await db.query(
      'UPDATE matches SET status = $1 WHERE id = $2 AND (user1_id = $3 OR user2_id = $4)',
      [status, req.params.id, req.user.id, req.user.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Match not found' });
    res.json({ message: 'Match updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
