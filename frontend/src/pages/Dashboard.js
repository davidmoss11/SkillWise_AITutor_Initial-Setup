import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('http://localhost:3001/api/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        } else {
          setError('Failed to load dashboard data');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h2>Error Loading Dashboard</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Global Navigation Sidebar */}
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎯</span>
            <span className="logo-text">SkillWise</span>
          </div>
        </div>

        <div className="nav-menu">
          <div className="nav-section">
            <h4 className="nav-section-title">Main</h4>
            <ul className="nav-list">
              <li className="nav-item active">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Dashboard</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">📈</span>
                <span className="nav-text">Progress</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">🎯</span>
                <span className="nav-text">Assessments</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h4 className="nav-section-title">Learning</h4>
            <ul className="nav-list">
              <li className="nav-item">
                <span className="nav-icon">📚</span>
                <span className="nav-text">Courses</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">🏆</span>
                <span className="nav-text">Achievements</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">📝</span>
                <span className="nav-text">Practice</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h4 className="nav-section-title">Account</h4>
            <ul className="nav-list">
              <li className="nav-item">
                <span className="nav-icon">👤</span>
                <span className="nav-text">Profile</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Settings</span>
              </li>
              <li className="nav-item">
                <span className="nav-icon">❓</span>
                <span className="nav-text">Help</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.firstName} {user?.lastName}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={logout}>
            <span className="nav-icon">🚪</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="page-title">Dashboard</h1>
            <div className="header-actions">
              <button className="notification-btn">
                <span className="notification-icon">🔔</span>
                <span className="notification-badge">3</span>
              </button>
              <div className="search-box">
                <input type="text" placeholder="Search..." />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="dashboard-content">
          {/* Welcome Section */}
          <section className="welcome-section">
            <div className="welcome-card">
              <h2>Welcome back, {user?.firstName}! 👋</h2>
              <p>Ready to continue your learning journey? Let&apos;s see how you&apos;re progressing.</p>
              <button className="cta-button">Start Assessment</button>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Assessments</h3>
                  <div className="stat-number">{dashboardData?.stats.totalAssessments || 0}</div>
                  <div className="stat-change positive">+{dashboardData?.stats.weeklyGrowth || 0}% this week</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>Average Score</h3>
                  <div className="stat-number">{dashboardData?.stats.averageScore || 0}%</div>
                  <div className="stat-change positive">+{Math.floor((dashboardData?.stats.averageScore || 0) * 0.1)}% improved</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <h3>Skills Improved</h3>
                  <div className="stat-number">{dashboardData?.stats.skillsImproved || 0}</div>
                  <div className="stat-change neutral">{Math.ceil((dashboardData?.stats.skillsImproved || 0) / 2)} in progress</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                  <h3>Hours Spent</h3>
                  <div className="stat-number">{dashboardData?.stats.hoursSpent || 0}h</div>
                  <div className="stat-change positive">+{Math.floor((dashboardData?.stats.hoursSpent || 0) * 0.25)} this week</div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Activity & Progress */}
          <section className="content-grid">
            <div className="content-column">
              <div className="card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="card-content">
                  <div className="activity-list">
                    <div className="activity-item">
                      <div className="activity-icon">✅</div>
                      <div className="activity-details">
                        <div className="activity-title">Completed JavaScript Assessment</div>
                        <div className="activity-time">2 hours ago</div>
                      </div>
                      <div className="activity-score">92%</div>
                    </div>
                    
                    <div className="activity-item">
                      <div className="activity-icon">📚</div>
                      <div className="activity-details">
                        <div className="activity-title">Started React Course</div>
                        <div className="activity-time">Yesterday</div>
                      </div>
                      <div className="activity-progress">25%</div>
                    </div>
                    
                    <div className="activity-item">
                      <div className="activity-icon">🎯</div>
                      <div className="activity-details">
                        <div className="activity-title">Achieved SQL Mastery</div>
                        <div className="activity-time">3 days ago</div>
                      </div>
                      <div className="activity-badge">🏆</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-column">
              <div className="card">
                <div className="card-header">
                  <h3>Skill Progress</h3>
                  <button className="view-all-btn">View All</button>
                </div>
                <div className="card-content">
                  <div className="skill-list">
                    <div className="skill-item">
                      <div className="skill-info">
                        <div className="skill-name">JavaScript</div>
                        <div className="skill-level">Advanced</div>
                      </div>
                      <div className="skill-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '92%'}}></div>
                        </div>
                        <span className="progress-text">92%</span>
                      </div>
                    </div>
                    
                    <div className="skill-item">
                      <div className="skill-info">
                        <div className="skill-name">React</div>
                        <div className="skill-level">Intermediate</div>
                      </div>
                      <div className="skill-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '67%'}}></div>
                        </div>
                        <span className="progress-text">67%</span>
                      </div>
                    </div>
                    
                    <div className="skill-item">
                      <div className="skill-info">
                        <div className="skill-name">Node.js</div>
                        <div className="skill-level">Beginner</div>
                      </div>
                      <div className="skill-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: '34%'}}></div>
                        </div>
                        <span className="progress-text">34%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommendations */}
          <section className="recommendations-section">
            <div className="card">
              <div className="card-header">
                <h3>Recommended for You</h3>
              </div>
              <div className="card-content">
                <div className="recommendations-grid">
                  <div className="recommendation-card">
                    <div className="recommendation-icon">💻</div>
                    <h4>Advanced JavaScript Patterns</h4>
                    <p>Take your JavaScript skills to the next level with advanced patterns and techniques.</p>
                    <button className="recommendation-btn">Start Learning</button>
                  </div>
                  
                  <div className="recommendation-card">
                    <div className="recommendation-icon">🗄️</div>
                    <h4>Database Design Fundamentals</h4>
                    <p>Learn how to design efficient and scalable database schemas.</p>
                    <button className="recommendation-btn">Explore</button>
                  </div>
                  
                  <div className="recommendation-card">
                    <div className="recommendation-icon">🔧</div>
                    <h4>DevOps Essentials</h4>
                    <p>Master the tools and practices for modern software deployment.</p>
                    <button className="recommendation-btn">Get Started</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
