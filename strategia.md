# 💼 HR System – MVP

Prosty system HR w wersji MVP, zbudowany w stacku **React + Node.js + Express + MongoDB**. Projekt podzielony na frontend i backend, gotowy do dalszego rozwoju.

---

## 🖥️ Frontend – `client/` (React + Vite + Tailwind CSS)
```txt
client/
├── public/           # favicon, index.html
├── src/
│   ├── assets/       # ikony, obrazy, fonty
│   ├── components/   # reużywalne komponenty (Navbar.jsx, Button.jsx)
│   ├── pages/        # widoki (Login.jsx, Home.jsx)
│   ├── App.jsx       # główny komponent aplikacji
│   ├── main.jsx      # punkt wejścia
│   └── index.css     # Tailwind + style globalne
├── package.json      # zależności frontendowe
```

### 🔧 Technologie
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/) *(opcjonalnie)*

---

## ⚙️ Backend – `server/` (Node.js + Express + MongoDB)
```txt
server/
├── models/           # schematy Mongoose (User.js)
├── routes/           # endpointy API (auth.js)
├── server.js         # główny plik Express
├── .env              # zmienne środowiskowe (DB_URI, JWT_SECRET)
├── package.json      # zależności backendowe
```

### 🔧 Technologie
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [nodemon](https://www.npmjs.com/package/nodemon)

---

## 📌 Cele MVP – Etapy rozwoju systemu HR

| ✅ Status | 🎯 Funkcja                                | 📝 Opis |
|----------|--------------------------------------------|--------|
| ✔️        | Landing page z logo i przyciskiem „Zaloguj się” | Strona startowa z brandingiem i prostym CTA |
| ✔️        | Formularz logowania                       | Autoryzacja użytkownika z walidacją danych |
| ✔️        | Rejestracja użytkownika                   | Tworzenie konta z rolą domyślną (np. pracownik) |
| ✔️        | Dashboard pracownika                      | Widok z informacjami o użytkowniku i jego aktywności |
| ⬜        | Role: admin / HR / pracownik              | Różne uprawnienia i dostęp do funkcji w zależności od roli |
| ⬜        | Historia obecności / urlopów              | Lista obecności i wniosków urlopowych użytkownika |
| ⬜        | Edycja profilu użytkownika                | Możliwość zmiany danych osobowych i hasła |
| ⬜        | Lista pracowników (dla HR)                | Widok wszystkich użytkowników z możliwością filtrowania |
| ⬜        | Dodawanie i zatwierdzanie urlopów         | Formularz wniosku urlopowego + panel akceptacji dla HR/admina |
