#!/bin/bash

# API Testing Script for Waitlist Backend
# This script tests the API endpoints manually

BASE_URL="http://localhost:3000"
API_URL="$BASE_URL/api/waitlist"

echo "=========================================="
echo "Waitlist API Manual Testing"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "Test 1: Health Check Endpoint"
echo "GET $BASE_URL/health"
curl -s -X GET "$BASE_URL/health" | jq '.'
echo ""
echo ""

# Test 2: Submit Valid Email
echo "Test 2: Submit Valid Email"
echo "POST $API_URL"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"test@example.com"}' | jq '.'
echo ""
echo ""

# Test 3: Submit Invalid Email (missing @)
echo "Test 3: Submit Invalid Email (missing @)"
echo "POST $API_URL"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"invalidemail"}' | jq '.'
echo ""
echo ""

# Test 4: Submit Duplicate Email
echo "Test 4: Submit Duplicate Email"
echo "POST $API_URL"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{"email":"test@example.com"}' | jq '.'
echo ""
echo ""

# Test 5: Get Waitlist Without Auth (should fail)
echo "Test 5: Get Waitlist Without Authentication"
echo "GET $API_URL"
curl -s -X GET "$API_URL" \
  -H "Origin: http://localhost:3000" | jq '.'
echo ""
echo ""

# Test 6: Get Waitlist With Auth
echo "Test 6: Get Waitlist With Authentication"
echo "GET $API_URL"
echo "Note: Using test JWT token"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3QtdXNlciIsImlhdCI6MTUxNjIzOTAyMn0.4Adcj0vfIRj8OYxdKMDKTKZXBmKzl6FvvJQQZqPCwuQ"
curl -s -X GET "$API_URL" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -H "Origin: http://localhost:3000" | jq '.'
echo ""
echo ""

# Test 7: CORS Preflight
echo "Test 7: CORS Preflight Request"
echo "OPTIONS $API_URL"
curl -s -X OPTIONS "$API_URL" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -i | head -n 20
echo ""
echo ""

echo "=========================================="
echo "Testing Complete"
echo "=========================================="
