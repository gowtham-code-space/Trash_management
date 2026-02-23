# Table: `users`

**Domain:** [User Authentication & Authorization](../domains/user-auth.md)  
**Purpose:** Store user accounts, profiles, and authentication metadata

---

## Table Structure

```sql
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY,
    role_id BIGINT,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    preferred_language VARCHAR(50),
    phone_number VARCHAR(15) UNIQUE,
    email VARCHAR(255) UNIQUE,
    profile_pic VARCHAR(255),
    district VARCHAR(100),
    ward_number INT,
    ward_name VARCHAR(255),
    street_name VARCHAR(255),
    house_number VARCHAR(255),
    last_address_change DATETIME,
    refresh_token_hash VARCHAR(255),
    has_completed_signup TINYINT(1) DEFAULT 0,
    created_at DATETIME,
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES role(role_id)
);
```

---

## Columns

| Column | Type | Null | Key | Default | Description |
|--------|------|------|-----|---------|-------------|
| `user_id` | BIGINT | NO | PK | AUTO_INCREMENT | Unique user identifier |
| `role_id` | BIGINT | YES | FK | NULL | User's role (FK to `role` table) |
| `first_name` | VARCHAR(100) | YES | - | NULL | User's first name |
| `last_name` | VARCHAR(100) | YES | - | NULL | User's last name |
| `preferred_language` | VARCHAR(50) | YES | - | NULL  Front| end i18n preference |
| `phone_number` | VARCHAR(15) | YES | UNIQUE | NULL | Contact phone (E.164 format) |
| `email` | VARCHAR(255) | YES | UNIQUE | NULL | User's email address (primary login) |
| `profile_pic` | VARCHAR(255) | YES | - | NULL | Cloudinary URL for profile image |
| `district` | VARCHAR(100) | YES | - | NULL | User's district (address field) |
| `ward_number` | INT | YES | - | NULL | Ward number (address field) |
| `ward_name` | VARCHAR(255) | YES | - | NULL | Ward name (address field) |
| `street_name` | VARCHAR(255) | YES | - | NULL | Street name (address field) |
| `house_number` | VARCHAR(255) | YES | - | NULL | House/building number |
| `last_address_change` | DATETIME | YES | - | NULL | Last address modification timestamp (UTC) |
| `refresh_token_hash` | VARCHAR(255) | YES | - | NULL | Bcrypt hash of JWT refresh token |
| `has_completed_signup` | TINYINT(1) | NO | - | 0 | Onboarding completion flag (0=incomplete, 1=complete) |
| `created_at` | DATETIME | YES | - | UTC_TIMESTAMP() | Account creation timestamp (UTC) |

---

## Primary Key

**Column:** `user_id`  
**Type:** BIGINT  
**Auto-Increment:** Yes

---

## Foreign Key Relationships

### References (N:1)

| Foreign Key | References | Constraint Name | Description |
|-------------|------------|-----------------|-------------|
| `role_id` | `role(role_id)` | `fk_users_role` | User's assigned role |

### Referenced By (1:N)

| Child Table | Child Column | Relationship | Description |
|-------------|--------------|--------------|-------------|
| `auth_otp` | `user_id` | 1:N (no FK) | OTP authentication sessions |
| `attendance` | `user_id` | 1:N | Attendance records (worker) |
| `attendance` | `verified_by` | 1:N | Attendance verifications (supervisor) |
| `trashman_assignment` | `user_id` | 1:N | Route assignments (workers) |
| `resident_complaints` | `user_id` | 1:N | Complaints submitted by user |
| `immediate_tasks` | `assigned_to` | 1:N | Tasks assigned to worker |
| `division_officers` | `user_id` | 1:N | Division-officer mappings |
| `quiz_management` | `user_id` | 1:N | Quiz attempts |
| `quiz_management` | `created_by` | 1:N | Quizzes created by admin |
| `rating` | `from_user_id` | 1:N | Ratings given by user |
| `rating` | `to_user_id` | 1:N | Ratings received by worker |
| `rating_auth` | `worker_id` | 1:N | Rating authentication sessions |

---

## Indexes

### Auto-Created Indexes

```sql
-- Primary key index
PRIMARY KEY (user_id)

-- Unique constraint indexes
UNIQUE INDEX idx_users_phone (phone_number)
UNIQUE INDEX idx_users_email (email)
```

### Recommended Indexes

```sql
-- Role-based filtering
CREATE INDEX idx_users_role ON users(role_id);

-- Login queries (email lookup)
CREATE INDEX idx_users_email_login ON users(email, role_id);

-- Signup completion status
CREATE INDEX idx_users_signup_status ON users(has_completed_signup, created_at);

-- Address filtering (geographic queries)
CREATE INDEX idx_users_location ON users(district, ward_name, street_name);
```

---

## Business Rules

1. **Unique Email:** One account per email address (enforced by UNIQUE constraint)
2. **Phone Number Format:** Must be E.164 format (e.g., +1234567890) - validated in application layer
3. **Email Validation:** Must match regex pattern (application validation)
4. **Profile Picture:** Stored as Cloudinary URL (e.g., https://res.cloudinary.com/.../avatar.jpg)
5. **Address Fields:** All optional (nullable) - residents provide full address, workers may omit
6. **Signup Flow:** `has_completed_signup = 0` until all required profile fields completed
7. **Refresh Token:** Bcrypt hash stored (never store plaintext tokens)

---

## Data Flow

### User Registration

```sql
-- Step 1: Create user with minimal data
INSERT INTO users (email, role_id, created_at)
VALUES ('user@example.com', 1, UTC_TIMESTAMP());
-- Returns user_id = 123

-- Step 2: Complete profile (triggered after OTP verification)
UPDATE users 
SET first_name = ?, 
    last_name = ?, 
    phone_number = ?, 
    has_completed_signup = 1
WHERE user_id = 123;
```

### User Login (Email + OTP)

```sql
-- Fetch user by email
SELECT user_id, email, role_id, has_completed_signup
FROM users
WHERE email = 'user@example.com';

-- After OTP verification, generate JWT (no password in DB)
-- Store refresh token hash
UPDATE users 
SET refresh_token_hash = ?
WHERE user_id = 123;
```

---

## Common Queries

### Fetch User Profile

```sql
SELECT 
    u.user_id,
    u.first_name,
    u.last_name,
    u.email,
    u.phone_number,
    u.profile_pic,
    r.role_name
FROM users u
JOIN role r ON u.role_id = r.role_id
WHERE u.user_id = ?;
```

### Find Workers in Division

```sql
SELECT u.*
FROM users u
JOIN trashman_assignment ta ON u.user_id = ta.user_id
JOIN street_divisions sd ON ta.route_id = sd.route_id
WHERE sd.division_id = ? AND u.role_id = 2;
```

### Search Users by Name

```sql
SELECT user_id, first_name, last_name, email, role_id
FROM users
WHERE CONCAT(first_name, ' ', last_name) LIKE '%John%'
LIMIT 20;
```

### Get Incomplete Signups

```sql
SELECT user_id, email, created_at
FROM users
WHERE has_completed_signup = 0
  AND created_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY)
ORDER BY created_at ASC;
```

---

## State Transitions

### Signup Completion

```
Created
(has_completed_signup = 0)
         ↓
OTP Verified + Profile Filled
         ↓
Completed
(has_completed_signup = 1)
```

### Address Update

```sql
-- Update address fields
UPDATE users 
SET district = ?, 
    ward_name = ?, 
    street_name = ?, 
    house_number = ?,
    last_address_change = UTC_TIMESTAMP()
WHERE user_id = ?;
```

**Note:** `last_address_change` tracks when address was last modified (for compliance/audit).

---

## Performance Considerations

### Query Optimization

**Problem:** Full table scan on name searches (`CONCAT(first_name, last_name) LIKE '%...'`)

**Solution:** Add virtual column + index (MySQL 5.7+)

```sql
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) 
AS (CONCAT(first_name, ' ', last_name)) VIRTUAL;

CREATE INDEX idx_users_full_name ON users(full_name);

-- Now use indexed search
SELECT * FROM users WHERE full_name LIKE 'John%';
```

### Address Denormalization

**Current:** Address fields stored as plain text (flexible but not relational)  
**Consideration:** If strict geographic hierarchy needed, replace with FK to `ward` table

**Alternative Schema:**

```sql
ALTER TABLE users 
ADD COLUMN ward_id BIGINT,
ADD CONSTRAINT fk_users_ward FOREIGN KEY (ward_id) REFERENCES ward(ward_id);
```

---

## Security Measures

### Sensitive Data

| Column | Sensitivity | Protection |
|--------|-------------|------------|
| `email` | High | UNIQUE, indexed, used for login |
| `phone_number` | Medium | UNIQUE, masked in API responses |
| `refresh_token_hash` | Critical | Bcrypt hash, never expose in API |
| `profile_pic` | Low | Public Cloudinary URL |
| Address fields | Medium | Optional, avoid exposing to unauthorized roles |

### GDPR Compliance

**Right to Erasure:**

```sql
-- Soft delete (preserve FK integrity)
UPDATE users 
SET email = CONCAT('deleted_', user_id, '@example.com'),
    phone_number = NULL,
    first_name = 'Deleted',
    last_name = 'User',
    profile_pic = NULL,
    refresh_token_hash = NULL
WHERE user_id = ?;

-- Hard delete (cascade to related records)
DELETE FROM users WHERE user_id = ?;
```

---

## Audit & Compliance

### Change Tracking (Recommended Enhancement)

```sql
CREATE TABLE users_audit (
    audit_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    changed_column VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT,
    changed_at DATETIME DEFAULT UTC_TIMESTAMP()
);
```

---

## Related Documentation

- [Domain: User Auth](../domains/user-auth.md) - Authentication workflows
- [Table: role](./role.md) - Role hierarchy
- [Table: auth_otp](./auth_otp.md) - OTP authentication
- [Enums](../enums.md) - Role enumeration
- [Architecture](../architecture.md) - Zero-trust auth model
- [Performance](../performance.md) - User query optimization
