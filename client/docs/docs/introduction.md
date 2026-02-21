# Introduction

## Project Overview

The Trash Management System is a comprehensive role-based web application designed to digitize and streamline municipal waste management operations. The system facilitates coordination between residents, waste collection workers, supervisors, sanitary inspectors, municipal health officers, and commissioners.

## Purpose

This frontend application serves as the primary user interface for all stakeholders in the waste management ecosystem. It provides:

- Real-time trash reporting and tracking
- Route scheduling and optimization
- Performance monitoring and analytics
- Feedback collection mechanisms
- Educational quiz systems
- Task assignment workflows
- Attendance management
- Inter-departmental communication

## System Boundaries

### What This System Does

- User authentication via OTP (email/SMS)
- Role-based access control (6 distinct user roles)
- Real-time location tracking and map visualization
- Task creation, assignment, and monitoring
- Feedback collection with QR code verification
- Statistics visualization and reporting
- Worker search and profile management
- Route timing information display

### What This System Does Not Do

- Direct database operations (handled by backend API)
- Payment processing
- Vehicle telemetry data collection
- Physical waste bin sensor integration
- Third-party municipality data synchronization

## Technology Foundation

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI library |
| Vite | 7.2.4 | Build tool and dev server |
| React Router | 7.11.0 | Client-side routing |
| Tailwind CSS | 4.1.18 | Styling framework |
| Zustand | 5.0.9 | State management |
| Axios | 1.13.3 | HTTP client |

### Supporting Libraries

- **recharts** (3.6.0): Data visualization and charts
- **react-leaflet** (5.0.0): Interactive map components
- **socket.io-client** (4.8.3): Real-time communication
- **react-toastify** (11.0.5): Toast notifications
- **firebase** (12.8.0): Cloud services integration

## Application Structure

```
client/
├── src/
│   ├── Navigation/        # Routing configuration
│   ├── pages/             # Feature pages by role
│   ├── components/        # Reusable UI components
│   ├── services/          # API integration layer
│   ├── store/             # Global state management
│   ├── assets/            # Static resources
│   └── utils/             # Helper functions
├── public/                # Static assets
└── docs/                  # This documentation
```

## Key Features by User Role

### Resident (role_id: 1)
- Report trash issues with location
- View collection schedule
- Submit service feedback
- Take environmental quizzes
- Track complaint status

### Trash Collector (role_id: 2)
- View assigned routes
- Mark attendance
- View immediate tasks
- Generate feedback QR codes
- Access personal statistics

### Supervisor (role_id: 3)
- Assign tasks to collectors
- Monitor team attendance
- View team performance metrics
- Search for workers
- Generate feedback sessions

### Sanitary Inspector (role_id: 4)
- Oversee multiple supervisor teams
- Configure collection routes
- View division-wide statistics
- Assign tasks to supervisors
- Monitor attendance records

### Municipal Health Officer (role_id: 5)
- Manage multiple zones
- View division summaries
- Assign tasks to inspectors
- Access comprehensive reports
- Oversee district operations

### Commissioner (role_id: 6)
- Configure district boundaries
- Appoint employees
- View system-wide analytics
- Access all administrative features
- Manage organizational hierarchy

## Development Environment

### Prerequisites

- Node.js 18+ and npm 8+
- Modern web browser with ES2020+ support
- Git for version control

### Environment Variables

The application expects the following environment variable:

- `VITE_API_BASE_URL`: Backend API endpoint (defaults to `http://localhost:5000/api`)

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Documentation Navigation

- [Architecture Overview](./architecture/overview.md) - System design and data flow
- [Features](./features/quiz-system.md) - Detailed feature documentation
- [Components](./components/sidetab.md) - Reusable component reference
- [API Integration](./api-integration.md) - Backend communication patterns
- [Deployment](./deployment.md) - Production deployment guide

## Support and Contribution

This documentation is maintained alongside the codebase. For questions, improvements, or bug reports, please refer to your organization's development workflow guidelines.
