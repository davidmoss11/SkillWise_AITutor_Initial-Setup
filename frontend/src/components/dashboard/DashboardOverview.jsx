import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';
import GoalCard from '../goals/GoalCard';
import ProgressBar from '../common/ProgressBar';
import './DashboardOverview.css';

const DashboardOverview = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    activeGoals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.goals.getAll();
      const goalsData = response.data.goals || [];
      
      setGoals(goalsData.slice(0, 3)); // Show only first 3 goals on dashboard
      
      // Calculate stats
      const completed = goalsData.filter(g => g.is_completed).length;
      const active = goalsData.filter(g => !g.is_completed).length;
      
      setStats({
        totalGoals: goalsData.length,
        completedGoals: completed,
        activeGoals: active
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      await apiService.goals.delete(goalId);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="dashboard-overview">
      {/* Overall Progress Section */}
      <div className="overall-progress-section">
        <h2>Overall Progress</h2>
        <ProgressBar
          current={stats.completedGoals}
          total={stats.totalGoals}
          label="Goal Completion"
          height="large"
          animated={true}
        />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Total Goals</h3>
            <p className="stat-number">{stats.totalGoals}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{stats.completedGoals}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>Active Goals</h3>
            <p className="stat-number">{stats.activeGoals}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="section">
          <div className="section-header">
            <h2>Recent Goals</h2>
            <Link to="/goals" className="view-all-link">
              View All →
            </Link>
          </div>
          
          {isLoading ? (
            <div className="loading-state">
              <p>Loading goals...</p>
            </div>
          ) : goals.length > 0 ? (
            <div className="goals-preview">
              {goals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal}
                  onDelete={handleDeleteGoal}
                  onUpdate={fetchDashboardData}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <p>No goals yet. <Link to="/goals">Create your first goal!</Link></p>
            </div>
          )}
        </div>

        <div className="section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/goals" className="action-card">
              <span className="action-icon">🎯</span>
              <h3>Create Goal</h3>
              <p>Set a new learning objective</p>
            </Link>
            
            <Link to="/challenges" className="action-card">
              <span className="action-icon">🚀</span>
              <h3>Take Challenge</h3>
              <p>Test your skills</p>
            </Link>
            
            <Link to="/progress" className="action-card">
              <span className="action-icon">📈</span>
              <h3>View Progress</h3>
              <p>Track your growth</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;