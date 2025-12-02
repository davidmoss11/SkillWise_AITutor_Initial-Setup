# Testing AI Feedback Endpoints

## Quick Start

This guide shows you how to test the new AI feedback endpoints using curl or your API client.

## Prerequisites

1. Backend server running: `docker-compose up backend`
2. Valid authentication token
3. At least one saved challenge

## Step 1: Get Authentication Token

```bash
# Login to get token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'

# Response will include accessToken
# Copy this token for subsequent requests
```

## Step 2: Get Your Challenges

```bash
curl -X GET http://localhost:3001/api/ai/myChallenges \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "challenges": [
      {
        "id": 1,
        "title": "Create a Calculator Function",
        "instructions": "Build a calculator...",
        "difficulty": "easy",
        "category": "JavaScript"
      }
    ]
  }
}
```

## Step 3: Submit Work for Feedback

```bash
curl -X POST http://localhost:3001/api/ai/submitForFeedback \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": 1,
    "submissionText": "function add(a, b) {\n  return a + b;\n}\n\nfunction subtract(a, b) {\n  return a - b;\n}",
    "submissionType": "code"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback generated successfully",
  "data": {
    "submission": {
      "id": 1,
      "challenge_id": 1,
      "user_id": 1,
      "submission_text": "function add(a, b) {...}",
      "status": "reviewed",
      "submitted_at": "2025-01-20T10:30:00Z"
    },
    "feedback": {
      "id": 1,
      "overall_assessment": "Your code demonstrates clean structure...",
      "code_quality_score": 85,
      "meets_requirements": true,
      "strengths": [
        "Clear function names",
        "Simple implementation"
      ],
      "areas_for_improvement": [
        "Add input validation",
        "Consider edge cases"
      ],
      "specific_suggestions": [
        "Check if inputs are numbers",
        "Handle undefined/null values"
      ],
      "next_steps": [
        "Add multiply and divide functions",
        "Implement error handling"
      ]
    },
    "processingTime": 1234
  }
}
```

## Step 4: Get Feedback History

```bash
# Get all feedback for a specific challenge
curl -X GET "http://localhost:3001/api/ai/feedbackHistory?challengeId=1" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get all feedback for user (no challengeId)
curl -X GET http://localhost:3001/api/ai/feedbackHistory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": [
      {
        "id": 1,
        "submission_id": 1,
        "challenge_id": 1,
        "user_id": 1,
        "submission_text": "function add(a, b) {...}",
        "submitted_at": "2025-01-20T10:30:00Z",
        "overall_assessment": "Your code demonstrates...",
        "code_quality_score": 85,
        "strengths": [...],
        "areas_for_improvement": [...],
        "challenge_title": "Create a Calculator Function",
        "challenge_category": "JavaScript",
        "created_at": "2025-01-20T10:30:05Z"
      }
    ],
    "count": 1
  }
}
```

## Testing Different Submission Types

### Code Submission
```json
{
  "challengeId": 1,
  "submissionText": "function example() { return 'Hello'; }",
  "submissionType": "code"
}
```

### Text Submission
```json
{
  "challengeId": 2,
  "submissionText": "This is my essay about data structures...",
  "submissionType": "text"
}
```

### Documentation Submission
```json
{
  "challengeId": 3,
  "submissionText": "# API Documentation\n\n## Endpoints\n...",
  "submissionType": "documentation"
}
```

### Design Submission
```json
{
  "challengeId": 4,
  "submissionText": "Design rationale: I chose a minimalist approach...",
  "submissionType": "design"
}
```

## Frontend Testing

### Using the UI

1. **Navigate to Submission Page**
   ```
   http://localhost:3000/submissions
   ```

2. **Select a Challenge**
   - Click on a challenge from the sidebar
   - Challenge details will appear

3. **Submit Your Work**
   - Click "Submit Your Solution"
   - Enter your code/text
   - Select submission type
   - Click "Submit for Feedback"

4. **View Feedback**
   - Feedback appears automatically after submission
   - Color-coded sections:
     - Green: Strengths
     - Yellow: Areas for improvement
     - Blue: Specific suggestions
     - Gray: Next steps

5. **Review History**
   - Scroll down to see "Previous Submissions"
   - Click to expand historical feedback

## Error Scenarios

### Missing Challenge ID
```bash
curl -X POST http://localhost:3001/api/ai/submitForFeedback \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionText": "some code"
  }'
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Challenge ID and submission text are required"
}
```

### Empty Submission
```bash
curl -X POST http://localhost:3001/api/ai/submitForFeedback \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": 1,
    "submissionText": ""
  }'
```

**Response:** 400 Bad Request
```json
{
  "success": false,
  "message": "Challenge ID and submission text are required"
}
```

### Invalid Challenge
```bash
curl -X POST http://localhost:3001/api/ai/submitForFeedback \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": 99999,
    "submissionText": "some code"
  }'
```

**Response:** 404 Not Found
```json
{
  "success": false,
  "message": "Challenge not found"
}
```

### No Authentication
```bash
curl -X POST http://localhost:3001/api/ai/submitForFeedback \
  -H "Content-Type: application/json" \
  -d '{
    "challengeId": 1,
    "submissionText": "some code"
  }'
```

**Response:** 401 Unauthorized
```json
{
  "success": false,
  "message": "User authentication required"
}
```

## Database Verification

### Check Submission Created
```sql
SELECT * FROM submissions WHERE user_id = YOUR_USER_ID ORDER BY submitted_at DESC LIMIT 5;
```

### Check Feedback Stored
```sql
SELECT 
  af.id,
  af.overall_assessment,
  af.code_quality_score,
  af.meets_requirements,
  c.title as challenge_title,
  af.created_at
FROM ai_feedback af
JOIN challenges c ON af.challenge_id = c.id
WHERE af.user_id = YOUR_USER_ID
ORDER BY af.created_at DESC
LIMIT 5;
```

### Check Feedback Details
```sql
SELECT 
  id,
  overall_assessment,
  code_quality_score,
  strengths,
  areas_for_improvement,
  specific_suggestions,
  next_steps
FROM ai_feedback
WHERE id = FEEDBACK_ID;
```

## Performance Monitoring

### Check Processing Time
The API returns `processingTime` in milliseconds:
```json
{
  "processingTime": 1234  // 1.234 seconds
}
```

**Expected Performance:**
- Simple submissions: 500-1500ms
- Complex submissions: 1500-3000ms
- If >5000ms: Check AI service status

### Monitor Backend Logs
```bash
# Watch real-time logs
docker-compose logs -f backend

# Look for these messages:
# ✅ AI Feedback generated and saved for submission X (1234ms)
```

## Troubleshooting

### Problem: "AI service timeout"
**Solution:** Check Cohere API key is valid:
```bash
docker-compose exec backend env | grep COHERE
```

### Problem: "Database error"
**Solution:** Verify migrations are up to date:
```bash
docker-compose exec backend node scripts/migrate.js status
```

### Problem: "Feedback not displaying"
**Solution:** Check browser console for errors:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for API errors
4. Verify token is valid

### Problem: "Challenge not found"
**Solution:** Generate challenges first:
1. Navigate to challenge generation page
2. Generate a few challenges
3. Save them to your profile
4. Retry submission

## Success Checklist

- [ ] Backend running on port 3001
- [ ] Can login and get token
- [ ] Can retrieve saved challenges
- [ ] Can submit work successfully
- [ ] Feedback displays correctly
- [ ] Can view feedback history
- [ ] Data persists in database
- [ ] Frontend UI works smoothly

## Next Steps

After verifying the endpoints work:

1. **Test with Real Code**: Submit actual challenge solutions
2. **Check Feedback Quality**: Ensure AI gives helpful suggestions
3. **Test Error Cases**: Try invalid inputs
4. **Performance Test**: Submit multiple times rapidly
5. **User Acceptance**: Have real users try the flow

---

**Documentation Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Ready for Testing
