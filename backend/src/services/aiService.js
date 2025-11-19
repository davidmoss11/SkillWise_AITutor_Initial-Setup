const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI Prompt Templates
 * Reusable templates with placeholders for consistent AI interactions
 */
const PROMPT_TEMPLATES = {
  GENERATE_CHALLENGE: {
    system: `You are an expert programming instructor creating educational coding challenges. 
Generate challenges that are clear, educational, and appropriate for the specified skill level.
Always include: title, description, difficulty level, test cases, and starter code.`,
    
    user: (params) => `Create a coding challenge with the following requirements:

Topic: ${params.topic}
Difficulty: ${params.difficulty}
Programming Language: ${params.language || 'JavaScript'}
Skill Level: ${params.skillLevel || 'intermediate'}

Generate a complete challenge in JSON format with:
1. title: Clear, concise title
2. description: Detailed problem description
3. difficulty: ${params.difficulty}
4. requirements: Array of specific requirements
5. testCases: Array of test cases with input/output
6. starterCode: Template code to help users get started
7. hints: Array of helpful hints (optional)
8. estimatedTime: Estimated completion time in minutes

Make it engaging and educational!`
  },

  EVALUATE_SUBMISSION: {
    system: `You are an expert code reviewer providing constructive, educational feedback.
Analyze code for correctness, code quality, best practices, and potential improvements.
Be encouraging but thorough in your assessment.`,
    
    user: (params) => `Review this code submission:

Challenge: ${params.challengeTitle}
Language: ${params.language || 'JavaScript'}

Code Submission:
\`\`\`${params.language || 'javascript'}
${params.code}
\`\`\`

Expected Requirements:
${params.requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

Provide feedback in JSON format with:
1. score: Overall score (0-100)
2. passed: Boolean indicating if requirements are met
3. strengths: Array of positive aspects
4. improvements: Array of specific suggestions for improvement
5. codeQuality: Assessment of code quality (poor/fair/good/excellent)
6. bestPractices: Array of best practice recommendations
7. bugs: Array of any bugs or issues found
8. summary: Brief overall summary

Be specific and educational in your feedback!`
  },

  PROVIDE_HINT: {
    system: `You are a patient programming tutor providing helpful hints without giving away the complete solution.`,
    
    user: (params) => `A student is working on this challenge:

Title: ${params.challengeTitle}
Description: ${params.challengeDescription}
Current Progress: ${params.progress || 'Just started'}

Provide a helpful hint that:
1. Guides them toward the solution
2. Doesn't reveal the complete answer
3. Encourages problem-solving thinking
4. Is appropriate for their skill level: ${params.skillLevel || 'intermediate'}

Return as JSON: { "hint": "your hint here", "difficulty": "low/medium/high" }`
  }
};

/**
 * Generate a coding challenge using AI
 */
async function generateChallenge(params) {
  try {
    const { topic, difficulty, language, skillLevel } = params;

    // Validate required parameters
    if (!topic || !difficulty) {
      throw new Error('Topic and difficulty are required');
    }

    const systemPrompt = PROMPT_TEMPLATES.GENERATE_CHALLENGE.system;
    const userPrompt = PROMPT_TEMPLATES.GENERATE_CHALLENGE.user(params);

    console.log('[AI Service] Generating challenge:', { topic, difficulty, language });

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const challenge = JSON.parse(content);

    // Log the interaction
    console.log('[AI Service] Challenge generated successfully:', {
      title: challenge.title,
      difficulty: challenge.difficulty,
      tokensUsed: response.usage.total_tokens
    });

    return {
      challenge,
      metadata: {
        model: response.model,
        tokensUsed: response.usage.total_tokens,
        prompt: userPrompt,
        response: content,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[AI Service] Error generating challenge:', error);
    throw new Error(`Failed to generate challenge: ${error.message}`);
  }
}

/**
 * Evaluate a code submission using AI
 */
async function evaluateSubmission(params) {
  try {
    const { code, challengeTitle, requirements, language } = params;

    // Validate required parameters
    if (!code || !challengeTitle || !requirements) {
      throw new Error('Code, challenge title, and requirements are required');
    }

    const systemPrompt = PROMPT_TEMPLATES.EVALUATE_SUBMISSION.system;
    const userPrompt = PROMPT_TEMPLATES.EVALUATE_SUBMISSION.user(params);

    console.log('[AI Service] Evaluating submission for:', challengeTitle);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const feedback = JSON.parse(content);

    // Log the interaction
    console.log('[AI Service] Evaluation completed:', {
      challengeTitle,
      score: feedback.score,
      passed: feedback.passed,
      tokensUsed: response.usage.total_tokens
    });

    return {
      feedback,
      metadata: {
        model: response.model,
        tokensUsed: response.usage.total_tokens,
        prompt: userPrompt,
        response: content,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[AI Service] Error evaluating submission:', error);
    throw new Error(`Failed to evaluate submission: ${error.message}`);
  }
}

/**
 * Generate a hint for a challenge
 */
async function generateHint(params) {
  try {
    const { challengeTitle, challengeDescription, progress, skillLevel } = params;

    if (!challengeTitle || !challengeDescription) {
      throw new Error('Challenge title and description are required');
    }

    const systemPrompt = PROMPT_TEMPLATES.PROVIDE_HINT.system;
    const userPrompt = PROMPT_TEMPLATES.PROVIDE_HINT.user(params);

    console.log('[AI Service] Generating hint for:', challengeTitle);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const hint = JSON.parse(content);

    console.log('[AI Service] Hint generated successfully');

    return {
      hint,
      metadata: {
        model: response.model,
        tokensUsed: response.usage.total_tokens,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('[AI Service] Error generating hint:', error);
    throw new Error(`Failed to generate hint: ${error.message}`);
  }
}

/**
 * Get a specific prompt template
 */
function getPromptTemplate(templateName) {
  return PROMPT_TEMPLATES[templateName] || null;
}

module.exports = {
  generateChallenge,
  evaluateSubmission,
  generateHint,
  getPromptTemplate,
  PROMPT_TEMPLATES
};