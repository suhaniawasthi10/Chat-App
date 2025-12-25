# Chat-App Deployment Guide for AWS EC2 Ubuntu

## Prerequisites

Ensure these are installed on your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown ubuntu:ubuntu /var/log/pm2
```

---

## Step 1: Set Permissions

```bash
# Fix ownership of the project directory
sudo chown -R ubuntu:ubuntu /var/www/html/Chat-App
```

---

## Step 2: Configure Environment Variables

### Backend (.env)

```bash
cd /var/www/html/Chat-App/backend
cp .env.example .env
nano .env
```

Update with your production values:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Frontend (.env)

```bash
cd /var/www/html/Chat-App/frontend
cp .env.example .env
nano .env
```

Update:

```env
VITE_API_URL=http://your-ec2-public-ip/api
```

---

## Step 3: Install Dependencies & Build

```bash
# Backend
cd /var/www/html/Chat-App/backend
npm install
npm run build

# Frontend
cd /var/www/html/Chat-App/frontend
npm install
npm run build
```

---

## Step 4: Setup PM2

```bash
# Navigate to project root
cd /var/www/html/Chat-App

# Start all apps with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Copy and run the command it outputs
```

### Useful PM2 Commands

```bash
pm2 logs                    # View all logs
pm2 logs chatapp-backend    # View backend logs
pm2 logs chatapp-frontend   # View frontend logs
pm2 restart all             # Restart all apps
pm2 stop all                # Stop all apps
pm2 delete all              # Remove all apps from PM2
pm2 monit                   # Real-time monitoring
```

---

## Step 5: Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/html/Chat-App/nginx.conf /etc/nginx/sites-available/chatapp

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Enable chatapp site
sudo ln -s /etc/nginx/sites-available/chatapp /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Enable nginx on boot
sudo systemctl enable nginx
```

---

## Step 6: Configure AWS Security Group

Ensure your EC2 Security Group allows:

| Type       | Port | Source    |
|------------|------|-----------|
| HTTP       | 80   | 0.0.0.0/0 |
| HTTPS      | 443  | 0.0.0.0/0 |
| SSH        | 22   | Your IP   |

---

## Step 7: Access Your App

Open in browser:

```
http://your-ec2-public-ip
```

---

## Optional: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is set up automatically
```

---

## Troubleshooting

### Check if services are running

```bash
# Check PM2 processes
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check ports in use
sudo netstat -tlnp | grep -E ':(80|3000|5000)'
```

### View logs

```bash
# PM2 logs
pm2 logs

# Nginx error logs
sudo tail -f /var/log/nginx/chatapp-error.log

# Nginx access logs
sudo tail -f /var/log/nginx/chatapp-access.log
```

### Common fixes

```bash
# Restart everything
pm2 restart all
sudo systemctl restart nginx

# If port already in use
sudo lsof -i :5000  # Find process
sudo kill -9 <PID>  # Kill it
```

---

## Quick Reference

| Service  | Port | Path                              |
|----------|------|-----------------------------------|
| Frontend | 3000 | /var/www/html/Chat-App/frontend   |
| Backend  | 5000 | /var/www/html/Chat-App/backend    |
| Nginx    | 80   | Reverse proxy                     |
