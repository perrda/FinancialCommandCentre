# Portfolio App - Development Roadmap

**Version:** 1.0
**Last Updated:** April 2026
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Core (Current)](#phase-1-core-current)
3. [Phase 2: Polish & Bug Fixes](#phase-2-polish--bug-fixes)
4. [Phase 3: New Features](#phase-3-new-features)
5. [Phase 4: Web App Launch](#phase-4-web-app-launch)
6. [Phase 5: App Store Submission](#phase-5-app-store-submission)
7. [Phase 6: Advanced Features](#phase-6-advanced-features)
8. [Future Platforms](#future-platforms)
9. [Timeline & Staffing](#timeline--staffing)
10. [Success Metrics](#success-metrics)

---

## Overview

Portfolio App development follows a phased approach, balancing feature completeness, quality, and market timing.

### Development Philosophy

1. **User-First:** Build features users actually need
2. **Quality Over Speed:** Stability matters more than features
3. **Incremental:** Release smaller updates frequently
4. **Feedback-Driven:** Use user feedback to prioritize
5. **Technical Excellence:** Pay down technical debt regularly

---

## Phase 1: Core (Current)

**Version:** 2.93
**Status:** Complete (Foundation)
**Duration:** January - March 2026
**Team:** 1 developer

### Delivered Features

- [x] Multi-portfolio support (up to 20 portfolios)
- [x] Cryptocurrency tracking (CoinGecko API)
- [x] Stock tracking (Finnhub API)
- [x] Real-time price data with 24h change
- [x] Multi-currency display (25+ currencies)
- [x] Interactive charts (6 timeframes)
- [x] Biometric authentication (Face ID/Touch ID)
- [x] Backup/restore system (24 backups max)
- [x] Crypto news aggregation (2 RSS feeds)
- [x] YouTube content tab
- [x] Wealth tracking with include/exclude
- [x] iPad support
- [x] Dark mode support
- [x] Settings tab
- [x] User preferences persistence

### Technical Foundation

- SwiftUI UI framework
- MVVM architecture pattern
- UserDefaults for data storage
- URLSession for networking
- LocalAuthentication framework

### Known Limitations

- ⚠️ Face ID authentication not working correctly
- ⚠️ No price alerts
- ⚠️ No wealth snapshots (historical tracking)
- ⚠️ No performance analytics
- ⚠️ No web app access

---

## Phase 2: Polish & Bug Fixes

**Version:** 2.94 - 2.95
**Timeline:** April - May 2026 (2-3 weeks)
**Priority:** Critical fixes before public launch
**Effort:** Low to Medium

### Bug Fixes

- [ ] **Fix Face ID Authentication**
  - Reproduce issue on real device
  - Debug LocalAuthentication framework
  - Implement PIN fallback properly
  - Test on iPhone 12/13/14/15
  - Estimated effort: 3-4 hours

- [ ] **Fix Provisioning Profile Issues**
  - Create persistent provisioning profile
  - Document renewal process
  - Automate renewal if possible
  - Estimated effort: 2 hours

### UI/UX Polish

- [ ] Add haptic feedback on interactions
  - Portfolio creation
  - Asset addition
  - Price updates
  - Estimated effort: 2 hours

- [ ] Implement pull-to-refresh
  - Portfolio view
  - Asset list
  - News feed
  - Chart updates
  - Estimated effort: 3 hours

- [ ] Add loading states
  - Skeleton screens for data loading
  - Progress indicators
  - Estimated effort: 2 hours

- [ ] Improve error messages
  - More user-friendly copy
  - Helpful recovery suggestions
  - Estimated effort: 1 hour

### Performance

- [ ] Profile app performance
  - Identify slow sections
  - Optimize hot paths
  - Reduce memory usage
  - Estimated effort: 3 hours

- [ ] Reduce app launch time
  - Target: < 3 seconds
  - Lazy load non-critical data
  - Estimated effort: 2 hours

### Testing

- [ ] Comprehensive QA pass
  - Follow QA checklist from project document
  - Test on iPhone, iPad, various iOS versions
  - Test offline mode
  - Test with large portfolios (100+ assets)
  - Estimated effort: 5 hours

**Phase 2 Total Effort:** 23-24 hours (3-4 days full-time)

---

## Phase 3: New Features

**Version:** 3.0
**Timeline:** June - July 2026 (3-4 weeks)
**Goal:** MVP feature set for public launch

### 3A: Price Alerts

**Timeline:** June 1-7 (1 week)
**Effort:** Medium (15-20 hours)

```
User Story: "As a user, I want to be notified when
an asset's price reaches a target level"

Features:
- Create alerts (above/below certain price)
- Set alert frequency (once, daily, every time)
- Receive push notifications
- Manage active alerts
- Mark as resolved

Technical:
- UserNotifications framework
- Background task for checking alerts
- Data schema for alerts (see DATA_SCHEMA.md)
```

**Acceptance Criteria:**
- [ ] Create price alert for asset
- [ ] Edit existing alert
- [ ] Delete alert
- [ ] Receive notification when triggered
- [ ] Multiple alerts on same asset
- [ ] Alert frequency works correctly
- [ ] No false positives (price bounces)
- [ ] Notification history shown

**Estimated Hours:** 15-20

### 3B: Wealth Snapshots

**Timeline:** June 8-15 (1 week)
**Effort:** Medium (15-18 hours)

```
User Story: "As a user, I want to see my net worth
history over time to track wealth growth"

Features:
- Automatic daily snapshots at midnight
- Manual snapshot creation
- Historical chart showing net worth trend
- Export snapshot data as CSV
- 365-day retention (1 year)
```

**Technical:**
- Background task scheduling
- Historical data storage
- Chart rendering (historical)
- Data migration for new schema

**Estimated Hours:** 15-18

### 3C: Performance Analytics Dashboard

**Timeline:** June 16-30 (2 weeks)
**Effort:** Medium-High (20-25 hours)

```
User Story: "As a user, I want to see how my
portfolio is performing with detailed metrics"

Features:
- Daily/weekly/monthly/yearly gain/loss
- Best and worst performing assets
- Allocation pie chart
- Returns vs benchmark (S&P 500, Nasdaq)
- Time-weighted returns (if applicable)
```

**Technical:**
- Complex calculations
- Chart rendering (pie, bar, line)
- Caching for performance
- Edge case handling (no data, new portfolio)

**Estimated Hours:** 20-25

**Phase 3A+3B+3C Total:** 50-63 hours (1-2 weeks full-time)

---

## Phase 4: Web App Launch

**Version:** 1.0 (Web App)
**Timeline:** August - September 2026 (4-5 weeks)
**Goal:** Desktop/browser access to portfolio

### 4A: Web App MVP

**Timeline:** August 1-21 (3 weeks)
**Effort:** High (40-50 hours)

**Technology Stack:**
- React.js or Vue.js (Vue recommended for simplicity)
- TypeScript for type safety
- Tailwind CSS for styling
- Vite for build tooling
- Hosted on Vercel/Netlify (free tier)

**Features:**
- Dashboard view (portfolio overview)
- Portfolio list/detail views
- Asset management (add/edit/delete)
- Chart viewing
- Settings/preferences
- Import/export JSON

**Key Difference from iOS:**
- No biometric auth (use password)
- Full feature parity with iOS app
- Responsive design (desktop-first, mobile-friendly)
- Browser storage (localStorage)
- Optional: cloud sync

**Estimated Hours:** 40-50

### 4B: iOS ↔ Web Sync

**Timeline:** September 1-14 (2 weeks)
**Effort:** Medium (20-25 hours)

**Features:**
- Export from iOS → Download on web
- Export from web → Import to iOS
- JSON format compatibility
- Conflict resolution (manual merge)
- Data validation before import

**Estimated Hours:** 20-25

**Phase 4 Total:** 60-75 hours (2-3 weeks full-time)

---

## Phase 5: App Store Submission

**Version:** 1.0.0 (iOS)
**Timeline:** October 2026 (1-2 weeks)
**Goal:** Public release on App Store

### Pre-Submission Tasks

**Timeline:** October 1-7 (1 week)
**Effort:** Low-Medium (10-15 hours)

- [ ] Create app icon (1024×1024)
  - Professional design or commission designer
  - Estimated effort: 2-3 hours (DIY) or $100-300 (designer)

- [ ] Create screenshots for each device
  - iPhone 6.7": 1290×2796
  - iPad (optional): 2048×2732
  - 5-10 screenshots showcasing features
  - Estimated effort: 3-4 hours

- [ ] Write app description (4000 chars max)
  - Already drafted in APP_STORE_CHECKLIST.md
  - Review and polish
  - Estimated effort: 1 hour

- [ ] Set up privacy policy
  - Use Termly.io or similar
  - Publish on website
  - Link in App Store Connect
  - Estimated effort: 2-3 hours

- [ ] Configure In-App Purchases (if freemium)
  - Create product IDs
  - Set pricing tiers
  - Set up subscription details
  - Estimated effort: 2 hours

- [ ] Final testing
  - Build release version
  - Test on multiple devices
  - Verify all features work
  - Check for crashes
  - Estimated effort: 3-4 hours

**Total Pre-Submission:** 13-17 hours

### Submission Process

**Timeline:** October 8 (1 day)

1. Archive app in Xcode
2. Upload to App Store Connect
3. Fill in metadata
4. Submit for review
5. Monitor for approval

**Total Submission Time:** 1 hour
**Review Time:** 24-48 hours typically

### Post-Approval

**Timeline:** October 9-14

- [ ] Set release date on App Store
- [ ] Prepare launch announcement
- [ ] Email existing testers
- [ ] Post on social media
- [ ] Monitor crash reports
- [ ] Respond to initial user reviews

**Phase 5 Total:** 14-18 hours + 24-48 hour wait

---

## Phase 6: Advanced Features

**Version:** 1.1+
**Timeline:** November 2026 onwards
**Effort:** Ongoing

### 6A: Apple Watch Companion App

**Timeline:** November-December 2026 (2-3 weeks)
**Effort:** Medium-High (20-30 hours)
**Estimated Release:** v1.2

**Features:**
- Glance showing portfolio value
- Quick price lookup
- Price notifications
- Complications for home screen
- Send portfolio data from iPhone

**Technology:**
- WatchKit framework
- Background refresh
- Shared container with iPhone app

**Note:** Requires separate app configuration in Xcode

### 6B: Siri Shortcuts Integration

**Timeline:** December 2026 (1 week)
**Effort:** Low-Medium (8-12 hours)
**Estimated Release:** v1.1

**Features:**
- "Hey Siri, what's my portfolio worth?"
- "Show me Bitcoin price"
- "Create wealth snapshot"
- Export portfolio data via Siri

**Technology:**
- Siri Intents framework
- Spotlight integration
- VoiceOver support

### 6C: Firebase Cross-Platform Sync

**Timeline:** Q1 2027 (3-4 weeks)
**Effort:** High (30-40 hours)

**Features:**
- Real-time sync via Firebase
- Multi-device support
- User authentication (Google, Apple Sign-In)
- Cloud backup of all data
- Conflict resolution (automatic 3-way merge)

**Preparation:**
- Set up Firebase project
- Configure Firestore database
- Implement authentication
- Test end-to-end sync

**Note:** Major milestone enabling Android app

### 6D: Advanced Charting

**Timeline:** Q1 2027 (2 weeks)
**Effort:** Medium (15-20 hours)

**Features:**
- Technical indicators (SMA, EMA, RSI, MACD)
- Candlestick charts
- Volume indicators
- Multiple overlays
- Pattern recognition

**Technology:**
- Advanced charting library (Charts by Daniel Gindi)
- Real-time updates
- Historical data analysis

### 6E: Android App

**Timeline:** Q2 2027 (6-8 weeks)
**Effort:** Very High (60-80 hours)
**Requirement:** Firebase sync from 6C

**Features:**
- Feature parity with iOS
- Material Design 3
- Native Android components

**Note:** Significant undertaking; consider hiring Android developer

---

## Phase 7: Premium Features

**Version:** 1.3+
**Timeline:** Q2+ 2027
**Monetization:** Freemium model

### Premium Subscription Features

**$4.99/month or $29.99/year**

- Unlimited portfolios (vs 3 free)
- Advanced analytics
- Price alerts (vs 1 free)
- Wealth snapshots (premium only)
- CSV export for taxes
- Ad-free experience
- Early access to new features

---

## Future Platforms

### Roadmap Timeline

```
2026:
├─ Phase 1-2: iOS core (v2.93-2.95)
├─ Phase 3: Features (v3.0)
├─ Phase 4: Web app (v1.0)
├─ Phase 5: App Store launch (v1.0.0)
└─ Phase 6A: Apple Watch (v1.2)

2027:
├─ Phase 6B: Siri Shortcuts (v1.1)
├─ Phase 6C: Firebase sync (v1.3)
├─ Phase 6D: Advanced charts (v1.4)
├─ Phase 6E: Android app (v1.0)
└─ Phase 7: Premium monetization

Future:
├─ Desktop app (Electron/Tauri)
├─ API for integrations
├─ Third-party widget marketplace
├─ AI portfolio recommendations
└─ Social features (portfolio sharing)
```

---

## Timeline & Staffing

### Recommended Staffing

**Phase 1-2 (Through May 2026):**
- 1 iOS developer (you)
- Estimated: 40 hours/week × 12 weeks = 480 hours

**Phase 3 (June-July):**
- 1 iOS developer (full-time)
- Optional: 1 UI/UX designer (part-time, 10 hrs/week)
- Estimated: 50-60 developer hours

**Phase 4 (August-September):**
- 1 iOS developer (50% time)
- 1 Web developer (100% time) - new hire or contractor
- Estimated: 25 iOS + 50 web = 75 hours

**Phase 5 (October):**
- 1 iOS developer (full-time)
- Estimated: 15-20 hours

**Phase 6A (Nov-Dec):**
- 1 iOS developer (full-time)
- Estimated: 20-30 hours

**Phase 6C+ (2027+):**
- 2-3 full-time developers
- 1 backend engineer for Firebase
- 1 Android developer (if pursuing Android)

### Budget Estimate

| Phase | Cost Category | Estimate |
|-------|--------------|----------|
| 1-2 | Your salary (480 hrs @ $50/hr) | $24,000 |
| 1-2 | Designer (optional, app icon/screenshots) | $200-500 |
| 3 | Designer (part-time, 10 hrs/week × 8 weeks @ $50/hr) | $4,000 |
| 4 | Web developer (contractor, 50 hrs @ $75/hr) | $3,750 |
| 5 | Misc (domains, hosting, etc) | $50-200 |
| **Year 1 Total** | | **$32,000** |

---

## Success Metrics

### Phase-Based Goals

**Phase 2 (May 2026):**
- ✓ All bugs fixed
- ✓ Face ID working 100%
- ✓ Zero crashes in QA testing
- ✓ Load time < 2 seconds
- ✓ Battery drain < 5%/hour

**Phase 3 (July 2026):**
- ✓ 3+ new features delivered
- ✓ User feedback positive (hypothetical)
- ✓ Feature completeness for MVP
- ✓ Performance maintained

**Phase 4 (September 2026):**
- ✓ Web app fully functional
- ✓ iOS ↔ Web sync working
- ✓ Feature parity achieved
- ✓ Responsive design verified

**Phase 5 (October 2026):**
- ✓ App approved by App Store
- ✓ Public availability
- ✓ 500+ downloads in first week (target)
- ✓ > 4.0 star rating

**Phase 6+ (2027+):**
- ✓ 5,000+ monthly active users
- ✓ 100+ paying subscribers
- ✓ $5,000+ monthly recurring revenue
- ✓ Android app launched
- ✓ Feature requests implemented monthly

### Key Performance Indicators (KPIs)

**Installation & Usage:**
- Downloads per week
- Monthly active users (MAU)
- Daily active users (DAU)
- Retention rate (Week 1, Week 4, Month 3)
- Churn rate (monthly/yearly plans)

**Quality:**
- Crash rate (target: < 0.1%)
- App review rating (target: > 4.5)
- Support tickets per week
- Bug report frequency

**Engagement:**
- Average session length
- Features used per session
- Feature adoption rates
- Export/backup frequency

**Financial:**
- Monthly recurring revenue (MRR)
- Annual recurring revenue (ARR)
- Customer acquisition cost (CAC)
- Lifetime value (LTV)
- LTV:CAC ratio (target: > 3:1)

---

## Risk Mitigation

### Identified Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| API rate limiting | Medium | High | Implement caching, upgrade tier |
| Market competition | High | Medium | Focus on UX, unique features |
| User acquisition slow | Medium | High | Build web app for SEO, marketing |
| Technical debt buildup | High | Medium | Code reviews, refactoring time |
| Security breach | Low | Critical | Security audits, penetration testing |
| Key person risk (you!) | Medium | Critical | Document code, write tests |

### Contingency Planning

- **If development takes longer:** Cut lowest-priority Phase 3 features
- **If competition emerges:** Focus on unique features (wealth snapshots, sync)
- **If API limits hit:** Upgrade to paid tiers or implement local data
- **If user growth slow:** Shift resources to marketing/growth

---

## Decision Points

### Key Milestones Requiring Go/No-Go Decision

1. **End of Phase 2 (May 2026)**
   - Decision: Proceed with App Store launch?
   - Go criteria: All bugs fixed, QA passed, clean build
   - No-go criteria: Unfixable crashes, security issues

2. **End of Phase 3 (July 2026)**
   - Decision: Feature set complete for v3.0?
   - Go criteria: Core features working, good user feedback
   - No-go criteria: Major bugs, performance issues

3. **End of Phase 4 (September 2026)**
   - Decision: Launch web app publicly?
   - Go criteria: Sync working, feature parity, security verified
   - No-go criteria: Data loss, sync conflicts, security flaws

4. **After Phase 5 (October 2026)**
   - Decision: Hire team for Phase 6+?
   - Go criteria: 500+ users, positive reviews, sustainable growth
   - No-go criteria: Negative feedback, low engagement, major bugs

---

## References

- Agile Software Development: https://agilemanifesto.org/
- Semantic Versioning: https://semver.org/
- Software Project Management: https://en.wikipedia.org/wiki/Software_project_management

