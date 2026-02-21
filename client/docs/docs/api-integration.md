# API Integration

## Overview

The frontend communicates with the backend RESTful API using **Axios 1.13.3**. All API integration logic is centralized in the `src/services/` directory with a layered architecture.

## Service Architecture

```
Component
    ↓
Feature Service (authService, quizService, etc.)
    ↓
API Methods Wrapper (get, post, put, delete)
    ↓
API Client (Axios instance with interceptors)
    ↓
Backend API (Node.js + Express)
```

---

## Core Services

### apiClient.js

**Location**: `src/services/core/apiClient.js`

**Purpose**: Configure and export axios instance with global interceptors

```javascript
import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
    withCredentials: true,  // Include HttpOnly cookies
    timeout: 15000,         // 15-second timeout
});
```

#### Configuration Details

| Property | Value | Purpose |
|----------|-------|---------|
| `baseURL` | `VITE_API_BASE_URL` env var | API endpoint prefix |
| `withCredentials` | `true` | Send cookies with requests (refresh token) |
| `timeout` | `15000` | Fail requests after 15s |

#### Request Interceptor

Automatically attaches authorization header:

```javascript
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
```

**Flow**:
1. Check if access token exists in authStore
2. Add `Authorization: Bearer <token>` header
3. Proceed with request

#### Response Interceptor

Handles 401 Unauthorized with automatic token refresh:

```javascript
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const accessToken = await refreshAccessToken();
                
                if (accessToken) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
```

**Flow**:
1. Detect 401 response
2. Check if retry already attempted (prevent infinite loop)
3. Call `refreshAccessToken()` → POST `/auth/refresh`
4. Update original request headers with new token
5. Retry original request
6. If refresh fails → redirect to `/login`

---

### apiMethods.js

**Location**: `src/services/core/apiMethods.js`

**Purpose**: Provide standardized HTTP method wrappers

```javascript
import { apiClient } from './apiClient';

export const api = {
    get: (url, config) => apiClient.get(url, config),
    post: (url, data, config) => apiClient.post(url, data, config),
    put: (url, data, config) => apiClient.put(url, data, config),
    delete: (url, config) => apiClient.delete(url, config),
    patch: (url, data, config) => apiClient.patch(url, data, config),
};
```

**Usage**: Import `api` object in feature services for consistent method calls

---

### session.js

**Location**: `src/services/core/session.js`

**Purpose**: Manage access token retrieval and refresh logic

#### getAccessToken()

```javascript
export function getAccessToken() {
    return useAuthStore.getState().accessToken;
}
```

**Returns**: Current access token from authStore

**Usage**: Called by apiClient request interceptor

#### refreshAccessToken()

```javascript
let refreshPromise = null;

export async function refreshAccessToken() {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const response = await apiClient.post('/auth/refresh');
            const { accessToken, user } = response.data.data;

            useAuthStore.getState().setAccessToken(accessToken);
            useAuthStore.getState().setUser(user);

            return accessToken;
        } catch (error) {
            clearSession();
            throw error;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}
```

**Singleton Pattern**: Uses `refreshPromise` to prevent race conditions when multiple requests fail simultaneously

**Flow**:
1. Check for existing refresh in progress → reuse promise
2. POST `/auth/refresh` (sends HttpOnly cookie automatically)
3. Update authStore with new token and user
4. Return new access token
5. Clear session on failure

#### silentRefresh()

```javascript
export async function silentRefresh() {
    try {
        await refreshAccessToken();
    } catch (error) {
        console.log('No active session');
    }
}
```

**Purpose**: Restore session on app mount without user interaction

**Called in**: `App.jsx` useEffect

#### clearSession()

```javascript
export function clearSession() {
    useAuthStore.getState().logout();
}
```

**Purpose**: Clear authStore state (called on logout or refresh failure)

---

## Feature Services

### authService.js

**Location**: `src/services/features/authService.js`

**Endpoints**:

#### requestOtp(data)

```javascript
export const requestOtp = async (data) => {
    const response = await api.post('/auth/request-otp', data);
    return response.data;
};
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "isSignup": false
}
```

**Response**:
```json
{
  "message": "OTP sent to user@example.com",
  "data": {
    "shouldRedirect": null | "signup"
  }
}
```

#### verifyOtp(data)

```javascript
export const verifyOtp = async (data) => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
};
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "isLogin": true
}
```

**Response**:
```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 123,
      "role_id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Side Effects**: Sets HttpOnly refresh token cookie

---

### quizService.js

**Location**: `src/services/features/quizService.js`

**Endpoints**:

#### getQuizHistory(page, limit, dateFilter, startDate, endDate)

```javascript
export const getQuizHistory = async (page, limit, dateFilter = null, startDate = null, endDate = null) => {
    let url = `/quiz/history?page=${page}&limit=${limit}`;
    
    if (dateFilter) {
        url += `&dateFilter=${dateFilter}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
    }
    
    const response = await api.get(url);
    return response.data;
};
```

**Query Parameters**:
- `page`: Current page number
- `limit`: Items per page
- `dateFilter`: `today`, `week`, `month`, `custom`
- `startDate`: ISO 8601 date string (for custom range)
- `endDate`: ISO 8601 date string (for custom range)

**Response**:
```json
{
  "data": {
    "quizHistory": [
      {
        "id": 1,
        "score": 85,
        "total_questions": 10,
        "created_at": "2026-02-21T10:30:00.000Z"
      }
    ],
    "totalItems": 42
  }
}
```

---

### idCardService.js

**Location**: `src/services/features/idCardService.js`

#### getIdCardData()

```javascript
export const getIdCardData = async () => {
    const response = await api.get('/user/id-card');
    return response.data;
};
```

**Response**: User identity card information

---

### settingsService.js

**Location**: `src/services/features/settingsService.js`

#### updateSettings(data)

```javascript
export const updateSettings = async (data) => {
    const response = await api.put('/user/settings', data);
    return response.data;
};
```

**Request Body**: User preferences and profile updates

---

## API Request Patterns

### Standard GET Request

```javascript
import { api } from '../services/core/apiMethods';

async function fetchData() {
    try {
        const response = await api.get('/endpoint', {
            params: { page: 1, limit: 10 }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error:', error.response?.data?.message);
    }
}
```

### POST Request with Data

```javascript
async function createItem(data) {
    try {
        const response = await api.post('/endpoint', data);
        return response.data;
    } catch (error) {
        throw error;
    }
}
```

### Component Integration

```javascript
import { useState, useEffect } from 'react';
import { quizService } from '../services/features/quizService';

function QuizHistory() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadQuizzes() {
            try {
                const response = await quizService.getQuizHistory(1, 10);
                setQuizzes(response.data.quizHistory);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        loadQuizzes();
    }, []);

    if (loading) return <div>Loading...</div>;

    return <div>{/* Render quizzes */}</div>;
}
```

---

## Error Handling

### Backend Error Response Format

```json
{
  "message": "Error description",
  "error": "Error details (dev mode only)"
}
```

### Frontend Error Handling

```javascript
try {
    const response = await api.post('/endpoint', data);
} catch (error) {
    if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.data.message);
        ToastNotification(error.response.data.message, 'error');
    } else if (error.request) {
        // Request made but no response
        console.error('Network Error');
        ToastNotification('Connection failed. Please try again.', 'error');
    } else {
        // Request setup error
        console.error('Error:', error.message);
    }
}
```

---

## Environment Configuration

### Development

Create `.env` in `client/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production

```env
VITE_API_BASE_URL=https://api.production-domain.com/api
```

**Vite Environment Variables**:
- Must be prefixed with `VITE_` to be exposed to client
- Accessed via `import.meta.env.VITE_VARIABLE_NAME`

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/request-otp` | Request OTP for login/signup |
| POST | `/auth/verify-otp` | Verify OTP and authenticate |
| POST | `/auth/refresh` | Refresh access token (uses cookie) |
| POST | `/auth/logout` | Invalidate refresh token |

### Quiz

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quiz/history` | Get paginated quiz history |
| GET | `/quiz/questions` | Fetch quiz questions |
| POST | `/quiz/submit` | Submit quiz answers |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user/profile` | Get user profile |
| GET | `/user/id-card` | Get identity card data |
| PUT | `/user/settings` | Update user settings |

(Additional endpoints documented in backend API specification)

---

## Best Practices

1. **Centralize API Calls**: Never use axios.get() directly in components
2. **Use Feature Services**: Group related endpoints in service files
3. **Handle Errors Gracefully**: Always wrap API calls in try-catch
4. **Show Loading States**: Display skeletons or spinners during requests
5. **Validate Responses**: Check response structure before using data
6. **Timeout Handling**: API client has 15s timeout, handle appropriately
7. **Token Refresh**: Never manually refresh tokens, let interceptor handle it
8. **Environment Variables**: Use `VITE_` prefix for client-exposed variables
