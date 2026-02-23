# Database Documentation - Docusaurus Site

Complete database documentation for the Trash Management SaaS platform, built with Docusaurus v3.9.2.

---

## Quick Start

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm start
```

Opens browser at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

Generates static files in `build/` directory.

### Serve Production Build

```bash
npm run serve
```

---

## Documentation Structure

```
dataBase/
├── docs/                          # All documentation content
│   ├── intro.md                  # Homepage
│   ├── overview.md               # Database overview
│   ├── architecture.md           # Architecture & ERD
│   ├── enums.md                  # ENUM types reference
│   ├── performance.md            # Optimization guide
│   ├── domains/                  # 6 domain-specific guides
│   │   ├── user-auth.md
│   │   ├── complaints.md
│   │   ├── routing-assignment.md
│   │   ├── attendance.md
│   │   ├── quiz-certification.md
│   │   └── rating-feedback.md
│   └── tables/                   # 16 table documentation files
│       ├── role.md
│       ├── users.md
│       ├── auth_otp.md
│       ├── geographic-hierarchy.md  # 7 tables consolidated
│       ├── trashman_assignment.md
│       ├── division_officers.md
│       ├── attendance.md
│       ├── geo_attendance.md
│       ├── resident_complaints.md
│       ├── immediate_tasks.md
│       ├── question_db.md
│       ├── quiz_total_score_time.md
│       ├── quiz_management.md
│       ├── quiz_history.md
│       ├── rating_auth.md
│       └── rating.md
├── static/
│   └── img/
│       └── database_diagram.png  # Complete ERD
├── src/
│   └── css/
│       └── custom.css           # Custom styling
├── docusaurus.config.js         # Site configuration
├── sidebars.js                  # Navigation structure
└── package.json
```

---

## Features

- **Comprehensive Coverage**: 22 database tables, 8 ENUM types, 7 functional domains
- **Interactive Navigation**: Collapsible sidebar with organized categories
- **Search Functionality**: Full-text search across all documentation
- **Dark Mode Support**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly documentation
- **SQL Syntax Highlighting**: Formatted code blocks for queries
- **Cross-References**: Links between related documents

---

## Port Configuration

This site runs on **port 3001** to avoid conflicts with:
- Frontend docs (port 3000)
- Backend API Swagger UI (port 5000)

---

## Related Documentation

- **Frontend Docs**: `client/docs/` (Docusaurus site at `http://localhost:3000`)
- **Backend API**: `server/docs/api/` (OpenAPI spec with Swagger UI at `http://localhost:5000/api-docs`)
- **Source of Truth**: `server/reference/db.reference` (Complete schema reference)

---

## Troubleshooting

### Port Already in Use

If port 3001 is busy, edit `package.json`:

```json
"start": "docusaurus start --port 3002"
```

### Build Errors

```bash
npm run clear
npm install
npm start
```

### MDX Compilation Errors

- Ensure `<` symbols are escaped as `&lt;` in markdown
- Check that all internal links point to existing files
- Verify image paths in `static/img/`

---

## Deployment

### GitHub Pages

```bash
npm run build
npm run deploy
```

### Static Hosting

Upload `build/` folder to any static host (Netlify, Vercel, AWS S3, etc.)

---

## Maintenance

### Adding New Tables

1. Create `docs/tables/new_table.md`
2. Add to `sidebars.js` under appropriate category
3. Link from relevant domain docs

### Updating Diagrams

Replace `static/img/database_diagram.png` with new ERD

### Schema Changes

Update corresponding table docs and rebuild site

---

**Last Updated**: February 2026  
**Docusaurus Version**: 3.9.2  
**Database**: MySQL 8.0+ / TiDB Cloud
