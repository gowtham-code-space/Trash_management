# Routing & Assignment Domain

This domain manages the geographic administrative hierarchy, waste collection routes, and worker assignment scheduling for the Trash Management System.

---

## Domain Overview

**Purpose:** Five-tier geographic hierarchy with worker-to-route assignments  
**Key Feature:** Hierarchical data model (District → Zone → Ward → Street → Route)  
**Tables:** 8 core tables across geography and assignments  
**External Dependencies:** User authentication (worker roles), complaint management (route references)

---

## Tables in Domain

| Table | Purpose | Record Volume | Growth Rate |
|-------|---------|---------------|-------------|
| `district` | Top-level administrative divisions (city-level) | ~10 districts | Static |
| `zone` | Mid-level regions within districts | ~50 zones | Rare additions |
| `ward` | Neighborhoods within zones | ~200 wards | Occasional growth |
| `ward_divisions` | Subdivisions of wards for management | ~500 divisions | Moderate growth |
| `street` | Individual streets within wards | ~5,000 streets | Regular updates |
| `route` | Specific collection paths on streets | ~1,500 routes | Frequent rebalancing |
| `street_divisions` | Many-to-many: routes ↔ divisions | ~3,000 mappings | Dynamic |
| `trashman_assignment` | Worker assignments to routes | ~1,000 assignments | Daily updates |

---

## Geographic Hierarchy

### Five-Tier Structure

```
┌──────────────────────────────────────────────────────┐
│                    DISTRICT                          │
│         (Top-level: City/Municipality)               │
│                                                      │
│  Example: "Coimbatore City"                          │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ 1:N relationship
                     ↓
┌──────────────────────────────────────────────────────┐
│                      ZONE                            │
│         (Administrative Region)                      │
│                                                      │
│  Example: "North Zone", "South Zone"                 │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ 1:N relationship
                     ↓
┌──────────────────────────────────────────────────────┐
│                      WARD                            │
│              (Neighborhood)                          │
│                                                      │
│  Example: "Ward 45", "Gandhipuram Ward"              │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ 1:N relationship (two branches)
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
┌─────────────────┐   ┌─────────────────────────────┐
│ WARD_DIVISIONS  │   │        STREET               │
│   (Mgmt Units)  │   │   (Individual Roads)        │
│                 │   │                             │
│ Example:        │   │ Example:                    │
│ "Division A",   │   │ "Main Street",              │
│ "Division B"    │   │ "Park Avenue"               │
└─────────────────┘   └──────────┬──────────────────┘
                                 │
                                 │ 1:N relationship
                                 ↓
                      ┌─────────────────────────────┐
                      │         ROUTE               │
                      │  (Collection Path)          │
                      │                             │
                      │ Example:                    │
                      │ "Main St Route A"           │
                      │ "Main St Route B"           │
                      └─────────────────────────────┘
```

### Relationship Mapping

**District ↔ Zone (1:N)**

```sql
-- Find all zones in a district
SELECT * FROM zone WHERE district_id = ?;

-- Example result:
-- zone_id | zone_name    | district_id
-- 1       | North Zone   | 1
-- 2       | South Zone   | 1
-- 3       | East Zone    | 1
```

**Zone ↔ Ward (1:N)**

```sql
-- Find all wards in a zone
SELECT * FROM ward WHERE zone_id = ?;

-- Count wards per zone
SELECT z.zone_name, COUNT(w.ward_id) AS ward_count
FROM zone z
LEFT JOIN ward w ON z.zone_id = w.zone_id
GROUP BY z.zone_id;
```

**Ward ↔ Ward Divisions (1:N)**

```sql
-- Find divisions in a ward
SELECT * FROM ward_divisions WHERE ward_id = ?;

-- Hierarchy: Ward 45 → Division A, Division B, Division C
```

**Ward ↔ Street (1:N)**

```sql
-- Find streets in a ward
SELECT * FROM street WHERE ward_id = ?;

-- Note: A street belongs to exactly one ward
```

**Street ↔ Route (1:N)**

```sql
-- Find routes on a street
SELECT * FROM route WHERE street_id = ?;

-- Example: "Main Street" may have:
-- - Main St Route A (north side)
-- - Main St Route B (south side)
```

**Route ↔ Ward Divisions (M:N via street_divisions)**

```sql
-- Find which divisions serve a route
SELECT wd.* 
FROM ward_divisions wd
JOIN street_divisions sd ON wd.division_id = sd.division_id
WHERE sd.route_id = ?;

-- Find which routes a division manages
SELECT r.* 
FROM route r
JOIN street_divisions sd ON r.route_id = sd.route_id
WHERE sd.division_id = ?;
```

---

## Worker Assignment Model

### Assignment Table Structure

```sql
CREATE TABLE trashman_assignment (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,           -- FK to users (role_id = TRASHMAN)
    route_id INT NOT NULL,          -- FK to route
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    updated_at DATETIME DEFAULT UTC_TIMESTAMP() ON UPDATE UTC_TIMESTAMP(),
    
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_assignment_route FOREIGN KEY (route_id) REFERENCES route(route_id),
    UNIQUE KEY unique_user_route (user_id, route_id)
);
```

**Key Design Choices:**

1. **One Worker, Multiple Routes:** Worker can be assigned to multiple routes (no uniqueness on user_id alone)
2. **No Route Overlap:** Each route can have only one primary worker (UNIQUE constraint on route_id would enforce this, but current schema allows backup workers)
3. **No Time Constraints:** Assignments are permanent until explicitly deleted (no `start_date`/`end_date`)

### Assignment Workflow

**MHO Assigns Worker to Route:**

```sql
-- Check if route already has a worker
SELECT * FROM trashman_assignment WHERE route_id = ?;

-- If no assignment exists, create new
INSERT INTO trashman_assignment (user_id, route_id)
VALUES (?, ?);

-- If assignment exists, update worker
UPDATE trashman_assignment 
SET user_id = ?, updated_at = UTC_TIMESTAMP()
WHERE route_id = ?;
```

**Find Worker's Assigned Routes:**

```sql
SELECT r.route_id, r.route_name, s.street_name, w.ward_name
FROM trashman_assignment ta
JOIN route r ON ta.route_id = r.route_id
JOIN street s ON r.street_id = s.street_id
JOIN ward w ON s.ward_id = w.ward_id
WHERE ta.user_id = ?;
```

**Find Available Routes (Unassigned):**

```sql
SELECT r.* 
FROM route r
LEFT JOIN trashman_assignment ta ON r.route_id = ta.route_id
WHERE ta.assignment_id IS NULL;
```

---

## Division Officers Management

### Purpose

The `division_officers` table maps supervisory roles (SUPERVISOR, SI, MHO) to specific ward divisions for geographic responsibility.

### Schema

```sql
CREATE TABLE division_officers (
    division_officer_id INT PRIMARY KEY AUTO_INCREMENT,
    division_id INT NOT NULL,       -- FK to ward_divisions
    user_id INT NOT NULL,           -- FK to users (role ≥ SUPERVISOR)
    role_type VARCHAR(50),          -- 'SUPERVISOR', 'SI', 'MHO'
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_division_officer_division FOREIGN KEY (division_id) REFERENCES ward_divisions(division_id),
    CONSTRAINT fk_division_officer_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

**Use Cases:**

**1. Supervisor Oversight:**

```sql
-- Supervisor assigned to Division A
INSERT INTO division_officers (division_id, user_id, role_type)
VALUES (?, ?, 'SUPERVISOR');

-- Find all complaints in supervisor's divisions
SELECT rc.* 
FROM resident_complaints rc
JOIN route r ON rc.route_id = r.route_id
JOIN street_divisions sd ON r.route_id = sd.route_id
JOIN division_officers doff ON sd.division_id = doff.division_id
WHERE doff.user_id = ? AND doff.role_type = 'SUPERVISOR';
```

**2. SI Zone Monitoring:**

```sql
-- SI assigned to multiple divisions in a zone
INSERT INTO division_officers (division_id, user_id, role_type)
VALUES 
    (1, ?, 'SI'),  -- Division A
    (2, ?, 'SI'),  -- Division B
    (3, ?, 'SI');  -- Division C

-- SI views all tasks in assigned divisions
SELECT it.* 
FROM immediate_tasks it
JOIN division_officers doff ON it.division_id = doff.division_id
WHERE doff.user_id = ? AND doff.role_type = 'SI';
```

**3. MHO District-Wide View:**

```sql
-- MHO oversees entire district (all divisions in all wards in all zones)
SELECT DISTINCT doff.division_id
FROM division_officers doff
JOIN ward_divisions wd ON doff.division_id = wd.division_id
JOIN ward w ON wd.ward_id = w.ward_id
JOIN zone z ON w.zone_id = z.zone_id
WHERE z.district_id = ? AND doff.role_type = 'MHO';
```

---

## Data Flow Diagrams

### Route Assignment Flow

```
MHO                     BACKEND                  DATABASE
 │                         │                        │
 │ 1. GET /routes/         │                        │
 │    unassigned           │                        │
 ├────────────────────────→│                        │
 │                         │ 2. Fetch unassigned    │
 │                         ├───────────────────────→│
 │                         │ SELECT r.*             │
 │                         │ FROM route r           │
 │                         │ LEFT JOIN trashman_    │
 │                         │  assignment ta         │
 │                         │ ON r.route_id =        │
 │                         │  ta.route_id           │
 │                         │ WHERE ta.assignment_id │
 │                         │  IS NULL               │
 │                         │←───────────────────────┤
 │ 3. Unassigned routes    │                        │
 │←────────────────────────┤                        │
 │    [{route_id: 123,     │                        │
 │      route_name: ...}]  │                        │
 │                         │                        │
 │ 4. POST /assignments    │                        │
 │    {user_id: 456,       │                        │
 │     route_id: 123}      │                        │
 ├────────────────────────→│                        │
 │                         │ 5. Validate worker     │
 │                         ├───────────────────────→│
 │                         │ SELECT * FROM users    │
 │                         │ WHERE user_id = ? AND  │
 │                         │ role_id = 2 (TRASHMAN) │
 │                         │←───────────────────────┤
 │                         │                        │
 │                         │ 6. Create assignment   │
 │                         ├───────────────────────→│
 │                         │ INSERT INTO trashman_  │
 │                         │ assignment             │
 │                         │ (user_id, route_id)    │
 │                         │←───────────────────────┤
 │                         │  (assignment_id=789)   │
 │                         │                        │
 │ 7. Success response     │                        │
 │←────────────────────────┤                        │
 │    {assignment_id: 789} │                        │
 │                         │                        │
```

### Geographic Hierarchy Traversal

```
FRONTEND                BACKEND                  DATABASE
    │                      │                        │
    │ 1. User selects      │                        │
    │    district          │                        │
    ├─────────────────────→│                        │
    │    {district_id: 1}  │                        │
    │                      │ 2. Fetch zones         │
    │                      ├───────────────────────→│
    │                      │ SELECT * FROM zone     │
    │                      │ WHERE district_id = 1  │
    │                      │←───────────────────────┤
    │ 3. Zone list         │                        │
    │←─────────────────────┤                        │
    │    [{zone_id: 1,     │                        │
    │      zone_name: ...}]│                        │
    │                      │                        │
    │ 4. User selects zone │                        │
    ├─────────────────────→│                        │
    │    {zone_id: 1}      │                        │
    │                      │ 5. Fetch wards         │
    │                      ├───────────────────────→│
    │                      │ SELECT * FROM ward     │
    │                      │ WHERE zone_id = 1      │
    │                      │←───────────────────────┤
    │ 6. Ward list         │                        │
    │←─────────────────────┤                        │
    │                      │                        │
    │ 7. User selects ward │                        │
    ├─────────────────────→│                        │
    │    {ward_id: 45}     │                        │
    │                      │ 8. Fetch streets       │
    │                      ├───────────────────────→│
    │                      │ SELECT * FROM street   │
    │                      │ WHERE ward_id = 45     │
    │                      │←───────────────────────┤
    │ 9. Street list       │                        │
    │←─────────────────────┤                        │
    │                      │                        │
    │10. User selects      │                        │
    │    street            │                        │
    ├─────────────────────→│                        │
    │    {street_id: 789}  │                        │
    │                      │11. Fetch routes        │
    │                      ├───────────────────────→│
    │                      │ SELECT * FROM route    │
    │                      │ WHERE street_id = 789  │
    │                      │←───────────────────────┤
    │12. Route list        │                        │
    │←─────────────────────┤                        │
    │    [{route_id: 123,  │                        │
    │      route_name: ... │                        │
    │      assigned_worker:│                        │
    │       "Worker Name"}]│                        │
    │                      │                        │
```

---

## Database Schema

### `district` Table

```sql
CREATE TABLE district (
    district_id INT PRIMARY KEY AUTO_INCREMENT,
    district_name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP()
);
```

**Example Data:**

```sql
INSERT INTO district (district_name) VALUES 
('Coimbatore City'),
('Tiruppur District'),
('Erode District');
```

---

### `zone` Table

```sql
CREATE TABLE zone (
    zone_id INT PRIMARY KEY AUTO_INCREMENT,
    zone_name VARCHAR(255) NOT NULL,
    district_id INT NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_zone_district FOREIGN KEY (district_id) REFERENCES district(district_id)
);
```

**Example Data:**

```sql
INSERT INTO zone (zone_name, district_id) VALUES 
('North Zone', 1),
('South Zone', 1),
('East Zone', 1),
('West Zone', 1);
```

---

### `ward` Table

```sql
CREATE TABLE ward (
    ward_id INT PRIMARY KEY AUTO_INCREMENT,
    ward_name VARCHAR(255) NOT NULL,
    zone_id INT NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_ward_zone FOREIGN KEY (zone_id) REFERENCES zone(zone_id)
);
```

**Example Data:**

```sql
INSERT INTO ward (ward_name, zone_id) VALUES 
('Ward 1 - Gandhipuram', 1),
('Ward 2 - RS Puram', 1),
('Ward 45 - Saibaba Colony', 1);
```

---

### `ward_divisions` Table

```sql
CREATE TABLE ward_divisions (
    division_id INT PRIMARY KEY AUTO_INCREMENT,
    division_name VARCHAR(255) NOT NULL,
    ward_id INT NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_division_ward FOREIGN KEY (ward_id) REFERENCES ward(ward_id)
);
```

**Purpose:** Subdivide large wards into manageable units for supervisor assignment.

**Example Data:**

```sql
INSERT INTO ward_divisions (division_name, ward_id) VALUES 
('Division A', 1),
('Division B', 1),
('Division C', 1);
```

---

### `street` Table

```sql
CREATE TABLE street (
    street_id INT PRIMARY KEY AUTO_INCREMENT,
    street_name VARCHAR(255) NOT NULL,
    ward_id INT NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_street_ward FOREIGN KEY (ward_id) REFERENCES ward(ward_id)
);
```

**Example Data:**

```sql
INSERT INTO street (street_name, ward_id) VALUES 
('Main Street', 1),
('Park Avenue', 1),
('Lake Road', 1);
```

---

### `route` Table

```sql
CREATE TABLE route (
    route_id INT PRIMARY KEY AUTO_INCREMENT,
    route_name VARCHAR(255) NOT NULL,
    street_id INT NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_route_street FOREIGN KEY (street_id) REFERENCES street(street_id)
);
```

**Purpose:** Specific collection paths on a street (e.g., north side vs south side).

**Example Data:**

```sql
INSERT INTO route (route_name, street_id) VALUES 
('Main Street Route A - North Side', 1),
('Main Street Route B - South Side', 1),
('Park Avenue Route', 2);
```

---

### `street_divisions` Table (Many-to-Many)

```sql
CREATE TABLE street_divisions (
    street_division_id INT PRIMARY KEY AUTO_INCREMENT,
    route_id INT NOT NULL,
    division_id INT NOT NULL,
    created_at DATETIME DEFAULT UTC_TIMESTAMP(),
    
    CONSTRAINT fk_sd_route FOREIGN KEY (route_id) REFERENCES route(route_id),
    CONSTRAINT fk_sd_division FOREIGN KEY (division_id) REFERENCES ward_divisions(division_id)
);
```

**Purpose:** Map routes to divisions (route may span multiple divisions, division may cover multiple routes).

**Example Data:**

```sql
-- Route 1 (Main St Route A) is managed by Division A and Division B
INSERT INTO street_divisions (route_id, division_id) VALUES 
(1, 1),  -- Route 1, Division A
(1, 2);  -- Route 1, Division B
```

---

### `trashman_assignment` Table

(See schema above in Worker Assignment Model section)

---

### `division_officers` Table

(See schema above in Division Officers Management section)

---

## Business Rules

### Geographic Hierarchy Rules

1. **No Orphan Records:** Every child must reference valid parent (enforced by FK constraints)
2. **Immutable Hierarchy:** Once created, hierarchy levels rarely change (historical data integrity)
3. **Unique Naming:** Within same parent, names must be unique (e.g., no duplicate zones in one district)

### Assignment Rules

1. **Worker Eligibility:** Only `role_id = 2` (TRASHMAN) can be assigned to routes
2. **No Double Assignment:** Each route should have at most one active assignment (enforced via UNIQUE constraint on route_id if configured)
3. **Assignment Persistence:** Assignments remain until explicitly deleted (no auto-expiry)

### Division Officer Rules

1. **Role Validation:** `role_type` must match user's actual role in `users` table
2. **Multi-Division Assignment:** Supervisor/SI/MHO can be assigned to multiple divisions
3. **Division Overlap:** Multiple officers of different roles can be assigned to same division

---

## API Endpoints

### `GET /api/routes?ward_id=45`

**Response:**

```json
{
    "routes": [
        {
            "route_id": 123,
            "route_name": "Main Street Route A",
            "street": {
                "street_id": 789,
                "street_name": "Main Street"
            },
            "assigned_worker": {
                "user_id": 456,
                "name": "Worker Smith"
            }
        }
    ]
}
```

### `POST /api/assignments`

**Request:**

```json
{
    "user_id": 456,
    "route_id": 123
}
```

**Response:**

```json
{
    "assignment_id": 789,
    "message": "Worker assigned to route successfully"
}
```

### `GET /api/hierarchy?district_id=1`

**Response:**

```json
{
    "district": {
        "district_id": 1,
        "district_name": "Coimbatore City"
    },
    "zones": [
        {
            "zone_id": 1,
            "zone_name": "North Zone",
            "wards": [
                {
                    "ward_id": 1,
                    "ward_name": "Ward 1 - Gandhipuram",
                    "divisions": [
                        {
                            "division_id": 1,
                            "division_name": "Division A"
                        }
                    ],
                    "streets": [
                        {
                            "street_id": 1,
                            "street_name": "Main Street",
                            "routes": [
                                {
                                    "route_id": 1,
                                    "route_name": "Main St Route A"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
```

---

## Performance Considerations

### Hierarchy Traversal Optimization

**Problem:** Fetching entire hierarchy requires multiple JOINs (6+ tables).

**Solution 1: Cached Hierarchy JSON**

```javascript
// Redis cache (24-hour TTL - hierarchy changes rarely)
const cacheKey = `hierarchy:district:${districtId}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

// Build hierarchy tree
const hierarchy = await buildHierarchyTree(districtId);
await redis.setex(cacheKey, 86400, JSON.stringify(hierarchy));
```

**Solution 2: Materialized Path (Future Enhancement)**

```sql
-- Add materialized path column to route table
ALTER TABLE route ADD COLUMN hierarchy_path VARCHAR(500);

-- Example path: /1/2/3/4/5 (district_id/zone_id/ward_id/street_id/route_id)
UPDATE route SET hierarchy_path = '/1/2/3/789/123' WHERE route_id = 123;

-- Fast prefix search for "all routes in district 1"
SELECT * FROM route WHERE hierarchy_path LIKE '/1/%';
```

### Assignment Lookup Optimization

```sql
-- Index for finding worker's routes
CREATE INDEX idx_assignment_user ON trashman_assignment(user_id);

-- Index for finding route's worker
CREATE INDEX idx_assignment_route ON trashman_assignment(route_id);
```

---

## Related Documentation

- [Overview](../overview.md) - Geographic hierarchy domain
- [Architecture](../architecture.md) - Administrative structure design
- [Domain: Complaints](./complaints.md) - Route-based complaint routing
- [Domain: Attendance](./attendance.md) - Route-based attendance tracking
- [Table: Geographic Hierarchy](../tables/geographic-hierarchy.md#table-route) - Route table details
- [Table: trashman_assignment](../tables/trashman_assignment.md) - Assignment details
