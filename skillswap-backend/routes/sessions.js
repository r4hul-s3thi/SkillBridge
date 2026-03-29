const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*,
        u.id as pu_id, u.name as pu_name, u.email as pu_email,
        u.avatar as pu_avatar, u.rating as pu_rating, u.total_sessions as pu_total_sessions
       FROM sessions s
       JOIN users u ON u.id = CASE WHEN s.requester_id = $1 THEN s.participant_id ELSE s.requester_id END
       WHERE s.requester_id = $2 OR s.participant_id = $3
       ORDER BY s.date DESC`,
      [req.user.id, req.user.id, req.user.id]
    );

    res.json(result.rows.map((r) => ({
      id: r.id,
      matchId: r.match_id,
      date: r.date,
      status: r.status,
      topic: r.topic,
      duration: r.duration,
      participant: {
        id: r.pu_id,
        name: r.pu_name,
        email: r.pu_email,
        avatar: r.pu_avatar,
        rating: parseFloat(r.pu_rating) || 0,
        totalSessions: r.pu_total_sessions || 0,
      },
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { matchId, date, topic, duration } = req.body;
  if (!matchId || !date || !topic)
    return res.status(400).json({ message: 'matchId, date and topic are required' });

  try {
    const matchResult = await db.query('SELECT * FROM matches WHERE id = $1', [matchId]);
    if (matchResult.rows.length === 0)
      return res.status(404).json({ message: 'Match not found' });

    const match = matchResult.rows[0];
    const participantId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;

    const result = await db.query(
      `INSERT INTO sessions (match_id, requester_id, participant_id, topic, date, duration)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [matchId, req.user.id, participantId, topic, date, duration || 60]
    );

    const s = result.rows[0];
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [participantId]);
    const u = userResult.rows[0];
    res.status(201).json({
      id: s.id,
      matchId: s.match_id,
      date: s.date,
      status: s.status,
      topic: s.topic,
      duration: s.duration,
      participant: { id: u.id, name: u.name, email: u.email, avatar: u.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  try {
    const result = await db.query(
      'UPDATE sessions SET status = $1 WHERE id = $2 AND (requester_id = $3 OR participant_id = $4)',
      [status, req.params.id, req.user.id, req.user.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Session not found' });

    if (status === 'completed') {
      const sessionResult = await db.query('SELECT * FROM sessions WHERE id = $1', [req.params.id]);
      if (sessionResult.rows.length > 0) {
        const s = sessionResult.rows[0];
        await db.query(
          'UPDATE users SET total_sessions = total_sessions + 1 WHERE id = $1 OR id = $2',
          [s.requester_id, s.participant_id]
        );
      }
    }

    res.json({ message: 'Session updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
