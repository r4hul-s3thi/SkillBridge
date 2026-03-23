require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data in correct order
  await db.query('SET FOREIGN_KEY_CHECKS = 0');
  await db.query('TRUNCATE TABLE ratings');
  await db.query('TRUNCATE TABLE messages');
  await db.query('TRUNCATE TABLE sessions');
  await db.query('TRUNCATE TABLE matches');
  await db.query('TRUNCATE TABLE skills');
  await db.query('TRUNCATE TABLE users');
  await db.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('🗑️  Cleared existing data');

  const password = await bcrypt.hash('password123', 10);

  // Insert users
  const users = [
    [1, 'Aarav Patel',   'aarav.patel@example.com',   password, 'https://i.pravatar.cc/150?u=aarav-patel',   'Full-stack developer passionate about teaching and learning.',        'Bengaluru, India', 4.8, 24],
    [2, 'Priya Sharma',  'priya.sharma@example.com',  password, 'https://i.pravatar.cc/150?u=priya-sharma',  'UI/UX Designer with 5 years of experience. Figma expert.',            'Mumbai, India',    4.9, 31],
    [3, 'Rahul Singh',   'rahul.singh@example.com',   password, 'https://i.pravatar.cc/150?u=rahul-singh',   'Backend engineer specializing in Java and Spring Boot.',              'Delhi, India',     4.7, 18],
    [4, 'Ananya Bose',   'ananya.bose@example.com',   password, 'https://i.pravatar.cc/150?u=ananya-bose',   'Data Scientist. Python, ML, TensorFlow expert.',                      'Kolkata, India',   4.6, 22],
    [5, 'Vikram Desai',  'vikram.desai@example.com',  password, 'https://i.pravatar.cc/150?u=vikram-desai',  'DevOps engineer. Docker, Kubernetes, AWS.',                           'Pune, India',      4.5, 15],
    [6, 'Neha Reddy',    'neha.reddy@example.com',    password, 'https://i.pravatar.cc/150?u=neha-reddy',    'Frontend engineer with React and Vue expertise.',                     'Hyderabad, India', 4.8, 20],
    [7, 'Arjun Mehta',   'arjun.mehta@example.com',   password, 'https://i.pravatar.cc/150?u=arjun-mehta',   'Cloud architect with AWS and Azure skills.',                          'Chennai, India',   4.7, 17],
  ];

  for (const u of users) {
    await db.query(
      'INSERT INTO users (id, name, email, password, avatar, bio, location, rating, total_sessions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      u
    );
  }
  console.log('👤 Users seeded');

  // Insert skills
  const skills = [
    // Aarav (id=1)
    [1, 1, 'React',          'offer', 'Expert'],
    [2, 1, 'JavaScript',     'offer', 'Expert'],
    [3, 1, 'Node.js',        'offer', 'Advanced'],
    [4, 1, 'Python',         'want',  'Beginner'],
    [5, 1, 'Machine Learning','want', 'Beginner'],
    [6, 1, 'UI/UX Design',   'want',  'Intermediate'],
    // Priya (id=2)
    [7,  2, 'Figma',         'offer', 'Expert'],
    [8,  2, 'UI/UX Design',  'offer', 'Expert'],
    [9,  2, 'React',         'want',  'Intermediate'],
    [10, 2, 'JavaScript',    'want',  'Beginner'],
    // Rahul (id=3)
    [11, 3, 'Java',          'offer', 'Expert'],
    [12, 3, 'Spring Boot',   'offer', 'Expert'],
    [13, 3, 'Node.js',       'want',  'Intermediate'],
    // Ananya (id=4)
    [14, 4, 'Python',        'offer', 'Expert'],
    [15, 4, 'Machine Learning','offer','Expert'],
    [16, 4, 'TensorFlow',    'offer', 'Advanced'],
    [17, 4, 'JavaScript',    'want',  'Beginner'],
    // Vikram (id=5)
    [18, 5, 'Docker',        'offer', 'Expert'],
    [19, 5, 'Kubernetes',    'offer', 'Expert'],
    [20, 5, 'AWS',           'offer', 'Advanced'],
    [21, 5, 'React',         'want',  'Beginner'],
    // Neha (id=6)
    [22, 6, 'Vue',           'offer', 'Expert'],
    [23, 6, 'TypeScript',    'offer', 'Advanced'],
    [24, 6, 'JavaScript',    'want',  'Intermediate'],
    // Arjun (id=7)
    [25, 7, 'AWS',           'offer', 'Expert'],
    [26, 7, 'Cloud Architecture','offer','Expert'],
    [27, 7, 'React',         'want',  'Intermediate'],
  ];

  for (const s of skills) {
    await db.query(
      'INSERT INTO skills (id, user_id, skill_name, type, level) VALUES (?, ?, ?, ?, ?)',
      s
    );
  }
  console.log('🎯 Skills seeded');

  // Insert matches
  const matches = [
    [1, 1, 2, 'active',  94],
    [2, 1, 3, 'active',  87],
    [3, 1, 4, 'active',  88],
    [4, 1, 5, 'active',  85],
    [5, 1, 6, 'pending', 79],
    [6, 1, 7, 'pending', 72],
  ];

  for (const m of matches) {
    await db.query(
      'INSERT INTO matches (id, user1_id, user2_id, status, compatibility_score) VALUES (?, ?, ?, ?, ?)',
      m
    );
  }
  console.log('🤝 Matches seeded');

  // Insert sessions
  const sessions = [
    [1, 1, 1, 2, 'React Hooks Deep Dive',        '2026-03-24 15:00:00', 60,  'accepted'],
    [2, 2, 1, 3, 'Spring Boot REST APIs',         '2026-03-25 10:00:00', 90,  'pending'],
    [3, 3, 1, 4, 'Python for Data Science',       '2026-03-26 14:00:00', 60,  'pending'],
    [4, 1, 1, 2, 'Figma Basics',                  '2026-03-20 15:00:00', 45,  'completed'],
    [5, 2, 1, 3, 'JavaScript Advanced Patterns',  '2026-03-18 11:00:00', 60,  'completed'],
    [6, 3, 1, 4, 'Data Science with Python',      '2026-03-27 11:00:00', 60,  'pending'],
    [7, 4, 1, 5, 'Kubernetes for Beginners',      '2026-03-28 16:00:00', 75,  'pending'],
  ];

  for (const s of sessions) {
    await db.query(
      'INSERT INTO sessions (id, match_id, requester_id, participant_id, topic, date, duration, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      s
    );
  }
  console.log('📅 Sessions seeded');

  // Insert messages
  const messages = [
    [1, 2, 1, "Hey! I saw your React skills. I'd love to learn from you!"],
    [2, 1, 2, "Hi! Sure, I'd be happy to teach React in exchange for UI/UX tips."],
    [3, 2, 1, "That's a great deal! When are you free?"],
    [4, 1, 2, "I'm free tomorrow afternoon. How about 3pm?"],
    [5, 2, 1, "Sure, let's do a React session tomorrow!"],
    [6, 3, 1, "I can help you with Spring Boot basics."],
    [7, 4, 1, "Python for ML sounds great!"],
  ];

  for (const m of messages) {
    await db.query(
      'INSERT INTO messages (id, sender_id, receiver_id, message) VALUES (?, ?, ?, ?)',
      m
    );
  }
  console.log('💬 Messages seeded');

  // Insert ratings
  const ratings = [
    [1, 2, 1, 5, 'Aarav is an amazing React teacher! Very patient and knowledgeable.'],
    [2, 3, 1, 4, 'Great session on JavaScript. Learned a lot about closures and promises.'],
    [3, 4, 1, 5, 'Excellent explanation of async/await. Highly recommend!'],
  ];

  for (const r of ratings) {
    await db.query(
      'INSERT INTO ratings (id, from_user_id, to_user_id, rating, feedback) VALUES (?, ?, ?, ?, ?)',
      r
    );
  }
  console.log('⭐ Ratings seeded');

  console.log('\n✅ Database seeded successfully!');
  console.log('📧 All users have password: password123');
  console.log('📧 Login with: aarav.patel@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
