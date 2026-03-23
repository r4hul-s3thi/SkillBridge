const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const generateMatchesForUser = require('../utils/generateMatches');

// GET /api/skills
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const skills = rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      skillName: r.skill_name,
      type: r.type,
      level: r.level,
    }));
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/skills
router.post('/', auth, async (req, res) => {
  const { skillName, type, level } = req.body;
  if (!skillName || !type)
    return res.status(400).json({ message: 'skillName and type are required' });

  try {
    const [result] = await db.query(
      'INSERT INTO skills (user_id, skill_name, type, level) VALUES (?, ?, ?, ?)',
      [req.user.id, skillName, type, level || 'Intermediate']
    );
    res.status(201).json({
      id: result.insertId,
      userId: req.user.id,
      skillName,
      type,
      level: level || 'Intermediate',
    });
    generateMatchesForUser(req.user.id).catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/skills/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM skills WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
