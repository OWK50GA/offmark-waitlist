#!/bin/bash

# Test script for admin login and waitlist retrieval
# Make sure the backend server is running on port 3001

echo "=== Testing Admin Login and Waitlist Retrieval ==="
echo

# Step 1: Login to get JWT token
echo "1. Getting admin JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/waitlist/login \
  -H "Content-Type: application/json" \
  -d '{"password": "admin123"}')

echo "Login response: $LOGIN_RESPONSE"
echo

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token. Make sure backend is running and password is correct."
  exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."
echo

# Step 2: Use token to get waitlist
echo "2. Fetching waitlist with token..."
WAITLIST_RESPONSE=$(curl -s -X GET http://localhost:3001/api/waitlist \
  -H "Authorization: Bearer $TOKEN")

echo "Waitlist response: $WAITLIST_RESPONSE"
echo

# Step 3: Test without token (should fail)
echo "3. Testing without token (should fail)..."
NO_TOKEN_RESPONSE=$(curl -s -X GET http://localhost:3001/api/waitlist)

echo "No token response: $NO_TOKEN_RESPONSE"
echo

echo "=== Test Complete ==="
echo
echo "Usage:"
echo "1. POST /api/waitlist/login with {\"password\": \"admin123\"} to get token"
echo "2. GET /api/waitlist with 'Authorization: Bearer <token>' header to view entries"
echo "3. POST /api/waitlist with {\"email\": \"user@example.com\"} to add entries (no auth needed)"