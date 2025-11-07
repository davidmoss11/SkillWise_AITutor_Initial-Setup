// Work submission controller - handles challenge submissions
const submissionService = require('../services/submissionService');
const Goal = require('../models/Goal');

const submissionController = {
  // Submit work for challenge
  submitWork: async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const userId = req.user.id;
      const submissionData = req.body;

      const submission = await submissionService.createSubmission(
        parseInt(challengeId),
        userId,
        submissionData
      );

      res.status(201).json({
        success: true,
        message: 'Submission created successfully',
        data: submission
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      next(error);
    }
  },

  // Get specific submission
  getSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const submission = await submissionService.getSubmissionById(parseInt(id), userId);

      res.status(200).json({
        success: true,
        data: submission
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
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

  // Get all submissions for current user
  getUserSubmissions: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { challengeId, status } = req.query;

      const filters = {};
      if (challengeId) filters.challengeId = parseInt(challengeId);
      if (status) filters.status = status;

      const submissions = await submissionService.getUserSubmissions(userId, filters);

      res.status(200).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  },

  // Update submission (for grading/feedback)
  updateSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const updatedSubmission = await submissionService.updateSubmission(
        parseInt(id),
        userId,
        updateData
      );

      // If submission is marked as completed, automatically update goal progress
      if (updateData.status === 'completed' && updatedSubmission.goal_id) {
        await Goal.updateProgressFromChallenges(updatedSubmission.goal_id);
      }

      res.status(200).json({
        success: true,
        message: 'Submission updated successfully',
        data: updatedSubmission
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
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

  // Get all submissions for a specific challenge
  getChallengeSubmissions: async (req, res, next) => {
    try {
      const { challengeId } = req.params;
      const userId = req.user.id;

      const submissions = await submissionService.getChallengeSubmissions(
        parseInt(challengeId),
        userId
      );

      res.status(200).json({
        success: true,
        data: submissions
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = submissionController;