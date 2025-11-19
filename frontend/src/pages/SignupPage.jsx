import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SignupPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (formData) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await register(formData);

      if (response.success) {
        // Registration successful, navigate to dashboard
        navigate('/dashboard');
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <LoadingSpinner message="Creating your account..." />
      </div>
    );
  }

  return (
    <div className="auth-page signup-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <h1>🎓 SkillWise</h1>
            </Link>
            <h2>Create Your Account</h2>
            <p>Start your learning journey today!</p>
          </div>

          <SignupForm
            onSubmit={handleSignup}
            error={error}
            isLoading={isLoading}
          />

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="features-container">
            <h3>Why join SkillWise?</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <h4>Personalized Learning</h4>
                <p>AI-powered paths tailored to your goals</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <h4>Intelligent Feedback</h4>
                <p>Get instant, detailed code reviews</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <h4>Track Progress</h4>
                <p>Visual insights into your growth</p>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <h4>Learn Together</h4>
                <p>Connect with a community of learners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;