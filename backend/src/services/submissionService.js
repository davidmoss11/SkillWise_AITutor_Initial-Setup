// Submission service - business logic for challenge submissions
const db = require('../database/connection');
const Challenge = require('../models/Challenge');

const submissionService = {
  // Create a new submission
  createSubmission: async (challengeId, userId, submissionData) => {
    try {
      // Verify challenge exists
      const challenge = await Challenge.findById(challengeId);
      if (!challenge) {
        throw new Error('Challenge not found');
      }

      const { submission_text, submission_url, notes } = submissionData;

      const query = `
        INSERT INTO submissions (challenge_id, user_id, submission_text, submission_url, notes, status)
        VALUES ($1, $2, $3, $4, $5, 'pending')
        RETURNING id, challenge_id, user_id, submission_text, submission_url, notes, status, score, 
                  submitted_at, reviewed_at,
                  (SELECT goal_id FROM challenges WHERE id = $1) as goal_id
      `;

      const result = await db.query(query, [
        challengeId,
        userId,
        submission_text || null,
        submission_url || null,
        notes || null
      ]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create submission: ${error.message}`);
    }
  },

  // Get submission by ID with access control
  getSubmissionById: async (submissionId, userId) => {
    try {
      const query = `
        SELECT s.*, 
               (SELECT goal_id FROM challenges WHERE id = s.challenge_id) as goal_id
        FROM submissions s
        WHERE s.id = $1
      `;

      const result = await db.query(query, [submissionId]);

      if (result.rows.length === 0) {
        throw new Error('Submission not found');
      }

      const submission = result.rows[0];

      // Access control: user can only access their own submissions
      if (submission.user_id !== userId) {
        throw new Error('Access denied');
      }

      return submission;
    } catch (error) {
      throw error;
    }
  },

  // Get all submissions for a user
  getUserSubmissions: async (userId, filters = {}) => {
    try {
      let query = `
        SELECT s.*,
               c.title as challenge_title,
               (SELECT goal_id FROM challenges WHERE id = s.challenge_id) as goal_id
        FROM submissions s
        JOIN challenges c ON s.challenge_id = c.id
        WHERE s.user_id = $1
      `;

      const params = [userId];
      let paramCount = 1;

      if (filters.challengeId) {
        paramCount++;
        query += ` AND s.challenge_id = $${paramCount}`;
        params.push(filters.challengeId);
      }

      if (filters.status) {
        paramCount++;
        query += ` AND s.status = $${paramCount}`;
        params.push(filters.status);
      }

      query += ' ORDER BY s.submitted_at DESC';

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get user submissions: ${error.message}`);
    }
  },

  // Get all submissions for a specific challenge
  getChallengeSubmissions: async (challengeId, userId) => {
    try {
      const query = `
        SELECT s.*,
               (SELECT goal_id FROM challenges WHERE id = s.challenge_id) as goal_id
        FROM submissions s
        WHERE s.challenge_id = $1 AND s.user_id = $2
        ORDER BY s.submitted_at DESC
      `;

      const result = await db.query(query, [challengeId, userId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get challenge submissions: ${error.message}`);
    }
  },

  // Update submission (for grading/feedback)
  updateSubmission: async (submissionId, userId, updateData) => {
    try {
      // First verify access
      await submissionService.getSubmissionById(submissionId, userId);

      const { status, score, feedback, reviewer_notes } = updateData;

      const query = `
        UPDATE submissions
        SET 
          status = COALESCE($1, status),
          score = COALESCE($2, score),
          feedback = COALESCE($3, feedback),
          reviewer_notes = COALESCE($4, reviewer_notes),
          reviewed_at = CASE WHEN $1 IN ('completed', 'rejected') THEN NOW() ELSE reviewed_at END
        WHERE id = $5
        RETURNING *,
                  (SELECT goal_id FROM challenges WHERE id = challenge_id) as goal_id
      `;

      const result = await db.query(query, [
        status || null,
        score || null,
        feedback || null,
        reviewer_notes || null,
        submissionId
      ]);

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Auto-grade submission (simplified logic)
  gradeSubmission: async (submissionId) => {
    try {
      const submission = await submissionService.getSubmissionById(submissionId, submission.user_id);

      // Simplified auto-grading logic based on submission length
      let score = 0;
      if (submission.submission_text) {
        const textLength = submission.submission_text.length;
        if (textLength > 500) score = 90;
        else if (textLength > 200) score = 70;
        else score = 40;
      }

      return await submissionService.updateSubmission(
        submissionId,
        submission.user_id,
        { status: 'completed', score }
      );
    } catch (error) {
      throw new Error(`Failed to grade submission: ${error.message}`);
    }
  }
};

module.exports = submissionService;