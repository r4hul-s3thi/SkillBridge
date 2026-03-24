const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

function formatPost(r, user) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    skillsHave: JSON.parse(r.skills_have || '[]'),
    skillsNeeded: JSON.parse(r.skills_needed || '[]'),
    projectType: r.project_type,
    status: r.status,
    createdAt: r.created_at,
    author: {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      location: user.location,
      rating: parseFloat(user.rating) || 0,
    },
  };
}

// GET /api/collabs — all open posts
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.id as u_id, u.name as u_name, u.avatar as u_avatar,
        u.location as u_location, u.rating as u_rating
       FROM collab_posts p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.created_at DESC`
    );
    res.json(rows.map((r) => formatPost(r, { id: r.u_id, name: r.u_name, avatar: r.u_avatar, location: r.u_location, rating: r.u_rating })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/collabs/mine — current user's posts
router.get('/mine', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.id as u_id, u.name as u_name, u.avatar as u_avatar,
        u.location as u_location, u.rating as u_rating
       FROM collab_posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC`,
      [req.user.id]
    );
    res.json(rows.map((r) => formatPost(r, { id: r.u_id, name: r.u_name, avatar: r.u_avatar, location: r.u_location, rating: r.u_rating })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/collabs — create post
router.post('/', auth, async (req, res) => {
  const { title, description, skillsHave, skillsNeeded, projectType } = req.body;
  if (!title || !description || !skillsHave?.length || !skillsNeeded?.length)
    return res.status(400).json({ message: 'title, description, skillsHave and skillsNeeded are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO collab_posts (user_id, title, description, skills_have, skills_needed, project_type) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, JSON.stringify(skillsHave), JSON.stringify(skillsNeeded), projectType || null]
    );
    const [rows] = await db.query(
      `SELECT p.*, u.id as u_id, u.name as u_name, u.avatar as u_avatar,
        u.location as u_location, u.rating as u_rating
       FROM collab_posts p JOIN users u ON u.id = p.user_id WHERE p.id = ?`,
      [result.insertId]
    );
    const r = rows[0];
    res.status(201).json(formatPost(r, { id: r.u_id, name: r.u_name, avatar: r.u_avatar, location: r.u_location, rating: r.u_rating }));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/collabs/:id/status — open/close post
router.patch('/:id/status', auth, async (req, res) => {
  const { status } = req.body;
  if (!['open', 'closed'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  try {
    await db.query('UPDATE collab_posts SET status = ? WHERE id = ? AND user_id = ?', [status, req.params.id, req.user.id]);
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/collabs/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM collab_posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/collabs/:id/requests — requests on a post (owner only)
router.get('/:id/requests', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cr.*, u.name as u_name, u.avatar as u_avatar, u.location as u_location, u.rating as u_rating
       FROM collab_requests cr JOIN users u ON u.id = cr.requester_id
       WHERE cr.post_id = ?
       ORDER BY cr.created_at DESC`,
      [req.params.id]
    );
    res.json(rows.map((r) => ({
      id: r.id,
      postId: r.post_id,
      message: r.message,
      status: r.status,
      createdAt: r.created_at,
      requester: { id: r.requester_id, name: r.u_name, avatar: r.u_avatar, location: r.u_location, rating: parseFloat(r.u_rating) || 0 },
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/collabs/:id/requests — send request to join
router.post('/:id/requests', auth, async (req, res) => {
  const { message } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO collab_requests (post_id, requester_id, message) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, message || null]
    );
    res.status(201).json({ id: result.insertId, postId: parseInt(req.params.id), message, status: 'pending' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ message: 'Already requested' });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/collabs/requests/:id — accept/reject request
router.patch('/requests/:id', auth, async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected'].includes(status))
    return res.status(400).json({ message: 'Invalid status' });
  try {
    await db.query(
      `UPDATE collab_requests cr
       JOIN collab_posts p ON p.id = cr.post_id
       SET cr.status = ?
       WHERE cr.id = ? AND p.user_id = ?`,
      [status, req.params.id, req.user.id]
    );
    res.json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
