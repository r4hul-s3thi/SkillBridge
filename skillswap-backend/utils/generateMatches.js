const db = require('../db');

async function generateMatchesForUser(userId) {
  const [others] = await db.query('SELECT id FROM users WHERE id != ?', [userId]);

  for (const other of others) {
    const [exists] = await db.query(
      'SELECT id FROM matches WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)',
      [userId, other.id, other.id, userId]
    );

    const [mySkills]    = await db.query('SELECT skill_name, type FROM skills WHERE user_id = ?', [userId]);
    const [theirSkills] = await db.query('SELECT skill_name, type FROM skills WHERE user_id = ?', [other.id]);

    const myOffer    = mySkills.filter(s => s.type === 'offer').map(s => s.skill_name);
    const myWant     = mySkills.filter(s => s.type === 'want').map(s => s.skill_name);
    const theirOffer = theirSkills.filter(s => s.type === 'offer').map(s => s.skill_name);
    const theirWant  = theirSkills.filter(s => s.type === 'want').map(s => s.skill_name);

    const overlap = myOffer.filter(s => theirWant.includes(s)).length +
                    myWant.filter(s => theirOffer.includes(s)).length;
    const total   = new Set([...myOffer, ...myWant, ...theirOffer, ...theirWant]).size || 1;
    const score   = Math.min(99, Math.round(50 + (overlap / total) * 50));

    if (exists.length > 0) {
      await db.query(
        'UPDATE matches SET compatibility_score = ? WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)',
        [score, userId, other.id, other.id, userId]
      );
    } else {
      await db.query(
        'INSERT INTO matches (user1_id, user2_id, status, compatibility_score) VALUES (?, ?, ?, ?)',
        [userId, other.id, 'pending', score]
      );
    }
  }
}

module.exports = generateMatchesForUser;
