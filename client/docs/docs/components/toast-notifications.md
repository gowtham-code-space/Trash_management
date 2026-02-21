# Toast Notifications

## Overview

Centralized notification system using `react-toastify` for user feedback.

**Location**: `src/components/Notification/ToastNotification.jsx`

## Usage

```javascript
import ToastNotification from '@/components/Notification/ToastNotification';

ToastNotification("Operation successful!", "success");
ToastNotification("An error occurred", "error");
ToastNotification("Please wait...", "info");
ToastNotification("Are you sure?", "warning");
```

## Function Signature

```javascript
ToastNotification(message: string, type: 'success' | 'error' | 'info' | 'warning')
```

## Integration

Must include `<ToastContainer />` in root component or page:

```javascript
import { ToastContainer } from 'react-toastify';

function PageComponent() {
  return (
    <div>
      {/* Page content */}
      <ToastContainer />
    </div>
  );
}
```

## Configuration

```javascript
toast(message, {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
});
```

## Dark Theme Support

```javascript
<ToastContainer theme={isDarkTheme ? "dark" : "light"} />
```

## Best Practices

- ✅ Use for API responses
- ✅ Show for user actions (submit, delete, etc.)
- ❌ Don't spam multiple toasts simultaneously
- ❌ Avoid toasts for validation errors (use inline errors)
