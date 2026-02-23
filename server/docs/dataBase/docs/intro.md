---
id: intro
title: Database Documentation
sidebar_label: Home
sidebar_position: 1
slug: /
---

# Trash Management SaaS - Database Documentation

Welcome to the complete technical documentation for the **Trash Management System** database. This documentation covers 22 tables across 7 functional domains with production-grade schemas, workflows, and optimization strategies.

---

## What's Covered

This documentation provides comprehensive coverage for:

- ✅ **22 Database Tables** with complete schemas, constraints, and relationships
- ✅ **7 Functional Domains** (User Auth, Complaints, Routing, Attendance, Quiz, Rating, Geographic Hierarchy)
- ✅ **8 ENUM Types** with state machines and validation rules
- ✅ **Performance Optimization** strategies (indexing, partitioning, caching)
- ✅ **Security Patterns** (Bcrypt/SHA-256 hashing, RBAC, GDPR compliance)
- ✅ **ERD Diagram** showing complete entity relationships

---

## Database Architecture

![Database ERD](/img/database_diagram.png)

**Complete Entity Relationship Diagram** showing all tables, foreign keys, and domain organization.

---

## Quick Start

### For New Team Members

1. Start with [**Overview**](overview.md) to understand the 7 domains and timezone conventions
2. Review [**Architecture**](architecture.md) for design principles and data flows
3. Explore domain-specific workflows (e.g., [User Authentication](domains/user-auth.md))
4. Reference individual [**Table Documentation**](tables/role.md) as needed

### For Architects/DBAs

1. Review [**Architecture**](architecture.md) for ERD and design principles
2. Study [**Performance**](performance.md) for indexing and optimization strategies
3. Examine [**ENUM Types**](enums.md) for state machines and validation
4. Deep-dive into domain workflows ([Complaints](domains/complaints.md), [Quiz System](domains/quiz-certification.md))

### For Developers

1. Read [**Overview**](overview.md) for conventions (UTC timezone, FK relationships)
2. Navigate to relevant domain:
   - Authentication: [User Auth Domain](domains/user-auth.md)
   - Complaints: [Complaints Domain](domains/complaints.md)
   - Worker Management: [Routing & Assignment](domains/routing-assignment.md)
3. Reference specific tables:
   - User data: [users](tables/users.md), [role](tables/role.md)
   - Attendance: [attendance](tables/attendance.md), [geo_attendance](tables/geo_attendance.md)
   - Geography: [Geographic Hierarchy](tables/geographic-hierarchy.md)

---

## Documentation Structure

### Core Documentation

| Document | Description |
|----------|-------------|
| [Overview](overview.md) | Database domains, timezone conventions, relationships, security |
| [Architecture](architecture.md) | ERD reference, design principles, ASCII data flows, HA topology |
| [Enums](enums.md) | 8 ENUM types with state machines and validation rules |
| [Performance](performance.md) | Indexing strategies, partitioning, caching, query optimization |

### Domain Documentation

| Domain | Key Concepts | Tables |
|--------|--------------|--------|
| [User Authentication](domains/user-auth.md) | RBAC, passwordless OTP auth, JWT sessions | role, users, auth_otp |
| [Complaints](domains/complaints.md) | 3-tier escalation workflow, task assignment | resident_complaints, immediate_tasks |
| [Routing & Assignment](domains/routing-assignment.md) | 5-tier geographic hierarchy, worker assignments | district→zone→ward→street→route, trashman_assignment |
| [Attendance](domains/attendance.md) | Dual-mode verification (GEO_SELFIE vs MANUAL) | attendance, geo_attendance |
| [Quiz & Certification](domains/quiz-certification.md) | Knowledge assessments, answer immutability | question_db, quiz_management, quiz_history |
| [Rating & Feedback](domains/rating-feedback.md) | QR/OTP verification, resident feedback | rating_auth, rating |

### Table Reference

All 22 tables organized by category:
- **Authentication:** [role](tables/role.md), [users](tables/users.md), [auth_otp](tables/auth_otp.md)
- **Geography:** [Geographic Hierarchy](tables/geographic-hierarchy.md) (7 tables)
- **Worker Management:** [trashman_assignment](tables/trashman_assignment.md), [division_officers](tables/division_officers.md)
- **Attendance:** [attendance](tables/attendance.md), [geo_attendance](tables/geo_attendance.md)
- **Complaints:** [resident_complaints](tables/resident_complaints.md), [immediate_tasks](tables/immediate_tasks.md)
- **Quiz:** [question_db](tables/question_db.md), [quiz_total_score_time](tables/quiz_total_score_time.md), [quiz_management](tables/quiz_management.md), [quiz_history](tables/quiz_history.md)
- **Rating:** [rating_auth](tables/rating_auth.md), [rating](tables/rating.md)

---

## Key Design Patterns

### 1. UTC Timezone Convention
All `TIMESTAMP` columns store **UTC**. Convert to local time in frontend.

```sql
-- Backend stores UTC
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

-- Frontend displays local
const localTime = new Date(utcTimestamp).toLocaleString();
```

### 2. Answer Immutability (Quiz System)
`quiz_history.correct_answer` copied from `question_db.correct_option` when quiz starts to protect past scores if admin edits questions.

### 3. Dual Verification (Rating System)
- **QR Code:** SHA-256 hash (24h expiry) for in-person ratings
- **OTP:** Bcrypt hash (10min expiry) for remote ratings

### 4. Cascade Delete
```sql
-- Geo-attendance auto-deleted if attendance record rejected
CONSTRAINT fk_geo_attendance 
  FOREIGN KEY (att_id) REFERENCES attendance(att_id) 
  ON DELETE CASCADE
```

### 5. 3-Tier Escalation (Complaints)
```
SUPERVISOR (Level 1)
    ↓ decline → escalate
   SI (Level 2)
    ↓ decline → escalate
  MHO (Level 3 - final)
```

---

## Database Statistics

- **Total Tables:** 22
- **ENUM Types:** 8
- **Functional Domains:** 7
- **Foreign Key Relationships:** 40+
- **Database Engine:** MySQL 8.0+ / TiDB Cloud
- **Documentation Files:** 26

---

## Related Resources

- **Backend API Documentation:** [OpenAPI Spec](http://localhost:5000/api-docs) - 30 REST endpoints with Swagger UI
- **Frontend Documentation:** [Client Docs](http://localhost:3000) - React component library and usage guides
- **Source of Truth:** `server/reference/db.reference` - Complete schema reference file

---

## Navigation Tips

- Use the **sidebar** (left) to navigate between documents
- **Search** functionality (top right) to find specific topics
- **Links** within docs jump to related sections
- **Code blocks** include SQL queries ready to copy/paste

---

## Support

For database schema questions or migration assistance:
- **Schema Reference:** `server/reference/db.reference`
- **Backend Architecture:** `server/backend.reference`
- **API Documentation:** `server/docs/api/`

---

**Last Updated:** February 2026  
**Database Version:** MySQL 8.0+ / TiDBCloud Compatible  
**Documentation Format:** Docusaurus v3.9.2
