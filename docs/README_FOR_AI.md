# TokenQ AI Guide

## Purpose

TokenQ is a production-ready multi-tenant Queue Management SaaS.

This repository is the single source of truth.

Always read the documents inside `/docs` before making changes.

Never make assumptions.

---

# Product Goal

Build a scalable Queue Management platform where every business gets its own isolated workspace.

Supported businesses include:

- Hospitals
- Clinics
- Banks
- Salons
- Government Offices
- Colleges
- Schools
- Restaurants
- Service Centers

Every organization manages only its own data.

---

# Development Principles

Always:

- Reuse existing code.
- Preserve working functionality.
- Prefer extending instead of rewriting.
- Keep implementations simple.
- Keep responses concise.
- Follow existing architecture.
- Use production-ready code only.

Never:

- Rewrite the project.
- Break existing features.
- Duplicate logic.
- Add placeholder code.
- Add unnecessary libraries.
- Hardcode secrets.
- Use localhost URLs in production.

---

# Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Node.js
- Express

Database

- MongoDB
- Mongoose

Authentication

- JWT
- bcrypt

Realtime

- Socket.IO

Deployment

- Vercel
- Render
- MongoDB Atlas

---

# Documentation

Read these files when implementing features:

PROJECT_SPEC.md

ARCHITECTURE.md

DATABASE.md

API_SPEC.md

AUTHORIZATION.md

UI_GUIDELINES.md

FEATURES.md

DEPLOYMENT.md

ROADMAP.md

CODING_RULES.md

---

# Coding Rules

Always:

- Mobile-first
- Responsive
- Accessible
- Secure
- Modular
- Reusable

Prefer modifying existing files over creating new ones.

Use environment variables.

Protect private routes.

Validate all input.

Hash passwords.

Use role-based authorization.

---

# User Roles

- Super Admin
- Organization Admin
- Staff
- Customer (No Login)

---

# Product Standard

The final product should feel like a commercial SaaS.

Reference quality:

- Stripe
- Linear
- Vercel
- Notion
- Clerk

---

# AI Instructions

Before writing code:

1. Read the relevant documentation.
2. Reuse existing components.
3. Keep changes minimal.
4. Preserve business logic.
5. Return concise output.