# Feedback System

## Overview

The feedback system enables residents to rate and review waste collection services. It features a dual-mode verification process (QR code or OTP) and session-based feedback generation for trash collectors.

## User Flows

### Trash Collector Flow

1. Worker navigates to "Create Feedback Session"
2. Generates daily QR code + 6-digit OTP
3. Shares QR/OTP with residents after service
4. Session expires at midnight

### Resident Flow

1. Resident receives QR code or OTP
2. Navigates to "Submit Feedback"
3. Verifies identity via QR scan or OTP entry
4. Submits rating and comments
5. Acknowledgment displayed

---

## Entry Points

| User Type | Route | Component | Description |
|-----------|-------|-----------|-------------|
| Trash Collector, Supervisor, SI | `/create-feedback-session` | `CreateFeedBack.jsx` | Generate QR/OTP session |
| All Roles | `/submit-feedback` | `SubmitFeedBack.jsx` | Submit service feedback |

---

## CreateFeedBack.jsx

**Location**: `src/pages/Common/Feedback/CreateFeedBack.jsx`

### Purpose

Generate a daily feedback collection session with QR code and OTP for residents.

### Key Features

#### Session Information Display

```javascript
const collectorData = {
  name: "John Martinez",
  route: "Downtown District - Zone A",
  vehicle: "TC-2047",
  sessionGeneratedAt: "08:30:45 AM"
};

const sessionOTP = "749382";
const isSessionActive = true;
```

#### QR Code Generation

```javascript
const qrCodeURL = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=FEEDBACK-${sessionOTP}-SESSION`;
```

**QR Data Format**: `FEEDBACK-{OTP}-SESSION`

#### Session Timer

```javascript
function getTimeUntilMidnight() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}
```

**Real-Time Clock**:
```javascript
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentTime(new Date());
  }, 1000);

  return () => clearInterval(timer);
}, []);
```

### UI Sections

#### 1. Collector Header

```javascript
<div className="flex justify-between">
  <div>
    <h2>{collectorData.name}</h2>
    <Location icon />
    <span>{collectorData.route}</span>
    <p>Vehicle ID: {collectorData.vehicle}</p>
  </div>
  <div>
    <p>{formatTime(currentTime)}</p>
    <p>{formatDate(currentTime)}</p>
  </div>
</div>
```

#### 2. Session Status Indicator

```javascript
{isSessionGenerated && (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${isSessionActive ? "bg-success" : "bg-error"}`} />
    <span>
      Session {isSessionActive ? "Active" : "Expired"} • Expires in {getTimeUntilMidnight()}
    </span>
  </div>
)}
```

#### 3. QR Code Display

```javascript
<div className="relative">
  <img src={qrCodeURL} alt="Feedback QR Code" className="w-64 h-64" />
  <button onClick={openModal} className="absolute top-2 right-2">
    <Expand icon />
  </button>
</div>
```

#### 4. OTP Display

```javascript
<div className="bg-secondary px-8 py-4 rounded-medium">
  <p className="text-3xl font-bold tracking-wider">
    {sessionOTP}
  </p>
</div>
```

#### 5. Expanded QR Modal

```javascript
{isModalOpen && (
  <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm">
    <div className="bg-white rounded-large p-8">
      <button onClick={closeModal}>
        <X icon />
      </button>
      <img src={qrCodeURL} alt="QR Code" className="w-full max-w-sm" />
      <div>
        <p>One-Time Password</p>
        <p className="text-3xl font-bold">{sessionOTP}</p>
      </div>
    </div>
  </div>
)}
```

### Data Flow

```
Worker clicks "Generate QR Code & OTP"
       ↓
API Call: POST /feedback/create-session
       ↓
Backend generates unique OTP & session ID
       ↓
Returns: { sessionId, otp, qrCodeData, expiresAt }
       ↓
Frontend displays QR + OTP
       ↓
Session auto-expires at midnight
```

---

## SubmitFeedBack.jsx

**Location**: `src/pages/Common/Feedback/SubmitFeedBack.jsx`

### Purpose

Allow residents to verify and submit service feedback using QR code or OTP.

### Key Features

#### Verification Method Toggle

```javascript
const [verifyMethod, setVerifyMethod] = useState("QR");

<div className="flex">
  <button onClick={() => setVerifyMethod("QR")}>
    <QR icon />
    Scan QR Code
  </button>
  <button onClick={() => setVerifyMethod("OTP")}>
    <Mobile icon />
    Enter OTP Code
  </button>
</div>
```

#### QR Scanner

```javascript
const videoRef = useRef(null);
const [stream, setStream] = useState(null);

async function startCamera() {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" } 
    });
    setStream(mediaStream);
    
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play();
    }
    
    ToastNotification("Camera activated - Position QR code", "info");
  } catch (error) {
    ToastNotification("Unable to access camera. Please check permissions.", "error");
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }
}
```

**Camera Lifecycle**:
```javascript
useEffect(() => {
  if (verifyMethod === "QR") {
    startCamera();
  } else {
    stopCamera();
  }
  
  return () => stopCamera();
}, [verifyMethod]);
```

#### OTP Input

```javascript
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

function handleOtpInput(index, value) {
  if (!/^\d*$/.test(value)) return;  // Only digits
  
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

**OTP Grid**:
```javascript
<div className="grid grid-cols-6 gap-2">
  {otp.map((digit, index) => (
    <input
      key={index}
      ref={otpRefs[index]}
      type="text"
      inputMode="numeric"
      maxLength="1"
      value={digit}
      onChange={(e) => handleOtpInput(index, e.target.value)}
      onKeyDown={(e) => handleBackspace(index, e)}
    />
  ))}
</div>
```

#### Verification Handler

```javascript
function handleVerifySuccess() {
  const code = otp.join("");
  
  if (verifyMethod === "OTP" && code.length < 6) {
    ToastNotification("Please enter the full 6-digit OTP", "warning");
    return;
  }

  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }

  ToastNotification("Verification Successful!", "success");
  
  setTimeout(() => {
    setShowModal(true);
  }, 600);
}
```

### FeedBackModal Component

**Location**: `src/components/Modals/Residents/FeedbackModal.jsx`

**Props**:
```typescript
{
  collector: {
    id: string,
    name: string,
    avatar: string,
    rating: number
  },
  onClose: () => void
}
```

**Features**:
- Star rating selector
- Comment text area
- Category selection (cleanliness, timeliness, behavior)
- Submit button

---

## API Integration

### Endpoints

#### Create Session

**Request**:
```javascript
POST /feedback/create-session
Body: {
  worker_id: 123,
  route_id: 456,
  vehicle_id: 789
}
```

**Response**:
```json
{
  "data": {
    "sessionId": "uuid-v4",
    "otp": "749382",
    "qrCodeData": "FEEDBACK-749382-SESSION",
    "expiresAt": "2026-02-21T23:59:59Z"
  }
}
```

#### Verify Session

**Request**:
```javascript
POST /feedback/verify-session
Body: {
  method: "qr" | "otp",
  code: "749382" | "FEEDBACK-749382-SESSION"
}
```

**Response**:
```json
{
  "data": {
    "valid": true,
    "worker": {
      "id": 123,
      "name": "John Martinez",
      "avatar": "url"
    }
  }
}
```

#### Submit Feedback

**Request**:
```javascript
POST /feedback/submit
Body: {
  session_id: "uuid",
  rating: 5,
  comment: "Excellent service!",
  categories: ["cleanliness", "timeliness"]
}
```

**Response**:
```json
{
  "message": "Feedback submitted successfully"
}
```

---

## State Management

### Session Generation State

```javascript
const [isSessionGenerated, setIsSessionGenerated] = useState(false);
const [sessionData, setSessionData] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
```

### Verification State

```javascript
const [verifyMethod, setVerifyMethod] = useState("QR");
const [otp, setOtp] = useState(["", "", "", "", "", ""]);
const [stream, setStream] = useState(null);
const [showModal, setShowModal] = useState(false);
```

---

## Validation Logic

### OTP Format Validation

```javascript
if (!/^\d{6}$/.test(otp.join(""))) {
  ToastNotification("OTP must be exactly 6 digits", "error");
  return;
}
```

### Session Expiry Check

```javascript
const now = new Date();
const expiry = new Date(sessionData.expiresAt);

if (now > expiry) {
  ToastNotification("Session expired. Please generate a new one.", "error");
  setIsSessionGenerated(false);
  return;
}
```

### Rating Validation

```javascript
if (rating < 1 || rating > 5) {
  ToastNotification("Please select a rating", "warning");
  return;
}
```

---

## Edge Cases

### Camera Permission Denied

```javascript
catch (error) {
  if (error.name === 'NotAllowedError') {
    ToastNotification("Camera access denied. Please enable in browser settings.", "error");
  } else {
    ToastNotification("Unable to access camera.", "error");
  }
}
```

### Network Failure During QR Scan

```javascript
setTimeout(() => {
  if (!verificationComplete) {
    ToastNotification("QR scan timeout. Please try OTP instead.", "warning");
    setVerifyMethod("OTP");
    stopCamera();
  }
}, 30000);  // 30-second timeout
```

### Session Already Used

Backend should track if OTP/QR has been used and return error:

```json
{
  "error": "This session has already been used"
}
```

---

## Security Considerations

### OTP Generation

- 6-digit numeric code
- Cryptographically random
- Single-use only
- 24-hour expiration

### QR Code Structure

```
FEEDBACK-{OTP}-SESSION
```

**Validation**: Backend verifies QR prefix and OTP existence

### Rate Limiting

- Max 3 session generations per hour per worker
- Max 5 verification attempts per session
- Cooldown after failed attempts

---

## User Experience

### Success Flow

```
1. Worker generates session
2. QR + OTP displayed
3. Worker shares with resident
4. Resident scans QR or enters OTP
5. Verification modal shows
6. Resident submits rating
7. Thank you message displayed
8. Worker's rating updated
```

### Error Flow

```
1. Resident enters wrong OTP
2. Error toast appears
3. Attempts countdown (5 → 4 → ...)
4. After 5 failures → session locked
5. Resident must request new OTP from worker
```

---

## Responsive Design

### Mobile Optimization

- QR code scales to viewport
- OTP input grid responsive (6 columns on desktop, 6 on mobile)
- Camera viewport full-width on small screens
- Modal full-screen on mobile

### Touch Interactions

- Large touch targets for OTP inputs
- Swipe to close modals
- Auto-focus keyboard on mobile OTP input

---

## Accessibility

### Screen Reader Support

```javascript
<button aria-label="Expand QR Code">
  <Expand icon />
</button>

<input aria-label="OTP digit 1" />
```

### Keyboard Navigation

- Tab through OTP inputs
- Enter to submit
- Escape to close modals

### Visual Indicators

- Active session: Green dot
- Expired session: Red dot
- Loading state: Skeleton animation
