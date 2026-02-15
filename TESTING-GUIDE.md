# 🧪 Testing Guide - React + Django Integration

## ✅ Setup Complete!

Both servers are now running:
- **React Frontend**: http://localhost:3000
- **Django Backend**: http://localhost:8000

---

## 🚀 Test Flow

### Step 1: Register a New User

1. Go to http://localhost:3000
2. Click "Register" or go to http://localhost:3000/register
3. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john@example.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
4. Click "Register"

**Expected Result:**
- Success toast notification
- Redirected to email verification page
- Verification token stored in localStorage

### Step 2: Verify Email

The verification page should automatically verify your email. If not:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any errors
4. The page should show "Email verified! Redirecting to login..."

**Expected Result:**
- Email verified message
- Redirected to login page after 1.5 seconds

### Step 3: Login

1. You should be on the login page
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `Test123!`
3. Click "Login"

**Expected Result:**
- Success toast: "Login successful!"
- Redirected to dashboard
- JWT tokens stored in localStorage
- User data displayed

### Step 4: Verify in Admin Panel

1. Go to http://localhost:8000/admin
2. Login with:
   - Email: `admin@growfund.com`
   - Password: `Admin123!`
3. Click "Users" to see your registered user

**Expected Result:**
- Your user appears in the user list
- Email is verified
- User details are correct

---

## 🔍 Debugging

### Check localStorage

Open DevTools (F12) → Application → Local Storage → http://localhost:3000

You should see:
- `access_token` - JWT token
- `refresh_token` - Refresh token
- `user` - User data JSON

### Check Network Requests

1. Open DevTools (F12) → Network tab
2. Perform actions (register, login, etc.)
3. Look for API calls to `http://localhost:8000/api/`

**Expected Requests:**
- `POST /api/auth/register/` - Registration
- `POST /api/auth/verify-email/` - Email verification
- `POST /api/auth/login/` - Login

### Check Console for Errors

DevTools (F12) → Console tab

Look for any JavaScript errors or API errors.

---

## 📝 Test Cases

### Test Case 1: Register with Invalid Email
- **Input**: Invalid email format
- **Expected**: Error message "Enter a valid email address"

### Test Case 2: Register with Weak Password
- **Input**: Password less than 8 characters
- **Expected**: Error message about password strength

### Test Case 3: Register with Mismatched Passwords
- **Input**: Different passwords in both fields
- **Expected**: Error message "Passwords do not match"

### Test Case 4: Login with Wrong Password
- **Input**: Correct email, wrong password
- **Expected**: Error message "Invalid credentials"

### Test Case 5: Login with Unverified Email
- **Input**: Email that hasn't been verified
- **Expected**: Error message "Email not verified"

### Test Case 6: Access Protected Route Without Login
- **Input**: Go to http://localhost:3000/app without logging in
- **Expected**: Redirected to login page

---

## 🛠️ Troubleshooting

### Issue: CORS Error
**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**: 
- Check Django settings.py has `CORS_ALLOWED_ORIGINS` including `http://localhost:3000`
- Restart Django server

### Issue: 404 Not Found
**Error**: "POST http://localhost:8000/api/auth/register/ 404"

**Solution**:
- Check Django server is running
- Check URL is correct in api.js
- Check accounts app is in INSTALLED_APPS

### Issue: Tokens Not Stored
**Error**: localStorage is empty after login

**Solution**:
- Check browser console for errors
- Check API response includes tokens
- Check localStorage is not disabled

### Issue: React App Won't Start
**Error**: "npm start" hangs or fails

**Solution**:
```bash
# Kill any existing processes
taskkill /F /IM node.exe

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -r node_modules package-lock.json
npm install

# Start again
npm start
```

---

## 📊 API Endpoints Being Tested

### Authentication
- `POST /api/auth/register/` - Create new user
- `POST /api/auth/verify-email/` - Verify email
- `POST /api/auth/login/` - Get JWT tokens
- `GET /api/auth/me/` - Get current user (protected)

### Response Format

**Success Response:**
```json
{
  "message": "Login successful",
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "user": {
    "id": 1,
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "balance": "0.00"
  }
}
```

**Error Response:**
```json
{
  "error": "Invalid credentials"
}
```

---

## ✨ Next Steps After Testing

1. ✅ Test registration and login
2. ✅ Verify email verification works
3. ✅ Check tokens are stored
4. ✅ Test protected routes
5. 🔜 Create investment endpoints
6. 🔜 Create transaction endpoints
7. 🔜 Create referral endpoints
8. 🔜 Connect all frontend features to backend

---

## 📞 Support

If you encounter issues:

1. Check the error message carefully
2. Look at browser console (F12)
3. Check Django server logs
4. Check network requests (F12 → Network)
5. Verify both servers are running

**Servers Status:**
- React: http://localhost:3000 (should show app)
- Django: http://localhost:8000/admin (should show admin panel)
