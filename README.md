# ✨ BLanc

A modern full-stack **Budget Tracking Application** built with **React + Node.js + MongoDB**, designed to help users manage budget groups, track income and expenses, monitor balances, and receive optional email and SMS notifications.

The platform combines:

- 💰 Smart budget management
- 👥 Multiple budget groups
- 📊 Automatic balance tracking
- 💳 Income & expense management
- 📧 Email & SMS notifications
- 🔐 Secure JWT authentication

---

# 🚀 Live Demo

🌐 Frontend Live:

> Coming Soon

---

# 📌 Features

## 🔐 Authentication System

- Secure JWT Authentication
- User Registration & Login
- Access & Refresh Tokens
- Protected Routes
- User Profile Management
- Notification Preferences

---

## 👥 Budget Groups

- Create Personal, Family, Friends or Custom Groups
- Manage Multiple Budget Groups
- Store Optional Contact Details
- Edit & Delete Groups

---

## 💳 Transaction Management

- Add Income & Expense Transactions
- Update Existing Transactions
- Delete Transactions
- View Transaction History
- Pagination & Filtering Support

---

## 📊 Automatic Balance Tracking

- Live Group Balance Updates
- Income & Expense Summary
- Category-wise Summary
- Financial Overview Dashboard

---

## 🏷️ Categories

### Income

- Salary
- Bonus
- Investment
- Gift
- Other Income

### Expense

- Food
- Shopping
- Bills
- Travel
- Entertainment
- Medical
- Rent
- Utilities
- Insurance
- Education
- Other Expense

---

## 📧 Notifications

- Email Notifications using Nodemailer
- SMS Notifications using HTTP SMS
- User Controlled Notification Preferences

---

# 🛠️ Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- React Router
- Zustand
- Axios
- React Hook Form

## Backend

- Node.js
- Express 5
- TypeScript
- Mongoose
- JWT Authentication
- Nodemailer
- HTTP SMS API

## Database

- MongoDB
- Atlas

---

# 📂 Project Structure

```text
BLanc/
├── backend/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       └── index.ts
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── store/
│       ├── styles/
│       └── types/
└── package.json
```

---

# ⚙️ Prerequisites

- Node.js v18+
- MongoDB
- npm
- Email credentials (Optional)
- HTTP SMS API Key (Optional)

---

# 📥 Installation & Setup

## Clone Repository

```bash
git clone https://github.com/nikku1229/BLanc.git
cd BLanc
npm run install:all
```

## Backend Setup

```bash
cp backend/.env.example backend/.env
npm run dev:backend
```

Required environment variables:

PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRES_IN, EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD, HTTPSMS_API_KEY, HTTPSMS_FROM_NUMBER, FRONTEND_URL

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cp frontend/.env.example frontend/.env
npm run dev:frontend
```

Frontend environment:

```env
VITE_API_URL=http://localhost:5000
```

Frontend runs on:

```text
http://localhost:5173
```

---

# 🔌 API Overview

Base URL:

```text
http://localhost:5000/api
```

## Health

| Method | Endpoint | Description  |
| ------ | -------- | ------------ |
| GET    | /health  | Health Check |

## 🔐 Authentication Routes

| Method | Endpoint            |
| ------ | ------------------- |
| POST   | /auth/register      |
| POST   | /auth/login         |
| POST   | /auth/refresh-token |
| GET    | /auth/me            |
| PUT    | /auth/profile       |

## 👥 Group Routes

| Method | Endpoint    |
| ------ | ----------- |
| GET    | /groups     |
| POST   | /groups     |
| GET    | /groups/:id |
| PUT    | /groups/:id |
| DELETE | /groups/:id |

## 💳 Transaction Routes

| Method | Endpoint                       |
| ------ | ------------------------------ |
| POST   | /transactions                  |
| GET    | /transactions/group/:groupId   |
| GET    | /transactions/summary/:groupId |
| GET    | /transactions/:id              |
| PUT    | /transactions/:id              |
| DELETE | /transactions/:id              |

---

# 📊 Dashboard Features

- Total Balance Overview
- Budget Group Count
- Quick Access to Groups
- Financial Summary
- Category Breakdown

---

# 🔐 Security Features

- JWT Authentication
- Refresh Tokens
- bcrypt Password Hashing
- Helmet Security
- CORS Protection
- Rate Limiting
- Protected Routes

---

# 📈 Performance & UX

- Fast React + Vite
- Responsive UI
- Efficient State Management
- Optimized API Requests

---

# 🚀 Future Improvements

- Charts & Analytics
- Budget Goals
- Recurring Transactions
- Export Reports
- Multi-Currency Support
- Dark Mode Enhancements
- PWA Support

---

# 🌐 Deployment

## Frontend

- Vercel
- Netlify

## Backend

- Render

## Database

- MongoDB Atlas

---

# 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 👨‍💻 Author

## Nitesh Sharma

- GitHub: https://github.com/nikku1229

- LinkedIn: https://www.linkedin.com/in/nitish-sharma-648a581b2/

---

# ⭐ Support

If you like this project:

⭐ Star the repository

🔁 Share the project

🤝 Contribute to development

---

# 💰 Built for Smart & Modern Budget Management

BLanc combines secure authentication, efficient budget tracking, automatic balance calculations, and modern technologies to deliver a simple, reliable, and user-friendly personal finance management experience.
