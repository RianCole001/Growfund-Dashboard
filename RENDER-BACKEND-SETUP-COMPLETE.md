# Render Backend Setup - Complete

## ✅ Backend Deployed to Render

**Backend URL:** `https://growfun-backend.onrender.com`
**API Endpoint:** `https://growfun-backend.onrender.com/api`

---

## ✅ Frontend Updated

**File:** `Growfund-Dashboard/trading-dashboard/.env`

```env
REACT_APP_API_URL=https://growfun-backend.onrender.com/api
```

---

## Next Steps

### 1. Restart Frontend

Stop your frontend (Ctrl+C) and restart:

```bash
cd Growfund-Dashboard/trading-dashboard
npm start
```

### 2. Test the Connection

1. Open `http://localhost:3000`
2. Try to login/register
3. Check browser console (F12) for any errors
4. Verify API calls are going to `https://growfun-backend.onrender.com/api`

---

## Important Notes

### Backend CORS Settings

Make sure your backend `settings.py` on Render has:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    # Add your frontend deployment URL when you deploy it
]

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'growfun-backend.onrender.com',  # Your Render backend URL
]
```

### Database

- If using SQLite on Render, note that it's ephemeral (resets on restart)
- Consider upgrading to PostgreSQL for production
- Render offers free PostgreSQL databases

### Environment Variables on Render

Make sure these are set in Render dashboard:
- `SECRET_KEY`
- `DEBUG=False`
- `ALLOWED_HOSTS=growfun-backend.onrender.com`
- Any other sensitive keys (email, API keys, etc.)

---

## Deployment Options for Frontend

Once backend is working, you can deploy frontend to:

1. **Vercel** (Recommended for React)
   - Free tier
   - Automatic deployments from GitHub
   - Easy environment variable management

2. **Netlify**
   - Free tier
   - Similar to Vercel
   - Good for static sites

3. **Render** (Same as backend)
   - Keep everything in one place
   - Free tier available

---

## Testing Checklist

- [ ] Frontend connects to Render backend
- [ ] Login works
- [ ] Register works
- [ ] User profile loads
- [ ] Trading features work
- [ ] Referral system works
- [ ] Admin panel works (if deployed)

---

## Troubleshooting

**CORS Errors:**
- Check `CORS_ALLOWED_ORIGINS` in backend settings.py
- Make sure frontend URL is included
- Redeploy backend after changes

**Connection Refused:**
- Backend might be sleeping (Render free tier)
- First request takes 30-60 seconds to wake up
- Subsequent requests are fast

**Database Errors:**
- Run migrations on Render: `python manage.py migrate`
- Create admin user: `python manage.py create_admin`
- Generate referral codes: `python manage.py generate_referral_codes`

**Static Files Not Loading:**
- Run `python manage.py collectstatic` on Render
- Check `STATIC_ROOT` and `STATIC_URL` in settings.py

---

## Current Status

✅ Backend deployed to Render
✅ Frontend .env updated with Render backend URL
⏳ Frontend needs restart to pick up new API URL
⏳ Test login/register functionality

---

## Quick Commands

```bash
# Restart frontend
cd Growfund-Dashboard/trading-dashboard
npm start

# Check API connection (in browser console)
fetch('https://growfun-backend.onrender.com/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
.then(r => r.json())
.then(console.log)
```
