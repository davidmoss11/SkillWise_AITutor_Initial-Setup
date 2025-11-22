// AI integration with OpenAI API & Prisma/Postgres fallback
const OpenAI = require('openai');
const { PrismaClient } = require('@prisma/client');
const db = require('../database/connection');
const promptTemplateService = require('./aiPromptTemplateService');

let prisma;
try {
  prisma = new PrismaClient();
} catch (err) {
  // Prisma may not be migrated yet; will fallback to raw SQL
  prisma = null;
}

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const buildChallengePrompt = ({ subject, difficulty }) => {
  return promptTemplateService.render('challenge', {
    subject: subject || 'general programming',
    difficulty: difficulty || 'medium',
  });
};

const buildFeedbackPrompt = ({ submissionText, challengeContext }) => {
  return promptTemplateService.render('feedback', {
    submission: submissionText.substring(0, 4000),
    context: JSON.stringify(challengeContext || {}),
  });
};

const callOpenAIChat = async (prompt) => {
  if (!openaiClient) {
    return {
      content: '[MOCK] ' + prompt.slice(0, 100) + '...',
      model: 'mock-local',
      latencyMs: 0,
    };
  }
  const start = Date.now();
  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are an educational AI assistant.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 600,
  });
  const latencyMs = Date.now() - start;
  return {
    content: completion.choices[0].message.content,
    model: completion.model,
    latencyMs,
  };
};

const logChallenge = async ({ prompt, response, model }) => {
  // Table columns: id, prompt, response, model, metadata, created_at
  const query =
    'INSERT INTO ai_challenge_logs (prompt, response, model, created_at) VALUES ($1,$2,$3,NOW())';
  try {
    await db.query(query, [prompt, response, model]);
  } catch (err) {
    // Non-fatal
  }
};

const storeFeedback = async ({ prompt, response }) => {
  // ai_feedback table schema requires feedback_text NOT NULL.
  const sql =
    'INSERT INTO ai_feedback (submission_id, prompt, response, feedback_text, created_at) VALUES ($1,$2,$3,$4,NOW())';
  try {
    await db.query(sql, [null, prompt, response, response]);
  } catch (err) {
    // Non-fatal if table not present yet
  }
};

const aiService = {
  // Sprint 3.2: Generate challenge
  generateChallenge: async ({ subject, difficulty, userId }) => {
    const prompt = buildChallengePrompt({ subject, difficulty });
    const ai = await callOpenAIChat(prompt);
    await logChallenge({ prompt, response: ai.content, model: ai.model });
    return {
      challenge: ai.content,
      metadata: {
        model: ai.model,
        latencyMs: ai.latencyMs,
        subject: subject || null,
        difficulty: difficulty || null,
      },
    };
  },

  // Sprint 3.5: Generate feedback
  generateFeedback: async ({ submissionText, challengeContext, userId }) => {
    const prompt = buildFeedbackPrompt({ submissionText, challengeContext });
    const ai = await callOpenAIChat(prompt);
    await storeFeedback({ prompt, response: ai.content });
    return {
      feedback: ai.content,
      metadata: {
        model: ai.model,
        latencyMs: ai.latencyMs,
      },
    };
  },

  // Placeholders
  generateHints: async () => {
    throw new Error('Not implemented');
  },
  analyzePattern: async () => {
    throw new Error('Not implemented');
  },
  suggestNextChallenges: async () => {
    throw new Error('Not implemented');
  },
};

module.exports = aiService;
