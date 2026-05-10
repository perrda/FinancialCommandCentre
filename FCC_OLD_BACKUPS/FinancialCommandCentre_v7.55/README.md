# Financial Command Centre (FCC)

![Version](https://img.shields.io/badge/version-7.55-orange)
![License](https://img.shields.io/badge/license-MIT-blue)
![PWA](https://img.shields.io/badge/PWA-ready-green)

A comprehensive Progressive Web App (PWA) for personal finance tracking, portfolio management, and wealth analysis.

![FCC Screenshot](docs/screenshot.png)

## ✨ Features

### Portfolio Management
- 📊 Multiple portfolio support
- 💰 Crypto tracking (CoinGecko integration)
- 📈 Equity/Stock tracking (Finnhub + Yahoo Finance)
- 🏦 Liabilities management (loans, credit cards)
- 💱 Multi-currency support (GBP, USD, EUR, etc.)

### Analytics & Insights
- 📉 Net worth history & charts
- 📊 Asset allocation visualization
- 📈 Performance tracking
- 🎯 Monte Carlo projections
- 🔥 FIRE (Financial Independence) calculator

### Budgeting & Planning
- 💵 Income & expense tracking
- 📆 Recurring transaction management
- 🎯 Goal setting & tracking
- 📊 Spending analysis

### Tax & Reporting
- 🇬🇧 UK Capital Gains Tax calculation
- 📄 PDF report generation
- 📊 CSV export (multiple formats)
- 📋 Transaction history

### Security & Privacy
- 🔐 PIN/Password protection
- 👆 Biometric authentication
- 🔒 Auto-lock feature
- 👁️ Privacy mode (blur values)

### PWA Features
- 📱 Installable on mobile/desktop
- 🔌 Offline capable
- 🔄 Background sync
- 📲 Add to Home Screen

## 🚀 Quick Start

### Option 1: Direct Use
Simply open `index.html` in a modern browser.

### Option 2: Local Server (Recommended)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to Hosting
Upload all files to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## 📁 Project Structure

```
/FinancialCommandCentre
├── index.html          # Main HTML file
├── README.md           # This file
├── LICENSE             # MIT License
├── .gitignore          # Git ignore rules
├── /css
│   └── style.css       # All styles (~16K lines)
├── /js
│   ├── config.js       # Configuration & constants
│   └── app.js          # Main application (~24K lines)
├── /assets
│   └── (icons, images)
├── /docs
│   └── ARCHITECTURE.md # Technical documentation
└── /data
    └── sample-portfolio.json
```

## ⚙️ Configuration

### API Keys
The app uses the following APIs:

| API | Purpose | Key Required |
|-----|---------|--------------|
| CoinGecko | Crypto prices | No (free tier) |
| Finnhub | Stock quotes | Yes (free tier available) |
| ExchangeRate-API | Currency conversion | No |

To add your Finnhub API key:
1. Get a free key at [finnhub.io](https://finnhub.io)
2. Go to Settings → API Keys in the app
3. Enter your key

### Customization
Edit `js/config.js` to customize:
- Default currency
- Color scheme
- API endpoints
- Auto-lock timeout

## 🛠️ Development

### Prerequisites
- Modern browser (Chrome, Firefox, Safari, Edge)
- No build tools required!

### Local Development
1. Clone the repository
2. Open `index.html` in a browser
3. Edit files and refresh

### Code Style
- ES6+ JavaScript
- BEM-style CSS naming
- Semantic HTML5

## 📊 Data Storage

All data is stored in browser localStorage:

| Key | Purpose |
|-----|---------|
| `fcc_theme` | Theme preference |
| `fcc_security` | Security settings |
| `fcc_biometric_cred` | Biometric credentials |
| `finnhub_key` | Finnhub API key |

**⚠️ Important:** Data is stored locally in your browser. Use the Backup feature regularly!

## 🔒 Privacy

- **No server-side storage** - All data stays in your browser
- **No analytics/tracking** - Completely private
- **No external calls** except for price APIs
- **Open source** - Audit the code yourself

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [CoinGecko](https://coingecko.com) for crypto price data
- [Finnhub](https://finnhub.io) for stock market data
- [Inter Font](https://fonts.google.com/specimen/Inter) for typography

---

**Made with ❤️ by David Perry**
