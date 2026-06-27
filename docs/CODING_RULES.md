# TokenQ Coding Rules

## Purpose

These rules apply to every change in this repository.

Always follow them before writing code.

---

# General Rules

- Never rewrite working code.
- Extend existing code whenever possible.
- Reuse existing components.
- Keep changes minimal.
- Prefer modification over replacement.
- Never duplicate logic.
- Never create placeholder code.
- Production-ready code only.

---

# Architecture

Follow the documented architecture.

Do not invent new patterns.

Keep:

Controller

↓

Service

↓

Model

↓

Database

Business logic belongs in services.

Routes should remain thin.

---

# Frontend

Use

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Rules

- Reuse components.
- Mobile First.
- Responsive.
- Accessible.
- Semantic HTML.
- No inline styles.
- No duplicate CSS.
- Light Theme only.

---

# Backend

Use

- Express
- TypeScript
- Mongoose

Rules

- REST API
- Async/Await
- Proper HTTP status codes
- Global error handler
- Validation before controller

---

# Database

Every collection must include

organizationId

createdAt

updatedAt

Never return data from another organization.

Always filter using:

organizationId

---

# Authentication

Use JWT.

Hash passwords using bcrypt.

Protect all private routes.

Never trust frontend authentication.

---

# Authorization

Always verify:

Authentication

↓

Role

↓

Organization

↓

Ownership

Never skip authorization checks.

---

# Validation

Validate every request.

Reject invalid input.

Never trust client data.

---

# Security

Use

Helmet

Rate Limiting

CORS

Environment Variables

Input Validation

Sanitize Inputs

Never expose secrets.

Never expose stack traces.

---

# Socket.IO

Emit events only after successful database updates.

Never emit invalid state.

---

# API

Use consistent responses.

Success

{
  success: true,
  data: {}
}

Error

{
  success: false,
  message: ""
}

---

# Components

Before creating a component:

Search existing components.

Reuse whenever possible.

Keep components:

Small

Reusable

Typed

Accessible

---

# Performance

Avoid unnecessary renders.

Lazy load when appropriate.

Keep bundle size small.

Do not add unnecessary libraries.

---

# Logging

Remove debug code.

Remove console.log.

Use structured logging.

---

# Code Style

Use

const

Arrow functions

Early return

Descriptive names

Meaningful comments only.

---

# File Rules

Do not rename files unnecessarily.

Do not move files without reason.

Modify only required files.

---

# Dependencies

Before installing a package:

Check whether an existing dependency solves the problem.

Avoid dependency bloat.

---

# Git

Small commits.

One feature per commit.

Clear commit messages.

---

# Testing

Verify before completion.

No TypeScript errors.

No console errors.

No broken imports.

No lint errors.

---

# Output

Keep responses concise.

Only report

- Modified files
- New files
- Manual setup

Avoid long explanations.