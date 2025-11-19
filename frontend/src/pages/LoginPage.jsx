// TODO: Implement login page with form handling
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoginForm from '../components/auth/LoginForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login
  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (formData) => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('🔐 Attempting login...');
      const result = await login({
        email: formData.email,
        password: formData.password
      });
      
      if (result.success) {
        console.log('✅ Login successful! Redirecting to:', from);
        navigate(from, { replace: true });
      } else {
        console.error('❌ Login failed:', result.error);
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="brand-icon">🎓</span>
              <h1>SkillWise</h1>
            </Link>
            <h2>
              <span className="welcome-emoji">👋</span>
              Welcome Back!
            </h2>
            <p>Ready to continue your learning adventure? Let's pick up where you left off! 🚀</p>
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {isLoading ? (
            <LoadingSpinner message="Signing you in..." />
          ) : (
            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          )}

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up here
              </Link>
            </p>
            
            <p>
              <Link to="/forgot-password" className="auth-link">
                Forgot your password?
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="auth-features">
            <div className="welcome-back">
              <h3>🌟 Welcome back, learner!</h3>
              <p>We're excited to continue your learning journey together!</p>
            </div>
            
            <div className="daily-motivation">
              <h4>💡 Today's Learning Tip</h4>
              <blockquote>
                "The best time to plant a tree was 20 years ago. The second best time is now. 
                The same goes for learning new skills!"
              </blockquote>
            </div>
            
            <div className="login-stats">
              <h4>🚀 Your Community is Growing</h4>
              <div className="stats-mini">
                <div className="stat-mini">
                  <span className="stat-icon">👥</span>
                  <span>10,247 active learners today</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-icon">💻</span>
                  <span>1,573 challenges completed today</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-icon">🎯</span>
                  <span>892 goals achieved this week</span>
                </div>
              </div>
            </div>
            
            <div className="quick-access">
              <h4>⚡ Quick Access</h4>
              <p>Remember, after logging in you can:</p>
              <ul>
                <li>📊 Check your progress dashboard</li>
                <li>🎯 Continue working on your goals</li>
                <li>💻 Try new coding challenges</li>
                <li>👥 Connect with peer learners</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;