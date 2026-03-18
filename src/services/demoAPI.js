import userApi from './api';

/**
 * Demo API service for backend-persisted demo trading
 * All demo data is stored in the backend database and persists across sessions
 */
class DemoAPI {
  // Demo account management
  async getDemoAccount() {
    const response = await userApi.get('/demo/account/');
    return response;
  }

  async resetDemoAccount() {
    const response = await userApi.post('/demo/account/');
    return response;
  }

  async getDemoBalance() {
    const response = await userApi.get('/demo/balance/');
    return response;
  }

  // Demo portfolio (replaces getDemoInvestments)
  async getDemoPortfolio() {
    const response = await userApi.get('/demo/portfolio/');
    return response;
  }

  // Demo transactions — supports limit, offset, type filter
  async getDemoTransactions(params = {}) {
    const response = await userApi.get('/demo/transactions/', { params });
    return response;
  }

  // Demo deposits/withdrawals
  async demoDeposit(amount) {
    const response = await userApi.post('/demo/deposit/', { amount });
    return response;
  }

  async demoWithdraw(amount) {
    const response = await userApi.post('/demo/withdraw/', { amount });
    return response;
  }

  // Demo crypto trading — backend fetches price server-side, never send price from frontend
  async demoBuyCrypto(cryptoData) {
    const response = await userApi.post('/demo/crypto/buy/', {
      coin: cryptoData.coin,
      amount: cryptoData.amount,
    });
    return response;
  }

  async demoSellCrypto(sellData) {
    const response = await userApi.post('/demo/crypto/sell/', {
      coin: sellData.coin,
      quantity: sellData.quantity,
      price: sellData.price
    });
    return response;
  }

  // Demo capital plan investment
  async demoCapitalPlan(plan_type, amount, months) {
    const response = await userApi.post('/demo/capital-plan/', {
      plan_type,
      amount,
      months,
    });
    return response;
  }

  // Demo real estate investment
  async demoRealEstate(property_type, amount) {
    const response = await userApi.post('/demo/real-estate/', {
      property_type,
      amount,
    });
    return response;
  }
}

export const demoAPI = new DemoAPI();
