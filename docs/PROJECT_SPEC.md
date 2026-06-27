# TokenQ Product Specification

## Overview

TokenQ is a cloud-based, multi-tenant Queue Management SaaS.

Every organization gets its own secure workspace to manage customers, queues, staff, counters, reports and analytics.

No organization can access another organization's data.

---

# Target Businesses

- Hospital
- Clinic
- Bank
- Pharmacy
- Salon
- Restaurant
- College
- School
- Government Office
- Service Center
- Custom Business

---

# Objectives

- Eliminate physical queues.
- Reduce customer waiting time.
- Provide real-time queue updates.
- Enable multi-counter operations.
- Support multiple organizations.
- Work on desktop, tablet and mobile.
- Be production-ready and scalable.

---

# User Roles

## Super Admin

Platform owner.

Permissions:

- Manage organizations
- Suspend organizations
- Delete organizations
- View platform analytics
- Manage subscriptions
- View audit logs
- System settings

---

## Organization Admin

Business owner.

Permissions:

- Dashboard
- Analytics
- Reports
- Queue management
- Staff management
- Counter management
- Organization settings
- Reset queue
- Export reports

---

## Staff

Permissions:

- View queue
- Call next
- Complete token
- Skip token
- Recall token
- Search queue

Cannot:

- Reset queue
- Manage users
- View platform analytics

---

## Customer

No account required.

Customer provides:

- Name
- Mobile Number
- Email (optional)
- Purpose (optional)

Receives:

- Token
- Queue position
- Estimated wait
- Live status
- QR code

---

# Queue Lifecycle

Waiting

↓

Serving

↓

Completed

Alternative:

Waiting

↓

Skipped

↓

Recalled

↓

Completed

Additional statuses:

- Cancelled
- Missed

---

# Queue Types

- Normal
- Priority
- VIP
- Emergency
- Appointment
- Walk-in
- Senior Citizen

---

# Counters

Organizations can create multiple counters.

Each counter has assigned staff.

Customers are called from a specific counter.

---

# Customer Information

Each token stores:

- Customer Name
- Mobile Number
- Email
- Purpose
- Token Number
- Queue Status
- Counter
- Created Time
- Updated Time

---

# Privacy

Public display:

Show only:

- Token
- Counter

Never display personal information publicly.

---

# Real-Time

Use Socket.IO for:

- Queue updates
- Token status
- Customer tracking
- Dashboard refresh
- Counter updates

---

# Security

Use:

- JWT
- bcrypt
- Helmet
- Rate Limiting
- Input Validation
- Environment Variables

Every request must verify:

- Authentication
- User role
- Organization ownership

---

# Multi-Tenancy

Every resource belongs to one organization.

Isolation is mandatory.

All queries must filter by organizationId.

---

# Deployment

Frontend:

Vercel

Backend:

Render

Database:

MongoDB Atlas

Storage:

Cloudinary (future)

---

# Design

Light theme only.

Modern SaaS.

Responsive.

Mobile-first.

Accessible.

Professional.

---

# Success Criteria

A business should be able to:

1. Register.
2. Create staff.
3. Open counters.
4. Serve customers.
5. Track queues live.
6. View analytics.
7. Export reports.
8. Manage everything from one dashboard.

The project must be production-ready, secure, scalable and maintainable.