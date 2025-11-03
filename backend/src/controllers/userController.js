const User = require('../models/User');

const userController = {
  // Get user profile
  getProfile: async (req, res, next) => {
    try {
<<<<<<< Updated upstream
      const user = req.user;
      
      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          user: {
            id: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile'
=======
      // User is attached to req by auth middleware
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
>>>>>>> Stashed changes
      });
    }
  },

  // Update user profile
  updateProfile: async (req, res, next) => {
    try {
      const { firstName, lastName, bio, profileImage } = req.body;
      
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update user profile
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName.trim();
      if (lastName !== undefined) updateData.lastName = lastName.trim();
      if (bio !== undefined) updateData.bio = bio.trim();
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      await user.update(updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toJSON()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user statistics
  getStatistics: async (req, res, next) => {
    try {
      // TODO: Implement actual statistics calculation
      // For now, return mock data
      const stats = {
        goalsCompleted: 3,
        challengesCompleted: 12,
        currentStreak: 5,
        totalPoints: 250,
        learningHours: 24,
        rank: 42,
        achievements: [
          { id: 1, name: 'First Goal', description: 'Completed your first learning goal', earnedAt: new Date() },
          { id: 2, name: 'Streak Master', description: '5-day learning streak', earnedAt: new Date() }
        ]
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete user account
  deleteAccount: async (req, res, next) => {
    try {
      // TODO: Implement account deletion
      // For security, this should:
      // 1. Require password confirmation
      // 2. Soft delete (mark as inactive) rather than hard delete
      // 3. Clean up related data
      
      res.status(501).json({
        success: false,
        message: 'Account deletion not implemented yet'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = userController;