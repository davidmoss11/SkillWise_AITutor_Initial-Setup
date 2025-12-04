// AI integration with Cohere API
const axios = require('axios');
const db = require('../database/connection');

// Cohere API configuration
const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';
const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Reusable AI prompt templates for consistent challenge generation
const promptTemplates = {
  generateChallenge: ({
    category = 'programming',
    difficulty = 'medium',
    topic = null,
    userLevel = null,
    learningObjectives = null,
  }) => {
    const difficultyDescriptions = {
      easy: 'beginner-friendly with step-by-step guidance',
      medium: 'intermediate with some complexity requiring problem-solving',
      hard: 'advanced with significant complexity and multiple concepts',
      expert: 'expert-level requiring deep understanding and optimization',
    };

    const prompt = `You are an expert educational content creator. Generate a coding challenge with the following specifications:

**Category:** ${category}
**Difficulty Level:** ${difficulty} (${
      difficultyDescriptions[difficulty] || 'moderate complexity'
    })
${topic ? `**Specific Topic:** ${topic}` : ''}
${userLevel ? `**User Level:** ${userLevel}` : ''}
${learningObjectives ? `**Learning Objectives:** ${learningObjectives}` : ''}

Please provide a JSON response with the following structure (return ONLY valid JSON, no markdown):
{
  "title": "Clear, concise challenge title",
  "description": "Brief overview of what the challenge teaches (2-3 sentences)",
  "instructions": "Detailed step-by-step instructions for completing the challenge",
  "category": "${category}",
  "difficulty_level": "${difficulty}",
  "estimated_time_minutes": <number>,
  "points_reward": <number based on difficulty>,
  "max_attempts": <number>,
  "tags": ["relevant", "tags", "here"],
  "prerequisites": ["required", "knowledge"],
  "learning_objectives": ["objective1", "objective2", "objective3"],
  "starter_code": "Optional starter code template",
  "solution_approach": "High-level approach to solving the challenge (don't give away the answer)",
  "test_cases": [
    {"input": "example input", "expected_output": "expected result", "description": "what this tests"}
  ]
}

Make the challenge engaging, educational, and appropriately challenging for the ${difficulty} level.`;

    return prompt;
  },

  generateFeedback: ({
    submissionCode,
    challengeTitle,
    challengeInstructions,
  }) => {
    return `You are an expert programming tutor providing constructive feedback. 

**Challenge:** ${challengeTitle}
**Instructions:** ${challengeInstructions}
**Student's Submission:**
\`\`\`
${submissionCode}
\`\`\`

Provide detailed, constructive feedback in JSON format (return ONLY valid JSON):
{
  "overall_assessment": "Brief overall assessment of the submission",
  "strengths": ["strength1", "strength2"],
  "areas_for_improvement": ["improvement1", "improvement2"],
  "specific_suggestions": ["suggestion1", "suggestion2"],
  "code_quality_score": <number 1-10>,
  "meets_requirements": <boolean>,
  "next_steps": ["recommended next step 1", "recommended next step 2"]
}

Be encouraging while providing actionable feedback.`;
  },

  generateHints: ({
    challengeTitle,
    challengeInstructions,
    userAttempts = 0,
  }) => {
    const hintLevel =
      userAttempts === 0
        ? 'gentle nudge'
        : userAttempts === 1
        ? 'more specific'
        : 'detailed guidance';

    return `You are a helpful programming tutor. A student is working on this challenge:

**Challenge:** ${challengeTitle}
**Instructions:** ${challengeInstructions}
**Attempt Number:** ${userAttempts + 1}

Provide a ${hintLevel} hint in JSON format (return ONLY valid JSON):
{
  "hint": "Your helpful hint here",
  "hint_level": "${hintLevel}",
  "resources": ["relevant resource 1", "relevant resource 2"]
}

The hint should guide without giving away the solution entirely.`;
  },
};

// Helper function to call Cohere API
const callCohereAPI = async (prompt, maxTokens = 1500) => {
  try {
    if (!COHERE_API_KEY) {
      throw new Error('COHERE_API_KEY is not configured');
    }

    const response = await axios.post(
      COHERE_API_URL,
      {
        model: process.env.COHERE_MODEL || 'command-r-plus-08-2024',
        message: prompt,
        max_tokens: maxTokens,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 second timeout for AI requests
      }
    );

    // Cohere returns text in response.data.text
    return response.data.text;
  } catch (error) {
    console.error('Cohere API Error:', error.response?.data || error.message);
    throw new Error(
      `Cohere API call failed: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Helper function to parse AI response and ensure valid JSON
const parseAIResponse = (responseText) => {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const jsonText = jsonMatch ? jsonMatch[1] : responseText;

    // Try to find JSON object in the text
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    const cleanedText = jsonObjectMatch ? jsonObjectMatch[0] : jsonText.trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    console.error('Response text:', responseText);
    throw new Error('AI response was not valid JSON');
  }
};

const aiService = {
  // Generate a new challenge using AI with configurable parameters
  generateChallenge: async ({
    category = 'programming',
    difficulty = 'medium',
    topic = null,
    userId = null,
  }) => {
    try {
      // Get user level if userId provided
      let userLevel = null;
      if (userId) {
        const userStatsQuery =
          'SELECT * FROM user_statistics WHERE user_id = $1';
        const userStatsResult = await db.query(userStatsQuery, [userId]);
        if (userStatsResult.rows.length > 0) {
          const stats = userStatsResult.rows[0];
          userLevel = `Completed ${stats.challenges_completed} challenges, Average score: ${stats.average_score}`;
        }
      }

      // Generate prompt using template
      const prompt = promptTemplates.generateChallenge({
        category,
        difficulty,
        topic,
        userLevel,
      });

      // Create system message + user prompt for Cohere
      const fullPrompt = `You are an expert educational content creator specializing in programming challenges. Always respond with valid JSON only.

${prompt}`;

      // Call Cohere API
      const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 1500;
      const responseText = await callCohereAPI(fullPrompt, maxTokens);
      const challengeData = parseAIResponse(responseText);

      // Log the AI interaction for monitoring
      console.log('✅ AI Challenge Generated:', {
        category,
        difficulty,
        topic,
        model: process.env.COHERE_MODEL || 'command-r-plus-08-2024',
      });

      // Store AI interaction log in database
      try {
        await db.query(
          `INSERT INTO ai_feedback (challenge_id, user_id, feedback_type, prompt, response, created_at)
           VALUES (NULL, $1, 'challenge_generation', $2, $3, NOW())`,
          [
            userId,
            prompt.substring(0, 500),
            JSON.stringify(challengeData).substring(0, 1000),
          ]
        );
      } catch (logError) {
        console.error('Failed to log AI interaction:', logError.message);
        // Don't fail the request if logging fails
      }

      return challengeData;
    } catch (error) {
      console.error('❌ AI Challenge Generation Error:', error);
      throw new Error(`Failed to generate challenge: ${error.message}`);
    }
  },

  // Generate feedback using AI
  generateFeedback: async (submissionId, submissionText, challengeContext) => {
    try {
      const prompt = promptTemplates.generateFeedback({
        submissionCode: submissionText,
        challengeTitle: challengeContext.title,
        challengeInstructions: challengeContext.instructions,
      });

      const fullPrompt = `You are an expert programming tutor providing constructive feedback. Always respond with valid JSON only.

${prompt}`;

      const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 1000;
      const responseText = await callCohereAPI(fullPrompt, maxTokens);
      const feedback = parseAIResponse(responseText);

      console.log('✅ AI Feedback Generated for submission:', submissionId);

      return feedback;
    } catch (error) {
      console.error('❌ AI Feedback Generation Error:', error);
      throw new Error(`Failed to generate feedback: ${error.message}`);
    }
  },

  // Generate hints for challenges
  generateHints: async (challengeId, userProgress) => {
    try {
      const challengeQuery = 'SELECT * FROM challenges WHERE id = $1';
      const challengeResult = await db.query(challengeQuery, [challengeId]);

      if (challengeResult.rows.length === 0) {
        throw new Error('Challenge not found');
      }

      const challenge = challengeResult.rows[0];
      const prompt = promptTemplates.generateHints({
        challengeTitle: challenge.title,
        challengeInstructions: challenge.instructions,
        userAttempts: userProgress?.attempts || 0,
      });

      const fullPrompt = `You are a helpful programming tutor. Always respond with valid JSON only.

${prompt}`;

      const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 500;
      const responseText = await callCohereAPI(fullPrompt, maxTokens);
      const hints = parseAIResponse(responseText);

      console.log('✅ AI Hints Generated for challenge:', challengeId);

      return hints;
    } catch (error) {
      console.error('❌ AI Hints Generation Error:', error);
      throw new Error(`Failed to generate hints: ${error.message}`);
    }
  },

  // Analyze learning patterns
  analyzePattern: async (userId, learningData) => {
    try {
      // Get user statistics
      const statsQuery = 'SELECT * FROM user_statistics WHERE user_id = $1';
      const statsResult = await db.query(statsQuery, [userId]);

      const stats = statsResult.rows[0] || {};

      const prompt = `Analyze this user's learning pattern and provide insights:
      
**Statistics:**
- Challenges Completed: ${stats.challenges_completed || 0}
- Average Score: ${stats.average_score || 0}
- Current Streak: ${stats.current_streak || 0}
- Total Points: ${stats.total_points || 0}

Provide analysis in JSON format (return ONLY valid JSON):
{
  "learning_pace": "description of their pace",
  "strengths": ["identified strength 1", "identified strength 2"],
  "growth_areas": ["area 1", "area 2"],
  "recommended_focus": ["recommendation 1", "recommendation 2"],
  "motivation_tips": ["tip 1", "tip 2"]
}`;

      const fullPrompt = `You are an expert learning analytics advisor. Always respond with valid JSON only.

${prompt}`;

      const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 800;
      const responseText = await callCohereAPI(fullPrompt, maxTokens);
      const analysis = parseAIResponse(responseText);

      console.log('✅ AI Pattern Analysis Generated for user:', userId);

      return analysis;
    } catch (error) {
      console.error('❌ AI Pattern Analysis Error:', error);
      throw new Error(`Failed to analyze pattern: ${error.message}`);
    }
  },

  // Suggest next challenges
  suggestNextChallenges: async (userId) => {
    try {
      // Get user's completed challenges and current level
      const completedQuery = `
        SELECT c.category, c.difficulty_level, COUNT(*) as count
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1 AND s.status = 'approved'
        GROUP BY c.category, c.difficulty_level
      `;
      const completedResult = await db.query(completedQuery, [userId]);

      const completedSummary =
        completedResult.rows
          .map(
            (row) =>
              `${row.category} (${row.difficulty_level}): ${row.count} challenges`
          )
          .join(', ') || 'No challenges completed yet';

      const prompt = `Based on this user's completed challenges, suggest 3 next challenges they should attempt:

**Completed Challenges:** ${completedSummary}

Provide suggestions in JSON format (return ONLY valid JSON):
{
  "suggestions": [
    {
      "category": "category name",
      "difficulty": "easy|medium|hard|expert",
      "topic": "specific topic",
      "reason": "why this is recommended"
    }
  ]
}`;

      const fullPrompt = `You are an expert learning path advisor. Always respond with valid JSON only.

${prompt}`;

      const maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 600;
      const responseText = await callCohereAPI(fullPrompt, maxTokens);
      const suggestions = parseAIResponse(responseText);

      console.log('✅ AI Challenge Suggestions Generated for user:', userId);

      return suggestions;
    } catch (error) {
      console.error('❌ AI Suggestions Error:', error);
      throw new Error(`Failed to suggest challenges: ${error.message}`);
    }
  },
};

module.exports = aiService;
