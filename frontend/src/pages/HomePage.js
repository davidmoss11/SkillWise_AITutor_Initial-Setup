import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="home-page">
        <div className="home-container">
          <div className="hero-section">
            <div className="loading-message">
              <h2>Loading...</h2>
              <p>Please wait while we check your authentication status.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="home-page">
        <div className="home-container">
          <div className="hero-section">
            <div className="logo-section">
              <h1 className="logo">🎯 SkillWise</h1>
              <p className="tagline">Welcome back, {user.firstName}!</p>
            </div>
            
            <div className="user-info">
              <div className="user-card">
                <h3>Your Account</h3>
                <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
                <p><strong>Status:</strong> {user.isVerified ? '✅ Verified' : '⚠️ Not Verified'}</p>
              </div>
            </div>

            <div className="action-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                <span className="btn-icon">📊</span>
                View Dashboard
                <span className="btn-subtitle">See your progress</span>
              </Link>
              
              <button onClick={logout} className="btn btn-secondary">
                <span className="btn-icon">🚪</span>
                Sign Out
                <span className="btn-subtitle">End your session</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="hero-section">
          <div className="logo-section">
            <h1 className="logo">🎯 SkillWise</h1>
            <p className="tagline">Professional Skills Assessment Platform</p>
          </div>
          
          <div className="description">
            <p>
              Discover your potential, track your progress, and advance your career 
              with our comprehensive skills assessment platform.
            </p>
          </div>

          <div className="action-buttons">
            <Link to="/login" className="btn btn-primary">
              <span className="btn-icon">🔑</span>
              Sign In
              <span className="btn-subtitle">Access your account</span>
            </Link>
            
            <Link to="/register" className="btn btn-secondary">
              <span className="btn-icon">✨</span>
              Create Account
              <span className="btn-subtitle">Start your journey</span>
            </Link>
          </div>

          <div className="features-preview">
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Skill Assessments</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📈</span>
              <span>Progress Tracking</span>
            </div>
            <div className="feature">
              <span className="feature-icon">🎓</span>
              <span>Learning Paths</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;