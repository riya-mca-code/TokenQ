# TokenQ Architecture

## Overview

TokenQ is a production-ready multi-tenant Queue Management SaaS.

Architecture:

Client
↓
Next.js
↓
REST API + Socket.IO
↓
Express.js
↓
MongoDB Atlas

---

# Tech Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

Backend

- Node.js
- Express
- TypeScript

Database

- MongoDB
- Mongoose

Realtime

- Socket.IO

Authentication

- JWT
- bcrypt

Deployment

- Vercel
- Render
- MongoDB Atlas

---

# Frontend Structure

```
app/
components/
hooks/
lib/
services/
types/
styles/
public/
```

---

# Backend Structure

```
src/
 ├── config/
 ├── controllers/
 ├── middleware/
 ├── models/
 ├── routes/
 ├── services/
 ├── sockets/
 ├── utils/
 └── server.ts
```

---

# Request Flow

Client

↓

Middleware

↓

Authentication

↓

Authorization

↓

Validation

↓

Controller

↓

Service

↓

Database

↓

Response

---

# Authentication Flow

Login

↓

Verify Password

↓

Generate JWT

↓

Store Token

↓

Protected Routes

↓

Verify JWT

↓

Load User

↓

Check Role

↓

Continue

---

# Organization Flow

Organization

↓

Users

↓

Counters

↓

Customers

↓

Queue

↓

Reports

Every resource belongs to one organization.

---

# Dashboard Flow

Customer

↓

Token Generation

↓

Waiting Queue

↓

Staff Calls Token

↓

Serving

↓

Completed

↓

History

---

# Socket.IO Events

client:join

queue:update

token:create

token:call

token:complete

token:skip

counter:update

analytics:update

notification

---

# Security Layers

Helmet

↓

Rate Limiter

↓

JWT

↓

Role Middleware

↓

Organization Middleware

↓

Validation

↓

Controller

---

# Middleware

Auth

Role

Organization

Validation

Error Handler

Logger

CORS

---

# Error Handling

Global error handler.

Standard API responses.

Never expose stack traces in production.

---

# API Pattern

Route

↓

Controller

↓

Service

↓

Database

No business logic inside routes.

---

# State Management

Frontend

TanStack Query

Backend

MongoDB

Realtime

Socket.IO

---

# Multi-Tenancy

Every query must include:

organizationId

No cross-organization access.

---

# Deployment

Frontend

Vercel

↓

Backend

Render

↓

MongoDB Atlas

↓

Socket.IO

---

# Principles

- Modular
- Reusable
- Scalable
- Secure
- Production Ready
- Mobile First
- API First
- Multi Tenant

Never rewrite existing architecture.

Extend existing modules whenever possible.