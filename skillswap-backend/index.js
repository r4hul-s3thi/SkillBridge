require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  /^http:\/\/localhost(:\d+)?$/,
  process.env.FRONTEND_URL,
].filter(Boolean);

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

// Track online users: userId -> socketId
const onlineUsers = new Map();

io.on('connection', (socket) => {
  socket.on('user:online', (userId) => {
    // Always store as number
    const uid = parseInt(userId);
    if (!isNaN(uid)) {
      onlineUsers.set(uid, socket.id);
      io.emit('presence:update', Array.from(onlineUsers.keys()));
    }
  });

  socket.on('message:send', async ({ senderId, receiverId, message }) => {
    const sid = parseInt(senderId);
    const rid = parseInt(receiverId);
    if (!message || isNaN(sid) || isNaN(rid)) return;
    try {
      const res = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
        [sid, rid, message]
      );
      const msg = res.rows[0];
      const payload = {
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        message: msg.message,
        createdAt: msg.created_at,
      };
      // Send to receiver if online
      const receiverSocket = onlineUsers.get(rid);
      if (receiverSocket) io.to(receiverSocket).emit('message:receive', payload);
      // Confirm back to sender
      socket.emit('message:receive', payload);
    } catch (err) {
      socket.emit('message:error', err.message);
    }
  });

  socket.on('typing:start', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(parseInt(receiverId));
    if (receiverSocket) io.to(receiverSocket).emit('typing:start', { senderId: parseInt(senderId) });
  });

  socket.on('typing:stop', ({ senderId, receiverId }) => {
    const receiverSocket = onlineUsers.get(parseInt(receiverId));
    if (receiverSocket) io.to(receiverSocket).emit('typing:stop', { senderId: parseInt(senderId) });
  });

  socket.on('disconnect', () => {
    for (const [userId, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(userId); break; }
    }
    io.emit('presence:update', Array.from(onlineUsers.keys()));
  });
});

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/skills', require('./routes/skills'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/collabs', require('./routes/collabs'));
app.use('/api/leaderboard', require('./routes/leaderboard'));

app.get('/', (req, res) => res.send('SkillBridge API is running!'));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/reseed', async (req, res) => {
  try {
    await db.query('TRUNCATE TABLE collab_requests, collab_posts, ratings, messages, sessions, matches, skills, users RESTART IDENTITY CASCADE');
    await autoSeed();
    res.json({ status: 'seeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/online-users', (req, res) => {
  res.json({ onlineUserIds: Array.from(onlineUsers.keys()) });
});

const PORT = process.env.PORT || 8080;

async function initDB() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password VARCHAR(255),
      avatar VARCHAR(500),
      bio TEXT,
      location VARCHAR(150),
      rating DECIMAL(3,2) DEFAULT 0.00,
      total_sessions INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS skills (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      skill_name VARCHAR(100) NOT NULL,
      type VARCHAR(10) NOT NULL CHECK (type IN ('offer', 'want')),
      level VARCHAR(20) DEFAULT 'Intermediate' CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      user1_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user2_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
      compatibility_score INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user1_id, user2_id)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
      requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      participant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(200) NOT NULL,
      date TIMESTAMP NOT NULL,
      duration INT NOT NULL DEFAULT 60,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      from_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
      feedback TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (from_user_id, to_user_id)
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS collab_posts (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      skills_have TEXT NOT NULL,
      skills_needed TEXT NOT NULL,
      project_type VARCHAR(100),
      status VARCHAR(10) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS collab_requests (
      id SERIAL PRIMARY KEY,
      post_id INT NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
      requester_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT,
      status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (post_id, requester_id)
    )
  `);
  console.log('✅ Database tables ready');
}

async function autoSeed() {
  const { rows } = await db.query('SELECT COUNT(*) FROM users');
  if (parseInt(rows[0].count) > 0) return;

  console.log('🌱 Auto-seeding demo data...');
  const password = await bcrypt.hash('password123', 10);

  const users = [
    [1, 'Aarav Patel',  'aarav.patel@example.com',  password, 'https://randomuser.me/api/portraits/men/32.jpg',   'Full-stack developer passionate about teaching.',      'Bengaluru, India', 4.8, 24],
    [2, 'Priya Sharma', 'priya.sharma@example.com', password, 'https://randomuser.me/api/portraits/women/44.jpg',  'UI/UX Designer with 5 years of experience.',          'Mumbai, India',    4.9, 31],
    [3, 'Rahul Singh',  'rahul.singh@example.com',  password, 'https://randomuser.me/api/portraits/men/46.jpg',   'Backend engineer specializing in Java.',               'Delhi, India',     4.7, 18],
    [4, 'Ananya Bose',  'ananya.bose@example.com',  password, 'https://randomuser.me/api/portraits/women/65.jpg', 'Data Scientist. Python, ML, TensorFlow expert.',      'Kolkata, India',   4.6, 22],
    [5, 'Vikram Desai', 'vikram.desai@example.com', password, 'https://randomuser.me/api/portraits/men/55.jpg',   'DevOps engineer. Docker, Kubernetes, AWS.',           'Pune, India',      4.5, 15],
    [6, 'Neha Reddy',   'neha.reddy@example.com',   password, 'https://randomuser.me/api/portraits/women/26.jpg', 'Frontend engineer with React and Vue expertise.',     'Hyderabad, India', 4.8, 20],
    [7, 'Arjun Mehta',  'arjun.mehta@example.com',  password, 'https://randomuser.me/api/portraits/men/77.jpg',   'Cloud architect with AWS and Azure skills.',          'Chennai, India',   4.7, 17],
  ];
  for (const u of users)
    await db.query('INSERT INTO users (id,name,email,password,avatar,bio,location,rating,total_sessions) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)', u);

  const skills = [
    [1,'React','offer','Expert',1],[2,'JavaScript','offer','Expert',1],[3,'Node.js','offer','Advanced',1],
    [4,'Python','want','Beginner',1],[5,'Machine Learning','want','Beginner',1],[6,'UI/UX Design','want','Intermediate',1],
    [7,'Figma','offer','Expert',2],[8,'UI/UX Design','offer','Expert',2],[9,'React','want','Intermediate',2],[10,'JavaScript','want','Beginner',2],
    [11,'Java','offer','Expert',3],[12,'Spring Boot','offer','Expert',3],[13,'Node.js','want','Intermediate',3],
    [14,'Python','offer','Expert',4],[15,'Machine Learning','offer','Expert',4],[16,'TensorFlow','offer','Advanced',4],[17,'JavaScript','want','Beginner',4],
    [18,'Docker','offer','Expert',5],[19,'Kubernetes','offer','Expert',5],[20,'AWS','offer','Advanced',5],[21,'React','want','Beginner',5],
    [22,'Vue','offer','Expert',6],[23,'TypeScript','offer','Advanced',6],[24,'JavaScript','want','Intermediate',6],
    [25,'AWS','offer','Expert',7],[26,'Cloud Architecture','offer','Expert',7],[27,'React','want','Intermediate',7],
  ];
  for (const s of skills)
    await db.query('INSERT INTO skills (id,skill_name,type,level,user_id) VALUES ($1,$2,$3,$4,$5)', s);

  const matches = [
    [1,1,2,'active',94],[2,1,3,'active',87],[3,1,4,'active',88],
    [4,1,5,'active',85],[5,1,6,'pending',79],[6,1,7,'pending',72],
  ];
  for (const m of matches)
    await db.query('INSERT INTO matches (id,user1_id,user2_id,status,compatibility_score) VALUES ($1,$2,$3,$4,$5)', m);

  const sessions = [
    [1,1,1,2,'React Hooks Deep Dive','2026-03-24 15:00:00',60,'accepted'],
    [2,2,1,3,'Spring Boot REST APIs','2026-03-25 10:00:00',90,'pending'],
    [3,3,1,4,'Python for Data Science','2026-03-26 14:00:00',60,'pending'],
    [4,1,1,2,'Figma Basics','2026-03-20 15:00:00',45,'completed'],
    [5,2,1,3,'JavaScript Advanced Patterns','2026-03-18 11:00:00',60,'completed'],
  ];
  for (const s of sessions)
    await db.query('INSERT INTO sessions (id,match_id,requester_id,participant_id,topic,date,duration,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', s);

  const messages = [
    [1,2,1,"Hey! I saw your React skills. I'd love to learn from you!"],
    [2,1,2,"Hi! Sure, I'd be happy to teach React in exchange for UI/UX tips."],
    [3,2,1,"That's a great deal! When are you free?"],
    [4,1,2,"I'm free tomorrow afternoon. How about 3pm?"],
    [5,3,1,"I can help you with Spring Boot basics."],
    [6,4,1,"Python for ML sounds great!"],
  ];
  for (const m of messages)
    await db.query('INSERT INTO messages (id,sender_id,receiver_id,message) VALUES ($1,$2,$3,$4)', m);

  const ratings = [
    [1,2,1,5,'Aarav is an amazing React teacher!'],
    [2,3,1,4,'Great session on JavaScript.'],
    [3,4,1,5,'Excellent explanation of async/await.'],
  ];
  for (const r of ratings)
    await db.query('INSERT INTO ratings (id,from_user_id,to_user_id,rating,feedback) VALUES ($1,$2,$3,$4,$5)', r);

  await db.query(`SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))`);
  await db.query(`SELECT setval('skills_id_seq', (SELECT MAX(id) FROM skills))`);
  await db.query(`SELECT setval('matches_id_seq', (SELECT MAX(id) FROM matches))`);
  await db.query(`SELECT setval('sessions_id_seq', (SELECT MAX(id) FROM sessions))`);
  await db.query(`SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages))`);
  await db.query(`SELECT setval('ratings_id_seq', (SELECT MAX(id) FROM ratings))`);

  const collabs = [
    [1, 1, 'Building a Full-Stack E-Commerce App', 'Looking for a UI/UX designer to collaborate on a React + Node.js e-commerce platform. I have the backend ready, need help with design and frontend polish.', JSON.stringify(['React','Node.js','PostgreSQL']), JSON.stringify(['Figma','UI/UX Design']), 'Full Stack', 'open'],
    [2, 4, 'ML-Powered Resume Analyzer', 'Building an AI tool that analyzes resumes and gives feedback. Need a frontend developer to build the dashboard UI.', JSON.stringify(['Python','Machine Learning','TensorFlow']), JSON.stringify(['React','TypeScript','Dashboard Design']), 'AI/ML', 'open'],
    [3, 5, 'DevOps Pipeline for Open Source Project', 'Setting up a full CI/CD pipeline with Docker and Kubernetes for an open source project. Need a backend developer to help with the app side.', JSON.stringify(['Docker','Kubernetes','AWS','CI/CD']), JSON.stringify(['Node.js','Express','REST APIs']), 'DevOps', 'open'],
    [4, 2, 'Design System for SaaS Product', 'Creating a comprehensive design system in Figma for a SaaS startup. Need a React developer to implement the components.', JSON.stringify(['Figma','UI/UX Design','Design Systems']), JSON.stringify(['React','TypeScript','Tailwind CSS']), 'Design', 'open'],
    [5, 7, 'Cloud-Native Microservices Architecture', 'Designing a scalable microservices system on AWS. Looking for a backend developer experienced with Node.js or Java.', JSON.stringify(['AWS','Cloud Architecture','System Design']), JSON.stringify(['Node.js','Java','Spring Boot']), 'Full Stack', 'open'],
  ];
  for (const c of collabs)
    await db.query('INSERT INTO collab_posts (id,user_id,title,description,skills_have,skills_needed,project_type,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', c);
  await db.query(`SELECT setval('collab_posts_id_seq', (SELECT MAX(id) FROM collab_posts))`);

  console.log('✅ Demo data seeded — login: aarav.patel@example.com / password123');
}

db.query('SELECT 1')
  .then(async () => {
    console.log('✅ PostgreSQL connected');
    await initDB();
    await autoSeed();
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });
