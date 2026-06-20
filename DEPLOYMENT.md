# Deployment Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Platforms](#deployment-platforms)
5. [Vercel Deployment](#vercel-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Manual Deployment](#manual-deployment)
8. [Database Migration](#database-migration)
9. [Post-Deployment Checklist](#post-deployment-checklist)
10. [Monitoring and Maintenance](#monitoring-and-maintenance)
11. [Rollback Procedures](#rollback-procedures)
12. [Troubleshooting](#troubleshooting)

## Overview

This document provides comprehensive deployment procedures for the Freedom City Tech Center Management System. The application can be deployed to various platforms including Vercel, Docker containers, or traditional VPS hosting.

### Deployment Architecture
- **Frontend**: Next.js 16 with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (recommended) or self-hosted MongoDB
- **Authentication**: JWT with HTTP-only cookies
- **CDN**: Vercel Edge Network (if using Vercel)

## Prerequisites

### Required Accounts
- MongoDB Atlas account (for database)
- Vercel account (if deploying to Vercel)
- GitHub account (for version control)
- Domain name (optional, for custom domain)

### Required Tools
- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Docker (if using Docker deployment)
- SSL certificate (for custom domain)

## Environment Configuration

### Production Environment Variables
Create production environment variables in your deployment platform:

```env
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/freedom-tech?retryWrites=true&w=majority

# JWT Secret (MUST be strong and random)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-random-and-unique

# API URL
NEXT_PUBLIC_API_URL=https://your-domain.com

# Node Environment
NODE_ENV=production
```

### Environment Variable Security
- **Never commit** `.env` files to version control
- Use strong, randomly generated secrets
- Rotate secrets regularly
- Use different secrets for different environments
- Limit access to environment variables

### Generating Strong Secrets
```bash
# Generate JWT secret (32+ characters)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Deployment Platforms

### Platform Comparison

| Platform | Ease of Use | Cost | Performance | Features |
|----------|-------------|------|-------------|----------|
| Vercel | ⭐⭐⭐⭐⭐ | Free tier available | Excellent | Auto-scaling, CDN, previews |
| Docker | ⭐⭐⭐ | Varies | Excellent | Portability, consistency |
| VPS | ⭐⭐ | Low cost | Good | Full control, flexibility |

### Recommended Platform
**Vercel** is recommended for this Next.js application due to:
- Native Next.js support
- Automatic HTTPS
- Global CDN
- Zero-config deployment
- Preview deployments
- Built-in analytics

## Vercel Deployment

### Step 1: Prepare Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "feat: ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in
3. Click "Add New Project"
4. Import your GitHub repository

### Step 3: Configure Project
```json
{
  "name": "freedom-tech-management",
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NODE_ENV": "production"
  }
}
```

### Step 4: Set Environment Variables
In Vercel project settings:
1. Go to Settings → Environment Variables
2. Add each variable from the Environment Configuration section
3. Select appropriate environments (Production, Preview, Development)

### Step 5: Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy
3. Wait for deployment to complete
4. Access your application at the provided URL

### Step 6: Configure Custom Domain (Optional)
1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Vercel will automatically provision SSL certificate

### Vercel-Specific Configuration

#### vercel.json
```json
{
  "buildCommand": "prisma generate && next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

#### Post-Build Script
Add to `package.json`:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

## Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Step 2: Create .dockerignore
```
node_modules
.next
.git
.env
.env.local
.env.production
```

### Step 3: Build Docker Image
```bash
docker build -t freedom-tech-management .
```

### Step 4: Run Docker Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="mongodb+srv://..." \
  -e JWT_SECRET="your-secret" \
  -e NEXT_PUBLIC_API_URL="https://your-domain.com" \
  -e NODE_ENV="production" \
  freedom-tech-management
```

### Step 5: Docker Compose (Optional)
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Manual Deployment

### Step 1: Build Application
```bash
npm install
npm run build
```

### Step 2: Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2
```

### Step 3: Deploy Files
```bash
# Copy files to server
scp -r . user@server:/var/www/freedom-tech

# SSH into server
ssh user@server

# Navigate to project directory
cd /var/www/freedom-tech

# Install dependencies
npm install --production

# Generate Prisma client
npx prisma generate
```

### Step 4: Set Environment Variables
```bash
# Create .env file
nano .env

# Add environment variables
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
```

### Step 5: Start Application with PM2
```bash
# Start application
pm2 start npm --name "freedom-tech" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 6: Configure Nginx (Optional)
```nginx
# /etc/nginx/sites-available/freedom-tech
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/freedom-tech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Database Migration

### Prisma Migration Deployment
```bash
# Generate Prisma client
npx prisma generate

# Deploy migrations to production
npx prisma migrate deploy
```

### Database Backup Before Migration
```bash
# Using MongoDB Atlas
# Automatic backups are enabled by default

# Manual backup via mongodump
mongodump --uri="mongodb+srv://..." --out=./backup
```

### Migration Rollback
```bash
# Prisma doesn't support automatic rollback
# Manually revert migration file
npx prisma migrate resolve --rolled-back <migration-name>
```

## Post-Deployment Checklist

### Functionality Testing
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads correctly
- [ ] Role-based access control works
- [ ] API endpoints respond correctly
- [ ] Database queries work
- [ ] File uploads work (if applicable)
- [ ] Email notifications work (if configured)

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] Caching working correctly

### Security Testing
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables set correctly
- [ ] JWT secret is strong
- [ ] Rate limiting working
- [ ] Input validation working
- [ ] SQL injection prevention working

### Monitoring Setup
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (Vercel Analytics, etc.)
- [ ] Uptime monitoring configured
- [ ] Log aggregation configured
- [ ] Performance monitoring configured

### Backup Verification
- [ ] Database backups working
- [ ] Backup retention policy set
- [ ] Backup restoration tested
- [ ] Disaster recovery plan documented

## Monitoring and Maintenance

### Application Monitoring

#### Vercel Analytics (if using Vercel)
- Automatic page views tracking
- Web Vitals monitoring
- Real-time user analytics
- Performance insights

#### Custom Monitoring
```typescript
// Add error tracking
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Log Management
```typescript
// Structured logging
console.log({
  level: 'info',
  message: 'User logged in',
  userId: user.id,
  timestamp: new Date().toISOString(),
});
```

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor memory usage
- Track error rates
- Monitor uptime

### Regular Maintenance Tasks

#### Weekly
- [ ] Check error logs
- [ ] Review performance metrics
- [ ] Verify backups
- [ ] Check security updates

#### Monthly
- [ ] Update dependencies
- [ ] Review and rotate secrets
- [ ] Audit user access
- [ ] Review costs

#### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Disaster recovery test
- [ ] Capacity planning

## Rollback Procedures

### Vercel Rollback
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find previous successful deployment
4. Click "Rollback"
5. Confirm rollback

### Docker Rollback
```bash
# Stop current container
docker stop freedom-tech

# Remove current container
docker rm freedom-tech

# Run previous image
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  freedom-tech-management:previous-tag
```

### Manual Rollback
```bash
# Stop current PM2 process
pm2 stop freedom-tech

# Checkout previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
npm install
npm run build
pm2 restart freedom-tech
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." --dir=./backup

# Or revert specific migration
npx prisma migrate resolve --rolled-back <migration-name>
```

## Troubleshooting

### Build Failures

#### Next.js Build Error
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

#### Prisma Generation Error
```bash
# Regenerate Prisma client
npx prisma generate

# Check schema validity
npx prisma validate
```

### Runtime Errors

#### Database Connection Error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
npx prisma db push

# Check MongoDB Atlas status
# Verify IP whitelist
# Verify credentials
```

#### JWT Verification Error
```bash
# Check JWT_SECRET
echo $JWT_SECRET

# Verify secret is set correctly
# Regenerate secret if needed
# Clear browser cookies
```

### Performance Issues

#### Slow Page Load
```bash
# Check bundle size
npm run build

# Analyze with webpack-bundle-analyzer
# Optimize images
# Implement code splitting
# Add caching
```

#### Slow API Response
```bash
# Check database indexes
npx prisma studio

# Optimize queries
# Add caching
# Implement pagination
# Use connection pooling
```

### Deployment Issues

#### Vercel Deployment Failed
```bash
# Check build logs
# Verify environment variables
# Check for build errors locally
# Verify dependencies
# Check for file size limits
```

#### Docker Deployment Failed
```bash
# Check Docker logs
docker logs freedom-tech

# Verify environment variables
# Check port conflicts
# Verify network connectivity
# Check resource limits
```

## CI/CD Pipeline

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma Client
      run: npx prisma generate
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

## Security Considerations

### Production Security Checklist
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] JWT secret is strong and random
- [ ] Environment variables not exposed
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention working
- [ ] XSS prevention working
- [ ] CSRF protection working
- [ ] Regular security updates
- [ ] Security monitoring enabled

### Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
    ];
  },
};
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Deploy multiple instances
- Use session storage (Redis)
- Use CDN for static assets
- Implement database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Use connection pooling
- Optimize application code

### Database Scaling
- Use MongoDB Atlas scaling
- Implement sharding
- Use read replicas
- Optimize indexes
- Implement caching layer

## Cost Optimization

### Vercel Cost Optimization
- Use appropriate plan
- Optimize bundle size
- Implement caching
- Use image optimization
- Monitor usage

### Database Cost Optimization
- Use appropriate Atlas tier
- Optimize queries
- Implement indexing
- Use connection pooling
- Monitor storage usage

### General Cost Optimization
- Monitor resource usage
- Right-size instances
- Use reserved instances
- Implement auto-scaling
- Regular cost reviews

## Support and Maintenance

### Contact Information
- **Development Team**: [Contact Information]
- **DevOps Team**: [Contact Information]
- **Database Admin**: [Contact Information]
- **System Admin**: [Contact Information]

### Emergency Procedures
1. Identify issue severity
2. Notify appropriate team
3. Implement temporary fix
4. Document incident
5. Implement permanent fix
6. Update documentation

### Documentation Updates
- Update deployment procedures after changes
- Document new features
- Update troubleshooting guide
- Maintain runbooks
- Regular documentation reviews

---

For additional information, refer to:
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md)
- [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)
