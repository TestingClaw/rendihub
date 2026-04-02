# RendiHub MVP

Rental marketplace MVP with Node.js, Express, React, Tailwind CSS, and MySQL.

## Features
- JWT auth
- Listings with image uploads
- Search + filters
- Booking flow + calendar
- Day/week/month pricing
- Reviews + ratings
- Messaging between renter and owner

## Setup

### 1. Install
```bash
npm install
```

### 2. Configure backend env
```bash
cp server/.env.example server/.env
```

### 3. Create MySQL database
Run `server/schema.sql` in MySQL.

### 4. Start app
```bash
npm run dev
```

- API: `http://localhost:5000`
- Frontend: `http://localhost:5173`
