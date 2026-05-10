# Financial Command Centre - Architecture Documentation

## Overview

FCC is a single-page Progressive Web App (PWA) built with vanilla JavaScript, CSS, and HTML. It requires no build tools, frameworks, or server-side components.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  index.html │  │  style.css  │  │  JavaScript             │ │
│  │             │  │             │  │  ┌─────────┐            │ │
│  │  - Head     │  │  - Theme    │  │  │config.js│ Constants  │ │
│  │  - Body     │  │  - Layout   │  │  └─────────┘            │ │
│  │  - Modals   │  │  - Cards    │  │  ┌─────────┐            │ │
│  │             │  │  - Charts   │  │  │ app.js  │ Main App   │ │
│  │             │  │  - Animate  │  │  └─────────┘            │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│                                                                  │
├──────────────────────────┬──────────────────────────────────────┤
│      localStorage        │           External APIs              │
│  ┌──────────────────┐   │  ┌──────────────────────────────┐    │
│  │ Portfolio Data   │   │  │ CoinGecko (Crypto Prices)    │    │
│  │ Settings         │   │  │ Finnhub (Stock Quotes)       │    │
│  │ Security Config  │   │  │ Yahoo Finance (via CORS)     │    │
│  │ Theme Preference │   │  │ ExchangeRate-API (FX Rates)  │    │
│  └──────────────────┘   │  └──────────────────────────────┘    │
└──────────────────────────┴──────────────────────────────────────┘
```

## File Structure

```
/FinancialCommandCentre
├── index.html              # Main entry point
│   ├── <head>              # Meta, fonts, manifest
│   └── <body>              # All UI components
│
├── /css
│   └── style.css           # All styles (16K lines)
│       ├── Variables       # CSS custom properties
│       ├── Base            # Reset, typography
│       ├── Components      # Cards, buttons, forms
│       ├── Navigation      # Tabs, mobile nav
│       ├── Charts          # Canvas styling
│       ├── Animations      # @keyframes
│       └── Media Queries   # Responsive
│
├── /js
│   ├── config.js           # Constants & config
│   └── app.js              # Main app (23K lines)
│       ├── App object      # Main singleton
│       │   ├── init*       # Initialization
│       │   ├── render*     # UI rendering
│       │   ├── update*     # Data updates
│       │   ├── calc*       # Calculations
│       │   ├── show/hide*  # Modal/panel control
│       │   ├── add/delete* # CRUD operations
│       │   └── export*     # Export functions
│       └── Event bindings  # User interactions
│
└── /docs
    └── ARCHITECTURE.md     # This file
```

## Data Model

### Portfolio Structure
```javascript
{
  "activePortfolioId": "default",
  "portfolios": {
    "default": {
      "name": "My Portfolio",
      "crypto": [...],
      "equity": [...],
      "liabilities": [...],
      "settings": {...}
    }
  }
}
```

### Crypto Asset
```javascript
{
  "id": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "amount": 1.5,
  "costBasis": 45000,
  "purchaseDate": "2024-01-15"
}
```

### Equity Asset
```javascript
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "shares": 100,
  "avgPrice": 150.00,
  "purchaseDate": "2024-01-15"
}
```

## State Management

FCC uses a simple state management pattern:

1. **App.data** - Main application state
2. **localStorage** - Persistence layer
3. **UI updates** - Direct DOM manipulation

```
User Action → App Method → Update State → Save to localStorage → Re-render UI
```

## API Integration

### Rate Limiting Strategy
- CoinGecko: 10-50 calls/minute (free tier)
- Finnhub: 60 calls/minute (free tier)
- Caching: 5-minute default for prices

### CORS Handling
Yahoo Finance requires CORS proxies:
1. Try primary proxy
2. Fallback to secondary
3. Fallback to tertiary
4. Return cached data if all fail

## Security

### Authentication
1. PIN code (4-6 digits)
2. Biometric (WebAuthn API)
3. Auto-lock timer

### Data Protection
- All data stored locally
- No server-side storage
- Privacy mode blurs values

## Performance Optimizations

1. **Debounce/Throttle** - User input handlers
2. **requestAnimationFrame** - Smooth animations
3. **IntersectionObserver** - Lazy loading
4. **CSS transforms** - GPU acceleration
5. **will-change** - Animation hints

## Browser Support

| Browser | Minimum Version |
|---------|-----------------|
| Chrome  | 80+            |
| Firefox | 75+            |
| Safari  | 13+            |
| Edge    | 80+            |

## Future Roadmap

- [ ] ES Modules migration
- [ ] Service Worker for offline
- [ ] IndexedDB for larger datasets
- [ ] TypeScript migration
- [ ] Unit testing
- [ ] Plaid integration
