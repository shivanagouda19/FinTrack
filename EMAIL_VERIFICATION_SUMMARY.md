# Email Verification & Password Reset Implementation

## Overview
Complete email verification, forgot password, and reset password functionality has been added to the expense tracker app using nodemailer with Gmail.

## Backend Changes

### Dependencies
- **nodemailer**: Installed for sending emails via Gmail SMTP

### Environment Variables (.env)
- `EMAIL_USER`: Gmail address for sending emails
- `EMAIL_PASS`: Gmail app password (16-character)
- `FRONTEND_URL`: http://localhost:5173

### User Model (User.js)
Added new fields:
- `isVerified`: Boolean (default: false)
- `verificationToken`: String
- `verificationTokenExpiry`: Date
- `resetPasswordToken`: String
- `resetPasswordTokenExpiry`: Date

### Server.js Updates

#### Nodemailer Setup
- Created transporter with Gmail service
- Created `sendEmail()` helper function

#### Updated Routes

**POST /signup**
- Generates 32-byte verification token
- Sets 24-hour expiry
- Sends verification email with link
- Returns success message instead of auto-login

**POST /login**
- Checks `isVerified` status
- Returns `EMAIL_NOT_VERIFIED` error if user.isVerified === false
- Backwards compatible (allows login if isVerified is undefined)

**GET /verify-email?token=...**
- Validates token and expiry
- Sets isVerified to true
- Clears verification token
- Returns success message

**POST /forgot-password**
- Validates email format
- Generates 32-byte reset token
- Sets 1-hour expiry
- Sends reset email with link
- Always returns success (security best practice)

**POST /reset-password**
- Validates token and expiry
- Validates new password (min 6 chars)
- Hashes and updates password
- Clears reset token
- Returns success message

## Frontend Changes

### New Pages

#### VerifyEmail.jsx
- Reads token from URL query params
- Calls GET /verify-email
- Shows success/error status
- Redirects to login on success

#### ForgotPassword.jsx
- Email input form
- Calls POST /forgot-password
- Shows success message
- Link back to login

#### ResetPassword.jsx
- Reads token from URL query params
- New password + confirm password inputs
- Frontend validation (min 6 chars, passwords match)
- Calls POST /reset-password
- Shows success message
- Redirects to login on success

### App.jsx Updates
- Imported new pages
- Added public routes (accessible without auth):
  - `/verify-email`
  - `/forgot-password`
  - `/reset-password`
- Updated login error handling for `EMAIL_NOT_VERIFIED`
- Added "Forgot Password?" link on login page

### CSS Updates (App.css)
- `.auth-icon`: Large emoji display (3rem)
- `.auth-success`: Green success message
- `.auth-subtitle`: Gray subtitle text
- `.auth-link-btn`: Underlined link button

## Email Templates

### Verification Email
- Subject: "Verify Your Email — Expense Tracker"
- Teal-colored button with verification link
- 24-hour expiry notice

### Password Reset Email
- Subject: "Reset Your Password — Expense Tracker"
- Teal-colored button with reset link
- 1-hour expiry notice

## Security Features

1. **Token-based verification**: Cryptographically secure random tokens
2. **Time-limited tokens**: 
   - Verification: 24 hours
   - Password reset: 1 hour
3. **Email enumeration protection**: Forgot password always returns success
4. **Backwards compatibility**: Existing users (isVerified undefined) can still login
5. **Password validation**: Minimum 6 characters enforced
6. **HTTPS-ready**: Email links use FRONTEND_URL environment variable

## User Flow

### Signup Flow
1. User enters email and password
2. Account created with isVerified=false
3. Verification email sent
4. User clicks link in email
5. Email verified, can now login

### Login Flow
1. User enters credentials
2. If email not verified, shows error message
3. If verified, login succeeds

### Forgot Password Flow
1. User clicks "Forgot Password?" on login
2. Enters email address
3. Reset email sent (if account exists)
4. User clicks link in email
5. Enters new password
6. Password updated, can now login

## Testing Checklist

- [ ] Signup sends verification email
- [ ] Verification link works and marks email as verified
- [ ] Login blocks unverified users with proper error
- [ ] Verified users can login successfully
- [ ] Forgot password sends reset email
- [ ] Reset link works and updates password
- [ ] Expired tokens show error message
- [ ] Invalid tokens show error message
- [ ] Existing users (before this feature) can still login

## Gmail Setup Required

To use this feature, you need:
1. Gmail account
2. Enable 2-factor authentication
3. Generate app password (16 characters)
4. Add to .env file as EMAIL_PASS

## Notes

- crypto module is built into Node.js (no installation needed)
- All email routes are public (no authentication required)
- Tokens are single-use (cleared after verification/reset)
- Email templates use inline CSS for compatibility
