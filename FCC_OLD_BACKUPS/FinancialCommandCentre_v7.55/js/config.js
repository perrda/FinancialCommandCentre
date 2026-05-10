/**
 * Financial Command Centre - Configuration
 * Version: 7.55
 * 
 * Contains all constants, API endpoints, and configuration options.
 * Edit this file to customize API keys and settings.
 */

const FCC_CONFIG = {
    // Version
    VERSION: '7.55',
    
    // Debug mode (set to false for production)
    DEBUG: false,
    
    // API Endpoints
    API: {
        // Crypto
        COINGECKO: 'https://api.coingecko.com/api/v3',
        CRYPTOCOMPARE: 'https://min-api.cryptocompare.com/data',
        
        // Stocks/Equities
        FINNHUB: 'https://finnhub.io/api/v1',
        YAHOO_FINANCE: 'https://query1.finance.yahoo.com',
        
        // Currency Exchange
        EXCHANGE_RATE: 'https://api.exchangerate-api.com/v4/latest',
        
        // CORS Proxies (for Yahoo Finance)
        CORS_PROXIES: [
            'https://api.allorigins.win/raw?url=',
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://corsproxy.io/?',
            'https://thingproxy.freeboard.io/fetch/'
        ]
    },
    
    // Default Settings
    DEFAULTS: {
        CURRENCY: 'GBP',
        THEME: 'dark',
        AUTO_LOCK_MINUTES: 5,
        REFRESH_INTERVAL: 300000, // 5 minutes
        CHART_ANIMATION_DURATION: 750
    },
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        THEME: 'fcc_theme',
        SECURITY: 'fcc_security',
        BIOMETRIC: 'fcc_biometric_cred',
        FINNHUB_KEY: 'finnhub_key',
        PWA_DISMISSED: 'pwa-install-dismissed'
    },
    
    // Chart Colors
    COLORS: {
        PRIMARY: '#FF6B00',
        GREEN: '#22C55E',
        RED: '#EF4444',
        AMBER: '#F59E0B',
        BLUE: '#3B82F6',
        PURPLE: '#8B5CF6',
        CYAN: '#06B6D4',
        GOLD: '#C9A962'
    },
    
    // Supported Currencies
    CURRENCIES: ['GBP', 'USD', 'EUR', 'AUD', 'CAD', 'CHF', 'JPY', 'CNY'],
    
    // Asset Categories
    ASSET_TYPES: {
        CRYPTO: 'crypto',
        EQUITY: 'equity',
        CASH: 'cash',
        PROPERTY: 'property',
        OTHER: 'other'
    }
};

// Freeze config to prevent accidental modification
Object.freeze(FCC_CONFIG);
Object.freeze(FCC_CONFIG.API);
Object.freeze(FCC_CONFIG.DEFAULTS);
Object.freeze(FCC_CONFIG.STORAGE_KEYS);
Object.freeze(FCC_CONFIG.COLORS);

// Export for potential ES module use in future
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FCC_CONFIG;
}
