// Challenges CRUD operations controller
const challengeService = require('../services/challengeService');

const challengeController = {
  // Get all challenges with optional filtering
  getChallenges: async (req, res, next) => {
    try {
      const filters = {
        difficulty: req.query.difficulty,
        category: req.query.category,
        search: req.query.search
      };

      const challenges = await challengeService.getChallenges(filters);
      
      res.status(200).json({
        success: true,
        data: challenges,
        message: 'Challenges retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get challenge by ID
  getChallengeById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const challenge = await challengeService.getChallengeById(parseInt(id));
      
      res.status(200).json({
        success: true,
        data: challenge,
        message: 'Challenge retrieved successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }
      next(error);
    }
  },

  // Create new challenge (admin only)
  createChallenge: async (req, res, next) => {
    try {
      const challengeData = req.body;
      const newChallenge = await challengeService.createChallenge(challengeData);
      
      res.status(201).json({
        success: true,
        data: newChallenge,
        message: 'Challenge created successfully'
      });
    } catch (error) {
      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  },

  // Update challenge
  updateChallenge: async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updatedChallenge = await challengeService.updateChallenge(parseInt(id), updateData);
      
      res.status(200).json({
        success: true,
        data: updatedChallenge,
        message: 'Challenge updated successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }
      next(error);
    }
  },

  // Delete challenge
  deleteChallenge: async (req, res, next) => {
    try {
      const { id } = req.params;
      await challengeService.deleteChallenge(parseInt(id));
      
      res.status(200).json({
        success: true,
        message: 'Challenge deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Challenge not found'
        });
      }
      next(error);
    }
  },

  // Get challenge categories
  getCategories: async (req, res, next) => {
    try {
      const categories = await challengeService.getCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
        message: 'Categories retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Start a challenge (create submission)
  startChallenge: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // For now, just return success - full submission logic would be in submissionController
      res.status(200).json({
        success: true,
        message: 'Challenge started successfully',
        data: { challengeId: parseInt(id), userId }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = challengeController;