// Goals CRUD operations controller
const goalService = require('../services/goalService');

const goalController = {
  // Get all goals for user
  getGoals: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goals = await goalService.getUserGoals(userId);
      
      res.status(200).json({
        success: true,
        data: goals,
        message: 'Goals retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single goal by ID
  getGoalById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const goal = await goalService.getGoalById(parseInt(id), userId);
      
      res.status(200).json({
        success: true,
        data: goal,
        message: 'Goal retrieved successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      next(error);
    }
  },

  // Create new goal
  createGoal: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const goalData = req.body;
      
      const newGoal = await goalService.createGoal(goalData, userId);
      
      res.status(201).json({
        success: true,
        data: newGoal,
        message: 'Goal created successfully'
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

  // Update existing goal
  updateGoal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;
      
      const updatedGoal = await goalService.updateGoal(parseInt(id), updateData, userId);
      
      res.status(200).json({
        success: true,
        data: updatedGoal,
        message: 'Goal updated successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  },

  // Delete goal
  deleteGoal: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      await goalService.deleteGoal(parseInt(id), userId);
      
      res.status(200).json({
        success: true,
        message: 'Goal deleted successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      next(error);
    }
  },

  // Update goal progress
  updateProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      const userId = req.user.id;
      
      const updatedGoal = await goalService.updateProgress(parseInt(id), progress, userId);
      
      res.status(200).json({
        success: true,
        data: updatedGoal,
        message: 'Goal progress updated successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      if (error.message.includes('Validation error')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  },

  // Get goal progress details
  getProgress: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const progress = await goalService.calculateProgress(parseInt(id), userId);
      
      res.status(200).json({
        success: true,
        data: progress,
        message: 'Goal progress retrieved successfully'
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }
      if (error.message.includes('Access denied')) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
      next(error);
    }
  }
};

module.exports = goalController;