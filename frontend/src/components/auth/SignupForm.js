import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import './SignupForm.css';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const SignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/signup`,
        {
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
        }
      );

      setSubmitSuccess(true);
      reset();
      
      // Optional: Store user data or redirect
      console.log('User created:', response.data.user);
      
    } catch (error) {
      if (error.response?.data) {
        const { message, details } = error.response.data;
        
        if (details && Array.isArray(details)) {
          // Handle validation errors
          setSubmitError(details.map(d => d.message).join(', '));
        } else {
          setSubmitError(message || 'Signup failed');
        }
      } else {
        setSubmitError('Network error. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="signup-form signup-success">
        <div className="success-message">
          <h2>🎉 Account Created Successfully!</h2>
          <p>Welcome to SkillWise! Your account has been created and you can now start your learning journey.</p>
          <button 
            className="btn btn-primary"
            onClick={() => setSubmitSuccess(false)}
          >
            Create Another Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-form">
      <div className="form-header">
        <h2>Create Your Account</h2>
        <p>Join SkillWise and start tracking your learning progress</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name *</label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={errors.firstName ? 'error' : ''}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name *</label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={errors.lastName ? 'error' : ''}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName.message}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'error' : ''}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={errors.password ? 'error' : ''}
            placeholder="Enter a strong password (min 8 characters)"
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <span className="error-message">{errors.confirmPassword.message}</span>
          )}
        </div>

        {submitError && (
          <div className="error-banner">
            <span>❌ {submitError}</span>
          </div>
        )}

        <button
          type="submit"
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
          disabled={!isValid || isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="form-footer">
        <p>Already have an account? <a href="#login">Sign in here</a></p>
      </div>
    </div>
  );
};

export default SignupForm;