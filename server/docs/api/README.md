# Trash Management System - API Documentation

## Overview

Production-grade REST API for municipal waste management operations. This API supports role-based access control for 6 user types: Residents, Trash Workers, Supervisors, Sanitary Inspectors, Municipal Health Officers, and Commissioners.

## Base URL

- **Production:** `https://api.trashapp.com/v1`
- **Staging:** `https://staging-api.trashapp.com/v1`
- **Development:** `http://localhost:5000/api`

## Interactive Documentation

Access the interactive Swagger UI documentation at:

```
http://localhost:5000/api-docs
```

Or use the shorthand:

```
http://localhost:5000/docs
```

The Swagger UI provides:
- Complete API endpoint reference
- Request/response schemas
- Interactive request testing
- Authentication flow examples
- Model definitions

## Authentication

### Overview

The API uses OTP-based authentication with JWT tokens:

1. **OTP Flow:** Email-based one-time password
2. **Access Tokens:** Short-lived JWT (sent in Authorization header)
3. **Refresh Tokens:** Long-lived tokens (stored in HttpOnly cookies)
4. **Token Rotation:** Automatic refresh token rotation on renewal

### Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Email

    Client->>API: POST /api/auth/request-otp
    API->>Email: Send OTP
    API-->>Client: { otp_id, userId }
    
    Client->>API: POST /api/auth/verify-otp
    API-->>Client: { accessToken } + refreshToken cookie
    
    Client->>API: Authenticated request (Bearer token)
    API-->>Client: Response
    
    Note over Client,API: Token expires
    
    Client->>API: POST /api/auth/refresh (with refresh cookie)
    API-->>Client: New accessToken + new refreshToken cookie
```

### Using Authentication

#### 1. Request OTP

```bash
POST /api/auth/request-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "isSignup": false
}
```

#### 2. Verify OTP

```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp_code": "123456"
}
```

Response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "hasCompletedSignup": true
  }
}
```

#### 3. Use Access Token

```bash
GET /api/quiz/stats
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

#### 4. Refresh Token

```bash
POST /api/auth/refresh
Cookie: refreshToken=<token>
```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/request-otp` | Request OTP for authentication | No |
| POST | `/verify-otp` | Verify OTP and get tokens | No |
| POST | `/complete-signup` | Complete user profile setup | No |
| POST | `/refresh` | Refresh access token | No (uses cookie) |
| POST | `/logout` | Logout and invalidate tokens | No |
| GET | `/user/:userId` | Get user details by ID | No |
| GET | `/districts` | Get all districts | No |
| GET | `/wards/:districtId` | Get wards by district | No |
| GET | `/streets/:wardId` | Get streets by ward | No |
| POST | `/check-contact` | Check if email/phone exists | No |

### Quiz System (`/api/quiz`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/stats` | Get user's quiz statistics | Yes |
| POST | `/start` | Start a new quiz session | Yes |
| GET | `/resume/:quizId` | Resume incomplete quiz | Yes |
| PATCH | `/answer` | Save answer to question | Yes |
| PATCH | `/mark` | Mark question for review | Yes |
| POST | `/submit` | Submit quiz for grading | Yes |
| GET | `/history` | Get quiz history (paginated) | Yes |
| GET | `/review/:quizId` | Get detailed quiz review | Yes |
| GET | `/certificate/:quizId` | Download quiz certificate (PDF) | Yes |

### Settings (`/api/settings`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/profile` | Get user profile | Yes |
| PATCH | `/profile` | Update basic profile | Yes |
| DELETE | `/profile-pic` | Delete profile picture | Yes |
| POST | `/request-email-otp` | Request OTP for email change | Yes |
| POST | `/verify-email-otp` | Verify email change OTP | Yes |
| POST | `/request-phone-otp` | Request OTP for phone change | Yes |
| GET | `/address` | Get user address | Yes |
| PATCH | `/address` | Update user address | Yes |

### ID Card (`/api/idcard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get digital ID card | Yes |

### System

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data object
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 410 | Gone | Resource expired (quiz timeout) |
| 422 | Validation Error | Invalid request data format |
| 500 | Internal Server Error | Server-side error |

## Pagination

Endpoints supporting pagination (e.g., `/api/quiz/history`):

### Request Parameters

```
?page=1&limit=10
```

### Response Format

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "history": [ /* items */ ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

## Date Filtering

Quiz history supports date filtering:

### Predefined Filters

```
?dateFilter=today
?dateFilter=week
?dateFilter=month
```

### Custom Range

```
?dateFilter=custom&startDate=2026-01-01&endDate=2026-02-21
```

## File Uploads

Endpoints supporting file uploads (multipart/form-data):

### Profile Picture Upload

```bash
POST /api/auth/complete-signup
Content-Type: multipart/form-data

userId: 123
firstName: John
lastName: Doe
email: john@example.com
phoneNumber: +919876543210
district: Central District
wardNumber: 5
wardName: Ward 5
streetName: Main Street
houseNumber: 123A
profilePic: <binary file>
```

### Update Profile

```bash
PATCH /api/settings/profile
Content-Type: multipart/form-data

firstName: John
lastName: Doe
profilePic: <binary file>
```

## Role-Based Access Control

User roles and their IDs:

| Role ID | Role Name | Description |
|---------|-----------|-------------|
| 1 | Resident | Regular citizens using waste management services |
| 2 | Trash Worker | Waste collection personnel |
| 3 | Supervisor | Team supervisors managing workers |
| 4 | Sanitary Inspector | Field inspectors monitoring operations |
| 5 | Municipal Health Officer | Health department officials |
| 6 | Commissioner | Top-level municipal administrators |

## Common Workflows

### User Registration Flow

1. Request OTP: `POST /api/auth/request-otp` (isSignup: true)
2. Verify OTP: `POST /api/auth/verify-otp`
3. Complete Signup: `POST /api/auth/complete-signup`
4. Login: Repeat steps 1-2 with isSignup: false

### Quiz Taking Flow

1. Get stats: `GET /api/quiz/stats`
2. Start quiz: `POST /api/quiz/start`
3. Save answers: `PATCH /api/quiz/answer` (multiple times)
4. Mark questions: `PATCH /api/quiz/mark` (optional)
5. Submit quiz: `POST /api/quiz/submit`
6. View review: `GET /api/quiz/review/:quizId`
7. Download certificate: `GET /api/quiz/certificate/:quizId` (if passed)

### Profile Update Flow

1. Get current profile: `GET /api/settings/profile`
2. Update basic info: `PATCH /api/settings/profile`
3. Request email OTP: `POST /api/settings/request-email-otp`
4. Verify email OTP: `POST /api/settings/verify-email-otp`
5. Update address: `PATCH /api/settings/address`

## CORS Configuration

The API accepts requests from:

- Frontend application (`FRONTEND_URL` environment variable)
- Development tunnels (for local development)

Allowed methods: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`

Credentials: Enabled (for cookies)

## Rate Limiting

**Note:** Rate limiting is not currently implemented. Consider implementing for production:

- Authentication endpoints: 5 requests/minute
- General API: 100 requests/minute
- File uploads: 10 requests/minute

## Error Handling

All endpoints return consistent error responses:

```javascript
try {
  // Operation
  return successResponse(res, 'Success message', data);
} catch (error) {
  console.error('Error context:', error);
  return internalServerErrorResponse(res, error.message);
}
```

## Development

### Start Server

```bash
npm run dev
```

### Access Documentation

```
http://localhost:5000/api-docs
```

### Test Health Endpoint

```bash
curl http://localhost:5000/health
```

## Testing

### Example cURL Commands

#### Health Check

```bash
curl http://localhost:5000/health
```

#### Request OTP

```bash
curl -X POST http://localhost:5000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","isSignup":false}'
```

#### Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","otp_code":"123456"}'
```

#### Authenticated Request

```bash
curl -X GET http://localhost:5000/api/quiz/stats \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt
```

## Security Best Practices

### Client-Side

1. Store access tokens in memory (NOT localStorage/sessionStorage)
2. Never expose access tokens in URLs
3. Implement automatic token refresh on 401 responses
4. Clear tokens on logout

### Server-Side

1. Use HTTPS in production
2. Rotate refresh tokens on every refresh
3. Validate all input parameters
4. Use HttpOnly cookies for refresh tokens
5. Implement rate limiting
6. Log authentication attempts
7. Use environment variables for secrets

## Environment Variables

Required environment variables:

```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# JWT Secrets
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=

# Email Service
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASSWORD=

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Support

For API-related issues:

- View OpenAPI spec: `/api-docs`
- Contact: api@trashapp.com

## Version History

### v1.0.0 (Current)

- OTP-based authentication
- Quiz system with pagination and filtering
- User profile management
- Digital ID card generation
- Address management with cascading dropdowns
- Health monitoring endpoint

## License

Proprietary
