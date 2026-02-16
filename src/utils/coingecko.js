const symbolToId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  ADA: 'cardano',
  SOL: 'solana',
  DOT: 'polkadot',
  EXACOIN: 'exacoin', // Placeholder for demo
};

// Generate bullish trend data for EXACOIN (demo coin)
function generateExacoinBullishData(days = 7) {
  const data = [];
  const startPrice = 60.00; // Set EXA coin base price to $60
  let currentPrice = startPrice;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i - 1));
    
    // Generate bullish trend with upward bias
    const dailyChange = (Math.random() * 0.08) + 0.02; // 2-10% daily increase
    currentPrice = currentPrice * (1 + dailyChange);
    
    data.push([date.getTime(), currentPrice]);
  }
  
  return data;
}

// Generate bullish market data for EXACOIN
function generateExacoinMarketData() {
  const startPrice = 60.00; // Set EXA coin base price to $60
  const currentPrice = startPrice * 1.45; // 45% increase from base
  
  return {
    price: currentPrice,
    change24h: 8.5,
    change7d: 45.2,
    change30d: 120.5,
    market_cap: currentPrice * 1000000000, // Mock market cap
  };
}

async function fetchPricesUSD(symbols = []) {
  const ids = symbols.map((s) => symbolToId[s]).filter(Boolean).join(',');
  if (!ids) return {};
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const out = {};
    symbols.forEach((s) => {
      const id = symbolToId[s];
      if (id && json[id] && json[id].usd) out[s] = json[id].usd;
    });
    return out;
  } catch (e) {
    return {};
  }
}

// Fetch market data including 24h price change for provided symbols
async function fetchMarketData(symbols = []) {
  const out = {};
  
  // Handle EXACOIN separately
  if (symbols.includes('EXACOIN')) {
    out['EXACOIN'] = generateExacoinMarketData();
  }
  
  const nonExaSymbols = symbols.filter(s => s !== 'EXACOIN');
  const ids = nonExaSymbols.map((s) => symbolToId[s]).filter(Boolean).join(',');
  
  if (ids) {
    // Request multiple period changes (24h, 7d, 30d)
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h,7d,30d`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      if (json && json.length) {
        json.forEach((entry) => {
          // find symbol from id
          const sym = Object.keys(symbolToId).find(k => symbolToId[k] === entry.id);
          if (sym) {
            out[sym] = {
              price: entry.current_price,
              change24h: entry.price_change_percentage_24h,
              change7d: entry.price_change_percentage_7d_in_currency || entry.price_change_percentage_7d,
              change30d: entry.price_change_percentage_30d_in_currency || entry.price_change_percentage_30d,
            };
          }
        });
      }
    } catch (e) {
      // Fallback to simple prices
      try {
        const simple = await fetchPricesUSD(nonExaSymbols);
        nonExaSymbols.forEach((s) => {
          if (!out[s] && simple[s]) out[s] = { price: simple[s], change24h: undefined };
        });
      } catch (e2) {}
    }
  }
  
  // Cache latest prices locally for offline/resilience
  try { if (typeof localStorage !== 'undefined') localStorage.setItem('coingecko_prices', JSON.stringify(out)); } catch(e) {}
  return out;
}

// Fetch coin market chart + additional metrics for a single symbol
async function fetchCoinMarketChart(symbol, days = 7) {
  // Handle EXACOIN specially with bullish demo data
  if (symbol === 'EXACOIN') {
    const prices = generateExacoinBullishData(days);
    const marketData = generateExacoinMarketData();
    return {
      prices,
      current_price: marketData.price,
      market_cap: marketData.market_cap,
      change24h: marketData.change24h,
    };
  }
  
  const id = symbolToId[symbol];
  if (!id) return {};
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=${days}`;
    const res = await fetch(url);
    const json = await res.json();
    // fetch coin simple data for metrics
    const url2 = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&price_change_percentage=24h`;
    const res2 = await fetch(url2);
    const json2 = await res2.json();
    const info = json2 && json2[0] ? json2[0] : {};
    const lastPrice = json.prices && json.prices.length ? json.prices[json.prices.length - 1][1] : undefined;
    return { prices: json.prices || [], current_price: info.current_price || lastPrice, market_cap: info.market_cap, change24h: info.price_change_percentage_24h };
  } catch (e) {
    return {};
  }
}

const coingecko = { fetchPricesUSD, symbolToId, fetchMarketData, fetchCoinMarketChart, generateExacoinBullishData, generateExacoinMarketData };
export default coingecko;
