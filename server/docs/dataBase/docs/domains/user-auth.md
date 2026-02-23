# User Authentication & Authorization Domain

This domain handles user identity, role-based access control (RBAC), and secure authentication workflows for the Trash Management System.

---

## Domain Overview

**Purpose:** Zero-trust authentication with role-based permissions  
**Security Model:** OTP-based passwordless authentication + JWT sessions  
**Tables:** 2 core tables (`role`, `users`, `auth_otp`)  
**External Dependencies:** Nodemailer (SMTP), JWT library, Bcrypt

---

## Tables in Domain

| Table | Purpose | Record Volume | Growth Rate |
|-------|---------|---------------|-------------|
| `role` | Define user roles (RBAC) | 7 records (static) | No growth |
| `users` | User accounts and profiles | ~10,000 users | +50/month |
| `auth_otp` | One-time password authentication | ~100,000 OTPs | +500/day |

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

```
┌──────────────────────────────────────────────────────┐
│                      ADMIN                           │
│           (System-wide superuser)                    │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────┐
│               COMMISSIONER                           │
│           (Municipal executive)                      │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────┐
│                    MHO                               │
│      (Municipal Health Officer)                      │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────┐
│                    SI                                │
│         (Sanitary Inspector)                         │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────┐
│                SUPERVISOR                            │
│         (Field supervisor)                           │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────┐
│                TRASHMAN                              │
│         (Waste collection worker)                    │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────┐
│                RESIDENT                              │
│         (Regular citizen)                            │
└──────────────────────────────────────────────────────┘
```

### Permission Matrix

| Feature | RESIDENT | TRASHMAN | SUPERVISOR | SI | MHO | COMMISSIONER | ADMIN |
|---------|----------|----------|------------|----|----|--------------|-------|
| **Complaints** |
| Submit complaint | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own complaints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View division complaints | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View zone complaints | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| View all complaints | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Approve (Level 1) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approve (Level 2) | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Approve (Level 3) | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Tasks** |
| View assigned tasks | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create tasks | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assign tasks | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Complete tasks | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Attendance** |
| Submit attendance | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Verify attendance | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View attendance reports | ❌ | Self only | Division | Zone | District | City-wide | All |
| **Routes & Geography** |
| View routes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Modify routes | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Assign workers to routes | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Quiz & Certification** |
| Take quiz | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create quiz questions | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View quiz results | Self | Self | Division | Zone | District | City-wide | All |
| **Ratings** |
| Submit rating | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View rating analytics | ❌ | Self only | Division | Zone | District | City-wide | All |
| **User Management** |
| Create users | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Modify user roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Authentication Workflow

### OTP-Based Passwordless Authentication

**Design Rationale:**
- **No password storage:** Eliminates credential stuffing attacks
- **Email-based:** Leverages existing user contact method
- **Time-limited:** 10-minute OTP expiry reduces window of compromise
- **Single-use:** Prevents replay attacks

**User Registration Flow:**

```
┌───────────┐
│  Frontend │
└─────┬─────┘
      │
      │ 1. POST /api/auth/signup
      │    { name, email, role_id }
      ↓
┌─────────────────────────────────────────────────────┐
│  Backend: auth.controller.js::signup()              │
├─────────────────────────────────────────────────────┤
│  2. Validate email format                           │
│  3. Check if email exists:                          │
│     SELECT * FROM users WHERE email = ?             │
│  4. If exists → Reject (409 Conflict)               │
│  5. Generate UUID (for user_uuid)                   │
│  6. INSERT INTO users (user_uuid, name, email, ...)│
│  7. Generate 6-digit OTP code                       │
│  8. Hash OTP with Bcrypt (cost=10)                  │
│  9. INSERT INTO auth_otp (user_id, otp_hash, ...)   │
│ 10. Send OTP email via Nodemailer                   │
│ 11. Return success (hide user_id for security)      │
└─────────────────────────────────────────────────────┘
      │
      │ 12. Response: { message: "OTP sent to email" }
      ↓
┌───────────┐
│  Frontend │ (Show OTP input screen)
└───────────┘
```

**OTP Verification & Login Flow:**

```
┌───────────┐
│  Frontend │
└─────┬─────┘
      │
      │ 1. POST /api/auth/verify-otp
      │    { email, otp_code }
      ↓
┌─────────────────────────────────────────────────────┐
│  Backend: auth.controller.js::verifyOTP()           │
├─────────────────────────────────────────────────────┤
│  2. Fetch user:                                     │
│     SELECT user_id FROM users WHERE email = ?       │
│  3. Fetch valid OTP:                                │
│     SELECT * FROM auth_otp                          │
│     WHERE user_id = ? AND is_used = 0               │
│       AND expire_at > UTC_TIMESTAMP()               │
│     ORDER BY created_at DESC LIMIT 1                │
│  4. If no OTP → Reject (404 Not Found)              │
│  5. Verify OTP hash:                                │
│     bcrypt.compare(otp_code, otp_hash)              │
│  6. If mismatch → Reject (401 Unauthorized)         │
│  7. Mark OTP as used:                               │
│     UPDATE auth_otp SET is_used = 1 WHERE otp_id=? │
│  8. Fetch user role:                                │
│     SELECT u.*, r.role_name FROM users u            │
│     JOIN role r ON u.role_id = r.role_id            │
│     WHERE u.user_id = ?                             │
│  9. Generate JWT token:                             │
│     payload = { user_id, email, role_name }         │
│     token = jwt.sign(payload, SECRET, {exp: 7d})    │
│ 10. Return token + user data                        │
└─────────────────────────────────────────────────────┘
      │
      │ 11. Response: { token, user: {...} }
      ↓
┌───────────┐
│  Frontend │ (Store token in localStorage, redirect)
└───────────┘
```

**Session Management (JWT):**

```javascript
// JWT Payload Structure
{
    "user_id": 123,
    "email": "john@example.com",
    "role_name": "SUPERVISOR",
    "iat": 1705305600,  // Issued at (Unix timestamp)
    "exp": 1705910400   // Expires at (7 days later)
}
```

**Token Validation Middleware:**

```javascript
// auth.middleware.js
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
```

**Role-Based Middleware:**

```javascript
// role.middleware.js
function requireRole(allowedRoles) {
    return (req, res, next) => {
        const userRole = req.user.role_name; // From JWT payload
        
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        next();
    };
}

// Usage in routes
router.post('/complaints/approve', 
    verifyToken, 
    requireRole(['SUPERVISOR', 'SI', 'MHO', 'COMMISSIONER', 'ADMIN']),
    complaintController.approveComplaint
);
```

---

## Security Measures

### OTP Security

**Brute-Force Protection:**

```javascript
// Rate limiting (Express middleware)
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many OTP requests, try again later'
});

router.post('/auth/request-otp', otpLimiter, authController.requestOTP);
```

**OTP Expiry Enforcement:**

```sql
-- Automated cleanup (run hourly via cron)
DELETE FROM auth_otp 
WHERE expire_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR);
```

**OTP Hash Strength:**

```javascript
// Bcrypt with cost factor 10 (2^10 iterations)
const hashedOTP = await bcrypt.hash(otpCode, 10);
// Resistant to GPU-based cracking (>1ms per attempt)
```

### JWT Security

**Token Storage (Frontend):**

```javascript
// ✅ CORRECT: Use httpOnly cookies (XSS-safe)
res.cookie('auth_token', jwtToken, {
    httpOnly: true,  // Not accessible via JavaScript
    secure: true,     // HTTPS only
    sameSite: 'strict', // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// ❌ AVOID: localStorage (vulnerable to XSS)
// localStorage.setItem('token', jwtToken);
```

**Token Rotation:**

```javascript
// Issue new token on each request (sliding expiration)
function refreshToken(oldToken) {
    const decoded = jwt.verify(oldToken, SECRET);
    delete decoded.iat; // Remove old timestamps
    delete decoded.exp;
    
    const newToken = jwt.sign(decoded, SECRET, { expiresIn: '7d' });
    return newToken;
}
```

### Email Verification

**Prevent Email Enumeration:**

```javascript
// Always return success (hide if email exists)
router.post('/auth/signup', async (req, res) => {
    const existingUser = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existingUser) {
        // ❌ BAD: return res.status(409).json({ error: 'Email exists' });
        // ✅ GOOD: Send OTP anyway (idempotent)
        await sendOTP(existingUser.user_id);
    } else {
        const newUser = await createUser(email, name, role_id);
        await sendOTP(newUser.user_id);
    }
    
    return res.status(200).json({ message: 'OTP sent to email' });
});
```

---

## Data Flow Diagrams

### Login Flow (Returning User)

```
RESIDENT                    BACKEND                    DATABASE
    │                          │                          │
    │ Request OTP              │                          │
    ├─────────────────────────→│                          │
    │                          │ Find user by email       │
    │                          ├─────────────────────────→│
    │                          │←─────────────────────────┤
    │                          │      (user_id=123)       │
    │                          │                          │
    │                          │ Generate 6-digit code    │
    │                          │ Hash code (Bcrypt)       │
    │                          │                          │
    │                          │ INSERT INTO auth_otp     │
    │                          ├─────────────────────────→│
    │                          │←─────────────────────────┤
    │                          │      (otp_id=456)        │
    │                          │                          │
    │                          │ Send email (Nodemailer)  │
    │←─────────────────────────┤                          │
    │  "OTP: 123456"           │                          │
    │                          │                          │
    │ Enter OTP                │                          │
    ├─────────────────────────→│                          │
    │                          │ Fetch OTP hash           │
    │                          ├─────────────────────────→│
    │                          │←─────────────────────────┤
    │                          │   (otp_hash="$2b$...")   │
    │                          │                          │
    │                          │ Verify Bcrypt.compare    │
    │                          │ (✅ Match)               │
    │                          │                          │
    │                          │ Mark OTP used            │
    │                          ├─────────────────────────→│
    │                          │                          │
    │                          │ Fetch user + role        │
    │                          ├─────────────────────────→│
    │                          │←─────────────────────────┤
    │                          │  (role_name="RESIDENT")  │
    │                          │                          │
    │                          │ Generate JWT             │
    │                          │ (payload: {user_id, ...})│
    │                          │                          │
    │ JWT Token + User Data    │                          │
    │←─────────────────────────┤                          │
    │                          │                          │
    │ Future API Requests      │                          │
    ├─────────────────────────→│                          │
    │ (Header: Bearer <JWT>)   │ Verify JWT signature     │
    │                          │ Extract role_name        │
    │                          │ Check permissions        │
    │                          │                          │
```

---

## Database Schema

### `role` Table

```sql
CREATE TABLE role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name ENUM('RESIDENT','TRASHMAN','SUPERVISOR','SI','MHO','COMMISSIONER','ADMIN') NOT NULL UNIQUE
);
```

**Seed Data:**

```sql
INSERT INTO role (role_id, role_name) VALUES
(1, 'RESIDENT'),
(2, 'TRASHMAN'),
(3, 'SUPERVISOR'),
(4, 'SI'),
(5, 'MHO'),
(6, 'COMMISSIONER'),
(7, 'ADMIN');
```

**Design Notes:**
- Static lookup table (no updates after initial seed)
- `role_name` uniqueness prevents duplicate roles
- Enum enforces valid role values at database level

### `users` Table

```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    profile_img VARCHAR(500),
    role_id INT NOT NULL,
    is_deleted TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    updated_at DATETIME DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP(),
    
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES role(role_id)
);
```

**Key Columns:**
- `user_uuid`: Public identifier (prevents user_id enumeration)
- `email`: Unique constraint enforces one account per email
- `is_deleted`: Soft delete flag (retain data for audit trails)
- `created_at`/`updated_at`: UTC timestamps (time-zone agnostic)

**Indexes:**

```sql
CREATE INDEX idx_users_email ON users(email);        -- Login queries
CREATE INDEX idx_users_role ON users(role_id);       -- Role filtering
CREATE INDEX idx_users_uuid ON users(user_uuid);     -- Public API lookups
```

### `auth_otp` Table

```sql
CREATE TABLE auth_otp (
    otp_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    otp_type ENUM('EMAIL') NOT NULL,
    identifier VARCHAR(255) NOT NULL,  -- Email address
    is_used TINYINT(1) DEFAULT 0,
    expire_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_auth_otp_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

**Key Columns:**
- `otp_hash`: Bcrypt hash of 6-digit code (never store plaintext OTP)
- `identifier`: Email/phone where OTP was sent (audit trail)
- `is_used`: Prevents OTP reuse attacks
- `expire_at`: Calculated as `UTC_TIMESTAMP() + INTERVAL 10 MINUTE`

**Indexes:**

```sql
CREATE INDEX idx_otp_validation ON auth_otp(user_id, otp_type, is_used, expire_at);
-- Optimizes: WHERE user_id=? AND is_used=0 AND expire_at>NOW()
```

---

## Business Rules

### User Registration Rules

1. **Email Uniqueness:** One account per email (enforced by UNIQUE constraint)
2. **Default Role:** New signups default to `RESIDENT` (role_id=1)
3. **UUID Generation:** `user_uuid` must be globally unique (use UUID v4)
4. **Email Validation:** Must match regex: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`

### OTP Lifecycle Rules

1. **Expiry Window:** 10 minutes from creation
2. **Single Use:** `is_used` flag set on first successful verification
3. **Rate Limiting:** Max 5 OTP requests per email per 15 minutes
4. **Cleanup Policy:** Delete OTPs older than 24 hours (daily cron job)

### Role Promotion Rules

1. **Manual Approval:** Role changes require ADMIN or COMMISSIONER approval
2. **No Demotion:** Cannot reduce `role_id` (only promote upward)
3. **Audit Trail:** Log all role changes in separate `role_change_log` table (future)

---

## API Endpoints

### `POST /api/auth/signup`

**Request:**

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "role_id": 1  // Optional (defaults to RESIDENT)
}
```

**Response:**

```json
{
    "message": "OTP sent to email",
    "user_uuid": "550e8400-e29b-41d4-a716-446655440000"
}
```

### `POST /api/auth/verify-otp`

**Request:**

```json
{
    "email": "john@example.com",
    "otp_code": "123456"
}
```

**Response:**

```json
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "user_id": 123,
        "user_uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "John Doe",
        "email": "john@example.com",
        "role_name": "RESIDENT",
        "profile_img": null
    }
}
```

### `POST /api/auth/logout`

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
    "message": "Logged out successfully"
}
```

**Note:** Since JWT is stateless, logout is client-side (delete token). For true revocation, implement token blacklist (Redis).

---

## Audit & Compliance

### GDPR Compliance

**Right to Erasure:**

```sql
-- Soft delete user (retain foreign key integrity)
UPDATE users SET is_deleted = 1, email = CONCAT('deleted_', user_id, '@example.com') 
WHERE user_id = ?;

-- Hard delete (cascade to related records)
DELETE FROM auth_otp WHERE user_id = ?;
DELETE FROM users WHERE user_id = ?;
```

**Data Portability:**

```sql
-- Export all user data (JSON format)
SELECT JSON_OBJECT(
    'user', (SELECT JSON_OBJECT('name', name, 'email', email) FROM users WHERE user_id = ?),
    'complaints', (SELECT JSON_ARRAYAGG(JSON_OBJECT('complaint_id', complaint_id)) FROM resident_complaints WHERE user_id = ?),
    'attendance', (SELECT JSON_ARRAYAGG(JSON_OBJECT('att_id', att_id)) FROM attendance WHERE user_id = ?)
);
```

### Security Audit Logs

**Recommended Schema (Future Enhancement):**

```sql
CREATE TABLE audit_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(50),  -- LOGIN, LOGOUT, ROLE_CHANGE, DATA_EXPORT
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

**Usage:**

```javascript
// Log every login
await db.query('INSERT INTO audit_log (user_id, action, ip_address) VALUES (?, ?, ?)', 
    [userId, 'LOGIN', req.ip]
);
```

---

## Related Documentation

- [Overview](../overview.md) - Domain relationships
- [Architecture](../architecture.md) - Zero-trust auth model
- [Enums](../enums.md) - role_name, otp_type specifications
- [Table: role](../tables/role.md) - Role table details
- [Table: users](../tables/users.md) - User table details
- [Table: auth_otp](../tables/auth_otp.md) - OTP table details
