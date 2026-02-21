# Coding Standards

## Overview

This document outlines coding conventions, best practices, and style guidelines for maintaining consistency across the codebase.

---

## Code Style

### JavaScript/React

#### File Naming

- **Components**: PascalCase (e.g., `QuizModal.jsx`)
- **Utilities**: camelCase (e.g., `formatDate.js`)
- **Services**: camelCase with suffix (e.g., `authService.js`)
- **Stores**: camelCase with Store suffix (e.g., `authStore.jsx`)

#### Component Structure

```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import ToastNotification from '../components/Notification/ToastNotification';

// 2. Constants
const MAX_ATTEMPTS = 3;

// 3. Component Definition
function ComponentName() {
  // 4. Hooks
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  
  // 5. State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 6. Effects
  useEffect(() => {
    fetchData();
  }, []);
  
  // 7. Handlers
  function handleSubmit() {
    // ...
  }
  
  // 8. Return JSX
  return (
    <div>
      {/* Component markup */}
    </div>
  );
}

// 9. Export
export default ComponentName;
```

#### Naming Conventions

**Functions**: camelCase

```javascript
function calculateTotal() { }
function handleFormSubmit() { }
```

**Event Handlers**: Prefix with `handle`

```javascript
function handleClick() { }
function handleInputChange() { }
```

**Boolean Variables**: Prefix with `is`, `has`, `should`

```javascript
const isLoading = true;
const hasError = false;
const shouldRedirect = true;
```

**Constants**: UPPER_SNAKE_CASE

```javascript
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
```

---

## React Best Practices

### Hooks

**Rules of Hooks**:

1. Only call hooks at the top level
2. Only call hooks from React functions

```javascript
// ✅ Correct
function Component() {
  const [state, setState] = useState(0);
  
  useEffect(() => {
    // Effect logic
  }, []);
}

// ❌ Incorrect
function Component() {
  if (condition) {
    const [state, setState] = useState(0);  // Conditional hook
  }
}
```

### State Management

**Local vs Global State**:

```javascript
// ✅ Local state for component-specific data
const [modalOpen, setModalOpen] = useState(false);

// ✅ Global state for app-wide data
const user = useAuthStore((state) => state.user);
```

**Avoid Prop Drilling**:

```javascript
// ❌ Prop drilling through multiple levels
<Parent>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>

// ✅ Use context/store
const user = useAuthStore((state) => state.user);
```

### Component Composition

**Prefer Composition over Inheritance**:

```javascript
// ✅ Composition
<Modal>
  <ModalHeader />
  <ModalBody />
  <ModalFooter />
</Modal>

// ❌ Inheritance
class MyModal extends Modal { }
```

---

## JSX Guidelines

### Props

**Boolean Props**:

```javascript
// ✅ Preferred
<Button disabled />

// ❌ Verbose
<Button disabled={true} />
```

**Destructuring Props**:

```javascript
// ✅ Destructure in function signature
function Button({ label, onClick, disabled }) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Access via props object
function Button(props) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Conditional Rendering

```javascript
// ✅ Ternary for if-else
{isLoading ? <Spinner /> : <Content />}

// ✅ Logical && for if-only
{error && <ErrorMessage />}

// ❌ Avoid complex nested ternaries
{condition1 ? (
  condition2 ? <A /> : <B />
) : (
  condition3 ? <C /> : <D />
)}
```

### Lists and Keys

```javascript
// ✅ Use unique IDs as keys
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ❌ Avoid array indices as keys (when items can be reordered)
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
```

---

## CSS/Styling

### Tailwind CSS

**Class Order Convention**:

```javascript
<div className="
  flex items-center justify-between  // Layout
  w-full max-w-4xl                   // Sizing
  p-4 m-2                            // Spacing
  bg-white border border-gray-200   // Background/Border
  rounded-lg shadow-md              // Effects
  text-lg font-semibold text-gray-800 // Typography
  hover:bg-gray-50                   // Pseudo-classes
  dark:bg-gray-900 dark:text-white  // Dark mode
">
```

**Avoid Inline Styles**:

```javascript
// ❌ Avoid
<div style={{ color: 'red', fontSize: '16px' }}>

// ✅ Use Tailwind classes
<div className="text-red-500 text-base">
```

**Responsive Classes**:

```javascript
<div className="
  text-sm md:text-base lg:text-lg  // Mobile-first responsive
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
```

---

## API Integration

### Error Handling

```javascript
// ✅ Always use try-catch for async operations
async function fetchData() {
  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (error) {
    console.error('Fetch error:', error);
    ToastNotification('Failed to load data', 'error');
  } finally {
    setLoading(false);
  }
}

// ❌ Missing error handling
async function fetchData() {
  const response = await api.get('/endpoint');
  setData(response.data);
}
```

### Service Layer Pattern

```javascript
// ✅ Centralized API calls
// services/features/userService.js
export const userService = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data)
};

// Component
import { userService } from '@/services/features/userService';
const profile = await userService.getProfile();

// ❌ Direct axios calls in components
import axios from 'axios';
const profile = await axios.get('http://localhost:5000/api/user/profile');
```

---

## Code Organization

### Import Order

```javascript
// 1. React imports
import React, { useState, useEffect, useRef } from 'react';

// 2. Third-party imports
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 3. Internal imports (stores, services)
import { useAuthStore } from '@/store/authStore';
import { quizService } from '@/services/features/quizService';

// 4. Component imports
import ToastNotification from '@/components/Notification/ToastNotification';
import Modal from '@/components/Modal/Modal';

// 5. Assets
import logo from '@/assets/logo.png';
```

### File Length

- Components: Max 300 lines (extract logic to custom hooks)
- Services: Max 200 lines (split into multiple files)
- Utilities: Single responsibility, typically < 100 lines

---

## TypeScript (Future Consideration)

When migrating to TypeScript:

```typescript
// Props interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// State typing
const [user, setUser] = useState<User | null>(null);
```

---

## Testing (Recommended)

### Unit Tests

```javascript
// Component.test.jsx
import { render, screen } from '@testing-library/react';
import Button from './Button';

test('renders button with label', () => {
  render(<Button label="Click me" />);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Tests

Test user flows:

```javascript
test('login flow', async () => {
  render(<Login />);
  
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: 'test@example.com' }
  });
  
  fireEvent.click(screen.getByText('Send OTP'));
  
  await waitFor(() => {
    expect(screen.getByText('OTP sent')).toBeInTheDocument();
  });
});
```

---

## Performance Guidelines

### Memoization

```javascript
// ✅ Memoize expensive calculations
const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

// ✅ Memoize callback functions
const handleClick = useCallback(() => {
  console.log('clicked');
}, []);
```

### Lazy Loading

```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

---

## Security

### XSS Prevention

React escapes by default, but avoid:

```javascript
// ❌ Dangerous
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Safe
<div>{userInput}</div>
```

### Environment Variables

```javascript
// ❌ Never expose secrets
const API_KEY = 'sk_live_abc123';

// ✅ Use environment variables (non-sensitive only)
const API_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## Git Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or dependencies

### Examples

```
feat(auth): add email OTP verification

Implemented OTP input modal with 6-digit validation

Closes #123
```

```
fix(quiz): correct date filter timezone handling

Converted local dates to UTC before API calls

Fixes #456
```

---

## Code Review Checklist

Before submitting PR:

- [ ] Code follows naming conventions
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Responsive design tested
- [ ] Dark theme support (if applicable)
- [ ] Comments added for complex logic
- [ ] No hardcoded values (use constants)
- [ ] Prop types validated (TypeScript or PropTypes)
- [ ] Accessibility attributes added

---

## Accessibility

### Semantic HTML

```javascript
// ✅ Use semantic tags
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ Avoid generic divs for navigation
<div>
  <div onClick={navigateHome}>Home</div>
</div>
```

### ARIA Labels

```javascript
<button aria-label="Close modal" onClick={closeModal}>
  <X size={20} />
</button>

<input aria-label="Search" placeholder="Search..." />
```

### Keyboard Navigation

```javascript
function handleKeyDown(e) {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter') handleSubmit();
}

<div onKeyDown={handleKeyDown} tabIndex={0}>
```

---

## Documentation

### JSDoc Comments

```javascript
/**
 * Formats a date to a localized string
 * @param {Date} date - The date to format
 * @param {string} locale - Locale code (e.g., 'en-US')
 * @returns {string} Formatted date string
 */
function formatDate(date, locale = 'en-US') {
  return date.toLocaleDateString(locale);
}
```

### README Updates

Update README when adding:
- New features
- Environment variables
- Setup instructions
- Deployment configuration
