# Folder Structure

## Project Organization

The frontend codebase follows a feature-based organization strategy with clear module boundaries.

## Root Structure

```
client/
├── docs/                 # Docusaurus documentation (this site)
├── public/               # Static assets served as-is
├── src/                  # Application source code
│   ├── assets/           # Images, icons, fonts
│   ├── components/       # Reusable UI components
│   ├── Navigation/       # Routing configuration
│   ├── pages/            # Feature pages (views)
│   ├── services/         # API integration layer
│   ├── store/            # Global state (Zustand)
│   ├── styles/           # Global stylesheets
│   ├── utils/            # Helper functions
│   ├── App.jsx           # Root component
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles and theme
├── .gitignore            # Git exclusions
├── eslint.config.js      # Linting rules
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── README.md             # Project overview
└── vite.config.js        # Vite build configuration
```

## Detailed Breakdown

### `/src/assets/`

Contains static resources used throughout the application.

```
assets/
└── icons/
    └── icons.jsx         # SVG icon components
```

**Purpose**: Centralized icon library as React components for consistency and performance.

### `/src/components/`

Reusable UI components organized by feature domain.

```
components/
├── Cards/
│   ├── Commissioner/     # Role-specific card components
│   ├── Residents/
│   ├── Supervisor/
│   └── Workers/
├── Modals/
│   ├── Calendar/         # Date picker components
│   ├── Commissioner/
│   ├── Login/            # OTP verification modal
│   ├── MHO/
│   ├── Quiz/
│   ├── Residents/
│   ├── SanitaryInspector/
│   ├── Settings/
│   ├── SuperVisor/
│   └── TrashMan/
├── Notification/
│   └── ToastNotification.jsx  # Toast wrapper
├── SideTab/
│   └── SideTab.jsx       # Sidebar navigation layout
├── skeleton/             # Loading state components
│   ├── SkeletonAvatar.jsx
│   ├── SkeletonBlock.jsx
│   ├── SkeletonButton.jsx
│   ├── SkeletonCard.jsx
│   ├── SkeletonLine.jsx
│   └── usage.reference
└── Statistics/
    ├── BarChart.jsx
    ├── HeatMap.jsx
    ├── LineChart.jsx
    ├── PieChart.jsx
    ├── ProgressBar.jsx
    ├── RadarChart.jsx
    └── Rating.jsx
```

**Design Principle**: Components are organized by feature, not by technical type. This improves discoverability when working on specific features.

### `/src/Navigation/`

Centralized routing configuration.

```
Navigation/
└── Navigator.jsx         # React Router setup with role guards
```

**Responsibility**: Defines all application routes and implements role-based access control logic.

### `/src/pages/`

Feature pages organized by user role.

```
pages/
├── Commissioner/
│   ├── CommissionerDashboard.jsx
│   ├── ConfigHeader/
│   └── ManageEmployees/
├── Common/               # Shared across roles
│   ├── 404/
│   ├── AllTasks/
│   ├── Feedback/
│   │   ├── CreateFeedBack.jsx
│   │   └── SubmitFeedBack.jsx
│   ├── IdentityCard/
│   ├── Login/
│   │   └── Login.jsx
│   ├── Quiz/
│   │   ├── Quiz.jsx
│   │   └── TakeQuiz.jsx
│   ├── RouteTimings/
│   ├── SearchWorkers/
│   ├── Settings/
│   └── Signup/
├── MHO/
│   ├── AssignToSI.jsx
│   ├── DivisionHeader.jsx
│   ├── MHODashboard.jsx
│   └── ViewZone.jsx
├── Residents/
│   ├── Home.jsx
│   ├── Map.jsx
│   ├── ReportTrash.jsx
│   ├── ResidentStats.jsx
│   └── TrashDetails.jsx
├── SanitoryInspector/
│   ├── InspectorDashBoard.jsx
│   ├── InspectorAttendance.jsx
│   ├── RouteConfigHeader/
│   ├── StatsHeader/
│   └── AssignToSupervisor.jsx
├── Supervisor/
│   ├── SupervisorDashBoard.jsx
│   ├── AllTasks/
│   ├── AssignToTrashmen.jsx
│   ├── Attendance.jsx
│   └── SupervisorStats.jsx
└── TrashMan/
    ├── TrashManDashBoard.jsx
    ├── Attendance/
    │   └── UploadAttendance.jsx
    ├── ImmediateTasks/
    ├── TrashmanStats.jsx
    └── ...
```

**Naming Convention**:
- PascalCase for component files
- Descriptive names indicating purpose
- Co-located feature files in subdirectories

### `/src/services/`

API integration layer separated into core utilities and feature-specific services.

```
services/
├── core/
│   ├── apiClient.js      # Axios instance with interceptors
│   ├── apiMethods.js     # HTTP method wrappers (get, post, put, delete)
│   └── session.js        # Token management and refresh
└── features/
    ├── authService.js    # Authentication endpoints
    ├── idCardService.js  # Identity card data
    ├── quizService.js    # Quiz operations
    └── settingsService.js # User settings
```

**Service Structure Pattern**:
```javascript
import { api } from '../core/apiMethods';

export const featureService = {
  getItems: (params) => api.get('/endpoint', { params }),
  createItem: (data) => api.post('/endpoint', data),
  // ...
};
```

### `/src/store/`

Global state management using Zustand.

```
store/
├── authStore.jsx         # User authentication state
└── ThemeStore.jsx        # Dark/light mode preference
```

**State Management Philosophy**:
- Minimal global state
- Transient data kept in component state
- No persistence for security-sensitive data

### `/src/styles/`

Global stylesheets and Tailwind CSS customizations (if applicable).

### `/src/utils/`

Utility functions and helper components.

```
utils/
└── Pagination.jsx        # Reusable pagination component
```

## Naming Conventions

### Files and Folders

- **Components**: PascalCase (e.g., `QuizModal.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Folders**: PascalCase for feature folders, camelCase for utility folders
- **Services**: camelCase with Service suffix (e.g., `authService.js`)

### Code

- **React Components**: PascalCase function names
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Zustand Stores**: camelCase with Store suffix

## Import Path Patterns

### Absolute Imports (Relative to src/)

```javascript
import { useAuthStore } from '../../../store/authStore';
import ToastNotification from '../../../components/Notification/ToastNotification';
```

**Note**: The project currently uses relative imports. Consider configuring Vite path aliases for cleaner imports:

```javascript
// Potential improvement:
import { useAuthStore } from '@/store/authStore';
import ToastNotification from '@/components/Notification/ToastNotification';
```

## File Size Guidelines

- **Components**: Ideally < 300 lines
- **Pages**: < 500 lines (extract complex logic to hooks/utilities)
- **Services**: < 200 lines per service file
- **Utilities**: Single responsibility, typically < 100 lines

## Code Organization Best Practices

1. **Co-locate related files**: Keep component-specific styles, tests, and utilities in the same folder
2. **Single responsibility**: Each file should have one clear purpose
3. **Index files**: Avoid barrel exports to prevent circular dependencies
4. **Feature folders**: Group related components within feature boundaries
5. **Shared components**: Only promote to `/components/` when used across 3+ features

## Build Output Structure

After running `npm run build`, the output structure is:

```
dist/
├── assets/
│   ├── index-[hash].js   # Main bundle
│   ├── index-[hash].css  # Compiled styles
│   └── [asset]-[hash].*  # Images, fonts
└── index.html            # Entry HTML with injected scripts
```

**Optimization**: Vite automatically applies code splitting, tree shaking, and asset hashing.
