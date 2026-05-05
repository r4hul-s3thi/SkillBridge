require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.query('TRUNCATE TABLE ratings, messages, sessions, matches, skills, users RESTART IDENTITY CASCADE');
  console.log('🗑️  Cleared existing data');

  const password = await bcrypt.hash('password123', 10);

  const users = [
    [1, 'Aarav Patel',  'aarav.patel@example.com',  password, 'https://randomuser.me/api/portraits/men/32.jpg',  'Full-stack developer passionate about teaching and learning.', 'Bengaluru, India', 4.8, 24],
    [2, 'Priya Sharma', 'priya.sharma@example.com', password, 'https://randomuser.me/api/portraits/women/44.jpg', 'UI/UX Designer with 5 years of experience. Figma expert.',    'Mumbai, India',    4.9, 31],
    [3, 'Rahul Singh',  'rahul.singh@example.com',  password, 'https://randomuser.me/api/portraits/men/46.jpg',  'Backend engineer specializing in Java and Spring Boot.',       'Delhi, India',     4.7, 18],
    [4, 'Ananya Bose',  'ananya.bose@example.com',  password, 'https://randomuser.me/api/portraits/women/65.jpg','Data Scientist. Python, ML, TensorFlow expert.',              'Kolkata, India',   4.6, 22],
    [5, 'Vikram Desai', 'vikram.desai@example.com', password, 'https://randomuser.me/api/portraits/men/55.jpg',  'DevOps engineer. Docker, Kubernetes, AWS.',                   'Pune, India',      4.5, 15],
    [6, 'Neha Reddy',   'neha.reddy@example.com',   password, 'https://randomuser.me/api/portraits/women/26.jpg','Frontend engineer with React and Vue expertise.',             'Hyderabad, India', 4.8, 20],
    [7, 'Arjun Mehta',  'arjun.mehta@example.com',  password, 'https://randomuser.me/api/portraits/men/77.jpg',  'Cloud architect with AWS and Azure skills.',                  'Chennai, India',   4.7, 17],
  ];

  for (const u of users) {
    await db.query(
      'INSERT INTO users (id, name, email, password, avatar, bio, location, rating, total_sessions) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      u
    );
  }
  console.log('👤 Users seeded');

  const skills = [
    [1,  'React',             'offer', 'Expert',       1],
    [2,  'JavaScript',        'offer', 'Expert',       1],
    [3,  'Node.js',           'offer', 'Advanced',     1],
    [4,  'Python',            'want',  'Beginner',     1],
    [5,  'Machine Learning',  'want',  'Beginner',     1],
    [6,  'UI/UX Design',      'want',  'Intermediate', 1],
    [7,  'Figma',             'offer', 'Expert',       2],
    [8,  'UI/UX Design',      'offer', 'Expert',       2],
    [9,  'React',             'want',  'Intermediate', 2],
    [10, 'JavaScript',        'want',  'Beginner',     2],
    [11, 'Java',              'offer', 'Expert',       3],
    [12, 'Spring Boot',       'offer', 'Expert',       3],
    [13, 'Node.js',           'want',  'Intermediate', 3],
    [14, 'Python',            'offer', 'Expert',       4],
    [15, 'Machine Learning',  'offer', 'Expert',       4],
    [16, 'TensorFlow',        'offer', 'Advanced',     4],
    [17, 'JavaScript',        'want',  'Beginner',     4],
    [18, 'Docker',            'offer', 'Expert',       5],
    [19, 'Kubernetes',        'offer', 'Expert',       5],
    [20, 'AWS',               'offer', 'Advanced',     5],
    [21, 'React',             'want',  'Beginner',     5],
    [22, 'Vue',               'offer', 'Expert',       6],
    [23, 'TypeScript',        'offer', 'Advanced',     6],
    [24, 'JavaScript',        'want',  'Intermediate', 6],
    [25, 'AWS',               'offer', 'Expert',       7],
    [26, 'Cloud Architecture','offer', 'Expert',       7],
    [27, 'React',             'want',  'Intermediate', 7],
  ];

  for (const s of skills) {
    await db.query(
      'INSERT INTO skills (id, skill_name, type, level, user_id) VALUES ($1,$2,$3,$4,$5)',
      s
    );
  }
  console.log('🎯 Skills seeded');

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
      'INSERT INTO matches (id, user1_id, user2_id, status, compatibility_score) VALUES ($1,$2,$3,$4,$5)',
      m
    );
  }
  console.log('🤝 Matches seeded');

  const sessions = [
    [1, 1, 1, 2, 'React Hooks Deep Dive',       '2026-03-24 15:00:00', 60, 'accepted'],
    [2, 2, 1, 3, 'Spring Boot REST APIs',        '2026-03-25 10:00:00', 90, 'pending'],
    [3, 3, 1, 4, 'Python for Data Science',      '2026-03-26 14:00:00', 60, 'pending'],
    [4, 1, 1, 2, 'Figma Basics',                 '2026-03-20 15:00:00', 45, 'completed'],
    [5, 2, 1, 3, 'JavaScript Advanced Patterns', '2026-03-18 11:00:00', 60, 'completed'],
    [6, 3, 1, 4, 'Data Science with Python',     '2026-03-27 11:00:00', 60, 'pending'],
    [7, 4, 1, 5, 'Kubernetes for Beginners',     '2026-03-28 16:00:00', 75, 'pending'],
  ];

  for (const s of sessions) {
    await db.query(
      'INSERT INTO sessions (id, match_id, requester_id, participant_id, topic, date, duration, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      s
    );
  }
  console.log('📅 Sessions seeded');

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
      'INSERT INTO messages (id, sender_id, receiver_id, message) VALUES ($1,$2,$3,$4)',
      m
    );
  }
  console.log('💬 Messages seeded');

  const ratings = [
    [1, 2, 1, 5, 'Aarav is an amazing React teacher! Very patient and knowledgeable.'],
    [2, 3, 1, 4, 'Great session on JavaScript. Learned a lot about closures and promises.'],
    [3, 4, 1, 5, 'Excellent explanation of async/await. Highly recommend!'],
  ];

  for (const r of ratings) {
    await db.query(
      'INSERT INTO ratings (id, from_user_id, to_user_id, rating, feedback) VALUES ($1,$2,$3,$4,$5)',
      r
    );
  }
  console.log('⭐ Ratings seeded');

  // Reset sequences so future inserts don't conflict
  await db.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
  await db.query(`SELECT setval('skills_id_seq', (SELECT MAX(id) FROM skills))`);
  await db.query(`SELECT setval('matches_id_seq', (SELECT MAX(id) FROM matches))`);
  await db.query(`SELECT setval('sessions_id_seq', (SELECT MAX(id) FROM sessions))`);
  await db.query(`SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages))`);
  await db.query(`SELECT setval('ratings_id_seq', (SELECT MAX(id) FROM ratings))`);

  console.log('\n✅ Database seeded successfully!');
  console.log('📧 Login with: aarav.patel@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
