# ProBot Clone - Discord Bot Management Dashboard

A professional, full-featured Discord bot management dashboard built with React, Next.js, Express, tRPC, and MySQL. This system provides administrators with a comprehensive web-based interface to manage their Discord servers, including moderation, economy, leveling, auto-moderation, and welcome/leave message customization.

## 🎯 Features

### Core Bot Management
- **Discord OAuth2 Authentication** - Secure login for server administrators
- **Server Management** - Configure bot settings per server with feature toggles
- **Role-Based Access Control** - Only server administrators can modify their server settings

### Moderation System
- **Advanced Moderation Actions** - Ban, kick, mute, warn, and clear messages
- **Comprehensive Audit Logs** - Complete history of all moderation actions
- **Moderator Tracking** - See who performed each action and when
- **Reason Documentation** - Record reasons for all moderation actions

### Economy System
- **User Balances** - Track currency for each member
- **Leaderboard** - Display top members by balance
- **Money Transfers** - Allow users to transfer currency to each other
- **Shop System** - Create purchasable items with custom prices
- **Daily Rewards** - Automatic daily currency rewards
- **Transaction History** - View all economy transactions

### Leveling System
- **XP Tracking** - Award XP for member activity
- **Rank Leaderboard** - Display members ranked by level and XP
- **Customizable Messages** - Configure level-up announcement text
- **Channel Selection** - Choose where level-up messages are posted
- **XP Multipliers** - Adjust XP reward rates

### Auto-Moderation
- **Anti-Spam Filter** - Detect and prevent spam messages
- **Anti-Link Filter** - Block specific URL patterns
- **Bad Words Filter** - Filter inappropriate language
- **Configurable Thresholds** - Adjust sensitivity for each filter

### Welcome & Leave Messages
- **Custom Messages** - Personalize welcome and leave text
- **Background Images** - Set custom background URLs for welcome cards
- **Variable Support** - Use {user} and {server} placeholders
- **Live Preview** - See how messages will appear

### Statistics & Analytics
- **Real-Time Dashboard** - Overview of server activity
- **Activity Feed** - View recent events and actions
- **Server Statistics** - Track commands used, members moderated, transactions
- **Performance Metrics** - Monitor bot usage patterns

## 🏗️ Architecture

### Database (14 Tables)
```
users                 - User authentication and profiles
servers              - Discord server information
serverSettings       - Feature toggles and configuration
serverStats          - Server-wide statistics
serverAdmins         - Admin access control
moderationLogs       - Audit trail for moderation actions
economy              - User balances
economyTransfers     - Transaction history
leveling             - User XP and levels
levelingSettings     - Level-up configuration
welcomeSettings      - Welcome/leave messages
autoModSettings      - Filter configuration
shopItems            - Economy shop items
activityFeed         - Real-time activity log
```

### Backend Stack
- **Express.js** - Web server and API
- **tRPC** - Type-safe RPC framework
- **Drizzle ORM** - Database abstraction
- **MySQL** - Primary database
- **Discord.js** - Discord API integration

### Frontend Stack
- **React 19** - UI framework
- **Next.js** - Server-side rendering
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Component library
- **Wouter** - Routing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Discord Bot Token
- Docker & Docker Compose (optional)

### Installation

#### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/yourusername/probot-clone.git
cd probot-clone

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start with Docker Compose
docker-compose up -d

# Access dashboard at https://localhost
```

#### Manual Installation
```bash
# Install dependencies
pnpm install

# Setup database
pnpm drizzle-kit migrate

# Create .env file
cp .env.example .env
# Edit .env with your credentials

# Start development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

## 📋 Configuration

### Environment Variables
See `.env.example` for all required variables:
- `DATABASE_URL` - MySQL connection string
- `DISCORD_BOT_TOKEN` - Discord bot token
- `DISCORD_CLIENT_ID` - Discord OAuth2 client ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth2 client secret
- `JWT_SECRET` - Session encryption key
- `OAUTH_REDIRECT_URL` - OAuth2 callback URL

## 🔒 Security Features

- **Secure OAuth2 Flow** - Industry-standard authentication
- **Role-Based Access Control** - Verify server admin status
- **Input Validation** - Zod schema validation
- **SQL Injection Protection** - Parameterized queries via ORM
- **HTTPS/SSL** - Encrypted connections
- **Environment Variables** - Sensitive data in env files
- **CORS Protection** - Restricted cross-origin requests

## 📊 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout current user

### Servers
- `GET /api/trpc/servers.list` - List user's servers
- `GET /api/trpc/servers.get` - Get server details
- `POST /api/trpc/servers.updateSettings` - Update server settings
- `POST /api/trpc/servers.updateFeatures` - Toggle features

### Moderation
- `GET /api/trpc/moderation.getLogs` - Get audit logs
- `POST /api/trpc/moderation.addAction` - Record action

### Economy
- `GET /api/trpc/economy.getBalance` - Get user balance
- `GET /api/trpc/economy.getLeaderboard` - Get leaderboard
- `POST /api/trpc/economy.transfer` - Transfer currency
- `POST /api/trpc/economy.claimDailyReward` - Claim daily reward

### Leveling
- `GET /api/trpc/leveling.getLeaderboard` - Get rank leaderboard
- `GET /api/trpc/leveling.getSettings` - Get leveling config
- `POST /api/trpc/leveling.updateSettings` - Update config

### Welcome/Leave
- `GET /api/trpc/welcome.getSettings` - Get welcome config
- `POST /api/trpc/welcome.updateSettings` - Update config

### Auto-Moderation
- `GET /api/trpc/automod.getSettings` - Get automod config
- `POST /api/trpc/automod.updateSettings` - Update config

### Activity
- `GET /api/trpc/activity.getFeed` - Get activity feed
- `GET /api/trpc/activity.getStats` - Get statistics

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## 📦 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### VPS Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive instructions including:
- System setup and dependencies
- Manual installation
- Systemd service configuration
- Nginx reverse proxy setup
- SSL/TLS configuration
- Database backup strategies
- Troubleshooting guide

### Platforms
- **Docker** - Containerized deployment
- **Ubuntu/Debian VPS** - Manual deployment
- **Manus** - Managed hosting platform
- **AWS/GCP/Azure** - Cloud deployment

## 🎨 UI/UX Design

The dashboard features:
- **Dark Theme** - Professional, easy-on-the-eyes design
- **Responsive Layout** - Works on desktop, tablet, and mobile
- **Sidebar Navigation** - Quick access to all features
- **Real-Time Updates** - Live data synchronization
- **Loading States** - Smooth loading indicators
- **Error Handling** - Clear error messages
- **Accessibility** - WCAG 2.1 compliant

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment and setup guide
- [API Documentation](./docs/API.md) - Detailed API reference
- [Database Schema](./docs/SCHEMA.md) - Database structure
- [Contributing Guide](./CONTRIBUTING.md) - How to contribute

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test MySQL connection
mysql -h localhost -u username -p -e "SELECT 1;"

# Check connection string format
# mysql://username:password@host:port/database
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Discord OAuth Not Working
1. Verify Client ID and Secret in .env
2. Check redirect URL matches Discord settings
3. Ensure bot has required permissions
4. Check firewall allows outbound connections

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting steps.

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💬 Support

For support, issues, or questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting guide
- Contact the development team

## 🎓 Learning Resources

- [Discord.js Documentation](https://discord.js.org/)
- [tRPC Documentation](https://trpc.io/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Drizzle ORM](https://orm.drizzle.team/)

## 🔄 Version History

### v1.0.0 (Current)
- Initial release
- Core bot management features
- Moderation system
- Economy system
- Leveling system
- Auto-moderation
- Welcome/leave messages
- Statistics dashboard

---

**Created:** April 2026  
**Last Updated:** April 2026  
**Maintainer:** ProBot Clone Team

For the latest updates and information, visit the [project repository](https://github.com/yourusername/probot-clone).
