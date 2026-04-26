# Scot Classroom Management System

A production-ready room booking web application built with **React + Vite + Firebase**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- A Firebase project (Blaze plan for Cloud Functions)

---

## 1. Firebase Project Setup

### 1.1 Create Firebase Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project
3. **Upgrade to Blaze plan** (required for Cloud Functions + external network calls)

### 1.2 Enable Services
- **Authentication** → Sign-in methods → Enable **Google**
- **Firestore Database** → Create database → Start in **production mode**

### 1.3 Get Firebase Config
- Project Settings → General → Your apps → Add Web App
- Copy the config object values

---

## 2. Environment Variables

Create `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

> ⚠️ Never commit `.env.local` to Git. It is already in `.gitignore`.

---

## 3. Install Dependencies

```bash
# Frontend
npm install

# Cloud Functions
cd functions && npm install && cd ..
```

---

## 4. Set Up Cloud Functions Environment

### 4.1 Gmail App Password (for email sending)
1. Go to your Google Account → Security → 2-Step Verification → App Passwords
2. Generate an App Password for "Mail"

### 4.2 Google Sheets (optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Google Sheets API**
3. Create a Service Account → download JSON key
4. Create a Google Sheet, share it with the service account email (Editor role)
5. Copy the Sheet ID from the URL

### 4.3 Set Functions Environment Variables

```bash
firebase login
firebase use your-project-id

firebase functions:secrets:set GMAIL_USER
firebase functions:secrets:set GMAIL_APP_PASSWORD
firebase functions:secrets:set GOOGLE_SHEET_ID
firebase functions:secrets:set ADMIN_EMAILS
firebase functions:secrets:set GOOGLE_SERVICE_ACCOUNT_JSON
```

---

## 5. Add Initial Admin

In Firestore Console, create collection `admins` with document ID = admin email:
- e.g. Document ID: `admin@scot.lk`, field: `email` = `admin@scot.lk`

---

## 6. Deploy

```bash
# Firestore rules
firebase deploy --only firestore:rules

# Cloud Functions
firebase deploy --only functions

# Build and deploy frontend
npm run build
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

---

## 7. Run Locally

```bash
npm run dev
```

---

## Project Structure

```
scot-cms/
├── src/
│   ├── components/
│   │   ├── booking/       # BookingWizard, Step1–Step4
│   │   ├── common/        # Modal, Badge, Spinner, EmptyState, ConfirmDialog
│   │   └── layout/        # Navbar, ProtectedRoute
│   ├── hooks/             # useBookings, useAllBookings
│   ├── pages/             # LoginPage, DashboardPage, BookingPage, MyBookingsPage, AdminPanel
│   ├── services/          # firebase.js, authService.js, bookingService.js
│   ├── store/             # AuthContext.jsx
│   └── utils/             # constants.js, dateHelpers.js, validators.js
├── functions/src/
│   ├── index.js           # Firestore triggers
│   ├── emailService.js    # Nodemailer HTML emails
│   └── sheetsService.js   # Google Sheets API
├── firestore.rules
├── firebase.json
└── .env.example
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Auth | Firebase Auth (Google) |
| Database | Firebase Firestore |
| Backend | Firebase Cloud Functions v2 |
| Email | Nodemailer (Gmail SMTP) |
| Sheets | Google Sheets API v4 |
| Calendar | react-big-calendar |
| Toasts | react-hot-toast |
