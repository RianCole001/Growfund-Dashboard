const symbolToId = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  ADA: 'cardano',
  SOL: 'solana',
  DOT: 'polkadot',
};

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
  const ids = symbols.map((s) => symbolToId[s]).filter(Boolean).join(',');
  if (!ids) return {};
  // Request multiple period changes (24h, 7d, 30d)
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h,7d,30d`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    const out = {};
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
    // Always attempt to fill missing prices using simple price endpoint
    const simple = await fetchPricesUSD(symbols);
    symbols.forEach((s) => {
      if (!out[s] && simple[s]) out[s] = { price: simple[s], change24h: undefined };
    });
    // cache latest prices locally for offline/resilience
    try { if (typeof localStorage !== 'undefined') localStorage.setItem('coingecko_prices', JSON.stringify(out)); } catch(e) {}
    return out;
  } catch (e) {
    // On error, try to return simple prices if possible
    try {
      const simple = await fetchPricesUSD(symbols);
      const out = {};
      symbols.forEach((s) => {
        if (simple[s]) out[s] = { price: simple[s], change24h: undefined };
      });
      // attempt to load cached prices if simple also empty
      if (Object.keys(out).length === 0) {
        try {
          const raw = (typeof localStorage !== 'undefined' && localStorage.getItem('coingecko_prices')) || null;
          if (raw) {
            const parsed = JSON.parse(raw);
            symbols.forEach((s) => { if (parsed[s]) out[s] = parsed[s]; });
          }
        } catch (e2) {}
      } else {
        try { if (typeof localStorage !== 'undefined') localStorage.setItem('coingecko_prices', JSON.stringify(out)); } catch(e) {}
      }
      return out;
    } catch (e2) {
      // last resort: return cached prices if present
      try {
        const raw = (typeof localStorage !== 'undefined' && localStorage.getItem('coingecko_prices')) || null;
        if (raw) {
          const parsed = JSON.parse(raw);
          const out = {};
          symbols.forEach((s) => { if (parsed[s]) out[s] = parsed[s]; });
          return out;
        }
      } catch (e3) {}
      return {};
    }
  }
}

// Fetch coin market chart + additional metrics for a single symbol
async function fetchCoinMarketChart(symbol, days = 7) {
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

const coingecko = { fetchPricesUSD, symbolToId, fetchMarketData, fetchCoinMarketChart };
export default coingecko;
