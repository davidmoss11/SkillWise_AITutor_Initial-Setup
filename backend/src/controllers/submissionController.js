// Work submission controller - handles challenge submissions// TODO: Implement work submission controller

const submissionService = require('../services/submissionService');const submissionService = require('../services/submissionService');

const Goal = require('../models/Goal');

const submissionController = {

const submissionController = {  // TODO: Submit work for challenge

  // Submit work for a challenge  submitWork: async (req, res, next) => {

  submitWork: async (req, res, next) => {    // Implementation needed

    try {  },

      const userId = req.user.id;

      const { challengeId } = req.params;  // TODO: Get submission by ID

      const submissionData = req.body;  getSubmission: async (req, res, next) => {

    // Implementation needed

      const submission = await submissionService.createSubmission(  },

        parseInt(challengeId),

        userId,  // TODO: Get user submissions

        submissionData  getUserSubmissions: async (req, res, next) => {

      );    // Implementation needed

  },

      res.status(201).json({

        success: true,  // TODO: Update submission

        data: submission,  updateSubmission: async (req, res, next) => {

        message: 'Submission created successfully'    // Implementation needed

      });  }

    } catch (error) {};

      if (error.message.includes('Challenge not found')) {

        return res.status(404).json({module.exports = submissionController;
          success: false,
          message: 'Challenge not found'
        });
      }
      next(error);
    }
  },

  // Get submission by ID
  getSubmission: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const submission = await submissionService.getSubmissionById(parseInt(id), userId);

      res.status(200).json({
        success: true,
        data: submission,
        message: 'Submission retrieved successfully'
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

  // Get all user submissions
  getUserSubmissions: async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { challengeId, status } = req.query;

      const submissions = await submissionService.getUserSubmissions(userId, {
        challengeId: challengeId ? parseInt(challengeId) : null,
        status
      });

      res.status(200).json({
        success: true,
        data: submissions,
        message: 'Submissions retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Update submission status (mark as completed, etc.)
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

      // If submission is marked as completed, update goal progress
      if (updateData.status === 'completed' && updatedSubmission.goal_id) {
        try {
          await Goal.updateProgressFromChallenges(updatedSubmission.goal_id);
        } catch (progressError) {
          console.error('Error updating goal progress:', progressError);
          // Don't fail the submission update if progress update fails
        }
      }

      res.status(200).json({
        success: true,
        data: updatedSubmission,
        message: 'Submission updated successfully'
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

  // Get submissions for a specific challenge
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
        data: submissions,
        message: 'Challenge submissions retrieved successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = submissionController;
