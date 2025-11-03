import React, { useState, useEffect } from 'react';
import { ProgressDashboard, ProgressChart, ProgressBar } from '../components/common/ProgressComponents';
import goalService from '../services/goals';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    loadProgressData();
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await goalService.getGoals();
      setGoals(response.data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const loadProgressData = async () => {
    try {
      // Mock data for now - would come from progress API
      const mockProgressData = {
        overall: {
          totalPoints: 450,
          level: 5,
          experiencePoints: 1250,
          nextLevelXP: 1500,
          completedGoals: goals.filter(g => g.status === 'completed').length,
          completedChallenges: 15,
          currentStreak: 7,
          longestStreak: 12
        },
        recentActivity: [
          {
            id: 1,
            type: 'goal_progress',
            title: 'Updated learning goal progress',
            points: 25,
            timestamp: new Date().toISOString()
          },
          {
            id: 2,
            type: 'challenge_completed',
            title: 'Completed React component challenge',
            points: 50,
            timestamp: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      };
      
      setProgressData(mockProgressData);
    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevelProgress = () => {
    if (!progressData) return 0;
    const { experiencePoints, nextLevelXP } = progressData.overall;
    return (experiencePoints / nextLevelXP) * 100;
  };

  return (
    <div className="progress-page">
      <div className="page-header">
        <h1>Learning Progress</h1>
        <p>Track your learning journey and achievements</p>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading progress data...</p>
        </div>
      ) : (
        <div className="progress-content">
          {/* Overall Stats */}
          <div className="progress-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Level {progressData?.overall.level || 1}</h3>
                <ProgressBar 
                  progress={calculateLevelProgress()} 
                  height={10}
                  showLabel={false}
                />
                <p>{progressData?.overall.experiencePoints || 0} / {progressData?.overall.nextLevelXP || 1500} XP</p>
              </div>

              <div className="stat-card">
                <h3>{progressData?.overall.totalPoints || 0}</h3>
                <p>Total Points</p>
              </div>

              <div className="stat-card">
                <h3>{progressData?.overall.currentStreak || 0}</h3>
                <p>Day Streak</p>
              </div>

              <div className="stat-card">
                <h3>{progressData?.overall.completedChallenges || 0}</h3>
                <p>Challenges Completed</p>
              </div>
            </div>
          </div>

          {/* Goals Progress */}
          <div className="goals-progress-section">
            <h2>Goals Progress</h2>
            <ProgressDashboard goals={goals} />
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {progressData?.recentActivity?.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'goal_progress' ? '🎯' : '🏆'}
                  </div>
                  <div className="activity-content">
                    <h4>{activity.title}</h4>
                    <p>{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                  <div className="activity-points">
                    +{activity.points} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPage;