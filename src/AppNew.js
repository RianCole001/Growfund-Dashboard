import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Bell, Settings as SettingsIcon, Menu } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { userAuthAPI } from './services/api';
import { useUserAuth } from './auth/UserAuthContext';

import Profile from './components/Profile';
import CryptoInvestment from './components/CryptoInvestment';
import CapitalPlan from './components/CapitalPlan';
import RealEstate from './components/RealEstate';
import Balances from './components/Balances';
import Deposits from './components/Deposits';
import Withdrawals from './components/Withdrawals';
import SimpleChart from './components/SimpleChart';
import Overview from './components/Overview';
import TransactionHistory from './components/TransactionHistory';
import Sidebar from './components/Sidebar';
import QuickInvestButton from './components/QuickInvestButton';
import CoinModal from './components/CoinModal';
import TradeNow from './components/TradeNow';
import Earn from './components/Earn';
import Settings from './components/Settings';
import Notifications from './components/Notifications';
import Portfolio from './components/Portfolio';

const cryptoWatchlist = [
  { symbol: 'EXACOIN', name: 'ExaCoin' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'BNB', name: 'Binance Coin' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'DOT', name: 'Polkadot' },
];

export default function App() {
  const navigate = useNavigate();
  const { logoutUser } = useUserAuth();
  
  // Auth state - check if user has valid token
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [watchlistData, setWatchlistData] = useState([]);

  // UI state
  const [page, setPage] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpenEdit, setProfileOpenEdit] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinModalOpen, setCoinModalOpen] = useState(false);

  // Demo data
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  const coingecko = require('./utils/coingecko').default;

  // Fetch user data from backend on mount or when authenticated
  useEffect(() => {
    let isMounted = true;

    const fetchUserData = async () => {
      const token = localStorage.getItem('user_access_token');
      if (!token) {
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
        
        setBalance(parseFloat(balanceData.balance || 0));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Token might be invalid
        localStorage.removeItem('user_access_token');
        localStorage.removeItem('user_refresh_token');
        localStorage.removeItem('user_data');
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
  }, [navigate]);

  // Fetch watchlist data
  useEffect(() => {
    let isMounted = true;

    const fetchWatchlist = async () => {
      try {
        const coingecko = require('./utils/coingecko').default;
        const symbols = cryptoWatchlist.map(c => c.symbol);
        const marketData = await coingecko.fetchMarketData(symbols);
        
        if (!isMounted) return;

        const watchlist = cryptoWatchlist.map(coin => {
          const data = marketData[coin.symbol] || {};
          return {
            symbol: coin.symbol,
            name: coin.name,
            price: data.price || 0,
            change24h: data.change24h || 0,
            change7d: data.change7d || 0,
          };
        });

        setWatchlistData(watchlist);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
      }
    };

    fetchWatchlist();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWatchlist, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
    
    // Update state
    setIsAuthenticated(false);
    setUser(null);
    setProfile(null);
    setPage('Dashboard');
    
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
      <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
        {/* Navigation Bar */}
        <header className="bg-gray-800 shadow-lg sticky top-0 z-50 border-b border-gray-700">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              {/* Logo and Desktop Nav */}
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-2xl font-bold text-green-500 flex items-center whitespace-nowrap">
                  <TrendingUp className="w-6 h-6 mr-2" />
                  GrowFund
                </span>
                <nav className="hidden lg:flex space-x-1 flex-1 overflow-x-auto">
                  {['Dashboard', 'Portfolio', 'Profile', 'Crypto', 'Trade Now', 'Earn', 'Capital Plan', 'Real Estate', 'Balances', 'Deposits', 'Withdrawals', 'Transactions'].map((item) => (
                    <button 
                      key={item} 
                      onClick={() => setPage(item === 'Capital Plan' ? 'Capital Appreciation Plan' : item)} 
                      className={`px-2 py-2 rounded-lg text-xs transition-all duration-200 whitespace-nowrap ${
                        page === item || (item === 'Capital Plan' && page === 'Capital Appreciation Plan')
                          ? 'bg-green-500 text-white font-semibold shadow-lg' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
                <div className="hidden sm:flex items-center bg-gray-700 px-3 py-2 rounded-lg">
                  <span className="text-xs text-gray-400 mr-2">Balance:</span>
                  <span className="text-sm font-bold text-green-400">${balance.toLocaleString()}</span>
                </div>

                {/* Price Update Status */}
                <div className="hidden md:flex items-center">
                  {loadingPrices ? (
                    <div className="flex items-center text-xs text-yellow-400">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-400 mr-2"></div>
                      Updating...
                    </div>
                  ) : (
                    <div className="text-xs text-green-400 flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      Live
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <button
                  onClick={() => setNotificationsOpen(true)}
                  className="relative p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Settings Icon */}
                <button
                  onClick={() => setPage('Settings')}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Settings"
                >
                  <SettingsIcon className="w-5 h-5 text-gray-300" />
                </button>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="lg:hidden bg-green-500 rounded-lg p-2 hover:bg-green-600 transition-colors duration-200 shadow-lg"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Balance Bar */}
            <div className="sm:hidden mt-2 flex items-center justify-between bg-gray-700 px-3 py-2 rounded-lg">
              <span className="text-xs text-gray-400">Balance:</span>
              <span className="text-sm font-bold text-green-400">${balance.toLocaleString()}</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-grow mr-0 lg:mr-4">
            {page === 'Dashboard' && (
              <Overview balance={balance} investments={investments} prices={prices} transactions={transactions} loading={loadingPrices} onNavigate={(p) => setPage(p)} userName={profile?.name || user?.email || 'User'} profile={profile} />
            )}

            {page === 'Crypto' && <CryptoInvestment onSelectCoin={(coin) => { setSelectedCoin(coin); setCoinModalOpen(true); }} prices={prices} loading={loadingPrices} onViewCoin={(coin) => { setSelectedCoin(coin); setCoinModalOpen(true); }} />}

            {page === 'Portfolio' && (
              <Portfolio 
                investments={investments} 
                balance={balance} 
                prices={prices} 
                loading={loadingPrices} 
              />
            )}

            {page === 'Trade Now' && <TradeNow balance={balance} onTrade={() => {}} prices={prices} />}

            {page === 'Earn' && <Earn userEmail={profile?.email} onNotify={addToast} />}

            {page === 'Settings' && <Settings profile={profile} onSave={handleUpdateProfile} onNotify={addToast} />}

            {page === 'Profile' && (
              <Profile 
                profile={profile} 
                onSave={handleUpdateProfile} 
                auth={{ loggedIn: isAuthenticated, user: user?.email }} 
                onLogout={handleLogout}
                openEdit={profileOpenEdit} 
                onOpenHandled={() => setProfileOpenEdit(false)} 
              />
            )}

            <QuickInvestButton onClick={() => setPage('Capital Appreciation Plan')} />

            {coinModalOpen && (
              <CoinModal 
                coin={selectedCoin} 
                onClose={() => setCoinModalOpen(false)} 
                balance={balance} 
                onBuy={() => setCoinModalOpen(false)} 
                onSell={() => setCoinModalOpen(false)} 
              />
            )}

            {notificationsOpen && (
              <Notifications onClose={() => setNotificationsOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            {sidebarOpen && (
              <div className="fixed inset-0 z-50">
                <div 
                  onClick={() => setSidebarOpen(false)} 
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                />
                <div className="absolute left-0 top-0 h-full w-72 bg-gray-800 shadow-2xl transform transition-transform duration-300 ease-out">
                  <div className="p-4 h-full">
                    <Sidebar page={page} setPage={setPage} onClose={() => setSidebarOpen(false)} />
                  </div>
                </div>
              </div>
            )}

            {page === 'Capital Appreciation Plan' && (
              <div className="space-y-4">
                <CapitalPlan investments={investments} balance={balance} onInvest={() => {}} onNotify={addToast} />
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Your Investments</h3>
                  {investments.length === 0 && <div className="text-sm text-gray-300">No investments yet.</div>}
                </div>
                <SimpleChart investments={investments} />
              </div>
            )}

            {page === 'Real Estate' && <RealEstate onInvest={() => {}} />}

            {page === 'Balances' && <Balances balance={balance} investments={investments} />}

            {page === 'Deposits' && <Deposits onDeposit={() => {}} />}

            {page === 'Withdrawals' && <Withdrawals balance={balance} onWithdraw={() => {}} />}

            {page === 'Transactions' && <TransactionHistory transactions={transactions} />}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-64 bg-gray-800 p-4 rounded-lg overflow-y-auto mt-4 lg:mt-0 hidden md:block">
            <h3 className="text-xl font-semibold mb-4 text-blue-400">Watchlist</h3>
            <ul className="space-y-2 mb-4">
              {watchlistData.map((item) => {
                const isPositive = item.change24h >= 0;
                return (
                  <li key={item.symbol} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.symbol}</div>
                      <div className="text-xs text-gray-400">{item.name}</div>
                      <div className="text-sm font-bold text-blue-300 mt-1">${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className={`flex flex-col items-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center">
                        {isPositive ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
                        <span className="text-sm font-semibold">{isPositive ? '+' : ''}{item.change24h.toFixed(2)}%</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">24h</div>
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
