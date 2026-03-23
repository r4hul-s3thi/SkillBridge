# SkillSwap 🔄

A peer-to-peer skill exchange web app where users can offer skills they know and find others to learn from — all for free.

---

## Features

- 🔐 Auth — Register, Login, OAuth (Google & GitHub demo)
- 👤 Profile — Edit name, bio, location, upload/remove profile picture
- 🤝 Smart Matches — Auto-matched with other users based on skill overlap
- 💬 Messages — Real-time style chat with auto-reply personalities
- 📅 Sessions — Schedule, accept, reject and complete skill sessions
- ⭐ Ratings — Rate users after completed sessions
- 🌙 Dark/Light mode support

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management)
- React Router v7
- Shadcn/ui components
- Axios

**Backend**
- Node.js + Express
- MySQL2
- JWT Authentication
- Bcrypt
- CORS

---

## Project Structure

```
Skill bridge/
├── skillswap/          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── pages/      # Dashboard, Profile, Matches, Messages, Sessions, Ratings
│   │   ├── components/ # Shared UI components
│   │   ├── services/   # API service files
│   │   ├── store/      # Zustand stores
│   │   └── types/      # TypeScript types
│   └── ...
└── skillswap-backend/  # Backend (Node.js + Express)
    ├── routes/         # auth, skills, matches, sessions, messages, ratings
    ├── middleware/      # JWT auth middleware
    ├── utils/          # generateMatches helper
    ├── schema.sql      # Database schema
    ├── seed.js         # Database seeder
    └── index.js        # Entry point
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL (via XAMPP or local install)

### 1. Clone the repo
```bash
git clone https://github.com/Kaushalkumar012/Skillswap-App.git
cd Skillswap-App
```

### 2. Setup Backend
```bash
cd skillswap-backend
npm install
```

Create a `.env` file inside `skillswap-backend/`:
```env
PORT=8080
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=skillswap
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Create the database and tables:
```bash
# Run schema in MySQL
mysql -u root -p < schema.sql
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
node index.js
```

### 3. Setup Frontend
```bash
cd skillswap
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## Demo Accounts

| Name | Email | Password |
|------|-------|----------|
| Aarav Patel | aarav.patel@example.com | password123 |
| Priya Sharma | priya.sharma@example.com | password123 |
| Rahul Singh | rahul.singh@example.com | password123 |
| Ananya Bose | ananya.bose@example.com | password123 |
| Vikram Desai | vikram.desai@example.com | password123 |
| Neha Reddy | neha.reddy@example.com | password123 |
| Arjun Mehta | arjun.mehta@example.com | password123 |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/oauth | OAuth login |
| PATCH | /api/auth/profile | Update profile |
| GET | /api/skills | Get user skills |
| POST | /api/skills | Add skill |
| DELETE | /api/skills/:id | Remove skill |
| GET | /api/matches | Get matches |
| PATCH | /api/matches/:id | Update match status |
| GET | /api/sessions | Get sessions |
| POST | /api/sessions | Create session |
| PATCH | /api/sessions/:id | Update session status |
| GET | /api/messages/conversations | Get conversations |
| GET | /api/messages/:userId | Get message thread |
| POST | /api/messages | Send message |
| GET | /api/ratings | Get ratings |
| POST | /api/ratings | Submit rating |

---

## License

MIT
