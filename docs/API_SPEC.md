# TokenQ API Specification

## Base URL

/api/v1

Response

{
  success: boolean,
  message: string,
  data: object
}

Errors

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

409 Conflict

422 Validation Error

500 Internal Server Error

---

# Authentication

POST /auth/register

Create Organization + Admin

Public

---

POST /auth/login

Login

Public

---

POST /auth/logout

Authenticated

---

POST /auth/refresh

Authenticated

---

POST /auth/forgot-password

Public

---

POST /auth/reset-password

Public

---

GET /auth/me

Authenticated

Returns logged in user.

---

# Organization

GET /organizations

Super Admin

---

POST /organizations

Super Admin

---

GET /organizations/:id

Super Admin

---

PATCH /organizations/:id

Super Admin

---

DELETE /organizations/:id

Super Admin

---

# Users

GET /users

Admin

---

POST /users

Admin

Create Staff

---

PATCH /users/:id

Admin

---

DELETE /users/:id

Admin

---

# Customers

GET /customers

Staff/Admin

---

POST /customers

Customer

Create customer + token.

---

GET /customers/:id

Staff/Admin

---

PATCH /customers/:id

Admin

---

# Queue

GET /queue

Staff/Admin

---

POST /queue/token

Customer

Generate Token

---

GET /queue/current

Public

Current Serving Token

---

POST /queue/call

Staff

Call Next

---

POST /queue/complete

Staff

Complete Token

---

POST /queue/skip

Staff

Skip Token

---

POST /queue/recall

Staff

Recall Token

---

POST /queue/reset

Admin

---

# Counters

GET /counters

Admin

---

POST /counters

Admin

---

PATCH /counters/:id

Admin

---

DELETE /counters/:id

Admin

---

# Analytics

GET /analytics/dashboard

Admin

---

GET /analytics/daily

Admin

---

GET /analytics/monthly

Admin

---

# Reports

GET /reports

Admin

---

GET /reports/export/csv

Admin

---

GET /reports/export/pdf

Admin

---

# Notifications

GET /notifications

Authenticated

---

POST /notifications/send

Admin

---

# Audit Logs

GET /audit

Super Admin

---

# Socket Events

token-created

token-called

token-completed

token-skipped

queue-updated

counter-updated

analytics-updated

notification

---

# Validation

JWT required for all private routes.

Role middleware required.

Organization middleware required.

Validate request body before controller.

Never expose stack traces.

Always return consistent JSON.

Filter every query using organizationId.