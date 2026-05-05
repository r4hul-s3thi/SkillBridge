<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=SkillBridge&fontSize=80&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Find%20Your%20Missing%20Piece.%20Build%20Together.&descAlignY=60&descSize=20" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=24&pause=1000&color=6366F1&center=true&vCenter=true&width=700&lines=You+know+Frontend%2C+need+a+Backend+dev%3F;You+know+ML%2C+need+a+React+dev%3F;Post+your+project.+Find+your+co-builder.;SkillBridge+connects+you!" alt="Typing SVG" />

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)

<br/>

![License](https://img.shields.io/badge/license-MIT-2ac7b6?style=flat-square&logo=opensourceinitiative&logoColor=white)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square&logo=github)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-red?style=flat-square)
[![Stars](https://img.shields.io/github/stars/r4hul-s3thi/SkillBridge?style=flat-square&color=yellow&logo=github)](https://github.com/r4hul-s3thi/SkillBridge/stargazers)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://skill-bridge-5g45.vercel.app)
[![Backend on Render](https://img.shields.io/badge/Backend%20on-Render-46E3B7?style=flat-square&logo=render&logoColor=white)](https://skillswap-backend-r27s.onrender.com)

<br/>

### [Live Demo](https://skill-bridge-5g45.vercel.app)

> *"I know Frontend. You know Backend. Let's build something together."* — that's **SkillBridge**.

</div>

---

## What is SkillBridge?

**SkillBridge** is a real-time skill-based collaboration platform. It connects developers, designers, and builders who have complementary skills so they can team up and build real projects together — for free.

The idea is simple:

- You are building a project but only know **Frontend** — find someone who knows **Backend**
- You know **Machine Learning** but need a **React developer** for the UI
- You have **DevOps** skills and want a **Node.js** developer to build the app side
- You are a **UI/UX designer** and need a **developer** to implement your designs

Post what you have, post what you need, get matched, chat in real-time, and build together.

---

## How It Works

```
1. Sign up and add your skills (what you know)
2. Browse or get matched with people who have complementary skills
3. Post a project on the Collab Board — describe what you're building,
   what skills you have, and what skills you need
4. Other users send join requests to collaborate
5. Accept requests, chat in real-time, schedule sessions, and build
6. Rate your collaborators after working together
```

---

## Features

| Feature | Description |
|---|---|
| **Smart Matching** | Auto-matched with users who have the skills you need and need the skills you have |
| **Collab Board** | Post your project idea, list your skills and what you need, find co-builders |
| **Real-time Chat** | Instant messaging via Socket.io with typing indicators and live presence |
| **Live Presence** | See who is online right now across all users |
| **Sessions** | Schedule collaboration sessions, accept/reject, mark complete |
| **Ratings** | Rate collaborators after working together to build credibility |
| **Leaderboard** | Top collaborators ranked by sessions completed and rating |
| **Profile** | Showcase your skills, bio, location and collaboration history |
| **AI Chatbot** | Built-in assistant to help you navigate the platform |
| **Dark / Light Mode** | Full theme support across all pages |
| **Authentication** | Register and login with JWT + OAuth (Google & GitHub) |

---

## Tech Stack

### Frontend

| Tech | Purpose |
|---|---|
| React 19 + TypeScript | Component-based UI with full type safety |
| Vite 7 | Lightning-fast dev server and optimized builds |
| Tailwind CSS v4 | Utility-first styling with custom animations |
| Zustand | Lightweight global state management |
| React Router v7 | Client-side routing |
| Socket.io Client | Real-time bidirectional communication |
| Shadcn/ui | Accessible, composable UI components |
| Axios | HTTP client for REST API calls |

### Backend

| Tech | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Socket.io | WebSocket server for real-time events |
| PostgreSQL (via `pg`) | Relational database |
| JWT | Stateless authentication tokens |
| Bcrypt | Secure password hashing |

### Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Frontend hosting with automatic CI/CD |
| Render | Backend hosting with PostgreSQL |

---

## Real-time Architecture

```
User A (Browser)              Server (Socket.io)              User B (Browser)
      |                               |                               |
      |--- message:send ------------->|                               |
      |                               |--- db.INSERT --------------->|
      |<-- message:receive -----------|                               |
      |                               |--- socket.to(B).emit() ----->|
      |                               |                               |
      |--- typing:start ------------->|--- socket.to(B).emit() ----->|
      |--- user:online -------------->|--- io.emit(presence:update)->|
```

- Messages are saved to PostgreSQL and emitted to both users simultaneously
- Typing indicators are forwarded to the recipient in real-time
- Online presence is broadcast to all connected clients on connect/disconnect

---

## Project Structure

```
SkillBridge/
|-- skillswap/                    # Frontend (React + TypeScript)
|   `-- src/
|       |-- pages/                # Dashboard, Profile, Matches, Messages,
|       |                         # Sessions, Ratings, Collabs, Leaderboard
|       |-- components/
|       |   |-- layout/           # AppLayout, AppSidebar
|       |   `-- shared/           # UserAvatar, ChatBot, StarRating, etc.
|       |-- services/             # API + Socket service files
|       |-- store/                # Zustand stores (auth, app, presence)
|       `-- types/                # TypeScript interfaces
|
`-- skillswap-backend/            # Backend (Node.js + Express + Socket.io)
    |-- routes/                   # auth, skills, matches, sessions,
    |                             # messages, ratings, collabs, leaderboard
    |-- middleware/               # JWT auth middleware
    |-- utils/                    # generateMatches helper
    |-- schema.sql                # Full database schema
    |-- seed.js                   # Demo data seeder
    `-- index.js                  # Entry point with Socket.io server
```

---

## Getting Started (Local)

### Prerequisites

- Node.js v18+
- PostgreSQL v14+

### 1. Clone the repository

```bash
git clone https://github.com/r4hul-s3thi/SkillBridge.git
cd SkillBridge
```

### 2. Setup the Backend

```bash
cd skillswap-backend
npm install
```

Create `.env` inside `skillswap-backend/`:

```env
PORT=8080
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/skillbridge
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend (auto-creates tables and seeds demo data):

```bash
node index.js
# PostgreSQL connected
# Database tables ready
# Server running on http://localhost:8080
```

### 3. Setup the Frontend

```bash
cd skillswap
npm install
```

Create `.env` inside `skillswap/`:

```env
VITE_API_URL=http://localhost:8080/api
```

```bash
npm run dev
# Open http://localhost:5173
```

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service** → connect your GitHub repo
2. Set **Root Directory** to `skillswap-backend`
3. Build command: `npm install` | Start command: `npm start`
4. Add environment variables:

| Key | Value |
|---|---|
| `DATABASE_URL` | Render PostgreSQL connection string |
| `JWT_SECRET` | A long random secret string |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel frontend URL |
| `NODE_ENV` | `production` |

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Set **Root Directory** to `skillswap`
3. Add environment variable:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` |

The `vercel.json` handles SPA routing automatically.

---

## Demo Accounts

> All accounts use password: **`password123`**

| Name | Email | Skills |
|---|---|---|
| Aarav Patel | aarav.patel@example.com | React, JavaScript, Node.js |
| Priya Sharma | priya.sharma@example.com | Figma, UI/UX Design |
| Rahul Singh | rahul.singh@example.com | Java, Spring Boot |
| Ananya Bose | ananya.bose@example.com | Python, Machine Learning, TensorFlow |
| Vikram Desai | vikram.desai@example.com | Docker, Kubernetes, AWS |
| Neha Reddy | neha.reddy@example.com | Vue, TypeScript |
| Arjun Mehta | arjun.mehta@example.com | AWS, Cloud Architecture |

---

## API Reference

<details>
<summary><b>Auth</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/oauth` | OAuth login (Google/GitHub) |
| `PATCH` | `/api/auth/profile` | Update profile info |

</details>

<details>
<summary><b>Core</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/skills` | Get or add skills |
| `DELETE` | `/api/skills/:id` | Remove a skill |
| `GET` | `/api/matches` | Get skill-based matches |
| `PATCH` | `/api/matches/:id` | Update match status |
| `GET/POST` | `/api/sessions` | Get or create sessions |
| `PATCH` | `/api/sessions/:id` | Update session status |
| `GET` | `/api/messages/conversations` | Get all conversations |
| `GET/POST` | `/api/messages/:userId` | Get thread / send message |
| `GET/POST` | `/api/ratings` | Get or submit ratings |

</details>

<details>
<summary><b>Collab Board</b></summary>

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/collabs` | Get all or create collab posts |
| `GET` | `/api/collabs/mine` | Get my collab posts |
| `PATCH` | `/api/collabs/:id/status` | Open/close a post |
| `DELETE` | `/api/collabs/:id` | Delete a post |
| `GET/POST` | `/api/collabs/:id/requests` | Get or send join requests |
| `PATCH` | `/api/collabs/requests/:id` | Accept/reject a request |
| `GET` | `/api/leaderboard` | Get top collaborators by score |
| `GET` | `/api/online-users` | Get currently online user IDs |

</details>

<details>
<summary><b>Socket.io Events</b></summary>

| Event | Direction | Payload | Description |
|---|---|---|---|
| `user:online` | Client → Server | `userId` | Register user as online |
| `message:send` | Client → Server | `{ senderId, receiverId, message }` | Send a message |
| `message:receive` | Server → Client | `{ id, senderId, receiverId, message, createdAt }` | Receive a message |
| `typing:start` | Client → Server | `{ senderId, receiverId }` | User started typing |
| `typing:stop` | Client → Server | `{ senderId, receiverId }` | User stopped typing |
| `presence:update` | Server → All | `number[]` | Updated list of online user IDs |

</details>

---

## Leaderboard Scoring

```
Score = (Average Rating x 20) + Total Sessions Completed
```

Complete more collaboration sessions and maintain a high rating to climb the leaderboard!

---

## Contributing

Contributions are welcome!

```bash
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a Pull Request
```

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer&animation=twinkling" width="100%"/>

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=15&pause=1000&color=6366F1&center=true&vCenter=true&width=500&lines=Built+with+React+%2B+Node.js+%2B+Socket.io;Stop+building+alone.+Find+your+co-builder!" alt="Footer" />

**[Star this repo](https://github.com/r4hul-s3thi/SkillBridge)** if you found it useful!

[![GitHub followers](https://img.shields.io/github/followers/r4hul-s3thi?style=social)](https://github.com/r4hul-s3thi)
[![GitHub stars](https://img.shields.io/github/stars/r4hul-s3thi/SkillBridge?style=social)](https://github.com/r4hul-s3thi/SkillBridge)

</div>
