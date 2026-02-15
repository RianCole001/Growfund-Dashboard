# Authentication Backend Integration Fix

## Problem

You were getting "Invalid or expired token" errors when trying to register/login because the frontend was using a **demo/local storage authentication system** instead of calling the backend API.

## Root Cause

The old `AuthContext.js` was:
- Storing users in browser localStorage
- Not calling the backend API at all
- Using fake demo tokens
- Not handling real JWT tokens from the backend

## Solution Applied

I've updated the authentication system to properly integrate with your Django backend:

### 1. Updated `AuthContext.js`

**Changes:**
- ✅ Now calls backend API endpoints (`/auth/register/`, `/auth/login/`, etc.)
- ✅ Properly stores JWT tokens (`user_access_token`, `user_refresh_token`)
- ✅ Handles token refresh on 401 errors
- ✅ Validates tokens on app startup
- ✅ Clears invalid tokens automatically

**Key Features:**
```javascript
// Stores tokens from backend
localStorage.setItem('user_access_token', response.data.access);
localStorage.setItem('user_refresh_token', response.data.refresh);

// Adds token to all API requests
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('user_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Automatically refreshes expired tokens
authApi.interceptors.response.use(...);
```

### 2. Updated `RegisterPage.js`

**Changes:**
- ✅ Added password confirmation field
- ✅ Added password validation (min 8 characters)
- ✅ Sends `password2` field to backend
- ✅ Redirects to login after successful registration
- ✅ Shows loading state during registration

### 3. API Endpoints Used

The frontend now calls these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/auth/register/` | POST | Create new user |
| `/auth/login/` | POST | Login user, get tokens |
| `/auth/me/` | GET | Get current user info |
| `/auth/verify-email/` | POST | Verify email |
| `/auth/forgot-password/` | POST | Request password reset |
| `/auth/reset-password/` | POST | Reset password |
| `/token/refresh/` | POST | Refresh access token |

## How It Works Now

### Registration Flow

```
1. User fills form (name, email, password, password2)
2. Frontend sends POST to /auth/register/
3. Backend creates user and returns success
4. Frontend redirects to login page
5. User logs in with credentials
```

### Login Flow

```
1. User enters email and password
2. Frontend sends POST to /auth/login/
3. Backend validates credentials and returns JWT tokens
4. Frontend stores tokens in localStorage
5. Frontend adds token to all future API requests
6. User is logged in and redirected to dashboard
```

### Token Refresh Flow

```
1. User makes API request with access token
2. Backend returns 401 (token expired)
3. Frontend automatically sends refresh token to /token/refresh/
4. Backend returns new access token
5. Frontend retries original request with new token
6. User doesn't notice anything happened
```

## Testing the Fix

### Test Registration

1. Go to `/register`
2. Fill in:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `TestPassword123`
   - Confirm Password: `TestPassword123`
3. Click Register
4. Should redirect to login page
5. Check backend logs for success

### Test Login

1. Go to `/login`
2. Enter credentials from registration
3. Click Login
4. Should redirect to dashboard
5. Check browser DevTools → Application → localStorage for tokens

### Test Token Refresh

1. Login successfully
2. Wait for token to expire (or manually delete `user_access_token` from localStorage)
3. Make an API request (e.g., navigate to a page that fetches data)
4. Should automatically refresh token and work

## Backend Requirements

Your backend must have these endpoints implemented:

```python
# accounts/views.py

class RegisterView(APIView):
    def post(self, request):
        # Create user with name, email, password, password2
        # Return success message

class LoginView(APIView):
    def post(self, request):
        # Validate email and password
        # Return access and refresh tokens
        # Return user data

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Return current user data
```

## Environment Variables

Make sure your `.env` file has:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Or for ngrok:

```env
REACT_APP_API_URL=https://your-backend-ngrok-url.ngrok-free.app/api
```

## Troubleshooting

### "Invalid credentials" error

**Cause:** User doesn't exist or password is wrong
**Fix:** 
- Make sure you registered first
- Check email and password are correct
- Check backend is running

### "Invalid or expired token" error

**Cause:** Token is invalid or expired
**Fix:**
- Clear localStorage: `localStorage.clear()`
- Login again
- Check backend SECRET_KEY hasn't changed

### "Network error" when registering

**Cause:** Backend is not running or API URL is wrong
**Fix:**
- Start backend: `python manage.py runserver`
- Check `REACT_APP_API_URL` in `.env`
- Check CORS settings in backend `settings.py`

### "CORS error" when making requests

**Cause:** Frontend URL not in CORS_ALLOWED_ORIGINS
**Fix:**
- Add frontend URL to `backend-growfund/growfund/settings.py`:
  ```python
  CORS_ALLOWED_ORIGINS = [
      'http://localhost:3000',
      'https://your-frontend-ngrok-url.ngrok-free.app',
  ]
  ```

## Files Changed

- ✅ `Growfund-Dashboard/src/auth/AuthContext.js` - Now uses backend API
- ✅ `Growfund-Dashboard/src/pages/RegisterPage.js` - Added password confirmation
- ✅ `Growfund-Dashboard/src/auth/AuthContext-BACKUP.js` - Backup of old demo auth

## Next Steps

1. **Restart frontend:** `npm start`
2. **Make sure backend is running:** `python manage.py runserver`
3. **Test registration:** Go to `/register` and create a new account
4. **Test login:** Go to `/login` and login with your credentials
5. **Check tokens:** Open DevTools → Application → localStorage to see tokens

## Important Notes

- ✅ Tokens are stored in localStorage (not secure for production, use httpOnly cookies)
- ✅ Tokens are automatically refreshed when expired
- ✅ Invalid tokens are cleared automatically
- ✅ All API requests include the token in Authorization header
- ✅ Backend must return tokens in format: `{ access: "...", refresh: "...", user: {...} }`

## Production Considerations

For production, consider:
- Use httpOnly cookies instead of localStorage
- Implement CSRF protection
- Use HTTPS only
- Implement rate limiting on auth endpoints
- Add email verification
- Add 2FA support
