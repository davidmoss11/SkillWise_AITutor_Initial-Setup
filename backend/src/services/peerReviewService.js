// Peer review business logic implementation
const db = require('../database/connection');

const peerReviewService = {
  // Create or complete a peer review
  createReview: async (reviewData) => {
    const {
      reviewer_id,
      reviewee_id,
      submission_id,
      review_text = null,
      rating = null,
      criteria_scores = null,
      time_spent_minutes = null,
      is_anonymous = true,
      is_completed = true,
    } = reviewData;

    const queryText = `
      INSERT INTO peer_reviews
        (reviewer_id, reviewee_id, submission_id, review_text, rating, criteria_scores, time_spent_minutes, is_anonymous, is_completed, completed_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
      RETURNING *
    `;

    const params = [
      reviewer_id,
      reviewee_id,
      submission_id,
      review_text,
      rating,
      criteria_scores ? JSON.stringify(criteria_scores) : null,
      time_spent_minutes,
      is_anonymous,
      is_completed,
    ];

    const result = await db.query(queryText, params);
    return result.rows[0];
  },

  // Get all reviews for a specific submission
  getReviewsForSubmission: async (submissionId) => {
    const queryText = `
      SELECT pr.*, u.username as reviewer_username, ru.username as reviewee_username
      FROM peer_reviews pr
      LEFT JOIN users u ON pr.reviewer_id = u.id
      LEFT JOIN users ru ON pr.reviewee_id = ru.id
      WHERE pr.submission_id = $1
      ORDER BY pr.created_at DESC
    `;
    const result = await db.query(queryText, [submissionId]);
    return result.rows;
  },

  // Get all reviews received by a user (reviews of their submissions)
  getReceivedReviews: async (userId) => {
    const queryText = `
      SELECT pr.*, s.submission_text, u.username as reviewer_username
      FROM peer_reviews pr
      LEFT JOIN submissions s ON pr.submission_id = s.id
      LEFT JOIN users u ON pr.reviewer_id = u.id
      WHERE pr.reviewee_id = $1
      ORDER BY pr.created_at DESC
    `;
    const result = await db.query(queryText, [userId]);
    return result.rows;
  },

  // Get reviews written by a reviewer
  getReviewsByReviewer: async (reviewerId) => {
    const queryText = `
      SELECT pr.*, s.submission_text, ru.username as reviewee_username
      FROM peer_reviews pr
      LEFT JOIN submissions s ON pr.submission_id = s.id
      LEFT JOIN users ru ON pr.reviewee_id = ru.id
      WHERE pr.reviewer_id = $1
      ORDER BY pr.created_at DESC
    `;
    const result = await db.query(queryText, [reviewerId]);
    return result.rows;
  },

  // Update an existing review
  updateReview: async (reviewId, updateData) => {
    const fields = [];
    const values = [];
    let idx = 1;

    for (const [key, val] of Object.entries(updateData)) {
      fields.push(`${key} = $${idx}`);
      values.push(key === 'criteria_scores' ? JSON.stringify(val) : val);
      idx += 1;
    }

    if (fields.length === 0) return null;

    const queryText = `UPDATE peer_reviews SET ${fields.join(
      ', '
    )}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    values.push(reviewId);

    const result = await db.query(queryText, values);
    return result.rows[0];
  },

  // Delete a review by id
  deleteReview: async (reviewId) => {
    const queryText = 'DELETE FROM peer_reviews WHERE id = $1 RETURNING *';
    const result = await db.query(queryText, [reviewId]);
    return result.rows[0];
  },

  // Get pending (not completed) reviews assigned to a reviewer
  getPendingReviews: async (userId) => {
    const queryText = `
      SELECT pr.*, s.submission_text, ru.username as reviewee_username
      FROM peer_reviews pr
      LEFT JOIN submissions s ON pr.submission_id = s.id
      LEFT JOIN users ru ON pr.reviewee_id = ru.id
      WHERE pr.reviewer_id = $1 AND pr.is_completed = false
      ORDER BY pr.created_at ASC
    `;
    const result = await db.query(queryText, [userId]);
    return result.rows;
  },

  // Submit rating (shorthand update for rating field)
  submitRating: async (reviewId, rating) => {
    const queryText =
      'UPDATE peer_reviews SET rating = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await db.query(queryText, [rating, reviewId]);
    return result.rows[0];
  },
};

module.exports = peerReviewService;
