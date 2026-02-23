# Table: `geo_attendance`

**Domain:** [Attendance Verification](../domains/attendance.md)  
**Purpose:** Store geo-tagged selfie images for GEO_SELFIE attendance verification

---

## Table Structure

```sql
CREATE TABLE geo_attendance (
    geo_id BIGINT PRIMARY KEY,
    att_id BIGINT,
    geo_img VARCHAR(255),
    
    CONSTRAINT fk_geo_attendance FOREIGN KEY (att_id) REFERENCES attendance(att_id) ON DELETE CASCADE
);
```

---

## Columns

| Column | Type | Null | Key | Default | Description |
|--------|------|------|-----|---------|-------------|
| `geo_id` | BIGINT | NO | PK | AUTO_INCREMENT | Unique geo-attendance record ID |
| `att_id` | BIGINT | YES | FK | NULL | Links to parent attendance record |
| `geo_img` | VARCHAR(255) | YES | - | NULL | Cloudinary URL of geo-tagged selfie |

---

## Foreign Key Relationships

| Foreign Key | References | On Delete | Description |
|-------------|------------|-----------|-------------|
| `att_id` | `attendance(att_id)` | CASCADE | If attendance deleted (rejection), geo_img auto-deleted |

---

## Business Rules

1. **One-to-One Relationship:** Each `att_id` can have at most one `geo_attendance` record
2. **GEO_SELFIE Only:** Only created for `attendance.att_type = 'GEO_SELFIE'`
3. **Image Required:** `geo_img` must be valid Cloudinary URL (validated in application)
4. **Cascade Delete:** If attendance rejected, geo_attendance auto-deleted via ON DELETE CASCADE

---

## Common Queries

### Insert Geo-Attendance

```sql
INSERT INTO geo_attendance (att_id, geo_img)
VALUES (?, 'https://res.cloudinary.com/.../selfie.jpg');
```

### Fetch with Parent Attendance

```sql
SELECT a.*, ga.geo_img
FROM attendance a
JOIN geo_attendance ga ON a.att_id = ga.att_id
WHERE a.att_id = ?;
```

---

## Indexes

```sql
CREATE UNIQUE INDEX idx_geo_att_id ON geo_attendance(att_id);
```

**Purpose:** Ensures one geo-attendance record per attendance (one-to-one enforcement).

---

## Related Documentation

- [Domain: Attendance](../domains/attendance.md) - GEO_SELFIE workflow
- [Table: attendance](./attendance.md) - Parent attendance records
