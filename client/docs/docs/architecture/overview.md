# Architecture Overview

## System Architecture

The frontend application follows a layered architecture pattern with clear separation of concerns.

```
┌─────────────────────────────────────────────────┐
│            Presentation Layer                    │
│         (React Components + Pages)               │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         Application Layer                        │
│      (Routing + State Management)                │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│           Service Layer                          │
│     (API Client + Feature Services)              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│         Backend API (External)                   │
│      http://localhost:5000/api                   │
└─────────────────────────────────────────────────┘
```

## Layer Responsibilities

### Presentation Layer

**Location**: `src/pages/` and `src/components/`

**Responsibilities**:
- Render UI based on application state
- Handle user interactions
- Display data received from services
- Manage local component state
- Implement responsive layouts

**Key Characteristics**:
- Pure React functional components
- Uses hooks for lifecycle and state
- Styled with Tailwind CSS utility classes
- Role-specific page organization

### Application Layer

**Location**: `src/Navigation/` and `src/store/`

**Routing** (`Navigator.jsx`):
- Defines all application routes
- Implements role-based route protection
- Manages route hierarchy
- Handles 404 fallbacks

**State Management** (Zustand stores):
- `authStore`: User session and authentication state
- `ThemeStore`: Dark/light mode preferences

### Service Layer

**Location**: `src/services/`

**Core Services** (`services/core/`):
- `apiClient.js`: Axios instance with interceptors
- `apiMethods.js`: Reusable HTTP method wrappers
- `session.js`: Token management and refresh logic

**Feature Services** (`services/features/`):
- `authService.js`: Authentication operations
- `quizService.js`: Quiz-related API calls
- `idCardService.js`: Identity card data fetching
- `settingsService.js`: User settings operations

## Data Flow Patterns

### Unidirectional Data Flow

```
User Action → Component Event Handler → Service Call → API Request
                                                            ↓
Component Render ← State Update ← Store Mutation ← API Response
```

### Example: User Login Flow

1. **User Input**: User enters email in Login.jsx
2. **Validation**: Client-side email format validation
3. **Service Call**: `authService.requestOtp(email)`
4. **API Request**: POST /auth/request-otp
5. **Response Handling**: Display OTP modal
6. **OTP Verification**: `authService.verifyOtp(email, otp)`
7. **Session Creation**: Access token stored in authStore
8. **Navigation**: Redirect to role-specific dashboard

### Role-Based Rendering

```javascript
const user = useAuthStore((state) => state.user);

{Number(user?.role_id) === 1 && (
  <Route path="/" element={<ResidentHome />} />
)}

{Number(user?.role_id) === 2 && (
  <Route path="/" element={<TrashManDashboard />} />
)}
```

## Authentication & Session Management

### Authentication Mechanism

- **Method**: OTP-based (email or SMS)
- **Token Storage**: 
  - Access token: In-memory (Zustand store)
  - Refresh token: HttpOnly cookie (managed by backend)
- **Token Lifecycle**: Automatic refresh on 401 responses via axios interceptor

### Session Flow

```
App Mount → silentRefresh() → Restore Session From Cookie
                                        ↓
                            Access Token Stored in authStore
                                        ↓
                            User Object Populated
                                        ↓
                            Navigator Renders Role-Specific Routes
```

### Interceptor Logic

**Request Interceptor**:
```javascript
config.headers.Authorization = `Bearer ${accessToken}`;
```

**Response Interceptor**:
- Detects 401 Unauthorized
- Calls `refreshAccessToken()` automatically
- Retries original request with new token
- Redirects to /login on refresh failure

## State Management Strategy

### Zustand Store Pattern

**No Persistence** (Security Decision):
- Access tokens stored in memory only
- Tokens lost on page refresh
- Session restored via HttpOnly refresh cookie

**Auth Store Structure**:
```javascript
{
  accessToken: string | null,
  user: {
    id: number,
    role_id: number,
    email: string,
    name: string,
    // ... other user properties
  } | null,
  setAccessToken: (token) => void,
  setUser: (user) => void,
  logout: () => void
}
```

## Component Communication

### Props (Parent → Child)
- Configuration data
- Callback functions
- Static content

### Context/Store (Global State)
- User authentication state
- Theme preferences
- Application-wide settings

### Service Layer (Data Fetching)
- API calls isolated in service modules
- Components consume via async operations
- Loading states managed locally

## Error Handling Strategy

### API Error Handling

1. **Service Layer**: Catch errors from axios
2. **Component Layer**: Display user-friendly messages
3. **Toast Notifications**: `react-toastify` for non-blocking alerts
4. **Fallback UI**: Error boundaries for component failures

### Network Resilience

- Request timeout: 15 seconds
- Automatic retry on 401 (via interceptor)
- Graceful degradation on connection loss

## Build Process

### Development

```bash
npm run dev
```

- Vite dev server with HMR
- Source maps enabled
- Fast refresh
- Port: 5173 (default)

### Production

```bash
npm run build
```

- Tree shaking and code splitting
- Minification (Terser)
- Asset optimization
- Output: `dist/` directory

## Performance Considerations

### Code Splitting

- Route-based splitting via React.lazy (if implemented)
- Vendor chunk separation
- Dynamic imports for heavy components

### Optimization Techniques

- Memoization with React.memo for expensive renders
- useCallback/useMemo for stable references
- Pagination for large data sets
- Debouncing search inputs
- Skeleton loading states

## Security Measures

### Client-Side Security

- No sensitive data in localStorage
- Tokens stored in memory + HttpOnly cookies
- HTTPS enforcement in production
- Content Security Policy headers
- XSS protection via React's default escaping

### API Security

- CORS configuration
- Authorization header on all protected requests
- Token expiration handling
- Input validation before submission

## Deployment Architecture

```
┌──────────────────────────────────────────────┐
│         CDN / Static Hosting                  │
│    (Vercel, Netlify, GitHub Pages)            │
└──────────────┬───────────────────────────────┘
               │
               │ HTTPS
               │
┌──────────────▼───────────────────────────────┐
│         User's Browser                        │
│    (React SPA with Client-Side Routing)       │
└──────────────┬───────────────────────────────┘
               │
               │ API Requests (HTTPS)
               │
┌──────────────▼───────────────────────────────┐
│         Backend Server                        │
│    (Node.js + Express + MySQL/TiDB)           │
└──────────────────────────────────────────────┘
```

See [Deployment](../deployment.md) for detailed deployment instructions.
