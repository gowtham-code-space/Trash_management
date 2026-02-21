# Authentication

## Overview

The application implements a secure OTP-based authentication system with dual-factor verification via email or SMS. Session management uses a hybrid token strategy combining in-memory access tokens and HttpOnly refresh cookies.

## Authentication Flow

### Login Sequence

```
┌─────────────┐
│   User      │
│ enters      │
│ email/phone │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│ Login.jsx validates format  │
└──────┬──────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ authService.requestOtp()          │
│ POST /auth/request-otp            │
│ { email, isSignup: false }        │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ Backend generates OTP             │
│ Sends email/SMS                   │
│ Stores OTP in database (5 min)    │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ Frontend displays OTP modal       │
│ (OtpVerificationModal.jsx)        │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ User enters 6-digit OTP           │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ authService.verifyOtp()           │
│ POST /auth/verify-otp             │
│ { email, otp, isLogin: true }     │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ Backend validates OTP             │
│ Generates access + refresh tokens │
│ Sets refresh token in HttpOnly    │
│ cookie                            │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ Frontend receives response:       │
│ { accessToken, user }             │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ authStore.setAccessToken(token)   │
│ authStore.setUser(user)           │
└──────┬────────────────────────────┘
       │
       ▼
┌───────────────────────────────────┐
│ navigate("/") → Role dashboard    │
└───────────────────────────────────┘
```

## File Structure

### Login Flow Components

| File | Responsibility |
|------|----------------|
| `Login.jsx` | Login page UI and email/phone input |
| `OtpVerificationModal.jsx` | 6-digit OTP input modal |
| `authService.js` | API calls for authentication |
| `authStore.jsx` | Global auth state management |
| `session.js` | Token refresh and session restoration |

---

## Login.jsx

**Location**: `src/pages/Common/Login/Login.jsx`

### Key Features

- **Dual Input Method**: Toggle between SMS (phone) and Email
- **Client-Side Validation**: Format validation before API call
- **Loading States**: Disabled button during OTP request
- **Error Handling**: User-friendly error messages with toast notifications
- **Redirect Logic**: Navigate to signup if user not found

### State Management

```javascript
const [phoneNumber, setPhoneNumber] = useState("");
const [emailInput, setEmailInput] = useState("");
const [selectedMethod, setSelectedMethod] = useState("SMS");
const [showOtpModal, setShowOtpModal] = useState(false);
const [userIdentifier, setUserIdentifier] = useState("");
const [showNewUser, setShowNewUser] = useState(false);
const [isLoading, setIsLoading] = useState(false);
```

### Method Toggle

```javascript
<button onClick={() => setSelectedMethod("SMS")}>
  <Mobile isPressed={selectedMethod === "SMS"} />
  SMS
</button>
<button onClick={() => setSelectedMethod("Gmail")}>
  <Email isPressed={selectedMethod === "Gmail"} />
  Gmail
</button>
```

**Note**: SMS OTP is currently under construction; only email OTP is functional.

### OTP Request Handler

```javascript
async function handleSendOtp() {
  if (isLoading) return;

  if (selectedMethod === "SMS") {
    ToastNotification("OTP via phone is under construction", "info");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput || !emailRegex.test(emailInput)) {
    ToastNotification("Please enter a valid email address", "error");
    return;
  }

  try {
    setIsLoading(true);
    setShowNewUser(false);

    const response = await requestOtp({
      email: emailInput,
      isSignup: false
    });

    if (response.data.shouldRedirect === 'signup') {
      ToastNotification("Account not found. Please sign up first.", "error");
      setShowNewUser(true);
      setTimeout(() => navigate("/signup"), 2000);
      return;
    }

    setUserIdentifier(emailInput);
    ToastNotification(`OTP sent to ${emailInput}`, "success");
    setShowOtpModal(true);
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Failed to send OTP";
    ToastNotification(errorMsg, "error");
  } finally {
    setIsLoading(false);
  }
}
```

### Error States

```javascript
{showNewUser && (
  <p className="text-xs text-error mt-2">
    User not found. Redirecting to signup...
  </p>
)}
```

---

## OtpVerificationModal.jsx

**Location**: `src/components/Modals/Login/OtpVerificationModal.jsx`

### Props

```typescript
{
  identifier: string,     // Email or phone number
  method: string,         // "SMS" or "Gmail"
  isLogin: boolean,       // true for login, false for signup
  onClose: () => void,    // Close modal callback
  onSuccess: () => void   // Success callback (navigate to dashboard)
}
```

### OTP Input Management

```javascript
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

function handleOtpInput(index, value) {
  if (!/^\d*$/.test(value)) return;  // Only digits allowed
  
  const newOtp = [...otp];
  newOtp[index] = value.substring(value.length - 1);
  setOtp(newOtp);

  // Auto-focus next input
  if (value && index < 5) {
    otpRefs[index + 1].current.focus();
  }
}

function handleBackspace(index, e) {
  if (e.key === "Backspace" && !otp[index] && index > 0) {
    otpRefs[index - 1].current.focus();
  }
}
```

### OTP Verification

```javascript
async function handleVerifyOtp() {
  const otpCode = otp.join("");
  
  if (otpCode.length !== 6) {
    ToastNotification("Please enter all 6 digits", "error");
    return;
  }

  setIsLoading(true);

  try {
    const response = await verifyOtp({
      email: identifier,
      otp: otpCode,
      isLogin: isLogin
    });

    const { accessToken, user } = response.data;

    setAccessToken(accessToken);
    setUser(user);

    ToastNotification("Verification successful!", "success");
    onClose();
    onSuccess();  // Navigate to dashboard
  } catch (error) {
    const errorMsg = error.response?.data?.message || "Invalid OTP";
    ToastNotification(errorMsg, "error");
  } finally {
    setIsLoading(false);
  }
}
```

### Resend OTP

```javascript
async function handleResendOtp() {
  if (resendTimer > 0) return;

  try {
    await requestOtp({
      email: identifier,
      isSignup: !isLogin
    });

    ToastNotification("OTP resent successfully", "success");
    setResendTimer(60);  // 60-second cooldown
  } catch (error) {
    ToastNotification("Failed to resend OTP", "error");
  }
}
```

---

## Session Restoration

### App.jsx Initialization

```javascript
useEffect(() => {
  const restoreSession = async () => {
    await silentRefresh();
    setIsLoading(false);
  };

  restoreSession();
}, []);
```

**Flow**:
1. App component mounts
2. Calls `silentRefresh()` from `session.js`
3. `silentRefresh()` → POST `/auth/refresh` (sends HttpOnly cookie)
4. If valid refresh token → new access token returned
5. authStore updated with user data
6. Navigator renders role-specific routes

### Silent Refresh Function

```javascript
export async function silentRefresh() {
  try {
    await refreshAccessToken();
  } catch (error) {
    console.log('No active session');
  }
}
```

**Called When**:
- App mounts (page load/refresh)
- No user interaction required

---

## Token Management

### Access Token

**Storage**: In-memory (Zustand authStore)

**Lifetime**: Short-lived (e.g., 15 minutes)

**Usage**: Attached to API requests via `Authorization: Bearer <token>` header

**Security**: Lost on page refresh (session restored via refresh token)

### Refresh Token

**Storage**: HttpOnly cookie (set by backend)

**Lifetime**: Long-lived (e.g., 7 days)

**Usage**: Automatically sent with requests to `/auth/refresh`

**Security**: Not accessible via JavaScript (prevents XSS theft)

### Token Refresh Flow

```
API Request → 401 Unauthorized
       ↓
Response Interceptor Triggered
       ↓
Check if already retrying? → Yes → Fail
       ↓ No
POST /auth/refresh (with HttpOnly cookie)
       ↓
Backend validates refresh token
       ↓
New access token returned
       ↓
authStore.setAccessToken(newToken)
       ↓
Retry original request with new token
```

**Handled Automatically**: Axios response interceptor manages entire flow

---

## Role-Based Redirection

After successful login, users are redirected based on `role_id`:

```javascript
// Navigator.jsx route guards
{Number(user?.role_id) === 1 && (
  <Route index element={<Home />} />  // Resident
)}

{Number(user?.role_id) === 2 && (
  <Route index element={<TrashManDashboard />} />  // Trash Collector
)}

{Number(user?.role_id) === 3 && (
  <Route index element={<SupervisorDashboard />} />  // Supervisor
)}

// ... up to role_id 6
```

**Default Route**: `/` always renders role-appropriate dashboard

---

## Logout Flow

### Logout Function

```javascript
const logout = useAuthStore((state) => state.logout);

function handleLogout() {
  logout();  // Clears authStore
  navigate('/login');
}
```

**Backend Logout Endpoint** (Optional):
```javascript
await api.post('/auth/logout');  // Invalidates refresh token on server
```

---

## Security Considerations

### Client-Side Security

1. **No localStorage**: Tokens never stored in localStorage (XSS vulnerability)
2. **HttpOnly Cookies**: Refresh tokens inaccessible to JavaScript
3. **Token Expiration**: Access tokens short-lived (15 min)
4. **OTP Validation**: Backend validates timing and attempts

### API Security

1. **HTTPS Only**: All auth requests over HTTPS in production
2. **CORS Configuration**: Restrict origins to trusted domains
3. **Rate Limiting**: Backend enforces OTP request rate limits
4. **OTP Expiration**: OTPs valid for 5 minutes

---

## Error Handling

### Common Error Scenarios

| Error | Cause | User Experience |
|-------|-------|-----------------|
| "User not found" | Email not registered | Redirect to signup |
| "Invalid OTP" | Wrong OTP entered | Error toast, allow retry |
| "OTP expired" | OTP older than 5 minutes | Request new OTP |
| "Too many requests" | Rate limit exceeded | Cooldown message |
| "Refresh token expired" | Session expired | Redirect to login |

### Error Display

```javascript
try {
  // Auth operation
} catch (error) {
  const errorMsg = error.response?.data?.message || "Authentication failed";
  ToastNotification(errorMsg, "error");
}
```

---

## Development vs Production

### Development

- API: `http://localhost:5000/api`
- Cookies: `SameSite=Lax`
- HTTPS: Not required

### Production

- API: `https://api.domain.com/api`
- Cookies: `SameSite=None; Secure`
- HTTPS: Required for `withCredentials: true`

---

## Testing Considerations

### Manual Testing Checklist

- [ ] Login with valid email
- [ ] Login with invalid email format
- [ ] Login with unregistered email
- [ ] OTP verification with correct code
- [ ] OTP verification with wrong code
- [ ] OTP verification with expired code
- [ ] Resend OTP functionality
- [ ] Page refresh session restoration
- [ ] Logout functionality
- [ ] Token refresh on 401 response

### Test User Roles

Create test accounts for each role_id (1-6) to verify role-specific redirects.
