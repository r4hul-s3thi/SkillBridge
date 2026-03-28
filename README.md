<div align="center">

<img src="https://img.shields.io/badge/SkillBridge-Peer%20Learning%20Platform-2ac7b6?style=for-the-badge&logo=react&logoColor=white" alt="SkillBridge" />

# SkillBridge 🔄

### *Exchange skills. Grow together. For free.*

A full-stack peer-to-peer skill exchange platform where you teach what you know and learn what you want — no money, just knowledge.

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<br/>

![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)
![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red?style=flat-square)

</div>

---

## ✨ What is SkillBridge?

SkillBridge is a **peer-to-peer skill exchange web app** that connects people who want to teach and learn from each other — completely free. You offer a skill you know, find someone who wants to learn it, and in return they teach you something you want to learn.

> 💡 *"I'll teach you React if you teach me UI/UX Design"* — that's SkillBridge.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Register, Login, OAuth (Google & GitHub) |
| 👤 **Profile** | Edit name, bio, location, upload/remove profile picture |
| 🤝 **Smart Matching** | Auto-matched with users based on skill overlap & compatibility score |
| 💬 **Real-time Chat** | Messaging with auto-reply personalities per user |
| 📅 **Sessions** | Schedule, accept, reject and mark sessions as complete |
| 🤝 **Collab Board** | Post projects, find collaborators, manage join requests |
| ⭐ **Ratings** | Rate peers after completed sessions with star ratings & feedback |
| 🏆 **Leaderboard** | Top users ranked by sessions completed and rating |
| 🤖 **AI Chatbot** | Built-in assistant to guide users through the platform |
| 🌙 **Dark / Light Mode** | Full theme support across all pages |

---

## 🖼️ Screenshots

> Dashboard · Matches · Messages · Sessions · Collab Board · Leaderboard

<div align="center">

| Dashboard | Smart Matches |
|---|---|
| ![Dashboard](https://placehold.co/600x340/0f1729/2ac7b6?text=Dashboard) | ![Matches](https://placehold.co/600x340/0f1729/2ac7b6?text=Smart+Matches) |

| Messages | Leaderboard |
|---|---|
| ![Messages](https://placehold.co/600x340/0f1729/2ac7b6?text=Messages) | ![Leaderboard](https://placehold.co/600x340/0f1729/2ac7b6?text=Leaderboard) |

</div>

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript** — Component-based UI
- **Vite** — Lightning-fast dev server & build tool
- **Tailwind CSS v4** — Utility-first styling
- **Zustand** — Lightweight state management with persistence
- **React Router v7** — Client-side routing
- **Shadcn/ui** — Accessible, beautiful UI components
- **Axios** — HTTP client
- **date-fns** — Date formatting

### Backend
- **Node.js** + **Express** — REST API server
- **MySQL2** — Relational database
- **JWT** — Stateless authentication
- **Bcrypt** — Password hashing
- **CORS** — Cross-origin resource sharing

---

## 📁 Project Structure

```
SkillBridge/
├── skillswap/                  # Frontend (React + TypeScript)
│   └── src/
│       ├── pages/              # Dashboard, Profile, Matches, Messages,
│       │                       # Sessions, Ratings, Collabs, Leaderboard
│       ├── components/
│       │   ├── layout/         # AppLayout, AppSidebar
│       │   └── shared/         # UserAvatar, ChatBot, StarRating, etc.
│       ├── services/           # API service files (axios)
│       ├── store/              # Zustand stores (auth + app)
│       └── types/              # TypeScript interfaces
│
└── skillswap-backend/          # Backend (Node.js + Express)
    ├── routes/                 # auth, skills, matches, sessions,
    │                           # messages, ratings, collabs, leaderboard
    ├── middleware/             # JWT auth middleware
    ├── utils/                  # generateMatches helper
    ├── schema.sql              # Full database schema
    ├── seed.js                 # Demo data seeder
    └── index.js                # Entry point
```

---

## ⚡ Getting Started

### Prerequisites
- Node.js v18+
- MySQL (via XAMPP, MySQL Workbench, or local install)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/skillbridge.git
cd skillbridge
```

### 2. Setup the Backend

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

Create the database and run the schema:

```bash
mysql -u root -p < schema.sql
```

Seed with demo data:

```bash
npm run seed
```

Start the backend:

```bash
node index.js
# ✅ MySQL connected
# 🚀 Server running on http://localhost:8080
```

### 3. Setup the Frontend

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

## 👥 Demo Accounts

All demo accounts use the password: `password123`

| Name | Email | Skills |
|---|---|---|
| Aarav Patel | aarav.patel@example.com | React, JS, Node.js → wants Python, ML |
| Priya Sharma | priya.sharma@example.com | Figma, UI/UX → wants React |
| Rahul Singh | rahul.singh@example.com | Java, Spring Boot → wants Node.js |
| Ananya Bose | ananya.bose@example.com | Python, ML, TensorFlow → wants JS |
| Vikram Desai | vikram.desai@example.com | Docker, Kubernetes, AWS → wants React |
| Neha Reddy | neha.reddy@example.com | Vue, TypeScript → wants JS |
| Arjun Mehta | arjun.mehta@example.com | AWS, Cloud Architecture → wants React |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/oauth` | OAuth login (Google/GitHub) |
| PATCH | `/api/auth/profile` | Update profile |

### Core
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/skills` | Get or add skills |
| DELETE | `/api/skills/:id` | Remove a skill |
| GET | `/api/matches` | Get smart matches |
| PATCH | `/api/matches/:id` | Update match status |
| GET/POST | `/api/sessions` | Get or create sessions |
| PATCH | `/api/sessions/:id` | Update session status |
| GET | `/api/messages/conversations` | Get conversations |
| GET/POST | `/api/messages/:userId` | Get thread / send message |
| GET/POST | `/api/ratings` | Get or submit ratings |

### New Features
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/collabs` | Get all collab posts |
| GET | `/api/collabs/mine` | Get my posts |
| POST | `/api/collabs` | Create a post |
| PATCH | `/api/collabs/:id/status` | Open/close post |
| DELETE | `/api/collabs/:id` | Delete post |
| GET/POST | `/api/collabs/:id/requests` | Get or send join requests |
| PATCH | `/api/collabs/requests/:id` | Accept/reject request |
| GET | `/api/leaderboard` | Get top users by score |

---

## 🏆 Leaderboard Scoring

```
Score = (Rating × 20) + Total Sessions Completed
```

Users are ranked by this score. Complete more sessions and maintain a high rating to climb the leaderboard!

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ for the hackathon

**[⭐ Star this repo](https://github.com/YOUR_USERNAME/skillbridge)** if you found it useful!

</div>
