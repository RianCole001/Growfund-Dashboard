# GrowFund - Portal Access Guide

## Two Portals, One Platform

GrowFund now has two separate portals with the same beautiful theme:

### 🎯 User Dashboard
**Purpose**: Investment management for end users

**Access URL**:
- Local: `http://localhost:3000/app`
- Ngrok: `https://79bd-105-164-98-141.ngrok-free.app/app`

**Demo Access**:
- Click "Continue as Demo User" on login screen
- Or use any registered account

**Features**:
- Portfolio overview
- Crypto investments
- Live trading charts
- Deposits & withdrawals
- Referral/Earn program
- Settings & notifications
- Real estate investments
- Transaction history

---

### 👨‍💼 Admin Portal
**Purpose**: Platform management and oversight

**Access URL**:
- Local: `http://localhost:3000/admin`
- Ngrok: `https://79bd-105-164-98-141.ngrok-free.app/admin`

**Login Credentials**:
```
Email: admin@growfund.com
Password: Admin1234!
```

**Features**:
- User management
- Investment monitoring
- Deposit approvals
- Withdrawal processing
- Transaction history
- Platform settings
- Analytics dashboard

---

## Quick Start Guide

### For Users
1. Visit `/app` route
2. Click "Continue as Demo User" for instant access
3. Explore investments, trading, and portfolio features

### For Admins
1. Visit `/admin` route
2. Login with admin credentials
3. Manage users, approve transactions, configure platform

---

## Running the Application

### Start Development Server
```bash
cd Growfund-Dashboard/trading-dashboard
npm start
```

The app will open at `http://localhost:3000`

### Access Portals
- User Dashboard: Add `/app` to URL
- Admin Portal: Add `/admin` to URL

### Using Ngrok (Remote Access)
```bash
ngrok http 3000
```

Then use the ngrok URL with `/app` or `/admin`:
- User: `https://your-ngrok-url.ngrok-free.app/app`
- Admin: `https://your-ngrok-url.ngrok-free.app/admin`

---

## Portal Comparison

| Feature | User Dashboard | Admin Portal |
|---------|---------------|--------------|
| **Purpose** | Personal investing | Platform management |
| **Access** | Demo mode or registration | Admin credentials only |
| **View** | Personal portfolio | All users & transactions |
| **Actions** | Invest, deposit, withdraw | Approve, manage, configure |
| **Analytics** | Personal performance | Platform-wide metrics |
| **Settings** | User preferences | Platform configuration |

---

## Design Consistency

Both portals share:
- ✅ Same dark theme (gray-900 background)
- ✅ Blue accent colors
- ✅ Responsive mobile design
- ✅ Smooth animations
- ✅ Modern UI components
- ✅ Consistent navigation
- ✅ Professional styling

---

## Security Notes

### User Portal
- Login gate with demo bypass
- Session persistence
- Profile management
- Secure logout

### Admin Portal
- Separate authentication
- Admin-only access
- Role-based permissions
- Secure session management

---

## Deployment

Both portals are part of the same React app and deploy together:

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

After deployment:
- User Portal: `https://your-domain.vercel.app/app`
- Admin Portal: `https://your-domain.vercel.app/admin`

---

## Support

Need help?
- User Portal Issues: Check user documentation
- Admin Portal Issues: See ADMIN-PORTAL.md
- General Questions: support@growfund.com
