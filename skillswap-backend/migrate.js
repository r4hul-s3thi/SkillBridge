require('dotenv').config();
const db = require('./db');

async function migrate() {
  console.log('Running collab migration...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS collab_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT NOT NULL,
        skills_have TEXT NOT NULL,
        skills_needed TEXT NOT NULL,
        project_type VARCHAR(100),
        status ENUM('open', 'closed') DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ collab_posts table ready');

    await db.query(`
      CREATE TABLE IF NOT EXISTS collab_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        requester_id INT NOT NULL,
        message TEXT,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES collab_posts(id) ON DELETE CASCADE,
        FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_request (post_id, requester_id)
      )
    `);
    console.log('✅ collab_requests table ready');
    console.log('\n✅ Migration complete! Restart your backend server.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
