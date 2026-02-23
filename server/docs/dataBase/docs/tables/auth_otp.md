# Table: `auth_otp`

**Domain:** [User Authentication & Authorization](../domains/user-auth.md)  
**Purpose:** Store one-time passwords for email-based authentication

---

## Table Structure

```sql
CREATE TABLE auth_otp (
    otp_id BIGINT PRIMARY KEY,
    user_id BIGINT,
    otp_type ENUM('EMAIL'),
    identifier VARCHAR(255),
    otp_hash VARCHAR(255),
    is_used TINYINT(1),
    expires_at DATETIME,
    created_at DATETIME
);
```

**Note:** No FK constraint on `user_id` (allows OTP generation before user creation).

---

## Columns

| Column | Type | Null | Key | Default | Description |
|--------|------|------|-----|---------|-------------|
| `otp_id` | BIGINT | NO | PK | AUTO_INCREMENT | Unique OTP record ID |
| `user_id` | BIGINT | YES | - | NULL | User receiving OTP (no FK) |
| `otp_type` | ENUM | YES | - | NULL | OTP delivery method (`EMAIL` only currently) |
| `identifier` | VARCHAR(255) | YES | - | NULL | Email address where OTP sent |
| `otp_hash` | VARCHAR(255) | YES | - | NULL | Bcrypt hash of 6-digit OTP code |
| `is_used` | TINYINT(1) | YES | - | NULL | 0=unused, 1=already verified |
| `expires_at` | DATETIME | YES | - | NULL | OTP expiry timestamp (UTC, typically +10 minutes) |
| `created_at` | DATETIME | YES | - | UTC_TIMESTAMP() | OTP generation timestamp (UTC) |

---

## Business Rules

1. **Expiry Window:** OTPs expire 10 minutes after creation (`expires_at = created_at + INTERVAL 10 MINUTE`)
2. **Single Use:** Once `is_used = 1`, OTP cannot be reused (enforced in application)
3. **Hash Storage:** Never store plaintext OTP (use Bcrypt cost=10)
4. **Rate Limiting:** Max 5 OTP requests per email per 15 minutes (application layer)
5. **Cleanup:** Delete OTPs older than 24 hours (daily cron job)

---

## Common Queries

### Generate OTP

```sql
INSERT INTO auth_otp (user_id, otp_type, identifier, otp_hash, is_used, expires_at, created_at)
VALUES (?, 'EMAIL', ?, ?, 0, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 10 MINUTE), UTC_TIMESTAMP());
```

### Verify OTP

```sql
SELECT * FROM auth_otp
WHERE user_id = ?
  AND otp_type = 'EMAIL'
  AND is_used = 0
  AND expires_at > UTC_TIMESTAMP()
ORDER BY created_at DESC
LIMIT 1;
```

### Mark OTP as Used

```sql
UPDATE auth_otp
SET is_used = 1
WHERE otp_id = ?;
```

### Cleanup Expired OTPs

```sql
DELETE FROM auth_otp
WHERE expires_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR);
```

---

## Indexes

```sql
CREATE INDEX idx_otp_validation ON auth_otp(user_id, otp_type, is_used, expires_at);
```

**Purpose:** Optimizes OTP verification query (WHERE clauses on all indexed columns).

---

## Related Documentation

- [Domain: User Auth](../domains/user-auth.md) - OTP workflows
- [Enums](../enums.md#otp_type-table-auth_otp) - OTP type specification
- [Table: users](./users.md) - User relationship
