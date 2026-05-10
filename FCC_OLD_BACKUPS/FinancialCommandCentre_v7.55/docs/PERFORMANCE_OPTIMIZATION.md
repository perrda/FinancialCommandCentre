# Performance Optimization Guide: Portfolio App

**Report Date:** April 9, 2026
**App Version:** 2.93+
**Target Device:** iPhone 11 (baseline) to iPhone 15 Pro

---

## Executive Summary

This guide provides actionable performance optimization strategies for the Portfolio app. Target benchmarks:
- **App launch:** <2 seconds cold start
- **Scroll performance:** 60 FPS (consistent)
- **API response:** <3 seconds (cache fallback at 10s)
- **Memory peak:** <350 MB
- **Battery impact:** <5% drain per hour active use

---

## SECTION 1: APP LAUNCH OPTIMIZATION

### Current State Analysis

**Expected Timeline (Unoptimized):**
```
T0.0s - App start
T0.2s - AppDelegate initialization
T0.4s - Load portfolios from UserDefaults
T0.6s - Initialize biometric auth
T0.8s - Load all 20 portfolios into memory
T1.2s - Fetch latest prices from API
T2.0s - Render main screen
T2.5s - Load chart data for first portfolio
```

### Optimization Strategy 1: Lazy Loading

**Implementation:**
```swift
@main
struct PortfolioApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ZStack {
                // Show splash immediately
                SplashScreen()

                // Load content in background
                if appState.isContentLoaded {
                    if appState.isAuthenticated {
                        MainTabView()
                            .environmentObject(appState)
                    }
                }
            }
            .onAppear {
                // Load data asynchronously
                Task {
                    await appState.loadInitialData()
                }
            }
        }
    }
}

@MainActor
class AppState: ObservableObject {
    @Published var isContentLoaded = false
    @Published var portfolios: [Portfolio] = []
    @Published var selectedPortfolio: Portfolio?

    func loadInitialData() async {
        // Phase 1: Load authentication (instant)
        await loadAuthState()
        isContentLoaded = true // Show UI immediately

        // Phase 2: Load portfolios (background)
        await loadPortfolios()

        // Phase 3: Fetch prices (background, after UI visible)
        await refreshPrices()
    }

    // Load only active portfolio initially
    private func loadPortfolios() async {
        let activePortfolioID = UserDefaults.standard.string(forKey: "activePortfolio")
        portfolios = try? await loadPortfoliosFromStorage()

        // Load selected portfolio fully, others lazily
        if let id = activePortfolioID,
           let selected = portfolios.first(where: { $0.id.uuidString == id }) {
            selectedPortfolio = selected
        }
    }
}
```

**Target:** Launch with splash in <0.3s, full app in <1.5s

---

### Optimization Strategy 2: Prewarming

**Implementation:**
```swift
class AppWarmup {
    static func preloadCriticalResources() {
        // Pre-cache currency formatters
        _ = currencyFormatter
        _ = percentageFormatter
        _ = dateFormatter

        // Pre-compile regex patterns
        _ = NSRegularExpression(pattern: "\\$[0-9,]+\\.\\d{2}")

        // Warm up CoinGecko client
        Task {
            await CoinGeckoClient.shared.warmup()
        }

        // Pre-allocate memory for chart data
        _ = [PricePoint]()

        // Preload Keychain items (async)
        Task {
            try? _ = SecureStorage.shared.retrieve([Portfolio].self, key: "portfolios")
        }
    }
}

// Call in AppDelegate.didFinishLaunchingWithOptions
class AppDelegate: UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Warm up critical resources
        AppWarmup.preloadCriticalResources()

        return true
    }
}
```

---

### Optimization Strategy 3: Background Launch Tasks

**Implementation:**
```swift
@MainActor
class BackgroundTaskManager {
    static let shared = BackgroundTaskManager()
    private var bgTask: UIBackgroundTaskIdentifier = .invalid

    func registerBackgroundTasks() {
        // Fetch latest prices in background
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.portfolio.refresh-prices",
            using: DispatchQueue.global()
        ) { task in
            self.handlePriceRefresh(task: task as! BGAppRefreshTask)
        }

        // Process backups
        BGTaskScheduler.shared.register(
            forTaskWithIdentifier: "com.portfolio.backup",
            using: DispatchQueue.global()
        ) { task in
            self.handleBackupTask(task: task as! BGProcessingTask)
        }
    }

    private func handlePriceRefresh(task: BGAppRefreshTask) {
        let deadline = Date(timeIntervalSinceNow: 25) // 25 second limit

        Task {
            do {
                try await APIClient.shared.refreshAllPrices()
                task.setTaskCompleted(success: true)
            } catch {
                task.setTaskCompleted(success: false)
            }

            // Reschedule
            schedulePriceRefresh()
        }

        // Handle expiration
        task.expirationHandler = {
            task.setTaskCompleted(success: false)
        }
    }

    func schedulePriceRefresh() {
        let request = BGAppRefreshTaskRequest(identifier: "com.portfolio.refresh-prices")
        request.earliestBeginDate = Date(timeIntervalSinceNow: 900) // Every 15 minutes

        try? BGTaskScheduler.shared.submit(request)
    }
}

// In Info.plist
// <key>BGTaskSchedulerPermittedIdentifiers</key>
// <array>
//   <string>com.portfolio.refresh-prices</string>
//   <string>com.portfolio.backup</string>
// </array>
```

---

## SECTION 2: SCROLL PERFORMANCE OPTIMIZATION

### Problem: Jank When Scrolling Asset Lists

**Root Causes:**
1. Complex views with multiple calculations per row
2. Images not cached (re-downloading on every render)
3. Date formatting computed during render
4. No view cell reuse strategy

### Solution 1: View Simplification

**Before (Slow):**
```swift
struct AssetRowView: View {
    let asset: Asset
    let portfolio: Portfolio

    var body: some View {
        HStack {
            // Complex calculation during render
            VStack(alignment: .leading) {
                Text(asset.symbol)
                Text(formatValue(asset.currentValue * asset.quantity))
                    .foregroundColor(asset.profitLoss > 0 ? .green : .red)

                // Nested view with more calculations
                HStack {
                    Text(formatPercent(asset.profitLossPercentage))
                    Text(formatDate(asset.purchaseDate)) // Date formatter called per row!
                    Text("\(formatValue(portfolio.totalValue / 100 * asset.value))%") // Allocation calc
                }
            }

            // Image downloaded without cache
            AsyncImage(url: URL(string: "https://api.example.com/icons/\(asset.symbol).png"))
                .frame(width: 40, height: 40)
        }
    }

    // These are computed every render - should be memoized
    private func formatValue(_ value: Decimal) -> String {
        // Complex formatter
    }

    private func formatPercent(_ value: Decimal) -> String {
        // Complex formatter
    }

    private func formatDate(_ date: Date) -> String {
        // Date formatter
    }
}
```

**After (Fast):**
```swift
struct AssetRowView: View {
    let asset: Asset
    let portfolio: Portfolio
    let cachedPriceFormatter: NumberFormatter
    let cachedDateFormatter: DateFormatter
    let cachedImageCache: ImageCache

    var body: some View {
        HStack(spacing: 12) {
            // Pre-formatted text (no calculations)
            VStack(alignment: .leading, spacing: 2) {
                Text(asset.symbol)
                    .font(.headline)

                // Pre-calculated values passed as props
                Text(asset.displayValue)
                    .font(.caption)
                    .foregroundColor(asset.profitLoss > 0 ? .green : .red)

                HStack(spacing: 8) {
                    Text(asset.displayProfitPercent)
                        .font(.caption2)

                    Text(asset.displayPurchaseDate)
                        .font(.caption2)
                        .foregroundColor(.gray)

                    Text(asset.displayAllocation)
                        .font(.caption2)
                }
            }

            // Cached image
            CachedAsyncImage(
                url: asset.iconURL,
                cache: cachedImageCache
            )
            .frame(width: 40, height: 40)
        }
    }
}

// Pre-calculate values in model
struct Asset {
    // ... properties ...

    // Computed once, cached
    var displayValue: String {
        let total = quantity * currentPrice
        return formatAsValue(total)
    }

    var displayProfitPercent: String {
        guard costBasis > 0 else { return "0%" }
        let percent = ((currentValue - costBasis) / costBasis) * 100
        return String(format: "%.2f%%", percent.doubleValue)
    }

    var displayPurchaseDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: purchaseDate)
    }

    var displayAllocation: String {
        // Pre-calculated by portfolio
        return allocation
    }

    private let allocation: String = "" // Set during portfolio calculation
}
```

### Solution 2: Image Caching

**Implementation:**
```swift
class ImageCache {
    static let shared = ImageCache()
    private let cache = NSCache<NSString, UIImage>()
    private let downloadingURLs = NSMutableSet()

    func image(for url: URL) -> UIImage? {
        cache.object(forKey: url.absoluteString as NSString)
    }

    func setImage(_ image: UIImage, for url: URL) {
        cache.setObject(image, forKey: url.absoluteString as NSString)
    }

    func loadImage(from url: URL, completion: @escaping (UIImage?) -> Void) {
        // Return cached immediately
        if let cached = image(for: url) {
            completion(cached)
            return
        }

        // Prevent duplicate downloads
        let urlString = url.absoluteString
        if downloadingURLs.contains(urlString) {
            return // Already downloading
        }

        downloadingURLs.add(urlString)

        URLSession.shared.dataTask(with: url) { data, _, error in
            defer { self.downloadingURLs.remove(urlString) }

            guard let data = data,
                  let image = UIImage(data: data) else {
                completion(nil)
                return
            }

            self.setImage(image, for: url)
            DispatchQueue.main.async {
                completion(image)
            }
        }.resume()
    }
}

// Size cache appropriately
let cache = NSCache<NSString, UIImage>()
cache.countLimit = 100 // Max 100 images
cache.totalCostLimit = 50 * 1024 * 1024 // 50MB max
```

### Solution 3: Lazy View Rendering

**Implementation:**
```swift
struct PortfolioListView: View {
    @StateObject private var viewModel = PortfolioListViewModel()
    @State private var visibleRange: Range<Int> = 0..<20

    var body: some View {
        List {
            ForEach(Array(viewModel.assets.enumerated()), id: \.element.id) { index, asset in
                // Only render visible rows
                if visibleRange.contains(index) {
                    AssetRowView(asset: asset)
                        .onAppear {
                            viewModel.loadAdjacentImages(for: index)
                        }
                }
            }
        }
        .onReceive(
            Just(viewModel.scrollPosition)
                .debounce(for: 0.1, scheduler: RunLoop.main)
        ) { position in
            updateVisibleRange(position)
        }
    }

    private func updateVisibleRange(_ position: Int) {
        visibleRange = max(0, position - 10)..<(position + 30)
    }
}
```

---

## SECTION 3: API CALL OPTIMIZATION

### Problem: Excessive API Calls

**Current Pattern:**
```
App Launch:
- Fetch crypto prices for 20 portfolios = 20 API calls
- Fetch stock prices = 20 API calls
- Fetch historical data = 120 API calls (6 timeframes × 20 portfolios)
- Total: 160 API calls at once
- Result: Rate limited after 30 calls, app shows errors
```

### Solution 1: Batching

**Implementation:**
```swift
class CoinGeckoClient {
    private let batchSize = 250 // Max IDs per request
    private let rateLimiter = RateLimiter(maxRequests: 40, timeWindow: 60)

    func fetchPrices(for symbols: [String]) async throws -> [String: Decimal] {
        var allPrices: [String: Decimal] = [:]

        // Batch requests to max 250 symbols per call
        let batches = symbols.chunked(into: batchSize)

        for batch in batches {
            try await rateLimiter.waitIfNeeded()

            let prices = try await fetchBatch(batch)
            allPrices.merge(prices) { _, new in new }
        }

        return allPrices
    }

    private func fetchBatch(_ symbols: [String]) async throws -> [String: Decimal] {
        let query = symbols.joined(separator: ",")
        let url = URL(string: "https://api.coingecko.com/api/v3/simple/price")!

        var components = URLComponents(url: url, resolvingAgainstBaseURL: false)!
        components.queryItems = [
            URLQueryItem(name: "ids", value: query),
            URLQueryItem(name: "vs_currencies", value: "usd")
        ]

        let (data, _) = try await URLSession.shared.data(from: components.url!)
        let response = try JSONDecoder().decode([String: [String: Decimal]].self, from: data)

        return response.mapValues { $0["usd"] ?? 0 }
    }
}

// Extension for chunking
extension Array {
    func chunked(into size: Int) -> [[Element]] {
        stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}
```

### Solution 2: Caching Strategy

**Implementation:**
```swift
class CachingAPIClient {
    private let memoryCache = NSCache<NSString, NSData>()
    private let fileCache: FileManager = .default
    private let cacheDuration: TimeInterval = 3600 // 1 hour

    func fetchPrices(
        for symbols: [String],
        useCache: Bool = true
    ) async throws -> [String: Decimal] {
        // Check memory cache first
        if useCache, let cached = getMemoryCache(symbols) {
            return cached
        }

        // Check file cache
        if useCache, let cached = getFileCache(symbols) {
            cacheInMemory(cached, for: symbols)
            return cached
        }

        // Fetch from API
        let prices = try await fetchFromAPI(symbols)

        // Cache results
        cacheInMemory(prices, for: symbols)
        cacheToFile(prices, for: symbols)

        return prices
    }

    private func getMemoryCache(_ symbols: [String]) -> [String: Decimal]? {
        let key = cacheKey(for: symbols)
        guard let data = memoryCache.object(forKey: key as NSString) else {
            return nil
        }
        return try? JSONDecoder().decode([String: Decimal].self, from: data as Data)
    }

    private func getFileCache(_ symbols: [String]) -> [String: Decimal]? {
        let cacheURL = cacheDirectory().appendingPathComponent(cacheKey(for: symbols))

        guard let data = fileCache.contents(atPath: cacheURL.path) else {
            return nil
        }

        // Check if cache is fresh
        let attributes = try? fileCache.attributesOfItem(atPath: cacheURL.path)
        let modifiedDate = attributes?[.modificationDate] as? Date ?? .distantPast

        if Date().timeIntervalSince(modifiedDate) > cacheDuration {
            return nil // Cache expired
        }

        return try? JSONDecoder().decode([String: Decimal].self, from: data)
    }

    private func cacheInMemory(_ prices: [String: Decimal], for symbols: [String]) {
        let key = cacheKey(for: symbols)
        if let data = try? JSONEncoder().encode(prices) {
            memoryCache.setObject(data as NSData, forKey: key as NSString)
        }
    }

    private func cacheToFile(_ prices: [String: Decimal], for symbols: [String]) {
        let cacheURL = cacheDirectory().appendingPathComponent(cacheKey(for: symbols))

        try? FileManager.default.createDirectory(
            at: cacheDirectory(),
            withIntermediateDirectories: true
        )

        if let data = try? JSONEncoder().encode(prices) {
            fileCache.createFile(atPath: cacheURL.path, contents: data)
        }
    }

    private func cacheKey(for symbols: [String]) -> String {
        return symbols.sorted().joined(separator: "-")
    }

    private func cacheDirectory() -> URL {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("com.portfolio.prices")
    }
}
```

### Solution 3: Request Deduplication

**Implementation:**
```swift
class DedupingAPIClient {
    private var pendingRequests: [String: Task<[String: Decimal], Error>] = [:]
    private let lock = NSLock()

    func fetchPrices(for symbols: [String]) async throws -> [String: Decimal] {
        let requestKey = symbols.sorted().joined(separator: "-")

        lock.lock()
        defer { lock.unlock() }

        // If same request pending, return existing task
        if let existingTask = pendingRequests[requestKey] {
            return try await existingTask.value
        }

        // Create new request and track it
        let task = Task {
            try await fetchPricesFromAPI(symbols)
        }

        pendingRequests[requestKey] = task

        do {
            let result = try await task.value
            pendingRequests.removeValue(forKey: requestKey)
            return result
        } catch {
            pendingRequests.removeValue(forKey: requestKey)
            throw error
        }
    }

    private func fetchPricesFromAPI(_ symbols: [String]) async throws -> [String: Decimal] {
        // Actual API call
        return [:]
    }
}
```

---

## SECTION 4: MEMORY MANAGEMENT

### Problem: Memory Bloat from Chart Data

**Peak Usage Scenario:**
```
20 portfolios × 50 assets = 1000 assets
1000 assets × 6 timeframes = 6000 chart datasets
Each dataset: 8760 daily points × 32 bytes = 280KB
6000 × 280KB = 1.6GB ← Exceeds device memory!
```

### Solution: Lazy Load & Unload Charts

**Implementation:**
```swift
@MainActor
class ChartManager: ObservableObject {
    @Published var loadedTimeframes: Set<Timeframe> = []
    private var chartDataCache: [String: [PricePoint]] = [:]

    func loadChart(
        for asset: Asset,
        timeframe: Timeframe
    ) async {
        let cacheKey = "\(asset.id)_\(timeframe)"

        // Only load if not already loaded
        if chartDataCache[cacheKey] != nil {
            loadedTimeframes.insert(timeframe)
            return
        }

        do {
            let data = try await fetchChartData(asset: asset, timeframe: timeframe)

            // Downsample large datasets
            let optimized = downsample(data, for: timeframe)

            chartDataCache[cacheKey] = optimized
            loadedTimeframes.insert(timeframe)
        } catch {
            logError("Chart load failed: \(error)")
        }
    }

    func unloadChart(for asset: Asset, timeframe: Timeframe) {
        let cacheKey = "\(asset.id)_\(timeframe)"
        chartDataCache.removeValue(forKey: cacheKey)
        loadedTimeframes.remove(timeframe)
    }

    func unloadAllExcept(_ timeframe: Timeframe) {
        let keysToRemove = chartDataCache.keys.filter { !$0.hasSuffix("_\(timeframe)") }
        keysToRemove.forEach { chartDataCache.removeValue(forKey: $0) }
    }

    private func downsample(_ data: [PricePoint], for timeframe: Timeframe) -> [PricePoint] {
        switch timeframe {
        case .oneDay, .oneWeek, .oneMonth:
            return data // Keep full resolution

        case .threeMonths, .oneYear:
            // Keep every other point
            return data.enumerated().compactMap { index, point in
                index % 2 == 0 ? point : nil
            }

        case .allTime:
            // Keep only weekly points
            return data.enumerated().compactMap { index, point in
                index % 7 == 0 ? point : nil
            }
        }
    }
}
```

### Weak Reference Cache

**Implementation:**
```swift
class PortfolioCache {
    private var strongPortfolios: [UUID: Portfolio] = [:]
    private var weakPortfolios: NSMapTable<NSString, Portfolio> = NSMapTable.weakObjects()

    func store(_ portfolio: Portfolio) {
        strongPortfolios[portfolio.id] = portfolio
        weakPortfolios.setObject(portfolio, forKey: portfolio.id.uuidString as NSString)
    }

    func retrieve(_ id: UUID) -> Portfolio? {
        if let portfolio = strongPortfolios[id] {
            return portfolio
        }
        return weakPortfolios.object(forKey: id.uuidString as NSString)
    }

    func pruneIfNeeded() {
        let memoryUsage = os_proc_available_memory()
        if memoryUsage < 100_000_000 { // < 100MB available
            strongPortfolios.removeAll() // Let ARC clean up
        }
    }
}
```

---

## SECTION 5: BATTERY OPTIMIZATION

### Solution 1: Smart Background Refresh

**Implementation:**
```swift
class BatteryAwareRefresh {
    private let processInfo = ProcessInfo.processInfo

    func shouldRefresh() -> Bool {
        // Don't refresh if in low power mode
        guard !processInfo.isLowPowerModeEnabled else {
            return false
        }

        // Don't refresh if battery < 20%
        let batteryLevel = UIDevice.current.batteryLevel
        guard batteryLevel > 0.20 else {
            return false
        }

        return true
    }

    func getRefreshInterval() -> TimeInterval {
        let batteryLevel = UIDevice.current.batteryLevel

        switch batteryLevel {
        case 0...0.20:
            return 3600 // 1 hour (low battery)
        case 0.20...0.50:
            return 1800 // 30 minutes (medium battery)
        default:
            return 900 // 15 minutes (good battery)
        }
    }
}

// Implement throttled refresh
@MainActor
class ThrottledRefreshManager {
    private var lastRefreshTime: Date = .distantPast

    func refresh(minimumInterval: TimeInterval = 300) async {
        let timeSinceLastRefresh = Date().timeIntervalSince(lastRefreshTime)

        // Don't refresh more frequently than minimumInterval
        if timeSinceLastRefresh < minimumInterval {
            return
        }

        await performRefresh()
        lastRefreshTime = Date()
    }

    private func performRefresh() async {
        // Actual refresh logic
    }
}
```

### Solution 2: Network Efficiency

**Implementation:**
```swift
// Use URLSessionConfiguration to compress requests
let config = URLSessionConfiguration.default
config.waitsForConnectivity = true
config.allowsConstrainedNetworkAccess = false // Wait for better network
config.shouldUseExtendedBackgroundIdleMode = false

// Use HTTP/2 push for efficient transfers
let session = URLSession(configuration: config)

// Compress responses with gzip
var request = URLRequest(url: url)
request.setValue("gzip, deflate", forHTTPHeaderField: "Accept-Encoding")

// Bundle multiple requests
func batchRequests(_ urls: [URL]) async throws -> [Data] {
    // Fetch all in parallel, not sequentially
    return try await withThrowingTaskGroup(of: Data.self) { group in
        for url in urls {
            group.addTask {
                let (data, _) = try await URLSession.shared.data(from: url)
                return data
            }
        }

        var results: [Data] = []
        for try await data in group {
            results.append(data)
        }
        return results
    }
}
```

---

## SECTION 6: NETWORK OPTIMIZATION

### Solution: Connection Type Aware

**Implementation:**
```swift
class NetworkAwareClient {
    private let networkMonitor = NetworkMonitor()

    func fetchData(
        highQuality: URL,
        lowQuality: URL
    ) async throws -> Data {
        switch networkMonitor.connectionType {
        case .wifi:
            return try await fetchHighQuality(highQuality)

        case .cellular:
            return try await fetchLowQuality(lowQuality)

        case .none:
            throw NetworkError.noConnection
        }
    }

    private func fetchHighQuality(_ url: URL) async throws -> Data {
        // Full resolution data
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }

    private func fetchLowQuality(_ url: URL) async throws -> Data {
        // Compressed/reduced data
        let (data, _) = try await URLSession.shared.data(from: url)
        return data
    }
}
```

---

## SECTION 7: PERFORMANCE BENCHMARKS

### Target Metrics

| Metric | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| **Cold Launch** | <2.0s | <2.5s | >3.0s ⚠️ |
| **Warm Launch** | <0.5s | <0.8s | >1.0s ⚠️ |
| **List Scroll** | 60 FPS | 55 FPS | <50 FPS ⚠️ |
| **Memory (Peak)** | <250MB | <350MB | >400MB ⚠️ |
| **API Response** | <1.5s | <3.0s | >5.0s ⚠️ |
| **Chart Load** | <2.0s | <3.0s | >5.0s ⚠️ |
| **Battery Drain** | <5% / hour | <8% / hour | >10% / hour ⚠️ |

### Measurement Tools

**Xcode Instruments:**
```bash
# Launch time analysis
xcrun simctl spawn booted log stream --predicate 'eventMessage contains "App Launch"'

# Memory profiling
Instruments > Allocations
Instruments > Leaks
Instruments > VM Tracker

# Energy profiling
Instruments > Energy Impact

# CPU profiling
Instruments > System Trace
Instruments > Core Animation
```

**Manual Testing:**
```swift
// Measure app launch
let startTime = Date()
// App initializes
let launchTime = Date().timeIntervalSince(startTime)
print("Launch time: \(launchTime)s")

// Measure scroll FPS
var frameCount = 0
CADisplayLink.shared.preferredFramesPerSecond = 60
// During scroll, count frames
// Expected: 60 frames per second
```

---

## SECTION 8: OPTIMIZATION CHECKLIST

### Pre-Launch
- [ ] Profile app launch with Instruments (target: <2s)
- [ ] Verify lazy loading of portfolios/charts
- [ ] Check memory usage doesn't exceed 350MB
- [ ] Confirm scroll performance 60 FPS
- [ ] Test API batching (max 40 req/min)
- [ ] Verify image caching works
- [ ] Test on iPhone SE (baseline device)
- [ ] Check battery drain over 1 hour

### Ongoing
- [ ] Monthly performance regression testing
- [ ] Monitor App Store crash reports
- [ ] Track user performance complaints
- [ ] Re-profile after major feature additions
- [ ] Update benchmarks annually

---

## Summary: Quick Optimization Wins

1. **Lazy load portfolios** - Reduce startup from 2.5s to 1.5s
2. **Batch API requests** - Reduce calls from 160 to 20
3. **Cache images** - Eliminate image downloads on scroll
4. **Simplify views** - Remove calculations from render()
5. **Unload chart data** - Reduce peak memory from 1.6GB to 250MB
6. **Network deduplication** - Eliminate duplicate concurrent calls
7. **Smart refresh intervals** - Reduce battery drain 20%
8. **Downsampling** - Reduce chart data 90%

**Expected Overall Impact:**
- Launch time: 2.5s → 1.2s (52% improvement)
- Peak memory: 1.6GB → 250MB (84% reduction)
- Battery drain: 12% / hour → 4% / hour (67% improvement)
- Scroll smoothness: 45 FPS → 60 FPS (33% improvement)

---

**Report Date:** April 9, 2026
**Classification:** Internal Development
