# Deployment Guide - FCC v7.60

Complete deployment options ranked from easiest to most powerful.

## Quick Comparison

| Platform | Setup Time | Free Tier | Custom Domain | HTTPS | Best For |
|----------|-----------|-----------|---------------|-------|----------|
| **GitHub Pages** | 5 min | ✅ Forever | ✅ Free | ✅ Auto | Personal projects |
| **Netlify** | 5 min | ✅ Generous | ✅ Free | ✅ Auto | Modern features |
| **Vercel** | 5 min | ✅ Generous | ✅ Free | ✅ Auto | Serverless ready |
| **Cloudflare Pages** | 10 min | ✅ Best free | ✅ Free | ✅ Auto | Performance focus |

---

## Option 1: GitHub Pages (Recommended Start)

**Best for:** Quick deployment, integrated with your GitHub workflow

### Setup

1. Push your code to GitHub (see GITHUB_SETUP.md)

2. Go to repository settings:
   ```
   https://github.com/perrda/FinancialCommandCentre/settings/pages
   ```

3. Under "Build and deployment":
   - Source: **GitHub Actions**
   - The workflow `.github/workflows/deploy.yml` will handle deployment

4. Wait 1-2 minutes for first deployment

5. Your site will be live at:
   ```
   https://perrda.github.io/FinancialCommandCentre/
   ```

### Custom Domain (Optional)

1. Add CNAME record at your DNS provider:
   ```
   Type: CNAME
   Name: fcc (or @)
   Value: perrda.github.io
   ```

2. In GitHub: Settings → Pages → Custom domain
3. Enter your domain (e.g., `fcc.yourdomain.com`)
4. Check "Enforce HTTPS"

### Pros & Cons
- ✅ Free forever
- ✅ Integrated with GitHub
- ✅ Automatic HTTPS
- ❌ No serverless functions (PWA still works)
- ❌ Limited build time (10 min)

---

## Option 2: Netlify

**Best for:** Modern features, form handling, edge functions

### Setup

1. Go to https://netlify.com and sign up (use GitHub login)

2. Click **"Add new site"** → **"Import an existing project"**

3. Connect to GitHub and select `FinancialCommandCentre`

4. Configure build settings:
   - Build command: (leave empty)
   - Publish directory: `.` (root)

5. Click **"Deploy site"**

6. Your site will be live at:
   ```
   https://YOUR-SITE-NAME.netlify.app
   ```

### Custom Domain

1. Site settings → Domain management → Add custom domain
2. Follow DNS setup instructions
3. SSL is automatic

### Configuration File (Optional)

Create `netlify.toml` in project root:

```toml
[build]
  publish = "."
  
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Pros & Cons
- ✅ Best free tier
- ✅ Form handling
- ✅ Serverless functions
- ✅ Branch previews
- ❌ Limited build minutes on free tier

---

## Option 3: Vercel

**Best for:** Vercel's edge network, serverless ready

### Setup

1. Go to https://vercel.com and sign up

2. Click **"Add New..."** → **"Project"**

3. Import your GitHub repo

4. Framework preset: **"Other"**

5. Click **"Deploy"**

6. Live at:
   ```
   https://your-project.vercel.app
   ```

### Configuration File (Optional)

Create `vercel.json` in project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### Pros & Cons
- ✅ Excellent performance
- ✅ Edge network
- ✅ Automatic HTTPS
- ✅ Branch previews
- ❌ Free tier has bandwidth limits

---

## Option 4: Cloudflare Pages

**Best for:** Performance, unlimited bandwidth, edge workers

### Setup

1. Go to https://pages.cloudflare.com

2. Click **"Create a project"** → **"Connect to Git"**

3. Authorize GitHub and select repo

4. Build settings:
   - Production branch: `main`
   - Build command: (leave empty)
   - Build output directory: `.`

5. Click **"Save and Deploy"**

6. Live at:
   ```
   https://YOUR-PROJECT.pages.dev
   ```

### Workers Integration (Future)

For your planned API key vault and CORS proxy:

```javascript
// workers/api-proxy.js
export default {
  async fetch(request, env) {
    // Use env.FINNHUB_KEY (stored as secret)
    const url = new URL(request.url);
    // Proxy to Finnhub with secret key
  }
}
```

### Pros & Cons
- ✅ Unlimited bandwidth
- ✅ Best performance globally
- ✅ Workers for serverless
- ✅ D1 database available
- ❌ Slightly more complex setup

---

## Privacy & Security Considerations

### For Personal Finance App

Since FCC handles sensitive data:

1. **Use HTTPS only** - All platforms above enforce this
2. **Restrict access** (Optional):
   - Netlify: Add password protection
   - Cloudflare: Use Access policies
   - GitHub Pages: Make repo private (requires Pro plan)

3. **Add security headers**:
   ```
   Content-Security-Policy
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Referrer-Policy: strict-origin-when-cross-origin
   ```

4. **Consider self-hosting** for maximum privacy:
   - Use platform like Synology, NAS, or home server
   - Access via VPN or Tailscale
   - Full control over data

---

## Recommended Path

For your situation:

### Phase A (Immediate): GitHub Pages
- Get it live ASAP
- Free, integrated, simple
- Perfect for v7.60 baseline

### Phase B (Future): Cloudflare Pages
- When implementing v8.0 sync features
- Need Workers for API proxy
- Need D1 for cloud sync

---

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All features work
- [ ] PWA install prompt appears
- [ ] Service worker registers
- [ ] Charts render properly
- [ ] localStorage persists
- [ ] APIs respond (CoinGecko, Finnhub)
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)
- [ ] HTTPS active
- [ ] Bookmarks made

---

## Troubleshooting

### Site shows 404
- Check `index.html` is in root directory
- Verify deployment completed in dashboard

### CSS/JS not loading
- Check paths in index.html are relative (`css/`, `js/`)
- Inspect browser console for errors

### CORS errors with APIs
- This is expected for Yahoo Finance
- Working CORS proxies are configured in code
- Consider Cloudflare Workers for production proxy

### PWA install not working
- Requires HTTPS (all platforms provide this)
- Check manifest is accessible
- Service worker must register

---

## Next Steps After Deployment

1. **Bookmark** your live URL
2. **Install** as PWA on devices
3. **Test thoroughly** on mobile and desktop
4. **Share** with trusted family for backup
5. **Monitor** uptime (consider UptimeRobot)
6. **Plan** v8.0 features (sync, backup)
