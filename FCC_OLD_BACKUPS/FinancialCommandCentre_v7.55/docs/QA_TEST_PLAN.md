# Portfolio App - Comprehensive QA Test Plan

## Table of Contents
1. [Test Scope](#test-scope)
2. [Test Case Organization](#test-case-organization)
3. [Feature Testing](#feature-testing)
4. [Device Matrix](#device-matrix)
5. [Regression Test Suite](#regression-test-suite)
6. [Performance Benchmarks](#performance-benchmarks)
7. [Edge Cases and Error Scenarios](#edge-cases-and-error-scenarios)
8. [Accessibility Testing](#accessibility-testing)

---

## Test Scope

The QA Test Plan covers testing for the Portfolio iOS app and React web companion. Tests are organized by feature area with comprehensive coverage of:
- Happy path functionality
- Edge cases and error handling
- Performance and load testing
- Accessibility compliance
- Security considerations
- Cross-platform compatibility

---

## Test Case Organization

### Test Case ID Format
- **Format**: `[PLATFORM]-[FEATURE]-[TEST-NUMBER]`
- **Example**: `iOS-PORT-001` (iOS Portfolio Test 001)
- **Platforms**: iOS, WEB
- **Features**: PORT (Portfolio), AST (Asset), CALC (Calculations), API (API Services), CURR (Currency), AUTH (Authentication), BACKUP (Backup), EXPORT (Export)

---

## Feature Testing

### 1. PORTFOLIO MANAGEMENT

#### iOS - TCP-001: Create New Portfolio
- **Priority**: P0
- **Description**: User creates a new portfolio with valid name
- **Steps**:
  1. Open Portfolio app
  2. Tap "+" button
  3. Enter portfolio name: "My First Portfolio"
  4. Tap "Create"
- **Expected Result**: Portfolio appears in list with correct name
- **Duration**: < 2 seconds

#### iOS - TCP-002: Portfolio Name Validation
- **Priority**: P0
- **Description**: Portfolio name validation enforces constraints
- **Steps**:
  1. Open Portfolio app
  2. Try to create portfolio with empty name
  3. Try to create portfolio with name > 100 characters
  4. Create portfolio with valid name (1-100 chars)
- **Expected Result**: Empty and long names rejected, valid name accepted
- **Valid Names**: 1-100 characters, alphanumeric and special chars

#### iOS - TCP-003: Duplicate Portfolio
- **Priority**: P1
- **Description**: User duplicates existing portfolio
- **Steps**:
  1. Long press on existing portfolio
  2. Select "Duplicate"
  3. Confirm duplication
- **Expected Result**: New portfolio created with "_copy" suffix, same assets

#### iOS - TCP-004: Delete Portfolio
- **Priority**: P0
- **Description**: User deletes portfolio with confirmation
- **Steps**:
  1. Long press on portfolio
  2. Select "Delete"
  3. Confirm deletion
- **Expected Result**: Portfolio removed from list, data cleared
- **Warning**: Show confirmation dialog

#### iOS - TCP-005: Max Portfolio Limit
- **Priority**: P1
- **Description**: User cannot exceed portfolio limit (free tier: 1, premium: 10)
- **Steps**:
  1. Create maximum portfolios for tier
  2. Attempt to create additional portfolio
- **Expected Result**: Add button disabled, upgrade prompt shown
- **Edge Case**: Premium subscription validation

#### iOS - TCP-006: Edit Portfolio Name
- **Priority**: P1
- **Description**: User edits portfolio name
- **Steps**:
  1. Tap portfolio settings
  2. Edit name field
  3. Save changes
- **Expected Result**: Name updated immediately
- **Duration**: < 1 second

#### WEB - TCP-007: Portfolio Search
- **Priority**: P1
- **Description**: Filter portfolios by search term
- **Steps**:
  1. Open portfolio list
  2. Type search term "Bitcoin"
  3. Verify results filtered
- **Expected Result**: Only matching portfolios shown
- **Case Sensitivity**: Case-insensitive search

#### WEB - TCP-008: Portfolio Sorting
- **Priority**: P1
- **Description**: Sort portfolios by name or value
- **Steps**:
  1. Click "Sort" button
  2. Select "Name" or "Value"
  3. Verify sort order
- **Expected Result**: Portfolios sorted in correct order
- **Options**: A-Z, Z-A, Value High-Low, Low-High

---

### 2. ASSET MANAGEMENT

#### iOS - AST-001: Add Asset to Portfolio
- **Priority**: P0
- **Description**: User adds new asset to portfolio
- **Steps**:
  1. Open portfolio
  2. Tap "Add Asset"
  3. Select crypto (BTC) or stock (AAPL)
  4. Enter quantity: 1.5, purchase price: 50000
  5. Tap "Add"
- **Expected Result**: Asset appears in list with correct data
- **Duration**: < 2 seconds

#### iOS - AST-002: Asset Name and Symbol Validation
- **Priority**: P0
- **Description**: Asset validation enforces required fields
- **Steps**:
  1. Try adding asset with empty name
  2. Try adding asset with empty symbol
  3. Try adding asset with negative quantity
  4. Try adding asset with zero/negative price
- **Expected Result**: All invalid inputs rejected with error message
- **Validation Rules**:
  - Name: 1-100 characters
  - Symbol: 2-10 characters
  - Quantity: > 0
  - Prices: > 0

#### iOS - AST-003: Edit Asset Details
- **Priority**: P0
- **Description**: User edits asset quantity and prices
- **Steps**:
  1. Tap edit on asset row
  2. Change quantity to 2.5
  3. Change purchase price to 52000
  4. Save changes
- **Expected Result**: Asset updated, P&L recalculated immediately
- **Duration**: < 1 second

#### iOS - AST-004: Delete Asset
- **Priority**: P0
- **Description**: User removes asset from portfolio
- **Steps**:
  1. Swipe asset left or tap delete
  2. Confirm deletion
- **Expected Result**: Asset removed, portfolio totals updated
- **UX**: Show undo option for 3 seconds

#### iOS - AST-005: Asset Max Limit
- **Priority**: P1
- **Description**: Enforce 20 asset maximum per portfolio
- **Steps**:
  1. Add 20 assets to portfolio
  2. Attempt to add 21st asset
- **Expected Result**: Add button disabled, message shown
- **Premium**: Allow 50 assets for premium tier

#### iOS - AST-006: Crypto vs Stock Identification
- **Priority**: P1
- **Description**: App correctly identifies asset type
- **Steps**:
  1. Add BTC (should be crypto)
  2. Add AAPL (should be stock)
  3. Verify correct pricing source
- **Expected Result**: Correct API called, prices accurate
- **Determination**: Symbol length, known list, user selection

#### iOS - AST-007: Asset Duplicate Detection
- **Priority**: P1
- **Description**: Warn user if adding duplicate asset
- **Steps**:
  1. Add Bitcoin to portfolio
  2. Try adding Bitcoin again
  3. Tap "Add Anyway" or "Cancel"
- **Expected Result**: Warning shown, user choice respected
- **UX**: Suggest merging instead

#### WEB - AST-008: Bulk Asset Import
- **Priority**: P2
- **Description**: Import assets from CSV file
- **Steps**:
  1. Click "Import Assets"
  2. Upload CSV with asset data
  3. Verify preview
  4. Confirm import
- **Expected Result**: All assets added to portfolio
- **CSV Format**: Name, Symbol, Quantity, PurchasePrice

---

### 3. PRICE CALCULATIONS

#### iOS - CALC-001: Profit/Loss Calculation
- **Priority**: P0
- **Description**: Profit/loss calculated correctly
- **Test Data**:
  - BTC: Qty=1, Purchase=$50k, Current=$60k
  - ETH: Qty=10, Purchase=$3k, Current=$4k
- **Expected**:
  - BTC P&L: +$10,000
  - ETH P&L: +$10,000
  - Portfolio: +$20,000
- **Duration**: Instant calculation

#### iOS - CALC-002: Profit/Loss Percentage
- **Priority**: P0
- **Description**: Return percentage calculated correctly
- **Test Data**: Qty=10, Purchase=$100, Current=$150
- **Expected**: 50.0%
- **Accuracy**: 2 decimal places minimum

#### iOS - CALC-003: Negative Profit/Loss
- **Priority**: P0
- **Description**: Losses shown with minus sign
- **Test Data**: Qty=10, Purchase=$100, Current=$50
- **Expected**: -$500 (-50.0%)
- **Display**: Red color, minus sign

#### iOS - CALC-004: Portfolio Totals
- **Priority**: P0
- **Description**: Portfolio sums calculated correctly
- **Totals to Test**:
  - Total Cost: Sum of (qty * purchase price)
  - Total Value: Sum of (qty * current price)
  - Total P&L: Total Value - Total Cost
  - Weighted Average: Total Cost / Total Qty
- **Accuracy**: Account for floating point precision

#### iOS - CALC-005: Zero Values Handling
- **Priority**: P1
- **Description**: Handle zero and undefined prices
- **Test Cases**:
  - Asset with no current price (show 0 or N/A)
  - Division by zero (purchase price = 0)
  - Zero quantity (should be invalid)
- **Expected**: No crashes, graceful degradation

#### iOS - CALC-006: Extreme Values
- **Priority**: P2
- **Description**: Handle very large and very small numbers
- **Test Cases**:
  - Qty = 1,000,000,000, Price = $0.00001
  - Qty = 0.00001, Price = $50,000
  - Price = $999,999,999.99
- **Expected**: Calculations accurate within floating point precision
- **Precision**: 8 decimal places minimum for crypto

#### iOS - CALC-007: Fractional Quantities
- **Priority**: P1
- **Description**: Support fractional asset quantities (common for crypto)
- **Test Data**: BTC qty = 2.5555, price = $50,000
- **Expected**: Calculations preserve precision
- **Display**: 4 decimal places for crypto

#### iOS - CALC-008: Currency Conversion
- **Priority**: P1
- **Description**: Convert between currencies accurately
- **Test Cases**:
  - USD to EUR (1:0.92)
  - EUR to GBP (1:0.73)
  - Multiple currency portfolio
- **Expected**: Conversion accurate to 2 decimal places
- **Rate Source**: Real-time from service

#### WEB - CALC-009: Real-Time P&L Updates
- **Priority**: P1
- **Description**: P&L updates when price updates
- **Steps**:
  1. Add asset with price $50k
  2. Simulate price update to $60k
  3. Verify P&L recalculates instantly
- **Duration**: < 100ms update

---

### 4. PRICE FEEDS & API INTEGRATION

#### iOS - API-001: CoinGecko Price Fetch
- **Priority**: P0
- **Description**: Fetch crypto prices from CoinGecko API
- **Test Assets**: BTC, ETH, ADA, DOGE
- **Expected**:
  - Prices retrieved successfully
  - Prices update within 5 minutes
  - No duplicates or null values
- **API Endpoint**: https://api.coingecko.com/api/v3/simple/price
- **Duration**: < 2 seconds for 10 assets

#### iOS - API-002: Finnhub Stock Prices
- **Priority**: P0
- **Description**: Fetch stock prices from Finnhub API
- **Test Assets**: AAPL, GOOGL, MSFT, TSLA
- **Expected**:
  - Prices retrieved successfully
  - Last trade time within 1 minute
  - All OHLC data available
- **Duration**: < 2 seconds per stock

#### iOS - API-003: Rate Limiting Handling
- **Priority**: P1
- **Description**: Handle API rate limits gracefully
- **Test**: Fetch 250+ cryptos in sequence
- **Expected**:
  - Requests queued and delayed
  - No data loss
  - User notification of delay
- **Rate Limit**: CoinGecko free tier ~10 calls/min

#### iOS - API-004: Price Caching
- **Priority**: P1
- **Description**: Cache prices to reduce API calls
- **Test**:
  1. Fetch BTC price
  2. Fetch BTC price again within 1 minute
  3. Check if cached or fetched
- **Expected**:
  - Cached for 1 minute by default
  - Settings allow cache duration change
  - Manual refresh bypasses cache
- **Cache Duration**: 1-60 minutes

#### iOS - API-005: Offline Price Updates
- **Priority**: P1
- **Description**: Handle offline gracefully
- **Test**:
  1. Load app with prices cached
  2. Turn off internet
  3. View portfolio
  4. Try price refresh
- **Expected**:
  - Cached prices shown
  - Refresh fails gracefully with message
  - No crashes
  - Retry button available

#### iOS - API-006: API Error Handling
- **Priority**: P0
- **Description**: Handle API errors gracefully
- **Test Cases**:
  - HTTP 404 (symbol not found)
  - HTTP 429 (rate limited)
  - HTTP 500 (server error)
  - Connection timeout
  - Invalid JSON response
- **Expected**: Error message shown, retry option available

#### iOS - API-007: Batch Price Requests
- **Priority**: P1
- **Description**: Efficiently request multiple prices
- **Test**: Request 50 different assets
- **Expected**:
  - Single API call (batch endpoint)
  - All prices retrieved
  - Duration < 3 seconds

#### WEB - API-008: Real-Time Price Updates
- **Priority**: P2
- **Description**: WebSocket connection for real-time prices
- **Test**:
  1. Open web app
  2. Add asset
  3. Monitor price updates
- **Expected**:
  - Prices update every 1-5 seconds
  - Live chart updates
  - No WebSocket errors

#### iOS - API-009: Historical Price Data
- **Priority**: P2
- **Description**: Fetch historical prices for charting
- **Test**: Fetch last 30 days of BTC prices
- **Expected**:
  - All 30 days returned
  - Data points correct
  - Sorted by date
- **API**: CoinGecko market_chart endpoint

---

### 5. AUTHENTICATION & SECURITY

#### iOS - AUTH-001: Face ID Authentication
- **Priority**: P0
- **Description**: Face ID login flow
- **Device**: iPhone with Face ID
- **Steps**:
  1. Launch app
  2. Present face to camera
  3. Verify successful unlock
- **Expected**: App unlocks within 2 seconds
- **Fallback**: Passcode entry on Face ID failure

#### iOS - AUTH-002: Touch ID Authentication
- **Priority**: P0
- **Description**: Touch ID login flow
- **Device**: iPhone with Touch ID
- **Steps**:
  1. Launch app
  2. Touch fingerprint sensor
  3. Verify successful unlock
- **Expected**: App unlocks within 1 second
- **Fallback**: Passcode entry on Touch ID failure

#### iOS - AUTH-003: Biometric Unavailable
- **Priority**: P1
- **Description**: Fallback to passcode when biometric unavailable
- **Test Cases**:
  - Face ID disabled in settings
  - Touch ID no fingerprints registered
  - Biometric sensor error
- **Expected**: Passcode prompt shown immediately

#### iOS - AUTH-004: Session Timeout
- **Priority**: P1
- **Description**: App locks after inactivity
- **Test**:
  1. Open app
  2. Wait 5 minutes without interaction
  3. Try accessing portfolio data
- **Expected**: Biometric/passcode required
- **Timeout Duration**: 5 minutes (configurable)

#### iOS - AUTH-005: Passcode Fallback
- **Priority**: P0
- **Description**: Manual passcode entry works
- **Steps**:
  1. Disable Face/Touch ID
  2. Launch app
  3. Enter 6-digit passcode
- **Expected**: App unlocks successfully
- **Passcode**: 6 digits, allow change

#### iOS - AUTH-006: Failed Authentication
- **Priority**: P1
- **Description**: Handle failed biometric attempts
- **Test**:
  1. Attempt Face ID 3 times unsuccessfully
  2. Attempt Touch ID 5 times unsuccessfully
- **Expected**:
  - Attempt counter shown
  - Fallback to passcode after limit
  - No account lockout
- **Attempt Limits**: Face ID 3, Touch ID 5

---

### 6. DATA PERSISTENCE & BACKUP

#### iOS - PERSIST-001: Save Portfolio Data
- **Priority**: P0
- **Description**: Portfolio data saved to device
- **Test**:
  1. Create portfolio with assets
  2. Kill app
  3. Restart app
- **Expected**: Portfolio data intact
- **Storage**: UserDefaults encrypted

#### iOS - PERSIST-002: Data Encryption
- **Priority**: P0
- **Description**: Portfolio data encrypted at rest
- **Test**:
  1. Create portfolio with sensitive data
  2. Check file encryption
- **Expected**: Data encrypted using iOS Keychain
- **Security**: AES-256 minimum

#### iOS - PERSIST-003: Create Backup
- **Priority**: P0
- **Description**: Manually create data backup
- **Steps**:
  1. Go to Settings
  2. Tap "Create Backup"
  3. Confirm backup creation
- **Expected**:
  - Backup file created
  - Success message shown
  - Backup listed
- **Format**: Encrypted JSON or binary

#### iOS - PERSIST-004: Restore Backup
- **Priority**: P0
- **Description**: Restore from backup file
- **Steps**:
  1. Go to Settings
  2. Tap "Restore Backup"
  3. Select backup from list
  4. Confirm restore
- **Expected**:
  - Data restored successfully
  - All portfolios and assets intact
  - No data loss
- **Warning**: Show confirmation dialog

#### iOS - PERSIST-005: Auto Backup
- **Priority**: P1
- **Description**: Automatic daily backup (premium feature)
- **Test**:
  1. Enable auto backup
  2. Wait for scheduled time
  3. Verify backup created
- **Expected**:
  - Backup created at 2 AM daily
  - Last 24 backups retained
  - Notification shown
- **Schedule**: Configurable

#### iOS - PERSIST-006: Backup Rotation
- **Priority**: P1
- **Description**: Delete old backups after limit
- **Test**: Create 25 backups
- **Expected**:
  - Only 24 most recent retained
  - Oldest automatically deleted
  - Storage optimized
- **Max Backups**: 24

#### iOS - PERSIST-007: Data Migration
- **Priority**: P1
- **Description**: Migrate data between app versions
- **Test**:
  1. Install previous app version
  2. Create data
  3. Update to new version
  4. Verify data intact
- **Expected**: All data migrated successfully
- **Versions**: Support last 2 major versions

#### iOS - PERSIST-008: Corrupted Data Recovery
- **Priority**: P1
- **Description**: Recover from corrupted data files
- **Test**:
  1. Corrupt local data file
  2. Launch app
  3. Verify recovery or restore option
- **Expected**:
  - Corruption detected
  - Restore from backup offered
  - Or start fresh option

#### iOS - PERSIST-009: Large Portfolio Performance
- **Priority**: P2
- **Description**: Handle large portfolios efficiently
- **Test**: Create portfolio with 100 assets
- **Expected**:
  - Save completes < 5 seconds
  - Load completes < 3 seconds
  - No memory leaks

---

### 7. CURRENCY SUPPORT

#### iOS - CURR-001: Default Currency
- **Priority**: P0
- **Description**: Set and change default currency
- **Test**:
  1. Go to Settings
  2. Change currency from USD to EUR
  3. Verify all values converted
- **Expected**:
  - Currency symbol updated
  - All values recalculated
  - Change persists after restart
- **Supported Currencies**: 25+ (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, etc.)

#### iOS - CURR-002: Currency Conversion Accuracy
- **Priority**: P0
- **Description**: Exchange rate conversion is accurate
- **Test Cases**:
  - $100 USD to EUR (should be ~€92)
  - €100 EUR to GBP (should be ~£73)
  - ¥100 JPY to USD (should be ~$0.67)
- **Expected**: Conversion accurate to 2 decimal places
- **Rate Source**: Real-time from API

#### iOS - CURR-003: Multi-Currency Portfolio
- **Priority**: P1
- **Description**: Handle assets in multiple currencies
- **Test**:
  1. Add USD stock (AAPL)
  2. Add EUR stock (SAP)
  3. Add GBP asset (FTSE)
  4. Convert to USD view
- **Expected**:
  - All assets converted to base currency
  - Portfolio total accurate
  - Individual asset currency shown

#### iOS - CURR-004: Currency Formatting
- **Priority**: P1
- **Description**: Format prices correctly per currency
- **Test Cases**:
  - USD: $1,234.56
  - EUR: 1.234,56 €
  - JPY: ¥1234 (no decimals)
  - GBP: £1,234.56
- **Expected**: Correct format per locale

#### iOS - CURR-005: Historical Rates
- **Priority**: P2
- **Description**: Use historical rates for past transactions
- **Test**: Create asset from 30 days ago with old rate
- **Expected**: Calculate P&L using rate from purchase date
- **Source**: Historical rate API

#### iOS - CURR-006: Crypto Pricing
- **Priority**: P0
- **Description**: Support crypto pricing in multiple currencies
- **Test**: Price BTC in USD, EUR, GBP, JPY
- **Expected**: All prices retrieved and accurate
- **Update Frequency**: Every 1-5 minutes

---

### 8. NOTIFICATIONS & ALERTS

#### iOS - NOTIF-001: Price Alert
- **Priority**: P1
- **Description**: Alert when price reaches target
- **Steps**:
  1. Set price alert for BTC: $65,000
  2. Simulate price update to $65,000
  3. Verify notification sent
- **Expected**:
  - Notification appears on lock screen
  - Sound (if enabled)
  - Tap opens portfolio
- **Permission**: Requires user permission

#### iOS - NOTIF-002: Portfolio Milestone
- **Priority**: P1
- **Description**: Alert when portfolio reaches value milestone
- **Steps**:
  1. Set milestone: Portfolio value = $100,000
  2. Update prices to trigger milestone
  3. Verify notification
- **Expected**:
  - Notification sent immediately
  - Shows milestone achieved
  - Celebrate moment

#### iOS - NOTIF-003: Large Loss Alert
- **Priority**: P1
- **Description**: Alert when portfolio drops > 10%
- **Steps**:
  1. Set 10% loss alert
  2. Simulate prices drop 15%
  3. Verify notification
- **Expected**:
  - Notification sent
  - Shows loss percentage
  - Current value shown

#### iOS - NOTIF-004: Notification Settings
- **Priority**: P1
- **Description**: Control notification preferences
- **Test**:
  1. Go to Settings
  2. Toggle notifications on/off
  3. Select notification types
  4. Change notification sound
- **Expected**: All settings persisted
- **Options**:
  - Enable/disable all
  - Price alerts
  - Portfolio milestones
  - Loss alerts
  - Backup reminders

#### iOS - NOTIF-005: Notification History
- **Priority**: P2
- **Description**: View past notifications
- **Test**:
  1. Trigger multiple notifications
  2. Open notification history
  3. Verify all listed
- **Expected**:
  - All notifications shown
  - Sortable by date
  - Can clear history

#### iOS - NOTIF-006: Notification Permissions
- **Priority**: P0
- **Description**: Request notification permissions
- **Test**:
  1. Fresh install
  2. First time trigger notification
  3. Permission prompt appears
- **Expected**:
  - Permission dialog shown
  - User can allow/deny
  - Respected for future

---

### 9. CHARTING & VISUALIZATION

#### iOS - CHART-001: Portfolio Value Chart
- **Priority**: P1
- **Description**: Display portfolio value over time
- **Test**:
  1. Add portfolio data over 30 days
  2. View chart
  3. Verify line is accurate
- **Expected**:
  - Line chart displayed
  - Y-axis shows values
  - X-axis shows dates
  - Smooth rendering

#### iOS - CHART-002: Asset Allocation Pie Chart
- **Priority**: P1
- **Description**: Show asset allocation as pie chart
- **Test**:
  1. Portfolio with 5 assets
  2. View allocation chart
  3. Tap on slice to highlight
- **Expected**:
  - Pie chart with correct proportions
  - Legend shows percentages
  - Interactive highlighting

#### iOS - CHART-003: Timeframe Selection
- **Priority**: P1
- **Description**: Switch between timeframes (1D, 1W, 1M, 1Y, All)
- **Test**:
  1. View chart in different timeframes
  2. Verify data points change
  3. Axis labels update
- **Expected**:
  - Smooth transitions
  - Accurate data range
  - Performance < 500ms

#### iOS - CHART-004: Chart Zoom/Pan
- **Priority**: P1
- **Description**: Zoom and pan on chart
- **Test**:
  1. Pinch to zoom on chart
  2. Drag to pan across timeline
  3. Double-tap to reset
- **Expected**:
  - Smooth animations
  - Data points remain accurate
  - Reset works

#### iOS - CHART-005: Performance Comparison
- **Priority**: P2
- **Description**: Compare multiple portfolios
- **Test**:
  1. Select 2-3 portfolios
  2. View comparison chart
  3. Toggle portfolios on/off
- **Expected**:
  - Multiple lines shown
  - Different colors
  - Legend identifies each

#### WEB - CHART-006: Export Chart as Image
- **Priority**: P2
- **Description**: Download chart as PNG
- **Steps**:
  1. Display chart
  2. Click export button
  3. Select PNG
  4. Verify download
- **Expected**: PNG image file downloaded
- **Resolution**: 1920x1080 minimum

#### WEB - CHART-007: Responsive Chart Sizing
- **Priority**: P1
- **Description**: Chart responds to window resize
- **Test**:
  1. Resize window to 375px (mobile)
  2. Verify chart readable
  3. Resize to 1920px (desktop)
- **Expected**:
  - Charts scale smoothly
  - Labels remain readable
  - No overlapping elements

---

### 10. EXPORT & TAX FEATURES

#### iOS - EXPORT-001: Export Portfolio as JSON
- **Priority**: P1
- **Description**: Export portfolio data as JSON
- **Steps**:
  1. Open portfolio
  2. Tap share menu
  3. Select "Export as JSON"
  4. Choose save location
- **Expected**:
  - JSON file created
  - All data included
  - Portable to other apps

#### iOS - EXPORT-002: Export as CSV (Excel)
- **Priority**: P1
- **Description**: Export asset data as CSV
- **Steps**:
  1. Tap export button
  2. Select "Export as CSV"
  3. Open in Excel/Numbers
- **Expected**:
  - CSV file with proper formatting
  - Headers included
  - All assets listed

#### iOS - EXPORT-003: Tax Report Generation
- **Priority**: P0
- **Description**: Generate tax report for accounting
- **Test**:
  1. Portfolio with multiple gains/losses
  2. Select date range (Jan 1 - Dec 31)
  3. Generate tax report
  4. Export as PDF
- **Expected**:
  - Report shows realized gains/losses
  - Organized by asset
  - Subtotals and total
  - Ready for tax filing
- **Format**: CSV and PDF

#### iOS - EXPORT-004: Realized vs Unrealized Gains
- **Priority**: P1
- **Description**: Calculate and report realized/unrealized gains
- **Test**:
  1. Asset purchased at $100, now $150 (unrealized +$50)
  2. Asset sold at $120, purchased at $100 (realized +$20)
- **Expected**:
  - Unrealized shown separately
  - Realized tracked by trade
  - Tax report accurate

#### iOS - EXPORT-005: Cost Basis Tracking
- **Priority**: P1
- **Description**: Track cost basis per asset
- **Methods Supported**:
  - FIFO (First In, First Out)
  - LIFO (Last In, First Out)
  - Average Cost
- **Test**: Sell shares purchased at different prices
- **Expected**: Cost basis calculated correctly

#### WEB - EXPORT-006: Bulk CSV Export
- **Priority**: P2
- **Description**: Export all portfolios at once
- **Steps**:
  1. Click "Export All"
  2. Select CSV format
  3. Verify file created
- **Expected**:
  - Single CSV with all portfolios
  - Portfolio name in first column
  - All data included

---

### 11. WEB-SPECIFIC FEATURES

#### WEB - WEB-001: Responsive Mobile Layout
- **Priority**: P1
- **Description**: App works on mobile browsers
- **Test**: Open in iPhone Safari at 375px width
- **Expected**:
  - Single column layout
  - Touch-friendly buttons (44x44px)
  - Hamburger menu for navigation
  - Horizontal scroll for tables

#### WEB - WEB-002: Responsive Tablet Layout
- **Priority**: P1
- **Description**: App optimized for tablets
- **Test**: Open in iPad Safari at 768px width
- **Expected**:
  - Two column layout
  - Sidebar visible
  - Full navigation shown

#### WEB - WEB-003: Responsive Desktop Layout
- **Priority**: P1
- **Description**: App optimized for desktop
- **Test**: Open in Chrome at 1920px width
- **Expected**:
  - Three column layout
  - Sidebar expanded
  - All features visible
  - Efficient use of space

#### WEB - WEB-004: Browser Compatibility
- **Priority**: P1
- **Description**: Test in multiple browsers
- **Browsers**:
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+
- **Expected**: Full functionality in all browsers
- **Fallbacks**: For older browsers if needed

#### WEB - WEB-005: Local Storage Persistence
- **Priority**: P0
- **Description**: Data persisted in browser
- **Test**:
  1. Create portfolio in web app
  2. Close browser
  3. Reopen app
  4. Verify data intact
- **Expected**: Local storage working correctly
- **Size Limit**: Handle up to 10MB

#### WEB - WEB-006: Theme Toggle
- **Priority**: P1
- **Description**: Switch between light/dark themes
- **Test**:
  1. Click theme toggle
  2. Switch to dark mode
  3. Verify all UI updates
  4. Persist after refresh
- **Expected**: Theme applied consistently
- **Storage**: Save preference in local storage

#### WEB - WEB-007: Keyboard Navigation
- **Priority**: P1
- **Description**: Full navigation with keyboard
- **Test**:
  1. Tab through all interactive elements
  2. Use arrow keys for menus
  3. Enter to select
  4. Escape to close
- **Expected**: All functions accessible via keyboard
- **Accessibility**: WCAG 2.1 Level AA

#### WEB - WEB-008: Print Friendly
- **Priority**: P2
- **Description**: Print portfolio and reports
- **Test**:
  1. Open portfolio
  2. Press Ctrl+P (Print)
  3. Verify layout
  4. Print to PDF
- **Expected**:
  - Clean print layout
  - Logo and title included
  - No unnecessary UI elements
  - Good spacing

---

## Device Matrix

### iOS Testing Devices

| Device | iOS Version | Screen | Priority |
|--------|-------------|--------|----------|
| iPhone 14 Pro | 17.x | 6.1" OLED | P0 |
| iPhone 14 | 17.x | 6.1" LCD | P0 |
| iPhone SE (3rd gen) | 17.x | 4.7" | P1 |
| iPhone 13 Pro Max | 17.x | 6.7" | P0 |
| iPad Pro 11" | 17.x | 11" | P1 |
| iPad Air | 17.x | 10.9" | P2 |

### Web Testing Environments

| Browser | Version | OS | Priority |
|---------|---------|-----|----------|
| Chrome | Latest | macOS | P0 |
| Chrome | Latest | Windows | P0 |
| Safari | Latest | macOS | P0 |
| Firefox | Latest | Windows | P1 |
| Edge | Latest | Windows | P1 |
| Safari | Latest | iOS | P0 |

---

## Regression Test Suite

Run this suite **before every release**:

### Pre-Release Checklist (15 minutes)

#### Core Functionality
- [ ] TCP-001: Create portfolio
- [ ] AST-001: Add asset to portfolio
- [ ] CALC-001: Profit/loss calculation
- [ ] API-001: CoinGecko price fetch
- [ ] API-002: Finnhub stock prices
- [ ] PERSIST-001: Save portfolio data
- [ ] PERSIST-003: Create backup
- [ ] CURR-001: Change currency

#### UI/UX
- [ ] TCP-004: Delete portfolio (no crashes)
- [ ] AST-004: Delete asset (undo works)
- [ ] CHART-001: Portfolio chart displays
- [ ] WEB-001: Mobile layout responsive
- [ ] WEB-003: Desktop layout functional

#### Authentication
- [ ] AUTH-001: Face ID works (iOS)
- [ ] AUTH-002: Touch ID works (iOS)
- [ ] AUTH-004: Session timeout works

#### Data Integrity
- [ ] PERSIST-004: Restore backup works
- [ ] PERSIST-008: Corrupted data handled
- [ ] CALC-005: Zero values handled

#### Error Handling
- [ ] API-006: API errors handled
- [ ] PERSIST-009: Large portfolio loads
- [ ] NOTIF-001: Notifications send

### Full Regression Suite (1 hour)

Run all test cases marked P0 and P1. See feature sections above.

---

## Performance Benchmarks

### iOS App Performance

| Metric | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| **App Launch** | < 1.5s | < 2.0s | > 3s |
| **Portfolio List Load** | < 500ms | < 1s | > 2s |
| **Asset List Load** | < 500ms | < 1s | > 2s |
| **Portfolio Detail Load** | < 1s | < 1.5s | > 2s |
| **Price Update** | < 100ms | < 200ms | > 500ms |
| **P&L Calculation** | < 50ms | < 100ms | > 200ms |
| **Chart Rendering** | < 1s | < 2s | > 3s |
| **Portfolio Save** | < 1s | < 2s | > 5s |
| **Backup Create** | < 5s | < 10s | > 30s |
| **Backup Restore** | < 5s | < 10s | > 30s |
| **Memory Usage** | < 100MB | < 150MB | > 200MB |
| **CPU Usage (Idle)** | < 5% | < 10% | > 20% |

### Web App Performance

| Metric | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| **Page Load (HTML)** | < 1s | < 2s | > 3s |
| **Interactive (TTI)** | < 2s | < 3s | > 5s |
| **First Paint** | < 1s | < 1.5s | > 2s |
| **Price Update** | < 100ms | < 200ms | > 500ms |
| **Chart Zoom** | < 200ms | < 500ms | > 1s |
| **Portfolio Search** | < 200ms | < 500ms | > 1s |
| **Bundle Size** | < 500KB | < 750KB | > 1MB |
| **API Response** | < 2s | < 3s | > 5s |

### Load Testing

#### Concurrent Users (Web)
- **10 Users**: No performance degradation
- **50 Users**: < 10% slower
- **100 Users**: < 25% slower
- **200+ Users**: Server should scale or show graceful degradation

#### Large Portfolios (iOS)
- **50 Assets**: No lag
- **100 Assets**: < 1 second load
- **200 Assets**: < 3 seconds load
- **500 Assets**: Consider archive/split

---

## Edge Cases and Error Scenarios

### Network Errors

#### Scenario: No Internet Connection
- **Steps**:
  1. Disable WiFi and cellular
  2. Open app
  3. Tap refresh prices
- **Expected**: Graceful error message, use cached data
- **Recovery**: Message to enable internet, retry button

#### Scenario: Intermittent Connection
- **Steps**:
  1. Toggle WiFi on/off rapidly
  2. App requests price updates
- **Expected**: Requests queue, retry automatically
- **Duration**: Max 30 seconds to resolve

#### Scenario: Slow Connection
- **Steps**:
  1. Enable WiFi throttling (edge speeds)
  2. Request price updates
- **Expected**: Loading indicator, no timeout < 5s
- **Fallback**: Use cached prices

#### Scenario: API Timeout
- **Steps**:
  1. Simulate API server down
  2. Request prices
- **Expected**: Timeout after 5s, use cache, show message
- **No Crash**: App remains stable

### Data Edge Cases

#### Scenario: Portfolio with 500 Assets
- **Expected**:
  - App opens
  - Load < 5 seconds
  - Scroll smooth
  - Calculations accurate

#### Scenario: Extremely Large Numbers
- **Data**: Qty = 1B, Price = $1000
- **Expected**:
  - Total = $1 trillion
  - Display correctly (no scientific notation confusion)
  - Calculation accurate

#### Scenario: Extremely Small Numbers
- **Data**: BTC Qty = 0.000001, Price = $50k
- **Expected**:
  - Value = $0.05
  - Display with 8 decimals
  - Calculation precise

#### Scenario: Negative Numbers
- **Data**: Qty = 10, Purchase = -$100 (impossible)
- **Expected**: Input validation rejects
- **Validation**: Purchase price > 0

#### Scenario: Zero Values
- **Data**: Purchase price = $0
- **Expected**:
  - P&L calculation handles gracefully
  - Return% shows Infinity or N/A
  - No crash

#### Scenario: Mixed Currencies
- **Data**: BTC in USD, EUR Stock in EUR, JPY ETF in JPY
- **Expected**:
  - All converted to base currency
  - Portfolio total accurate
  - Exchange rates applied

#### Scenario: Duplicate Assets
- **Data**: Two BTC entries in same portfolio
- **Expected**:
  - Warning on add
  - Option to combine or keep separate
  - If kept separate, totals correct

#### Scenario: Missing Historical Data
- **Data**: Asset added 2 years ago, price history incomplete
- **Expected**:
  - App handles gracefully
  - Shows available data
  - No crashes

### Calculation Edge Cases

#### Scenario: Precision Loss
- **Test**: (0.1 + 0.2) == 0.3 (floating point)
- **Expected**: Rounding correct to 2 decimal places
- **Method**: Use Decimal library or similar

#### Scenario: Very Old Trade
- **Data**: Asset from 1970
- **Expected**:
  - Calculation works
  - Date handling correct
  - No Y2K-like issues

#### Scenario: Future Trade Date
- **Data**: Asset purchase date in future
- **Expected**:
  - Validation rejects
  - Error message shown
  - Prevents data corruption

---

## Accessibility Testing

### iOS Accessibility

#### VoiceOver Testing
- [ ] App fully navigable with VoiceOver
- [ ] All buttons labeled correctly
- [ ] Charts have alt text
- [ ] Reading order logical
- [ ] No unlabeled input fields

#### Dynamic Type Testing
- [ ] Text readable at 200% font size
- [ ] Layout doesn't break
- [ ] Numbers remain precise
- [ ] Charts readable at all sizes

#### Color Contrast
- [ ] Minimum 4.5:1 contrast for text
- [ ] 3:1 for large text (18pt+)
- [ ] Profit/loss colors + labels (not color alone)

#### Motor Accessibility
- [ ] All functions accessible without gestures
- [ ] Minimum touch target 44x44pt
- [ ] Keyboard navigation support

### Web Accessibility

#### WCAG 2.1 Level AA Compliance
- [ ] All images have alt text
- [ ] Form labels associated
- [ ] Color not sole means of conveying info
- [ ] Keyboard navigation complete
- [ ] Focus visible
- [ ] Captions for video (if any)
- [ ] Sufficient color contrast (4.5:1)
- [ ] No focus traps
- [ ] Error messages clear
- [ ] Link text descriptive

#### Screen Reader Testing
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (Mac)
- [ ] TalkBack (Android if applicable)

---

## Test Result Tracking

### Tracking Template

```
Test Run: [Date] [Build Version]
Tester: [Name]
Platform: iOS / Web
Device: [Device Model]
OS Version: [Version]

Results:
- Total Tests:
- Passed:
- Failed:
- Blocked:
- Duration:

Failures:
1. [Test ID]: [Description]
   - Issue:
   - Severity: P0/P1/P2/P3
   - Reproducible: Yes/No
   - Screenshot: [Attached]

Notes:
[Any observations, environmental factors, etc.]
```

---

## Sign-Off Criteria

Release is approved when:
- All P0 tests pass
- At least 95% of P1 tests pass
- At least 80% of P2 tests pass
- No critical performance regressions
- No security vulnerabilities
- Accessibility testing complete
- Device matrix coverage complete
- Backup/restore working
- API integration verified

---

**Document Version**: 1.0
**Last Updated**: 2024-04-09
**Owner**: QA Team
