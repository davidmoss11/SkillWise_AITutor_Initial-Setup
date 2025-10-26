# Authentication Flow

## Overview

This document describes the authentication flow in the SkillWise AI Tutor application.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    %% Registration Flow
    User->>Frontend: Enter registration details
    Frontend->>Frontend: Validate input (Zod)
    Frontend->>Backend: POST /api/auth/register
    Backend->>Backend: Validate input
    Backend->>Backend: Hash password (bcrypt)
    Backend->>Database: Save user
    Database-->>Backend: User created
    Backend->>Frontend: Return success
    Frontend->>User: Show success message

    %% Login Flow
    User->>Frontend: Enter login credentials
    Frontend->>Frontend: Validate input
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Check credentials
    Database-->>Backend: User found
    Backend->>Backend: Verify password (bcrypt)
    Backend->>Backend: Generate JWT tokens
    Backend-->>Frontend: Return tokens
    Frontend->>Frontend: Store tokens
    Frontend->>User: Redirect to dashboard

    %% Protected Route Access
    User->>Frontend: Access protected route
    Frontend->>Backend: Request + JWT
    Backend->>Backend: Validate JWT
    Backend-->>Frontend: Protected data
    Frontend-->>User: Show protected content

    %% Token Refresh Flow
    Frontend->>Backend: Request with expired token
    Backend->>Backend: Validate refresh token
    Backend->>Backend: Generate new access token
    Backend-->>Frontend: New access token
    Frontend->>Frontend: Update stored token
```

## Security Features

1. **Password Security**

   - Passwords are hashed using bcrypt with 12 rounds
   - Password requirements:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
     - At least one special character

2. **Token Security**

   - Access tokens expire after 15 minutes
   - Refresh tokens expire after 7 days
   - Tokens are stored in httpOnly cookies
   - CSRF protection enabled

3. **API Security**
   - Rate limiting enabled (100 requests per 15 minutes)
   - CORS configured for frontend origin
   - Secure HTTP headers
   - Input validation using Zod

## Implementation Details

### JWT Configuration

```javascript
{
  "access_token": {
    "expiry": "15m",
    "algorithm": "HS256"
  },
  "refresh_token": {
    "expiry": "7d",
    "algorithm": "HS256"
  }
}
```

### Database Schema

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'student',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
