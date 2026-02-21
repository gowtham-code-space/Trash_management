# Deployment

## Overview

This guide covers deploying the frontend application to various hosting platforms optimized for static site deployment.

---

## Build Process

### Production Build

```bash
cd client
npm run build
```

**Output**: `dist/` directory containing:
- `index.html`
- `/assets/` (JS, CSS, images with hash filenames)

**Build Optimizations**:
- Minification (JS, CSS)
- Tree shaking (removes unused code)
- Asset hashing (cache busting)
- Code splitting (vendor chunks)

---

## Environment Configuration

### Production Environment Variables

Create `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

**Important**: Never commit `.env.production` with real values. Use CI/CD secrets instead.

---

## Deployment Platforms

### 1. Vercel (Recommended)

**Prerequisites**: GitHub, GitLab, or Bitbucket repository

**Steps**:

1. Push code to repository
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_API_BASE_URL`
6. Deploy

**Subsequent Deployments**: Automatic on git push

**Custom Domain**:
- Add domain in Vercel dashboard
- Update DNS records (provided by Vercel)

---

### 2. Netlify

**Steps**:

1. Create `netlify.toml` in `client/` directory:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  VITE_API_BASE_URL = "https://api.yourdomain.com/api"
```

2. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

3. Login and deploy:

```bash
cd client
netlify login
netlify deploy --prod
```

**Or via Netlify UI**:
- Connect repository
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variables

---

### 3. GitHub Pages

**Prerequisites**: GitHub repository

**Steps**:

1. Install `gh-pages` package:

```bash
npm install --save-dev gh-pages
```

2. Update `client/vite.config.js`:

```javascript
export default defineConfig({
  base: '/repository-name/',  // Replace with your repo name
  // ... other config
});
```

3. Add deployment scripts to `client/package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

4. Deploy:

```bash
npm run deploy
```

5. Enable GitHub Pages:
   - Repository Settings → Pages
   - Source: `gh-pages` branch

**Note**: GitHub Pages only serves static files. API calls must go to external backend.

---

### 4. AWS S3 + CloudFront

**For Enterprise Deployments**

**Steps**:

1. Create S3 bucket with static website hosting enabled
2. Build application: `npm run build`
3. Upload `dist/` contents to S3
4. Configure CloudFront distribution for HTTPS
5. Set up Route 53 for custom domain

**AWS CLI Deployment**:

```bash
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

### 5. Docker + Nginx

**For Self-Hosted Deployments**

**Dockerfile**:

```dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:

```nginx
server {
  listen 80;
  server_name localhost;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  # Caching for static assets
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**Build and Run**:

```bash
docker build -t trash-management-frontend .
docker run -p 80:80 trash-management-frontend
```

---

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd client
          npm ci
      
      - name: Build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
        run: |
          cd client
          npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client
```

---

## Post-Deployment Checklist

- [ ] Verify all routes work (no 404s)
- [ ] Test API connectivity
- [ ] Check environment variables loaded correctly
- [ ] Validate HTTPS/SSL certificate
- [ ] Test responsiveness on mobile devices
- [ ] Verify theme toggle works
- [ ] Test authentication flow
- [ ] Check browser console for errors
- [ ] Test role-based routing
- [ ] Validate all static assets load

---

## Common Issues

### 404 on Page Refresh

**Problem**: Direct URL access returns 404

**Solution**: Configure server to serve `index.html` for all routes

**Vercel/Netlify**: Handled automatically

**Nginx**: Use `try_files $uri /index.html`

### Environment Variables Not Working

**Problem**: `import.meta.env.VITE_API_BASE_URL` is undefined

**Solutions**:
1. Ensure variable prefixed with `VITE_`
2. Rebuild after changing `.env.production`
3. Set in deployment platform UI

### CORS Errors

**Problem**: API requests blocked by CORS policy

**Solution**: Configure backend CORS to allow frontend domain:

```javascript
// Backend
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## Performance Optimization

### Enable Compression

**nginx**:
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

**Vercel**: Enabled by default

### CDN Caching

- Vercel/Netlify: Edge caching automatic
- CloudFront: Configure TTL for static assets

### Preloading Critical Resources

```html
<link rel="preload" href="/assets/main.js" as="script">
```

---

## Rollback Strategy

### Vercel/Netlify

- Deployments are versioned
- One-click rollback in dashboard

### GitHub Pages

```bash
git revert <commit-hash>
npm run deploy
```

### Docker

Tag images by version:

```bash
docker tag trash-frontend:latest trash-frontend:v1.2.3
docker push trash-frontend:v1.2.3
```

Rollback:

```bash
docker pull trash-frontend:v1.2.2
docker run trash-frontend:v1.2.2
```

---

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in for Vercel deployments
- **Google Analytics**: User behavior tracking
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging

### Integration Example (Sentry)

```javascript
// main.jsx
import * as Sentry from "@sentry/react";

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: "production"
  });
}
```
