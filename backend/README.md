# ZakatAid — Authentication Backend

Express.js + MongoDB API powering the ZakatAid authentication system.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express app (middleware, routes)
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   └── user.model.js      # Mongoose User schema
│   ├── controllers/
│   │   ├── auth.controller.js # All auth logic
│   │   └── user.controller.js # Profile management
│   ├── routes/
│   │   ├── auth.routes.js     # /api/auth/*
│   │   └── user.routes.js     # /api/users/*
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT protect + role restrict
│   │   ├── validate.middleware.js # express-validator runner
│   │   └── error.middleware.js    # 404 + global error handler
│   ├── validators/
│   │   └── auth.validators.js # All request validation rules
│   └── utils/
│       ├── jwt.utils.js       # Access + refresh token helpers
│       ├── otp.utils.js       # OTP generation
│       └── email.utils.js     # Nodemailer + branded templates
├── .env                       # Local env variables (gitignored)
├── .env.example               # Template for env setup
└── package.json
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Key variables:
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `SMTP_*` | Email credentials (Gmail / SMTP) |
| `CLIENT_URL` | Frontend origin for CORS |

### 3. Start development server
```bash
npm run dev    # with nodemon (auto-restart)
npm start      # without nodemon
```

---

## 📡 API Endpoints

### Auth (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register (full 3-step payload) |
| `POST` | `/verify-otp` | ❌ | Verify email/phone OTP |
| `POST` | `/resend-otp` | ❌ | Resend OTP code |
| `POST` | `/login` | ❌ | Login → access + refresh tokens |
| `POST` | `/refresh` | ❌ | Exchange refresh token |
| `POST` | `/forgot-password` | ❌ | Send password reset email |
| `POST` | `/reset-password` | ❌ | Set new password via token |
| `GET`  | `/me` | ✅ | Get current user profile |
| `POST` | `/logout` | ✅ | Invalidate refresh token |
| `POST` | `/change-password` | ✅ | Change password (authenticated) |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET`    | `/profile` | ✅ | Get own profile |
| `PATCH`  | `/profile` | ✅ | Update own profile |
| `DELETE` | `/profile` | ✅ | Deactivate account |
| `GET`    | `/` | ✅ Admin | List all users (paginated) |

---

## 🔐 Authentication Flow

```
Register  →  Returns accessToken + refreshToken + userId
                ↓
Verify OTP  →  Account fully activated
                ↓
Login  →  accessToken (7d) + refreshToken (30d)
                ↓
Refresh  →  New token pair when accessToken expires
                ↓
Logout  →  Refresh token invalidated server-side
```

### Token Usage
```
Authorization: Bearer <accessToken>
```

---

## 📧 Email Templates

Branded HTML emails are sent for:
- **OTP verification** on registration
- **Welcome** after verification
- **Password reset** link

Configure SMTP in `.env`. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

---

## 🛡️ Security Features

- **bcrypt** password hashing (12 salt rounds)
- **JWT** access (7d) + refresh (30d) token rotation
- **Refresh tokens hashed** before storage in DB
- **Rate limiting**: 10 req/15min on login/register, 5 req/5min on OTP
- **Input validation** on every endpoint (express-validator)
- **CORS** restricted to frontend origin
- **Password never returned** in any query (`select: false`)
