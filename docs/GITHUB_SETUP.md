# GitHub Setup Guide

Complete guide for pushing FCC v7.60 to GitHub and setting up CI/CD.

## Prerequisites

- Git installed (`git --version` to check)
- GitHub account: [github.com/perrda](https://github.com/perrda)
- Repository: [github.com/perrda/FinancialCommandCentre](https://github.com/perrda/FinancialCommandCentre)

---

## Step 1: Open Terminal

```bash
# Navigate to your FCC folder
cd "/Users/davidperry/Desktop/iCloud/AI_Projects/FCC"
```

## Step 2: Initialize Git (Fresh Setup)

If this is a brand new repository:

```bash
# Initialize git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: FCC v7.60 modular structure"

# Set main branch
git branch -M main

# Add remote
git remote add origin https://github.com/perrda/FinancialCommandCentre.git

# Push to GitHub
git push -u origin main
```

## Step 3: Update Existing Repository

If the repo already exists on GitHub with content:

### Option A: Force Push (⚠️ Replaces remote completely)

```bash
cd "/Users/davidperry/Desktop/iCloud/AI_Projects/FCC"

# Initialize and add
git init
git add .
git commit -m "Refactor: FCC v7.60 modular structure"

# Set main and add remote
git branch -M main
git remote add origin https://github.com/perrda/FinancialCommandCentre.git

# Force push (overwrites remote!)
git push -u origin main --force
```

### Option B: Pull, Merge, Push (preserves history)

```bash
cd "/Users/davidperry/Desktop/iCloud/AI_Projects/FCC"

# Initialize and configure
git init
git remote add origin https://github.com/perrda/FinancialCommandCentre.git

# Fetch existing remote
git fetch origin

# Reset to match local files
git reset origin/main

# Add and commit your local files
git add .
git commit -m "Refactor: FCC v7.60 modular structure"

# Push
git branch -M main
git push -u origin main
```

### Option C: Fresh Start (Delete and Recreate)

1. Go to https://github.com/perrda/FinancialCommandCentre/settings
2. Scroll to bottom → "Delete this repository"
3. Recreate at https://github.com/new
4. Then run "Step 2: Initialize Git (Fresh Setup)" above

---

## Step 4: Authentication

### Using Personal Access Token (Recommended)

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Set expiration and select `repo` scope
4. Copy the token

When pushing, use:
- Username: `perrda`
- Password: Your token (not GitHub password)

### Using SSH (Alternative)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Start agent and add key
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub | pbcopy
```

Then add to GitHub: https://github.com/settings/keys

Change remote URL to SSH:
```bash
git remote set-url origin git@github.com:perrda/FinancialCommandCentre.git
```

---

## Step 5: Verify Push

After pushing, verify at:
```
https://github.com/perrda/FinancialCommandCentre
```

You should see:
- ✅ All your files
- ✅ README.md displayed on homepage
- ✅ Actions tab with running workflows
- ✅ Settings → Pages available

---

## Step 6: Set Up GitHub Pages

1. Go to https://github.com/perrda/FinancialCommandCentre/settings/pages
2. Under "Source", select **GitHub Actions**
3. The deploy.yml workflow will run automatically
4. After completion, your site will be at:
   ```
   https://perrda.github.io/FinancialCommandCentre/
   ```

---

## Common Commands

### Daily Workflow

```bash
# Check status
git status

# Add changes
git add .

# Commit with message
git commit -m "Description of changes"

# Push to GitHub
git push

# Pull latest
git pull
```

### Branching

```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main

# Merge branch
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

### Tagging Versions

```bash
# Create tag
git tag -a v7.60 -m "Version 7.60 - Modular structure"

# Push tags
git push origin --tags
```

---

## Troubleshooting

### "Repository not found"
- Verify repo exists at https://github.com/perrda/FinancialCommandCentre
- Check authentication (token/SSH)

### "Updates were rejected"
```bash
# Pull first
git pull origin main --rebase

# Then push
git push
```

### "Permission denied"
- Token may have expired - generate new one
- Or check SSH key is added to GitHub

### Large files warning
GitHub has 100MB file limit. Our files are well under this.

---

## Next Steps

After successful GitHub push:
1. ✅ Set up GitHub Pages (Step 6 above)
2. ✅ Review automated workflow runs in Actions tab
3. ✅ Add repository description and topics
4. ✅ Consider adding screenshots to /docs/
