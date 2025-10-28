# AWS Lightsail Deployment Guide

## Prerequisites
- AWS Account (free tier available)
- GitHub account with your code pushed
- Credit card for AWS (won't be charged on free tier)

## Step 1: Create Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create instance"**
3. Select:
   - **Platform**: Linux/Unix
   - **Blueprint**: Node.js
   - **Instance plan**: $5/month (1GB RAM, 40GB SSD, 2TB transfer)
4. Name your instance: `wealthsecure-video`
5. Click **"Create instance"**

## Step 2: Create Lightsail Database

1. In Lightsail console, go to **"Databases"** tab
2. Click **"Create database"**
3. Select:
   - **Database engine**: PostgreSQL
   - **Version**: Latest (14.x or higher)
   - **Plan**: $15/month (1GB RAM, 40GB SSD)
4. Name: `wealthsecure-db`
5. Create a strong master password and **save it**
6. Click **"Create database"**
7. Wait 5-10 minutes for database to be ready

## Step 3: Connect to Your Instance

1. In Lightsail console, click on your instance
2. Click **"Connect using SSH"** (opens browser terminal)
3. Or use SSH client:
   ```bash
   ssh -i LightsailDefaultKey.pem ubuntu@YOUR_INSTANCE_IP
   ```

## Step 4: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Install PM2 globally
npm install -g pm2

# Install PostgreSQL client tools
sudo apt install -y postgresql-client
```

## Step 5: Clone Your Repository

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/wealthsecure-video-platform.git
cd wealthsecure-video-platform
```

## Step 6: Configure Environment Variables

1. Get database connection details from Lightsail:
   - Go to your database in Lightsail console
   - Click **"Connect"** tab
   - Copy the connection string

2. Create `.env` file:
```bash
nano .env
```

3. Add these variables:
```env
DATABASE_URL=postgresql://dbmasteruser:YOUR_PASSWORD@YOUR_DB_ENDPOINT:5432/wealthsecure_video
PORT=3001
NODE_ENV=production
```

4. Save and exit (Ctrl+X, Y, Enter)

## Step 7: Set Up Database

```bash
# Create the database
PGPASSWORD=YOUR_DB_PASSWORD psql -h YOUR_DB_ENDPOINT -U dbmasteruser -d postgres -c "CREATE DATABASE wealthsecure_video;"

# Install dependencies
pnpm install

# Run migrations
pnpm db:push
```

## Step 8: Build and Start Application

```bash
# Build frontend
pnpm build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Copy and run the command PM2 outputs
```

## Step 9: Configure Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/wealthsecure
```

Paste this configuration:
```nginx
server {
    listen 80;
    server_name YOUR_INSTANCE_IP;

    client_max_body_size 500M;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/wealthsecure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Step 10: Open Firewall Ports

1. In Lightsail console, go to your instance
2. Click **"Networking"** tab
3. Under **"Firewall"**, add rules:
   - HTTP (port 80)
   - HTTPS (port 443) - for future SSL
   - Custom TCP (port 3001) - for direct access

## Step 11: Test Your Deployment

1. Get your instance's public IP from Lightsail console
2. Visit: `http://YOUR_INSTANCE_IP`
3. You should see your video platform!

## Step 12: Set Up S3 for Video Storage (Optional but Recommended)

For production, you should use AWS S3 instead of local storage:

1. Create S3 bucket in AWS console
2. Create IAM user with S3 access
3. Update `.env` with S3 credentials
4. Update `server/index.js` to use real S3 storage

## Monitoring & Maintenance

```bash
# View logs
pm2 logs

# Restart application
pm2 restart wealthsecure-video

# Check status
pm2 status

# Monitor resources
pm2 monit
```

## Updating Your Application

```bash
cd ~/wealthsecure-video-platform
git pull
pnpm install
pnpm build
pnpm db:push
pm2 restart wealthsecure-video
```

## Troubleshooting

### Application won't start
```bash
pm2 logs wealthsecure-video
```

### Database connection issues
```bash
# Test database connection
PGPASSWORD=YOUR_PASSWORD psql -h YOUR_DB_ENDPOINT -U dbmasteruser -d wealthsecure_video -c "SELECT 1;"
```

### Port already in use
```bash
sudo lsof -i :3001
pm2 delete all
pm2 start ecosystem.config.js
```

## Cost Estimate

- **Instance**: $5/month (can start with $3.50 for 512MB)
- **Database**: $15/month
- **Total**: ~$20/month

**Free for 3 months** with AWS free tier!

## Next Steps

1. Set up custom domain
2. Enable HTTPS with Let's Encrypt
3. Set up automated backups
4. Configure S3 for video storage
5. Set up monitoring alerts

---

Need help? Check the logs first:
```bash
pm2 logs wealthsecure-video --lines 100
```

