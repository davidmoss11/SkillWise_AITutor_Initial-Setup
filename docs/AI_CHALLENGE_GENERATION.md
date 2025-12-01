# AI Challenge Generation with Hugging Face

## Overview

SkillWise now uses **Hugging Face Inference API** to generate personalized, AI-powered coding challenges for users. This feature leverages the free Hugging Face API to create dynamic, educational content tailored to each user's skill level.

## Features

### 🎯 Core Capabilities

1. **AI-Powered Challenge Generation**
   - Automatically creates coding challenges based on category, difficulty, and topic
   - Generates complete challenge metadata including instructions, test cases, and learning objectives
   - Adapts to user skill level and learning progress

2. **Personalized Learning Paths**
   - Analyzes user performance and suggests appropriate next challenges
   - Adjusts difficulty dynamically based on completion rates and scores
   - Provides variety in challenge types and topics

3. **Intelligent Feedback System**
   - AI-generated feedback on code submissions
   - Constructive suggestions for improvement
   - Identifies strengths and areas for growth

4. **Smart Hint Generation**
   - Context-aware hints that adapt to attempt number
   - Progressive difficulty in hints (gentle → specific → detailed)
   - Resources and links for further learning

## API Endpoints

### Generate Challenge

**POST** `/api/ai/generateChallenge`

Generate a new AI-powered challenge.

**Request Body:**
```json
{
  "category": "programming",
  "difficulty": "medium",
  "topic": "arrays and loops",
  "saveToDatabase": true
}
```

**Parameters:**
- `category` (string, optional): Challenge category (default: "programming")
  - Options: "programming", "algorithms", "data-structures", "web-development", etc.
- `difficulty` (string, optional): Difficulty level (default: "medium")
  - Options: "easy", "medium", "hard", "expert"
- `topic` (string, optional): Specific topic to focus on
- `saveToDatabase` (boolean, optional): Whether to save the challenge to the database (default: false)

**Response:**
```json
{
  "success": true,
  "message": "Challenge generated successfully",
  "data": {
    "challenge": {
      "title": "Array Sum Calculator",
      "description": "Learn to iterate through arrays and calculate sums",
      "instructions": "Write a function that takes an array of numbers...",
      "category": "programming",
      "difficulty_level": "medium",
      "estimated_time_minutes": 30,
      "points_reward": 50,
      "max_attempts": 3,
      "tags": ["arrays", "loops", "math"],
      "prerequisites": ["basic JavaScript", "functions"],
      "learning_objectives": [
        "Understand array iteration",
        "Practice accumulator patterns",
        "Handle edge cases"
      ],
      "starter_code": "function sumArray(numbers) {\n  // Your code here\n}",
      "solution_approach": "Use a loop to iterate and accumulate",
      "test_cases": [
        {
          "input": "[1, 2, 3]",
          "expected_output": "6",
          "description": "Sum of positive numbers"
        }
      ]
    },
    "saved": true,
    "challengeId": 123
  }
}
```

### Get AI Feedback

**POST** `/api/ai/feedback`

Get AI-generated feedback on a code submission.

**Request Body:**
```json
{
  "submissionId": 456,
  "submissionText": "function sumArray(arr) { return arr.reduce((a,b) => a+b, 0); }",
  "challengeId": 123
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": {
      "overall_assessment": "Good use of array methods",
      "strengths": ["Clean syntax", "Proper use of reduce"],
      "areas_for_improvement": ["Add input validation", "Consider edge cases"],
      "specific_suggestions": ["Check if array is empty", "Validate input types"],
      "code_quality_score": 8,
      "meets_requirements": true,
      "next_steps": ["Try more complex array manipulations", "Learn about error handling"]
    }
  }
}
```

### Get Hints

**GET** `/api/ai/hints/:challengeId`

Get AI-generated hints for a specific challenge.

**Response:**
```json
{
  "success": true,
  "data": {
    "hints": {
      "hint": "Start by creating a variable to store the running total",
      "hint_level": "gentle nudge",
      "resources": [
        "MDN: Array.prototype.forEach",
        "JavaScript loops tutorial"
      ]
    }
  }
}
```

### Suggest Next Challenges

**GET** `/api/ai/suggestions`

Get personalized challenge suggestions based on user progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "category": "algorithms",
        "difficulty": "medium",
        "topic": "sorting",
        "reason": "Build on your array manipulation skills"
      },
      {
        "category": "data-structures",
        "difficulty": "medium",
        "topic": "linked lists",
        "reason": "Explore new data structures"
      }
    ]
  }
}
```

### Analyze Learning Progress

**GET** `/api/ai/analysis`

Get AI analysis of the user's learning patterns and progress.

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "learning_pace": "Steady progress with consistent engagement",
      "strengths": ["Problem-solving", "Array manipulation"],
      "growth_areas": ["Recursion", "Complex algorithms"],
      "recommended_focus": ["Practice recursive solutions", "Study time complexity"],
      "motivation_tips": ["Set daily goals", "Join community challenges"]
    }
  }
}
```

## Configuration

### Environment Variables

The following environment variables are configured in `docker-compose.yml`:

```yaml
# Hugging Face Configuration
HUGGINGFACE_API_KEY=your_token_here
HUGGINGFACE_MODEL=google/gemma-2-2b-it
AI_MAX_TOKENS=1500
```

#### Getting Your Hugging Face API Key

1. Visit [Hugging Face](https://huggingface.co/)
2. Create a free account
3. Go to [Settings → Access Tokens](https://huggingface.co/settings/tokens)
4. Create a new token with read access
5. Copy the token and add it to your environment variables

#### Available Models

The default model is `google/gemma-2-2b-it`, but you can use other instruction-tuned models:

- `google/gemma-2-2b-it` (Default, good balance)
- `mistralai/Mistral-7B-Instruct-v0.2`
- `meta-llama/Llama-2-7b-chat-hf`
- `HuggingFaceH4/zephyr-7b-beta`

To change the model, update the `HUGGINGFACE_MODEL` environment variable.

## Usage Examples

### Example 1: Generate a Beginner Challenge

```javascript
// Frontend: Request a beginner-level challenge
const response = await fetch('/api/ai/generateChallenge', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    category: 'programming',
    difficulty: 'easy',
    topic: 'variables and types',
    saveToDatabase: true
  })
});

const { data } = await response.json();
console.log('New challenge:', data.challenge.title);
```

### Example 2: Get Personalized Challenge Suggestions

```javascript
// Get AI suggestions for next challenges
const response = await fetch('/api/ai/suggestions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
data.suggestions.forEach(suggestion => {
  console.log(`Try: ${suggestion.topic} (${suggestion.difficulty})`);
  console.log(`Reason: ${suggestion.reason}`);
});
```

### Example 3: Bulk Generate Challenges

```javascript
// Backend: Use challengeService to generate multiple challenges
const challengeService = require('./services/challengeService');

const challenges = await challengeService.generateBulkChallenges({
  count: 5,
  categories: ['programming', 'algorithms', 'data-structures'],
  difficulties: ['easy', 'medium', 'hard'],
  userId: 123
});

console.log(`Generated ${challenges.length} challenges`);
```

## Service Architecture

### aiService.js

Core AI integration service using Hugging Face:

- `generateChallenge()` - Creates new challenges
- `generateFeedback()` - Provides code feedback
- `generateHints()` - Creates contextual hints
- `analyzePattern()` - Analyzes learning patterns
- `suggestNextChallenges()` - Recommends next steps

### challengeService.js

Business logic for challenge management:

- `getChallenges()` - Retrieve challenges with filters
- `generatePersonalizedChallenges()` - AI-powered personalization
- `validateCompletion()` - Validate submissions
- `calculateDifficulty()` - Compute difficulty scores
- `generateBulkChallenges()` - Batch challenge generation
- `saveAIChallenge()` - Persist AI-generated challenges

## Best Practices

### 1. Rate Limiting

The Hugging Face free tier has rate limits. Consider:

- Adding delays between bulk generation requests
- Caching generated challenges
- Implementing request queuing

### 2. Error Handling

Always wrap AI calls in try-catch blocks:

```javascript
try {
  const challenge = await aiService.generateChallenge(params);
  return challenge;
} catch (error) {
  console.error('AI generation failed:', error);
  // Fallback to pre-made challenges
  return await getDefaultChallenge();
}
```

### 3. Response Validation

AI responses may vary. Always validate:

```javascript
if (!challengeData.title || !challengeData.instructions) {
  throw new Error('Invalid challenge format');
}
```

### 4. User Experience

- Show loading indicators during AI generation
- Provide fallback content if AI fails
- Allow users to regenerate challenges
- Save successful generations to reduce API calls

## Performance Considerations

### Token Limits

Different operations have different token limits:

- Challenge generation: 1500 tokens
- Feedback: 1000 tokens
- Hints: 500 tokens
- Analysis: 800 tokens

### Response Times

Typical response times:

- Challenge generation: 5-10 seconds
- Feedback: 3-5 seconds
- Hints: 2-3 seconds

### Optimization Tips

1. **Cache Results**: Store generated challenges in the database
2. **Batch Requests**: Generate multiple challenges during off-peak hours
3. **Progressive Enhancement**: Load basic UI first, then AI content
4. **Fallback Content**: Have pre-made challenges ready

## Troubleshooting

### Issue: "AI response was not valid JSON"

**Solution**: The AI model may return markdown-wrapped JSON. The `parseAIResponse` function handles this, but if issues persist:

```javascript
// Increase max_tokens if response is truncated
AI_MAX_TOKENS=2000
```

### Issue: "Hugging Face API call failed"

**Possible causes**:
1. Invalid or expired API key
2. Rate limit exceeded
3. Model not accessible

**Solution**:
- Verify API key in docker-compose.yml
- Check Hugging Face dashboard for rate limits
- Try a different model

### Issue: Slow response times

**Solutions**:
- Use a smaller, faster model
- Reduce `AI_MAX_TOKENS`
- Implement caching
- Pre-generate challenges during low traffic

## Future Enhancements

- [ ] Multi-language support for challenges
- [ ] Image generation for visual challenges
- [ ] Code execution sandbox integration
- [ ] Real-time collaborative challenge solving
- [ ] Challenge difficulty auto-adjustment based on success rates
- [ ] Community voting on AI-generated challenges
- [ ] Challenge templates and customization

## Additional Resources

- [Hugging Face Documentation](https://huggingface.co/docs)
- [Inference API Guide](https://huggingface.co/docs/api-inference/index)
- [Model Hub](https://huggingface.co/models)
- [Best Practices](https://huggingface.co/docs/api-inference/best-practices)

## Support

For issues or questions:
1. Check this documentation
2. Review error logs in `backend/logs/`
3. Consult the Hugging Face community
4. Contact the development team

---

**Note**: This feature uses the free tier of Hugging Face Inference API. For production use with high traffic, consider upgrading to a paid plan or hosting your own model.
