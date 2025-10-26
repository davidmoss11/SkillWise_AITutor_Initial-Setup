const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Get user dashboard data
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For now, return mock data that would be specific to the user
    // In a real app, this would query the database for user-specific data
    const dashboardData = {
      user: {
        id: userId,
        firstName: req.user.first_name,
        lastName: req.user.last_name,
        email: req.user.email,
        joinDate: req.user.created_at
      },
      stats: {
        totalAssessments: Math.floor(Math.random() * 20) + 5, // 5-25 assessments
        averageScore: Math.floor(Math.random() * 30) + 70, // 70-100% average
        skillsImproved: Math.floor(Math.random() * 5) + 1, // 1-6 skills
        hoursSpent: Math.floor(Math.random() * 40) + 10, // 10-50 hours
        weeklyGrowth: Math.floor(Math.random() * 10) + 1 // 1-11% growth
      },
      recentActivity: [
        {
          id: 1,
          type: 'assessment',
          title: 'JavaScript Fundamentals',
          score: Math.floor(Math.random() * 30) + 70,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 2,
          type: 'assessment',
          title: 'React Components',
          score: Math.floor(Math.random() * 30) + 70,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed'
        },
        {
          id: 3,
          type: 'skill',
          title: 'CSS Grid Layout',
          progress: Math.floor(Math.random() * 40) + 60,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'in-progress'
        }
      ],
      recommendations: [
        {
          id: 1,
          type: 'skill',
          title: 'Advanced JavaScript Patterns',
          description: 'Build on your JavaScript fundamentals with advanced concepts',
          difficulty: 'intermediate',
          estimatedTime: '2-3 hours'
        },
        {
          id: 2,
          type: 'assessment',
          title: 'Node.js Backend Development',
          description: 'Test your server-side development skills',
          difficulty: 'advanced',
          estimatedTime: '45 minutes'
        }
      ],
      achievements: [
        {
          id: 1,
          title: 'First Assessment',
          description: 'Completed your first skill assessment',
          earnedDate: req.user.created_at,
          badge: '🏆'
        },
        {
          id: 2,
          title: 'Quick Learner',
          description: 'Achieved 80%+ on 3 consecutive assessments',
          earnedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          badge: '⚡'
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get user progress over time
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    // Mock progress data over the last 30 days
    const progressData = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      progressData.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 30) + 60 + (i * 0.5), // Gradual improvement
        assessments: Math.floor(Math.random() * 3),
        hoursStudied: Math.random() * 4
      });
    }

    res.json({ progress: progressData });
  } catch (error) {
    console.error('Dashboard progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

module.exports = router;