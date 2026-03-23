const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

// GET /api/messages/conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    // Get all users the current user has exchanged messages with
    const [rows] = await db.query(
      `SELECT 
        u.id, u.name, u.email, u.avatar, u.location,
        m.message as last_message,
        m.created_at as last_message_at,
        (SELECT COUNT(*) FROM messages 
         WHERE sender_id = u.id AND receiver_id = ? AND created_at > COALESCE(
           (SELECT MAX(created_at) FROM messages WHERE sender_id = ? AND receiver_id = u.id), '1970-01-01'
         )) as unread_count
       FROM users u
       JOIN messages m ON m.id = (
         SELECT id FROM messages
         WHERE (sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id)
         ORDER BY created_at DESC LIMIT 1
       )
       WHERE u.id != ?
       ORDER BY m.created_at DESC`,
      [req.user.id, req.user.id, req.user.id, req.user.id, req.user.id]
    );

    const conversations = rows.map((r, i) => ({
      id: i + 1,
      participant: {
        id: r.id,
        name: r.name,
        email: r.email,
        avatar: r.avatar,
        location: r.location,
        rating: 0,
        totalSessions: 0,
      },
      lastMessage: r.last_message,
      lastMessageAt: r.last_message_at,
      unreadCount: r.unread_count || 0,
    }));

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/messages/:userId  — thread between current user and userId
router.get('/:userId', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [req.user.id, req.params.userId, req.params.userId, req.user.id]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      message: r.message,
      createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/messages
router.post('/', auth, async (req, res) => {
  const { receiverId, message } = req.body;
  if (!receiverId || !message)
    return res.status(400).json({ message: 'receiverId and message are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
      [req.user.id, receiverId, message]
    );
    const [rows] = await db.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    const r = rows[0];
    res.status(201).json({
      id: r.id,
      senderId: r.sender_id,
      receiverId: r.receiver_id,
      message: r.message,
      createdAt: r.created_at,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
