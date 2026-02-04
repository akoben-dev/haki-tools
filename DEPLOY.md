# Deploying Haki Tools to VPS

## Local
1. Make changes and test with `npm run dev`.
2. Commit and push:
   - `git add .`
   - `git commit -m "message"`
   - `git push origin main`

## On the VPS
1. SSH in:
   - `ssh youruser@your-vps-ip`
   - `cd /var/www/haki-tools`
2. Update code:
   - `git pull origin main`
   - `npm install` (if package.json changed)
   - `npm run build`
3. Restart app:
   - `pm2 restart haki-tools`
   - `pm2 save`
