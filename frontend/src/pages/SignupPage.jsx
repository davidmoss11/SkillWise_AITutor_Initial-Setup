import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SignupForm from '../components/auth/SignupForm';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SignupPage = () => {
<<<<<<< Updated upstream
  const [error, setError] = useState('');
=======
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
>>>>>>> Stashed changes
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { register } = useAuth();
  const navigate = useNavigate();

<<<<<<< Updated upstream
  const handleSignup = async (formData) => {
=======
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    if (step === 2) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(1)) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(2)) {
      return;
    }

>>>>>>> Stashed changes
    try {
      setIsLoading(true);
      
      const result = await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const levels = [
      { text: 'Very Weak', color: 'red' },
      { text: 'Weak', color: 'orange' },
      { text: 'Fair', color: 'yellow' },
      { text: 'Good', color: 'lightgreen' },
      { text: 'Strong', color: 'green' }
    ];
    
    return { strength, ...levels[strength] };
  };

  if (isLoading) {
    return (
      <div className="signup-page">
        <div className="auth-container">
          <LoadingSpinner 
            message="🎉 Creating your SkillWise account..." 
            showProgress={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/" className="auth-logo">
              <span className="brand-icon">🎓</span>
              <h1>SkillWise</h1>
            </Link>
            <h2>
              {currentStep === 1 ? (
                <>🚀 Let's Get Started!</>
              ) : (
                <>🔐 Secure Your Account</>
              )}
            </h2>
            <p>
              {currentStep === 1 ? (
                "Tell us a bit about yourself to personalize your learning experience"
              ) : (
                "Create a strong password to keep your progress safe"
              )}
            </p>
            
            {/* Progress indicator */}
            <div className="signup-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentStep / 2) * 100}%` }}
                />
              </div>
              <span className="progress-text">Step {currentStep} of 2</span>
            </div>
          </div>

          {errors.general && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <p>{errors.general}</p>
            </div>
          )}

<<<<<<< Updated upstream
          <SignupForm
            onSubmit={handleSignup}
            error={error}
            isLoading={isLoading}
          />
=======
          <form onSubmit={handleSubmit} className="signup-form">
            {currentStep === 1 && (
              <div className="step-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">
                      👋 First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className={errors.firstName ? 'error' : ''}
                      required
                    />
                    {errors.firstName && (
                      <span className="error-text">{errors.firstName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">
                      📝 Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className={errors.lastName ? 'error' : ''}
                      required
                    />
                    {errors.lastName && (
                      <span className="error-text">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    📧 Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className={errors.email ? 'error' : ''}
                    required
                  />
                  {errors.email && (
                    <span className="error-text">{errors.email}</span>
                  )}
                  <small className="form-hint">
                    We'll use this to send you progress updates and learning tips
                  </small>
                </div>

                <button 
                  type="button" 
                  onClick={handleNext}
                  className="btn-primary"
                >
                  Continue to Security 🔐
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="step-content">
                <div className="form-group">
                  <label htmlFor="password">
                    🔒 Create Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className={errors.password ? 'error' : ''}
                    required
                  />
                  {formData.password && (
                    <div className="password-strength">
                      <div className={`strength-bar strength-${getPasswordStrength().strength}`}>
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`strength-segment ${i < getPasswordStrength().strength ? 'active' : ''}`}
                          />
                        ))}
                      </div>
                      <span className="strength-text" style={{ color: getPasswordStrength().color }}>
                        {getPasswordStrength().text}
                      </span>
                    </div>
                  )}
                  {errors.password && (
                    <span className="error-text">{errors.password}</span>
                  )}
                  <small className="form-hint">
                    Include uppercase, lowercase, numbers, and symbols
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    ✅ Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className={errors.confirmPassword ? 'error' : ''}
                    required
                  />
                  {errors.confirmPassword && (
                    <span className="error-text">{errors.confirmPassword}</span>
                  )}
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={() => setCurrentStep(1)}
                    className="btn-secondary"
                  >
                    ← Back
                  </button>
                  
                  <button type="submit" className="btn-primary">
                    🎉 Create My Account
                  </button>
                </div>
              </div>
            )}
          </form>
>>>>>>> Stashed changes

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in here 🚪
              </Link>
            </p>
            <p className="terms-text">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="auth-link">Terms</Link> and{' '}
              <Link to="/privacy" className="auth-link">Privacy Policy</Link>
            </p>
          </div>
        </div>

        <div className="auth-background">
          <div className="auth-features">
            <h3>🌟 What awaits you:</h3>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🎯</span>
                <div>
                  <strong>Personalized Learning Paths</strong>
                  <p>AI-powered recommendations based on your goals</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <div>
                  <strong>Intelligent Feedback</strong>
                  <p>Get instant, detailed feedback on your code</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <div>
                  <strong>Progress Tracking</strong>
                  <p>Visual charts and achievements to track growth</p>
                </div>
              </div>
              
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <div>
                  <strong>Learning Community</strong>
                  <p>Connect with peers and learn together</p>
                </div>
              </div>
            </div>
            
            <div className="testimonial">
              <blockquote>
                "SkillWise helped me land my dream job! The personalized approach made all the difference."
              </blockquote>
              <cite>— Alex Chen, Full Stack Developer 🚀</cite>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;