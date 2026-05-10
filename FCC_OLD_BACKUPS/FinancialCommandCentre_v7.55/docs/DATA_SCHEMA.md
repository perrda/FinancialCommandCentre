# Portfolio App - Data Schema Documentation

**Version:** 1.0
**Last Updated:** April 2026
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Portfolio Schema](#portfolio-schema)
3. [Asset Schema](#asset-schema)
4. [WealthSnapshot Schema](#wealthsnapshot-schema)
5. [PriceAlert Schema](#pricealert-schema)
6. [Watchlist Schema](#watchlist-schema)
7. [Dividend Schema](#dividend-schema)
8. [Goal Schema](#goal-schema)
9. [UserSettings Schema](#usersettings-schema)
10. [Backup Format](#backup-format)
11. [CSV Export Formats](#csv-export-formats)
12. [Data Migration](#data-migration)

---

## Overview

The Portfolio App uses a hierarchical JSON data model stored in UserDefaults and CloudKit. Data is versioned to support migrations between app versions.

**Storage Layers:**
- **Local:** UserDefaults (primary)
- **iCloud:** CloudKit (sync between devices)
- **Backup:** JSON files (manual backups with rotation)

**Current Data Version:** 2.93

---

## Portfolio Schema

A portfolio represents a collection of assets (crypto or stocks) that the user tracks together.

### Portfolio JSON Structure

```json
{
  "id": "portfolio-uuid-1234",
  "name": "Main Portfolio",
  "type": "mixed",
  "displayCurrency": "USD",
  "includeInNetWorth": true,
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2026-04-09T15:30:00Z",
  "assets": [
    "asset-uuid-1",
    "asset-uuid-2"
  ],
  "metadata": {
    "description": "Primary investment portfolio",
    "color": "blue",
    "icon": "briefcase",
    "sortIndex": 0
  }
}
```

### Portfolio Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID string | Yes | Unique identifier (lowercase, no hyphens in storage) |
| `name` | String (1-100 chars) | Yes | User-readable name |
| `type` | Enum: "crypto", "stocks", "mixed" | Yes | Asset type |
| `displayCurrency` | String (3-char ISO code) | Yes | Currency for display (USD, GBP, EUR, etc.) |
| `includeInNetWorth` | Boolean | Yes | Whether to include in total net worth calculation |
| `createdAt` | ISO 8601 DateTime | Yes | Portfolio creation timestamp |
| `updatedAt` | ISO 8601 DateTime | Yes | Last modification timestamp |
| `assets` | Array of UUID strings | No | Asset references (pointers to Asset objects) |
| `metadata` | Object | No | UI/display metadata |

### Portfolio Constraints

```swift
// Validation rules
struct Portfolio: Codable {
    // Max 20 portfolios per user
    static let maxPortfolios = 20

    // Max 500 assets per portfolio
    static let maxAssetsPerPortfolio = 500

    // Name constraints
    var name: String {
        didSet {
            assert(name.count >= 1 && name.count <= 100, "Name must be 1-100 characters")
        }
    }

    // Currency must be ISO 4217 code
    var displayCurrency: String {
        didSet {
            assert(displayCurrency.count == 3, "Currency must be ISO code")
        }
    }
}
```

### Portfolio Storage Key

```swift
let key = "portfolio_\(portfolioId)"
// Example: "portfolio_a1b2c3d4e5f6"
```

---

## Asset Schema

An asset represents a single holding (crypto or stock) within a portfolio.

### Cryptocurrency Asset

```json
{
  "id": "asset-uuid-5678",
  "portfolioId": "portfolio-uuid-1234",
  "type": "crypto",
  "symbol": "BTC",
  "coinId": "bitcoin",
  "name": "Bitcoin",
  "quantity": 0.5,
  "purchasePrice": 45000.00,
  "purchaseDate": "2025-06-15T00:00:00Z",
  "purchaseCurrency": "USD",
  "currentPrice": 47000.00,
  "currentCurrency": "USD",
  "priceTimestamp": "2026-04-09T15:25:00Z",
  "notes": "Long-term hold",
  "tags": ["btc", "hodl", "major-holding"],
  "createdAt": "2025-06-15T10:00:00Z",
  "updatedAt": "2026-04-09T15:30:00Z"
}
```

### Stock Asset

```json
{
  "id": "asset-uuid-9012",
  "portfolioId": "portfolio-uuid-1234",
  "type": "stock",
  "symbol": "AAPL",
  "name": "Apple Inc",
  "quantity": 10,
  "purchasePrice": 175.50,
  "purchaseDate": "2025-03-20T00:00:00Z",
  "purchaseCurrency": "USD",
  "currentPrice": 178.25,
  "currentCurrency": "USD",
  "priceTimestamp": "2026-04-09T15:25:00Z",
  "exchange": "NASDAQ",
  "sector": "Technology",
  "notes": "Growth stock, dividend paying",
  "tags": ["nasdaq", "dividend", "tech"],
  "createdAt": "2025-03-20T10:00:00Z",
  "updatedAt": "2026-04-09T15:30:00Z"
}
```

### Asset Properties (Common)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `portfolioId` | UUID | Yes | Reference to parent portfolio |
| `type` | Enum: "crypto", "stock" | Yes | Asset type |
| `symbol` | String (1-20 chars) | Yes | Ticker/symbol (BTC, AAPL) |
| `name` | String | Yes | Full name |
| `quantity` | Decimal | Yes | Amount held (can be fractional) |
| `purchasePrice` | Decimal | Yes | Purchase price per unit |
| `purchaseDate` | ISO 8601 | Yes | When purchased |
| `purchaseCurrency` | String (ISO code) | Yes | Currency when purchased |
| `currentPrice` | Decimal | Yes | Latest market price |
| `currentCurrency` | String (ISO code) | Yes | Currency of current price |
| `priceTimestamp` | ISO 8601 | Yes | When price was fetched |
| `notes` | String | No | User notes |
| `tags` | Array of strings | No | User-defined tags |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |
| `updatedAt` | ISO 8601 | Yes | Last modification |

### Asset-Specific Properties

**Cryptocurrency Only:**
- `coinId` - CoinGecko API ID (e.g., "bitcoin", "ethereum")

**Stock Only:**
- `exchange` - Stock exchange (NASDAQ, NYSE, LSE, etc.)
- `sector` - Market sector (Technology, Healthcare, Finance, etc.)

### Calculated Properties

```swift
struct Asset {
    // Not stored, calculated on-the-fly
    var currentValue: Decimal {
        quantity * currentPrice
    }

    var purchaseValue: Decimal {
        quantity * purchasePrice
    }

    var gainLoss: Decimal {
        currentValue - purchaseValue
    }

    var gainLossPercent: Decimal {
        guard purchaseValue != 0 else { return 0 }
        return (gainLoss / purchaseValue) * 100
    }

    var daysSinceFirstPurchase: Int {
        Calendar.current.dateComponents([.day],
            from: purchaseDate,
            to: Date()
        ).day ?? 0
    }
}
```

### Asset Storage Key

```swift
let key = "asset_\(assetId)"
// Example: "asset_x9y8z7w6v5u4"
```

---

## WealthSnapshot Schema

A wealth snapshot captures the user's total net worth at a specific point in time.

### WealthSnapshot Structure

```json
{
  "id": "snapshot-uuid-3456",
  "timestamp": "2026-04-09T00:00:00Z",
  "totalValue": 125000.50,
  "currency": "USD",
  "portfolios": [
    {
      "portfolioId": "portfolio-uuid-1234",
      "portfolioName": "Main Portfolio",
      "value": 100000.00,
      "included": true
    },
    {
      "portfolioId": "portfolio-uuid-5678",
      "portfolioName": "Alt Holdings",
      "value": 25000.50,
      "included": true
    }
  ],
  "breakdown": {
    "cryptoValue": 50000.00,
    "stockValue": 75000.50,
    "cryptoPercent": 40.0,
    "stockPercent": 60.0
  },
  "notes": "End of quarter snapshot"
}
```

### WealthSnapshot Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `timestamp` | ISO 8601 | Yes | When snapshot was taken |
| `totalValue` | Decimal | Yes | Total net worth |
| `currency` | String (ISO code) | Yes | Currency |
| `portfolios` | Array | Yes | Breakdown by portfolio |
| `breakdown` | Object | No | Asset type breakdown |
| `notes` | String | No | Optional user notes |

### Snapshot Strategy

- **Automatic:** Daily at midnight (background task)
- **Manual:** User taps "Take Snapshot" button
- **Retention:** Keep last 365 snapshots (1 year of daily)
- **Storage:** Compressed JSON in UserDefaults with archival to file

### Storage Key

```swift
let key = "snapshots"
// Value: Array of WealthSnapshot objects (JSON)
// Size limit: Periodically migrate old snapshots to archive file
```

---

## PriceAlert Schema

A price alert notifies the user when an asset's price crosses a threshold.

### PriceAlert Structure

```json
{
  "id": "alert-uuid-7890",
  "assetId": "asset-uuid-5678",
  "assetName": "Bitcoin",
  "assetSymbol": "BTC",
  "alertType": "above",
  "targetPrice": 50000.00,
  "targetCurrency": "USD",
  "enabled": true,
  "triggered": false,
  "triggeredAt": null,
  "lastNotificationDate": "2026-04-08T14:30:00Z",
  "notificationFrequency": "once",
  "createdAt": "2026-03-15T10:00:00Z",
  "updatedAt": "2026-04-09T15:30:00Z"
}
```

### PriceAlert Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `assetId` | UUID | Yes | Reference to asset |
| `assetName` | String | Yes | Denormalized name |
| `assetSymbol` | String | Yes | Denormalized symbol |
| `alertType` | Enum: "above", "below" | Yes | Trigger condition |
| `targetPrice` | Decimal | Yes | Threshold price |
| `targetCurrency` | String | Yes | Currency of target |
| `enabled` | Boolean | Yes | Whether alert is active |
| `triggered` | Boolean | Yes | Whether alert has triggered |
| `triggeredAt` | ISO 8601 or null | No | When triggered |
| `lastNotificationDate` | ISO 8601 | No | Last notification sent |
| `notificationFrequency` | Enum: "once", "daily", "every_time" | Yes | Notification behavior |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |
| `updatedAt` | ISO 8601 | Yes | Last modification |

### Alert Notification Rules

```swift
enum NotificationFrequency {
    case once          // Notify once, then disable alert
    case daily         // Notify once per day if still triggered
    case everyTime     // Notify every time price crosses threshold
}

// Implementation:
func checkAlerts(currentPrice: Decimal) {
    for alert in alerts where alert.enabled {
        let isTriggered = (alert.alertType == "above")
            ? currentPrice >= alert.targetPrice
            : currentPrice <= alert.targetPrice

        if isTriggered {
            switch alert.notificationFrequency {
            case .once:
                if !alert.triggered {
                    notify()
                    alert.triggered = true
                }
            case .daily:
                if shouldNotifyToday(lastNotificationDate: alert.lastNotificationDate) {
                    notify()
                    alert.lastNotificationDate = Date()
                }
            case .everyTime:
                notify()
            }
        }
    }
}
```

### Storage Key

```swift
let key = "priceAlerts"
// Value: Array of PriceAlert objects
```

---

## Watchlist Schema

A watchlist tracks assets the user doesn't own but wants to monitor.

### Watchlist Structure

```json
{
  "id": "watchlist-uuid-1111",
  "name": "Potential Investments",
  "type": "mixed",
  "isDefault": false,
  "items": [
    {
      "id": "watchitem-uuid-2222",
      "symbol": "ETH",
      "coinId": "ethereum",
      "name": "Ethereum",
      "type": "crypto",
      "currentPrice": 2800.00,
      "currency": "USD",
      "notes": "Layer 2 solutions growing",
      "addedAt": "2026-02-10T10:00:00Z"
    },
    {
      "id": "watchitem-uuid-3333",
      "symbol": "TSLA",
      "name": "Tesla Inc",
      "type": "stock",
      "currentPrice": 185.00,
      "currency": "USD",
      "exchange": "NASDAQ",
      "notes": "Waiting for better entry price",
      "addedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "createdAt": "2026-01-01T10:00:00Z",
  "updatedAt": "2026-04-09T15:30:00Z"
}
```

### Watchlist Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `name` | String | Yes | Watchlist name |
| `type` | Enum: "crypto", "stocks", "mixed" | Yes | Type filter |
| `isDefault` | Boolean | Yes | Is default watchlist |
| `items` | Array of WatchItem | No | Watched items |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |
| `updatedAt` | ISO 8601 | Yes | Last modification |

### WatchItem Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `symbol` | String | Yes | Ticker/symbol |
| `name` | String | Yes | Full name |
| `type` | Enum: "crypto", "stock" | Yes | Type |
| `coinId` | String | Conditional | CoinGecko ID (crypto only) |
| `exchange` | String | Conditional | Stock exchange (stock only) |
| `currentPrice` | Decimal | Yes | Current market price |
| `currency` | String | Yes | Price currency |
| `notes` | String | No | User notes |
| `addedAt` | ISO 8601 | Yes | When added |

### Storage Key

```swift
let key = "watchlists"
// Value: Array of Watchlist objects
```

---

## Dividend Schema

Track dividends and passive income from holdings.

### Dividend Structure

```json
{
  "id": "dividend-uuid-4444",
  "assetId": "asset-uuid-9012",
  "assetName": "Apple Inc",
  "assetSymbol": "AAPL",
  "quantity": 10,
  "dividendPerShare": 0.24,
  "paymentDate": "2026-03-15T00:00:00Z",
  "recordDate": "2026-03-01T00:00:00Z",
  "exDividendDate": "2026-02-28T00:00:00Z",
  "totalDividendAmount": 2.40,
  "currency": "USD",
  "type": "regular",
  "status": "paid",
  "notes": "Q1 dividend payment",
  "createdAt": "2026-02-28T10:00:00Z"
}
```

### Dividend Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `assetId` | UUID | Yes | Reference to asset |
| `assetName` | String | Yes | Denormalized name |
| `assetSymbol` | String | Yes | Denormalized symbol |
| `quantity` | Decimal | Yes | Shares held |
| `dividendPerShare` | Decimal | Yes | DPS amount |
| `paymentDate` | ISO 8601 | Yes | When paid |
| `recordDate` | ISO 8601 | Yes | Record date |
| `exDividendDate` | ISO 8601 | Yes | Ex-dividend date |
| `totalDividendAmount` | Decimal | Yes | Total received |
| `currency` | String | Yes | Currency |
| `type` | Enum: "regular", "special", "spin-off" | Yes | Dividend type |
| `status` | Enum: "pending", "ex", "paid" | Yes | Status |
| `notes` | String | No | User notes |
| `createdAt` | ISO 8601 | Yes | Creation timestamp |

### Dividend Calculations

```swift
struct DividendYield {
    var annualDividend: Decimal
    var currentPrice: Decimal

    // Dividend Yield = Annual Dividend / Current Price
    var yield: Decimal {
        guard currentPrice > 0 else { return 0 }
        return (annualDividend / currentPrice) * 100
    }
}

struct ProjectedAnnualIncome {
    var dividends: [Dividend]
    var currentQuantities: [AssetId: Decimal]

    // Sum all expected annual dividends based on current holdings
    var total: Decimal {
        dividends
            .filter { Calendar.current.isDateInThisYear($0.paymentDate) }
            .reduce(0) { $0 + $1.totalDividendAmount }
    }
}
```

### Storage Key

```swift
let key = "dividends_\(assetId)"
// Value: Array of Dividend objects for that asset
```

---

## Goal Schema

Financial goals with progress tracking.

### Goal Structure

```json
{
  "id": "goal-uuid-5555",
  "name": "Retirement Fund",
  "description": "Accumulate $1M for retirement",
  "type": "wealth_target",
  "targetAmount": 1000000.00,
  "currency": "USD",
  "currentAmount": 425000.50,
  "targetDate": "2040-01-01T00:00:00Z",
  "priority": "high",
  "portfolios": [
    "portfolio-uuid-1234"
  ],
  "category": "long-term",
  "created": "2020-01-01T10:00:00Z",
  "updated": "2026-04-09T15:30:00Z",
  "milestone": {
    "label": "500k by 2035",
    "targetAmount": 500000.00,
    "targetDate": "2035-01-01T00:00:00Z"
  }
}
```

### Goal Properties

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `name` | String | Yes | Goal name |
| `description` | String | No | Goal description |
| `type` | Enum: "wealth_target", "return_target", "allocation_target" | Yes | Goal type |
| `targetAmount` | Decimal | Conditional | Target value |
| `currency` | String | Yes | Currency |
| `currentAmount` | Decimal | No | Current progress |
| `targetDate` | ISO 8601 | Conditional | Target completion date |
| `priority` | Enum: "low", "medium", "high" | Yes | Priority level |
| `portfolios` | Array of UUID | No | Related portfolios |
| `category` | Enum: "short-term", "medium-term", "long-term" | Yes | Time horizon |
| `created` | ISO 8601 | Yes | Creation timestamp |
| `updated` | ISO 8601 | Yes | Last modification |
| `milestone` | Object | No | Intermediate milestone |

### Goal Progress Calculations

```swift
struct GoalProgress {
    var goal: Goal
    var currentAmount: Decimal

    var percentComplete: Decimal {
        guard goal.targetAmount > 0 else { return 0 }
        return (currentAmount / goal.targetAmount) * 100
    }

    var remainingAmount: Decimal {
        goal.targetAmount - currentAmount
    }

    var daysUntilTarget: Int {
        Calendar.current.dateComponents([.day],
            from: Date(),
            to: goal.targetDate
        ).day ?? 0
    }

    var requiredDailyIncrease: Decimal {
        guard daysUntilTarget > 0 else { return 0 }
        return remainingAmount / Decimal(daysUntilTarget)
    }

    var status: String {
        percentComplete >= 100 ? "Achieved" : "In Progress"
    }
}
```

### Storage Key

```swift
let key = "goals"
// Value: Array of Goal objects
```

---

## UserSettings Schema

Global user preferences and configuration.

### UserSettings Structure

```json
{
  "userId": "user-unique-id",
  "version": 2.93,
  "display": {
    "defaultCurrency": "USD",
    "theme": "system",
    "language": "en",
    "decimalPlaces": 2,
    "showHoldings": true,
    "showPercentageChange": true
  },
  "security": {
    "biometricsEnabled": true,
    "biometricType": "faceID",
    "requiresAuthentication": true,
    "authenticationTimeout": 300
  },
  "notifications": {
    "priceAlertsEnabled": true,
    "newsDigestEnabled": true,
    "newsDigestFrequency": "daily",
    "dailySnapshotEnabled": true,
    "snapshotTime": "00:00"
  },
  "backup": {
    "autoBackupEnabled": true,
    "autoBackupFrequency": "daily",
    "lastBackupDate": "2026-04-08T10:00:00Z",
    "backupCount": 15,
    "maxBackups": 24,
    "iCloudSyncEnabled": true
  },
  "privacy": {
    "crashReportsEnabled": true,
    "analyticsEnabled": true,
    "personalizationEnabled": false
  },
  "api": {
    "refreshInterval": 300,
    "priceUpdateFrequency": "realtime",
    "newsRefreshFrequency": 3600,
    "preferredPriceSource": "coingecko"
  },
  "createdAt": "2025-01-01T10:00:00Z",
  "updatedAt": "2026-04-09T15:30:00Z"
}
```

### UserSettings Properties

| Section | Field | Type | Default | Description |
|---------|-------|------|---------|-------------|
| display | defaultCurrency | String | USD | Display currency |
| display | theme | Enum | system | Light/Dark/System |
| display | language | String | en | Language code |
| display | decimalPlaces | Int | 2 | Decimal precision |
| display | showHoldings | Boolean | true | Show absolute values |
| display | showPercentageChange | Boolean | true | Show % changes |
| security | biometricsEnabled | Boolean | true | Enable biometrics |
| security | biometricType | Enum | faceID | Face ID / Touch ID |
| security | requiresAuthentication | Boolean | true | Require on open |
| security | authenticationTimeout | Int | 300 | Timeout in seconds |
| notifications | priceAlertsEnabled | Boolean | true | Price alerts on |
| notifications | newsDigestEnabled | Boolean | true | News on |
| notifications | dailySnapshotEnabled | Boolean | false | Daily snapshots |
| backup | autoBackupEnabled | Boolean | true | Auto backup |
| backup | iCloudSyncEnabled | Boolean | true | CloudKit sync |
| privacy | crashReportsEnabled | Boolean | true | Send crash reports |
| privacy | analyticsEnabled | Boolean | true | Send analytics |
| api | refreshInterval | Int | 300 | Price refresh (sec) |

### Storage Key

```swift
let key = "userSettings"
// Value: Single UserSettings object (JSON)
```

---

## Backup Format

Backup files are JSON with all app data in a single file.

### Backup File Structure

```json
{
  "version": "2.93",
  "exportDate": "2026-04-09T15:30:00Z",
  "appVersion": "2.93",
  "dataVersion": 1,
  "userSettings": { /* UserSettings object */ },
  "portfolios": [
    { /* Portfolio object */ },
    { /* Portfolio object */ }
  ],
  "assets": [
    { /* Asset object */ },
    { /* Asset object */ }
  ],
  "snapshots": [
    { /* WealthSnapshot object */ },
    { /* WealthSnapshot object */ }
  ],
  "priceAlerts": [
    { /* PriceAlert object */ },
    { /* PriceAlert object */ }
  ],
  "watchlists": [
    { /* Watchlist object */ },
    { /* Watchlist object */ }
  ],
  "dividends": [
    { /* Dividend object */ },
    { /* Dividend object */ }
  ],
  "goals": [
    { /* Goal object */ },
    { /* Goal object */ }
  ],
  "metadata": {
    "deviceId": "device-uuid",
    "deviceName": "iPhone 15 Pro",
    "osVersion": "17.4.1",
    "appStoreVersion": false,
    "totalRecords": 1250,
    "checksum": "sha256-hash-here"
  }
}
```

### Backup File Naming

```swift
// Filename pattern: Backup_YYYY-MM-DD_HHmmss.json
let filename = "Backup_\(DateFormatter.backupFileFormat.string(from: Date())).json"

// Example: "Backup_2026-04-09_153000.json"
```

### Backup Rotation

```swift
// Keep up to 24 backups
// Delete oldest when exceeding limit

func rotateBackups(maxCount: Int = 24) {
    let backups = getBackupFiles().sorted { $0.createdDate > $1.createdDate }
    for (index, backup) in backups.enumerated() {
        if index >= maxCount {
            try? FileManager.default.removeItem(at: backup.url)
        }
    }
}
```

### Backup Storage Location

```swift
// File location (not in iCloud):
let backupDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
let backupPath = backupDir.appendingPathComponent("Backups")

// Size consideration:
// Average backup: 200-500 KB
// 24 backups: 5-12 MB total
```

---

## CSV Export Formats

### 1. Tax Report (Capital Gains/Losses)

**Filename:** `TaxReport_2025.csv`

```csv
Symbol,Asset Name,Type,Quantity,Purchase Date,Purchase Price,Sale Date,Sale Price,Cost Basis,Proceeds,Gain/Loss,Gain/Loss %,Holding Period,Currency
BTC,Bitcoin,Cryptocurrency,0.5,2024-06-15,45000,2025-12-20,60000,22500,30000,7500,33.33%,Long-term,USD
AAPL,Apple Inc,Stock,10,2023-03-20,150.00,2026-01-15,180.00,1500,1800,300,20.00%,Long-term,USD
ETH,Ethereum,Cryptocurrency,2,2024-12-01,2500,2026-03-15,3000,5000,6000,1000,20.00%,Short-term,USD
```

**Fields:**
- Symbol, Asset Name, Type
- Quantity, Purchase Date, Purchase Price
- Sale Date, Sale Price
- Cost Basis (quantity * purchase price)
- Proceeds (quantity * sale price)
- Gain/Loss, Gain/Loss %
- Holding Period (short-term/long-term based on >1 year)
- Currency

### 2. Portfolio Holdings Report

**Filename:** `Portfolio_Holdings_2026-04-09.csv`

```csv
Portfolio,Symbol,Asset Name,Type,Quantity,Purchase Price,Current Price,Cost Basis,Current Value,Gain/Loss,Gain/Loss %,Purchase Date,Currency
Main Portfolio,BTC,Bitcoin,Cryptocurrency,0.5,45000,47000,22500,23500,1000,4.44%,2025-06-15,USD
Main Portfolio,ETH,Ethereum,Cryptocurrency,2,2500,2800,5000,5600,600,12.00%,2025-09-20,USD
Main Portfolio,AAPL,Apple Inc,Stock,10,175.50,178.25,1755,1782.50,27.50,1.57%,2025-03-20,USD
Alt Holdings,TSLA,Tesla Inc,Stock,5,200,185,1000,925,-75,-7.50%,2025-01-10,USD
```

### 3. Price History Export

**Filename:** `PriceHistory_BTC_2026-04-09.csv`

```csv
Date,Time,Symbol,Price,Currency,Volume,24h Change %
2026-04-09,15:30,BTC,47000,USD,35000000000,2.27
2026-04-09,15:00,BTC,46850,USD,34500000000,1.98
2026-04-08,23:59,BTC,46500,USD,33000000000,1.23
2026-04-08,12:00,BTC,45800,USD,32500000000,-0.50
```

### 4. Dividend Income Report

**Filename:** `Dividend_Income_2025.csv`

```csv
Symbol,Asset Name,Payment Date,Quantity,Dividend Per Share,Total Amount,Annual Yield %,Currency,Status
AAPL,Apple Inc,2025-03-15,10,0.24,2.40,0.14%,USD,Paid
AAPL,Apple Inc,2025-06-14,10,0.24,2.40,0.14%,USD,Paid
JPM,JP Morgan,2025-02-28,5,1.15,5.75,2.64%,USD,Paid
MSFT,Microsoft,2025-01-28,15,0.68,10.20,0.38%,USD,Paid
```

### 5. Net Worth History

**Filename:** `Wealth_History_2026.csv`

```csv
Date,Total Value,Crypto Value,Stock Value,Crypto %,Stock %,Portfolio Count,Currency
2026-04-09,125000.50,50000,75000.50,40.0%,60.0%,2,USD
2026-04-08,123500,49500,74000,40.1%,59.9%,2,USD
2026-04-07,122000,48000,74000,39.3%,60.7%,2,USD
2026-04-01,120000,47000,73000,39.2%,60.8%,2,USD
```

---

## Data Migration

### Schema Versioning

Each data object includes version metadata:

```swift
struct VersionedData: Codable {
    let dataVersion: Int = 1
    let appVersion: String = "2.93"
    let migrationTimestamp: Date?
}
```

### Migration from v2.0 to v2.93

**Breaking Changes:**
1. Portfolio ID format (UUID instead of integer)
2. Asset properties reorganized
3. Snapshot structure changed

**Migration Steps:**

```swift
func migrateDataToLatestVersion() {
    let currentVersion = (UserDefaults.standard.value(forKey: "dataVersion") as? Int) ?? 1

    switch currentVersion {
    case 1:
        migrateFromV1ToV2()
        fallthrough
    case 2:
        migrateFromV2ToV3()
        fallthrough
    default:
        // Current version, no migration needed
        UserDefaults.standard.set(3, forKey: "dataVersion")
    }
}

func migrateFromV1ToV2() {
    // V1: portfolios stored with integer IDs
    // V2: portfolios stored with UUID strings

    guard let v1Portfolios = UserDefaults.standard.array(forKey: "portfolios") else { return }

    let v2Portfolios = v1Portfolios.map { (portfolio: Any) in
        guard let dict = portfolio as? [String: Any] else { return [:] }

        var v2Dict = dict
        v2Dict["id"] = UUID().uuidString
        return v2Dict
    }

    UserDefaults.standard.set(v2Portfolios, forKey: "portfolios")
}
```

### Backward Compatibility

- Always support reading old data format
- Migrate on first app load
- Keep old files for 24 hours before deletion
- Log migrations for debugging

### Data Integrity Checks

```swift
struct DataIntegrityValidator {
    func validate() -> [String] {
        var errors: [String] = []

        // Check orphaned assets (asset without portfolio)
        assets.forEach { asset in
            if !portfolios.contains(where: { $0.id == asset.portfolioId }) {
                errors.append("Orphaned asset: \(asset.id)")
            }
        }

        // Check for duplicate IDs
        let assetIds = assets.map { $0.id }
        if assetIds.count != Set(assetIds).count {
            errors.append("Duplicate asset IDs found")
        }

        // Check for invalid currencies
        assets.forEach { asset in
            if !isValidISOCurrency(asset.currentCurrency) {
                errors.append("Invalid currency in asset: \(asset.id)")
            }
        }

        return errors
    }
}
```

### Recovery Process

If data is corrupted:
1. Detect corruption on app launch
2. Offer to restore from latest backup
3. If no backup, present recovery options:
   - Delete corrupted data and start fresh
   - Attempt to repair (remove orphaned records)
   - Report to analytics for debugging

---

## References

- JSON Schema: https://json-schema.org
- ISO 8601 DateTime: https://en.wikipedia.org/wiki/ISO_8601
- ISO 4217 Currency Codes: https://en.wikipedia.org/wiki/ISO_4217
- Apple Codable: https://developer.apple.com/documentation/foundation/codable
- CloudKit: https://developer.apple.com/documentation/cloudkit

