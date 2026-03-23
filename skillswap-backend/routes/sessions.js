const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/sessions
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT s.*,
        u.id as pu_id, u.name as pu_name, u.email as pu_email,
        u.avatar as pu_avatar, u.rating as pu_rating, u.total_sessions as pu_total_sessions
       FROM sessions s
       JOIN users u ON u.id = IF(s.requester_id = ?, s.participant_id, s.requester_id)
       WHERE s.requester_id = ? OR s.participant_id = ?
       ORDER BY s.date DESC`,
      [req.user.id, req.user.id, req.user.id]
    );

    const sessions = rows.map((r) => ({
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
    }));

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/sessions
router.post('/', auth, async (req, res) => {
  const { matchId, date, topic, duration } = req.body;
  if (!matchId || !date || !topic)
    return res.status(400).json({ message: 'matchId, date and topic are required' });

  try {
    // Find the other user in the match
    const [matchRows] = await db.query('SELECT * FROM matches WHERE id = ?', [matchId]);
    if (matchRows.length === 0)
      return res.status(404).json({ message: 'Match not found' });

    const match = matchRows[0];
    const participantId = match.user1_id === req.user.id ? match.user2_id : match.user1_id;

    const [result] = await db.query(
      'INSERT INTO sessions (match_id, requester_id, participant_id, topic, date, duration) VALUES (?, ?, ?, ?, ?, ?)',
      [matchId, req.user.id, participantId, topic, date, duration || 60]
    );

    const [rows] = await db.query(
      `SELECT s.*, u.id as pu_id, u.name as pu_name, u.email as pu_email, u.avatar as pu_avatar
       FROM sessions s JOIN users u ON u.id = s.participant_id
       WHERE s.id = ?`,
      [result.insertId]
    );
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      matchId: r.match_id,
      date: r.date,
      status: r.status,
      topic: r.topic,
      duration: r.duration,
      participant: { id: r.pu_id, name: r.pu_name, email: r.pu_email, avatar: r.pu_avatar },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/sessions/:id
router.patch('/:id', auth, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'accepted', 'rejected', 'completed'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  try {
    const [result] = await db.query(
      'UPDATE sessions SET status = ? WHERE id = ? AND (requester_id = ? OR participant_id = ?)',
      [status, req.params.id, req.user.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Session not found' });

    // If completed, increment total_sessions for both users
    if (status === 'completed') {
      const [sessionRows] = await db.query('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
      if (sessionRows.length > 0) {
        const s = sessionRows[0];
        await db.query(
          'UPDATE users SET total_sessions = total_sessions + 1 WHERE id IN (?, ?)',
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
