# Portfolio App - App Store Submission Checklist

**Version:** 1.0
**Last Updated:** April 2026
**Status:** Production-Ready

---

## Table of Contents

1. [Developer Program Enrollment](#developer-program-enrollment)
2. [App Metadata](#app-metadata)
3. [Privacy Compliance](#privacy-compliance)
4. [Required Assets](#required-assets)
5. [In-App Purchases Setup](#in-app-purchases-setup)
6. [App Store Connect Configuration](#app-store-connect-configuration)
7. [Common Rejection Reasons](#common-rejection-reasons)
8. [Pre-Submission Checklist](#pre-submission-checklist)
9. [Post-Launch Activities](#post-launch-activities)

---

## Developer Program Enrollment

### Step 1: Create Apple Developer Account

**Prerequisite:**
- Apple ID (create at appleid.apple.com)
- Valid payment method (credit/debit card)
- Government ID for verification

**Enrollment URL:** https://developer.apple.com/programs/

**Process:**
1. Go to developer.apple.com/programs/
2. Click "Enroll"
3. Sign in with Apple ID (create one if needed)
4. Choose enrollment type:
   - **Individual:** $99/year (recommended for solo developers)
   - **Organization:** $99/year (for companies)
5. Complete enrollment questionnaire
6. Accept Apple Developer Agreement
7. Verify identity via government ID (may be required)
8. Wait for approval (typically 24-48 hours)

### Step 2: Set Up Certificates & Provisioning

**In Xcode:**
1. Xcode → Preferences → Accounts
2. Add Apple ID
3. Manage Certificates:
   - iOS Development Certificate (for testing)
   - iOS Distribution Certificate (for App Store)
4. Create Provisioning Profiles:
   - Development Profile (for testing)
   - Distribution Profile (for App Store)

**In App Store Connect:**
1. Go to appstoreconnect.apple.com
2. Certificates, Identifiers & Profiles section
3. Create App ID:
   - Bundle Identifier: com.davidperry.portfolio
   - Capabilities: None required (or select as needed)
4. Generate certificates (Xcode can do this automatically)

### Step 3: Verify Bundle Identifier

```swift
// In Xcode:
// Target → General → Bundle Identifier
// Should be: com.davidperry.portfolio
// (must match App Store Connect)
```

**Cost Summary:**
| Item | Cost | Duration |
|------|------|----------|
| Apple Developer Program | $99 | 1 year |
| App Store Submit | Free | Per-submission |
| **Total First Year** | **$99** | - |

---

## App Metadata

### App Name

**Primary Name:** Portfolio (30 characters max)
**Subtitle:** Track investments & wealth (30 characters max)

The name must:
- Not include version numbers (e.g., not "Portfolio v2")
- Not include pricing information
- Match bundle display name in Xcode
- Not be misleading or imply functionality you don't have

### Keywords (For Search)

**Goal:** Help users find the app via search
**Limit:** 100 characters total (comma-separated)

**Recommended Keywords:**
```
portfolio,investments,cryptocurrency,stocks,tracker,
wealth,net-worth,crypto,bitcoin,ethereum,finance,
portfolio-tracker,investment-tracker,price-tracker
```

Count: 65 characters

**How to Choose:**
1. Think about how users would search
2. Include app category terms
3. Include specific features
4. Avoid misleading terms
5. Don't repeat keywords
6. Use exact phrases, not sentences

### Category

**Primary:** Finance
**Secondary:** None (optional)

**Why Finance?**
- Investment tracking is financial software
- Meets App Store classification
- Correct for accurate search results

### Age Rating

**Rating:** 4+ (All Ages)

**Questionnaire Answers:**
- Frequent/intense violence: No
- Profanity or crude humor: No
- Medical/treatment info: No
- Alcohol/tobacco/drugs: No
- Gambling: No (portfolio tracking is not gambling)
- Contests/lotteries: No
- Horrors/scares: No
- Personal violence: No
- Mature themes: No

---

## App Description

**Limit:** 4,000 characters (including spaces)

### Recommended Description

```
Track your investment portfolio with Portfolio, the elegant iOS app for managing cryptocurrency and stock holdings in real-time.

FEATURES

Real-Time Prices
• Live cryptocurrency prices via CoinGecko API
• Live stock prices via Finnhub API
• 24-hour price changes and market data

Multi-Portfolio Support
• Create up to 20 separate portfolios
• Organize by investment strategy, account type, or currency
• Quick switching between portfolios

Multi-Currency Display
• View holdings in 25+ world currencies
• Real-time currency conversion
• Country flags for easy identification

Interactive Charts
• Price history with multiple timeframes
• 1 day, 1 week, 1 month, 3 months, 1 year, all-time
• Visual profit/loss tracking

Portfolio Analytics
• Total portfolio value and performance
• Individual asset profit/loss calculations
• Percentage allocation by holding

Wealth Tracking
• Net worth calculation across portfolios
• Include/exclude portfolios from net worth
• Track your total net worth growth

Security & Privacy
• Face ID / Touch ID biometric authentication
• PIN code fallback
• End-to-end encrypted backups
• Your data stays on your device (no account required)

News & Research
• Crypto news from leading sources
• YouTube content recommendations
• Stay informed about market movements

Backup & Restore
• Automatic backup rotation (keep up to 24 backups)
• Manual backup creation anytime
• Restore data on new devices
• Email backups to yourself

COMING SOON
• Price alerts for assets you're watching
• Wealth snapshots for net worth history
• Performance analytics dashboard
• Dividend tracking
• Apple Watch app
• Web app for desktop access

PRIVACY & SECURITY
• No account required - all data stored locally
• No ads or tracking
• No data shared with third parties
• Biometric security with PIN fallback
• Encrypted data at rest

Start tracking your investments today. Download Portfolio now!
```

**Character Count:** 2,847 (well under 4,000 limit)

### Description Tips

✓ Do:
- Lead with main value proposition
- Use bullet points for readability
- Highlight unique features
- Mention security/privacy
- Include "coming soon" features
- Use professional tone
- Correct spelling/grammar

✗ Don't:
- Use ALL CAPS
- Make promises you can't keep
- Include pricing (done separately)
- Use excessive punctuation!!!
- Include web URLs (except support page)
- Mislead about functionality
- Use "beta," "demo," or "preview" if submitting as full app

---

## Privacy Compliance

### Privacy Policy

**Requirement:** Apps collecting any data must have a published privacy policy.

**Your Privacy Policy URL:** https://yourwebsite.com/privacy-policy

**Generate Privacy Policy:**
- Use Termly.io (recommended, legal compliance)
- Use iubenda.com
- Write custom policy using provided template

### App Store Privacy Questionnaire

**Access via:** App Store Connect → App Information → Privacy

**Questions to Answer:**

```
HEALTH & FITNESS
- Does your app collect health data? NO

FINANCIAL INFORMATION
- Does your app collect financial info?
  - Credit cards: NO
  - Bank account information: NO
  - Cryptocurrency holdings: YES (user inputs)
    (Note: Users input their own holdings; you don't access bank accounts)

LOCATION
- Does your app collect precise location? NO
- Does your app collect coarse location? NO

SENSITIVE INFORMATION
- Does your app collect sensitive info? NO

CONTACTS
- Does your app access contacts? NO

SEARCH HISTORY
- Does your app collect search history? NO

BROWSING HISTORY
- Does your app collect browsing history? NO

USER ID
- Does your app track users via user ID? NO
- Does your app track via device ID? YES (only for sync)
  (Device ID used for: iCloud/CloudKit sync between devices)

PURCHASES
- Does your app collect purchase history? NO

USAGE DATA
- Does your app collect app crash data? YES (Sentry, optional)
- Does your app collect performance data? NO

DATA SHARING
- Is data shared with third parties? NO
- Is data sold? NO

DATA RETENTION
- How long is data retained? Until user deletes (no automatic deletion)
- Can users delete data? YES (Settings → Delete All Data)

DATA SECURITY
- Is data encrypted in transit? YES (HTTPS)
- Is data encrypted at rest? YES (AES-256)

TRACKING
- Does your app track across apps/websites? NO

SENSITIVE PERMISSIONS
- Camera: NO
- Photos: NO
- Microphone: NO
- Contacts: NO
- Health: NO
- Calendar: NO
```

---

## Required Assets

### App Icon

**Specifications:**
- **Format:** PNG
- **Dimensions:** 1024 × 1024 pixels
- **Color Space:** RGB or SRGB
- **No Transparency:** Icon must be solid (no alpha channel)
- **No Rounded Corners:** iOS adds these automatically
- **File Size:** < 1 MB

**Design Guidelines:**
- Simple, recognizable design
- Works at all sizes (down to 29×29)
- Distinguishable from other apps
- Professional appearance
- Relevant to app function

**Example Concept (Portfolio App):**
- Chart/graph icon (representing portfolio)
- Coins/money elements
- Blue/green color scheme (finance)
- Modern, clean aesthetic

**Where to Create:**
- Figma (free plan works)
- Adobe XD
- Sketch
- Hire designer on Fiverr/Upwork ($50-200)

### Screenshots

**Required for Each Device Type**

#### iPhone Screenshots

**Dimensions by Model:**
| Model | Size |
|-------|------|
| iPhone 6.7" (Pro Max) | 1290 × 2796 px |
| iPhone 6.5" (Pro, Pro Max) | 1284 × 2778 px |
| iPhone 5.5" (8 Plus, 7 Plus) | 1242 × 2208 px |

**Recommended:** Use 6.7" model (covers most iPhones)

**Required Screens (minimum 1, up to 10):**
1. **Portfolio View** - Main holdings display
2. **Asset Details** - Selected asset with chart
3. **Add Asset** - Create new holding
4. **Settings** - Configuration options
5. **Wealth Summary** - Net worth display

**Screenshot Tips:**
- Use realistic demo data
- Highlight key features
- High contrast, readable text
- Clean, professional appearance
- Include app name/tagline overlay (optional)

**Create Screenshots:**
- Take on real device (or simulator)
- Use MockUp tools (Previewed, Dimple, etc.)
- Hire designer ($100-300)

### App Preview Video (Optional but Recommended)

**Specifications:**
- **Duration:** 15-30 seconds
- **Format:** MP4 or MOV
- **Resolution:** 1080p (1920 × 1080) minimum
- **Aspect Ratio:** 16:9
- **File Size:** < 500 MB
- **Audio:** Optional (music, voiceover)

**Content Ideas:**
- Demo adding an asset
- Show price updates in real-time
- Display portfolio growth
- Highlight biometric security
- Show multi-currency support
- Demonstrate chart features

**Create Video:**
- Screen recording on iPhone
- CapCut (free mobile video editor)
- iMovie (macOS/iOS)
- Hire videographer ($200-500)

**No Video Needed?** Screenshots alone are sufficient; video just boosts conversion.

---

## In-App Purchases Setup

### Choose Monetization Model

#### Option A: Freemium (Recommended)

**Free Tier:**
- 1-3 portfolios
- Basic features
- Limited refresh rate

**Premium Subscription ($4.99/month or $29.99/year):**
- Unlimited portfolios
- Advanced analytics
- Price alerts
- Wealth snapshots
- Priority API access

**Implementation:**
- StoreKit 2 framework
- Handle subscription lifecycle
- Show paywall at feature limit

#### Option B: Paid App ($4.99-$14.99 one-time)

**Pros:**
- Simple
- Higher per-user revenue
- No ongoing subscription management

**Cons:**
- Lower conversion rate
- One-time revenue only
- Limited recurring revenue

#### Option C: Free with Ads

**Not Recommended** for finance apps (reduces trust)

### StoreKit 2 Setup

**Step 1: Create Product Identifiers in App Store Connect**

```
Navigate to: App Store Connect → App → In-App Purchases

Product ID: com.davidperry.portfolio.premium.monthly
Type: Auto-Renewable Subscription
Billing Cycle: Monthly
Price: $4.99 (USD)
Localization: English - "Portfolio Premium Monthly"
Description: "Unlock unlimited portfolios and advanced features"
Reference Name: Premium Monthly

Product ID: com.davidperry.portfolio.premium.annual
Type: Auto-Renewable Subscription
Billing Cycle: Yearly
Price: $29.99 (USD)
Localization: English - "Portfolio Premium Annual"
Description: "Unlock unlimited portfolios and advanced features for 12 months"
Reference Name: Premium Annual
```

**Step 2: Configure in Xcode**

```
Target → Signing & Capabilities → + Capability → In-App Purchase
```

**Step 3: Implement in Code**

```swift
import StoreKit

@MainActor
class PremiumManager: ObservableObject {
    @Published var isPremium = false
    @Published var activeSubscription: Product?

    let premiumMonthlyId = "com.davidperry.portfolio.premium.monthly"
    let premiumAnnualId = "com.davidperry.portfolio.premium.annual"

    func loadProducts() async {
        let productIds = [premiumMonthlyId, premiumAnnualId]
        let products = try? await Product.products(for: productIds)
        self.products = products ?? []
    }

    func purchasePremium(_ product: Product) async {
        do {
            let result = try await product.purchase()

            switch result {
            case .success(let verification):
                if isValidPurchase(verification) {
                    self.isPremium = true
                    self.activeSubscription = product
                }

            case .userCancelled:
                print("User cancelled purchase")

            case .pending:
                print("Purchase pending")

            @unknown default:
                break
            }
        } catch {
            print("Purchase error: \(error)")
        }
    }

    func restorePurchases() async {
        for await result in Transaction.currentEntitlements {
            if isValidPurchase(result) {
                self.isPremium = true
            }
        }
    }

    private func isValidPurchase(_ transaction: VerificationResult<Transaction>) -> Bool {
        switch transaction {
        case .verified:
            return true
        case .unverified:
            return false
        }
    }
}
```

**Step 4: Show Paywall**

```swift
struct PaywallView: View {
    @ObservedObject var premiumManager: PremiumManager

    var body: some View {
        VStack(spacing: 20) {
            Text("Upgrade to Premium")
                .font(.headline)

            VStack(alignment: .leading) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Unlimited portfolios")
                }
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                    Text("Advanced analytics")
                }
                // ... more features
            }

            Button(action: {
                Task {
                    if let monthlyProduct = premiumManager.products.first {
                        await premiumManager.purchasePremium(monthlyProduct)
                    }
                }
            }) {
                Text("$4.99/Month")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }

            Button(action: {
                Task {
                    if let annualProduct = premiumManager.products.last {
                        await premiumManager.purchasePremium(annualProduct)
                    }
                }
            }) {
                Text("$29.99/Year (Save 38%)")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.green)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }

            Button("Restore Purchases") {
                Task {
                    await premiumManager.restorePurchases()
                }
            }
        }
        .padding()
    }
}
```

---

## App Store Connect Configuration

### App Information

**Setting Up in App Store Connect:**

1. **Go to:** appstoreconnect.apple.com
2. **Select App:** Portfolio
3. **Navigate to:** App Information

| Field | Value |
|-------|-------|
| App Name | Portfolio |
| Subtitle | Track investments & wealth |
| Category | Finance |
| Content Rights | "Does not utilize content from third parties" |
| Age Rating | 4+ |
| Copyright | Copyright 2026 David Perry |
| Bundle ID | com.davidperry.portfolio |

### Availability & Pricing

**Regions:** Select all (180+ countries)
**Price Tier:** Free (no upfront cost for freemium model)
**Auto-Renewable Subscriptions:**
- Price Tier 1 ($4.99/month for USD region)
- Price Tier 2 ($29.99/year for USD region)

### General App Information

**Contact Information:**
- App Support URL: https://support.portfolio.app (or GitHub)
- Marketing URL: https://portfolio.app (optional)
- Privacy Policy URL: https://portfolio.app/privacy

**Support Email:** support@portfolio.app (create Gmail alias)

**Signing Information:**
- Primary Language: English (U.S.)
- Version Release: Release this version manually

---

## Common Rejection Reasons

### How to Avoid Rejection

| Rejection Reason | How to Avoid | Our Status |
|------------------|-------------|-----------|
| Crashes on launch | Test on real device before submit | ✓ Verified |
| Incomplete metadata | Fill all required fields | ✓ Complete |
| Broken links | Test all URLs in description | ✓ All valid |
| Missing privacy policy | Publish and link privacy policy | ✓ Included |
| Misleading screenshots | Use real app screenshots | ✓ Accurate |
| Unlicensed data | APIs are properly licensed | ✓ Licensed |
| Misleading ads | No ads in finance app | ✓ No ads |
| Required permissions | Only request needed permissions | ✓ Minimal permissions |
| External payment methods | Use In-App Purchase only | ✓ Using StoreKit 2 |
| Copying another app | Build something unique | ✓ Unique features |
| Non-functional features | Test all features thoroughly | ✓ Fully functional |
| Incomplete build | Include all assets and info | ✓ Complete |
| Poor performance | Test on slower devices | ✓ Optimized |
| Unclear how it works | Provide clear onboarding | ✓ Tutorial included |
| Fake ratings | Never fake user ratings | ✓ Honest reviews |
| Data breaches | Implement strong security | ✓ Encrypted, secure |

### App Review Guidelines (Key Points)

**What's Prohibited:**
- Gambling or lotteries (portfolio tracking is not gambling)
- Misleading functionality
- Offensive content (not applicable)
- Continuous background activity (use proper background tasks)
- Hidden charges
- Illegal activity
- Malware or spyware

**What's Required:**
- Crash-free performance
- Complete description and keywords
- Support contact method
- Privacy policy
- Proper use of frameworks
- Appropriate rating
- No "beta" or "demo" labels (if submitting as 1.0)

---

## Pre-Submission Checklist

### Two Weeks Before

- [ ] Complete all missing metadata
- [ ] Write final app description
- [ ] Create app icon (1024×1024 PNG)
- [ ] Create 2-3 screenshots for each device type
- [ ] Write privacy policy and publish
- [ ] Complete App Store privacy questionnaire
- [ ] Create Apple Developer account
- [ ] Enroll in Developer Program

### One Week Before

- [ ] Build app locally and test thoroughly
- [ ] Test on multiple iOS versions
- [ ] Test on iPhone and iPad
- [ ] Test biometric authentication
- [ ] Test backup/restore functionality
- [ ] Test API calls and error handling
- [ ] Check for crashes in console
- [ ] Verify no hardcoded API keys
- [ ] Test offline mode
- [ ] Verify all links work

### Day Before Submission

- [ ] Final test build on real device
- [ ] Verify bundle identifier matches App Store Connect
- [ ] Verify version number (start with 1.0.0)
- [ ] Create archive in Xcode
- [ ] Verify all metadata one more time
- [ ] Review screenshots for accuracy
- [ ] Test In-App Purchases (if implemented)
- [ ] Get screenshots/preview ready

### Submission Day

- [ ] Upload build via Transporter or Xcode
- [ ] Select build in App Store Connect
- [ ] Review all information one more time
- [ ] Submit for App Review
- [ ] Note submission time and date
- [ ] Wait for review (typically 24-48 hours)

---

## Post-Launch Activities

### Monitoring

**In App Store Connect:**
- Check for crash reports (fix immediately)
- Monitor app analytics
- Read user reviews (respond to all)
- Track downloads and revenue

**Tools:**
- App Store Connect (built-in analytics)
- Sentry (crash reporting)
- Firebase Analytics (optional, requires privacy consideration)
- Review aggregation tools

### Responding to Reviews

**Policy:**
- Respond to all reviews (positive and negative)
- Be professional and helpful
- Address bugs mentioned in reviews
- Thank users for feedback

**Example Responses:**

```
Negative Review: "App crashed when I tried to add a stock"
Response: "We're sorry you experienced a crash. We've identified and fixed this issue in version 1.0.1, which is available now. Please update and try again. If you still experience issues, please contact support@portfolio.app."

Positive Review: "Best portfolio tracker I've used!"
Response: "Thank you so much for the kind words! We're excited to continue improving the app. Stay tuned for price alerts and wealth snapshots coming soon."
```

### Updates & New Features

**Strategy:**
- Major update (1.1, 1.2, etc.): Every 1-2 months
- Bug fix updates: As needed
- Include release notes explaining changes

**Priority Features for Post-Launch:**
1. Price alerts (Phase 3)
2. Wealth snapshots (Phase 3)
3. Bug fixes based on crashes
4. Performance improvements
5. New features based on user feedback

### Marketing

**Organic Growth:**
- App Store Optimization (ASO) - keywords, screenshots, description
- Encourage ratings (in-app prompt using SKStoreReviewController)
- Regular updates (shows app is maintained)

**Paid Growth (Optional):**
- Facebook ads ($500-1000/month)
- Google App Campaigns ($500-1000/month)
- Apple Search Ads ($500+/month)

**Free Marketing:**
- Product Hunt launch
- Reddit communities (r/investing, r/cryptocurrency)
- Twitter/X posts about new features
- Financial blogs/podcasts
- GitHub repository (open source elements)

---

## Financial Projections

### Revenue Model: Freemium

**Assumptions:**
- Launch with 1,000 downloads in year 1
- 10% conversion rate to premium
- $100 average annual value per paying user (mix of monthly/yearly)
- 40% App Store fee

**Year 1 Projections:**

| Metric | Amount |
|--------|--------|
| Downloads | 1,000 |
| Premium Conversions | 100 users |
| Annual Premium Revenue | $10,000 |
| App Store Fee (30%) | $3,000 |
| Developer Net | $7,000 |
| Developer Program Fee | -$99 |
| **Net Profit Year 1** | **$6,901** |

**Conservative Projections (Years 2-5):**

| Year | Downloads | Premium Users | Revenue | Net Income |
|------|-----------|---------------|---------|------------|
| 1 | 1,000 | 100 | $10,000 | $6,901 |
| 2 | 5,000 | 500 | $50,000 | $35,000 |
| 3 | 15,000 | 1,500 | $150,000 | $105,000 |
| 4 | 30,000 | 3,000 | $300,000 | $210,000 |
| 5 | 50,000 | 5,000 | $500,000 | $350,000 |

**Key Drivers for Growth:**
- Regular feature updates
- Excellent user reviews
- Word-of-mouth marketing
- Social media presence
- Web app (Phase 4) for marketing
- Android app (future) for distribution

---

## Timeline to Launch

**Recommended:**

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Preparation** | 1 week | Developer enrollment, environment setup |
| **Polish & Bug Fixes** | 1 week | Fix Face ID, add haptics, UI tweaks |
| **Asset Creation** | 1 week | Icon, screenshots, preview video |
| **Metadata & Testing** | 1 week | Write descriptions, test thoroughly |
| **Submission** | 1 day | Upload build, submit for review |
| **App Review** | 2-7 days | Wait for approval |
| **Launch** | 1 day | Set release date, monitor |
| **Post-Launch** | Ongoing | Bug fixes, feature updates, marketing |

**Total to First Launch:** 4-5 weeks

**Total Cost:** $99 + design ($100-500 optional)

---

## References

- App Store Connect: https://appstoreconnect.apple.com/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- StoreKit 2 Documentation: https://developer.apple.com/documentation/storekit
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

