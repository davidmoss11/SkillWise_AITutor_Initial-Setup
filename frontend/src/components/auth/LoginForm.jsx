<<<<<<< Updated upstream
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const LoginForm = ({ onSubmit, error, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema)
=======
import React, { useState } from 'react';

const LoginForm = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
>>>>>>> Stashed changes
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

<<<<<<< Updated upstream
  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
      {/* Email Field */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address
=======
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label htmlFor="email">
          📧 Email Address
>>>>>>> Stashed changes
        </label>
        <input
          type="email"
          id="email"
<<<<<<< Updated upstream
          {...register('email')}
          className={`form-input ${errors.email ? 'form-input-error' : ''}`}
          placeholder="Enter your email"
          autoComplete="email"
        />
        {errors.email && (
          <p className="form-error">{errors.email.message}</p>
=======
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          className={errors.email ? 'error' : ''}
          disabled={isLoading}
          required
        />
        {errors.email && (
          <span className="error-text">{errors.email}</span>
>>>>>>> Stashed changes
        )}
      </div>

      {/* Password Field */}
      <div className="form-group">
<<<<<<< Updated upstream
        <label htmlFor="password" className="form-label">
          Password
=======
        <label htmlFor="password">
          🔒 Password
>>>>>>> Stashed changes
        </label>
        <input
          type="password"
          id="password"
<<<<<<< Updated upstream
          {...register('password')}
          className={`form-input ${errors.password ? 'form-input-error' : ''}`}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="form-options">
        <label className="checkbox-label">
          <input type="checkbox" className="checkbox" />
          <span className="checkbox-text">Remember me</span>
        </label>
        <a href="/forgot-password" className="forgot-link">
          Forgot password?
        </a>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || isSubmitting}
        className="auth-button"
      >
        {isLoading || isSubmitting ? (
          <span className="loading-text">
            <svg className="loading-spinner" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeDasharray="32"
                strokeDashoffset="32"
              />
            </svg>
            Signing In...
          </span>
        ) : (
          'Sign In'
=======
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          className={errors.password ? 'error' : ''}
          disabled={isLoading}
          required
        />
        {errors.password && (
          <span className="error-text">{errors.password}</span>
        )}
      </div>

      <button 
        type="submit" 
        className="btn-primary"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <span className="spinner-small"></span>
            Signing In...
          </>
        ) : (
          <>
            🚀 Sign In
          </>
>>>>>>> Stashed changes
        )}
      </button>
      
      <div className="form-footer">
        <p className="welcome-message">
          Welcome back! We're excited to continue your learning journey with you! 🎓
        </p>
      </div>
    </form>
  );
};

export default LoginForm;