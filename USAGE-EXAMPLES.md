# GrowFund Enhancement Usage Examples

## Quick Reference Guide

### 1. Toast Notifications

#### Success Toast
```javascript
import toast from 'react-hot-toast';

// After successful action
toast.success('Investment successful!');
toast.success('Deposit approved');
toast.success('Profile updated');
```

#### Error Toast
```javascript
// After failed action
toast.error('Insufficient balance');
toast.error('Transaction failed');
toast.error('Invalid credentials');
```

#### Info Toast
```javascript
// General information
toast('Processing your request...');
toast('Please wait');
```

---

### 2. Confirmation Modal

#### Delete Confirmation (Danger)
```javascript
import { useState } from 'react';
import ConfirmModal from './components/ConfirmModal';
import { Trash2 } from 'lucide-react';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Delete logic here
    toast.success('Deleted successfully');
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        <Trash2 /> Delete
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Investment?"
        message="This action cannot be undone. All data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
```

#### Withdrawal Confirmation (Warning)
```javascript
<ConfirmModal
  isOpen={showWithdrawConfirm}
  onClose={() => setShowWithdrawConfirm(false)}
  onConfirm={processWithdrawal}
  title="Confirm Withdrawal"
  message={`Withdraw $${amount} to your ${method} account?`}
  confirmText="Withdraw"
  type="warning"
/>
```

#### Info Confirmation
```javascript
<ConfirmModal
  isOpen={showInfo}
  onClose={() => setShowInfo(false)}
  onConfirm={handleProceed}
  title="Update Settings"
  message="Your changes will take effect immediately."
  confirmText="Continue"
  type="info"
/>
```

---

### 3. Loading Skeletons

#### Card Skeleton
```javascript
import { CardSkeleton } from './components/LoadingSkeleton';

function StatsCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg">
      {/* Your card content */}
    </div>
  );
}
```

#### Table Skeleton
```javascript
import { TableSkeleton } from './components/LoadingSkeleton';

function UsersTable() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <TableSkeleton rows={10} cols={6} />;
  }

  return (
    <table>
      {/* Your table content */}
    </table>
  );
}
```

#### Crypto Card Skeleton
```javascript
import { CryptoCardSkeleton } from './components/LoadingSkeleton';

function CryptoGrid() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CryptoCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <div>{/* Your crypto cards */}</div>;
}
```

#### List Skeleton
```javascript
import { ListSkeleton } from './components/LoadingSkeleton';

function ActivityFeed() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <ListSkeleton items={5} />;
  }

  return <div>{/* Your list items */}</div>;
}
```

---

### 4. Empty States

#### No Investments
```javascript
import EmptyState from './components/EmptyState';
import { TrendingUp } from 'lucide-react';

function InvestmentsList({ investments, onNavigate }) {
  if (investments.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No Investments Yet"
        message="Start building your portfolio by investing in crypto, real estate, or capital appreciation plans."
        actionText="Browse Investments"
        onAction={() => onNavigate('Crypto')}
      />
    );
  }

  return <div>{/* Your investments list */}</div>;
}
```

#### No Transactions
```javascript
import { Receipt } from 'lucide-react';

function TransactionHistory({ transactions }) {
  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No Transactions"
        message="Your transaction history will appear here once you make your first deposit or investment."
        actionText="Make a Deposit"
        onAction={() => navigate('/deposits')}
      />
    );
  }

  return <div>{/* Your transactions */}</div>;
}
```

#### No Search Results
```javascript
import { Search } from 'lucide-react';

function SearchResults({ results, searchTerm }) {
  if (results.length === 0 && searchTerm) {
    return (
      <EmptyState
        icon={Search}
        title="No Results Found"
        message={`No results found for "${searchTerm}". Try a different search term.`}
      />
    );
  }

  return <div>{/* Your results */}</div>;
}
```

---

### 5. Animations with Framer Motion

#### Fade In
```javascript
import { motion } from 'framer-motion';

function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

#### Slide Up
```javascript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>
```

#### Scale In
```javascript
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Stagger Children
```javascript
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map((item, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## Complete Example: Enhanced Withdrawal Component

```javascript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from './components/ConfirmModal';
import EmptyState from './components/EmptyState';
import { ArrowUpCircle, Wallet } from 'lucide-react';

export default function Withdrawals({ balance, onWithdraw }) {
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [history, setHistory] = useState([]);

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    if (withdrawAmount < 50) {
      toast.error('Minimum withdrawal is $50');
      return;
    }

    setShowConfirm(true);
  };

  const confirmWithdraw = () => {
    onWithdraw({ amount: parseFloat(amount) });
    toast.success(`Withdrawal of $${amount} initiated`);
    setAmount('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 p-6 rounded-lg"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Withdraw Funds</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-400 block mb-2">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full bg-gray-700 text-white p-3 rounded-lg"
          />
        </div>

        <button
          onClick={handleWithdraw}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg"
        >
          <ArrowUpCircle className="inline mr-2" />
          Withdraw
        </button>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Withdrawals</h3>
        {history.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No Withdrawals Yet"
            message="Your withdrawal history will appear here"
          />
        ) : (
          <div>{/* Withdrawal history */}</div>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmWithdraw}
        title="Confirm Withdrawal"
        message={`Withdraw $${amount} from your account? This action will be processed within 1-3 business days.`}
        confirmText="Confirm Withdrawal"
        type="warning"
      />
    </motion.div>
  );
}
```

---

## Tips & Best Practices

### Toast Notifications
- Use success for completed actions
- Use error for failures
- Keep messages short and clear
- Don't overuse - only for important feedback

### Confirmation Modals
- Use for destructive actions (delete, withdraw)
- Use for important decisions
- Keep messages clear and specific
- Always provide cancel option

### Loading Skeletons
- Match the skeleton to your actual component layout
- Use during data fetching
- Better UX than spinners
- Shows content structure

### Empty States
- Always provide context
- Suggest next action
- Use appropriate icons
- Keep message encouraging

### Animations
- Keep duration short (0.2-0.4s)
- Don't overuse
- Ensure accessibility
- Test on slower devices

---

## Testing Checklist

- [ ] Toast appears and dismisses correctly
- [ ] Confirmation modal opens and closes
- [ ] Skeleton matches actual component
- [ ] Empty state shows when no data
- [ ] Animations are smooth
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation)
- [ ] Works in all browsers
