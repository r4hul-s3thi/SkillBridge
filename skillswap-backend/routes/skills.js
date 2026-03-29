const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const generateMatchesForUser = require('../utils/generateMatches');

router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM skills WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      skillName: r.skill_name,
      type: r.type,
      level: r.level,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { skillName, type, level } = req.body;
  if (!skillName || !type)
    return res.status(400).json({ message: 'skillName and type are required' });

  try {
    const result = await db.query(
      'INSERT INTO skills (user_id, skill_name, type, level) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, skillName, type, level || 'Intermediate']
    );
    const r = result.rows[0];
    res.status(201).json({ id: r.id, userId: r.user_id, skillName: r.skill_name, type: r.type, level: r.level });
    generateMatchesForUser(req.user.id).catch(() => {});
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM skills WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Skill not found' });
    res.json({ message: 'Skill deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
