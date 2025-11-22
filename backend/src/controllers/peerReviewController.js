// Peer review system controller
const peerReviewService = require('../services/peerReviewService');

const peerReviewController = {
  // Get pending review assignments for the authenticated user
  getReviewAssignments: async (req, res, next) => {
    try {
      const userId = req.user && req.user.id;
      const assignments = await peerReviewService.getPendingReviews(userId);
      return res.status(200).json({ assignments });
    } catch (err) {
      return next(err);
    }
  },

  // Submit a peer review (complete assignment)
  submitReview: async (req, res, next) => {
    try {
      const reviewer_id = req.user && req.user.id;
      const {
        reviewee_id,
        submission_id,
        review_text,
        rating,
        criteria_scores,
        time_spent_minutes,
        is_anonymous,
      } = req.body;

      if (!submission_id || !reviewee_id) {
        return res
          .status(400)
          .json({ message: 'submission_id and reviewee_id are required' });
      }

      const created = await peerReviewService.createReview({
        reviewer_id,
        reviewee_id,
        submission_id,
        review_text,
        rating,
        criteria_scores,
        time_spent_minutes,
        is_anonymous,
        is_completed: true,
      });

      return res.status(201).json({ review: created });
    } catch (err) {
      return next(err);
    }
  },

  // Get reviews received by the authenticated user
  getReceivedReviews: async (req, res, next) => {
    try {
      const userId = req.user && req.user.id;
      const reviews = await peerReviewService.getReceivedReviews(userId);
      return res.status(200).json({ reviews });
    } catch (err) {
      return next(err);
    }
  },

  // Get review history for authenticated user (reviews they wrote)
  getReviewHistory: async (req, res, next) => {
    try {
      const userId = req.user && req.user.id;
      const history = await peerReviewService.getReviewsByReviewer(userId);
      return res.status(200).json({ history });
    } catch (err) {
      return next(err);
    }
  },
};

module.exports = peerReviewController;
