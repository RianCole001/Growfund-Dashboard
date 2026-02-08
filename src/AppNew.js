import React, { useState, useEffect, useCallback } from 'react';
import { Search, Menu, TrendingUp, TrendingDown } from 'lucide-react';

import Profile from './components/Profile';
import CryptoInvestment from './components/CryptoInvestment';
import InvestmentPlan from './components/InvestmentPlan';
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
import { NavLink } from 'react-router-dom';
import AnimatedNumber  from './components/AnimatedNumber';




const watchlistItems = [
  { symbol: 'NIFTY', price: 23467, change: -0.53, color: 'red' },
  { symbol: 'BANKNIFTY', price: 51613.35, change: -0.27, color: 'red' },
  { symbol: 'SPX', price: 5464.61, change: -0.16, color: 'red' },
  { symbol: 'BTCUSD', price: 64444, change: 0.33, color: 'green' },
  { symbol: 'VIX', price: 13.2, change: -0.6, color: 'red' },
  { symbol: 'XAUUSD', price: 2321.875, change: -1.62, color: 'red' },
  { symbol: 'WTICOUS', price: 80.952, change: -0.83, color: 'red' },
  { symbol: 'USDJPY', price: 159.76, change: 0.54, color: 'green' },
];

export default function App() {
  const storage = require('./utils/storage').default;
  const [page, setPage] = useState(storage.get('page', 'Dashboard'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // persist page changes
  const setPageAndPersist = (p) => { setPage(p); storage.set('page', p); };
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [investments, setInvestments] = useState(storage.get('investments', []));
  const [balance, setBalance] = useState(storage.get('balance', 20000)); // load demo balance or stored
  const [profile, setProfile] = useState(storage.get('profile', { name: 'Jane Doe', email: 'jane@example.com', avatar: null, phone: '', location: '', occupation: '', company: '', website: '', bio: '' }));
  const [transactions, setTransactions] = useState(storage.get('transactions', []));
  const [auth, setAuth] = useState(storage.get('auth', { loggedIn: false, lastLogin: null }));
  const [profileOpenEdit, setProfileOpenEdit] = useState(false);

  const handleProfileOpenHandled = useCallback(() => {
    setProfileOpenEdit(false);
  }, []);

  const navigateTo = (p, opts = {}) => { setPageAndPersist(p); if (p === 'Profile' && opts && opts.openEdit) setProfileOpenEdit(true); };


  const handleLogin = (payload) => {
    const now = new Date().toISOString();
    const nextAuth = { loggedIn: true, lastLogin: now, user: payload.email };
    setAuth(nextAuth);
    storage.set('auth', nextAuth);
    addToast(`Logged in as ${payload.email}`);
  };

  const handleLogout = () => {
    setAuth({ loggedIn: false, lastLogin: null });
    storage.set('auth', { loggedIn: false, lastLogin: null });
    addToast('Logged out');
  };
  const [prices, setPrices] = useState({});
  const [toasts, setToasts] = useState([]);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [coinModalOpen, setCoinModalOpen] = useState(false);
  const coingecko = require('./utils/coingecko').default;

  const addToast = (msg) => {
    setToasts((t) => [...t, { id: Date.now(), msg }]);
    setTimeout(() => setToasts((t) => t.slice(1)), 3500);
  };

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setPageAndPersist('Capital Appreciation Plan');
    setSidebarOpen(false);
  };

  const persistAll = (next) => {
    try {
      storage.set('investments', next.investments);
      storage.set('balance', next.balance);
      storage.set('page', next.page);
      storage.set('profile', next.profile);
      if (next.transactions) storage.set('transactions', next.transactions);
    } catch (e) {}
  };

  const handleInvest = async (payload) => {
    let enhanced = payload;
    if (payload.coin) {
      try {
        const p = await coingecko.fetchPricesUSD([payload.coin]);
        const price = p[payload.coin];
        if (price) {
          enhanced = { ...payload, priceAtPurchase: price, quantity: (payload.amount || 0) / price };
        }
      } catch (e) {}
    }
    const nextInvestments = [enhanced, ...investments];
    const nextBalance = Math.max(0, balance - (payload.amount || 0));
    setInvestments(nextInvestments);
    setBalance(nextBalance);
    const tx = { type: 'Invest', amount: payload.amount, coin: payload.coin, asset: payload.asset, date: new Date().toISOString(), details: payload.plan || '' };
    const nextTransactions = [tx, ...transactions];
    setTransactions(nextTransactions);
    persistAll({ investments: nextInvestments, balance: nextBalance, page, profile, transactions: nextTransactions });
    addToast(`Invested $${payload.amount} in ${payload.coin || payload.asset || payload.name}`);
  };

  const handleRealEstateInvest = (payload) => {
    const inv = { coin: payload.asset || payload.name, amount: payload.amount, plan: 'Real Estate', date: new Date().toISOString() };
    const nextInvestments = [inv, ...investments];
    const nextBalance = Math.max(0, balance - (payload.amount || 0));
    setInvestments(nextInvestments);
    setBalance(nextBalance);
    const tx = { type: 'Invest', amount: payload.amount, asset: payload.name, date: new Date().toISOString(), details: 'Real Estate' };
    const nextTransactions = [tx, ...transactions];
    setTransactions(nextTransactions);
    persistAll({ investments: nextInvestments, balance: nextBalance, page, profile, transactions: nextTransactions });
    addToast(`Invested $${payload.amount} in ${payload.name}`);
  };

  // Support selling assets (client-side simulated). Reduces investments for the coin FIFO and credits balance.
  const handleSell = (payload) => {
    const sellAmountRequested = Number(payload.amount || 0);
    if (!payload.coin || sellAmountRequested <= 0) {
      addToast('Invalid sell amount');
      return;
    }
    const totalHeld = investments.filter(i => i.coin === payload.coin).reduce((s, i) => s + (i.amount || 0), 0);
    const sellAmount = Math.min(sellAmountRequested, totalHeld);
    if (sellAmount <= 0) {
      addToast(`No holdings to sell for ${payload.coin}`);
      return;
    }
    let remaining = sellAmount;
    const updated = [];
    for (let i = 0; i < investments.length; i++) {
      const inv = { ...investments[i] };
      if (remaining > 0 && inv.coin === payload.coin) {
        const take = Math.min(inv.amount || 0, remaining);
        inv.amount = Math.max(0, (inv.amount || 0) - take);
        remaining -= take;
      }
      if ((inv.amount || 0) > 0) updated.push(inv);
    }
    const nextInvestments = updated;
    const nextBalance = balance + sellAmount;
    setInvestments(nextInvestments);
    setBalance(nextBalance);
    const tx = { type: 'Sell', amount: sellAmount, coin: payload.coin, date: new Date().toISOString(), details: '' };
    const nextTransactions = [tx, ...transactions];
    setTransactions(nextTransactions);
    persistAll({ investments: nextInvestments, balance: nextBalance, page, profile, transactions: nextTransactions });
    addToast(`Sold $${sellAmount} of ${payload.coin}`);
  };

  const handleDeposit = ({ amount }) => {
    const nextBalance = balance + amount;
    setBalance(nextBalance);
    const tx = { type: 'Deposit', amount, date: new Date().toISOString(), details: '' };
    const nextTransactions = [tx, ...transactions];
    setTransactions(nextTransactions);
    persistAll({ investments, balance: nextBalance, page, profile, transactions: nextTransactions });
    addToast(`Deposited $${amount}`);
  };

  const handleWithdraw = ({ amount }) => {
    const nextBalance = Math.max(0, balance - amount);
    setBalance(nextBalance);
    const tx = { type: 'Withdraw', amount, date: new Date().toISOString(), details: '' };
    const nextTransactions = [tx, ...transactions];
    setTransactions(nextTransactions);
    persistAll({ investments, balance: nextBalance, page, profile, transactions: nextTransactions });
    addToast(`Withdrew $${amount}`);
  };

  const handleUpdateProfile = (nextProfile) => {
    setProfile(nextProfile);
    persistAll({ investments, balance, page, profile: nextProfile });
    addToast('Profile updated');
  };

  useEffect(() => {
    let mounted = true;
    const fetchMarket = async () => {
      const coins = [...new Set(investments.filter((i) => i.coin).map((i) => i.coin))];
      // ensure we still show popular coins even if not invested
      const base = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'];
      const toFetch = Array.from(new Set([...base, ...coins]));
      if (toFetch.length === 0) return;
      try {
        setLoadingPrices(true);
        const p = await coingecko.fetchMarketData(toFetch);
        if (!mounted) return;
        setPrices(p);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetchMarket();
    const id = setInterval(fetchMarket, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, [investments, coingecko]);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <header className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="text-2xl font-bold text-blue-400">GrowFund</span>
          <nav className="hidden md:flex space-x-4">
            {['Dashboard', 'Profile', 'Crypto', 'Capital Appreciation Plan', 'Real Estate', 'Balances', 'Deposits', 'Withdrawals', 'Transactions'].map((item) => (
              <button key={item} onClick={() => setPageAndPersist(item)} className={`text-gray-300 hover:text-blue-400 transition-colors duration-200 ${page === item ? 'text-blue-300 font-semibold' : ''}`}>{item}</button>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input type="text" placeholder="Search" className="bg-gray-700 text-white rounded-full py-2 px-4 pl-10 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200" />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="text-sm text-gray-300 hidden sm:block">Balance: <strong className="text-white">${balance.toLocaleString()}</strong></div>
          <div className="flex items-center space-x-2">
            {loadingPrices ? (
              <div className="text-xs text-gray-300">Updating prices...</div>
            ) : (
              <div className="text-xs text-gray-300">Prices updated</div>
            )}
            <button onClick={() => setSidebarOpen(true)} className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors duration-200 md:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="text-sm text-gray-300 hidden md:block">Balance: <strong className="text-white">${balance.toLocaleString()}</strong></div>
        </div>
      </header>

      <main className="flex-grow p-4 lg:p-6 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-grow mr-0 lg:mr-4">
          {page === 'Dashboard' && (
            <Overview balance={balance} investments={investments} prices={prices} transactions={transactions} loading={loadingPrices} onNavigate={navigateTo} />
          )}

          {page === 'Crypto' && <CryptoInvestment onSelectCoin={handleSelectCoin} prices={prices} loading={loadingPrices} onViewCoin={(coin) => { setSelectedCoin(coin); setCoinModalOpen(true); }} />}

          <QuickInvestButton onClick={() => setPageAndPersist('Capital Appreciation Plan')} />

          {typeof coinModalOpen !== 'undefined' && coinModalOpen && (
            <CoinModal coin={selectedCoin} onClose={() => setCoinModalOpen(false)} balance={balance} onBuy={(payload) => { handleInvest({ coin: payload.coin, amount: payload.amount, name: payload.name }); setCoinModalOpen(false); }} onSell={(payload) => { handleSell(payload); setCoinModalOpen(false); }} />
          )}

          {/* Mobile slide-over sidebar */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40">
              <div onClick={() => setSidebarOpen(false)} className="absolute inset-0 bg-black opacity-40" />
              <div className="absolute left-0 top-0 h-full w-64 bg-gray-800 p-4 overflow-auto">
                <button onClick={() => setSidebarOpen(false)} className="mb-4 bg-gray-700 px-3 py-2 rounded">Close</button>
                <Sidebar page={page} setPage={setPageAndPersist} onClose={() => setSidebarOpen(false)} />
              </div>
            </div>
          )}
          {page === 'Profile' && <Profile profile={profile} onSave={handleUpdateProfile} auth={auth} onLogin={handleLogin} onLogout={handleLogout} openEdit={profileOpenEdit} onOpenHandled={handleProfileOpenHandled} />}
          {page === 'Crypto' && <CryptoInvestment onSelectCoin={handleSelectCoin} prices={prices} onViewCoin={(coin) => { setSelectedCoin(coin); setCoinModalOpen(true); }} />}

          <QuickInvestButton onClick={() => setPageAndPersist('Capital Appreciation Plan')} />

          {typeof coinModalOpen !== 'undefined' && coinModalOpen && (
            <CoinModal coin={selectedCoin} onClose={() => setCoinModalOpen(false)} onInvest={(coin) => { handleSelectCoin(coin); }} />
          )}
          {page === 'Capital Appreciation Plan' && (
            <div className="space-y-4">
              <CapitalPlan investments={investments} balance={balance} onInvest={handleInvest} onNotify={addToast} />

              <div className="bg-gray-800 p-4 rounded-lg shadow-lg text-white">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Your Investments</h3>
                {investments.length === 0 && <div className="text-sm text-gray-300">No investments yet.</div>}
                <ul className="space-y-2">
                  {investments.map((inv, idx) => (
                    <li key={idx} className="flex justify-between bg-gray-700 p-2 rounded">
                      <div>
                        <div className="font-medium">{inv.coin || inv.asset || inv.name}</div>
                        <div className="text-sm text-gray-400">{inv.plan || ''} • {new Date(inv.date).toLocaleString()}</div>
                      </div>
                      <div className="text-green-400">${(inv.amount || 0).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <SimpleChart investments={investments} />
            </div>
          )}

          {page === 'Real Estate' && <RealEstate onInvest={handleRealEstateInvest} />}

          {page === 'Balances' && <Balances balance={balance} investments={investments} />}

          {page === 'Deposits' && <Deposits onDeposit={handleDeposit} />}

          {page === 'Withdrawals' && <Withdrawals balance={balance} onWithdraw={handleWithdraw} />}

          {page === 'Transactions' && <TransactionHistory transactions={transactions} />}
        </div>

        <div className="fixed right-4 top-20 space-y-2 z-50">
          {toasts.map((t) => (
            <div key={t.id} className="bg-gray-800 text-white px-4 py-2 rounded shadow">{t.msg}</div>
          ))}
        </div>

        <aside className="w-full lg:w-64 bg-gray-800 p-4 rounded-lg overflow-y-auto mt-4 lg:mt-0 hidden md:block">
          <h3 className="text-xl font-semibold mb-4 text-blue-400">Watchlist</h3>
          <ul className="space-y-2 mb-4">
            {watchlistItems.map((item) => (
              <li key={item.symbol} className="flex justify-between items-center p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200">
                <div>
                  <span className="font-medium">{item.symbol}</span>
                  <span className="block text-sm text-gray-400">{item.price.toLocaleString()}</span>
                </div>
                <div className={`flex items-center ${item.color === 'green' ? 'text-green-400' : 'text-red-400'}`}>
                  {item.color === 'green' ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                  <span>{item.change > 0 ? '+' : ''}{item.change}%</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="bg-gray-700 p-3 rounded text-sm text-gray-300">
            <div className="mb-2">Quick Actions</div>
            <div className="flex flex-col space-y-2">
              <button onClick={() => setPageAndPersist('Deposits')} className="bg-green-600 p-2 rounded">Deposit</button>
              <button onClick={() => setPageAndPersist('Withdrawals')} className="bg-yellow-600 p-2 rounded">Withdraw</button>
              <button onClick={() => setPageAndPersist('Investments')} className="bg-blue-600 p-2 rounded">Invest Now</button>
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <button onClick={() => setSidebarOpen(true)} className="w-full bg-gray-600 p-2 rounded">Open Menu</button>
          </div>
        </aside>
      </main>
    </div>
  );
}
