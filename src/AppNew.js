import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Settings as SettingsIcon, Menu, User } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { userAuthAPI, investmentsAPI } from './services/api';
import { useUserAuth } from './auth/UserAuthContext';
import { useDemo } from './demo/DemoContext';

import Balances from './components/Balances';
import Deposits from './components/Deposits';
import Withdrawals from './components/Withdrawals';
import Overview from './components/Overview';
import TransactionHistory from './components/TransactionHistory';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import NotificationBell from './components/NotificationBell';
import Portfolio from './components/Portfolio';
import Profile from './components/Profile';
import CryptoInvestment from './components/CryptoInvestment';
import TradeNow from './components/TradeNow';
import Earn from './components/Earn';
import CapitalPlan from './components/CapitalPlan';
import RealEstate from './components/RealEstate';
import Referrals from './components/Referrals';
import CoinModal from './components/CoinModal';
import SimpleChart from './components/SimpleChart';
import { useNotifications } from './hooks/useNotifications';


const cryptoWatchlist = [
  { symbol: 'EXACOIN', name: 'ExaCoin' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'USDT', name: 'Tether' },
];

export default function App() {
  const navigate = useNavigate();
  const { logoutUser } = useUserAuth();
  const { 
    isDemoMode, 
    demoBalance, 
    demoInvestments, 
    demoTransactions,
    demoDeposit,
    demoWithdraw,
    demoCapitalPlan,
    demoRealEstate,
    demoBuyCrypto,
    demoSellCrypto,
    disableDemoMode
  } = useDemo();
  
  // Auth state - check if user has valid token (real or demo)
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('user_access_token') || !!localStorage.getItem('demo_access_token')
  );
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({});
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [watchlistData, setWatchlistData] = useState([]);

  // UI state
  const [page, setPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinModalOpen, setCoinModalOpen] = useState(false);

  // Notification system
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    clearNotifications
  } = useNotifications();

  // Use demo data from DemoContext (backend-persisted)
  const currentDemoBalance = isDemoMode ? demoBalance : 0;
  const currentDemoInvestments = isDemoMode ? demoInvestments : [];
  const currentDemoTransactions = isDemoMode ? demoTransactions : [];
  // Real data states
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});

  const [loadingPrices, setLoadingPrices] = useState(false);

  // Fetch user data from backend on mount or when authenticated
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      const token = localStorage.getItem('user_access_token');
      if (!token && !isDemoMode) {
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setProfile(null);
          // Redirect to login if not authenticated
          navigate('/login', { replace: true });
        }
        return;
      }

      try {
        setLoading(true);
        const [userRes, profileRes, balanceRes] = await Promise.all([
          userAuthAPI.getCurrentUser(),
          userAuthAPI.getProfile(),
          userAuthAPI.getBalance(),
        ]);

        if (!isMounted) return;

        const userData = userRes.data.data || userRes.data;
        const profileDataFromAPI = profileRes.data.data || profileRes.data;
        const balanceData = balanceRes.data.data || balanceRes.data;

        const fullName = `${userData.first_name || ''} ${userData.last_name || ''}`.trim();

        const profileData = {
          name: fullName || userData.email,
          email: userData.email,
          phone: profileDataFromAPI.phone || '',
          location: profileDataFromAPI.location || '',
          occupation: profileDataFromAPI.occupation || '',
          company: profileDataFromAPI.company || '',
          website: profileDataFromAPI.website || '',
          bio: profileDataFromAPI.bio || '',
          avatar: profileDataFromAPI.avatar || null,
        };

        setUser(userData);
        setProfile(profileData);
        
        // Save profile to localStorage for persistence
        localStorage.setItem('user_profile', JSON.stringify(profileData));
        
        // Use demo balance if in demo mode, otherwise use real balance
        setBalance(isDemoMode ? currentDemoBalance : parseFloat(balanceData.balance || 0));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Token might be invalid
        if (!isDemoMode) {
          localStorage.removeItem('user_access_token');
          localStorage.removeItem('user_refresh_token');
          localStorage.removeItem('user_data');
        }
        if (isMounted) {
          setIsAuthenticated(false);
          setUser(null);
          setProfile(null);
          // Redirect to login
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [navigate, isDemoMode, currentDemoBalance]); // Removed user dependency to prevent infinite loops

  // Clear all user data when authentication status changes (for clean logout/login transitions)
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all user-specific state when not authenticated
      setUser(null);
      setProfile(null);
      setBalance(0);
      setInvestments([]);
      setTransactions([]);
      setPrices({});
      setWatchlistData([]);
    }
  }, [isAuthenticated]);

  // Fetch crypto prices from backend
  useEffect(() => {
    let isMounted = true;

    const fetchCryptoPrices = async () => {
      try {
        setLoadingPrices(true);
        
        // Always fetch real prices from backend (including admin-controlled EXACOIN)
        const response = await userAuthAPI.getCryptoPrices();
        
        if (response.data.success && isMounted) {
          setPrices(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        // Fallback to default prices if API fails
        if (isMounted) {
          const fallbackPrices = {
            EXACOIN: { price: 60.00, change24h: 45.20 },
            BTC: { price: 64444.00, change24h: 2.10 },
            ETH: { price: 3200.00, change24h: 1.80 },
            BNB: { price: 420.00, change24h: 0.50 },
            ADA: { price: 1.25, change24h: -0.80 },
            SOL: { price: 120.00, change24h: 3.20 },
            DOT: { price: 6.40, change24h: -1.20 },
            USDT: { price: 1.00, change24h: 0.01 }
          };
          setPrices(fallbackPrices);
        }
      } finally {
        if (isMounted) {
          setLoadingPrices(false);
        }
      }
    };

    fetchCryptoPrices();

    // Set up polling for price updates every 60 seconds
    const interval = setInterval(fetchCryptoPrices, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isDemoMode]);

  // Fetch user investments and transactions when authenticated (not in demo mode)
  useEffect(() => {
    let isMounted = true;

    const fetchUserInvestmentsAndTransactions = async () => {
      if (!isAuthenticated || isDemoMode) {
        // Clear data if not authenticated or in demo mode
        if (isMounted) {
          setInvestments([]);
          setTransactions([]);
        }
        return;
      }

      try {
        // Fetch both investments and transactions
        const [investmentsRes, transactionsRes] = await Promise.all([
          investmentsAPI.getInvestments(),
          userAuthAPI.getTransactions()
        ]);

        if (isMounted) {
          if (investmentsRes.data.success) {
            setInvestments(investmentsRes.data.data || []);
          }
          
          if (transactionsRes.data.success) {
            setTransactions(transactionsRes.data.data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching user investments/transactions:', error);
        if (isMounted) {
          setInvestments([]);
          setTransactions([]);
        }
      }
    };

    fetchUserInvestmentsAndTransactions();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isDemoMode, user?.email]); // Added user?.email as dependency to refetch when user changes

  // Update watchlist data when prices change
  useEffect(() => {
    const watchlist = cryptoWatchlist.map(coin => {
      const data = prices[coin.symbol] || {};
      return {
        symbol: coin.symbol,
        name: coin.name,
        price: data.price || 0,
        change24h: data.change24h || 0,
        change7d: data.change7d || 0,
      };
    });
    setWatchlistData(watchlist);
  }, [prices]);

  const addToast = (msg, type = 'success') => {
    if (type === 'success') {
      toast.success(msg, {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #10b981',
        },
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff',
        },
      });
    } else if (type === 'error') {
      toast.error(msg, {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #ef4444',
        },
      });
    } else {
      toast(msg, {
        duration: 3000,
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #3b82f6',
        },
      });
    }
  };

  const handleLogout = async () => {
    // Clear all auth data immediately
    localStorage.removeItem('user_access_token');
    localStorage.removeItem('user_refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_profile'); // Clear cached profile data
    localStorage.removeItem('last_notification_token'); // Clear notification token tracking
    
    // Clear all user-specific cached data
    localStorage.removeItem('saved_cards'); // Clear saved payment cards
    localStorage.removeItem('coingecko_prices'); // Clear cached crypto prices
    
    // Clear demo mode data if user was in demo mode
    localStorage.removeItem('demo_access_token');
    localStorage.removeItem('demo_mode');
    
    // Disable demo mode to clear demo state
    disableDemoMode();
    
    // Clear notifications
    clearNotifications();
    
    // Clear any other user-specific localStorage items
    // Note: We keep admin_crypto_prices as it's global admin settings, not user-specific
    
    // Clear all user-specific state data
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    setBalance(0);
    setInvestments([]);
    setTransactions([]);
    setPrices({});
    setWatchlistData([]);
    
    // Reset UI state
    setPage('Dashboard');
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
    setSelectedCoin(null);
    setCoinModalOpen(false);
    setLoading(false);
    setLoadingPrices(false);
    
    // Update auth context
    logoutUser();
    
    // Show toast and navigate
    addToast('Logged out successfully');
    
    // Use setTimeout to ensure state updates are processed before navigation
    setTimeout(() => {
      navigate('/login', { replace: true });
    }, 100);
  };

  const handleUpdateProfile = async (formData) => {
    try {
      // If formData is FormData object, use it directly
      // Otherwise convert to FormData
      let dataToSend = formData;
      
      if (!(formData instanceof FormData)) {
        dataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined) {
            dataToSend.append(key, formData[key]);
          }
        });
      }
      
      // Call API with FormData (don't set Content-Type header, let browser set it)
      const response = await userAuthAPI.updateProfile(dataToSend);
      
      // Update profile state with response data
      const updatedData = response.data.data || response.data;
      const fullName = `${updatedData.first_name || ''} ${updatedData.last_name || ''}`.trim();
      
      const profileData = {
        name: fullName || updatedData.email,
        email: updatedData.email,
        phone: updatedData.phone || '',
        location: updatedData.location || '',
        occupation: updatedData.occupation || '',
        company: updatedData.company || '',
        website: updatedData.website || '',
        bio: updatedData.bio || '',
        avatar: updatedData.avatar || null,
      };
      
      setProfile(profileData);
      
      // Save to localStorage for persistence - this triggers Overview to recalculate
      localStorage.setItem('user_profile', JSON.stringify(profileData));
      
      // Trigger a custom event to notify other components (storage event only works cross-tab)
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: profileData }));
      
      addToast('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      addToast('Failed to update profile', 'error');
    }
  };

  // Demo trading functions
  const handleBuyCrypto = async (cryptoData) => {
    try {
      if (isDemoMode) {
        // Use DemoContext demo functions
        await demoBuyCrypto(cryptoData);
        addToast(`Demo: Bought ${cryptoData.quantity?.toFixed(4)} ${cryptoData.coin} for $${cryptoData.amount?.toFixed(2)}`);
      } else {
        // Real crypto purchase logic would go here
        await userAuthAPI.buyCrypto(cryptoData);
        addToast(`Bought ${cryptoData.quantity?.toFixed(4)} ${cryptoData.coin} for $${cryptoData.amount?.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error buying crypto:', error);
      addToast(error.message || 'Failed to buy crypto', 'error');
    }
  };

  const handleSellCrypto = async (sellData) => {
    try {
      if (isDemoMode) {
        // Use DemoContext demo functions
        await demoSellCrypto(sellData);
        addToast(`Demo: Sold ${sellData.quantity?.toFixed(4)} ${sellData.coin} for $${sellData.amount?.toFixed(2)}`);
      } else {
        // Real crypto sale logic
        const response = await userAuthAPI.sellCrypto(sellData);
        if (response.data.success) {
          // Update balance from response
          const newBalance = parseFloat(response.data.data.new_balance) || balance;
          setBalance(newBalance);
          addToast(`Sold ${sellData.quantity?.toFixed(4)} ${sellData.coin} for $${sellData.amount?.toFixed(2)}`);
        } else {
          throw new Error(response.data.message || 'Sale failed');
        }
      }
      
      // Refresh investments and transactions to reflect the sale
      if (!isDemoMode) {
        try {
          const [investmentsRes, transactionsRes] = await Promise.all([
            userAuthAPI.getInvestments(),
            userAuthAPI.getTransactions()
          ]);
          
          if (investmentsRes.data.success) {
            setInvestments(investmentsRes.data.data || []);
          }
          
          if (transactionsRes.data.success) {
            setTransactions(transactionsRes.data.data || []);
          }
        } catch (error) {
          console.error('Error refreshing data after sale:', error);
        }
      }
    } catch (error) {
      console.error('Error selling crypto:', error);
      addToast(error.message || 'Failed to sell crypto', 'error');
      throw error; // Re-throw so Portfolio component can handle it
    }
  };

  const handleDeposit = async (amount) => {
    try {
      if (isDemoMode) {
        await demoDeposit(amount);
        addToast(`Demo: Deposited $${parseFloat(amount).toFixed(2)}`);
      } else {
        // Real deposit logic would go here
        await userAuthAPI.deposit(amount);
        addToast(`Deposited $${parseFloat(amount).toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error making deposit:', error);
      addToast(error.message || 'Failed to make deposit', 'error');
    }
  };

  const handleWithdraw = async (amount) => {
    try {
      if (isDemoMode) {
        await demoWithdraw(amount);
        addToast(`Demo: Withdrew $${parseFloat(amount).toFixed(2)}`);
      } else {
        // Real withdrawal logic would go here
        await userAuthAPI.withdraw(amount);
        addToast(`Withdrew $${parseFloat(amount).toFixed(2)}`);
      }
    } catch (error) {
      console.error('Error making withdrawal:', error);
      addToast(error.message || 'Failed to make withdrawal', 'error');
    }
  };

  const handleInvest = async (investmentData) => {
      try {
        if (isDemoMode) {
          const type = investmentData.type || '';
          if (type === 'real_estate') {
            const propertyType = investmentData.plan_type || investmentData.name || 'RE_BASIC';
            await demoRealEstate(propertyType, investmentData.amount);
          } else {
            // capital_plan (default)
            const planType = investmentData.plan_type || 'basic';
            const months = investmentData.months || 6;
            await demoCapitalPlan(planType, investmentData.amount, months);
          }
          addToast(`Demo: Invested ${parseFloat(investmentData.amount).toFixed(2)} in ${investmentData.plan || investmentData.name}`);
        } else {
          await userAuthAPI.createInvestment(investmentData);
          addToast(`Invested ${parseFloat(investmentData.amount).toFixed(2)} in ${investmentData.plan || investmentData.name}`);
        }
      } catch (error) {
        console.error('Error making investment:', error);
        addToast(error.message || 'Failed to make investment', 'error');
      }
    };

  // If not authenticated, show loading or redirect happens automatically
  if (!isAuthenticated) {
    return (
      <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Main dashboard
  return (
    <>
      <Toaster position="top-right" />
      <div className="bg-white text-gray-800 min-h-screen font-sans flex flex-col">
        {/* Navigation Bar */}
        <header className="bg-white shadow-md sticky top-0 z-50 border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo and Desktop Nav */}
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-2xl font-bold text-green-600 flex items-center whitespace-nowrap">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  GrowFund
                </span>
                <nav className="hidden lg:flex space-x-1 flex-1 overflow-x-auto">
                  {['Dashboard', 'Portfolio', 'Crypto', 'Trade Now', 'Capital Plan', 'Real Estate', 'Balances', 'Deposits', 'Withdrawals'].map((item) => (
                    <button 
                      key={item} 
                      onClick={() => setPage(item === 'Capital Plan' ? 'Capital Appreciation Plan' : item)} 
                      className={`px-2 py-2 rounded-lg text-xs transition-all duration-200 whitespace-nowrap ${
                        page === item || (item === 'Capital Plan' && page === 'Capital Appreciation Plan')
                          ? 'bg-green-600 text-white font-semibold shadow-lg' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Right Side - Balance, Icons, Menu */}
              <div className="flex items-center space-x-3">
                {/* Balance Display */}
                <div className="hidden sm:flex items-center bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                  <span className="text-xs text-gray-600 mr-2">Balance:</span>
                  <span className="text-sm font-bold text-green-600">${(isDemoMode ? currentDemoBalance : balance).toLocaleString()}</span>
                  {isDemoMode && <span className="ml-2 text-xs text-orange-500">(Demo)</span>}
                </div>

                {/* Price Update Status */}
                <div className="hidden md:flex items-center">
                  {loadingPrices ? (
                    <div className="flex items-center text-xs text-yellow-600">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="text-xs text-green-600 flex items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <NotificationBell 
                  unreadCount={unreadCount}
                  onClick={() => setNotificationsOpen(true)}
                  loading={notificationsLoading}
                />

                {/* Settings Icon */}
                <button
                  onClick={() => setPage('Settings')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-5 h-5 text-gray-700" />
                </button>

                {/* Profile Button */}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="hidden sm:flex items-center space-x-2 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-2 rounded-lg transition-colors"
                  aria-label="Profile"
                >
                  <User className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Profile</span>
                </button>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="lg:hidden bg-green-600 rounded-lg p-2 hover:bg-green-700 transition-colors duration-200 shadow-lg"
                >
                  <Menu className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Mobile Balance Bar */}
            <div className="sm:hidden mt-2 flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
              <span className="text-xs text-gray-600">Balance:</span>
              <div className="flex items-center">
                <span className="text-sm font-bold text-green-600">${(isDemoMode ? currentDemoBalance : balance).toLocaleString()}</span>
                {isDemoMode && <span className="ml-2 text-xs text-orange-500">(Demo)</span>}
              </div>
            </div>
          </div>
        </header>

        {/* Trade Now — full bleed, no padding */}
        {page === 'Trade Now' && (
          <div className="flex-grow overflow-hidden">
            <TradeNow
              balance={isDemoMode ? currentDemoBalance : balance}
              onTrade={() => {}}
              prices={prices}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`flex-grow p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row ${page === 'Trade Now' ? 'hidden' : ''}`}>
          <div className="flex-grow mr-0 lg:mr-4">
            {page === 'Dashboard' && (
              <Overview 
                balance={isDemoMode ? currentDemoBalance : balance} 
                investments={isDemoMode ? currentDemoInvestments : investments} 
                prices={prices} 
                transactions={isDemoMode ? currentDemoTransactions : transactions} 
                loading={loadingPrices} 
                onNavigate={(p) => setPage(p)} 
                userName={profile?.name || user?.email || 'User'} 
              />
            )}

            {page === 'Crypto' && (
              <CryptoInvestment 
                onSelectCoin={(coin) => { setSelectedCoin(coin); setCoinModalOpen(true); }} 
                prices={prices} 
                loading={loadingPrices} 
                onViewCoin={(coin) => { setSelectedCoin(coin); setCoinModalOpen(true); }} 
              />
            )}

            {page === 'Portfolio' && (
              <Portfolio 
                investments={isDemoMode ? currentDemoInvestments : investments} 
                balance={isDemoMode ? currentDemoBalance : balance} 
                prices={prices} 
                loading={loadingPrices}
                onSellCrypto={handleSellCrypto}
              />
            )}

            {page === 'Capital Appreciation Plan' && (
              <div className="space-y-4">
                <CapitalPlan 
                  investments={isDemoMode ? currentDemoInvestments : investments} 
                  balance={isDemoMode ? currentDemoBalance : balance} 
                  onInvest={handleInvest} 
                  onNotify={addToast} 
                />
                <SimpleChart investments={isDemoMode ? currentDemoInvestments : investments} />
              </div>
            )}

            {page === 'Real Estate' && (
              <RealEstate 
                balance={isDemoMode ? currentDemoBalance : balance} 
                onInvest={handleInvest} 
              />
            )}

            {page === 'Settings' && <Settings profile={profile} onSave={handleUpdateProfile} onNotify={addToast} />}

            {page === 'Balances' && <Balances balance={isDemoMode ? currentDemoBalance : balance} investments={isDemoMode ? currentDemoInvestments : investments} />}

            {page === 'Deposits' && <Deposits onDeposit={handleDeposit} />}

            {page === 'Withdrawals' && <Withdrawals balance={isDemoMode ? currentDemoBalance : balance} onWithdraw={handleWithdraw} />}

            {/* Coin Modal */}
            {coinModalOpen && (
              <CoinModal 
                coin={selectedCoin} 
                onClose={() => setCoinModalOpen(false)} 
                balance={isDemoMode ? currentDemoBalance : balance} 
                onBuy={handleBuyCrypto} 
                onSell={handleSellCrypto} 
              />
            )}

            {notificationsOpen && (
              <Notifications 
                notifications={notifications}
                unreadCount={unreadCount}
                onClose={() => setNotificationsOpen(false)}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onDeleteNotification={deleteNotification}
                onRefresh={refreshNotifications}
                loading={notificationsLoading}
              />
            )}

            {/* Profile Modal */}
            {profileOpen && (
              <Profile 
                profile={profile} 
                onSave={handleUpdateProfile} 
                auth={{ loggedIn: isAuthenticated, user: user?.email }} 
                onLogout={handleLogout}
                onClose={() => setProfileOpen(false)}
                transactions={isDemoMode ? currentDemoTransactions : transactions}
              />
            )}

            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50">
                <div 
                  onClick={() => setSidebarOpen(false)} 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                />
                <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out">
                  <div className="p-4 h-full">
                    <Sidebar 
                      page={page} 
                      setPage={setPage} 
                      onClose={() => setSidebarOpen(false)} 
                      onLogout={handleLogout}
                      onOpenProfile={() => setProfileOpen(true)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 bg-white border border-gray-200 p-4 rounded-lg overflow-y-auto mt-4 lg:mt-0 hidden md:block shadow-sm">
            <h3 className="text-xl font-semibold mb-4 text-green-600">Watchlist</h3>
            <ul className="space-y-2 mb-4">
              {watchlistData.map((item) => {
                const isPositive = item.change24h >= 0;
                return (
                  <li key={item.symbol} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-800">{item.symbol}</div>
                      <div className="text-xs text-gray-500">{item.name}</div>
                      <div className="text-sm font-bold text-green-600 mt-1">${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className={`flex flex-col items-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center">
                        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        <span className="text-sm font-semibold">{isPositive ? '+' : ''}{item.change24h.toFixed(2)}%</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">24h</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        </main>
      </div>
    </>
  );
}
