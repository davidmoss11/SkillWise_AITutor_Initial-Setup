import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import ProgressBar from '../common/ProgressBar';
import './ProgressOverview.css';

const ProgressOverview = () => {
  const [progressData, setProgressData] = useState({
    goals: [],
    challenges: [],
    overall: {
      totalGoals: 0,
      completedGoals: 0,
      totalChallenges: 0,
      completedChallenges: 0,
      totalPoints: 0,
      earnedPoints: 0
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Fetch goals and challenges in parallel
      const [goalsResponse, challengesResponse] = await Promise.all([
        apiService.goals.getAll(),
        apiService.challenges.getAll()
      ]);

      const goals = goalsResponse.data.goals || [];
      const challenges = challengesResponse.data.challenges || [];

      // Calculate overall progress
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.is_completed).length;
      
      const totalChallenges = challenges.length;
      const completedChallenges = 0; // TODO: Track challenge completions
      
      const totalPoints = challenges.reduce((sum, c) => sum + (c.points_reward || 0), 0);
      const earnedPoints = 0; // TODO: Track earned points

      setProgressData({
        goals,
        challenges,
        overall: {
          totalGoals,
          completedGoals,
          totalChallenges,
          completedChallenges,
          totalPoints,
          earnedPoints
        }
      });
    } catch (err) {
      console.error('Error fetching progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setIsLoading(false);
    }
  };

  const getOverallCompletionPercentage = () => {
    const { completedGoals, totalGoals } = progressData.overall;
    return totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="progress-overview loading">
        <div className="spinner"></div>
        <p>Loading progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-overview error">
        <p>{error}</p>
      </div>
    );
  }

  const { overall, goals } = progressData;
  const overallPercentage = getOverallCompletionPercentage();

  return (
    <div className="progress-overview">
      <div className="progress-header">
        <h2>Your Learning Progress</h2>
        <div className="completion-badge">
          <span className="percentage">{overallPercentage}%</span>
          <span className="label">Complete</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="overall-progress-section">
        <ProgressBar
          current={overall.completedGoals}
          total={overall.totalGoals}
          label="Overall Goal Completion"
          height="large"
          animated={true}
        />
      </div>

      {/* Statistics Grid */}
      <div className="progress-stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{overall.completedGoals}/{overall.totalGoals}</div>
            <div className="stat-label">Goals Completed</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-value">{overall.totalChallenges}</div>
            <div className="stat-label">Challenges Available</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{overall.totalPoints}</div>
            <div className="stat-label">Total Points</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{goals.filter(g => !g.is_completed).length}</div>
            <div className="stat-label">Active Goals</div>
          </div>
        </div>
      </div>

      {/* Individual Goal Progress */}
      {goals.length > 0 && (
        <div className="goals-progress-section">
          <h3>Goal Progress Breakdown</h3>
          <div className="goals-progress-list">
            {goals.map(goal => (
              <div key={goal.id} className="goal-progress-item">
                <div className="goal-info">
                  <h4>{goal.title}</h4>
                  {goal.category && (
                    <span className="goal-category">{goal.category}</span>
                  )}
                </div>
                <ProgressBar
                  current={goal.progress_percentage || 0}
                  total={100}
                  label=""
                  showStats={false}
                  showPercentage={true}
                  height="medium"
                  color={goal.is_completed ? 'success' : 'info'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {goals.length === 0 && (
        <div className="empty-state">
          <p>No goals yet. Create your first goal to start tracking progress!</p>
        </div>
      )}
    </div>
  );
};

export default ProgressOverview;
