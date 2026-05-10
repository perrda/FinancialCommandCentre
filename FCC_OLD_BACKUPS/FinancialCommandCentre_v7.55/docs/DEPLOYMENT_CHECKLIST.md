# Financial Command Centre - Deployment Checklist

**Version:** 7.60  
**Status:** Ready for Deployment  
**Last Updated:** April 2026

---

## Pre-Deployment Verification

### Code Quality

- [ ] No console errors (F12 → Console)
- [ ] No console warnings from app
- [ ] All API calls working (check Network tab)
- [ ] No broken images or assets
- [ ] CSS renders correctly
- [ ] JavaScript executes without errors
- [ ] No memory leaks (check Performance tab)
- [ ] No performance bottlenecks

### PWA Compliance

- [ ] manifest.json is valid JSON
- [ ] manifest.json accessible at /manifest.json
- [ ] manifest.json has MIME type: application/json
- [ ] All required manifest fields present:
  - [ ] name
  - [ ] short_name
  - [ ] start_url
  - [ ] display: "standalone"
  - [ ] icons (192x192, 512x512)
  - [ ] background_color
  - [ ] theme_color
- [ ] Icons display correctly (test in Chrome DevTools)
- [ ] Service worker registering successfully
- [ ] Service worker scope is correct
- [ ] Service worker cache strategy working
- [ ] Offline functionality working

### Security & HTTPS

- [ ] Site served over HTTPS
- [ ] Valid SSL/TLS certificate
- [ ] Certificate not expired
- [ ] No mixed content (all resources HTTPS)
- [ ] Security headers present:
  - [ ] Content-Security-Policy
  - [ ] X-Content-Type-Options
  - [ ] X-Frame-Options
- [ ] No hardcoded API keys
- [ ] No sensitive data in localStorage (besides opt-in sync)
- [ ] Privacy policy accessible
- [ ] No unencrypted data transmission

### Privacy & Legal

- [ ] Privacy policy HTML complete
- [ ] Privacy policy accessible at /privacy-policy.html
- [ ] Privacy policy covers:
  - [ ] What data is collected
  - [ ] How data is used
  - [ ] Third-party services (CoinGecko, Finnhub, ExchangeRate-API)
  - [ ] Cloud sync opt-in
  - [ ] Data retention
  - [ ] User rights (GDPR, CCPA)
  - [ ] Contact information
- [ ] Terms of Service (if applicable)
- [ ] Legal compliance verified
- [ ] No misleading claims in app or metadata

### Performance

- [ ] Lighthouse score 90+
- [ ] First Contentful Paint < 2 seconds
- [ ] Largest Contentful Paint < 2.5 seconds
- [ ] Cumulative Layout Shift < 0.1
- [ ] First Input Delay < 100ms
- [ ] Time to Interactive < 3.8 seconds
- [ ] Total bundle size optimized
- [ ] Images compressed (WebP with PNG fallback)
- [ ] CSS minified
- [ ] JavaScript minified
- [ ] No render-blocking resources

### Functionality Testing

- [ ] All tabs load and display
- [ ] Data persists after refresh
- [ ] Data persists after close/reopen
- [ ] All buttons clickable and responsive
- [ ] All inputs accept data
- [ ] All calculations correct
- [ ] Charts/graphs render
- [ ] API calls working (real prices loading)
- [ ] Cloud sync works (if enabled)
- [ ] Settings persist
- [ ] No memory leaks
- [ ] No infinite loops

### Responsive Design

**Mobile (320px - small phone)**
- [ ] No horizontal scroll
- [ ] Text readable
- [ ] Buttons touch-friendly (48px minimum)
- [ ] Bottom navigation accessible
- [ ] Forms not too wide

**Tablet (768px)**
- [ ] Layout adapts correctly
- [ ] Content centered
- [ ] Navigation visible
- [ ] Charts readable

**Desktop (1920px+)**
- [ ] Full layout utilized
- [ ] Content not stretched
- [ ] Sidebar visible (if applicable)
- [ ] Multiple columns work

### Accessibility

- [ ] Color contrast WCAG AA (4.5:1 for text)
- [ ] Keyboard navigation works (Tab key)
- [ ] Focus indicators visible
- [ ] Screen reader accessible (test with NVDA/JAWS)
- [ ] Alt text for images (if any)
- [ ] Form labels associated with inputs
- [ ] Error messages clear
- [ ] Buttons have accessible names
- [ ] No keyboard traps

### Cross-Browser Testing

**Chrome/Edge (Chromium)**
- [ ] App loads
- [ ] PWA installable
- [ ] Service worker registers
- [ ] All features work
- [ ] Performance acceptable

**Firefox**
- [ ] App loads
- [ ] All features work
- [ ] Service worker registers
- [ ] Performance acceptable

**Safari (macOS & iOS)**
- [ ] App loads
- [ ] Core features work
- [ ] Performance acceptable
- [ ] iOS: Web Clip installable

**Samsung Internet (Android)**
- [ ] App loads
- [ ] PWA installable
- [ ] Performance acceptable

### Mobile Device Testing

**iOS**
- [ ] Loads in Safari
- [ ] Can add to home screen
- [ ] Status bar styled correctly
- [ ] Splash screen displays (if configured)
- [ ] Navigation works
- [ ] Data persists

**Android**
- [ ] Loads in Chrome
- [ ] PWA installable
- [ ] App icon appears
- [ ] Bottom nav accessible
- [ ] Performance acceptable
- [ ] Data persists

### API Integration Testing

**CoinGecko API**
- [ ] Request working
- [ ] Prices loading
- [ ] Error handling (no crash)
- [ ] Cache working
- [ ] Falls back gracefully offline

**Finnhub API**
- [ ] Request working
- [ ] Stock prices loading
- [ ] Error handling working
- [ ] Rate limits respected
- [ ] Falls back gracefully offline

**ExchangeRate-API**
- [ ] Request working
- [ ] Currency conversion working
- [ ] Error handling working
- [ ] Falls back gracefully offline

### Offline Testing

- [ ] Open DevTools → Network → Offline
- [ ] App remains responsive
- [ ] Cached data displays
- [ ] No console errors
- [ ] Error messages appear for APIs
- [ ] Turn online → sync works
- [ ] Performance acceptable offline

### Data & Storage

- [ ] localStorage working
- [ ] IndexedDB working (if used)
- [ ] Data persists correctly
- [ ] No storage quota exceeded
- [ ] Data encryption working (if applicable)
- [ ] Cloud sync encrypts before transmission
- [ ] User can clear data
- [ ] User can export data
- [ ] No personal data leakage

---

## Store Submission Files

### Required Files Ready

- [x] `financial_command_centre.html` (Main app)
- [x] `manifest.json` (PWA manifest)
- [x] `sw.js` (Service worker)
- [x] `icon.svg` (Icon source)
- [ ] `icon-192.png` (TO CREATE - convert from SVG)
- [ ] `icon-512.png` (TO CREATE - convert from SVG)
- [ ] `screenshot-wide.png` (TO CREATE)
- [ ] `screenshot-narrow.png` (TO CREATE)
- [x] `privacy-policy.html` (Privacy policy)
- [x] `PWABUILDER_GUIDE.md` (Submission guide)
- [x] `STORE_LISTING.md` (Store content)
- [x] `APP_STORE_README.md` (README)

### Icon Conversion

```bash
# Convert SVG to PNG
convert -density 192 icon.svg icon-192.png
convert -density 512 icon.svg icon-512.png

# Or use online tools:
# https://cloudconvert.com/svg-to-png
# https://convertio.co/svg-png/
```

**Verify:**
- [ ] icon-192.png is 192x192 pixels
- [ ] icon-512.png is 512x512 pixels
- [ ] Both are PNG format
- [ ] Both have transparency
- [ ] Orange gradient displays correctly
- [ ] "FCC" text is white and readable

### Screenshot Capture

**Wide Format (1280x720):**
```
1. Open app in browser
2. Resize to 1280x720 (F12 → Device Emulation)
3. Show dashboard/overview
4. Capture screenshot
5. Save as screenshot-wide.png
```

**Narrow Format (750x1334):**
```
1. Resize to 750x1334 (mobile aspect ratio)
2. Show responsive layout
3. Ensure bottom nav visible
4. Capture screenshot
5. Save as screenshot-narrow.png
```

**What to Show:**
- [ ] Main dashboard/overview
- [ ] Portfolio allocation
- [ ] Net worth display
- [ ] Key metrics visible
- [ ] Professional appearance
- [ ] Clean, clutter-free layout
- [ ] FCC branding visible

---

## PWABuilder Submission

### Pre-PWABuilder Checklist

- [ ] All code committed to version control
- [ ] All files staged for deployment
- [ ] Domain configured (HTTPS ready)
- [ ] Files accessible at domain root
- [ ] manifest.json accessible
- [ ] privacy-policy.html accessible
- [ ] Service worker accessible
- [ ] Performance tested (Lighthouse 90+)
- [ ] All store content prepared
- [ ] Icons ready (PNG 192x192, 512x512)
- [ ] Screenshots ready (1280x720, 750x1334)

### PWABuilder Steps

1. [ ] Go to https://www.pwabuilder.com
2. [ ] Enter app URL: https://yourdomain.com
3. [ ] Wait for analysis
4. [ ] Review manifest and service worker
5. [ ] Select platforms to package:
   - [ ] Windows
   - [ ] Android
   - [ ] macOS
   - [ ] iOS
6. [ ] Download packages
7. [ ] Test packages locally
8. [ ] Proceed with store submission

---

## Store Account Setup

### Microsoft Developer

- [ ] Account created
- [ ] $19 registration fee paid
- [ ] Account verified
- [ ] Ready for app submission
- [ ] MSIX package ready

### Google Play Developer

- [ ] Account created
- [ ] $25 registration fee paid
- [ ] Account verified
- [ ] Ready for app submission
- [ ] APK/AAB packages ready
- [ ] Signed with keystore

### Apple Developer (Optional)

- [ ] Account created
- [ ] $99/year membership active
- [ ] App ID created
- [ ] Certificates generated
- [ ] Provisioning profiles set up
- [ ] **Note:** Consider native Swift app instead

---

## Final Pre-Launch Review

### Code Review

- [ ] Code follows best practices
- [ ] No hardcoded secrets
- [ ] Error handling comprehensive
- [ ] User feedback clear (toasts, modals)
- [ ] Logging appropriate (not verbose)
- [ ] No console.log in production

### Design Review

- [ ] UI matches FCC design system
- [ ] Dark theme consistent throughout
- [ ] Glassmorphism applied correctly
- [ ] Spacing/padding consistent
- [ ] Typography consistent
- [ ] Icon sizing consistent
- [ ] Color palette consistent

### Documentation Review

- [ ] Code comments clear
- [ ] README complete
- [ ] Privacy policy comprehensive
- [ ] PWABUILDER_GUIDE accurate
- [ ] STORE_LISTING content ready
- [ ] All URLs correct

### Testing Summary

- [ ] Offline: PASS
- [ ] Online: PASS
- [ ] Mobile: PASS
- [ ] Desktop: PASS
- [ ] Accessibility: PASS
- [ ] Performance: PASS
- [ ] Security: PASS
- [ ] Privacy: PASS

---

## Launch Decision

### Go/No-Go Criteria

**GO if:**
- [ ] All critical checklist items complete
- [ ] Lighthouse score 90+
- [ ] No critical bugs
- [ ] All store requirements met
- [ ] Privacy policy complete
- [ ] Team approval obtained

**NO-GO if:**
- [ ] Any critical bugs remain
- [ ] Lighthouse score < 90
- [ ] Missing store requirements
- [ ] Privacy/security concerns
- [ ] Performance issues
- [ ] Accessibility fails WCAG AA

### Launch Sign-Off

- [ ] Product Lead: _______________
- [ ] Quality Assurance: _______________
- [ ] Legal/Compliance: _______________
- [ ] Security Review: _______________

**Status:** ☐ APPROVED TO LAUNCH  ☐ NOT APPROVED

---

## Post-Launch Monitoring

### Day 1 (Launch Day)

- [ ] Monitor store console for errors
- [ ] Check crash reports
- [ ] Monitor user reviews
- [ ] Track download numbers
- [ ] Watch for support emails
- [ ] Maintain availability (ready to respond)

### Week 1

- [ ] Review all crash reports
- [ ] Respond to user reviews
- [ ] Track feature requests
- [ ] Monitor performance metrics
- [ ] Plan critical fixes (if needed)
- [ ] Communicate status to team

### Month 1

- [ ] Analyze download trends
- [ ] Review retention metrics
- [ ] Collect user feedback
- [ ] Plan first update
- [ ] Address top bug reports
- [ ] Optimize marketing

### Ongoing

- [ ] Monitor app store metrics
- [ ] Respond to user reviews
- [ ] Plan quarterly updates
- [ ] Maintain security patches
- [ ] Optimize performance
- [ ] Grow user base

---

## Rollback Plan

If critical issues discovered post-launch:

1. [ ] Remove from store listings (if necessary)
2. [ ] Prepare patch/fix
3. [ ] Test thoroughly
4. [ ] Resubmit to store
5. [ ] Communicate with users
6. [ ] Post-mortem analysis

---

## Sign-Off

**Prepared By:** David Perry  
**Date:** April 9, 2026  
**Version:** 7.60  

**Approval Signatures:**

Product Owner: _________________________ Date: _______

Technical Lead: _________________________ Date: _______

Quality Assurance: _________________________ Date: _______

---

## Appendix: Key Files Locations

```
/sessions/focused-funny-noether/mnt/com~apple~CloudDocs/AI-Safe/Portfolio-App/

├── financial_command_centre.html          Main PWA app
├── manifest.json                          PWA manifest
├── sw.js                                  Service worker
├── icon.svg                               SVG icon source
├── icon-192.png                           App icon (192x192) - TO CREATE
├── icon-512.png                           App icon (512x512) - TO CREATE
├── privacy-policy.html                    Privacy policy
├── screenshot-wide.png                    Wide screenshot (1280x720) - TO CREATE
├── screenshot-narrow.png                  Narrow screenshot (750x1334) - TO CREATE
│
└── Docs/
    ├── PWABUILDER_GUIDE.md               PWABuilder submission guide
    ├── STORE_LISTING.md                  Store listing content
    ├── APP_STORE_README.md               App store overview
    └── DEPLOYMENT_CHECKLIST.md           This file
```

---

**Ready to deploy!**
