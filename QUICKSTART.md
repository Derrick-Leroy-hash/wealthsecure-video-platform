# 🚀 Quick Start - Deploy to AWS Lightsail in 15 Minutes

## What You Need
- AWS Account
- GitHub account
- Your code pushed to GitHub

## 5-Step Deployment

### 1️⃣ Create Lightsail Instance (3 min)
```
AWS Lightsail Console → Create Instance
- Platform: Linux/Unix
- Blueprint: Node.js
- Plan: $5/month
- Name: wealthsecure-video
```

### 2️⃣ Create Database (2 min)
```
Lightsail → Databases → Create
- Engine: PostgreSQL
- Plan: $15/month
- Name: wealthsecure-db
- Save the password!
```

### 3️⃣ Connect & Clone (2 min)
```bash
# Click "Connect using SSH" in Lightsail
cd ~
git clone https://github.com/YOUR_USERNAME/wealthsecure-video-platform.git
cd wealthsecure-video-platform
```

### 4️⃣ Configure (3 min)
```bash
# Create .env file
nano .env
```

Paste this (update with your database details):
```env
DATABASE_URL=postgresql://dbmasteruser:YOUR_PASSWORD@YOUR_DB_ENDPOINT:5432/wealthsecure_video
PORT=3001
NODE_ENV=production
```

Save: `Ctrl+X`, `Y`, `Enter`

### 5️⃣ Deploy (5 min)
```bash
# Run the setup script
bash lightsail-setup.sh

# Enable auto-start on reboot
sudo bash startup-command.sh

# Set up Nginx
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/wealthsecure
```

Paste this Nginx config:
```nginx
server {
    listen 80;
    server_name _;
    client_max_body_size 500M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and start:
```bash
sudo ln -s /etc/nginx/sites-available/wealthsecure /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## ✅ Done!

Visit: `http://YOUR_LIGHTSAIL_IP`

## Common Commands

```bash
# View logs
pm2 logs

# Restart app
pm2 restart wealthsecure-video

# Check status
pm2 status

# Update code
git pull && pnpm install && pnpm build && pm2 restart wealthsecure-video
```

## Need Help?

1. Check logs: `pm2 logs wealthsecure-video`
2. See full guide: `DEPLOYMENT.md`
3. S3 setup: `S3-SETUP.md`

## Cost

- Instance: $5/month
- Database: $15/month
- **Total: $20/month**
- First 3 months free with AWS free tier!

