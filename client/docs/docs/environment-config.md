# Environment Configuration

## Overview

The application uses **Vite's environment variable system** for configuration management. Environment-specific variables are defined in `.env` files and accessed via `import.meta.env`.

## Environment Files

### File Naming Convention

| File | Purpose | Committed to Git |
|------|---------|------------------|
| `.env` | Base configuration (all environments) | ❌ No |
| `.env.local` | Local overrides (ignored by git) | ❌ No |
| `.env.development` | Development-specific config | ✅ Yes (no secrets) |
| `.env.production` | Production-specific config | ✅ Yes (no secrets) |

### Current Configuration

The project currently does **not** have `.env` files committed to the repository. Developers must create their own `.env` file locally.

---

## Environment Variables

### Required Variables

#### VITE_API_BASE_URL

**Description**: Backend API base URL

**Default**: `http://localhost:5000/api`

**Usage**:
```javascript
// src/services/core/apiClient.js
baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
```

**Development**:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Production**:
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

---

## Creating Environment Files

### Development Setup

1. Create `.env` in the `client/` directory:

```bash
# client/.env
VITE_API_BASE_URL=http://localhost:5000/api
```

2. Start the dev server:

```bash
npm run dev
```

3. Vite automatically loads variables prefixed with `VITE_`

### Production Build

1. Create `.env.production`:

```bash
# client/.env.production
VITE_API_BASE_URL=https://api.production-domain.com/api
```

2. Build the application:

```bash
npm run build
```

3. Vite uses `.env.production` values during build

---

## Accessing Environment Variables

### In Code

```javascript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const mode = import.meta.env.MODE;  // 'development' or 'production'
const isDev = import.meta.env.DEV;  // boolean
const isProd = import.meta.env.PROD;  // boolean
```

### Built-in Variables

Vite provides these variables automatically:

| Variable | Type | Description |
|----------|------|-------------|
| `import.meta.env.MODE` | `string` | App mode (`development`, `production`) |
| `import.meta.env.BASE_URL` | `string` | Base URL (from vite.config.js) |
| `import.meta.env.PROD` | `boolean` | True in production |
| `import.meta.env.DEV` | `boolean` | True in development |
| `import.meta.env.SSR` | `boolean` | True in server-side rendering |

---

## Security Best Practices

### ✅ Do

- Prefix all custom variables with `VITE_`
- Store API URLs and non-sensitive config in `.env`
- Use `.env.local` for local overrides (git-ignored)
- Commit `.env.example` with dummy values as a template

### ❌ Don't

- Store API keys, secrets, or tokens in `.env` files
- Commit actual `.env` files to version control
- Use environment variables without the `VITE_` prefix (they won't be exposed)
- Access `process.env` in client code (use `import.meta.env` instead)

### Example .env.example

Create this file for team documentation:

```bash
# .env.example
# Copy this file to .env and replace with actual values

# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Add other VITE_ prefixed variables here
```

---

## Deployment Platforms

### Vercel

Environment variables are configured in the Vercel dashboard:

1. Project Settings → Environment Variables
2. Add `VITE_API_BASE_URL`
3. Set scope (Production, Preview, Development)
4. Redeploy to apply changes

### Netlify

Configure in `netlify.toml` or dashboard:

```toml
# netlify.toml
[build.environment]
  VITE_API_BASE_URL = "https://api.yourdomain.com/api"
```

Or via Netlify UI: Site Settings → Build & Deploy → Environment

### GitHub Pages

GitHub Pages only serves static files, so environment variables must be baked into the build:

1. Set secrets in GitHub repository: Settings → Secrets and variables → Actions
2. Reference in GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
- name: Build
  run: npm run build
  env:
    VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
```

---

## TypeScript Support

For TypeScript projects, extend `vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // Add other VITE_ variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Runtime Configuration

For configuration that changes at runtime (not build time), use a `config.json` file in `/public`:

```json
{
  "apiUrl": "https://api.example.com/api",
  "features": {
    "enableChat": true,
    "enableNotifications": false
  }
}
```

Fetch it on app load:

```javascript
const response = await fetch('/config.json');
const config = await response.json();
```

**Use Case**: Multi-tenant deployments with different configs per instance

---

## Troubleshooting

### Variables Not Updating

**Problem**: Changed `.env` but values not updating

**Solution**: Restart the Vite dev server (Ctrl+C, then `npm run dev`)

### Variable Undefined

**Problem**: `import.meta.env.MY_VAR` is undefined

**Possible Causes**:
1. Missing `VITE_` prefix
2. Typo in variable name
3. Dev server not restarted
4. Variable not defined in `.env`

### Production Build Issues

**Problem**: Environment variables work in dev but not production

**Solution**: Ensure `.env.production` exists and variables are set correctly

---

## Recommended Setup

### For Development Teams

1. Create `.env.example`:

```bash
VITE_API_BASE_URL=http://localhost:5000/api
```

2. Add `.env` to `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

3. Document in README:

```markdown
## Environment Setup

1. Copy `.env.example` to `.env`
2. Update `VITE_API_BASE_URL` if backend runs on different port
3. Run `npm run dev`
```

### For CI/CD Pipelines

Set environment variables in CI platform (GitHub Actions, GitLab CI, etc.):

```yaml
# GitHub Actions example
jobs:
  build:
    steps:
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_URL }}
```

---

## Future Considerations

As the application grows, consider adding:

- `VITE_SOCKET_URL`: WebSocket server URL for real-time features
- `VITE_FIREBASE_CONFIG`: Firebase configuration (already integrated)
- `VITE_MAP_TILE_URL`: Custom map tile server URL for Leaflet
- `VITE_ANALYTICS_ID`: Analytics tracking ID
- `VITE_SENTRY_DSN`: Error tracking service DSN
