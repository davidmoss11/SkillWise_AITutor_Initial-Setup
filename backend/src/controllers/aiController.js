const aiService = require('../services/aiService');
const { AppError } = require('../middleware/errorHandler');

const aiController = {
  // Sprint 3.2: Generate AI challenge
  generateChallenge: async (req, res, next) => {
    try {
      const { subject, difficulty } = req.query;
      const result = await aiService.generateChallenge({
        subject,
        difficulty,
        userId: req.user?.id,
      });
      res
        .status(200)
        .json({ challenge: result.challenge, metadata: result.metadata });
    } catch (err) {
      next(err);
    }
  },

  // Sprint 3.5: Submit for AI feedback
  submitForFeedback: async (req, res, next) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'content text required' });
      }
      const challengeContext = req.body.challengeContext || {};
      const result = await aiService.generateFeedback({
        submissionText: content,
        challengeContext,
        userId: req.user?.id,
      });
      res
        .status(200)
        .json({ feedback: result.feedback, metadata: result.metadata });
    } catch (err) {
      next(err);
    }
  },

  // Existing planned endpoints (still stubs)
  generateFeedback: async (req, res, next) => {
    next(new AppError('Not implemented', 501, 'NOT_IMPLEMENTED'));
  },
  getHints: async (req, res, next) => {
    next(new AppError('Not implemented', 501, 'NOT_IMPLEMENTED'));
  },
  suggestChallenges: async (req, res, next) => {
    next(new AppError('Not implemented', 501, 'NOT_IMPLEMENTED'));
  },
  analyzeProgress: async (req, res, next) => {
    next(new AppError('Not implemented', 501, 'NOT_IMPLEMENTED'));
  },
};

module.exports = aiController;
