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

  // Demo transactions
  async demoDeposit(amount) {
    const response = await userApi.post('/demo/deposit/', { amount });
    return response;
  }

  async demoWithdraw(amount) {
    const response = await userApi.post('/demo/withdraw/', { amount });
    return response;
  }

  // Demo crypto trading
  async demoBuyCrypto(cryptoData) {
    const response = await userApi.post('/demo/crypto/buy/', {
      coin: cryptoData.coin,
      amount: cryptoData.amount,
      price: cryptoData.price
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

  // Demo investments
  async demoInvest(investmentData) {
    const response = await userApi.post('/demo/invest/', {
      type: investmentData.type || (investmentData.asset ? 'real_estate' : 'capital_plan'),
      name: investmentData.name || investmentData.plan || investmentData.asset,
      amount: investmentData.amount,
      rate: investmentData.rate || investmentData.monthly_rate,
      months: investmentData.months || investmentData.duration_months
    });
    return response;
  }

  async getDemoInvestments() {
    const response = await userApi.get('/demo/investments/');
    return response;
  }

  async getDemoTransactions() {
    const response = await userApi.get('/demo/transactions/');
    return response;
  }
}

export const demoAPI = new DemoAPI();