# TokenQ Security Guidelines

## Principles

Security is mandatory.

Every feature must follow secure-by-default practices.

Never sacrifice security for convenience.

---

# Authentication

Use JWT.

Hash passwords using bcrypt.

Never store plain-text passwords.

Never expose tokens in URLs.

Use secure HTTP-only cookies when applicable.

JWT must contain:

- id
- organizationId
- role
- email
- iat
- exp

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

Never trust frontend permissions.

Never expose hidden routes.

Protect every private API.

---

# Multi-Tenant Security

Every database query must filter by:

organizationId

Never allow cross-organization access.

Every CRUD operation must verify ownership.

---

# Password Policy

Minimum 8 characters.

Require:

- Uppercase
- Lowercase
- Number
- Special Character

Hash using bcrypt.

Never return passwords.

---

# Environment Variables

Store secrets only in:

.env

Never commit:

.env

API Keys

JWT Secret

Database URLs

Private Keys

---

# Input Validation

Validate every request.

Reject:

- Invalid IDs
- Empty required fields
- Invalid emails
- Invalid phone numbers
- Oversized payloads

Sanitize all user input.

---

# API Security

Use:

Helmet

Rate Limiter

CORS

Compression

Body Size Limits

Global Error Handler

Disable x-powered-by.

---

# Database Security

Validate ObjectIds.

Use indexes.

Prevent NoSQL Injection.

Never expose internal IDs unnecessarily.

Use transactions for critical operations.

---

# XSS Protection

Escape user content.

Sanitize HTML.

Never render raw HTML.

Use React safely.

---

# CSRF

Protect state-changing requests.

Use SameSite cookies when applicable.

Verify origin.

---

# File Uploads

Validate:

- MIME type
- Extension
- File size

Rename uploaded files.

Store outside application root.

Future:

Cloudinary

---

# Logging

Log:

Authentication

Authorization failures

Queue actions

Admin actions

Organization changes

Never log:

Passwords

JWT

Secrets

Sensitive customer data

---

# Audit Logs

Record:

User

Organization

Action

Timestamp

IP

User Agent

Entity

Every admin action should be auditable.

---

# Rate Limiting

Apply limits to:

Login

Registration

Generate Token

Password Reset

API

Prevent brute-force attacks.

---

# Error Handling

Return generic errors.

Never expose:

Stack traces

Database errors

Secrets

Internal paths

---

# Queue Security

One active token per phone number within the same organization.

Prevent duplicate submissions.

Validate queue status transitions.

---

# Session Security

Expire inactive sessions.

Invalidate tokens after logout when applicable.

Rotate secrets when compromised.

---

# Headers

Enable:

Helmet

CSP

X-Frame-Options

X-Content-Type-Options

Referrer-Policy

Permissions-Policy

HSTS (Production)

---

# Socket.IO Security

Authenticate before connection.

Verify JWT.

Verify organization.

Allow only authorized events.

Never broadcast private organization data.

Emit only to organization-specific rooms.

---

# Production Checklist

☐ JWT enabled

☐ Password hashing enabled

☐ Helmet enabled

☐ Rate limiting enabled

☐ CORS configured

☐ CSP configured

☐ Environment variables configured

☐ Input validation enabled

☐ Audit logs enabled

☐ Organization isolation verified

☐ HTTPS enabled

☐ No localhost URLs

☐ No debug code

☐ No console.log

☐ No hardcoded secrets

---

# Security Rules

Always:

- Validate
- Sanitize
- Authenticate
- Authorize
- Audit
- Encrypt
- Isolate

Never:

- Trust client data
- Expose secrets
- Skip authorization
- Skip validation
- Return sensitive information
- Bypass organization checks