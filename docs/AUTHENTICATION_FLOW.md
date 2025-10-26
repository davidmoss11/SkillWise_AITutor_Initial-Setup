# SkillWise Authentication Flow Documentation

## Overview
This document provides a comprehensive description of the authentication system implemented in SkillWise, including detailed flow diagrams and security measures.

## Authentication Architecture

SkillWise uses a modern JWT (JSON Web Token) based authentication system with the following components:

- **MongoDB Atlas**: Secure cloud database for user data persistence
- **bcrypt**: Password hashing with salt rounds (12 rounds)
- **JWT Access Tokens**: Short-lived tokens (15 minutes) for API access
- **JWT Refresh Tokens**: Long-lived tokens (7 days) for token renewal
- **Mongoose ODM**: Object Document Mapping for MongoDB operations

## Authentication Flow Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  MongoDB Atlas  │
│   (React)       │    │   (Express)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
```

### 1. User Registration Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│Frontend │                    │Backend  │                    │MongoDB  │
│         │                    │         │                    │         │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ 1. POST /api/auth/signup     │                              │
     │ {email, password,            │                              │
     │  firstName, lastName}        │                              │
     ├─────────────────────────────→│                              │
     │                              │                              │
     │                              │ 2. Validate input (Zod)     │
     │                              │ 3. Check if user exists     │
     │                              ├─────────────────────────────→│
     │                              │                              │
     │                              │ 4. User exists check result │
     │                              │←─────────────────────────────┤
     │                              │                              │
     │                              │ 5. Hash password (bcrypt)   │
     │                              │    saltRounds = 12           │
     │                              │                              │
     │                              │ 6. Create new user document │
     │                              ├─────────────────────────────→│
     │                              │                              │
     │                              │ 7. User created successfully│
     │                              │←─────────────────────────────┤
     │                              │                              │
     │ 8. 201 Created               │                              │
     │ {message, user}              │                              │
     │←─────────────────────────────┤                              │
     │                              │                              │
```

### 2. User Login Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│Frontend │                    │Backend  │                    │MongoDB  │
│         │                    │         │                    │         │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ 1. POST /api/auth/login      │                              │
     │ {email, password}            │                              │
     ├─────────────────────────────→│                              │
     │                              │                              │
     │                              │ 2. Validate input (Zod)     │
     │                              │ 3. Find user by email       │
     │                              ├─────────────────────────────→│
     │                              │                              │
     │                              │ 4. User document or null    │
     │                              │←─────────────────────────────┤
     │                              │                              │
     │                              │ 5. Compare password          │
     │                              │    bcrypt.compare()          │
     │                              │                              │
     │                              │ 6. Generate JWT tokens:     │
     │                              │    - accessToken (15m)      │
     │                              │    - refreshToken (7d)      │
     │                              │                              │
     │                              │ 7. Update last login time   │
     │                              ├─────────────────────────────→│
     │                              │                              │
     │ 8. 200 OK                    │ 9. Login time updated       │
     │ {user, tokens}               │←─────────────────────────────┤
     │←─────────────────────────────┤                              │
     │                              │                              │
```

### 3. Protected Route Access Flow

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│Frontend │                    │Backend  │                    │MongoDB  │
│         │                    │         │                    │         │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │ 1. GET /api/dashboard/stats  │                              │
     │ Authorization: Bearer <JWT>  │                              │
     ├─────────────────────────────→│                              │
     │                              │                              │
     │                              │ 2. Extract JWT from header  │
     │                              │ 3. Verify JWT signature     │
     │                              │    jwt.verify()              │
     │                              │                              │
     │                              │ 4. Decode userId from JWT   │
     │                              │ 5. Find user by ID          │
     │                              ├─────────────────────────────→│
     │                              │                              │
     │                              │ 6. User document             │
     │                              │←─────────────────────────────┤
     │                              │                              │
     │                              │ 7. Attach user to req.user  │
     │                              │ 8. Continue to route handler│
     │                              │                              │
     │ 9. 200 OK                    │                              │
     │ {dashboard data}             │                              │
     │←─────────────────────────────┤                              │
     │                              │                              │
```

### 4. Token Refresh Flow

```
┌─────────┐                    ┌─────────┐
│Frontend │                    │Backend  │
│         │                    │         │
└────┬────┘                    └────┬────┘
     │                              │
     │ 1. POST /api/auth/refresh    │
     │ {refreshToken}               │
     ├─────────────────────────────→│
     │                              │
     │                              │ 2. Verify refresh token     │
     │                              │    jwt.verify()              │
     │                              │ 3. Check token type         │
     │                              │                              │
     │                              │ 4. Generate new access token│
     │                              │    (15m expiry)              │
     │                              │                              │
     │ 5. 200 OK                    │                              │
     │ {accessToken}                │                              │
     │←─────────────────────────────┤                              │
     │                              │                              │
```

## Security Measures

### Password Security
- **bcrypt Hashing**: All passwords are hashed using bcrypt with 12 salt rounds
- **Salting**: Each password gets a unique salt to prevent rainbow table attacks
- **No Plain Text Storage**: Passwords are never stored in plain text

### JWT Token Security
- **Short-lived Access Tokens**: 15-minute expiry reduces exposure window
- **Separate Refresh Tokens**: 7-day expiry allows seamless re-authentication
- **Signed Tokens**: HMAC-SHA256 signature prevents tampering
- **Environment-based Secrets**: JWT secrets stored in environment variables

### Database Security
- **MongoDB Atlas**: Hosted on secure cloud infrastructure
- **Connection String Security**: Database credentials stored in environment variables
- **Input Validation**: Zod schema validation prevents injection attacks
- **Mongoose ODM**: Additional layer of security and validation

### API Security
- **CORS Configuration**: Restricts cross-origin requests
- **Helmet.js**: Security headers for common vulnerabilities
- **Rate Limiting**: Prevents brute force attacks
- **Input Sanitization**: All inputs validated before processing

## Data Models

### User Schema (MongoDB)
```javascript
{
  _id: ObjectId,
  email: String (unique, required, lowercase),
  password_hash: String (required, min 8 chars),
  first_name: String (required, max 100 chars),
  last_name: String (required, max 100 chars),
  role: String (enum: ['student', 'instructor', 'admin'], default: 'student'),
  is_verified: Boolean (default: false),
  created_at: Date (default: now),
  updated_at: Date (default: now)
}
```

### JWT Payload Structure
```javascript
// Access Token
{
  userId: ObjectId,
  type: 'access',
  iat: timestamp,
  exp: timestamp (15 minutes)
}

// Refresh Token
{
  userId: ObjectId,
  type: 'refresh',
  iat: timestamp,
  exp: timestamp (7 days)
}
```

## Error Handling

### Registration Errors
- **Validation Error**: Invalid email format, weak password, missing fields
- **Duplicate Email**: User already exists with that email
- **Database Error**: Connection issues, write failures

### Login Errors
- **Invalid Credentials**: Wrong email or password
- **User Not Found**: Email not registered
- **Account Issues**: Unverified account, locked account

### Token Errors
- **Token Expired**: Access token needs refresh
- **Invalid Token**: Malformed or tampered token
- **Missing Token**: No authorization header provided
- **Wrong Token Type**: Using refresh token for access, etc.

## Environment Variables Required

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/auth/signup` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Token refresh | No (refresh token) |
| GET | `/api/auth/profile` | Get user profile | Yes |
| POST | `/api/auth/logout` | User logout | Yes |

## Implementation Best Practices

1. **Secure Password Storage**: Never store plain text passwords
2. **Token Rotation**: Implement refresh token rotation for maximum security
3. **Proper Error Messages**: Don't reveal sensitive information in error responses
4. **Rate Limiting**: Implement rate limiting on authentication endpoints
5. **HTTPS Only**: Always use HTTPS in production
6. **Environment Security**: Keep secrets in environment variables, never in code
7. **Regular Security Audits**: Monitor for suspicious authentication patterns

This authentication system provides enterprise-grade security while maintaining a smooth user experience through modern JWT-based authentication patterns.