# Design Document: Waitlist Email Backend

## Overview

The waitlist email backend is a RESTful API service that collects and manages email addresses for an application waitlist. The system validates incoming emails, prevents duplicates, and stores entries in a persistent database. Built with a monorepo structure, it provides a foundation for future frontend integration while maintaining independent backend deployability.

The system prioritizes simplicity, reliability, and data integrity. It uses industry-standard email validation, implements proper HTTP semantics, and ensures no email submissions are lost through transactional database operations.

## Architecture

### Technology Stack

**Backend Framework**: Node.js with Express.js
- Mature ecosystem with extensive middleware support
- Excellent for building RESTful APIs
- Strong async/await support for database operations

**Database**: PostgreSQL
- ACID compliance ensures data integrity
- Native support for unique constraints (duplicate prevention)
- Excellent performance for read-heavy operations
- Built-in timestamp types for submission tracking

**Validation**: validator.js library
- RFC 5322 compliant email validation
- Well-tested and maintained
- Lightweight with no dependencies

**Monorepo Tool**: npm workspaces
- Native to Node.js ecosystem
- Simple configuration
- Supports shared dependencies

### System Architecture

```
┌─────────────────────────────────────────────┐
│           Monorepo Root                     │
│  ┌─────────────────────────────────────┐   │
│  │  packages/                          │   │
│  │    ├── backend/                     │   │
│  │    │   ├── src/                     │   │
│  │    │   │   ├── routes/              │   │
│  │    │   │   ├── controllers/         │   │
│  │    │   │   ├── models/              │   │
│  │    │   │   ├── middleware/          │   │
│  │    │   │   └── utils/               │   │
│  │    │   ├── tests/                   │   │
│  │    │   └── package.json             │   │
│  │    └── frontend/ (future)           │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Request Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Validator
    participant Controller
    participant Database

    Client->>API: POST /api/waitlist
    API->>Validator: Validate email format
    alt Invalid format
        Validator-->>API: Validation error
        API-->>Client: 400 Bad Request
    else Valid format
        Validator-->>Controller: Email valid
        Controller->>Database: Check for duplicate
        alt Duplicate exists
            Database-->>Controller: Email exists
            Controller-->>API: Duplicate error
            API-->>Client: 409 Conflict
        else New email
            Database-->>Controller: Email unique
            Controller->>Database: Insert email + timestamp
            Database-->>Controller: Success
            Controller-->>API: Created
            API-->>Client: 201 Created
        end
    end
```

## Components and Interfaces

### 1. API Routes (`routes/waitlist.js`)

Defines HTTP endpoints and maps them to controller functions.

**Endpoints**:
- `POST /api/waitlist` - Submit email to waitlist
- `GET /api/waitlist` - Retrieve waitlist entries (authenticated)

**Responsibilities**:
- Route definition and HTTP method mapping
- Request routing to appropriate controllers
- Middleware attachment (CORS, body parsing, authentication)

### 2. Waitlist Controller (`controllers/waitlistController.js`)

Orchestrates business logic for waitlist operations.

**Functions**:

```typescript
async submitEmail(req, res)
  Input: { email: string }
  Output: { success: boolean, message: string, id?: string }
  
  Process:
  1. Extract email from request body
  2. Validate email format using validator
  3. Check for duplicate in database
  4. If unique, insert into database with timestamp
  5. Return appropriate response

async getWaitlist(req, res)
  Input: { page?: number, limit?: number }
  Output: { emails: Array<WaitlistEntry>, total: number, page: number }
  
  Process:
  1. Verify authentication token
  2. Extract pagination parameters
  3. Query database with offset and limit
  4. Return paginated results
```

**Responsibilities**:
- Request validation and sanitization
- Business logic coordination
- Error handling and response formatting
- Transaction management

### 3. Waitlist Model (`models/Waitlist.js`)

Encapsulates database operations for waitlist entries.

**Schema**:
```typescript
WaitlistEntry {
  id: UUID (primary key)
  email: string (unique, not null, max 254 chars)
  created_at: timestamp (default: now())
  updated_at: timestamp (default: now())
}
```

**Methods**:

```typescript
async create(email: string): Promise<WaitlistEntry>
  - Inserts new email entry
  - Returns created entry with id and timestamp
  - Throws error if duplicate or database failure

async findByEmail(email: string): Promise<WaitlistEntry | null>
  - Case-insensitive email lookup
  - Returns entry if found, null otherwise

async findAll(offset: number, limit: number): Promise<Array<WaitlistEntry>>
  - Returns paginated list of entries
  - Ordered by created_at descending (newest first)

async count(): Promise<number>
  - Returns total number of waitlist entries
```

**Responsibilities**:
- Database query construction
- Data mapping between database and application
- Constraint enforcement (uniqueness, format)

### 4. Email Validator (`utils/emailValidator.js`)

Validates email addresses according to RFC 5322 standards.

**Functions**:

```typescript
function isValidEmail(email: string): boolean
  - Checks email format using validator.js
  - Verifies length <= 254 characters
  - Ensures presence of local part and domain
  - Returns true if valid, false otherwise

function normalizeEmail(email: string): string
  - Converts email to lowercase
  - Trims whitespace
  - Returns normalized email for storage/comparison
```

**Responsibilities**:
- Email format validation
- Email normalization for consistent storage

### 5. Error Middleware (`middleware/errorHandler.js`)

Centralized error handling for consistent error responses.

**Function**:

```typescript
function errorHandler(err, req, res, next)
  - Catches all errors from routes/controllers
  - Maps error types to HTTP status codes
  - Formats error responses consistently
  - Logs errors for debugging (without exposing internals)
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE"
  }
}
```

### 6. Authentication Middleware (`middleware/auth.js`)

Protects admin endpoints from unauthorized access.

**Function**:

```typescript
function authenticateToken(req, res, next)
  - Extracts Bearer token from Authorization header
  - Verifies token signature and expiration
  - Attaches user info to request object
  - Returns 401 if invalid/missing token
```

### 7. CORS Middleware

Enables cross-origin requests from frontend applications.

**Configuration**:
```typescript
{
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Data Models

### Database Schema

**Table: waitlist**

| Column     | Type                  | Constraints                    |
|------------|-----------------------|--------------------------------|
| id         | UUID                  | PRIMARY KEY, DEFAULT gen_random_uuid() |
| email      | VARCHAR(254)          | UNIQUE, NOT NULL               |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP   |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP   |

**Indexes**:
- Primary key index on `id` (automatic)
- Unique index on `LOWER(email)` for case-insensitive duplicate prevention
- Index on `created_at` for efficient sorting

**Constraints**:
- Email uniqueness enforced at database level
- Email length limited to 254 characters (RFC 5321 maximum)
- Timestamps automatically managed by database

### Application Data Models

**WaitlistEntry**:
```typescript
interface WaitlistEntry {
  id: string;           // UUID
  email: string;        // Normalized email address
  createdAt: Date;      // Submission timestamp
  updatedAt: Date;      // Last modification timestamp
}
```

**SubmitEmailRequest**:
```typescript
interface SubmitEmailRequest {
  email: string;        // Raw email from client
}
```

**SubmitEmailResponse**:
```typescript
interface SubmitEmailResponse {
  success: boolean;
  message: string;
  data?: {
    id: string;
    email: string;
    createdAt: string;  // ISO 8601 format
  };
}
```

**GetWaitlistRequest**:
```typescript
interface GetWaitlistRequest {
  page?: number;        // Default: 1
  limit?: number;       // Default: 50, Max: 100
}
```

**GetWaitlistResponse**:
```typescript
interface GetWaitlistResponse {
  success: boolean;
  data: {
    entries: Array<WaitlistEntry>;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Valid Email Submission Success

*For any* valid email address (conforming to RFC 5322 with length ≤ 254 characters), when submitted to the API endpoint, the system should store it in the database with a timestamp and return HTTP status 201 with the stored entry details.

**Validates: Requirements 1.1, 1.2**

### Property 2: Email Format Validation

*For any* string, the email validator should correctly identify whether it conforms to RFC 5322 standards by checking for both local part and domain components, and the system should reject invalid formats with HTTP status 400.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Duplicate Detection with Case Insensitivity

*For any* email address, if it is submitted twice (regardless of character casing), the second submission should be detected as a duplicate and rejected with HTTP status 409.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Complete Data Persistence

*For any* accepted email submission, after receiving a success response, querying the database should return an entry containing the email address, a unique identifier, and a submission timestamp.

**Validates: Requirements 4.1, 4.2**

### Property 5: API Response Format Consistency

*For any* API request (valid or invalid), the response should be valid JSON with a consistent structure including success status, appropriate HTTP status code, and either data or error information.

**Validates: Requirements 5.2, 5.3**

### Property 6: Descriptive Error Messages

*For any* error condition (validation failure, duplicate, or system error), the error response should include a descriptive message that identifies the specific failure reason without exposing sensitive system information.

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 7: Pagination Correctness

*For any* waitlist with N entries, requesting page P with limit L should return exactly min(L, N - (P-1)*L) entries, and the total count should equal N.

**Validates: Requirements 8.2, 8.3**

## Error Handling

### Error Categories

**Validation Errors (400 Bad Request)**:
- Invalid email format
- Missing required fields
- Email exceeds maximum length
- Malformed JSON request body

**Conflict Errors (409 Conflict)**:
- Duplicate email submission

**Authentication Errors (401 Unauthorized)**:
- Missing authentication token
- Invalid or expired token
- Insufficient permissions

**Server Errors (500 Internal Server Error)**:
- Database connection failures
- Unexpected exceptions
- Transaction failures

### Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  }
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| INVALID_EMAIL | Email format is invalid | 400 |
| EMAIL_TOO_LONG | Email exceeds 254 characters | 400 |
| MISSING_EMAIL | Email field is required | 400 |
| DUPLICATE_EMAIL | Email already exists in waitlist | 409 |
| UNAUTHORIZED | Authentication required or failed | 401 |
| DATABASE_ERROR | Database operation failed | 500 |
| INTERNAL_ERROR | Unexpected server error | 500 |

### Error Handling Strategy

1. **Input Validation**: Validate all inputs before processing
2. **Early Return**: Return errors as soon as detected
3. **Transaction Rollback**: Rollback database transactions on failure
4. **Error Logging**: Log all errors with context for debugging
5. **Safe Error Messages**: Never expose stack traces, database details, or system paths to clients
6. **Graceful Degradation**: Handle partial failures without crashing the service

## Testing Strategy

### Dual Testing Approach

The system employs both unit testing and property-based testing for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Specific valid email examples (standard formats)
- Specific invalid email examples (missing @, no domain, etc.)
- Edge cases (empty strings, very long emails, special characters)
- Error conditions (database failures, network issues)
- Integration between components (controller → model → database)

**Property Tests**: Verify universal properties across all inputs
- Generate hundreds of random valid/invalid emails
- Test validation behavior across the input space
- Verify duplicate detection with various casings
- Ensure API contract holds for all request types
- Validate pagination logic with different data sizes

**Balance**: Unit tests should not duplicate what property tests cover. Use unit tests for specific examples that demonstrate correct behavior and integration points. Use property tests for comprehensive input coverage and universal correctness properties.

### Property-Based Testing Configuration

**Library**: fast-check (for Node.js/TypeScript)
- Mature property-based testing library for JavaScript/TypeScript
- Excellent arbitrary generators for common types
- Shrinking support for minimal failing examples

**Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `Feature: waitlist-email-backend, Property N: [property description]`

**Example Property Test Structure**:

```typescript
// Feature: waitlist-email-backend, Property 1: Valid Email Submission Success
test('valid emails are stored and return 201', async () => {
  await fc.assert(
    fc.asyncProperty(
      fc.emailAddress(), // Generate random valid emails
      async (email) => {
        const response = await submitEmail(email);
        expect(response.status).toBe(201);
        const stored = await findEmailInDatabase(email);
        expect(stored).toBeDefined();
        expect(stored.email).toBe(email.toLowerCase());
        expect(stored.createdAt).toBeInstanceOf(Date);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Coverage Goals

- **Unit Test Coverage**: 80%+ of lines, focusing on business logic
- **Property Test Coverage**: All 7 correctness properties implemented
- **Integration Tests**: API endpoints with real database (test environment)
- **Edge Case Coverage**: All identified edge cases from requirements

### Testing Layers

1. **Unit Tests** (`tests/unit/`):
   - Email validator functions
   - Controller logic (with mocked database)
   - Model methods (with mocked database client)
   - Middleware functions

2. **Property Tests** (`tests/properties/`):
   - Email validation properties
   - Duplicate detection properties
   - API contract properties
   - Pagination properties

3. **Integration Tests** (`tests/integration/`):
   - Full API endpoint tests with test database
   - Database transaction behavior
   - Authentication flow
   - CORS configuration

4. **End-to-End Tests** (`tests/e2e/`):
   - Complete user flows (submit → retrieve)
   - Error scenarios across the stack
   - Performance under load (basic smoke tests)

## Deployment Considerations

### Environment Variables

```
DATABASE_URL=postgresql://user:password@host:port/database
PORT=3000
NODE_ENV=production|development|test
JWT_SECRET=secret_key_for_auth_tokens
ALLOWED_ORIGINS=https://example.com,https://app.example.com
LOG_LEVEL=info|debug|error
```

### Database Migrations

Use a migration tool (e.g., node-pg-migrate) to manage schema changes:
- Initial migration creates waitlist table with indexes
- Migrations are versioned and tracked
- Rollback support for failed deployments

### Monitoring and Observability

- **Health Check Endpoint**: `GET /health` returns service status
- **Metrics**: Track submission rate, error rate, response times
- **Logging**: Structured JSON logs with request IDs for tracing
- **Alerts**: Database connection failures, high error rates

### Security Considerations

- **Rate Limiting**: Prevent spam submissions (e.g., 10 requests per IP per minute)
- **Input Sanitization**: Prevent SQL injection and XSS attacks
- **HTTPS Only**: Enforce encrypted connections in production
- **Authentication**: JWT tokens with expiration for admin endpoints
- **CORS**: Restrict origins to known frontend domains
