# Database Overview

## Introduction

The Trash Management System database is a comprehensive relational schema designed to support municipal waste management operations across multiple user roles, geographical hierarchies, and operational workflows. This production-grade schema manages authentication, complaint tracking, route assignments, attendance verification, educational quizzes, and performance ratings.

## Database Information

- **Database Name:** `trash_management_test`
- **Engine:** MySQL 8.0+ / TiDB Cloud
- **Timezone Strategy:** All `DATETIME` columns store UTC timestamps
- **Character Set:** UTF-8 (utf8mb4)
- **Collation:** utf8mb4_unicode_ci
- **Total Tables:** 22 tables across 7 functional domains

## Timezone Convention

**Critical Implementation Detail:**

All temporal data follows a strict UTC-based storage and conversion protocol:

### Server-Side (Backend)
- All `DATETIME` inserts use `UTC_TIMESTAMP()` function
- No local timezone adjustments occur at database level
- Queries filter by UTC ranges
- Stored format: `YYYY-MM-DD HH:MM:SS` (UTC)

### Client-Side (Frontend)
- Backend serves ISO 8601 formatted timestamps: `2026-02-19T05:55:17.000Z`
- Browser automatically converts to user's local timezone
- Display formatting handled by JavaScript `Date` objects
- No manual timezone math required in application code

### Benefits
- Eliminates daylight saving time ambiguity
- Supports global user base across timezones
- Simplifies audit trails and temporal queries
- Ensures consistent sorting and filtering

---

## Schema Domains

The database is logically partitioned into seven interconnected domains:

### 1. User Authentication & Authorization
**Tables:** `role`, `users`, `auth_otp`

Manages user identity, role-based access control (RBAC), and OTP-based authentication. Supports 7 distinct roles from residents to commissioners.

**Key Features:**
- Email-based OTP authentication (no passwords stored)
- JWT refresh token hashing for session management
- Signup completion tracking
- Profile picture and address management

---

### 2. Complaint Management
**Tables:** `resident_complaints`, `immediate_tasks`

Tracks resident-submitted waste management complaints including images, geolocation, and escalation workflows.

**Key Features:**
- Multi-level approval system (SUPERVISOR → SI → MHO)
- Accept/decline voting mechanism
- Status-based state transitions
- Geographic coordinate storage (lat/lon)
- Task assignment to field workers

---

### 3. Routing & Assignment
**Tables:** `route`, `trashman_assignment`, `street_divisions`

Defines waste collection routes, schedules, and assigns trash workers to specific geographic divisions.

**Key Features:**
- Time-windowed route definitions (start_time, end_time)
- Active/inactive route toggles
- Many-to-many street-to-division-to-route mapping
- Historical assignment tracking

---

### 4. Attendance Tracking
**Tables:** `attendance`, `geo_attendance`

Records clock-in/clock-out events with optional geo-tagged selfie verification.

**Key Features:**
- Dual mode support: GEO_SELFIE (image-based) and MANUAL (supervisor-entered)
- Verification workflow with approver tracking
- Cloudinary-stored geolocation images
- Audit trail for compliance

---

### 5. Quiz & Certification System
**Tables:** `question_db`, `quiz_total_score_time`, `quiz_management`, `quiz_history`

Educational quiz platform with timed exams, pass/fail grading, and PDF certificate generation.

**Key Features:**
- Multiple-choice questions (A/B/C/D)
- Configurable time limits and pass marks
- Real-time answer tracking with "marked for review" flags
- Automatic certificate URL generation on passing
- Complete answer history preservation

---

### 6. Administrative Geographic Hierarchy
**Tables:** `district`, `zone`, `ward`, `ward_divisions`, `street`, `division_officers`

Four-tier geographic structure: District → Zone → Ward → Division → Street

**Key Features:**
- Role-based officer assignments per division
- Cascading foreign key relationships
- Support for multi-district deployments
- Officer active/inactive status tracking

---

### 7. Rating & Feedback
**Tables:** `rating`, `rating_auth`

Bi-directional rating system allowing residents to rate workers and vice versa, secured by OTP or QR code verification.

**Key Features:**
- From-user to to-user rating relationships
- Dual authentication modes (QR hash or OTP hash)
- Time-bound rating sessions (expire_at)
- Detailed feedback text storage
- Prevents duplicate/fraudulent ratings

---

## Key Relationships

### Primary Foreign Key Chains

**User-Centric Relationships:**
```
role (1) ──→ (N) users ──→ (N) auth_otp
                     ├──→ (N) attendance ──→ (1) geo_attendance
                     ├──→ (N) resident_complaints ──→ (N) immediate_tasks
                     ├──→ (N) trashman_assignment
                     ├──→ (N) division_officers
                     ├──→ (N) quiz_management ──→ (N) quiz_history
                     └──→ (N) rating (as from_user_id or to_user_id)
```

**Geographic Hierarchy:**
```
district (1) ──→ (N) zone (1) ──→ (N) ward ──→ (N) ward_divisions ──→ (N) street_divisions
                                         └──→ (N) street ──────────────┘
                                         
ward_divisions (1) ──→ (N) division_officers
street_divisions: links (division, street, route)
```

**Workflow Chains:**
```
Complaint Lifecycle:
users ──→ resident_complaints ──→ immediate_tasks ──→ users (assigned_to)

Quiz Lifecycle:
users ──→ quiz_management ──→ quiz_history ──→ question_db
         │
         └──→ quiz_total_score_time (config)

Rating Lifecycle:
users ──→ rating ──→ rating_auth (QR/OTP session)
```

---

## Data Integrity Constraints

### Foreign Key Enforcement

All foreign key relationships are enforced with `ON DELETE RESTRICT` (default), preventing orphaned records. Critical relationships:

- `users.role_id` → `role.role_id` (cannot delete role if users exist)
- `quiz_management.quiz_id` → `quiz_history.quiz_id` (preserves answer history)
- `resident_complaints.complaint_id` → `immediate_tasks.complaint_id` (preserves task records)
- `attendance.att_id` → `geo_attendance.att_id` (cascading delete recommended)

### Unique Constraints

- `users.email` - Prevents duplicate accounts
- `users.phone_number` - Enforces one phone per user
- `district.district_name` - Unique district names

### Nullable vs Non-Nullable Strategy

**Always NULL allowed:**
- `users.refresh_token_hash` - NULL on logout
- `quiz_management.completed_at` - NULL until quiz submitted
- `quiz_history.user_answer` - NULL if question unanswered
- `rating_auth.otp_hash` / `qr_hash` - One of two must be populated

**Never NULL:**
- All `created_at` timestamps (audit requirement)
- All primary and foreign keys (referential integrity)
- Status enums (always have a defined state)

---

## Scalability Considerations

### High-Volume Tables

**Expected Growth Patterns:**

1. **quiz_history** - Grows by (questions_per_quiz × total_quizzes) → High write + high archival needs
2. **attendance** - Daily growth proportional to workforce size → Partition by year recommended
3. **resident_complaints** - Moderate growth, high read (dashboards) → Read replicas beneficial
4. **auth_otp** - High insert rate, low retention need → TTL-based cleanup every 24 hours

### Indexing Priorities

**Critical Indexes (must have):**
- `users.email`, `users.phone_number` (authentication queries)
- `auth_otp.identifier` + `expires_at` (OTP verification)
- `resident_complaints.user_id` + `complaint_status` (dashboard filters)
- `quiz_management.user_id` + `created_at` (history pagination)
- `attendance.user_id` + `created_at` (date range queries)

**Composite Indexes:**
- `(ward_id, street_id)` on `street_divisions`
- `(complaint_id, status)` on `immediate_tasks`
- `(user_id, is_active)` on `trashman_assignment`

---

## Security & Compliance

### Sensitive Data

**PII (Personally Identifiable Information):**
- `users.email`, `users.phone_number` - Must be encrypted at rest (TDE recommended)
- `users.first_name`, `users.last_name` - Subject to GDPR/data privacy laws
- `users.profile_pic` - Stored as Cloudinary URLs (external), not in DB

**Authentication Secrets:**
- `auth_otp.otp_hash` - Bcrypt hashed, never stored in plaintext
- `users.refresh_token_hash` - SHA-256 hashed JWT signatures
- `rating_auth.qr_hash`, `rating_auth.otp_hash` - Temporary session tokens

### Audit Trail

**Immutable Timestamp Fields:**
- All `created_at` columns provide audit trail anchors
- `users.last_address_change` tracks compliance with address update policies
- `quiz_management.completed_at` proves certification date

**Recommended Additions for Production:**
- `updated_at` columns on mutable tables (`users`, `resident_complaints`)
- `deleted_at` for soft deletes (GDPR "right to be forgotten")
- Trigger-based audit log table for complaint status changes

---

## Migration & Versioning

### Schema Evolution Strategy

**Current Version:** 1.0.0

**Backward Compatibility:**
- All enum expansions must append new values (never reorder)
- New columns must be nullable or have defaults
- Foreign key additions require data backfill validation

**Planned Extensions:**
```sql
-- Future multi-tenancy support
ALTER TABLE users ADD COLUMN organization_id BIGINT AFTER user_id;

-- Soft delete support
ALTER TABLE resident_complaints ADD COLUMN deleted_at DATETIME NULL;

-- Internationalization
ALTER TABLE question_db ADD COLUMN language_code VARCHAR(5) DEFAULT 'en';
```

---

## Performance Benchmarks

### Expected Query Patterns

**High-Frequency Reads (>1000 QPS):**
- `SELECT * FROM users WHERE email = ?` (authentication)
- `SELECT * FROM auth_otp WHERE identifier = ? AND expires_at > UTC_TIMESTAMP()` (OTP validation)
- `SELECT * FROM resident_complaints WHERE user_id = ? ORDER BY created_at DESC` (user dashboard)

**Moderate-Frequency Writes (100-500 QPS):**
- `INSERT INTO attendance` (daily clock-ins)
- `UPDATE quiz_history SET user_answer = ? WHERE history_id = ?` (quiz-taking)
- `INSERT INTO rating` (post-service feedback)

**Low-Frequency, High-Impact Writes:**
- `UPDATE users SET refresh_token_hash = ?` (login sessions)
- `UPDATE resident_complaints SET complaint_status = ?` (status escalation)

### Recommended Hardware

**Minimum Production Specs:**
- TiDB Cloud: 2 vCPU, 4GB RAM (for &lt;10,000 users)
- MySQL 8.0: 4 vCPU, 16GB RAM, SSD storage
- Connection pool: 50-100 max connections per app instance

**Horizontal Scaling:**
- Read replicas for analytics queries (rating aggregations, dashboard stats)
- Sharding by `district_id` if multi-city deployment exceeds 100,000+ users

---

## Data Retention Policies

### Short-Term Retention (24-48 hours)
- `auth_otp` records (delete after use or expiration)
- `rating_auth` sessions (delete after rating submission)

### Medium-Term Retention (90 days - 1 year)
- `attendance` records (archive to cold storage quarterly)
- `geo_attendance` images (delete after attendance verified)

### Long-Term Retention (Indefinite)
- `users` profiles (permanent, with GDPR deletion rights)
- `resident_complaints` history (regulatory compliance)
- `quiz_management` + `quiz_history` (certification proof)
- `rating` records (performance analytics)

### Recommended Archival Strategy
```sql
-- Archive old attendance to separate table
CREATE TABLE attendance_archive LIKE attendance;
INSERT INTO attendance_archive 
  SELECT * FROM attendance WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 YEAR);
DELETE FROM attendance WHERE created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 YEAR);
```

---

## Integration Points

### External Dependencies

**Cloudinary (Asset Storage):**
- `users.profile_pic` - User avatars
- `resident_complaints.complaint_image` - Issue photos
- `geo_attendance.geo_img` - Geolocation selfies
- `quiz_management.certificate_url` - PDF certificates

**Email Service (OTP Delivery):**
- `auth_otp.identifier` contains recipient email
- OTP sent via backend email service (Nodemailer/SendGrid)

**PDF Generation (Certificates):**
- Generated server-side using PDFKit/Canvas
- Uploaded to Cloudinary
- URL stored in `quiz_management.certificate_url`

---

## Disaster Recovery

### Backup Strategy

**Daily Full Backups:**
- All tables except `auth_otp` (transient data)
- Retention: 30 days

**Hourly Incremental Backups:**
- `users`, `resident_complaints`, `quiz_management` (critical data)
- Retention: 7 days

**Point-in-Time Recovery:**
- MySQL binary logs enabled
- Recovery window: 7 days

### Replication Setup

**Master-Slave Configuration:**
```
Primary (Write)  ──→  Replica 1 (Read)
                 └──→  Replica 2 (Analytics)
```

**Failover Protocol:**
- Automated health checks every 30 seconds
- Replica promotion within 60 seconds of primary failure
- Connection string managed via service discovery (Consul/etcd)

---

## Next Steps

For detailed schema documentation:

- **[Architecture](./architecture.md)** - Visual ERD and relationship diagrams
- **[Enums Reference](./enums.md)** - Complete enum value specifications
- **[Performance Optimization](./performance.md)** - Indexing and query tuning
- **[Domain Documentation](./domains/)** - Business logic by functional area
- **[Table Specifications](./tables/)** - Column-level documentation per table

---

## Changelog

### Version 1.0.0 (Current)
- Initial production schema
- 22 tables across 7 functional domains
- UTC timezone standardization
- OTP-based authentication
- Multi-level complaint escalation
- Quiz certification system
- Bi-directional rating mechanism
