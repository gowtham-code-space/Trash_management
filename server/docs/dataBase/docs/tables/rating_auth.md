# Table: `rating_auth`

**Purpose:** Store QR code/OTP verification sessions for resident feedback authentication

---

## Table Structure

```sql
CREATE TABLE rating_auth (
    auth_id BIGINT PRIMARY KEY,
    worker_id BIGINT,
    rating_method ENUM('QR', 'OTP'),
    qr_hash VARCHAR(255),
    otp_hash VARCHAR(255),
    is_used TINYINT(1) DEFAULT 0,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rating_auth_worker FOREIGN KEY (worker_id) REFERENCES users(user_id)
);
```

---

## Columns

| Column | Type | Constraints | Description |
|--------|------|------------|-------------|
| `auth_id` | BIGINT | PRIMARY KEY | Unique authentication session ID |
| `worker_id` | BIGINT | FOREIGN KEY → users(user_id) | Worker being rated (TRASH_MAN role) |
| `rating_method` | ENUM | NOT NULL | Verification type: 'QR' or 'OTP' - see [enums](../enums.md#rating_method) |
| `qr_hash` | VARCHAR(255) | NULL | SHA-256 hash of QR code token (if method=QR) |
| `otp_hash` | VARCHAR(255) | NULL | Bcrypt hash of 6-digit OTP (if method=OTP) |
| `is_used` | TINYINT(1) | DEFAULT 0 | 0 = unused, 1 = rating submitted |
| `expires_at` | TIMESTAMP | NOT NULL | Session expiry (UTC): QR=24h, OTP=10min |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session creation time (UTC) |

---

## Foreign Key Relationships

### Parent Tables

| FK | References | Description |
|----|-----------|-------------|
| `worker_id` | [users](users.md).user_id | Worker being rated |

### Child Tables

| Table | FK Column | Description |
|-------|-----------|-------------|
| [rating](rating.md) | auth_id | Ratings submitted via this auth session |

---

## Dual Verification Methods

### Method 1: QR Code (In-Person Rating)

**Flow:**
1. Worker generates QR code for their route
2. Backend creates `rating_auth` with SHA-256 hash of random token
3. QR code displayed to worker (embedded with `auth_id` + token)
4. Resident scans QR, enters token
5. Backend validates hash, allows rating submission

**Hash Algorithm:** SHA-256 (fast verification, long token reduces collision risk)

```sql
-- Generate QR session
INSERT INTO rating_auth (worker_id, rating_method, qr_hash, expires_at)
VALUES (?, 'QR', SHA2(?, 256), DATE_ADD(NOW(), INTERVAL 24 HOUR));
```

### Method 2: OTP (Remote Feedback)

**Flow:**
1. Resident requests feedback for worker (by phone/email)
2. Backend generates 6-digit OTP, stores Bcrypt hash
3. OTP sent via SMS/email to resident
4. Resident enters OTP + rating
5. Backend verifies hash, allows rating submission

**Hash Algorithm:** Bcrypt (secure for short codes, protects against brute-force)

```sql
-- Generate OTP session
INSERT INTO rating_auth (worker_id, rating_method, otp_hash, expires_at)
VALUES (?, 'OTP', ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE));
```

---

## Common Queries

### Generate QR Session

```sql
INSERT INTO rating_auth (worker_id, rating_method, qr_hash, expires_at)
VALUES (?, 'QR', SHA2(?, 256), DATE_ADD(NOW(), INTERVAL 24 HOUR));
```

### Generate OTP Session

```sql
INSERT INTO rating_auth (worker_id, rating_method, otp_hash, expires_at)
VALUES (?, 'OTP', ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE));
```

### Validate QR Code

```sql
SELECT * FROM rating_auth
WHERE auth_id = ?
  AND qr_hash = SHA2(?, 256)
  AND is_used = 0
  AND expires_at > NOW();
```

### Validate OTP (with Bcrypt in Node.js)

```javascript
// Fetch record
const authRecord = await db.query(
    'SELECT * FROM rating_auth WHERE auth_id = ? AND is_used = 0 AND expires_at > NOW()',
    [authId]
);

// Verify OTP hash
const isValid = await bcrypt.compare(userInputOTP, authRecord.otp_hash);
```

### Mark as Used (After Rating Submitted)

```sql
UPDATE rating_auth
SET is_used = 1
WHERE auth_id = ?;
```

### Cleanup Expired Sessions

```sql
DELETE FROM rating_auth
WHERE expires_at < NOW() AND is_used = 0;
```

---

## Recommended Indexes

```sql
-- Validate QR/OTP (filter by auth_id + expiry + usage)
CREATE INDEX idx_rating_auth_validation 
ON rating_auth(auth_id, is_used, expires_at);

-- Worker's active sessions
CREATE INDEX idx_rating_auth_worker 
ON rating_auth(worker_id, is_used);
```

---

## Business Rules

1. **Mutually Exclusive Hashes:** Either `qr_hash` OR `otp_hash` must be set (never both)
2. **Single-Use:** Once rating submitted, `is_used = 1` prevents duplicate ratings
3. **Expiry:**
   - **QR:** 24 hours (allows worker to display code throughout shift)
   - **OTP:** 10 minutes (short-lived for security)
4. **Role Restriction:** `worker_id` must be TRASH_MAN role (enforced at API layer)
5. **Session Cleanup:** Cron job deletes expired unused sessions daily
6. **Hash Selection Rationale:**
   - **SHA-256 for QR:** Fast verification, long token (UUID) makes brute-force impractical
   - **Bcrypt for OTP:** Slow hashing protects 6-digit code from brute-force attacks

---

## Performance Considerations

- **Index on Validation:** Composite index on `(auth_id, is_used, expires_at)` optimizes verification queries
- **Cleanup Automation:** Schedule nightly cron job to purge expired sessions
- **Rate Limiting:** Limit OTP generation to 3 requests per worker per hour (prevent spam)

---

## Related Documentation

- [Domain: Rating & Feedback](../domains/rating-feedback.md) - Complete QR/OTP workflows with diagrams
- [Table: rating](rating.md) - Ratings submitted via this auth
- [Table: users](users.md) - Worker being rated
- [Enums: rating_method](../enums.md#rating_method) - QR vs OTP values
