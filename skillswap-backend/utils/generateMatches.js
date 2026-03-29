const db = require('../db');

async function generateMatchesForUser(userId) {
  const others = await db.query('SELECT id FROM users WHERE id != $1', [userId]);

  for (const other of others.rows) {
    const exists = await db.query(
      'SELECT id FROM matches WHERE (user1_id=$1 AND user2_id=$2) OR (user1_id=$3 AND user2_id=$4)',
      [userId, other.id, other.id, userId]
    );

    const mySkills = await db.query('SELECT skill_name, type FROM skills WHERE user_id = $1', [userId]);
    const theirSkills = await db.query('SELECT skill_name, type FROM skills WHERE user_id = $1', [other.id]);

    const myOffer = mySkills.rows.filter((s) => s.type === 'offer').map((s) => s.skill_name);
    const myWant = mySkills.rows.filter((s) => s.type === 'want').map((s) => s.skill_name);
    const theirOffer = theirSkills.rows.filter((s) => s.type === 'offer').map((s) => s.skill_name);
    const theirWant = theirSkills.rows.filter((s) => s.type === 'want').map((s) => s.skill_name);

    const overlap = myOffer.filter((s) => theirWant.includes(s)).length +
                    myWant.filter((s) => theirOffer.includes(s)).length;
    const total = new Set([...myOffer, ...myWant, ...theirOffer, ...theirWant]).size || 1;
    const score = Math.min(99, Math.round(50 + (overlap / total) * 50));

    if (exists.rows.length > 0) {
      await db.query(
        'UPDATE matches SET compatibility_score = $1 WHERE (user1_id=$2 AND user2_id=$3) OR (user1_id=$4 AND user2_id=$5)',
        [score, userId, other.id, other.id, userId]
      );
    } else {
      await db.query(
        'INSERT INTO matches (user1_id, user2_id, status, compatibility_score) VALUES ($1, $2, $3, $4)',
        [userId, other.id, 'pending', score]
      );
    }
  }
}

module.exports = generateMatchesForUser;
