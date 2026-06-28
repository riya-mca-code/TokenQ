# TokenQ Authorization

## Authentication

Use JWT.

Passwords must be hashed using bcrypt.

All private routes require authentication.

Unauthenticated users → Login.

---

# Roles

SUPER_ADMIN

OWNER

ADMIN

STAFF

CUSTOMER

Customer has no account.

---

# Route Access

Public

/

/features

/pricing

/contact

/login

/register

/forgot-password

/customer

/queue

Public Display

Authenticated

/profile

/logout

Super Admin

/superadmin

Owner / Admin

/dashboard

/analytics

/settings

/reports

/users

/counters

Staff

/dashboard

/queue

/call

/complete

/skip

/search

---

# Permissions

## SUPER_ADMIN

✔ Manage Organizations

✔ Create Organizations

✔ Suspend Organizations

✔ Delete Organizations

✔ Platform Analytics

✔ Audit Logs

✔ System Settings

✔ Plans

✔ Reports

---

## OWNER / ADMIN

✔ Dashboard

✔ Analytics

✔ Reports

✔ Queue

✔ Staff

✔ Customers

✔ Counters

✔ Export

✔ Reset Queue

✔ Settings

✖ Cannot manage platform

---

## STAFF

✔ View Queue

✔ Search

✔ Call Next

✔ Complete

✔ Skip

✔ Recall

✔ View Customers

✖ Analytics

✖ Reports

✖ Reset Queue

✖ Manage Users

✖ Settings

---

## CUSTOMER

✔ Generate Token

✔ View Own Token

✔ Track Queue

✖ Dashboard

✖ Analytics

✖ Admin Pages

---

# Organization Isolation

Every authenticated request must verify:

organizationId

Never allow access to another organization.

Always filter database queries by:

organizationId

---

# Middleware Order

Request

↓

JWT

↓

Role

↓

Organization

↓

Validation

↓

Controller

---

# Route Middleware

Public

None

Authenticated

auth()

Staff

auth()

staff()

Owner / Admin

auth()

admin()

Super Admin

auth()

superAdmin()

---

# JWT Payload

id

organizationId

role

email

iat

exp

---

# Login Flow

Login

↓

Verify Password

↓

Generate JWT

↓

Return Token

↓

Protected Routes

↓

Verify JWT

↓

Role Check

↓

Organization Check

↓

Controller

---

# Logout

Invalidate client session.

Remove token.

---

# Security Rules

Never trust frontend role.

Always verify on backend.

Never expose hidden pages.

Never rely on UI to protect data.

Every API must validate:

Authentication

Role

Organization

Ownership

---

# Customer Rules

One active token per phone number within the same organization.

Customer can only access their own token.

---

# Staff Rules

Staff only sees customers inside their organization.

Cannot modify organization settings.

Cannot delete history.

---

# Admin Rules

Admin manages only their own organization.

Cannot access another organization.

Cannot access Super Admin APIs.

---

# Super Admin Rules

Super Admin bypasses organization filtering only when accessing platform resources.

Never expose Super Admin APIs publicly.

---

# Default Response

401

Not Authenticated

403

Access Denied

404

Not Found

409

Conflict

422

Validation Error

500

Internal Server Error
