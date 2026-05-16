# 💼 HR System – MVP

A simple HR system MVP, built on the **React + Node.js + Express + MongoDB** stack. The project is split into frontend and backend, ready for further development.

---

## 🖥️ Frontend – `client/` (React + Vite + Tailwind CSS)
```txt
client/
├── public/           # favicon, index.html
├── src/
│   ├── assets/       # icons, images, fonts
│   ├── components/   # reusable components (Navbar.jsx, Button.jsx)
│   ├── pages/        # views (Login.jsx, Home.jsx)
│   ├── App.jsx       # main app component
│   ├── main.jsx      # entry point
│   └── index.css     # Tailwind + global styles
├── package.json      # frontend dependencies
```

### 🔧 Technologies
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/) *(optional)*

---

## ⚙️ Backend – `server/` (Node.js + Express + MongoDB)
```txt
server/
├── models/           # Mongoose schemas (User.js)
├── routes/           # API endpoints (auth.js)
├── server.js         # main Express file
├── .env              # environment variables (DB_URI, JWT_SECRET)
├── package.json      # backend dependencies
```

### 🔧 Technologies
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [nodemon](https://www.npmjs.com/package/nodemon)

---

## 📌 MVP Goals – HR System Development Stages

| ✅ Status | 🎯 Feature                                  | 📝 Description |
|----------|---------------------------------------------|----------------|
| ✔️        | Landing page with logo and "Sign in" button | Welcome page with branding and a simple CTA |
| ✔️        | Login form                                  | User authentication with input validation |
| ✔️        | User registration                           | Account creation with a default role (e.g. employee) |
| ✔️        | Employee dashboard                          | View with user info and their activity |
| ✔️        | Roles: admin / HR / employee                | Different permissions and feature access by role |
| ✔️        | Attendance / leave history                  | List of attendance and user's leave requests |
| ✔️        | Profile editing                             | Ability to change personal data and password |
| ✔️        | Employee list (for HR)                      | View of all users with filtering |
| ✔️        | Leave submission and approval               | Leave request form + approval panel for HR/admin |
