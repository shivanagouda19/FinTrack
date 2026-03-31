# OTP-Based Email Verification Implementation

## Changes Made

### 1. Fixed Gmail IPv6 Issue
**File**: `backend/server.js`

Updated nodemailer transporter configuration:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  family: 4,  // Force IPv4
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

### 2. Fixed Backwards Compatibility
**File**: `backend/server.js`

Updated login route verification check:
```javascript
if (user.isVerified === false && user.isVerified !== undefined) {
  return res.status(403).json({ error: "EMAIL_NOT_VERIFIED" });
}
```

This allows existing users (where `isVerified` is undefined) to login without issues.

### 3. Changed to OTP-Based Verification

#### Backend Changes

**User Model** (`backend/models/User.js`):
- Replaced `verificationToken` and `verificationTokenExpiry` with:
  - `otp`: String (6-digit code)
  - `otpExpiry`: Date (10 minutes validity)

**Signup Route** (`POST /signup`):
- Generates 6-digit random OTP
- Sets 10-minute expiry
- Sends OTP via email (no link)
- Returns email in response for frontend navigation

**New Routes**:

1. **POST /verify-otp**
   - Validates email and OTP
   - Checks OTP expiry
   - Marks user as verified
   - Clears OTP after verification

2. **POST /resend-otp**
   - Generates new 6-digit OTP
   - Updates expiry to 10 minutes
   - Sends new OTP via email

#### Frontend Changes

**VerifyEmail.jsx**:
- Complete rewrite for OTP input
- Reads email from URL query params
- 6-digit OTP input field (numeric only)
- Verify button calls `/verify-otp`
- Resend button calls `/resend-otp`
- Shows success message after verification
- Redirects to login after success

**App.jsx**:
- After successful signup, navigates to `/verify-email?email=...`
- Passes email via URL query parameter

**App.css**:
- Added `.otp-input` styling:
  - Centered text
  - Large font (1.5rem)
  - Wide letter spacing (8px)
  - Bold font weight

## User Flow

### Signup & Verification
1. User enters email and password
2. Account created with `isVerified=false`
3. 6-digit OTP generated and sent to email
4. User redirected to `/verify-email?email=...`
5. User enters OTP from email
6. OTP validated (10-minute expiry)
7. Account marked as verified
8. User can now login

### OTP Expiry & Resend
- OTP expires after 10 minutes
- User can click "Resend" to get new OTP
- New OTP has fresh 10-minute expiry
- Old OTP is invalidated

## Email Templates

### Signup OTP Email
- Subject: "Verify Your Email — Expense Tracker"
- Large, centered OTP display
- 10-minute expiry notice
- Teal color scheme (#00c9b1)

### Resend OTP Email
- Subject: "New OTP — Expense Tracker"
- Same format as signup email
- Fresh 10-minute expiry

## Security Features

1. **Short expiry**: OTPs expire in 10 minutes
2. **Single-use**: OTP cleared after successful verification
3. **Numeric only**: 6-digit numeric code
4. **Server-side validation**: All checks done on backend
5. **IPv4 forced**: Prevents Gmail IPv6 connection issues
6. **Backwards compatible**: Existing users unaffected

## Testing Checklist

- [x] Gmail IPv4 connection works
- [x] Existing users can login (backwards compatibility)
- [x] Signup sends OTP email
- [x] OTP verification works
- [x] Invalid OTP shows error
- [x] Expired OTP shows error
- [x] Resend OTP works
- [x] Login blocks unverified users
- [x] Verified users can login

## Advantages of OTP vs Link

1. **Faster**: No need to open email client and click link
2. **Mobile-friendly**: Easy to copy-paste OTP
3. **Shorter expiry**: 10 minutes vs 24 hours (more secure)
4. **Simpler UX**: Single page, no navigation
5. **Resend option**: Easy to get new OTP if expired
6. **No token management**: Simpler backend logic

## Notes

- OTP is 6 digits (100000-999999)
- Expiry is 10 minutes from generation
- Email is passed via URL query parameter
- Frontend validates OTP length (6 digits)
- Backend validates OTP match and expiry
- All OTP operations are case-insensitive (numeric only)
