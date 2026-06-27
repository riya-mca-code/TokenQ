# TokenQ Deployment

## Stack

Frontend

- Next.js
- Vercel

Backend

- Node.js
- Express
- Render

Database

- MongoDB Atlas

Realtime

- Socket.IO

Storage (Future)

- Cloudinary

---

# Environment Variables

## Frontend (.env.local)

NEXT_PUBLIC_API_URL=

NEXT_PUBLIC_SOCKET_URL=

---

## Backend (.env)

NODE_ENV=production

PORT=5000

MONGODB_URI=

JWT_SECRET=

JWT_EXPIRES_IN=7d

CLIENT_URL=

CORS_ORIGIN=

SUPER_ADMIN_EMAIL=

SUPER_ADMIN_PASSWORD=

---

# Build Commands

Frontend

npm install

npm run build

Backend

npm install

npm start

---

# Production Checklist

☐ Environment variables configured

☐ MongoDB connected

☐ JWT working

☐ Socket.IO working

☐ HTTPS enabled

☐ CORS configured

☐ Helmet enabled

☐ Rate limiting enabled

☐ Validation enabled

☐ Password hashing enabled

☐ Audit logging enabled

☐ No localhost URLs

☐ No hardcoded secrets

☐ Production build successful

---

# Deployment Flow

GitHub

↓

Vercel

↓

Render

↓

MongoDB Atlas

---

# Vercel

Root

/

Framework

Next.js

Build

npm run build

Output

Automatic

---

# Render

Environment

Node

Build

npm install

Start

npm start

Health Check

/api/health

Auto Deploy

Enabled

---

# MongoDB Atlas

Cluster

Production

Whitelist

Render IP

Indexes

Enabled

Backups

Enabled

---

# Domains

Frontend

https://app.tokenq.in

Backend

https://api.tokenq.in

Future

https://{organization}.tokenq.in

---

# SSL

Required

HTTPS only

Secure Cookies

Enabled

---

# Monitoring

Logs

Render

Analytics

Vercel

Database

MongoDB Atlas

---

# Backup

Daily database backup.

Keep audit logs.

---

# Production Rules

Never commit:

.env

Secrets

Private keys

Never use:

localhost

Hardcoded URLs

Debug code

Console logs

---

# CI/CD

Push → GitHub

↓

Automatic Deploy

↓

Health Check

↓

Ready