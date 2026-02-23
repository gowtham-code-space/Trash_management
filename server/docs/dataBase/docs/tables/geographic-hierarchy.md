# Geographic Hierarchy Tables

This document covers the five-tier geographic hierarchy tables used for administrative organization and route management.

---

## Table: `district`

**Purpose:** Top-level administrative divisions (city/municipality level)

```sql
CREATE TABLE district (
    district_id BIGINT PRIMARY KEY,
    district_name VARCHAR(100) UNIQUE
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `district_id` | BIGINT (PK) | Unique district identifier |
| `district_name` | VARCHAR(100) |  District name (unique) |

### Example Data
```sql
INSERT INTO district (district_name) VALUES ('Coimbatore City'), ('Tiruppur District');
```

---

## Table: `zone`

**Purpose:** Mid-level regions within districts

```sql
CREATE TABLE zone (
    zone_id BIGINT PRIMARY KEY,
    district_id BIGINT,
    zone_name VARCHAR(100),
    
    CONSTRAINT fk_zone_district FOREIGN KEY (district_id) REFERENCES district(district_id)
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `zone_id` | BIGINT (PK) | Unique zone identifier |
| `district_id` | BIGINT (FK) | Parent district |
| `zone_name` | VARCHAR(100) | Zone name (e.g., "North Zone") |

### Common Queries

```sql
-- Find all zones in a district
SELECT * FROM zone WHERE district_id = ?;
```

---

## Table: `ward`

**Purpose:** Neighborhoods within zones

```sql
CREATE TABLE ward (
    ward_id BIGINT PRIMARY KEY,
    zone_id BIGINT,
    ward_number INT,
    ward_name VARCHAR(100),
    
    CONSTRAINT fk_ward_zone FOREIGN KEY (zone_id) REFERENCES zone(zone_id)
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `ward_id` | BIGINT (PK) | Unique ward identifier |
| `zone_id` | BIGINT (FK) | Parent zone |
| `ward_number` | INT | Ward number (for official records) |
| `ward_name` | VARCHAR(100) | Ward name (e.g., "Ward 45 - Gandhipuram") |

### Common Queries

```sql
-- Find wards in zone
SELECT * FROM ward WHERE zone_id = ?;
```

---

## Table: `ward_divisions`

**Purpose:** Subdivisions of wards for manageable administrative units

```sql
CREATE TABLE ward_divisions (
    division_id BIGINT PRIMARY KEY,
    ward_id BIGINT,
    division_name VARCHAR(100),
    
    CONSTRAINT fk_division_ward FOREIGN KEY (ward_id) REFERENCES ward(ward_id)
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `division_id` | BIGINT (PK) | Unique division identifier |
| `ward_id` | BIGINT (FK) | Parent ward |
| `division_name` | VARCHAR(100) | Division name (e.g., "Division A") |

**Use Case:** Assign supervisors/SIs to specific divisions for oversight.

---

## Table: `street`

**Purpose:** Individual streets within wards

```sql
CREATE TABLE street (
    street_id BIGINT PRIMARY KEY,
    ward_id BIGINT,
    street_name VARCHAR(100),
    
    CONSTRAINT fk_street_ward FOREIGN KEY (ward_id) REFERENCES ward(ward_id)
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `street_id` | BIGINT (PK) | Unique street identifier |
| `ward_id` | BIGINT (FK) | Parent ward |
| `street_name` | VARCHAR(100) | Street name (e.g., "Main Street") |

---

## Table: `route`

**Purpose:** Specific waste collection paths (may span multiple sections of same street)

```sql
CREATE TABLE route (
    route_id BIGINT PRIMARY KEY,
    route_name TEXT,
    start_time TIME,
    end_time TIME,
    is_active TINYINT(1)
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `route_id` | BIGINT (PK) | Unique route identifier |
| `route_name` | TEXT | Route name (e.g., "Main St Route A - North Side") |
| `start_time` | TIME | Collection start time |
| `end_time` | TIME | Collection end time |
| `is_active` | TINYINT(1) | 0=inactive, 1=active (for route planning) |

**Note:** Route does NOT have direct FK to street (linked via `street_divisions` table).

---

## Table: `street_divisions`

**Purpose:** Many-to-many mapping: routes ↔ ward_divisions

```sql
CREATE TABLE street_divisions (
    street_division_id BIGINT PRIMARY KEY,
    division_id BIGINT,
    street_id BIGINT,
    route_id BIGINT,
    
    CONSTRAINT fk_sd_division FOREIGN KEY (division_id) REFERENCES ward_divisions(division_id),
    CONSTRAINT fk_sd_street FOREIGN KEY (street_id) REFERENCES street(street_id),
    CONSTRAINT fk_sd_route FOREIGN KEY (route_id) REFERENCES route(route_id)
);
```

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `street_division_id` | BIGINT (PK) | Unique mapping record ID |
| `division_id` | BIGINT (FK) | Ward division covering this route |
| `street_id` | BIGINT (FK) | Street where route is located |
| `route_id` | BIGINT (FK) | Collection route |

**Explanation:** A route may span multiple divisions, and a division may cover multiple routes.

---

## Complete Hierarchy

```
District (City)
    ↓
 Zone (Region)
    ↓
 Ward (Neighborhood)
    ├→ Ward Divisions (Admin Units)
    │      ↓
    │   street_divisions (M:N mapping)
    │      ↓
    ↓    Route (Collection Path)
 Street (Road)
```

---

## Common Hierarchy Queries

### Find Routes in Ward

```sql
SELECT DISTINCT r.*
FROM route r
JOIN street_divisions sd ON r.route_id = sd.route_id
JOIN street s ON sd.street_id = s.street_id
WHERE s.ward_id = ?;
```

### Find Divisions Covering a Route

```sql
SELECT wd.*
FROM ward_divisions wd
JOIN street_divisions sd ON wd.division_id = sd.division_id
WHERE sd.route_id = ?;
```

### Full Hierarchy for Route

```sql
SELECT 
    d.district_name,
    z.zone_name,
    w.ward_name,
    s.street_name,
    r.route_name
FROM route r
JOIN street_divisions sd ON r.route_id = sd.route_id
JOIN street s ON sd.street_id = s.street_id
JOIN ward w ON s.ward_id = w.ward_id
JOIN zone z ON w.zone_id = z.zone_id
JOIN district d ON z.district_id = d.district_id
WHERE r.route_id = ?;
```

---

## Related Documentation

- [Domain: Routing & Assignment](../domains/routing-assignment.md) - Complete hierarchy workflows
- [Architecture](../architecture.md) - Geographic hierarchy design
- [Performance](../performance.md) - Hierarchy traversal optimization
