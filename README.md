# Haki Tools — Marketing Site

Production-ready static marketing site for Haki Tools. Single HTML file with CSS and JS — no build step, no server required. Upload the contents directly to any static host or VPS.

---

## Quick Start

1. Unzip the archive
2. Set up your Formspree form endpoint (see below)
3. Upload all files to your VPS / static host
4. Done

---

## File Structure

```
haki-tools/
├── index.html                  ← Main page (all sections)
├── config/
│   └── site.js                 ← ALL editable content and settings
├── css/
│   ├── tokens.css              ← Design tokens (colors, spacing, type)
│   ├── base.css                ← Reset and global styles
│   └── components.css          ← Section and component styles
├── js/
│   ├── animations.js           ← GSAP ScrollTrigger + nav + FAQ
│   ├── hero-particles.js       ← Three.js particle hero effect
│   └── form.js                 ← Form validation and submission
└── assets/
    ├── logos/
    │   ├── haki-tools-symbol.svg   ← Logo mark (H icon)
    │   ├── haki-tools-wordmark.svg ← Full wordmark
    │   ├── favicon.svg             ← Browser tab icon
    │   └── favicon.png             ← Fallback favicon
    └── images/
        └── og-image.svg            ← Open Graph / social share image
```

---

## How to Edit Copy

**All editable text and settings are in `config/site.js`.**

Open that file and edit any value:
- `hero.heading` — main headline
- `hero.subheading` — hero paragraph
- `services.lanes[]` — the three service cards (who, bullets)
- `outcomes.items[]` — the four benefit cards
- `process.steps[]` — the four process steps
- `faq.items[]` — FAQ questions and answers
- `contact.heading`, `contact.subheading` — form section intro
- `footer.brand`, `footer.location`, `footer.copyright` — footer text

After editing, save and re-upload `config/site.js` to your VPS.

---

## Formspree Setup

### Step 1 — Create a Formspree account
Go to [formspree.io](https://formspree.io) and create a free account.

### Step 2 — Create a new form
- Click **"+ New Form"**
- Give it a name: `Haki Tools Contact`
- Set the notification email to: `robbie.robinson@akoben.ai`

### Step 3 — Copy the endpoint
Your form endpoint will look like:
```
https://formspree.io/f/xabcdefg
```

### Step 4 — Paste into config
Open `config/site.js` and update:
```js
form: {
  provider:          "formspree",
  formEndpoint:      "https://formspree.io/f/YOUR_ID_HERE",  // ← replace this
  notificationEmail: "robbie.robinson@akoben.ai",
},
```

Save the file and re-upload it to your VPS.

### Step 5 — Test
Submit the form on the live site. Check your inbox for the notification.

### Notes
- The form will show a success message in the UI without a page reload
- If the endpoint is still the placeholder value, a developer-mode success state is shown (useful for testing the UI)
- Formspree free tier allows 50 submissions/month; upgrade if needed

---

## Change the Notification Email

In `config/site.js`:
```js
notificationEmail: "robbie.robinson@akoben.ai",  // ← update this
```

Also update it inside your Formspree dashboard under form settings.

---

## Switch Form Providers

The form is provider-agnostic. To switch to [Web3Forms](https://web3forms.com) or another service:

1. Update `formEndpoint` to the new provider's URL
2. Update `provider` to `"web3forms"` (informational only — not logic-breaking)
3. If the new provider uses a different field name for email (not `_replyto`), update `form.js` → the `buildFormData` function
4. Some providers use `action=` on the `<form>` tag directly — that's in `index.html`

---

## Change Colors

Open `css/tokens.css` and edit the brand variables at the top:

```css
--color-mint:          #4ECDC4;   /* Primary accent — Haki mint green */
--color-mint-dark:     #3ab8b0;   /* Hover state */
--color-mint-light:    #7EDDD6;   /* Light variant */
--color-bg:            #080c0c;   /* Page background */
--color-surface:       #0f1515;   /* Card/section background */
```

These cascade through all components automatically.

---

## Replace Logos and Favicon

### Logo mark (`assets/logos/haki-tools-symbol.svg`)
Used in the nav and footer. Replace with your SVG file using the same filename, or update the `src` attributes in `index.html`:
```html
<img src="assets/logos/your-logo.svg" alt="Haki Tools logo mark" />
```

### Favicon (`assets/logos/favicon.svg` + `favicon.png`)
The SVG favicon is used by modern browsers; the PNG is a fallback.
- Replace both files with your favicon images
- Or use a tool like [favicon.io](https://favicon.io) to generate multi-size PNGs

### Open Graph image (`assets/images/og-image.svg`)
Shown when the site is shared on social. Replace with a 1200×630 image. Update the path in `index.html` meta tags if you use a different filename.

---

## Add Social Links to the Footer

In `index.html`, find the footer section (near the bottom) and uncomment the social links block:

```html
<div class="footer-socials">
  <a href="https://instagram.com/hakitools" class="footer-social-link" aria-label="Haki Tools on Instagram">
    <!-- SVG icon here -->
  </a>
</div>
```

Or add them to `config/site.js` in `footer.socials[]` and rebuild the footer markup.

---

## Deploy to VPS

### Option A: Direct file upload (rsync)
```bash
rsync -avz --delete ./haki-tools/ user@your-server.com:/var/www/hakitools.com/
```

### Option B: FTP / SFTP
Use FileZilla or your preferred client. Upload all files to your webroot (e.g., `/var/www/hakitools.com/`).

### Option C: Nginx config (if self-hosting)
```nginx
server {
    listen 80;
    server_name hakitools.com www.hakitools.com;
    root /var/www/hakitools.com;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(css|js|svg|png|jpg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Add SSL with Certbot:
```bash
sudo certbot --nginx -d hakitools.com -d www.hakitools.com
```

### Option D: Static hosts (Netlify, Vercel, Cloudflare Pages)
Drag and drop the `haki-tools/` folder into any of these platforms — they detect static sites automatically.

---

## SEO Notes

- Update `config.seo.canonical` in `config/site.js` to your real domain
- Update the `<link rel="canonical">` and `og:url` in `index.html` to your real domain
- The structured data (JSON-LD) in `index.html` identifies the business as a `ProfessionalService` in Charleston, SC — update the `url` field there too

---

## Performance Notes

- Three.js and GSAP load from CDN (jsDelivr) — fast and cached globally
- `prefers-reduced-motion` is respected: hero particles are disabled, animations simplified
- Fonts load from Fontshare CDN with `display=swap` — no render-blocking
- Total initial JS payload: ~350KB (Three.js ~160KB gzipped ≈ 50KB, GSAP ~30KB)

---

## Tech Stack

| Layer | Technology |
|---|---|
| HTML | Semantic HTML5 |
| CSS | Custom properties, fluid type, no framework |
| Scroll animation | GSAP 3 + ScrollTrigger |
| Hero effect | Three.js particles |
| Form | Formspree (configurable) |
| Icons | Inline SVG |
| Fonts | Fontshare (Clash Display + Satoshi) |

---

## Questions

Contact: `robbie.robinson@akoben.ai`
