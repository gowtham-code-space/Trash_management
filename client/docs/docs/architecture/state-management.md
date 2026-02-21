# State Management

## Overview

The application uses **Zustand 5.0.9** for global state management. Zustand is a minimal, unopinionated state management library that eliminates boilerplate while providing React hooks integration.

## Why Zustand?

- **Minimal API**: Simple `create()` function with hooks-based consumption
- **No Context Provider Wrapping**: Direct store access without provider setup
- **TypeScript-Ready**: Excellent type inference
- **Devtools Integration**: Compatible with Redux DevTools
- **Small Bundle Size**: ~1KB gzipped
- **No Re-render Optimization Needed**: Automatic subscription optimization

## Store Architecture

### Current Stores

The application maintains two global stores:

1. **authStore** (`src/store/authStore.jsx`): Authentication state
2. **ThemeStore** (`src/store/ThemeStore.jsx`): UI theme preferences

---

## authStore

### Purpose

Manages user authentication state including access tokens and user profile data.

### Location

`src/store/authStore.jsx`

### Store Definition

```javascript
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
    accessToken: null,
    user: null,

    setAccessToken: (token) => set({ accessToken: token }),
    
    setUser: (user) => set({ user }),

    logout: () => set({ accessToken: null, user: null }),
}));
```

### State Shape

| Property | Type | Description |
|----------|------|-------------|
| `accessToken` | `string \| null` | JWT access token for API authentication |
| `user` | `object \| null` | Authenticated user profile data |

### User Object Structure

```typescript
{
  id: number,
  role_id: number,  // 1-6 (Resident, TrashMan, Supervisor, SI, MHO, Commissioner)
  email: string,
  name: string,
  phone?: string,
  avatar?: string,
  // ... additional user properties from backend
}
```

### Actions

#### setAccessToken(token)

**Purpose**: Update the access token in memory

**Usage**:
```javascript
const setAccessToken = useAuthStore((state) => state.setAccessToken);
setAccessToken(newToken);
```

**Context**: Called after successful OTP verification or token refresh

#### setUser(user)

**Purpose**: Store authenticated user profile

**Usage**:
```javascript
const setUser = useAuthStore((state) => state.setUser);
setUser({
  id: 123,
  role_id: 1,
  email: 'user@example.com',
  name: 'John Doe'
});
```

**Context**: Called after receiving user data from `/auth/verify-otp` or `/auth/refresh`

#### logout()

**Purpose**: Clear authentication state

**Usage**:
```javascript
const logout = useAuthStore((state) => state.logout);
logout();
```

**Context**: Called when user explicitly logs out or refresh token fails

### Consumption Patterns

#### Selective Subscription (Recommended)

Subscribe to specific state slices to minimize re-renders:

```javascript
const user = useAuthStore((state) => state.user);
const accessToken = useAuthStore((state) => state.accessToken);
```

**Advantage**: Component only re-renders when subscribed slice changes

#### Full Store Subscription (Avoid)

```javascript
const authStore = useAuthStore();  // Re-renders on any state change
```

**Disadvantage**: Re-renders even when unrelated state updates

### Security Considerations

#### No Persistence

```javascript
// No persist middleware applied
export const useAuthStore = create((set) => ({ ... }));
```

**Rationale**:
- Access tokens should never persist in localStorage (XSS vulnerability)
- Tokens stored in memory only
- Refresh tokens stored in HttpOnly cookies (managed by backend)

#### Token Refresh Flow

1. User loads app → `App.jsx` calls `silentRefresh()`
2. `silentRefresh()` → POST `/auth/refresh` (sends HttpOnly cookie)
3. Backend validates refresh token → returns new access token + user data
4. `setAccessToken()` and `setUser()` called
5. User session restored

#### Page Refresh Behavior

- Access token lost (memory cleared)
- Silent refresh restores session from HttpOnly cookie
- If refresh fails → user redirected to `/login`

---

## ThemeStore

### Purpose

Manages dark/light theme preference for the application.

### Location

`src/store/ThemeStore.jsx`

### Store Definition

```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const ThemeStore = create(
  persist(
    (set) => ({
      isDarkTheme: false,
      toggleTheme: () => set((state) => ({ isDarkTheme: !state.isDarkTheme })),
    }),
    {
      name: 'theme-storage',  // localStorage key
    }
  )
);

export default ThemeStore;
```

### State Shape

| Property | Type | Description |
|----------|------|-------------|
| `isDarkTheme` | `boolean` | True if dark mode active |

### Actions

#### toggleTheme()

**Purpose**: Toggle between dark and light themes

**Usage**:
```javascript
const { isDarkTheme, toggleTheme } = ThemeStore();
<button onClick={toggleTheme}>Toggle Theme</button>
```

### Persistence

**Middleware**: `persist` from zustand/middleware

**Storage**: localStorage

**Key**: `theme-storage`

**Rationale**: Theme preference is non-sensitive and should persist across sessions

### Theme Application

Components use the `isDarkTheme` value to apply conditional styling:

```javascript
const { isDarkTheme } = ThemeStore();

return (
  <div className={isDarkTheme ? "dark" : ""}>
    {/* Tailwind CSS dark: variant classes activate */}
  </div>
);
```

**Tailwind Dark Mode**:
```css
/* Tailwind applies dark: variants when ancestor has 'dark' class */
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

---

## Store Usage Examples

### Component-Level Usage

#### Authentication Check

```javascript
import { useAuthStore } from "../store/authStore";

function ProtectedComponent() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <div>Welcome, {user.name}!</div>;
}
```

#### Role-Based Rendering

```javascript
const user = useAuthStore((state) => state.user);

{Number(user?.role_id) === 1 && (
  <ResidentDashboard />
)}

{Number(user?.role_id) === 2 && (
  <TrashManDashboard />
)}
```

#### Theme Toggle Button

```javascript
import ThemeStore from "../store/ThemeStore";

function ThemeToggle() {
  const { isDarkTheme, toggleTheme } = ThemeStore();

  return (
    <button onClick={toggleTheme}>
      {isDarkTheme ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}
```

### Service-Level Usage

#### API Authentication

```javascript
import { useAuthStore } from '../store/authStore';

// In apiClient interceptor
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();  // From session.js wrapper
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## Best Practices

### 1. Selective Subscription

✅ **Do**:
```javascript
const user = useAuthStore((state) => state.user);
const setUser = useAuthStore((state) => state.setUser);
```

❌ **Don't**:
```javascript
const { user, setUser, accessToken, logout } = useAuthStore();
```

### 2. Derived State in Components

Store raw data in Zustand, derive computed values in components:

```javascript
// Store: user object
const user = useAuthStore((state) => state.user);

// Component: derived value
const isAdmin = user?.role_id >= 5;
```

### 3. Action Naming

Use descriptive verb-based action names:

- ✅ `setAccessToken`, `logout`, `toggleTheme`
- ❌ `token`, `clear`, `theme`

### 4. Type Coercion

Always coerce `role_id` to number for comparisons:

```javascript
Number(user?.role_id) === 1  // ✅ Correct
user?.role_id === 1          // ❌ May fail if role_id is string
```

### 5. Avoid Over-Globalization

**Global State**: Authentication, theme, app-wide settings

**Local State**: Form inputs, modals, loading states, pagination

```javascript
// ❌ Don't add to global store
const modalOpen = useAuthStore((state) => state.modalOpen);

// ✅ Keep in component
const [modalOpen, setModalOpen] = useState(false);
```

---

## Future Enhancements

### Potential Additional Stores

As the application scales, consider creating:

- **notificationStore**: Real-time notifications from Socket.io
- **cacheStore**: Frequently accessed API data (users, routes, zones)
- **uiStore**: Global UI state (sidebar collapsed, active filters)

### Middleware Options

Zustand supports middleware for advanced use cases:

```javascript
import { persist, devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({ ... }),
      { name: 'storage-key' }
    )
  )
);
```

**devtools**: Redux DevTools integration for debugging

**persist**: localStorage/sessionStorage persistence

**immer**: Immutable state updates with mutable syntax

---

## Debugging

### Redux DevTools

Enable Zustand devtools middleware for store inspection:

```javascript
import { devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools((set) => ({ ... }), { name: 'AuthStore' })
);
```

Then use Redux DevTools browser extension to:
- Inspect state changes
- Track action dispatches
- Time-travel debugging

### Console Logging

Log store state for debugging:

```javascript
useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state);
});
```
