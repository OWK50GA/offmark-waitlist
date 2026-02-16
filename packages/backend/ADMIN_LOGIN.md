# Admin Login for Waitlist Access

## Problem
The GET `/api/waitlist` endpoint required JWT authentication, but there was no way to obtain a JWT token.

## Solution
Added a simple admin login endpoint that issues JWT tokens for accessing protected endpoints.

## New Endpoint

### POST `/api/waitlist/login`
**Purpose**: Get JWT token for admin access

**Request**:
```json
{
  "password": "admin123"
}
```

**Response** (Success):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid admin password"
  }
}
```

## Environment Variables
Added to `.env` and `.env.example`:
```env
ADMIN_PASSWORD=admin123
```

## Usage Flow

### 1. Get Admin Token
```bash
curl -X POST http://localhost:3001/api/waitlist/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}'
```

### 2. Use Token to Access Waitlist
```bash
curl -X GET http://localhost:3001/api/waitlist \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Add Emails (No Auth Required)
```bash
curl -X POST http://localhost:3001/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## Test Script
Run `./packages/backend/test-admin.sh` to test the complete flow.

## Security Notes
- **Development Only**: This is a simple password-based auth for demo purposes
- **Production**: Replace with proper user authentication system
- **Token Expiry**: Tokens expire after 24 hours
- **Password**: Change `ADMIN_PASSWORD` in production

## API Endpoints Summary
- `POST /api/waitlist` - Add email (public)
- `POST /api/waitlist/login` - Get admin token (public)
- `GET /api/waitlist` - View entries (requires auth)

## Changes Made
1. Added admin login endpoint in `packages/backend/src/routes/waitlist.ts`
2. Re-enabled authentication on GET endpoint
3. Added `ADMIN_PASSWORD` environment variable
4. Created test script for verification

Now you can access the waitlist data by first logging in as admin!