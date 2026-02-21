# OpenAPI Specification Quick Reference

## File Location

`server/docs/openapi.yaml`

## Accessing Documentation

### Interactive UI (Swagger UI)

Start the server and visit:

```
http://localhost:5000/api-docs
```

**Features:**
- Test API endpoints directly from the browser
- View request/response schemas
- See all authentication requirements
- Explore model definitions

### Alternative URLs

```
http://localhost:5000/docs  (redirects to /api-docs)
```

## Specification Structure

### Info Section

- **Title:** Trash Management System API
- **Version:** 1.0.0
- **Base URL:** https://api.trashapp.com/v1

### Tags (Endpoint Groups)

1. **Authentication** - User auth and session management
2. **Quiz** - Quiz engagement system
3. **Settings** - User profile and account settings
4. **ID Card** - Digital identity card generation
5. **System** - Health and monitoring

### Security Schemes

**bearerAuth:**
- Type: HTTP Bearer
- Format: JWT
- Header: `Authorization: Bearer <token>`

## Complete Endpoint List

### Total Endpoints: 30

#### Authentication (10 endpoints)
- POST `/auth/request-otp`
- POST `/auth/verify-otp`
- POST `/auth/complete-signup`
- POST `/auth/refresh`
- POST `/auth/logout`
- GET  `/auth/user/:userId`
- GET  `/auth/districts`
- GET  `/auth/wards/:districtId`
- GET  `/auth/streets/:wardId`
- POST `/auth/check-contact`

#### Quiz (9 endpoints)
- GET   `/quiz/stats`
- POST  `/quiz/start`
- GET   `/quiz/resume/:quizId`
- PATCH `/quiz/answer`
- PATCH `/quiz/mark`
- POST  `/quiz/submit`
- GET   `/quiz/history` (with pagination)
- GET   `/quiz/review/:quizId`
- GET   `/quiz/certificate/:quizId` (PDF download)

#### Settings (8 endpoints)
- GET    `/settings/profile`
- PATCH  `/settings/profile`
- DELETE `/settings/profile-pic`
- POST   `/settings/request-email-otp`
- POST   `/settings/verify-email-otp`
- POST   `/settings/request-phone-otp`
- GET    `/settings/address`
- PATCH  `/settings/address`

#### ID Card (1 endpoint)
- GET `/idcard`

#### System (2 endpoints)
- GET `/health`
- Internal: `/api-docs` (Swagger UI)

## Reusable Components

### Schemas (27 components)

**Response Types:**
- SuccessResponse
- CreatedResponse
- ErrorResponse
- ValidationErrorResponse
- PaginationInfo

**Domain Models:**
- UserDetails
- UserProfile
- District
- Ward
- Street
- Address
- QuizStats
- QuizSession
- QuizQuestion
- QuizResult
- QuizHistoryItem
- QuizReview
- IdCard

### Response Templates

**Standard Responses:**
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 410 Gone (quiz expired)
- 422 Validation Error
- 500 Internal Server Error

## Authentication Flow Documented

```yaml
1. POST /auth/request-otp
   ↓
2. POST /auth/verify-otp
   ↓ (returns accessToken + sets refreshToken cookie)
3. Use Bearer token in subsequent requests
   ↓
4. POST /auth/refresh (when token expires)
   ↓ (returns new accessToken + new refreshToken cookie)
5. POST /auth/logout (invalidates tokens)
```

## Pagination Documentation

**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 10, max: 100)

**Response Schema:**
```yaml
pagination:
  currentPage: 1
  totalPages: 5
  totalItems: 47
  itemsPerPage: 10
  hasNextPage: true
  hasPreviousPage: false
```

## File Upload Endpoints

**Multipart/form-data:**
1. POST `/auth/complete-signup` (profilePic)
2. PATCH `/settings/profile` (profilePic)

## Date Filtering

**Supported on:**
- GET `/quiz/history`

**Parameters:**
- `dateFilter` (enum: today, week, month, custom)
- `startDate` (ISO 8601 date)
- `endDate` (ISO 8601 date)

## Special Response Codes

**409 Conflict:**
- Used when starting quiz with incomplete session
- Includes `incompleteQuizId` for resumption

**410 Gone:**
- Quiz time expired
- May include `autoSubmitted: true` with results

## PDF Response

**GET `/quiz/certificate/:quizId`**
- Content-Type: application/pdf
- Content-Disposition: inline
- Returns binary PDF file

## Role IDs Reference

Documented in schema descriptions:

| ID | Role                    |
|----|-------------------------|
| 1  | Resident                |
| 2  | Trash Worker            |
| 3  | Supervisor              |
| 4  | Sanitary Inspector      |
| 5  | Municipal Health Officer|
| 6  | Commissioner            |

## Validation Rules Documented

**OTP Code:**
- Pattern: `^\d{6}$`
- Must be exactly 6 digits

**Email:**
- Format: email
- Validated server-side

**Phone:**
- Example: `+919876543210`
- Format varies by region

## Usage in Tools

### Import into Postman

1. Import > Link > `http://localhost:5000/api-docs-json`
2. Or upload `openapi.yaml` file

### Import into Insomnia

1. Import > From File > Select `openapi.yaml`

### Generate Client SDKs

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript Axios client
openapi-generator-cli generate \
  -i server/docs/openapi.yaml \
  -g typescript-axios \
  -o client/src/api-client
```

### Generate Server Stubs

```bash
# Generate Node.js Express stub
openapi-generator-cli generate \
  -i server/docs/openapi.yaml \
  -g nodejs-express-server \
  -o server-stub
```

## Validation

### Validate Spec

```bash
# Install Swagger CLI
npm install -g @apidevtools/swagger-cli

# Validate OpenAPI spec
swagger-cli validate server/docs/openapi.yaml
```

## Maintenance

### When Adding New Endpoints

1. Add route in appropriate `*.routes.js`
2. Implement controller in `*.controller.js`
3. Update `openapi.yaml`:
   - Add path under appropriate tag
   - Define request/response schemas
   - Add to components if reusable
4. Test in Swagger UI
5. Update `docs/README.md` endpoint table

### Best Practices

- Use meaningful operationIds
- Include detailed descriptions
- Provide request/response examples
- Document all query parameters
- Mark deprecated endpoints
- Version breaking changes

## OpenAPI Extensions

None currently used. Consider adding:

- `x-internal: true` for internal-only endpoints
- `x-rate-limit: 100` for rate limiting metadata
- `x-permission: role_id` for RBAC documentation

## Future Enhancements

Planned additions:
- Webhook documentation
- Rate limiting specifications
- API versioning strategy
- Deprecation notices
- Performance SLAs
- Error code catalog

## Resources

- **OpenAPI Spec:** https://spec.openapis.org/oas/v3.0.3
- **Swagger UI:** https://swagger.io/tools/swagger-ui/
- **Validators:** https://apitools.dev/swagger-cli/
- **Generators:** https://openapi-generator.tech/
