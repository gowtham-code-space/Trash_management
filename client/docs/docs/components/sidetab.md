# SideTab Navigation

## Overview

`SideTab` is the main layout component providing sidebar navigation, header, and content area for all authenticated routes. It adapts menus dynamically based on user roles.

**Location**: `src/components/SideTab/SideTab.jsx`

## Responsibilities

- Render role-specific navigation links
- Display user profile in header
- Provide collapsible sidebar
- Render nested route content via `<Outlet />`
- Theme toggle integration

## Usage

```javascript
// Navigator.jsx
<Route path="/" element={user ? <SideTab user={user} /> : <Navigate to="/login" />}>
  {/* Nested routes */}
</Route>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `user` | `object` | Authenticated user object from authStore |

**User Object Structure**:
```typescript
{
  id: number,
  role_id: number,
  name: string,
  email: string,
  avatar?: string
}
```

## Layout Structure

```
┌─────────────────────────────────────┐
│           Header                     │
│  [Logo] [User] [Theme] [Logout]      │
├──────────┬───────────────────────────┤
│          │                           │
│ Sidebar  │   Content Area            │
│  Links   │   (React Router Outlet)   │
│          │                           │
│          │                           │
└──────────┴───────────────────────────┘
```

## Role-Specific Menus

### Implementation Pattern

```javascript
function renderNavigationLinks() {
  switch (user.role_id) {
    case 1:  // Resident
      return (
        <>
          <Link to="/">Home</Link>
          <Link to="/map">Map</Link>
          <Link to="/report-trash">Report Trash</Link>
        </>
      );
    
    case 2:  // Trash Collector
      return (
        <>
          <Link to="/">Dashboard</Link>
          <Link to="/immediate-tasks">Tasks</Link>
          <Link to="/upload-attendance">Attendance</Link>
        </>
      );
    
    // ... cases 3-6
  }
}
```

## Features

### Active Link Highlighting

```javascript
import { NavLink } from 'react-router-dom';

<NavLink 
  to="/dashboard"
  className={({ isActive }) => isActive ? 'active-link' : 'link'}
>
  Dashboard
</NavLink>
```

### Collapsible Sidebar

```javascript
const [sidebarOpen, setSidebarOpen] = useState(true);

<button onClick={() => setSidebarOpen(!sidebarOpen)}>
  {sidebarOpen ? <Collapse /> : <Expand />}
</button>
```

### Logout Handler

```javascript
const logout = useAuthStore((state) => state.logout);
const navigate = useNavigate();

function handleLogout() {
  logout();
  navigate('/login');
}
```

## Responsive Behavior

- **Desktop**: Sidebar always visible
- **Tablet**: Collapsible sidebar with hamburger menu
- **Mobile**: Drawer-style sidebar overlay

## Accessibility

- ARIA labels for icon-only buttons
- Keyboard navigation support
- Focus management for drawer
