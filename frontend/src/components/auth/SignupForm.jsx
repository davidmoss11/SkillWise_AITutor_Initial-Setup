import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const signupSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(100, 'First name too long'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(100, 'Last name too long'),
  email: z.string().email('Invalid email format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const SignupForm = ({ onSubmit, error, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const handleFormSubmit = (data) => {
    const { confirmPassword, ...submitData } = data;
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="auth-form">
      {/* Name Fields */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            {...register('firstName')}
            className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
            placeholder="First name"
            autoComplete="given-name"
          />
          {errors.firstName && (
            <p className="form-error">{errors.firstName.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="lastName" className="form-label">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            {...register('lastName')}
            className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
            placeholder="Last name"
            autoComplete="family-name"
          />
          {errors.lastName && (
            <p className="form-error">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Email Field */}
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          {...register('email')}
          className={`form-input ${errors.email ? 'form-input-error' : ''}`}
          placeholder="Enter your email"
          autoComplete="email"
        />
        {errors.email && (
          <p className="form-error">{errors.email.message}</p>
        )}
      </div>

      {/* Password Fields */}
      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password
        </label>
        <input
          type="password"
          id="password"
          {...register('password')}
          className={`form-input ${errors.password ? 'form-input-error' : ''}`}
          placeholder="Create a strong password"
          autoComplete="new-password"
        />
        {errors.password && (
          <p className="form-error">{errors.password.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          {...register('confirmPassword')}
          className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="form-error">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            className="checkbox"
            required
          />
          <span className="checkbox-text">
            I agree to the <a href="/terms" className="link">Terms of Service</a> and{' '}
            <a href="/privacy" className="link">Privacy Policy</a>
          </span>
        </label>
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
            Creating Account...
          </span>
        ) : (
          'Create Account'
        )}
      </button>
    </form>
  );
};

export default SignupForm;