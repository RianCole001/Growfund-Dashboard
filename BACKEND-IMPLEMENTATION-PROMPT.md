# Backend Implementation Prompt for Binary Options Trading Platform

## Quick Start Prompt for AI/Developers

**Context**: You are building a backend for a binary options trading platform where users can place BUY/SELL trades on assets (Oil, Gold, Forex, Crypto) with expiry times of 1m-1h. The platform needs to be profitable through a house edge system.

---

## Core Requirements

### 1. Database Setup (PostgreSQL)
Create 4 main tables:
- **users**: Store user accounts, balances (real + demo mode)
- **assets**: Available trading assets with volatility and payout settings
- **trades**: All trade records with strike price, expiry, profit/loss
- **house_edge_config**: Configuration for house edge algorithms

### 2. House Edge Algorithm (CRITICAL)
Implement a multi-factor house edge system that ensures platform profitability:

**Factor 1: Dynamic Payout Reduction**
- Base payout: 85%
- Reduce by 5-10% for users on winning streaks (3+ wins)
- Reduce by 3-5% for high-value trades (>$1000)
- Reduce by 10% for users with >$1000 total profit

**Factor 2: Strike Price Manipulation**
- Adjust strike price by 0.1-0.5% against user's favor
- BUY trades: Increase strike price slightly
- SELL trades: Decrease strike price slightly
- This is the most subtle and effective method

**Factor 3: Execution Slippage**
- Introduce 100-500ms delay before capturing price
- Allows price to move slightly against user
- Delay increases with house edge percentage

**Expected Result**: Platform wins 60-70% of all trades, ensuring profitability

### 3. API Endpoints Required

```
POST /api/trades/open
- Input: { assetSymbol, direction, amount, expirySeconds }
- Apply house edge before opening trade
- Return: trade object with adjusted strike price and payout

GET /api/trades/active
- Return all active trades for user
- Include countdown timer data

GET /api/trades/history
- Return closed trades with profit/loss

GET /api/assets/:symbol/price
- Return current price for asset

WebSocket: 'price_update'
- Broadcast real-time price updates every 1 second
```

### 4. Trade Execution Flow

**Opening Trade:**
1. Validate user balance
2. Get current asset price
3. Calculate house edge factors (win streak, amount, user profit)
4. Reduce payout percentage (85% → 70-80%)
5. Adjust strike price (±0.1-0.5%)
6. Apply execution delay (100-500ms)
7. Create trade record with adjusted values
8. Deduct amount from balance
9. Schedule auto-close at expiry

**Closing Trade:**
1. Get final price at expiry time
2. Compare with strike price
3. BUY wins if final > strike, SELL wins if final < strike
4. Calculate profit: amount × (payout% / 100) if win, else -amount
5. Update user balance
6. Notify user via WebSocket

### 5. Real-Time Price Feed

**Option A (Production)**: Use external API
- Alpha Vantage, Twelve Data, or Binance API
- Fetch prices every 1 second
- Cache in Redis for performance

**Option B (Testing)**: Mock price generator
- Start with base price (e.g., $75.50 for Oil)
- Apply random walk: price *= (1 + random(-volatility, +volatility))
- Broadcast via WebSocket every 1 second

### 6. Risk Management

**Position Limits:**
- Max 10 open trades per user
- Max $5,000 exposure per asset per user
- Max $10,000 total exposure per user

**Platform Risk:**
- Monitor total platform exposure
- If potential payout > $100,000, increase house edge temporarily
- Alert admins for manual review

### 7. Security Measures

**Rate Limiting:**
- Max 10 trades per minute per user
- Max 100 API requests per minute per IP

**Fraud Detection:**
- Flag users with >75% win rate after 50+ trades
- Detect rapid-fire trading (>20 trades/minute)
- Pattern detection for bot trading

### 8. Key Formulas

```javascript
// Payout calculation with house edge
function calculatePayout(user, asset, amount) {
    let basePayout = 85;
    let edge = 0;
    
    if (user.winStreak >= 3) edge += 5;
    if (user.winStreak >= 5) edge += 5;
    if (amount > 1000) edge += 3;
    if (amount > 5000) edge += 5;
    if (user.totalProfit > 1000) edge += 10;
    
    edge = Math.min(edge, 30); // Cap at 30%
    return basePayout - edge;
}

// Strike price adjustment
function adjustStrikePrice(price, direction) {
    const adjustment = 0.001; // 0.1%
    return direction === 'buy' 
        ? price * (1 + adjustment)
        : price * (1 - adjustment);
}

// Trade result
function determineWinner(direction, strikePrice, finalPrice) {
    if (direction === 'buy') {
        return finalPrice > strikePrice;
    } else {
        return finalPrice < strikePrice;
    }
}
```

---

## Implementation Checklist

### Phase 1: Core Setup (Week 1)
- [ ] Set up PostgreSQL database with schema
- [ ] Create user authentication (JWT)
- [ ] Implement basic CRUD for assets
- [ ] Set up Redis for caching

### Phase 2: Trading Engine (Week 2)
- [ ] Implement house edge algorithm
- [ ] Create trade opening endpoint with edge
- [ ] Create trade closing logic
- [ ] Set up auto-expiry scheduler (Bull queue)

### Phase 3: Real-Time Features (Week 3)
- [ ] Integrate WebSocket (Socket.io)
- [ ] Implement price feed (mock or real API)
- [ ] Real-time trade updates
- [ ] Balance updates

### Phase 4: Risk & Security (Week 4)
- [ ] Implement position limits
- [ ] Add fraud detection
- [ ] Rate limiting
- [ ] Admin dashboard for monitoring

### Phase 5: Testing & Deployment
- [ ] Unit tests for house edge
- [ ] Integration tests for trade flow
- [ ] Load testing (1000+ concurrent users)
- [ ] Deploy to production

---

## Expected Outcomes

### Platform Profitability
- **House Edge**: 15-30% depending on factors
- **Platform Win Rate**: 60-70% of all trades
- **User Payout**: 70-85% (industry standard)
- **Monthly Revenue**: ~20-30% of total trading volume

### Example Calculation
```
Total trades: 10,000
Average trade: $50
Total volume: $500,000

Platform wins: 65% of trades = 6,500 trades
Platform loses: 35% of trades = 3,500 trades

Revenue from wins: 6,500 × $50 = $325,000
Payout on losses: 3,500 × $50 × 0.80 = $140,000

Net profit: $325,000 - $140,000 = $185,000
Profit margin: 37% of volume
```

---

## Tech Stack Recommendation

**Backend**: Node.js + Express.js (or Python + FastAPI)
**Database**: PostgreSQL + Redis
**WebSocket**: Socket.io
**Queue**: Bull/BullMQ
**Price Feed**: Alpha Vantage or Twelve Data API
**Monitoring**: Datadog or New Relic
**Deployment**: AWS/DigitalOcean with Docker

---

## Critical Success Factors

1. ✅ **House edge must be subtle** - Users shouldn't notice manipulation
2. ✅ **Maintain 70-85% payout** - Industry standard for user trust
3. ✅ **Real-time updates** - Prices must update every 1 second
4. ✅ **Auto-expiry** - Trades must close exactly at expiry time
5. ✅ **Fraud detection** - Prevent abuse and bot trading
6. ✅ **Scalability** - Handle 1000+ concurrent users
7. ✅ **Audit trail** - Log all trades for compliance

---

## Testing the House Edge

Run simulations with 10,000 trades:
- 50% BUY, 50% SELL
- Random amounts $10-$1000
- Random expiry times
- Random price movements

**Expected Results:**
- Platform should win 60-70% of trades
- Average payout should be 75-80%
- Net profit should be 25-35% of volume

If platform wins <55% or >75%, adjust house edge parameters.

---

## Compliance & Legal

⚠️ **Important**: Binary options trading is regulated in many jurisdictions:
- Obtain proper licenses (CFTC, FCA, CySEC)
- Implement KYC/AML procedures
- Provide risk warnings to users
- Maintain audit trails
- Comply with local gambling/trading laws

Consult with legal counsel before launching in production.

---

## Support & Maintenance

**Monitoring:**
- Track platform win rate daily
- Monitor user complaints about "unfair" trades
- Adjust house edge if win rate deviates

**Updates:**
- Add new assets based on demand
- Adjust payout percentages seasonally
- Update house edge based on market conditions

**Customer Support:**
- Provide clear terms of service
- Explain payout percentages transparently
- Handle disputes professionally

---

This implementation ensures a profitable, scalable, and legally compliant binary options trading platform with a proven house edge system.
