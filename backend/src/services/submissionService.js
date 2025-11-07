// Submission business logic// TODO: Implement submission business logic

const db = require('../database/connection');const submissionService = {

const Challenge = require('../models/Challenge');  // TODO: Submit challenge solution

  submitSolution: async (submissionData) => {

const submissionService = {    // Implementation needed

  // Create a new submission for a challenge    throw new Error('Not implemented');

  createSubmission: async (challengeId, userId, submissionData) => {  },

    try {

      const challenge = await Challenge.findById(challengeId);  // TODO: Get submission by ID

      if (!challenge) {  getSubmissionById: async (submissionId) => {

        throw new Error('Challenge not found');    // Implementation needed

      }    throw new Error('Not implemented');

  },

      const { submission_text, submission_url } = submissionData;

  // TODO: Get user submissions

      const query = `  getUserSubmissions: async (userId) => {

        INSERT INTO submissions (    // Implementation needed

          challenge_id,    throw new Error('Not implemented');

          user_id,  },

          submission_text,

          submission_url,  // TODO: Get challenge submissions

          status,  getChallengeSubmissions: async (challengeId) => {

          submitted_at,    // Implementation needed

          created_at,    throw new Error('Not implemented');

          updated_at  },

        )

        VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW())  // TODO: Grade submission

        RETURNING *,   gradeSubmission: async (submissionId) => {

          (SELECT goal_id FROM challenges WHERE id = $1) as goal_id    // Implementation needed

      `;    throw new Error('Not implemented');

  },

      const result = await db.query(query, [

        challengeId,  // TODO: Update submission status

        userId,  updateSubmissionStatus: async (submissionId, status) => {

        submission_text,    // Implementation needed

        submission_url,    throw new Error('Not implemented');

        'submitted'  }

      ]);};



      return result.rows[0];module.exports = submissionService;
    } catch (error) {
      throw new Error(`Failed to create submission: ${error.message}`);
    }
  },

  // Get submission by ID
  getSubmissionById: async (submissionId, userId) => {
    try {
      const query = `
        SELECT s.*, c.title as challenge_title, c.goal_id
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.id = $1
      `;
      const result = await db.query(query, [submissionId]);

      if (result.rows.length === 0) {
        throw new Error('Submission not found');
      }

      const submission = result.rows[0];

      // Check if user has access to this submission
      if (submission.user_id !== userId) {
        throw new Error('Access denied');
      }

      return submission;
    } catch (error) {
      throw new Error(`Failed to get submission: ${error.message}`);
    }
  },

  // Get all submissions for a user
  getUserSubmissions: async (userId, filters = {}) => {
    try {
      let query = `
        SELECT s.*, c.title as challenge_title, c.goal_id
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1
      `;
      const params = [userId];
      let paramCount = 2;

      if (filters.challengeId) {
        query += ` AND s.challenge_id = $${paramCount}`;
        params.push(filters.challengeId);
        paramCount++;
      }

      if (filters.status) {
        query += ` AND s.status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }

      query += ' ORDER BY s.submitted_at DESC';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get user submissions: ${error.message}`);
    }
  },

  // Get submissions for a specific challenge
  getChallengeSubmissions: async (challengeId, userId) => {
    try {
      const query = `
        SELECT s.*, c.goal_id
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.challenge_id = $1 AND s.user_id = $2
        ORDER BY s.submitted_at DESC
      `;

      const result = await db.query(query, [challengeId, userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get challenge submissions: ${error.message}`);
    }
  },

  // Update submission (status, feedback, score, etc.)
  updateSubmission: async (submissionId, userId, updateData) => {
    try {
      // First verify the submission exists and user has access
      await submissionService.getSubmissionById(submissionId, userId);

      const { status, score, feedback } = updateData;

      const query = `
        UPDATE submissions
        SET status = COALESCE($2, status),
            score = COALESCE($3, score),
            feedback = COALESCE($4, feedback),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *,
          (SELECT goal_id FROM challenges WHERE id = challenge_id) as goal_id
      `;

      const result = await db.query(query, [
        submissionId,
        status,
        score,
        feedback
      ]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update submission: ${error.message}`);
    }
  },

  // Grade a submission (simplified auto-grading)
  gradeSubmission: async (submissionId) => {
    try {
      // This is a simplified grading - in real app would use AI or test cases
      const submission = await submissionService.getSubmissionById(submissionId);

      // Simple grading logic based on submission length
      const textLength = submission.submission_text?.length || 0;
      let score = 0;
      let feedback = '';

      if (textLength < 50) {
        score = 40;
        feedback = 'Submission is too brief. Please provide more detail.';
      } else if (textLength < 200) {
        score = 70;
        feedback = 'Good effort! Consider adding more explanation.';
      } else {
        score = 90;
        feedback = 'Excellent work! Well detailed submission.';
      }

      const query = `
        UPDATE submissions
        SET score = $2,
            feedback = $3,
            status = 'graded',
            graded_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;

      const result = await db.query(query, [submissionId, score, feedback]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to grade submission: ${error.message}`);
    }
  }
};

module.exports = submissionService;
