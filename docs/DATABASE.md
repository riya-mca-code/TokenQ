# TokenQ Database Specification

## Database

MongoDB Atlas

ODM

Mongoose

---

# Rules

Every collection must include:

- organizationId
- createdAt
- updatedAt

Never allow cross-organization access.

Use ObjectId references.

Soft delete preferred.

---

# Collections

## Organization

Fields

- name
- slug
- businessType
- ownerName
- email
- phone
- logo
- address
- timezone
- status
- plan

Indexes

- slug (unique)
- email (unique)

---

## User

Fields

- organizationId
- name
- email
- password
- phone
- role
- status
- lastLogin

Roles

- SUPER_ADMIN
- ADMIN
- STAFF

Indexes

- email
- organizationId

---

## Customer

Fields

- organizationId
- name
- phone
- email
- purpose
- notes

Indexes

- organizationId
- phone

---

## Counter

Fields

- organizationId
- name
- number
- status
- assignedStaff

Status

- ACTIVE
- INACTIVE

---

## Token

Fields

- organizationId
- customerId
- counterId
- tokenNumber
- queueType
- status
- estimatedWait
- calledAt
- completedAt
- servedBy

Status

- WAITING
- SERVING
- COMPLETED
- SKIPPED
- MISSED
- CANCELLED

Queue Types

- NORMAL
- VIP
- PRIORITY
- APPOINTMENT
- EMERGENCY
- SENIOR

Indexes

- organizationId
- tokenNumber
- status

---

## Queue

Fields

- organizationId
- currentToken
- nextToken
- totalWaiting
- totalServing
- totalCompleted

---

## Notification

Fields

- organizationId
- customerId
- type
- message
- status

Types

- EMAIL
- SMS
- WHATSAPP
- PUSH

---

## Report

Fields

- organizationId
- date
- totalTokens
- completed
- missed
- avgWait
- avgService

---

## AuditLog

Fields

- organizationId
- userId
- action
- entity
- entityId
- ip
- userAgent

---

# Relationships

Organization

↓

Users

Customers

Counters

Tokens

Reports

Notifications

AuditLogs

Customer

↓

Token

Counter

↓

Token

User

↓

Counter

↓

Token

---

# Validation

Organization

Required

User

Required

Customer

Name required

Phone required

Token

Customer required

Counter required

Status required

---

# Constraints

One active token per phone number within the same organization.

Token numbers unique inside one organization.

Organization email unique.

User email unique.

Counter number unique inside organization.

---

# Query Rules

Every database query must filter by:

organizationId

Never return another organization's data.

---

# Soft Delete

Use:

deletedAt

Instead of permanent deletion where possible.

---

# Future Collections

- Branch
- Subscription
- Payment
- Invoice
- SupportTicket
- ActivityFeed