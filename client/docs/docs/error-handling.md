# Error Handling

## Error Handling Strategy

The application implements a multi-layered error handling approach covering network errors, API errors, validation errors, and runtime exceptions.

## API Error Handling

### Service Layer

```javascript
try {
  const response = await api.post('/endpoint', data);
  return response.data;
} catch (error) {
  if (error.response) {
    // Backend returned error response
    throw new Error(error.response.data.message);
  } else if (error.request) {
    // Network error (no response received)
    throw new Error('Network error. Please check your connection.');
  } else {
    // Request configuration error
    throw new Error('Request failed. Please try again.');
  }
}
```

### Component Layer

```javascript
try {
  await submitData(formData);
  ToastNotification("Submitted successfully", "success");
} catch (error) {
  console.error('Submission error:', error);
  ToastNotification(error.message || "Submission failed", "error");
}
```

## Validation Errors

### Inline Validation

```javascript
const [emailError, setEmailError] = useState('');

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    setEmailError('Invalid email format');
    return false;
  }
  setEmailError('');
  return true;
}

<input onChange={(e) => validateEmail(e.target.value)} />
{emailError && <p className="text-error">{emailError}</p>}
```

### Form-Level Validation

```javascript
function validateForm() {
  const errors = {};
  
  if (!formData.name) errors.name = 'Name is required';
  if (!formData.email) errors.email = 'Email is required';
  
  setFormErrors(errors);
  return Object.keys(errors).length === 0;
}

function handleSubmit() {
  if (!validateForm()) {
    ToastNotification('Please fix validation errors', 'warning');
    return;
  }
  // Proceed with submission
}
```

## Network Errors

### Timeout Handling

Axios client configured with 15-second timeout:

```javascript
timeout: 15000
```

Handle timeout errors:

```javascript
catch (error) {
  if (error.code === 'ECONNABORTED') {
    ToastNotification('Request timeout. Please try again.', 'error');
  }
}
```

### Offline Detection

```javascript
window.addEventListener('offline', () => {
  ToastNotification('You are offline', 'warning');
});

window.addEventListener('online', () => {
  ToastNotification('Back online', 'success');
});
```

## Authentication Errors

### 401 Handling

Automatically handled by axios interceptor:

```javascript
if (error.response?.status === 401) {
  // Attempt token refresh
  // If refresh fails → redirect to /login
}
```

### 403 Forbidden

```javascript
if (error.response?.status === 403) {
  ToastNotification('Access denied', 'error');
  navigate('/');  // Redirect to dashboard
}
```

## Runtime Errors

### Error Boundaries (React)

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

## User-Friendly Error Messages

### Message Mapping

```javascript
const ERROR_MESSAGES = {
  'Network Error': 'Unable to connect. Please check your internet connection.',
  'timeout of 15000ms exceeded': 'Request taking too long. Please try again.',
  'Request failed with status code 500': 'Server error. Please try again later.'
};

function getUserFriendlyError(error) {
  return ERROR_MESSAGES[error.message] || 'An unexpected error occurred';
}
```

## Logging

### Development

```javascript
if (import.meta.env.DEV) {
  console.error('Error details:', error);
}
```

### Production

Consider integrating error tracking service (Sentry, LogRocket):

```javascript
Sentry.captureException(error);
```

## Best Practices

1. **Always catch async errors**: Use try-catch for all async operations
2. **Provide context**: Log errors with relevant user action context
3. **User-friendly messages**: Translate technical errors to plain language
4. **Avoid error waterfalls**: Handle errors at appropriate level, don't rethrow unnecessarily
5. **Loading states**: Show loading indicators to prevent user frustration during network delays
