<<<<<<< Updated upstream
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  // Mock data for demonstration
  const stats = {
    totalGoals: 5,
    completedChallenges: 12,
    totalPoints: 450,
    currentStreak: 7
  };

  const recentActivities = [
    {
      id: 1,
      type: 'challenge_completed',
      title: 'JavaScript Fundamentals Quiz',
      date: '2024-10-21',
      points: 50
    },
    {
      id: 2,
      type: 'goal_created',
      title: 'Master React Components',
      date: '2024-10-20',
      points: 0
    },
    {
      id: 3,
      type: 'peer_review',
      title: 'Code Review Submitted',
      date: '2024-10-19',
      points: 25
    }
  ];

  const activeGoals = [
    {
      id: 1,
      title: 'Master React Components',
      progress: 60,
      dueDate: '2024-11-15'
    },
    {
      id: 2,
      title: 'Learn Node.js Basics',
      progress: 30,
      dueDate: '2024-12-01'
    },
    {
      id: 3,
      title: 'Complete JavaScript Course',
      progress: 85,
      dueDate: '2024-10-30'
    }
  ];

  return (
    <div className="dashboard-overview">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-info">
            <h3>{stats.totalGoals}</h3>
            <p>Active Goals</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.completedChallenges}</h3>
            <p>Completed Challenges</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>{stats.totalPoints}</h3>
            <p>Total Points</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>{stats.currentStreak}</h3>
            <p>Day Streak</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Active Goals Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Active Goals</h2>
            <Link to="/goals" className="section-link">
              View All
            </Link>
          </div>
          
          <div className="goals-list">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="goal-card">
                <div className="goal-info">
                  <h3>{goal.title}</h3>
                  <p>Due: {new Date(goal.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="goal-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{goal.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          {activeGoals.length === 0 && (
            <div className="empty-state">
              <p>No active goals yet.</p>
              <Link to="/goals" className="btn-primary">
                Create Your First Goal
              </Link>
            </div>
          )}
        </section>

        {/* Recent Activity Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <Link to="/progress" className="section-link">
              View All
            </Link>
          </div>
          
          <div className="activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'challenge_completed' && '✅'}
                  {activity.type === 'goal_created' && '🎯'}
                  {activity.type === 'peer_review' && '👥'}
                </div>
                <div className="activity-content">
                  <h4>{activity.title}</h4>
                  <p>{new Date(activity.date).toLocaleDateString()}</p>
                </div>
                {activity.points > 0 && (
                  <div className="activity-points">
                    +{activity.points} points
                  </div>
                )}
              </div>
            ))}
          </div>

          {recentActivities.length === 0 && (
            <div className="empty-state">
              <p>No recent activity.</p>
              <Link to="/challenges" className="btn-primary">
                Start a Challenge
              </Link>
            </div>
          )}
=======
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    goalsCompleted: 0,
    challengesCompleted: 0,
    currentStreak: 0,
    totalPoints: 0
  });
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Set personalized greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning! Ready to learn something amazing today?');
    } else if (hour < 17) {
      setGreeting('Good afternoon! Let\'s keep that momentum going!');
    } else {
      setGreeting('Good evening! Perfect time for some skill building!');
    }

    // TODO: Fetch real stats from API
    // For now, we'll use placeholder data
    setStats({
      goalsCompleted: 3,
      challengesCompleted: 12,
      currentStreak: 5,
      totalPoints: 250
    });
  }, []);

  const StatCard = ({ icon, title, value, subtitle, color = 'blue' }) => (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <p className="stat-number">{value}</p>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  const QuickAction = ({ icon, title, description, to, color = 'primary' }) => (
    <Link to={to} className={`quick-action quick-action-${color}`}>
      <div className="action-icon">{icon}</div>
      <div className="action-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <span className="action-arrow">→</span>
    </Link>
  );

  return (
    <div className="dashboard-overview">
      <div className="welcome-section">
        <h1>
          <span className="wave">👋</span> Welcome back to SkillWise!
        </h1>
        <p className="greeting">{greeting}</p>
      </div>
      
      <div className="stats-grid">
        <StatCard
          icon="🎯"
          title="Goals Completed"
          value={stats.goalsCompleted}
          subtitle="Keep going!"
          color="green"
        />
        
        <StatCard
          icon="💪"
          title="Challenges Solved"
          value={stats.challengesCompleted}
          subtitle="You're on fire!"
          color="blue"
        />
        
        <StatCard
          icon="🔥"
          title="Learning Streak"
          value={`${stats.currentStreak} days`}
          subtitle="Don't break it!"
          color="orange"
        />

        <StatCard
          icon="⭐"
          title="Total Points"
          value={stats.totalPoints}
          subtitle="Level up soon!"
          color="purple"
        />
      </div>

      <div className="dashboard-sections">
        <section className="quick-actions">
          <h2>🚀 Quick Actions</h2>
          <div className="actions-grid">
            <QuickAction
              icon="🎯"
              title="Set New Goal"
              description="Define what you want to learn next"
              to="/goals"
              color="primary"
            />
            
            <QuickAction
              icon="💻"
              title="Take Challenge"
              description="Practice with coding challenges"
              to="/challenges"
              color="secondary"
            />
            
            <QuickAction
              icon="📊"
              title="View Progress"
              description="See how far you've come"
              to="/progress"
              color="success"
            />
            
            <QuickAction
              icon="🏆"
              title="Leaderboard"
              description="See how you rank"
              to="/leaderboard"
              color="warning"
            />
          </div>
        </section>

        <section className="motivation-section">
          <div className="motivation-card">
            <h3>💪 You're doing great!</h3>
            <p>
              "The expert in anything was once a beginner. Every pro was once an amateur. 
              Every icon was once an unknown." Keep pushing forward! 🌟
            </p>
            <div className="motivation-stats">
              <span>🎉 You've completed {stats.challengesCompleted} challenges this month!</span>
            </div>
          </div>
>>>>>>> Stashed changes
        </section>
      </div>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/goals/new" className="action-btn">
            <span className="action-icon">🎯</span>
            <span className="action-text">Create Goal</span>
          </Link>
          
          <Link to="/challenges" className="action-btn">
            <span className="action-icon">🚀</span>
            <span className="action-text">Browse Challenges</span>
          </Link>
          
          <Link to="/peer-review" className="action-btn">
            <span className="action-icon">👥</span>
            <span className="action-text">Peer Review</span>
          </Link>
          
          <Link to="/profile" className="action-btn">
            <span className="action-icon">👤</span>
            <span className="action-text">Update Profile</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default DashboardOverview;