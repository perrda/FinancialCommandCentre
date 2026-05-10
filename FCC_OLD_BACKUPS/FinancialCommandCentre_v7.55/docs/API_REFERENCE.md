# Portfolio App - API Reference Guide

**Version:** 1.0
**Last Updated:** April 2026
**Status:** Production-Ready

---

## Table of Contents

1. [CoinGecko API](#coingecko-api)
2. [Finnhub API](#finnhub-api)
3. [Exchange Rate APIs](#exchange-rate-apis)
4. [RSS Feed Sources](#rss-feed-sources)
5. [Rate Limiting Strategy](#rate-limiting-strategy)
6. [Error Handling](#error-handling)
7. [Caching Implementation](#caching-implementation)
8. [API Key Management](#api-key-management)

---

## CoinGecko API

**Base URL:** `https://api.coingecko.com/api/v3`
**Authentication:** Free tier (no API key required)
**Rate Limit (Free Tier):** 10-30 calls/minute
**Rate Limit (Pro):** 500 calls/minute
**Tier Recommendation:** Start with free tier; upgrade to Pro for production App Store launch

### Pricing Data Endpoints

#### 1. Get Current Price

**Endpoint:** `/simple/price`

```
GET /simple/price?ids={ids}&vs_currencies={currencies}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true

Parameters:
  - ids: Comma-separated list of crypto IDs (e.g., "bitcoin,ethereum,litecoin")
  - vs_currencies: Comma-separated currencies (e.g., "usd,gbp,eur")
  - include_market_cap: true/false
  - include_24hr_vol: true/false
  - include_24hr_change: true/false
```

**Example Request:**
```bash
curl "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,eur&include_market_cap=true&include_24hr_change=true"
```

**Example Response:**
```json
{
  "bitcoin": {
    "usd": 45000,
    "eur": 41500,
    "usd_market_cap": 880000000000,
    "eur_market_cap": 812000000000,
    "usd_24h_change": 2.35,
    "eur_24h_change": 2.35
  },
  "ethereum": {
    "usd": 2800,
    "eur": 2576,
    "usd_market_cap": 336000000000,
    "eur_market_cap": 309000000000,
    "usd_24h_change": 1.85,
    "eur_24h_change": 1.85
  }
}
```

**Response Codes:**
- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `429 Too Many Requests` - Rate limit exceeded

#### 2. Get Historical Price Data

**Endpoint:** `/coins/{id}/market_chart`

```
GET /coins/{id}/market_chart?vs_currency={currency}&days={days}&interval={interval}

Parameters:
  - id: Coin ID (e.g., "bitcoin")
  - vs_currency: Single currency (e.g., "usd")
  - days: "1", "7", "30", "90", "365", "max"
  - interval: Optional, "daily"
```

**Example Request:**
```bash
curl "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30"
```

**Example Response:**
```json
{
  "prices": [
    [1704067200000, 44000],
    [1704153600000, 44500],
    [1704240000000, 45000]
  ],
  "market_caps": [
    [1704067200000, 880000000000],
    [1704153600000, 892500000000],
    [1704240000000, 900000000000]
  ],
  "volumes": [
    [1704067200000, 35000000000],
    [1704153600000, 36000000000],
    [1704240000000, 37000000000]
  ]
}
```

**Note:** Timestamps are in milliseconds; convert to seconds by dividing by 1000.

#### 3. Search Cryptocurrencies

**Endpoint:** `/search`

```
GET /search?query={query}

Parameters:
  - query: Search term (e.g., "bitcoin")
```

**Example Request:**
```bash
curl "https://api.coingecko.com/api/v3/search?query=bitcoin"
```

**Example Response:**
```json
{
  "coins": [
    {
      "id": "bitcoin",
      "name": "Bitcoin",
      "symbol": "btc",
      "market_cap_rank": 1,
      "thumb": "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png",
      "large": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
    },
    {
      "id": "bitcoin-cash",
      "name": "Bitcoin Cash",
      "symbol": "bch",
      "market_cap_rank": 27,
      "thumb": "https://assets.coingecko.com/coins/images/780/thumb/bitcoin-cash.png",
      "large": "https://assets.coingecko.com/coins/images/780/large/bitcoin-cash.png"
    }
  ],
  "exchanges": [],
  "icos": [],
  "categories": []
}
```

#### 4. Get Coin Details

**Endpoint:** `/coins/{id}`

```
GET /coins/{id}?localization=false&tickers=true&market_data=true

Parameters:
  - id: Coin ID (e.g., "bitcoin")
  - localization: true/false
  - tickers: true/false (exchange ticker info)
  - market_data: true/false
```

**Example Request:**
```bash
curl "https://api.coingecko.com/api/v3/coins/bitcoin?market_data=true"
```

**Key Response Fields:**
```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "description": { "en": "..." },
  "market_data": {
    "current_price": { "usd": 45000 },
    "market_cap": { "usd": 880000000000 },
    "total_volume": { "usd": 35000000000 },
    "high_24h": { "usd": 46000 },
    "low_24h": { "usd": 44000 },
    "price_change_24h": 1000,
    "price_change_percentage_24h": 2.27
  }
}
```

### Supported Cryptocurrencies

The app supports 250+ cryptocurrencies via CoinGecko. Key ones to pre-load:

- Bitcoin (bitcoin)
- Ethereum (ethereum)
- BNB (binancecoin)
- Ripple (ripple)
- Cardano (cardano)
- Solana (solana)
- Polkadot (polkadot)
- Dogecoin (dogecoin)
- Litecoin (litecoin)
- And 240+ others

---

## Finnhub API

**Base URL:** `https://finnhub.io/api/v1`
**Authentication:** API Key required (free tier: 60 calls/minute)
**Rate Limit (Free):** 60 calls/minute
**Rate Limit (Pro):** 500+ calls/minute
**Sign Up:** https://finnhub.io

### Getting Your API Key

1. Visit https://finnhub.io
2. Click "Get free API key"
3. Sign up with email
4. API key will be shown in dashboard
5. Add to environment variables (never hardcode)

### Quote Data Endpoints

#### 1. Get Stock Quote

**Endpoint:** `/quote`

```
GET /quote?symbol={symbol}&token={api_key}

Parameters:
  - symbol: Stock ticker (e.g., "AAPL")
  - token: Your Finnhub API key
```

**Example Request:**
```bash
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY"
```

**Example Response:**
```json
{
  "c": 175.50,
  "d": 1.50,
  "dp": 0.86,
  "h": 176.00,
  "l": 173.75,
  "o": 174.20,
  "pc": 174.00,
  "t": 1704067200
}
```

**Response Fields:**
- `c` - Current price
- `d` - Change (absolute)
- `dp` - Change percent
- `h` - 52-week high
- `l` - 52-week low
- `o` - Open price
- `pc` - Previous close
- `t` - Timestamp (Unix)

#### 2. Stock Search

**Endpoint:** `/search`

```
GET /search?q={query}&token={api_key}

Parameters:
  - q: Search query (e.g., "Apple" or "AAPL")
  - token: Your Finnhub API key
```

**Example Request:**
```bash
curl "https://finnhub.io/api/v1/search?q=Apple&token=YOUR_API_KEY"
```

**Example Response:**
```json
{
  "count": 2,
  "result": [
    {
      "description": "APPLE INC",
      "displaySymbol": "AAPL",
      "symbol": "AAPL",
      "type": "Common Stock"
    },
    {
      "description": "APPLE HOSPITALITY REIT INC",
      "displaySymbol": "APLE",
      "symbol": "APLE",
      "type": "Common Stock"
    }
  ]
}
```

#### 3. Company Profile

**Endpoint:** `/stock/profile2`

```
GET /stock/profile2?symbol={symbol}&token={api_key}

Parameters:
  - symbol: Stock ticker
  - token: Your Finnhub API key
```

**Example Request:**
```bash
curl "https://finnhub.io/api/v1/stock/profile2?symbol=AAPL&token=YOUR_API_KEY"
```

**Example Response:**
```json
{
  "country": "US",
  "currency": "USD",
  "description": "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.",
  "exchange": "NASDAQ",
  "finnhubIndustry": "Consumer Electronics",
  "ipo": "1980-12-12",
  "logo": "https://static.finnhub.io/logo/...",
  "marketCapitalization": 2800000,
  "name": "Apple Inc",
  "phone": "14089961010",
  "shareOutstanding": 15700,
  "ticker": "AAPL",
  "weburl": "https://www.apple.com"
}
```

#### 4. Real-Time News

**Endpoint:** `/company-news`

```
GET /company-news?symbol={symbol}&from={from}&to={to}&token={api_key}

Parameters:
  - symbol: Stock ticker
  - from: Start date (YYYY-MM-DD)
  - to: End date (YYYY-MM-DD)
  - token: Your Finnhub API key
```

**Example Request:**
```bash
curl "https://finnhub.io/api/v1/company-news?symbol=AAPL&from=2026-01-01&to=2026-04-09&token=YOUR_API_KEY"
```

**Response Structure:**
```json
[
  {
    "category": "company",
    "datetime": 1704067200,
    "headline": "Apple reports Q1 earnings",
    "id": 12345,
    "image": "https://...",
    "related": "AAPL",
    "source": "Reuters",
    "summary": "...",
    "url": "https://..."
  }
]
```

### Supported Stocks

The app supports 50,000+ stocks worldwide via Finnhub. Key exchanges:

- **NASDAQ:** Apple (AAPL), Microsoft (MSFT), Amazon (AMZN), Tesla (TSLA), Nvidia (NVDA)
- **NYSE:** Bank of America (BAC), Coca-Cola (KO), Disney (DIS), Ford (F), IBM (IBM)
- **London:** HSBC (HSBA), BP (BP), Shell (SHEL)
- **And worldwide coverage**

---

## Exchange Rate APIs

For currency conversion beyond direct API support. Choose one based on your needs:

### Option 1: Open Exchange Rates (Recommended)

**Base URL:** `https://openexchangerates.org/api`
**Sign Up:** https://openexchangerates.org
**Free Tier:** 1,000 requests/month, 1 request/hour limit

**Endpoint:** `/latest.json`

```
GET /latest.json?app_id={app_id}&symbols={symbols}

Parameters:
  - app_id: Your API key
  - symbols: Comma-separated target currencies (e.g., "GBP,EUR,JPY")
```

**Example Request:**
```bash
curl "https://openexchangerates.org/api/latest.json?app_id=YOUR_APP_ID&symbols=GBP,EUR,JPY"
```

**Example Response:**
```json
{
  "disclaimer": "Usage subject to terms: https://openexchangerates.org/terms",
  "license": "https://openexchangerates.org/license",
  "timestamp": 1704067200,
  "base": "USD",
  "rates": {
    "GBP": 0.79,
    "EUR": 0.92,
    "JPY": 149.50,
    "CAD": 1.32,
    "AUD": 1.51
  }
}
```

### Option 2: Fixer.io

**Base URL:** `https://api.fixer.io`
**Sign Up:** https://fixer.io
**Free Tier:** 100 requests/month

**Endpoint:** `/latest`

```
GET /latest?access_key={access_key}&base=USD&symbols={symbols}
```

### Option 3: Exchangerate-API

**Base URL:** `https://v6.exchangerate-api.com/v6`
**Sign Up:** https://www.exchangerate-api.com
**Free Tier:** 1,500 requests/month

```
GET /latest/usd
```

### Strategy for Portfolio App

**Recommendation:** Cache exchange rates locally

1. Fetch rates on app launch
2. Cache rates in UserDefaults
3. Refresh rates every 1-4 hours (background task)
4. Use cached rates if offline
5. Show "Last updated at X" in UI

---

## RSS Feed Sources

The app includes news aggregation via RSS feeds. These are free and require no API key.

### Crypto News Feeds

**1. CoinDesk**
- URL: `https://www.coindesk.com/arc/outboundfeeds/rss/`
- Category: General crypto news
- Update Frequency: Multiple times per day
- Reliability: High

**2. Cointelegraph**
- URL: `https://cointelegraph.com/feed`
- Category: Crypto news and analysis
- Update Frequency: Multiple times per day
- Reliability: High

**3. The Block**
- URL: `https://www.theblock.co/feed.xml`
- Category: Crypto industry research
- Update Frequency: Daily
- Reliability: High

**4. Crypto Insider**
- URL: `https://www.crypto-insider.com/feed/`
- Category: Crypto news
- Update Frequency: Multiple times per day
- Reliability: Medium

### Stock Market Feeds

**1. Financial Times Markets**
- URL: `http://feeds.ft.com/markets`
- Category: Stock market news
- Update Frequency: Multiple times per day
- Reliability: High

**2. Reuters Finance**
- URL: `https://feeds.reuters.com/finance/markets`
- Category: Market news
- Update Frequency: Multiple times per day
- Reliability: High

**3. MarketWatch**
- URL: `https://feeds.marketwatch.com/marketwatch/topstories/`
- Category: Stock and market news
- Update Frequency: Multiple times per day
- Reliability: High

### Implementation Notes

- Use URLSession with dataTaskPublisher for RSS feeds
- Parse RSS/Atom feeds with XMLParser
- Implement 1-4 hour cache to avoid re-fetching
- Show loading state while fetching feeds
- Handle malformed XML gracefully

---

## Rate Limiting Strategy

### CoinGecko (10-30 calls/minute free tier)

**Recommended Approach:**

```swift
// Batch requests to reduce API calls
// Instead of: 1 call per coin
// Do: 1 call with multiple coins

// Good: GET /simple/price?ids=bitcoin,ethereum,litecoin
// Bad:  GET /simple/price?ids=bitcoin
//       GET /simple/price?ids=ethereum
//       GET /simple/price?ids=litecoin

// Implementation:
// 1. Batch cryptocurrencies into groups of 250
// 2. Cache results for 5-10 minutes
// 3. Implement exponential backoff on 429 responses
// 4. Upgrade to Pro tier for production (500 calls/min)
```

**Calculation:**
- Free Tier: 10-30 calls/min = ~1,440-43,200 calls/day
- Portfolio with 50 holdings, refreshed 10x per day = 500 calls/day (well within free tier)
- Single batch request for all holdings = 1 call/refresh

### Finnhub (60 calls/minute free tier)

**Recommended Approach:**

```swift
// 1. Batch stock quotes: max 225 symbols per call
// 2. Cache results for 5-15 minutes
// 3. Queue updates to respect rate limit
// 4. Prioritize active portfolios

// For Pro app launch: Upgrade to Pro plan
// Daily calculation: 60 calls/min * 1,440 min = 86,400 calls/day

let maxCallsPerMinute = 60
let maxSymbolsPerCall = 225

// If app has 100 stocks:
// - 100 stocks / 225 max per call = 1 call
// - Refresh 10x per day = 10 calls
// - Still well under 60 calls/min limit
```

### Implementation Pattern

```swift
class RateLimiter {
    private var lastRequestTime: [String: Date] = [:]
    private let minimumInterval: TimeInterval = 0.1 // 100ms between requests

    func canMakeRequest(for endpoint: String) -> Bool {
        guard let lastTime = lastRequestTime[endpoint] else {
            lastRequestTime[endpoint] = Date()
            return true
        }

        let elapsed = Date().timeIntervalSince(lastTime)
        if elapsed >= minimumInterval {
            lastRequestTime[endpoint] = Date()
            return true
        }
        return false
    }
}
```

### Caching Tiers

| Data Type | Cache Duration | Refresh Frequency |
|-----------|-------------------|-------------------|
| Current Price (Crypto) | 5-10 minutes | On-demand + App launch |
| Current Price (Stocks) | 5-15 minutes | On-demand + App launch |
| Historical Charts | 1 hour | Manual refresh |
| Company Info | 24 hours | Weekly check |
| Exchange Rates | 4 hours | Hourly background |
| News (RSS) | 2 hours | 2-4x per day |

---

## Error Handling

### Standard HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | OK | Process response |
| 400 | Bad Request | Log error, verify parameters |
| 401 | Unauthorized | Check API key (invalid/expired) |
| 403 | Forbidden | Check authentication/permissions |
| 404 | Not Found | Asset/symbol doesn't exist |
| 429 | Too Many Requests | Implement exponential backoff |
| 500 | Server Error | Retry after 1-5 seconds |
| 503 | Service Unavailable | Retry after 10-30 seconds |

### Exponential Backoff Strategy

```swift
func exponentialBackoff(attempt: Int) -> TimeInterval {
    // 2^attempt * 1 second, max 30 seconds
    return min(pow(2.0, Double(attempt)), 30.0)
}

// Attempt 1: Wait 2 seconds
// Attempt 2: Wait 4 seconds
// Attempt 3: Wait 8 seconds
// Attempt 4: Wait 16 seconds
// Attempt 5+: Wait 30 seconds
```

### Network Error Response Format

**CoinGecko Errors:**
```json
{
  "status": {
    "error_code": 1002,
    "error_message": "Invalid parameters"
  }
}
```

**Finnhub Errors:**
```json
{
  "error": "Invalid symbol"
}
```

### App-Level Error Handling

1. **Network Unavailable** - Show cached data with "Offline" badge
2. **Rate Limited (429)** - Implement exponential backoff, queue requests
3. **Invalid API Key** - Show settings screen to user
4. **Invalid Symbol** - Show error message, offer search
5. **Malformed Response** - Log to analytics, use fallback data

---

## Caching Implementation

### LocalStorage Strategy

```swift
struct CachedPrice: Codable {
    let symbol: String
    let price: Double
    let currency: String
    let timestamp: Date
    let source: String // "coingecko" or "finnhub"

    var isExpired: Bool {
        let maxAge: TimeInterval = 5 * 60 // 5 minutes
        return Date().timeIntervalSince(timestamp) > maxAge
    }
}

struct PriceCache {
    private let defaults = UserDefaults.standard

    func setPrice(_ price: CachedPrice) {
        let key = "price_\(price.symbol)_\(price.currency)"
        let encoder = JSONEncoder()
        if let encoded = try? encoder.encode(price) {
            defaults.set(encoded, forKey: key)
        }
    }

    func getPrice(symbol: String, currency: String) -> CachedPrice? {
        let key = "price_\(symbol)_\(currency)"
        guard let data = defaults.data(forKey: key) else { return nil }
        let decoder = JSONDecoder()
        return try? decoder.decode(CachedPrice.self, from: data)
    }
}
```

### Background Refresh Strategy

```swift
// Use BackgroundTasks framework (iOS 13+)
// Schedule background refresh every 15-30 minutes

func scheduleBackgroundRefresh() {
    let request = BGAppRefreshTaskRequest(identifier: "com.davidperry.portfolio.refresh")
    request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 minutes

    try? BGTaskScheduler.shared.submit(request)
}
```

---

## API Key Management

### Environment Variables Setup

**Never hardcode API keys. Use environment variables:**

#### Xcode Configuration

1. Create `Config.xcconfig` file (not in Git):
```
FINNHUB_API_KEY = your_key_here
COINGECKO_API_KEY = your_key_here (optional, free tier)
EXCHANGE_RATE_API_KEY = your_key_here (optional)
```

2. Reference in Build Settings:
```
Build Settings → User-Defined
```

3. Access in Swift:
```swift
let apiKey = Bundle.main.infoDictionary?["FINNHUB_API_KEY"] as? String
```

#### Runtime Configuration

```swift
struct APIConfiguration {
    static let finnhubKey = ProcessInfo.processInfo
        .environment["FINNHUB_API_KEY"] ?? ""

    static let coingeckoKey = ProcessInfo.processInfo
        .environment["COINGECKO_API_KEY"] ?? ""
}
```

### Secure Storage for Production

For production apps on App Store, store API keys on a backend server:

```swift
// Instead of embedding keys in app:
// 1. Create backend endpoint that returns API keys
// 2. Verify request comes from your app (JWT token)
// 3. Fetch keys on app launch
// 4. Cache temporarily in memory only (not disk)

class APIKeyManager {
    private var keys: [String: String] = [:]

    func fetchKeys() async {
        // Call your backend
        let response = await fetchFromBackend()
        self.keys = response.keys
    }

    func finnhubKey() -> String {
        return keys["finnhub"] ?? ""
    }
}
```

### Key Rotation Strategy

1. Keep multiple API keys active
2. Rotate weekly in production
3. Use 30-day retention before deletion
4. Monitor usage per key
5. Alert if a key is overused (potential theft)

---

## API Monitoring & Analytics

### Track API Usage

```swift
struct APIMetrics {
    var endpoint: String
    var statusCode: Int
    var responseTime: TimeInterval
    var timestamp: Date
    var success: Bool

    // Log to analytics service (Sentry, Amplitude, etc.)
}
```

### Metrics to Monitor

- API response time (target: <500ms)
- Success rate (target: >99%)
- Rate limit usage (stay <80% of limit)
- Error codes (track 404, 429, 500 separately)
- User impact (show toast notification on failures)

---

## Production Deployment Checklist

- [ ] All API keys moved to environment variables
- [ ] Rate limiting implemented for all endpoints
- [ ] Caching strategy in place
- [ ] Error handling tested for all failure modes
- [ ] Exponential backoff implemented
- [ ] Request timeouts set (15-30 seconds)
- [ ] Response validation implemented
- [ ] API metrics logging configured
- [ ] Analytics/monitoring service integrated
- [ ] Upgrade from free tier to paid tier (if needed)
- [ ] Rate limit alerts configured

---

## References

- CoinGecko API Docs: https://docs.coingecko.com/reference
- Finnhub API Docs: https://finnhub.io/docs/api
- Open Exchange Rates: https://openexchangerates.org/documentation
- Apple URL Session: https://developer.apple.com/documentation/foundation/urlsession
- Background Tasks: https://developer.apple.com/documentation/backgroundtasks

