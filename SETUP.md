# Quick Setup Guide

## 🚀 Get Started in 3 Steps

### Step 1: Verify Your Local Files

Your FCC v7.60 should be at:
```
/Users/davidperry/Desktop/iCloud/AI_Projects/FCC
```

Verify these files exist:
- ✅ `index.html`
- ✅ `css/style.css`
- ✅ `js/app.js`
- ✅ `js/config.js`
- ✅ `README.md`
- ✅ `LICENSE`
- ✅ `.gitignore`
- ✅ `.github/workflows/deploy.yml`
- ✅ `.github/workflows/validate.yml`

### Step 2: Test Locally

Open Terminal:
```bash
cd "/Users/davidperry/Desktop/iCloud/AI_Projects/FCC"

# Option A: Python (built-in on Mac)
python3 -m http.server 8000

# Option B: Node.js
npx serve .

# Option C: Just open in browser
open index.html
```

Then visit http://localhost:8000 to verify everything works.

### Step 3: Push to GitHub

```bash
cd "/Users/davidperry/Desktop/iCloud/AI_Projects/FCC"

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: FCC v7.60 modular structure"

# Connect to GitHub
git branch -M main
git remote add origin https://github.com/perrda/FinancialCommandCentre.git

# Push
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to: https://github.com/perrda/FinancialCommandCentre/settings/pages
2. Source: **GitHub Actions**
3. Wait 1-2 minutes
4. Live at: https://perrda.github.io/FinancialCommandCentre/

---

## 📚 Detailed Guides

- [GitHub Setup](docs/GITHUB_SETUP.md) - Detailed Git/GitHub instructions
- [Deployment Guide](docs/DEPLOYMENT.md) - All deployment options
- [Architecture](docs/ARCHITECTURE.md) - Technical documentation

## 🆘 Need Help?

Common issues are documented in:
- [GITHUB_SETUP.md → Troubleshooting](docs/GITHUB_SETUP.md#troubleshooting)
- [DEPLOYMENT.md → Troubleshooting](docs/DEPLOYMENT.md#troubleshooting)
