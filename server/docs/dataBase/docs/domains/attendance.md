# Attendance Verification Domain

This domain manages worker attendance tracking with dual verification methods: geo-tagged selfie uploads and manual supervisor entry.

---

## Domain Overview

**Purpose:** Prevent payroll fraud through GPS + photo verification  
**Key Feature:** Dual-mode attendance (GEO_SELFIE with supervisor approval, MANUAL by supervisor)  
**Tables:** 2 core tables (`attendance`, `geo_attendance`)  
**External Dependencies:** Cloudinary (image storage), GPS coordinates (frontend), user authentication

---

## Tables in Domain

| Table | Purpose | Record Volume | Growth Rate |
|-------|---------|---------------|-------------|
| `attendance` | Core attendance records (both types) | ~100,000 records | +500/day |
| `geo_attendance` | Geo-tagged photo metadata (subset) | ~60,000 records | +300/day |

---

## Attendance Types

### GEO_SELFIE (Worker-Initiated)

**Workflow:**

```
WORKER                  MOBILE APP               BACKEND                 DATABASE
  │                         │                       │                       │
  │ 1. Open attendance      │                       │                       │
  │    camera               │                       │                       │
  ├────────────────────────→│                       │                       │
  │                         │ 2. Capture GPS        │                       │
  │                         │    coordinates        │                       │
  │                         │    (latitude/         │                       │
  │                         │     longitude)        │                       │
  │                         │                       │                       │
  │ 3. Take selfie          │                       │                       │
  ├────────────────────────→│                       │                       │
  │                         │ 4. Upload to          │                       │
  │                         │    Cloudinary         │                       │
  │                         │    (external service) │                       │
  │                         │                       │                       │
  │                         │ 5. POST /attendance   │                       │
  │                         │    {user_id,          │                       │
  │                         │     att_type: GEO_    │                       │
  │                         │      SELFIE,          │                       │
  │                         │     geo_img: URL,     │                       │
  │                         │     latitude,         │                       │
  │                         │     longitude}        │                       │
  │                         ├──────────────────────→│                       │
  │                         │                       │ 6. Begin transaction  │
  │                         │                       │                       │
  │                         │                       │ 7. INSERT attendance  │
  │                         │                       ├──────────────────────→│
  │                         │                       │ INSERT INTO attendance│
  │                         │                       │ (user_id,             │
  │                         │                       │  att_type='GEO_SELFIE'│
  │                         │                       │  is_verified=0,       │
  │                         │                       │  verified_by=NULL)    │
  │                         │                       │←──────────────────────┤
  │                         │                       │  (att_id=123)         │
  │                         │                       │                       │
  │                         │                       │ 8. INSERT geo_data    │
  │                         │                       ├──────────────────────→│
  │                         │                       │ INSERT INTO           │
  │                         │                       │ geo_attendance        │
  │                         │                       │ (att_id=123,          │
  │                         │                       │  geo_img=<URL>,       │
  │                         │                       │  latitude,            │
  │                         │                       │  longitude)           │
  │                         │                       │←──────────────────────┤
  │                         │                       │                       │
  │                         │                       │ 9. Commit transaction │
  │                         │                       │                       │
  │                         │ 10. Response          │                       │
  │                         │←──────────────────────┤                       │
  │                         │    {att_id: 123,      │                       │
  │                         │     status:           │                       │
  │                         │      "pending_verify"}│                       │
  │ 11. Confirmation        │                       │                       │
  │←────────────────────────┤                       │                       │
  │    "Attendance pending  │                       │                       │
  │     supervisor approval"│                       │                       │
  │                         │                       │                       │
```

**Key Characteristics:**
- Photo uploaded to Cloudinary (returns public URL)
- GPS coordinates captured at upload time
- Requires supervisor verification (`is_verified = 0` initially)
- Creates records in BOTH `attendance` AND `geo_attendance` tables

---

### MANUAL (Supervisor-Initiated)

**Workflow:**

```
SUPERVISOR              BACKEND                 DATABASE
  │                       │                       │
  │ 1. Open attendance    │                       │
  │    management UI      │                       │
  │                       │                       │
  │ 2. GET /workers?      │                       │
  │    division_id=?      │                       │
  ├──────────────────────→│                       │
  │                       │ 3. Fetch workers      │
  │                       ├──────────────────────→│
  │                       │ SELECT u.*            │
  │                       │ FROM users u          │
  │                       │ JOIN trashman_        │
  │                       │  assignment ta        │
  │                       │ ON u.user_id =        │
  │                       │  ta.user_id           │
  │                       │ JOIN street_divisions │
  │                       │  sd ON ta.route_id =  │
  │                       │  sd.route_id          │
  │                       │ WHERE sd.division_id= │
  │                       │  ? AND u.role_id=2    │
  │                       │←──────────────────────┤
  │ 4. Worker list        │                       │
  │←──────────────────────┤                       │
  │                       │                       │
  │ 5. Mark worker        │                       │
  │    present            │                       │
  │    POST /attendance/  │                       │
  │    manual             │                       │
  │    {user_id: 456,     │                       │
  │     verified_by: 789} │                       │
  ├──────────────────────→│                       │
  │                       │ 6. INSERT attendance  │
  │                       ├──────────────────────→│
  │                       │ INSERT INTO attendance│
  │                       │ (user_id=456,         │
  │                       │  att_type='MANUAL',   │
  │                       │  is_verified=1,       │
  │                       │  verified_by=789)     │
  │                       │←──────────────────────┤
  │                       │  (att_id=124)         │
  │                       │                       │
  │                       │ 7. NO geo_attendance  │
  │                       │    record created     │
  │                       │    (MANUAL type)      │
  │                       │                       │
  │ 8. Response           │                       │
  │←──────────────────────┤                       │
  │    {att_id: 124,      │                       │
  │     status: "verified"│                       │
  │                       │                       │
```

**Key Characteristics:**
- Supervisor marks attendance directly (no photo needed)
- Pre-verified (`is_verified = 1` immediately)
- `verified_by` = supervisor's user_id
- Only creates record in `attendance` table (NOT in `geo_attendance`)

---

## Verification Workflow

### Supervisor Approval (GEO_SELFIE)

```
SUPERVISOR              BACKEND                 DATABASE
  │                       │                       │
  │ 1. GET /attendance/   │                       │
  │    pending            │                       │
  ├──────────────────────→│                       │
  │                       │ 2. Fetch unverified   │
  │                       ├──────────────────────→│
  │                       │ SELECT a.*, ga.*      │
  │                       │ FROM attendance a     │
  │                       │ JOIN geo_attendance   │
  │                       │  ga ON a.att_id =     │
  │                       │  ga.att_id            │
  │                       │ WHERE a.is_verified=0 │
  │                       │  AND a.att_type=      │
  │                       │  'GEO_SELFIE'         │
  │                       │←──────────────────────┤
  │ 3. Pending list       │                       │
  │    (with images)      │                       │
  │←──────────────────────┤                       │
  │                       │                       │
  │ 4. Review image       │                       │
  │    + GPS location     │                       │
  │                       │                       │
  │ 5a. APPROVE           │                       │
  │    PATCH /attendance/ │                       │
  │    123/approve        │                       │
  ├──────────────────────→│                       │
  │                       │ 6. Update attendance  │
  │                       ├──────────────────────→│
  │                       │ UPDATE attendance     │
  │                       │ SET is_verified=1,    │
  │                       │     verified_by=789,  │
  │                       │     updated_at=NOW()  │
  │                       │ WHERE att_id=123      │
  │                       │←──────────────────────┤
  │ 7. Response           │                       │
  │←──────────────────────┤                       │
  │    {status: "approved"│                       │
  │                       │                       │
  │ OR                    │                       │
  │                       │                       │
  │ 5b. REJECT            │                       │
  │    DELETE /attendance/│                       │
  │    123                │                       │
  ├──────────────────────→│                       │
  │                       │ 8. Begin transaction  │
  │                       │                       │
  │                       │ 9. Delete geo_data    │
  │                       ├──────────────────────→│
  │                       │ DELETE FROM           │
  │                       │ geo_attendance        │
  │                       │ WHERE att_id=123      │
  │                       │←──────────────────────┤
  │                       │                       │
  │                       │10. Delete attendance  │
  │                       ├──────────────────────→│
  │                       │ DELETE FROM attendance│
  │                       │ WHERE att_id=123      │
  │                       │←──────────────────────┤
  │                       │                       │
  │                       │11. Commit transaction │
  │                       │                       │
  │12. Response           │                       │
  │←──────────────────────┤                       │
  │    {status: "rejected"│                       │
  │                       │                       │
```

---

## GPS Verification

### Geo-Fence Validation (Recommended Enhancement)

**Concept:** Verify worker is at assigned location before accepting attendance.

**Implementation:**

```javascript
// Backend: Validate GPS coordinates against route boundaries
function isWithinRouteBounds(latitude, longitude, routeId) {
    // Fetch route's geographic bounds (pre-defined polygons)
    const bounds = await db.query(`
        SELECT boundary_polygon 
        FROM route_boundaries 
        WHERE route_id = ?
    `, [routeId]);
    
    // Check if point (lat, lng) is inside polygon
    return pointInPolygon([latitude, longitude], bounds.boundary_polygon);
}

// Reject attendance if out of bounds
if (!isWithinRouteBounds(latitude, longitude, worker.route_id)) {
    return res.status(400).json({ 
        error: 'GPS location outside assigned route boundary' 
    });
}
```

**Future Enhancement Table:**

```sql
CREATE TABLE route_boundaries (
    boundary_id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    boundary_polygon GEOMETRY NOT NULL,
    
    CONSTRAINT fk_boundary_route FOREIGN KEY (route_id) REFERENCES route(route_id),
    SPATIAL INDEX(boundary_polygon)
);
```

---

## Database Schema

### `attendance` Table

```sql
CREATE TABLE attendance (
    att_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,               -- FK to users (TRASHMAN role)
    att_type ENUM('GEO_SELFIE','MANUAL') NOT NULL,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verified_by INT,                    -- FK to users (SUPERVISOR+ role)
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    updated_at DATETIME DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP(),
    
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_attendance_verifier FOREIGN KEY (verified_by) REFERENCES users(user_id)
);
```

**Column Details:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `att_id` | INT | PRIMARY KEY | Unique attendance record ID |
| `user_id` | INT | NOT NULL, FK | Worker who marked attendance |
| `att_type` | ENUM | NOT NULL | `GEO_SELFIE` or `MANUAL` |
| `is_verified` | TINYINT(1) | DEFAULT 0 | 0=pending, 1=approved |
| `verified_by` | INT | NULL, FK | Supervisor who verified (NULL for pending) |
| `created_at` | DATETIME | DEFAULT UTC | Attendance submission timestamp |
| `updated_at` | DATETIME | AUTO UPDATE | Last modification timestamp |

**Indexes:**

```sql
-- Find pending verifications
CREATE INDEX idx_attendance_verification 
ON attendance(verified_by, att_type, created_at);

-- Worker's attendance history
CREATE INDEX idx_attendance_user_created 
ON attendance(user_id, created_at DESC);

-- Daily attendance reports (date range queries)
CREATE INDEX idx_attendance_date 
ON attendance(created_at);
```

---

### `geo_attendance` Table

```sql
CREATE TABLE geo_attendance (
    geo_attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    att_id INT NOT NULL,                -- FK to attendance
    geo_img VARCHAR(500) NOT NULL,      -- Cloudinary URL
    latitude DECIMAL(10, 8),            -- GPS latitude (-90 to +90)
    longitude DECIMAL(11, 8),           -- GPS longitude (-180 to +180)
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_geo_attendance FOREIGN KEY (att_id) REFERENCES attendance(att_id) ON DELETE CASCADE
);
```

**Column Details:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `geo_attendance_id` | INT | PRIMARY KEY | Unique geo-record ID |
| `att_id` | INT | NOT NULL, FK | Links to parent attendance record |
| `geo_img` | VARCHAR(500) | NOT NULL | Cloudinary image URL |
| `latitude` | DECIMAL(10,8) | NULL | GPS latitude (8 decimal places ≈ 1mm precision) |
| `longitude` | DECIMAL(11,8) | NULL | GPS longitude |
| `created_at` | DATETIME | DEFAULT UTC | Timestamp (matches parent attendance) |

**Key Design Choices:**

1. **ON DELETE CASCADE:** If attendance record deleted (rejection), geo_data auto-deleted
2. **Latitude/Longitude Precision:** DECIMAL(10,8) allows coordinates like 12.34567890 (sub-meter accuracy)
3. **One-to-One Relationship:** Each attendance can have at most one geo_attendance record (enforced by foreign key)

**Indexes:**

```sql
-- Link geo data to attendance
CREATE UNIQUE INDEX idx_geo_att_id 
ON geo_attendance(att_id);
-- Ensures one geo record per attendance

-- Spatial queries (future enhancement)
CREATE INDEX idx_geo_coords 
ON geo_attendance(latitude, longitude);
```

---

## Business Rules

### Attendance Submission Rules

1. **One Record Per Day:** Worker can mark attendance only once per day
   ```sql
   -- Check for existing attendance today
   SELECT * FROM attendance 
   WHERE user_id = ? AND DATE(created_at) = CURDATE();
   
   -- Reject if exists
   IF EXISTS THEN RETURN 'Already marked attendance today';
   ```

2. **Role Restriction:** Only `role_id = 2` (TRASHMAN) can submit attendance

3. **GEO_SELFIE Requirements:**
   - Must provide `geo_img` (Cloudinary URL)
   - Must provide `latitude` + `longitude` (non-null)
   - Image must be uploaded within 5 minutes of GPS capture (prevent old photos)

4. **MANUAL Requirements:**
   - Can only be created by `role_id >= 3` (SUPERVISOR+)
   - `verified_by` must equal current user's `user_id`
   - Pre-verified (`is_verified = 1` on creation)

### Verification Rules

1. **Approval Authority:** Only SUPERVISOR+ roles can verify
2. **Self-Verification Prohibited:** Supervisor cannot verify own attendance (business logic check)
3. **Verification Window:** GEO_SELFIE records older than 24 hours auto-expire if not verified
4. **Rejection Cleanup:** Rejected attendance records and geo_data are deleted (hard delete)

---

## Data Flow Diagrams

### Daily Attendance Report Generation

```
ADMIN/MHO               BACKEND                 DATABASE
    │                      │                       │
    │ 1. GET /reports/     │                       │
    │    attendance?       │                       │
    │    date=2024-01-15   │                       │
    ├─────────────────────→│                       │
    │                      │ 2. Aggregate query    │
    │                      ├──────────────────────→│
    │                      │ SELECT                │
    │                      │   u.name,             │
    │                      │   a.att_type,         │
    │                      │   a.is_verified,      │
    │                      │   a.created_at,       │
    │                      │   verifier.name AS    │
    │                      │    verified_by_name   │
    │                      │ FROM attendance a     │
    │                      │ JOIN users u ON       │
    │                      │  a.user_id=u.user_id  │
    │                      │ LEFT JOIN users       │
    │                      │  verifier ON          │
    │                      │  a.verified_by=       │
    │                      │  verifier.user_id     │
    │                      │ WHERE DATE(a.         │
    │                      │  created_at)=?        │
    │                      │←──────────────────────┤
    │ 3. Report data       │                       │
    │←─────────────────────┤                       │
    │    [{name: "Worker", │                       │
    │      att_type: "GEO",│                       │
    │      verified: true, │                       │
    │      time: "09:30"}] │                       │
    │                      │                       │
```

---

## Performance Considerations

### Attendance History Queries

**Problem:** Fetching attendance for all workers in a division (100+ workers × 30 days = 3000+ rows).

**Solution 1: Date Range Filtering**

```sql
-- Use indexed date range
SELECT * FROM attendance 
WHERE user_id IN (SELECT user_id FROM trashman_assignment WHERE route_id IN (...))
  AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
ORDER BY created_at DESC;

-- Index: idx_attendance_user_created already optimizes this
```

**Solution 2: Redis Caching**

```javascript
// Cache today's attendance status (5-minute TTL)
const cacheKey = `attendance:today:${userId}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const attendance = await db.query(`
    SELECT * FROM attendance 
    WHERE user_id = ? AND DATE(created_at) = CURDATE()
`, [userId]);

await redis.setex(cacheKey, 300, JSON.stringify(attendance));
```

### Image Storage Optimization

**Cloudinary Configuration:**

```javascript
// Upload with transformations (reduce bandwidth)
const uploadResult = await cloudinary.uploader.upload(file, {
    folder: 'attendance_selfies',
    transformation: [
        { width: 800, height: 800, crop: 'limit' },  // Max 800x800px
        { quality: 'auto' },                         // Auto quality
        { fetch_format: 'auto' }                     // Auto format (WebP/AVIF)
    ]
});

// Store optimized URL
const geoImgUrl = uploadResult.secure_url;
```

**Benefits:**
- Reduced image size (original 3MB → optimized 200KB)
- Faster frontend loading (attendance review dashboard)

---

## Audit & Compliance

### Payroll Integration

**Export Verified Attendance:**

```sql
-- Monthly attendance export (CSV format)
SELECT 
    u.user_id,
    u.name,
    COUNT(*) AS days_present,
    SUM(CASE WHEN a.att_type = 'GEO_SELFIE' THEN 1 ELSE 0 END) AS geo_verified,
    SUM(CASE WHEN a.att_type = 'MANUAL' THEN 1 ELSE 0 END) AS manual_entries
FROM attendance a
JOIN users u ON a.user_id = u.user_id
WHERE a.is_verified = 1
  AND YEAR(a.created_at) = 2024
  AND MONTH(a.created_at) = 1
GROUP BY u.user_id;
```

**Output:**

```csv
user_id,name,days_present,geo_verified,manual_entries
123,Worker A,22,20,2
124,Worker B,25,25,0
125,Worker C,18,15,3
```

### Fraud Detection

**Suspicious Patterns:**

```sql
-- Workers with unusual geo-selfie rejection rates
SELECT 
    u.user_id,
    u.name,
    COUNT(*) AS total_submissions,
    SUM(CASE WHEN a.is_verified = 1 THEN 1 ELSE 0 END) AS approved,
    SUM(CASE WHEN a.is_verified = 0 THEN 1 ELSE 0 END) AS pending,
    (SUM(CASE WHEN a.is_verified = 0 THEN 1 ELSE 0 END) / COUNT(*)) AS rejection_rate
FROM attendance a
JOIN users u ON a.user_id = u.user_id
WHERE a.att_type = 'GEO_SELFIE'
GROUP BY u.user_id
HAVING rejection_rate > 0.3;  -- Flag if >30% unverified
```

**GPS Spoofing Detection (Future):**

```sql
-- Workers with identical GPS coordinates on multiple days (copy-paste attack)
SELECT 
    ga.latitude,
    ga.longitude,
    COUNT(DISTINCT DATE(a.created_at)) AS distinct_days,
    GROUP_CONCAT(DISTINCT u.name) AS workers
FROM geo_attendance ga
JOIN attendance a ON ga.att_id = a.att_id
JOIN users u ON a.user_id = u.user_id
GROUP BY ga.latitude, ga.longitude
HAVING distinct_days > 3;  -- Same location >3 days = suspicious
```

---

## API Endpoints

### `POST /api/attendance` (Worker - GEO_SELFIE)

**Request:**

```json
{
    "user_id": 456,
    "att_type": "GEO_SELFIE",
    "geo_img": "https://res.cloudinary.com/.../selfie.jpg",
    "latitude": 11.01234567,
    "longitude": 76.98765432
}
```

**Response:**

```json
{
    "att_id": 123,
    "status": "pending_verification",
    "created_at": "2024-01-15T09:30:00Z"
}
```

---

### `POST /api/attendance/manual` (Supervisor)

**Request Headers:**

```
Authorization: Bearer <supervisor_jwt>
```

**Request Body:**

```json
{
    "user_id": 456,
    "att_type": "MANUAL"
}
```

**Response:**

```json
{
    "att_id": 124,
    "status": "verified",
    "verified_by": 789,
    "created_at": "2024-01-15T09:45:00Z"
}
```

---

### `PATCH /api/attendance/:id/approve` (Supervisor)

**Response:**

```json
{
    "att_id": 123,
    "status": "approved",
    "verified_by": 789,
    "updated_at": "2024-01-15T10:00:00Z"
}
```

---

### `DELETE /api/attendance/:id` (Supervisor - Reject)

**Response:**

```json
{
    "message": "Attendance rejected and deleted",
    "att_id": 123
}
```

---

### `GET /api/attendance/pending` (Supervisor)

**Response:**

```json
{
    "pending_verifications": [
        {
            "att_id": 123,
            "worker": {
                "user_id": 456,
                "name": "Worker Smith"
            },
            "geo_img": "https://res.cloudinary.com/.../selfie.jpg",
            "latitude": 11.01234567,
            "longitude": 76.98765432,
            "created_at": "2024-01-15T09:30:00Z"
        }
    ]
}
```

---

## Related Documentation

- [Overview](../overview.md) - Attendance domain overview
- [Architecture](../architecture.md) - Attendance verification system
- [Enums](../enums.md) - att_type specification
- [Domain: Routing & Assignment](./routing-assignment.md) - Worker assignments
- [Table: attendance](../tables/attendance.md) - Attendance table details
- [Table: geo_attendance](../tables/geo_attendance.md) - Geo-attendance details
- [Performance](../performance.md) - Attendance query optimization
