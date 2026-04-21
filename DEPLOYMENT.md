# ProBot Clone - Deployment Guide

This guide provides step-by-step instructions for deploying the ProBot Clone Discord Bot System on a Linux VPS (Ubuntu).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Docker Deployment](#docker-deployment)
4. [Manual Deployment](#manual-deployment)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- Ubuntu 20.04 LTS or newer
- 2GB RAM minimum (4GB recommended)
- 10GB disk space
- Docker & Docker Compose (for containerized deployment)
- Node.js 18+ (for manual deployment)
- MySQL 8.0+ or compatible database

### Required Accounts & Tokens

1. **Discord Bot Token**
   - Create an application at [Discord Developer Portal](https://discord.com/developers/applications)
   - Create a bot user and copy the token
   - Enable required intents (Message Content, Server Members)

2. **Discord OAuth2 Credentials**
   - In the same application, go to OAuth2 settings
   - Add redirect URL: `https://your-domain.com/api/oauth/callback`
   - Copy Client ID and Client Secret

3. **Database Credentials**
   - MySQL host, port, username, password
   - Pre-created database name

## Environment Setup

### 1. Install Docker & Docker Compose

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2. Clone or Upload Project

```bash
# Clone from repository (if using Git)
git clone https://github.com/yourusername/probot-clone.git
cd probot-clone

# Or upload via SCP/SFTP
scp -r ./ProBotClone user@your-vps:/home/user/
```

## Docker Deployment (Recommended)

### 1. Create Environment File

Create a `.env` file in the project root:

```bash
cat > .env << 'EOF'
# Database
DATABASE_URL=mysql://username:password@mysql:3306/probot_db

# Discord Bot
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret

# OAuth
OAUTH_REDIRECT_URL=https://your-domain.com/api/oauth/callback

# Application
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=ProBot Clone
VITE_APP_ID=your_app_id

# JWT
JWT_SECRET=your_jwt_secret_here_min_32_chars

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im

# Frontend
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
EOF
```

### 2. Create Docker Compose File

The project includes a `docker-compose.yml` file. Review and adjust as needed:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec app pnpm drizzle-kit migrate

# Verify tables were created
docker-compose exec mysql mysql -u username -p database_name -e "SHOW TABLES;"
```

### 4. Access the Dashboard

- Dashboard: `https://your-domain.com`
- API: `https://your-domain.com/api`

## Manual Deployment

### 1. Install Dependencies

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Install MySQL
sudo apt install -y mysql-server
```

### 2. Setup Application

```bash
cd /home/user/ProBotClone

# Install dependencies
pnpm install

# Create .env file (see Docker section above)
nano .env

# Run migrations
pnpm drizzle-kit migrate

# Build application
pnpm build

# Start application
pnpm start
```

### 3. Setup Systemd Service

Create `/etc/systemd/system/probot.service`:

```ini
[Unit]
Description=ProBot Clone Discord Bot Dashboard
After=network.target mysql.service

[Service]
Type=simple
User=probot
WorkingDirectory=/home/probot/ProBotClone
Environment="NODE_ENV=production"
EnvironmentFile=/home/probot/ProBotClone/.env
ExecStart=/usr/local/bin/pnpm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable probot
sudo systemctl start probot
sudo systemctl status probot
```

## Configuration

### 1. Domain & SSL

```bash
# Install Certbot for Let's Encrypt SSL
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Configure Nginx reverse proxy (optional)
# See nginx.conf example below
```

### 2. Nginx Configuration (Optional)

Create `/etc/nginx/sites-available/probot`:

```nginx
upstream probot {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://probot;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/probot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. Database Backup

```bash
# Create backup script
cat > /home/user/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/user/backups"
mkdir -p $BACKUP_DIR
mysqldump -u username -p database_name > $BACKUP_DIR/probot_$(date +%Y%m%d_%H%M%S).sql
EOF

chmod +x /home/user/backup-db.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/user/backup-db.sh") | crontab -
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test connection
mysql -h localhost -u username -p -e "SELECT 1;"

# Check MySQL status
sudo systemctl status mysql
sudo systemctl restart mysql
```

### Discord Bot Not Responding

1. Verify bot token in `.env`
2. Check bot permissions in Discord server
3. Ensure bot has required intents enabled
4. Check firewall rules allow outbound connections

### Memory Issues

```bash
# Check memory usage
free -h

# Increase swap if needed
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Log Files

```bash
# Docker logs
docker-compose logs app

# Systemd service logs
sudo journalctl -u probot -f

# Application logs
tail -f /home/user/ProBotClone/.manus-logs/devserver.log
```

## Security Recommendations

1. **Use strong passwords** for database and JWT secret
2. **Enable firewall** - only allow ports 80, 443, and 22
3. **Keep system updated** - run `sudo apt update && sudo apt upgrade` regularly
4. **Use HTTPS** - always use SSL/TLS certificates
5. **Rotate secrets** - periodically update sensitive tokens
6. **Monitor logs** - regularly check application and system logs
7. **Backup data** - maintain regular database backups

## Support

For issues or questions:
- Check the troubleshooting section above
- Review application logs
- Consult Discord.js documentation
- Open an issue on the project repository

---

**Last Updated:** April 2026
**Version:** 1.0.0
