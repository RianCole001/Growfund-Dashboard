# GrowFund Admin Portal

## Access the Admin Dashboard

### URL
```
http://localhost:3000/admin
```

Or with ngrok:
```
https://79bd-105-164-98-141.ngrok-free.app/admin
```

### Demo Credentials
```
Email: admin@growfund.com
Password: Admin1234!
```

## Features

### 1. Dashboard
- Real-time statistics (Total Users, Active Users, Total Invested, Transactions)
- Pending deposits and withdrawals alerts
- Recent activity feed
- Top investors leaderboard
- Growth metrics with percentage changes

### 2. User Management
- View all registered users
- Search and filter users by status (active, pending, suspended)
- User details: balance, invested amount, join date, verification status
- Actions: View, Edit, Email, Delete users
- Quick stats: Total users, Active users, Pending verification

### 3. Investment Management
- Monitor all user investments across assets
- View current values and profit/loss calculations
- Filter by asset type (BTC, ETH, SOL, ADA, Real Estate)
- ROI tracking with visual indicators
- Summary cards: Total Invested, Current Value, Total Profit/Loss, ROI percentage

### 4. Deposit Management
- Review pending deposit requests
- Approve or reject deposits with one click
- Filter by status (pending, approved, rejected)
- View payment methods and references
- Track total pending deposit amounts

### 5. Withdrawal Management
- Process withdrawal requests
- View account details for each withdrawal
- Approve or reject withdrawals
- Monitor processing status
- Track pending withdrawal amounts

### 6. Transaction History
- Complete transaction log (Deposits, Withdrawals, Investments, Sales)
- Advanced filtering by type and status
- Export to CSV functionality
- Transaction volume analytics
- Reference tracking for all transactions

### 7. Platform Settings
- **General Settings**: Platform name, support email, maintenance mode
- **Transaction Limits**: Min/max deposit and withdrawal amounts
- **Fees Configuration**: Deposit and withdrawal fee percentages
- **Automation**: Auto-approve settings for deposits/withdrawals
- **Notifications**: Email and SMS notification toggles
- **Referral Program**: Configure referral bonus amounts

## Design Features

### Consistent Theme
- Same dark theme as user dashboard (gray-900 background)
- Blue accent colors for primary actions
- Color-coded status indicators:
  - Green: Approved/Completed/Positive
  - Yellow: Pending/Processing
  - Red: Rejected/Negative
  - Blue: Information/Links

### Mobile Responsive
- Fully responsive design for all screen sizes
- Mobile sidebar with smooth animations
- Touch-friendly buttons and controls
- Optimized tables for mobile viewing

### User Experience
- Sticky navigation bar
- Real-time search and filtering
- Visual status indicators
- Action buttons with icons
- Hover effects and transitions
- Loading states and animations

## Security Features

1. **Login Gate**: Admin authentication required
2. **Session Management**: Persistent login via localStorage
3. **Role-Based Access**: Admin-only portal
4. **Logout Functionality**: Secure logout with session clearing

## Data Management

All admin data is stored in localStorage:
- `adminAuth`: Admin authentication state
- `adminPage`: Current page state
- `users`: User database
- `investments`: Investment records
- `transactions`: Transaction history

## Integration with User Portal

The admin portal complements the user dashboard by providing:
- Oversight of all user activities
- Approval workflows for deposits/withdrawals
- Platform-wide analytics
- User management capabilities
- Configuration controls

## Development

### Run Locally
```bash
cd Growfund-Dashboard/trading-dashboard
npm start
```

### Access Admin Portal
Navigate to `/admin` route after starting the development server.

### Build for Production
```bash
npm run build
```

## Future Enhancements

Potential additions:
- Real-time notifications for pending actions
- Advanced analytics and reporting
- Bulk user operations
- Email templates management
- Audit logs
- Two-factor authentication for admins
- API integration for external services
- Automated fraud detection
- Custom dashboard widgets

## Support

For admin portal issues or questions:
- Email: support@growfund.com
- Documentation: See main README.md
