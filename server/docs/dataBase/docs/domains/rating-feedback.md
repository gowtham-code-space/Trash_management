# Rating & Feedback Domain

This domain manages resident feedback collection through secure rating sessions using QR code or OTP verification to prevent fraudulent reviews.

---

## Domain Overview

**Purpose:** Collect authentic resident feedback on worker performance  
**Key Feature:** Dual verification (QR hash OR OTP hash) to prevent spam/fake ratings  
**Tables:** 2 core tables (`rating_auth`, `rating`)  
**External Dependencies:** Cloudinary (QR code generation), Nodemailer (OTP email), Bcrypt (OTP hashing), SHA-256 (QR hashing)

---

## Tables in Domain

| Table | Purpose | Record Volume | Growth Rate |
|-------|---------|---------------|-------------|
| `rating_auth` | Rating session authentication | ~50,000 sessions | +200/day |
| `rating` | Verified ratings and feedback | ~40,000 ratings | +150/day |

---

## Rating Workflows

### Method 1: QR Code-Based Rating

**Use Case:** In-person feedback (resident scans worker's QR code)

**Workflow:**

```
WORKER                  BACKEND                  DATABASE
  │                        │                        │
  │ 1. Request rating QR   │                        │
  │    POST /rating/       │                        │
  │    generate-qr         │                        │
  ├───────────────────────→│                        │
  │                        │ 2. Generate token      │
  │                        │    (UUID v4)           │
  │                        │    token = "550e8400..."│
  │                        │                        │
  │                        │ 3. Hash token (SHA-256)│
  │                        │    hash = SHA256(token)│
  │                        │                        │
  │                        │ 4. INSERT rating_auth  │
  │                        ├───────────────────────→│
  │                        │ INSERT INTO            │
  │                        │ rating_auth            │
  │                        │ (worker_id,            │
  │                        │  qr_hash=<hash>,       │
  │                        │  expire_at=NOW()+24h)  │
  │                        │←───────────────────────┤
  │                        │  (auth_id=123)         │
  │                        │                        │
  │                        │ 5. Generate QR image   │
  │                        │    (Cloudinary/local)  │
  │                        │    Encode: token       │
  │                        │                        │
  │ 6. QR Code Image       │                        │
  │←───────────────────────┤                        │
  │    {qr_url: "data:...",│                        │
  │     auth_id: 123}      │                        │
  │                        │                        │


RESIDENT                BACKEND                  DATABASE
  │                        │                        │
  │ 7. Scan QR Code        │                        │
  │    (Decode token)      │                        │
  │                        │                        │
  │ 8. POST /rating/verify │                        │
  │    {token: "550e..."}  │                        │
  ├───────────────────────→│                        │
  │                        │ 9. Hash token          │
  │                        │    hash = SHA256(token)│
  │                        │                        │
  │                        │10. Fetch rating_auth   │
  │                        ├───────────────────────→│
  │                        │ SELECT * FROM          │
  │                        │ rating_auth            │
  │                        │ WHERE qr_hash=<hash>   │
  │                        │  AND expire_at>NOW()   │
  │                        │  AND rating_given_at   │
  │                        │   IS NULL              │
  │                        │←───────────────────────┤
  │                        │  (auth_id=123,         │
  │                        │   worker_id=456)       │
  │                        │                        │
  │11. Verification success│                        │
  │←───────────────────────┤                        │
  │    {auth_id: 123,      │                        │
  │     worker_name: "..."}│                        │
  │                        │                        │
  │12. User submits rating │                        │
  │    POST /rating/submit │                        │
  │    {auth_id: 123,      │                        │
  │     rating_score: 4,   │                        │
  │     comment: "..."}    │                        │
  ├───────────────────────→│                        │
  │                        │13. Begin transaction   │
  │                        │                        │
  │                        │14. INSERT rating       │
  │                        ├───────────────────────→│
  │                        │ INSERT INTO rating     │
  │                        │ (auth_id,              │
  │                        │  rating_method='QR',   │
  │                        │  rating_score,         │
  │                        │  comment)              │
  │                        │←───────────────────────┤
  │                        │  (rating_id=789)       │
  │                        │                        │
  │                        │15. Mark auth as used   │
  │                        ├───────────────────────→│
  │                        │ UPDATE rating_auth     │
  │                        │ SET rating_given_at=   │
  │                        │  UTC_TIMESTAMP()       │
  │                        │ WHERE auth_id=123      │
  │                        │←───────────────────────┤
  │                        │                        │
  │                        │16. Commit transaction  │
  │                        │                        │
  │17. Success response    │                        │
  │←───────────────────────┤                        │
  │    {rating_id: 789,    │                        │
  │     message: "Thanks!"}│                        │
  │                        │                        │
```

**Key Security Features:**
- **SHA-256 Hash:** Token never stored in plaintext (prevents token theft from DB dump)
- **24-Hour Expiry:** Old QR codes auto-expire
- **One-Time Use:** `rating_given_at` prevents QR code reuse
- **Worker Identity:** `worker_id` embedded in auth record (prevents rating wrong worker)

---

### Method 2: OTP-Based Rating

**Use Case:** Remote feedback via email/SMS without QR scan

**Workflow:**

```
WORKER                  BACKEND                  DATABASE
  │                        │                        │
  │ 1. Request OTP rating  │                        │
  │    POST /rating/       │                        │
  │    generate-otp        │                        │
  │    {resident_email}    │                        │
  ├───────────────────────→│                        │
  │                        │ 2. Generate 6-digit OTP│
  │                        │    code = "123456"     │
  │                        │                        │
  │                        │ 3. Hash code (Bcrypt)  │
  │                        │    hash = Bcrypt(code) │
  │                        │                        │
  │                        │ 4. INSERT rating_auth  │
  │                        ├───────────────────────→│
  │                        │ INSERT INTO            │
  │                        │ rating_auth            │
  │                        │ (worker_id,            │
  │                        │  otp_hash=<hash>,      │
  │                        │  expire_at=NOW()+10min)│
  │                        │←───────────────────────┤
  │                        │  (auth_id=124)         │
  │                        │                        │
  │                        │ 5. Send OTP email      │
  │                        │    (Nodemailer)        │
  │                        │                        │
  │ 6. Response            │                        │
  │←───────────────────────┤                        │
  │    {message:           │                        │
  │     "OTP sent to email"│                        │
  │     auth_id: 124}      │                        │
  │                        │                        │


RESIDENT                BACKEND                  DATABASE
  │                        │                        │
  │ 7. Receive email       │                        │
  │    "Your OTP: 123456"  │                        │
  │                        │                        │
  │ 8. POST /rating/verify │                        │
  │    {auth_id: 124,      │                        │
  │     otp_code: "123456"}│                        │
  ├───────────────────────→│                        │
  │                        │ 9. Fetch rating_auth   │
  │                        ├───────────────────────→│
  │                        │ SELECT * FROM          │
  │                        │ rating_auth            │
  │                        │ WHERE auth_id=124      │
  │                        │  AND expire_at>NOW()   │
  │                        │  AND rating_given_at   │
  │                        │   IS NULL              │
  │                        │←───────────────────────┤
  │                        │  (otp_hash="$2b$...")  │
  │                        │                        │
  │                        │10. Verify Bcrypt       │
  │                        │    Bcrypt.compare(     │
  │                        │     "123456", hash)    │
  │                        │    ✅ Match            │
  │                        │                        │
  │11. Verification success│                        │
  │←───────────────────────┤                        │
  │    {verified: true,    │                        │
  │     worker_name: "..."}│                        │
  │                        │                        │
  │12. Submit rating       │                        │
  │    (same as QR flow)   │                        │
  │    POST /rating/submit │                        │
  ├───────────────────────→│                        │
  │                        │13-16. Insert & mark    │
  │                        │       (same as QR)     │
  │                        │                        │
```

**Key Differences from QR:**
- **Bcrypt Hash:** Slower hashing (brute-force protection for 6-digit codes)
- **Shorter Expiry:** 10 minutes (vs 24 hours for QR)
- **Email Delivery:** Requires external SMTP service
- **No Visual Scan:** Purely numeric code entry

---

## Hash Algorithm Selection

### QR Code: SHA-256

**Properties:**
- **Fast:** ~1ms per hash (important for QR generation)
- **Long Token:** UUID v4 = 128-bit entropy (brute-force infeasible)
- **Deterministic:** Same token always produces same hash (verification works)

**Example:**

```javascript
const crypto = require('crypto');

const token = '550e8400-e29b-41d4-a716-446655440000';
const hash = crypto.createHash('sha256').update(token).digest('hex');
// hash = "a3c5b1e4f2d6e8c9a7b5d3f1e9c7a5b3d1f9e7c5a3b1d9f7e5c3a1b9d7f5e3c1"

// Store hash in database
await db.query('INSERT INTO rating_auth (qr_hash) VALUES (?)', [hash]);

// Later: Verify scanned token
const scannedToken = '550e8400-e29b-41d4-a716-446655440000';
const scannedHash = crypto.createHash('sha256').update(scannedToken).digest('hex');

const authRecord = await db.query('SELECT * FROM rating_auth WHERE qr_hash = ?', [scannedHash]);
// ✅ Match found
```

---

### OTP: Bcrypt

**Properties:**
- **Slow:** ~100ms per hash (brute-force deterrent)
- **Short Code:** 6 digits = 1 million combinations (vulnerable without slow hashing)
- **Salted:** Random salt per hash (prevents rainbow table attacks)

**Example:**

```javascript
const bcrypt = require('bcrypt');

const otpCode = '123456';
const hash = await bcrypt.hash(otpCode, 10);  // Cost factor 10 = 2^10 iterations
// hash = "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhW6"

// Store hash in database
await db.query('INSERT INTO rating_auth (otp_hash) VALUES (?)', [hash]);

// Later: Verify user-entered OTP
const userInput = '123456';
const isValid = await bcrypt.compare(userInput, hash);
// ✅ isValid = true
```

**Why Not SHA-256 for OTP?**
```javascript
// Anti-pattern: Fast hash + short code = vulnerable
const otpHash = crypto.createHash('sha256').update('123456').digest('hex');
// Attacker can brute-force 1 million hashes in seconds:
for (let i = 0; i < 1000000; i++) {
    const guess = String(i).padStart(6, '0');
    const guessHash = crypto.createHash('sha256').update(guess).digest('hex');
    if (guessHash === otpHash) {
        console.log('Cracked:', guess);  // ❌ Trivial to crack
    }
}
```

---

## Database Schema

### `rating_auth` Table

```sql
CREATE TABLE rating_auth (
    auth_id INT PRIMARY KEY AUTO_INCREMENT,
    worker_id INT NOT NULL,            -- FK to users (TRASHMAN role)
    qr_hash VARCHAR(255),              -- SHA-256 hash (for QR method)
    otp_hash VARCHAR(255),             -- Bcrypt hash (for OTP method)
    rating_given_at DATETIME,          -- Timestamp when rating submitted (NULL = unused)
    expire_at DATETIME NOT NULL,       -- Session expiry
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_rating_auth_worker FOREIGN KEY (worker_id) REFERENCES users(user_id)
);
```

**Key Columns:**

| Column | Type | Null | Description |
|--------|------|------|-------------|
| `auth_id` | INT | NOT NULL | Unique session identifier |
| `worker_id` | INT | NOT NULL | Worker being rated (FK to users) |
| `qr_hash` | VARCHAR(255) | NULL | SHA-256 hash of QR token (NULL if OTP method) |
| `otp_hash` | VARCHAR(255) | NULL | Bcrypt hash of OTP code (NULL if QR method) |
| `rating_given_at` | DATETIME | NULL | When rating submitted (prevents reuse) |
| `expire_at` | DATETIME | NOT NULL | Session expiry (24h for QR, 10min for OTP) |

**Validation Logic:**

```sql
-- Exactly one of qr_hash or otp_hash must be non-NULL
CHECK (
    (qr_hash IS NOT NULL AND otp_hash IS NULL) OR
    (qr_hash IS NULL AND otp_hash IS NOT NULL)
)
```

**Indexes:**

```sql
-- QR verification lookup
CREATE INDEX idx_rating_auth_qr 
ON rating_auth(qr_hash, expire_at, rating_given_at);

-- OTP verification lookup
CREATE INDEX idx_rating_auth_otp 
ON rating_auth(auth_id, expire_at, rating_given_at);

-- Cleanup expired sessions
CREATE INDEX idx_rating_auth_expire 
ON rating_auth(expire_at);
```

---

### `rating` Table

```sql
CREATE TABLE rating (
    rating_id INT PRIMARY KEY AUTO_INCREMENT,
    auth_id INT NOT NULL,              -- FK to rating_auth
    rating_method ENUM('QR','OTP') NOT NULL,
    rating_score TINYINT NOT NULL,     -- 1-5 stars
    comment TEXT,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_rating_auth FOREIGN KEY (auth_id) REFERENCES rating_auth(auth_id),
    CONSTRAINT chk_rating_score CHECK (rating_score BETWEEN 1 AND 5)
);
```

**Key Columns:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `rating_id` | INT | PRIMARY KEY | Unique rating record |
| `auth_id` | INT | NOT NULL, FK | Links to authentication session |
| `rating_method` | ENUM | NOT NULL | `QR` or `OTP` (audit trail) |
| `rating_score` | TINYINT | 1-5 CHECK | Star rating (1=worst, 5=best) |
| `comment` | TEXT | NULL | Optional feedback text |

**Indexes:**

```sql
-- Worker rating analytics
CREATE INDEX idx_rating_worker_created 
ON rating(auth_id);

-- Denormalized index (if worker_id added)
CREATE INDEX idx_rating_worker_score 
ON rating(worker_id, rating_score, created_at);
```

---

## Business Rules

### Rating Session Rules

1. **One Rating Per Session:** Each `auth_id` can create only one rating record
   ```sql
   -- Prevent duplicate ratings
   SELECT * FROM rating WHERE auth_id = ?;
   IF EXISTS THEN RETURN 'Rating already submitted';
   ```

2. **Expiry Enforcement:**
   - QR sessions: 24 hours
   - OTP sessions: 10 minutes
   ```sql
   -- Reject expired sessions
   SELECT * FROM rating_auth 
   WHERE auth_id = ? AND expire_at > UTC_TIMESTAMP();
   IF NOT EXISTS THEN RETURN 'Session expired';
   ```

3. **Worker Identity Validation:**
   - Only TRASHMAN role (`role_id = 2`) can generate rating sessions
   - `worker_id` cannot be modified after `rating_auth` creation

### Rating Submission Rules

1. **Score Range:** 1-5 stars (enforced by CHECK constraint)
2. **Comment Length:** Optional, max 1000 characters (application validation)
3. **Anonymous Ratings:** No `user_id` in `rating` table (resident identity not stored)

---

## Data Flow Diagrams

### QR Code Generation & Display

```
WORKER APP              BACKEND                  QR SERVICE (Cloudinary/Local)
    │                      │                           │
    │ 1. Generate QR       │                           │
    ├─────────────────────→│                           │
    │                      │ 2. Generate UUID token    │
    │                      │    token = UUID.v4()      │
    │                      │                           │
    │                      │ 3. Hash token (SHA-256)   │
    │                      │                           │
    │                      │ 4. Store hash in DB       │
    │                      │    (auth_id=123)          │
    │                      │                           │
    │                      │ 5. Create QR image        │
    │                      ├──────────────────────────→│
    │                      │    Encode: {              │
    │                      │      token: "550e...",    │
    │                      │      auth_id: 123         │
    │                      │    }                      │
    │                      │←──────────────────────────┤
    │                      │    QR image URL           │
    │                      │                           │
    │ 6. Display QR        │                           │
    │←─────────────────────┤                           │
    │    {qr_url: "...",   │                           │
    │     expires_at: ...} │                           │
    │                      │                           │
    │ 7. Show QR to        │                           │
    │    resident (screen) │                           │
    │                      │                           │
```

---

## Performance Considerations

### Rating Analytics Denormalization

**Problem:** Analytics queries require JOIN to `rating_auth` → `users` (slow for large datasets).

**Solution:** Denormalize `worker_id` to `rating` table.

```sql
-- Add worker_id column to rating
ALTER TABLE rating ADD COLUMN worker_id INT;

-- Populate existing records
UPDATE rating r
JOIN rating_auth ra ON r.auth_id = ra.auth_id
SET r.worker_id = ra.worker_id;

-- Add FK constraint
ALTER TABLE rating 
ADD CONSTRAINT fk_rating_worker 
FOREIGN KEY (worker_id) REFERENCES users(user_id);

-- Create covering index
CREATE INDEX idx_rating_worker_analytics 
ON rating(worker_id, rating_score, created_at);
```

**Query Optimization:**

```sql
-- Before denormalization (3-table JOIN)
SELECT AVG(r.rating_score) 
FROM rating r
JOIN rating_auth ra ON r.auth_id = ra.auth_id
WHERE ra.worker_id = ?;

-- After denormalization (direct index lookup)
SELECT AVG(rating_score) 
FROM rating 
WHERE worker_id = ?;
-- 10x faster
```

---

### Session Cleanup Automation

**Problem:** Expired `rating_auth` records accumulate (storage waste).

**Solution:** Daily cron job.

```sql
-- Delete expired sessions older than 7 days
DELETE FROM rating_auth 
WHERE expire_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY)
  AND rating_given_at IS NULL;
-- Unused sessions with ratings are kept for audit
```

**Node.js Scheduler:**

```javascript
const cron = require('node-cron');

// Run daily at 3am
cron.schedule('0 3 * * *', async () => {
    await db.query(`
        DELETE FROM rating_auth 
        WHERE expire_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY)
          AND rating_given_at IS NULL
    `);
    console.log('Expired rating sessions cleaned');
});
```

---

## Audit & Compliance

### Rating Authenticity

**Verification Audit Log:**

```sql
-- Track all verification attempts (future enhancement)
CREATE TABLE rating_verification_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    auth_id INT NOT NULL,
    verification_method ENUM('QR','OTP'),
    success TINYINT(1),
    ip_address VARCHAR(45),
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_log_auth FOREIGN KEY (auth_id) REFERENCES rating_auth(auth_id)
);
```

**Usage:**

```javascript
// Log every verification attempt
await db.query(`
    INSERT INTO rating_verification_log 
    (auth_id, verification_method, success, ip_address)
    VALUES (?, ?, ?, ?)
`, [authId, 'QR', isValid ? 1 : 0, req.ip]);
```

### Feedback Sentiment Analysis

**Keyword Flagging (Future Enhancement):**

```sql
-- Flag negative comments for management review
SELECT 
    r.rating_id,
    r.rating_score,
    r.comment,
    ra.worker_id,
    u.name AS worker_name
FROM rating r
JOIN rating_auth ra ON r.auth_id = ra.auth_id
JOIN users u ON ra.worker_id = u.user_id
WHERE r.comment LIKE '%rude%' 
   OR r.comment LIKE '%late%'
   OR r.comment LIKE '%dirty%'
   OR r.rating_score <= 2;
```

---

## API Endpoints

### `POST /api/rating/generate-qr` (Worker)

**Request Headers:**

```
Authorization: Bearer <worker_jwt>
```

**Response:**

```json
{
    "auth_id": 123,
    "qr_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "expires_at": "2024-01-16T10:30:00Z"
}
```

---

### `POST /api/rating/generate-otp` (Worker)

**Request:**

```json
{
    "resident_email": "resident@example.com"
}
```

**Response:**

```json
{
    "auth_id": 124,
    "message": "OTP sent to resident@example.com",
    "expires_at": "2024-01-15T10:40:00Z"
}
```

---

### `POST /api/rating/verify` (Resident)

**Request (QR):**

```json
{
    "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Request (OTP):**

```json
{
    "auth_id": 124,
    "otp_code": "123456"
}
```

**Response:**

```json
{
    "verified": true,
    "auth_id": 123,
    "worker": {
        "name": "Worker Smith",
        "profile_img": "https://res.cloudinary.com/.../avatar.jpg"
    }
}
```

---

### `POST /api/rating/submit` (Resident)

**Request:**

```json
{
    "auth_id": 123,
    "rating_score": 4,
    "comment": "Very professional and timely service!"
}
```

**Response:**

```json
{
    "rating_id": 789,
    "message": "Thank you for your feedback!",
    "created_at": "2024-01-15T10:45:00Z"
}
```

---

### `GET /api/rating/analytics/:worker_id` (Worker/Supervisor)

**Response:**

```json
{
    "worker_id": 456,
    "worker_name": "Worker Smith",
    "total_ratings": 120,
    "average_score": 4.2,
    "score_distribution": {
        "5": 60,
        "4": 40,
        "3": 15,
        "2": 4,
        "1": 1
    },
    "recent_comments": [
        {
            "rating_score": 5,
            "comment": "Excellent work!",
            "created_at": "2024-01-15T09:30:00Z"
        }
    ]
}
```

---

## Related Documentation

- [Overview](../overview.md) - Rating & feedback domain
- [Architecture](../architecture.md) - Rating verification system
- [Enums](../enums.md) - rating_method specification
- [Domain: User Auth](./user-auth.md) - Worker authentication
- [Table: rating_auth](../tables/rating_auth.md) - Authentication details
- [Table: rating](../tables/rating.md) - Rating records
- [Performance](../performance.md) - Rating analytics optimization
