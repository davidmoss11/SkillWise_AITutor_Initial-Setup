// Goal business logic and calculations
const Goal = require('../models/Goal');
const { z } = require('zod');

// Validation schemas
const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().optional(),
  target_date: z.string().datetime().optional(),
  type: z.enum(['skill', 'project', 'time', 'habit']).default('skill')
});

const updateGoalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  target_date: z.string().datetime().optional(),
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(['active', 'completed', 'paused', 'cancelled']).optional()
});

const goalService = {
  // Get user goals with progress
  getUserGoals: async (userId) => {
    try {
      const goals = await Goal.findByUserId(userId);
      return goals;
    } catch (error) {
      throw new Error(`Failed to get user goals: ${error.message}`);
    }
  },

  // Get single goal by ID
  getGoalById: async (goalId, userId) => {
    try {
      const goal = await Goal.findById(goalId);
      if (!goal) {
        throw new Error('Goal not found');
      }
      // Check if goal belongs to user
      if (goal.user_id !== userId) {
        throw new Error('Access denied');
      }
      return goal;
    } catch (error) {
      throw new Error(`Failed to get goal: ${error.message}`);
    }
  },

  // Create new goal with validation
  createGoal: async (goalData, userId) => {
    try {
      // Validate input
      const validatedData = createGoalSchema.parse(goalData);
      
      // Add user_id to goal data
      const goalWithUser = { ...validatedData, user_id: userId };
      
      const newGoal = await Goal.create(goalWithUser);
      return newGoal;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to create goal: ${error.message}`);
    }
  },

  // Update existing goal
  updateGoal: async (goalId, updateData, userId) => {
    try {
      // Check if goal exists and belongs to user
      const existingGoal = await goalService.getGoalById(goalId, userId);
      
      // Validate update data
      const validatedData = updateGoalSchema.parse(updateData);
      
      const updatedGoal = await Goal.update(goalId, validatedData);
      return updatedGoal;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error(`Failed to update goal: ${error.message}`);
    }
  },

  // Delete goal
  deleteGoal: async (goalId, userId) => {
    try {
      // Check if goal exists and belongs to user
      await goalService.getGoalById(goalId, userId);
      
      const deletedGoal = await Goal.delete(goalId);
      return deletedGoal;
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  },

  // Update goal progress
  updateProgress: async (goalId, progress, userId) => {
    try {
      // Validate progress value
      const progressValue = z.number().min(0).max(100).parse(progress);
      
      // Determine status based on progress
      let status = 'active';
      if (progressValue >= 100) {
        status = 'completed';
      }
      
      const updatedGoal = await goalService.updateGoal(goalId, { progress: progressValue, status }, userId);
      return updatedGoal;
    } catch (error) {
      throw new Error(`Failed to update progress: ${error.message}`);
    }
  },

  // Calculate goal completion percentage
  calculateCompletion: (goal) => {
    if (!goal) return 0;
    return goal.progress || 0;
  },

  // Calculate goal progress details
  calculateProgress: async (goalId, userId) => {
    try {
      const goal = await goalService.getGoalById(goalId, userId);
      
      return {
        progress: goal.progress || 0,
        status: goal.status || 'active',
        target_date: goal.target_date,
        is_overdue: goal.target_date && new Date(goal.target_date) < new Date()
      };
    } catch (error) {
      throw new Error(`Failed to calculate progress: ${error.message}`);
    }
  }
};

module.exports = goalService;