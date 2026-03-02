# 💼 WorkNest - All-in-One HR Management System

WorkNest is a professional, full-stack HR management platform designed for SMBs. It features a complete ecosystem for managing employees, recruitment, leave requests, and projects, all wrapped in a premium UI.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN-emerald)](https://github.com/topics/mern-stack)
[![License](https://img.shields.io/badge/License-MIT-teal)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Portfolio--Ready-green)]()

## 🌟 Key Features

- **Personal Sandboxed Demo**: Instant access to a unique, isolated demo environment with its own sample data.
- **Recruitment ATS**: Kanban-style drag-and-drop recruiter pipeline.
- **Leave Management**: Built-in approval workflows for HR and Admins.
- **Analytics Dashboard**: Real-time insights into headcount, turnover, and project progress.
- **GDPR Ready**: Industry-standard encryption for sensitive employee data (PESEL/ID).
- **Pro Design**: High-end styling with Tailwind CSS and Framer Motion.

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Security**: JWT Authentication (Access/Refresh tokens), Bcrypt, AES-256-CBC Encryption.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Atlas or local)

### Installation

1. **Clone the repo**:

   ```bash
   git clone https://github.com/yourusername/worknest.git
   cd worknest
   ```

2. **Server Setup**:

   ```bash
   cd server
   npm install
   cp .env.example .env
   # Update your MONGODB_URI and ENCRYPTION_KEY in .env
   npm run dev
   ```

3. **Client Setup**:
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

## 🐳 Docker (Recommended)

The fastest way to run WorkNest — no Node.js or MongoDB setup required.

### Production

```bash
# 1. Copy environment file and fill in your values
cp server/.env.example server/.env

# 2. Start the whole stack (frontend + backend)
docker-compose up -d
```

App will be available at **http://localhost**.

### Development (with hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up
```

### Stop

```bash
docker-compose down
```

---

## 🔐 Demo Logic (Sandbox Isolation)

WorkNest uses a unique **Sandbox Isolation** strategy for its demo login:

- Every demo session spawns a unique `Company` and set of `Users`.
- Data is isolated via randomly generated session IDs.
- Automatic cleanup via MongoDB TTL indexes ensure no orphaned data persists after 2 hours.

## 📜 License

Distribute under the [MIT License](LICENSE).
