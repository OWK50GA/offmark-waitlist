# Implementation Plan: Waitlist Email Backend

## Overview

This implementation plan breaks down the waitlist email backend into discrete, incremental coding tasks. Each task builds on previous work, with testing integrated throughout to catch errors early. The plan follows a bottom-up approach: database setup → core models → business logic → API layer → testing → integration.

## Tasks

- [x] 1. Set up monorepo structure and project dependencies
  - Create root package.json with npm workspaces configuration
  - Create packages/backend directory structure (src/, tests/)
  - Install core dependencies: express, pg, validator, dotenv, cors
  - Install dev dependencies: jest, fast-check, supertest, @types packages
  - Create tsconfig.json for TypeScript configuration
  - Set up .env.example with required environment variables
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 2. Set up database schema and connection
  - [x] 2.1 Create database migration for waitlist table
    - Write SQL migration to create waitlist table with id, email, created_at, updated_at
    - Add unique constraint on LOWER(email) for case-insensitive uniqueness
    - Add indexes on id (primary key) and created_at
    - _Requirements: 4.2, 3.3_
  
  - [x] 2.2 Create database connection module
    - Write database connection pool configuration using pg library
    - Implement connection health check function
    - Add error handling for connection failures
    - _Requirements: 4.1, 4.4_
  
  - [x] 2.3 Write unit tests for database connection
    - Test successful connection with valid credentials
    - Test connection failure handling with invalid credentials
    - _Requirements: 4.3_

- [x] 3. Implement email validation utility
  - [x] 3.1 Create email validator module
    - Implement isValidEmail function using validator.js
    - Check RFC 5322 compliance, length <= 254 chars, presence of local part and domain
    - Implement normalizeEmail function (lowercase, trim)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 3.2 Write property test for email validation
    - **Property 2: Email Format Validation**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Generate random valid and invalid email strings
    - Verify validator correctly identifies valid RFC 5322 emails
    - Test edge case: emails exceeding 254 characters are rejected
  
  - [x] 3.3 Write unit tests for email validator edge cases
    - Test empty string rejection
    - Test missing @ symbol rejection
    - Test missing domain rejection
    - Test special characters handling
    - _Requirements: 2.2, 2.3, 2.4_

- [x] 4. Implement Waitlist model
  - [x] 4.1 Create Waitlist model with database operations
    - Implement create(email) method to insert new entry
    - Implement findByEmail(email) method with case-insensitive lookup
    - Implement findAll(offset, limit) method for pagination
    - Implement count() method for total entries
    - Use parameterized queries to prevent SQL injection
    - _Requirements: 1.1, 3.1, 4.1, 4.2, 8.2, 8.3_
  
  - [x] 4.2 Write property test for data persistence
    - **Property 4: Complete Data Persistence**
    - **Validates: Requirements 4.1, 4.2**
    - Generate random valid emails
    - Submit and verify database contains email, id, and timestamp
  
  - [ ] 4.3 Write property test for duplicate detection
    - **Property 3: Duplicate Detection with Case Insensitivity**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Generate random emails, submit twice with different casing
    - Verify second submission throws duplicate error
  
  - [ ]* 4.4 Write unit tests for model methods
    - Test create method with valid email
    - Test findByEmail returns correct entry
    - Test findAll pagination logic
    - Test count returns accurate total
    - _Requirements: 1.1, 3.1, 8.2, 8.3_

- [x] 5. Checkpoint - Ensure core data layer works
  - Run all tests for database and model layers
  - Verify database migrations apply successfully
  - Ensure all tests pass, ask the user if questions arise

- [x] 6. Implement waitlist controller
  - [x] 6.1 Create submitEmail controller function
    - Extract and validate email from request body
    - Call email validator to check format
    - Check for duplicate using model.findByEmail
    - Insert email using model.create if unique
    - Return appropriate response (201 success, 400 invalid, 409 duplicate)
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_
  
  - [x] 6.2 Create getWaitlist controller function
    - Extract pagination parameters (page, limit) from query string
    - Validate and sanitize pagination parameters (default page=1, limit=50, max limit=100)
    - Call model.findAll with calculated offset and limit
    - Call model.count for total entries
    - Return paginated response with entries and pagination metadata
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 6.3 Write property test for valid email submission
    - **Property 1: Valid Email Submission Success**
    - **Validates: Requirements 1.1, 1.2**
    - Generate random valid emails
    - Submit via controller and verify 201 response with stored data
  
  - [ ]* 6.4 Write property test for pagination correctness
    - **Property 7: Pagination Correctness**
    - **Validates: Requirements 8.2, 8.3**
    - Generate random number of entries
    - Test various page/limit combinations return correct counts
  
  - [ ]* 6.5 Write unit tests for controller error handling
    - Test invalid email returns 400
    - Test duplicate email returns 409
    - Test database error returns 500
    - _Requirements: 2.2, 3.2, 4.3_

- [x] 7. Implement middleware
  - [x] 7.1 Create error handler middleware
    - Catch all errors from routes and controllers
    - Map error types to HTTP status codes
    - Format consistent error responses with code and message
    - Log errors without exposing sensitive information
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 7.2 Create authentication middleware
    - Extract Bearer token from Authorization header
    - Verify JWT token signature and expiration
    - Attach user info to request object
    - Return 401 for invalid/missing tokens
    - _Requirements: 8.4_
  
  - [x] 7.3 Configure CORS middleware
    - Set allowed origins from environment variable
    - Allow GET and POST methods
    - Allow Content-Type and Authorization headers
    - _Requirements: 5.4_
  
  - [ ]* 7.4 Write property test for error message quality
    - **Property 6: Descriptive Error Messages**
    - **Validates: Requirements 6.1, 6.2, 6.4**
    - Generate various error conditions
    - Verify error responses include descriptive messages
    - Verify no sensitive information (stack traces, DB details) in responses
  
  - [x] 7.5 Write unit tests for authentication middleware
    - Test valid token allows access
    - Test invalid token returns 401
    - Test missing token returns 401
    - _Requirements: 8.4_

- [x] 8. Implement API routes
  - [x] 8.1 Create waitlist routes
    - Define POST /api/waitlist route mapped to submitEmail controller
    - Define GET /api/waitlist route mapped to getWaitlist controller with auth middleware
    - Attach CORS middleware to routes
    - Attach error handler middleware
    - _Requirements: 5.1, 8.1_
  
  - [x] 8.2 Create Express app configuration
    - Initialize Express app
    - Configure body parser for JSON
    - Mount waitlist routes
    - Add health check endpoint GET /health
    - Configure error handling middleware
    - _Requirements: 5.2, 5.3_
  
  - [x] 8.3 Write property test for API response format
    - **Property 5: API Response Format Consistency**
    - **Validates: Requirements 5.2, 5.3**
    - Generate various valid and invalid requests
    - Verify all responses are valid JSON with consistent structure

- [x] 9. Checkpoint - Ensure API layer works
  - Run all tests including integration tests
  - Test API endpoints manually with curl or Postman
  - Ensure all tests pass, ask the user if questions arise

- [x] 10. Write integration tests
  - [x]* 10.1 Write integration test for complete submission flow
    - Test POST /api/waitlist with valid email returns 201
    - Test POST /api/waitlist with invalid email returns 400
    - Test POST /api/waitlist with duplicate email returns 409
    - Verify database contains submitted emails
    - _Requirements: 1.1, 1.2, 2.2, 3.2_
  
  - [x]* 10.2 Write integration test for retrieval flow
    - Insert test emails into database
    - Test GET /api/waitlist without auth returns 401
    - Test GET /api/waitlist with auth returns paginated results
    - Test pagination parameters work correctly
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x]* 10.3 Write integration test for CORS functionality
    - Test OPTIONS request returns correct CORS headers
    - Test cross-origin POST request succeeds
    - _Requirements: 5.4_

- [ ] 11. Add documentation and deployment configuration
  - [ ] 11.1 Create README.md with setup instructions
    - Document environment variables
    - Document API endpoints and request/response formats
    - Document how to run migrations
    - Document how to run tests
    - Document how to start the server
  
  - [ ] 11.2 Create database migration scripts
    - Add npm scripts for running migrations up/down
    - Document migration process
  
  - [ ] 11.3 Add npm scripts for common tasks
    - Add scripts: dev, build, start, test, test:unit, test:integration, test:properties
    - Configure test scripts to use test database

- [ ] 12. Final checkpoint - Complete system verification
  - Run full test suite (unit + property + integration)
  - Verify all 7 correctness properties pass
  - Test complete flow: submit email → retrieve waitlist
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Integration tests verify end-to-end functionality
- Checkpoints ensure incremental validation throughout development
