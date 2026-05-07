-- SkillBridge Database Schema
-- Run this to create all tables from scratch

-- Users
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)   NOT NULL,
  email         VARCHAR(150)   NOT NULL UNIQUE,
  password      VARCHAR(255),
  avatar        TEXT,                                      -- TEXT instead of VARCHAR(500) to support base64
  bio           TEXT,
  location      VARCHAR(150),
  rating        DECIMAL(3,2)   NOT NULL DEFAULT 0.00,
  total_sessions INT           NOT NULL DEFAULT 0,
  created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Skills
CREATE TABLE IF NOT EXISTS skills (
  id          SERIAL PRIMARY KEY,
  user_id     INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name  VARCHAR(100) NOT NULL,
  type        VARCHAR(10)  NOT NULL CHECK (type IN ('offer', 'want')),
  level       VARCHAR(20)  NOT NULL DEFAULT 'Intermediate'
                           CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_type    ON skills(type);

-- Matches
CREATE TABLE IF NOT EXISTS matches (
  id                  SERIAL PRIMARY KEY,
  user1_id            INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id            INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status              VARCHAR(10) NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'active')),
  compatibility_score INT         NOT NULL DEFAULT 0,
  created_at          TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user1_id, user2_id),
  CHECK (user1_id <> user2_id)
);

CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id             SERIAL PRIMARY KEY,
  match_id       INT          NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  requester_id   INT          NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  participant_id INT          NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  topic          VARCHAR(200) NOT NULL,
  date           TIMESTAMP    NOT NULL,
  duration       INT          NOT NULL DEFAULT 60 CHECK (duration > 0),
  status         VARCHAR(10)  NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (requester_id <> participant_id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_requester   ON sessions(requester_id);
CREATE INDEX IF NOT EXISTS idx_sessions_participant ON sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status      ON sessions(status);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id          SERIAL PRIMARY KEY,
  sender_id   INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT      NOT NULL CHECK (char_length(message) > 0),
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender   ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread   ON messages(sender_id, receiver_id, created_at);

-- Ratings
CREATE TABLE IF NOT EXISTS ratings (
  id           SERIAL PRIMARY KEY,
  from_user_id INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id   INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback     TEXT,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (from_user_id, to_user_id),
  CHECK (from_user_id <> to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_to_user ON ratings(to_user_id);

-- Collab Posts
CREATE TABLE IF NOT EXISTS collab_posts (
  id            SERIAL PRIMARY KEY,
  user_id       INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT         NOT NULL,
  skills_have   JSONB        NOT NULL DEFAULT '[]',          -- JSONB instead of TEXT
  skills_needed JSONB        NOT NULL DEFAULT '[]',          -- JSONB instead of TEXT
  project_type  VARCHAR(100),
  status        VARCHAR(10)  NOT NULL DEFAULT 'open'
                             CHECK (status IN ('open', 'closed')),
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_collab_posts_user_id ON collab_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_posts_status  ON collab_posts(status);

-- Collab Requests
CREATE TABLE IF NOT EXISTS collab_requests (
  id           SERIAL PRIMARY KEY,
  post_id      INT         NOT NULL REFERENCES collab_posts(id) ON DELETE CASCADE,
  requester_id INT         NOT NULL REFERENCES users(id)        ON DELETE CASCADE,
  message      TEXT,
  status       VARCHAR(10) NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at   TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (post_id, requester_id)
);

CREATE INDEX IF NOT EXISTS idx_collab_requests_post_id ON collab_requests(post_id);
