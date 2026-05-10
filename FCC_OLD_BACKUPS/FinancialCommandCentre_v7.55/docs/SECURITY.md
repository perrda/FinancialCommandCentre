# Portfolio App - Security Architecture

**Version:** 1.0
**Last Updated:** April 2026
**Status:** Production-Ready

---

## Table of Contents

1. [Overview](#overview)
2. [Biometric Authentication](#biometric-authentication)
3. [API Key Management](#api-key-management)
4. [Data Encryption](#data-encryption)
5. [Privacy & GDPR](#privacy--gdpr)
6. [App Store Privacy Policy](#app-store-privacy-policy)
7. [Security Best Practices](#security-best-practices)
8. [Threat Model](#threat-model)
9. [Security Checklist](#security-checklist)

---

## Overview

Portfolio App handles sensitive financial data. Security must be implemented at every layer:

1. **Authentication:** Biometric (Face ID/Touch ID) + fallback
2. **Transport:** HTTPS for all API calls
3. **Storage:** Encrypted UserDefaults + iCloud encryption
4. **Code:** No hardcoded secrets, environment variables only
5. **Privacy:** GDPR compliance, minimal data collection

---

## Biometric Authentication

### Implementation Overview

Biometric authentication (Face ID/Touch ID) is the primary security mechanism, with PIN fallback.

```
User launches app
    ↓
Is biometric authentication enabled in settings?
    ├─ YES → Request Face ID / Touch ID
    │        ├─ Success → Grant app access
    │        ├─ Failed (1-3 attempts) → "Try again"
    │        └─ Failed (4+ attempts) → Show PIN fallback
    │            ├─ User enters 6-digit PIN
    │            ├─ PIN correct → Grant access
    │            └─ PIN wrong → Lock account (15 min timeout)
    │
    └─ NO → Request PIN directly
             ├─ User enters PIN
             ├─ Correct → Grant access
             └─ Wrong → Lock account (15 min timeout)
```

### Biometric Implementation

```swift
import LocalAuthentication

class BiometricAuth {
    let context = LAContext()

    func requestBiometric() async -> Bool {
        var error: NSError?

        // Check if biometric authentication is available
        guard context.canEvaluatePolicy(
            .deviceOwnerAuthenticationWithBiometrics,
            error: &error
        ) else {
            // Fallback to PIN
            return await requestPIN()
        }

        // Request biometric
        let reason = "Authenticate to access your portfolio"

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthenticationWithBiometrics,
                localizedReason: reason
            )
            return success
        } catch {
            // Handle specific errors
            let laError = error as? LAError
            switch laError?.code {
            case .userCancel:
                return false

            case .userFallback:
                // User tapped fallback button → show PIN
                return await requestPIN()

            case .biometryNotAvailable:
                // Device doesn't support biometric
                return await requestPIN()

            case .biometryNotEnrolled:
                // User hasn't set up Face ID / Touch ID
                return await requestPIN()

            case .biometryLockout:
                // Too many failed attempts
                showAlert("Too many failed attempts. Try again later.")
                return false

            default:
                print("Biometric error: \(error)")
                return false
            }
        }
    }

    func requestPIN() async -> Bool {
        // Show PIN entry UI
        let viewModel = PINEntryViewModel()
        let result = await viewModel.enterPIN()

        if result.isCorrect {
            if result.attemptsRemaining <= 1 {
                // Reset after successful login
                viewModel.resetAttempts()
            }
            return true
        } else {
            // Decrement attempts
            viewModel.decrementAttempts()

            if result.attemptsRemaining == 0 {
                // Lock account for 15 minutes
                lockAccount(for: 15 * 60)
                showAlert("Account locked. Try again in 15 minutes.")
                return false
            } else {
                showAlert("Incorrect PIN. \(result.attemptsRemaining) attempts remaining.")
                return false
            }
        }
    }

    func biometricType() -> String {
        switch context.biometryType {
        case .none:
            return "None"
        case .touchID:
            return "Touch ID"
        case .faceID:
            return "Face ID"
        @unknown default:
            return "Unknown"
        }
    }
}
```

### PIN Management

```swift
class PINManager {
    private let defaults = UserDefaults.standard
    private let keychain = KeychainManager()

    // Store PIN hash (never store plain PIN)
    func setPIN(_ pin: String) {
        let hash = hashPIN(pin)
        try? keychain.store(hash, forKey: "pin_hash")
    }

    func verifyPIN(_ pin: String) -> Bool {
        let hash = hashPIN(pin)
        guard let storedHash = try? keychain.retrieve("pin_hash") else {
            return false
        }
        return hash == storedHash
    }

    private func hashPIN(_ pin: String) -> String {
        // Use PBKDF2 with salt
        let salt = UUID().uuidString.data(using: .utf8)!
        let keyData = pin.data(using: .utf8)!

        var derivedKeyData = [UInt8](repeating: 0, count: 32)
        _ = derivedKeyData.withUnsafeMutableBytes { bytes in
            CCKeyDerivationPBKDF(
                CCPBKDFAlgorithm(kCCPBKDF2),
                pin,
                pin.count,
                salt.bytes,
                salt.count,
                CCPseudoRandomAlgorithm(kCCPRFHmacAlgSHA256),
                10000,
                bytes.baseAddress!,
                derivedKeyData.count
            )
        }

        return Data(derivedKeyData).base64EncodedString()
    }

    // Lock account after failed attempts
    func lockAccount(for duration: TimeInterval) {
        let lockUntil = Date().addingTimeInterval(duration)
        try? keychain.store(lockUntil.timeIntervalSince1970.description, forKey: "account_locked_until")
    }

    func isAccountLocked() -> Bool {
        guard let lockUntilTimestamp = try? keychain.retrieve("account_locked_until") else {
            return false
        }
        let lockUntil = Date(timeIntervalSince1970: Double(lockUntilTimestamp) ?? 0)
        return Date() < lockUntil
    }
}
```

### Settings for Biometric

**Settings → Security Tab:**
```
┌─────────────────────────────────────┐
│           SECURITY                  │
├─────────────────────────────────────┤
│                                     │
│ Biometric Authentication            │
│ ├─ Face ID / Touch ID   [Toggle ON] │
│                                     │
│ Change PIN              [Button]    │
│                                     │
│ Timeout Duration        [5 minutes] │
│ (after background)                  │
│                                     │
│ Lock on Background      [Toggle ON] │
│                                     │
│ Failed Attempts         [3/3]       │
│                                     │
└─────────────────────────────────────┘
```

---

## API Key Management

### Never Hardcode API Keys

**Bad (NEVER DO THIS):**
```swift
// Xcode Build Phases script
let finnhubKey = "fh_0123456789abcdef"
let coingeckoKey = "api_key_12345"
```

**Good (Environment Variables):**

#### Step 1: Create Config File

Create `Secrets.xcconfig` (NOT tracked in Git):
```
FINNHUB_API_KEY = fh_0123456789abcdef
COINGECKO_API_KEY = cg_0123456789abcdef
EXCHANGE_RATE_API_KEY = er_0123456789abcdef
```

#### Step 2: Reference in Build Settings

**Xcode Project Settings:**
```
Build Settings → All → Levels
  User-Defined
    Config file: Secrets.xcconfig
```

#### Step 3: Access in Code

```swift
struct APIKeys {
    static let finnhubKey: String = {
        guard let key = Bundle.main.infoDictionary?["FINNHUB_API_KEY"] as? String else {
            fatalError("Missing FINNHUB_API_KEY in Info.plist")
        }
        return key
    }()

    static let coingeckoKey: String? = {
        Bundle.main.infoDictionary?["COINGECKO_API_KEY"] as? String
        // Optional: CoinGecko free tier doesn't require key
    }()
}

// Usage:
let url = "https://finnhub.io/api/v1/quote?symbol=AAPL&token=\(APIKeys.finnhubKey)"
```

#### Step 4: Git Ignore

**`.gitignore`:**
```
# Secrets and config files
Secrets.xcconfig
*.plist (if containing secrets)
.env
.env.local

# Don't commit API keys
Config.private.swift
APIKeys.swift (if hardcoded)
```

### Keychain Storage (Advanced)

For production, store API keys in Keychain:

```swift
import Security

class KeychainManager {
    static let shared = KeychainManager()

    func store(_ value: String, forKey key: String) throws {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: value.data(using: .utf8)!
        ]

        // Delete if exists
        SecItemDelete(query as CFDictionary)

        // Store new value
        let status = SecItemAdd(query as CFDictionary, nil)
        guard status == errSecSuccess else {
            throw KeychainError.storeFailed
        }
    }

    func retrieve(_ key: String) throws -> String {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess,
              let data = result as? Data,
              let value = String(data: data, encoding: .utf8) else {
            throw KeychainError.retrieveFailed
        }

        return value
    }
}

enum KeychainError: Error {
    case storeFailed
    case retrieveFailed
}

// Usage:
try? KeychainManager.shared.store(finnhubKey, forKey: "finnhub_api_key")
let key = try? KeychainManager.shared.retrieve("finnhub_api_key")
```

### API Key Rotation

1. **Generate new keys** in API provider dashboard
2. **Test new keys** in development environment
3. **Deploy updated code** with new keys
4. **Monitor for errors** during transition period
5. **Revoke old keys** after 7 days

### No API Keys in Logs

```swift
// Bad:
print("Calling API with key: \(apiKey)")

// Good:
print("Calling API with key: [REDACTED]")

// Better:
#if DEBUG
print("Calling API with key: \(apiKey)")
#else
print("Calling API")
#endif
```

---

## Data Encryption

### Encryption Strategy

| Data Type | Location | Encryption | Key Storage |
|-----------|----------|-----------|-------------|
| Portfolios/Assets | UserDefaults | AES-256 | Device keychain |
| PIN | Keychain | PBKDF2 hash | Secure enclave |
| API Keys | Keychain | Encrypted | Device keychain |
| Cache (prices) | Memory | None | RAM only |
| Backups | iCloud | File encryption | iCloud encryption |

### UserDefaults Encryption

```swift
class EncryptedDefaults {
    private let cipher: CryptoKit.AES.GCM
    private let keychain = KeychainManager.shared

    func encryptedSet<T: Encodable>(_ value: T, forKey key: String) throws {
        let encoder = JSONEncoder()
        let data = try encoder.encode(value)

        // Get or create encryption key
        let encryptionKey = try getOrCreateEncryptionKey()

        // Encrypt using AES-GCM
        let nonce = AES.GCM.Nonce()
        let sealedBox = try AES.GCM.seal(data, using: encryptionKey, nonce: nonce)

        // Store encrypted data + nonce
        var container = [String: Data]()
        container["nonce"] = nonce.withUnsafeBytes { Data($0) }
        container["ciphertext"] = sealedBox.ciphertext
        container["tag"] = sealedBox.tag

        let containerData = try JSONEncoder().encode(container)
        UserDefaults.standard.set(containerData, forKey: key)
    }

    func encryptedGet<T: Decodable>(_ type: T.Type, forKey key: String) throws -> T {
        guard let containerData = UserDefaults.standard.data(forKey: key) else {
            throw DecryptionError.noData
        }

        let container = try JSONDecoder().decode([String: Data].self, from: containerData)
        guard let nonceData = container["nonce"],
              let ciphertext = container["ciphertext"],
              let tag = container["tag"] else {
            throw DecryptionError.invalidFormat
        }

        // Decrypt
        let encryptionKey = try getOrCreateEncryptionKey()
        let nonce = try AES.GCM.Nonce(data: nonceData)
        let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)

        let decrypted = try AES.GCM.open(sealedBox, using: encryptionKey)
        let decoded = try JSONDecoder().decode(T.self, from: decrypted)

        return decoded
    }

    private func getOrCreateEncryptionKey() throws -> SymmetricKey {
        // Check if key exists in keychain
        if let existingKey = try? keychain.retrieve("encryption_key") {
            return SymmetricKey(data: existingKey.data(using: .utf8)!)
        }

        // Create new key
        let key = SymmetricKey(size: .bits256)
        let keyData = key.withUnsafeBytes { Data($0) }
        try keychain.store(keyData.base64EncodedString(), forKey: "encryption_key")

        return key
    }
}

enum DecryptionError: Error {
    case noData
    case invalidFormat
    case decryptionFailed
}
```

### Backup Encryption

iCloud automatically encrypts files in transit and at rest, but you can add additional encryption:

```swift
import CryptoKit

func encryptBackupFile(plaintext: Data, password: String) throws -> Data {
    // Derive key from password
    let salt = Data((0..<16).map { _ in UInt8.random(in: 0...255) })
    let key = try PBKDF2(password: password, salt: salt)

    // Encrypt backup
    let nonce = AES.GCM.Nonce()
    let sealedBox = try AES.GCM.seal(plaintext, using: key, nonce: nonce)

    // Combine salt + nonce + ciphertext
    var encrypted = Data()
    encrypted.append(salt)
    encrypted.append(nonce.withUnsafeBytes { Data($0) })
    encrypted.append(sealedBox.ciphertext)
    encrypted.append(sealedBox.tag)

    return encrypted
}

func decryptBackupFile(encrypted: Data, password: String) throws -> Data {
    // Extract components
    let salt = encrypted.subdata(in: 0..<16)
    let nonceData = encrypted.subdata(in: 16..<32)
    let ciphertext = encrypted.subdata(in: 32..<(encrypted.count - 16))
    let tag = encrypted.subdata(in: (encrypted.count - 16)..<encrypted.count)

    // Derive key from password
    let key = try PBKDF2(password: password, salt: salt)

    // Decrypt
    let nonce = try AES.GCM.Nonce(data: nonceData)
    let sealedBox = try AES.GCM.SealedBox(nonce: nonce, ciphertext: ciphertext, tag: tag)
    let decrypted = try AES.GCM.open(sealedBox, using: key)

    return decrypted
}
```

---

## Privacy & GDPR

### Data Collection Principles

**Privacy First:**
1. Only collect data user provides
2. No tracking, analytics, or advertising
3. No personal information beyond necessary
4. Local storage (no cloud unless user enables)
5. Right to export data anytime

### What We Collect

✓ User creates manually:
- Portfolio names
- Asset holdings
- Purchase prices/dates
- Custom watchlists/goals

✓ System data (necessary for app):
- Device model (for crash reporting)
- iOS version
- App version
- Device ID (for data sync)

✗ We DO NOT collect:
- User identity (no login required)
- Location data
- Browsing history
- Contacts
- Photos/videos
- Health data

### User Rights (GDPR)

Users have the right to:
1. **Access:** Export all data in JSON format
2. **Portability:** Download/transfer data to another app
3. **Deletion:** Delete account and all data
4. **Rectification:** Edit their data anytime
5. **Objection:** Opt-out of crash reporting

### Implementation

```swift
class PrivacyManager {
    // User right to export data
    func exportAllData() -> URL {
        let allData = ExportData(
            portfolios: getAllPortfolios(),
            assets: getAllAssets(),
            // ... all other data
        )

        let encoder = JSONEncoder()
        let jsonData = try! encoder.encode(allData)

        let tempURL = FileManager.default.temporaryDirectory
            .appendingPathComponent("portfolio_export_\(Date.now.formatted()).json")
        try? jsonData.write(to: tempURL)

        return tempURL
    }

    // User right to delete all data
    func deleteAllData() {
        let defaults = UserDefaults.standard
        let keysToDelete = defaults.dictionaryRepresentation().keys
        keysToDelete.forEach { defaults.removeObject(forKey: $0) }

        // Also clear Keychain
        let keychain = KeychainManager()
        ["pin_hash", "encryption_key", "api_keys"].forEach {
            try? keychain.deleteItem($0)
        }

        // Show success
        showAlert("All data deleted successfully")
    }

    // Crash reporting opt-out
    func setCrashReportingEnabled(_ enabled: Bool) {
        UserDefaults.standard.set(enabled, forKey: "crashReportingEnabled")

        if !enabled {
            // Stop sending crash reports
            disableSentry()
        }
    }
}
```

---

## App Store Privacy Policy

### Template Privacy Policy

Use this template or adapt for your needs. Save as `privacy-policy.md` and publish on a website.

```markdown
# Portfolio App - Privacy Policy

**Effective Date:** April 2026
**Last Updated:** April 2026

## Overview

Portfolio App ("the App") is committed to protecting your privacy.
This policy explains how we handle your data.

## Data We Collect

### Information You Provide
- Portfolio names and holdings
- Asset purchase prices and dates
- Custom watchlists and goals
- Backup/sync preferences

This information is stored locally on your device.

### Automatically Collected
- Device model and iOS version (for crash reporting only)
- App version
- Installation date

We do NOT collect:
- Identity information (no account required)
- Location data
- Browsing history
- Contacts or photos
- Health data

## Data Storage

- **Primary:** Local on your device (UserDefaults)
- **Backup:** Optional iCloud backup (encrypted by Apple)
- **APIs:** We call CoinGecko and Finnhub APIs
  - Your IP address is visible to them
  - Asset symbols you search for may be logged
  - No personal data is sent to these APIs

## Data Sharing

We do NOT share your data with:
- Advertising networks
- Analytics services (optional crash reporting only)
- Third parties
- Anyone

Your data stays private on your device.

## User Rights

You have the right to:
1. Export all data as JSON (Settings → Export)
2. Delete all data (Settings → Delete All Data)
3. Disable crash reporting (Settings → Privacy)

## Third-Party APIs

The App uses:
- **CoinGecko API:** Cryptocurrency prices
  - Free tier, no API key
  - Privacy: https://www.coingecko.com/en/privacy

- **Finnhub API:** Stock prices
  - Requires free API key
  - Privacy: https://finnhub.io/privacy

## Security

- All data encrypted at rest (AES-256)
- PIN/biometric authentication required
- No data sent without HTTPS
- Keychain used for sensitive data

## Changes to Policy

We may update this policy. Changes will be posted here
with an updated date. Continued use of the App means
acceptance of changes.

## Contact

For privacy questions: contact@portfolio.app

---
*This Privacy Policy is effective as of April 2026*
```

### App Store Privacy Questionnaire

When submitting to App Store, answer the privacy questionnaire:

```
HEALTH & FITNESS
- Health data: NO
- Fitness data: NO
- Menstrual cycle data: NO

FINANCIAL INFORMATION
- Credit cards: NO (user enters only for their own apps)
- Banking: NO (display only, we don't access banks)
- Payment info: NO
- Cryptocurrency/NFTs: YES (we display holdings)
- Purchase history: NO

LOCATION
- Precise location: NO
- Coarse location: NO

SENSITIVE INFORMATION
- Sensitive info: NO
- Religion/ethics: NO
- Sexual orientation: NO

CONTACTS
- Contacts: NO
- Emails: NO
- Phone numbers: NO

SEARCH HISTORY
- Search history: NO

BROWSING HISTORY
- Browsing history: NO

USER ID
- User ID: NO
- Device ID (for sync): YES (needed for CloudKit)

PURCHASES
- Purchase history: NO

USAGE DATA
- App crashes: YES (crash reporting, optional)
- Performance data: NO
- Other diagnostics: NO

OTHER DATA
- Financial info: NO (we don't collect)
- Precise location: NO
- Health/fitness: NO
- Contacts: NO
- Photos/videos: NO
- Audio: NO
- Biometric: NO (Face ID used for auth only, not collected)
```

---

## Security Best Practices

### 1. Code Security

```swift
// Validate all API responses
func validatePriceData(_ data: [String: Any]) throws {
    guard let price = data["price"] as? Double else {
        throw ValidationError.missingPrice
    }
    guard price >= 0 else {
        throw ValidationError.negativePriceA
    }
    // Don't trust external data blindly
}

// Sanitize user input
func sanitizePortfolioName(_ name: String) -> String {
    return name
        .trimmingCharacters(in: .whitespaces)
        .prefix(100) // Max length
        .filter { !$0.isControl } // Remove control chars
}

// Use SecureString for sensitive data
class SecureString {
    private(set) var value: String

    init(_ value: String) {
        self.value = value
    }

    deinit {
        // Overwrite memory
        self.value = String(repeating: "\0", count: self.value.count)
    }
}
```

### 2. Network Security

```swift
// Only use HTTPS
let urlString = "https://api.coingecko.com/api/v3/..." // HTTPS required
// Never: "http://..."

// Validate certificates
let session = URLSession(configuration: .default)
// Default URLSession validates certificates automatically

// Use secure timeout
var request = URLRequest(url: url)
request.timeoutInterval = 30 // 30 seconds max

// Don't log sensitive data
func logResponse(_ response: URLResponse, data: Data) {
    if let httpResponse = response as? HTTPURLResponse {
        print("Status: \(httpResponse.statusCode)")
        // Don't log response body if it contains prices/data
    }
}
```

### 3. Local Storage Security

```swift
// Use Keychain for sensitive data
func storeSecretely(_ secret: String, forKey key: String) {
    let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: key,
        kSecValueData as String: secret.data(using: .utf8) ?? Data()
    ]
    SecItemAdd(query as CFDictionary, nil)
}

// Don't store sensitive data in UserDefaults
// Bad:
UserDefaults.standard.set(apiKey, forKey: "apiKey")

// Good:
try? keychain.store(apiKey, forKey: "apiKey")
```

### 4. Build Configuration

**Disable Debug Features in Release:**
```swift
#if DEBUG
// Debug logging allowed
print("Sensitive: \(apiKey)")
#else
// Production: no sensitive logging
print("API call made")
#endif

// Disable testability in release builds
// Xcode → Build Settings → Enable Testability → NO
```

### 5. Dependency Security

```
// Use dependencies from trusted sources only
// Keep dependencies up to date
// Regularly audit for security vulnerabilities

Swift Package Dependencies (Recommended):
- Alamofire (networking)
- SwiftyJSON (JSON parsing)
- KeychainAccess (keychain management)
- Sentry (crash reporting - optional)

Avoid:
- Unmaintained packages
- Packages with many unresolved security issues
- Packages that require root/special permissions
```

---

## Threat Model

### Identified Threats

| Threat | Likelihood | Impact | Mitigation |
|--------|-----------|--------|-----------|
| Unauthorized app access | Medium | Critical | Biometric + PIN auth |
| API key theft | Low | High | Environment variables, Keychain |
| MITM attack | Low | High | HTTPS only, cert validation |
| Malware reading UserDefaults | Low | High | Data encryption (AES-256) |
| iCloud account compromise | Low | Critical | Optional iCloud, user controls |
| User forgets PIN | High | Low | Backup codes, email recovery |
| Backup data leak | Low | High | Encrypted backups, file permissions |

### Risk Mitigation Priorities

1. **High Priority:**
   - Implement biometric authentication
   - Encrypt all data at rest
   - Use HTTPS for all APIs
   - Validate all API responses

2. **Medium Priority:**
   - Implement PIN fallback
   - Secure storage of secrets
   - Crash reporting (optional)
   - Code signing

3. **Low Priority:**
   - Obfuscation of app binary
   - Ad-hoc security testing
   - Penetration testing

---

## Security Checklist

Before App Store submission:

**Authentication:**
- [ ] Biometric authentication implemented
- [ ] PIN fallback works correctly
- [ ] Account lockout after failed attempts
- [ ] Timeout when app backgrounded

**API Security:**
- [ ] All API keys in environment variables (not hardcoded)
- [ ] HTTPS used for all API calls
- [ ] Certificates validated
- [ ] Request/response sanitized
- [ ] Rate limiting implemented

**Data Storage:**
- [ ] Sensitive data encrypted (AES-256)
- [ ] Keychain used for secrets
- [ ] No sensitive data in logs
- [ ] UserDefaults doesn't contain secrets
- [ ] Backups encrypted

**Privacy:**
- [ ] Privacy policy written and published
- [ ] App Store privacy questionnaire completed
- [ ] GDPR compliance verified
- [ ] No unnecessary permissions requested
- [ ] Crash reporting is optional

**Code Quality:**
- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] SQL injection impossible (no SQL used)
- [ ] XSS impossible (no web views with user content)
- [ ] Dependencies up to date
- [ ] No deprecated security APIs

**Testing:**
- [ ] Security testing completed
- [ ] Biometric tested on real device
- [ ] PIN tested (correct and incorrect)
- [ ] Offline mode tested
- [ ] Backup/restore tested
- [ ] Data migration tested

---

## References

- OWASP Mobile Top 10: https://owasp.org/www-project-mobile-top-10/
- Apple Security: https://developer.apple.com/security/
- CryptoKit Documentation: https://developer.apple.com/documentation/cryptokit
- Keychain Services: https://developer.apple.com/documentation/security/keychain
- GDPR Guide: https://gdpr-info.eu/
- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

