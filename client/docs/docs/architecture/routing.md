# Routing

## Overview

The application uses **React Router v7** for client-side routing with role-based access control. All routing logic is centralized in `src/Navigation/Navigator.jsx`.

## Routing Architecture

### Route Protection Strategy

Routes are protected using conditional rendering based on the authenticated user's `role_id`:

```javascript
const user = useAuthStore((state) => state.user);

<Route path="/" element={user ? <SideTab user={user} /> : <Navigate to="/login" />}>
  {Number(user?.role_id) === 1 && (
    <>
      <Route index element={<Home/>} />
      <Route path="map" element={<Map/>}/>
      {/* ... more resident routes */}
    </>
  )}
</Route>
```

### Route Hierarchy

```
/
├── /login                # Public
├── /signup               # Public
└── / (Protected)         # Requires authentication
    ├── <role-specific routes>
    └── * (404)           # Catch-all fallback
```

## Role-Based Route Mapping

### Resident Routes (role_id: 1)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Resident dashboard |
| `/map` | `Map` | Trash location map |
| `/report-trash` | `ReportTrash` | Report new trash issue |
| `/route-timings` | `RouteTimings` | Collection schedule |
| `/trash-details` | `TrashDetails` | Complaint details |
| `/my-stats` | `ResidentStats` | Personal contribution stats |
| `/quiz` | `Quiz` | Quiz history and certificates |
| `/take-quiz` | `TakeQuiz` | Interactive quiz interface |
| `/submit-feedback` | `SubmitFeedBack` | Service feedback form |
| `/settings` | `SettingsHeader` | Account settings |

### Trash Collector Routes (role_id: 2)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `TrashManDashboard` | Worker dashboard |
| `/route-timings` | `RouteTimings` | Assigned route schedule |
| `/immediate-tasks` | `ImmediateTasks` | Urgent task list |
| `/upload-attendance` | `UploadAttendance` | Attendance submission |
| `/my-stats` | `TrashmanStats` | Performance metrics |
| `/create-feedback-session` | `CreateFeedBack` | Generate feedback QR/OTP |
| `/submit-feedback` | `SubmitFeedBack` | Submit colleague feedback |
| `/quiz` | `Quiz` | Training quizzes |
| `/take-quiz` | `TakeQuiz` | Quiz interface |
| `/id-card` | `IdentityCard` | Digital ID card |
| `/settings` | `SettingsHeader` | Profile settings |

### Supervisor Routes (role_id: 3)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `SupervisorDashboard` | Supervisor overview |
| `/trashman-stats` | `TrashmanStats` | Team member stats |
| `/attendance` | `Attendance` | Team attendance records |
| `/all-tasks` | `AllTasks` | Assigned task list |
| `/assign-task` | `AssignToTrashmen` | Task delegation interface |
| `/my-stats` | `SupervisorStats` | Personal performance |
| `/id-card` | `IdentityCard` | Official ID |
| `/search-workers` | `SearchWorkers` | Worker directory |
| `/create-feedback-session` | `CreateFeedBack` | QR generation |
| `/submit-feedback` | `SubmitFeedBack` | Feedback submission |
| `/quiz`, `/take-quiz` | Quiz system | Training modules |
| `/settings` | `SettingsHeader` | Account preferences |

### Sanitary Inspector Routes (role_id: 4)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `InspectorDashboard` | Inspector overview |
| `/attendance` | `InspectorAttendance` | Multi-team attendance |
| `/trashman-stats` | `TrashmanStats` | Worker statistics |
| `/supervisor-stats` | `SupervisorStats` | Supervisor performance |
| `/all-tasks` | `AllTasks` | Division task overview |
| `/assign-task` | `AssignToSupervisor` | Task assignment |
| `/overall-stats` | `StatsHeader` | Division analytics |
| `/config-route` | `RouteConfigHeader` | Route configuration |
| `/create-feedback-session` | `CreateFeedBack` | Feedback tools |
| `/search-workers` | `SearchWorkers` | Employee search |
| `/id-card` | `IdentityCard` | Official credentials |
| `/quiz`, `/take-quiz` | Quiz system | Knowledge assessment |
| `/settings` | `SettingsHeader` | Settings |

### Municipal Health Officer Routes (role_id: 5)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `MHODashboard` | MHO dashboard |
| `/view-zone` | `ViewZone` | Zone-level overview |
| `/view-division` | `DivisionHeader` | Division management |
| `/all-tasks` | `AllTasks` | Task monitoring |
| `/assign-task` | `AssignToSI` | Assign to inspectors |
| `/search-workers` | `SearchWorkers` | Employee directory |
| `/trashman-stats` | `TrashmanStats` | Worker analytics |
| `/supervisor-stats` | `SupervisorStats` | Supervisor reports |
| `/inspector-stats` | `StatsHeader` | Inspector metrics |
| `/quiz`, `/take-quiz` | Quiz system | Training management |
| `/id-card` | `IdentityCard` | Digital ID |
| `/settings` | `SettingsHeader` | Preferences |

### Commissioner Routes (role_id: 6)

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `MHODashboard` | District overview |
| `/view-zone` | `ViewZone` | Zone management |
| `/view-division` | `DivisionHeader` | Division details |
| `/config-district` | `ConfigHeader` | District configuration |
| `/appoint-employees` | `EmployeesOverview` | Employee appointments |
| `/trashman-stats` | `TrashmanStats` | Worker metrics |
| `/supervisor-stats` | `SupervisorStats` | Supervisor analytics |
| `/inspector-stats` | `StatsHeader` | Inspector reports |
| `/quiz`, `/take-quiz` | Quiz system | Training oversight |
| `/id-card` | `IdentityCard` | Official ID |
| `/settings` | `SettingsHeader` | Account settings |

## Navigation Implementation

### Root Layout Component

The `SideTab` component serves as the layout wrapper for all authenticated routes:

```javascript
<Route path="/" element={user ? <SideTab user={user} /> : <Navigate to="/login" />}>
  {/* Nested routes rendered inside SideTab */}
</Route>
```

**SideTab Features**:
- Sidebar navigation menu
- Header with user info
- Main content area (React Router `<Outlet />`)
- Responsive layout

### Public Routes

Public routes are defined outside the protected layout:

```javascript
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
```

These routes are accessible without authentication.

### 404 Handling

A catch-all route handles unknown paths:

```javascript
<Route path="*" element={<FileNotFound />} />
```

**Important**: This route must be last in the route definition order to avoid shadowing valid routes.

## Programmatic Navigation

### useNavigate Hook

Components use React Router's `useNavigate` for navigation:

```javascript
import { useNavigate } from "react-router-dom";

function LoginComponent() {
  const navigate = useNavigate();

  function handleSuccess() {
    navigate("/");  // Navigate to dashboard
  }
}
```

### Conditional Redirects

Authentication flow redirects based on user state:

```javascript
// After login success
if (response.success) {
  navigate("/");  // Redirects to role-specific dashboard
}

// If user not found
if (response.data.shouldRedirect === 'signup') {
  navigate("/signup");
}
```

## Route Guards Implementation

### Authentication Guard

```javascript
element={user ? <SideTab user={user} /> : <Navigate to="/login" />}
```

**Logic**:
- If `user` exists in authStore → render protected route
- If no user → redirect to `/login`

### Role Guard

```javascript
{Number(user?.role_id) === 1 && (
  <Route path="map" element={<Map />} />
)}
```

**Logic**:
- Only renders routes matching user's role_id
- Users cannot access routes from other roles
- Direct URL access to unauthorized routes results in blank page (no match)

## Link Components

### Sidebar Navigation Links

Links are rendered dynamically based on user role in `SideTab.jsx`:

```javascript
{user.role_id === 1 && (
  <>
    <Link to="/">Home</Link>
    <Link to="/map">Map</Link>
    <Link to="/report-trash">Report Trash</Link>
  </>
)}
```

### Button Navigation

Buttons can trigger navigation programmatically:

```javascript
<button onClick={() => navigate('/take-quiz')}>
  Start Quiz
</button>
```

## Route Parameters

While not extensively used in the current implementation, React Router supports dynamic segments:

```javascript
// Route definition
<Route path="/worker/:id" element={<WorkerProfile />} />

// Usage in component
const { id } = useParams();
```

## Query Parameters

Query parameters can be accessed using `useSearchParams`:

```javascript
const [searchParams] = useSearchParams();
const page = searchParams.get('page') || 1;
```

**Example**: Quiz history with pagination uses query params for `page`, `limit`, `dateFilter`, etc.

## Navigation State

Route navigation can carry state:

```javascript
navigate('/task-details', { state: { taskId: 123 } });

// In target component
const location = useLocation();
const taskId = location.state?.taskId;
```

## Best Practices

1. **Centralized Route Definitions**: All routes in `Navigator.jsx` for easy maintenance
2. **Role-Based Access**: Use conditional rendering, not client-side route protection alone
3. **Lazy Loading**: Consider React.lazy() for code splitting on larger routes
4. **Type Safety**: Validate user.role_id with Number() to handle string comparisons
5. **Fallback Routes**: Always include a 404 route as the last route definition
6. **Navigation Over Links**: Use `navigate()` for programmatic flows, `<Link>` for user-initiated navigation
