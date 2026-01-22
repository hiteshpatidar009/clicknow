# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase project setup
- AWS S3 bucket (optional)
- Domain name configured

## Environment Variables

Create `.env` file:

```env
# Server
NODE_ENV=production
PORT=3000
API_VERSION=v1

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...

# AWS S3 (Optional)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name

# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# CORS
CORS_ORIGIN=https://yourapp.com

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100
```

## Installation

```bash
cd backend
npm install
```

## Database Setup

### Firestore Collections

Create these collections in Firebase Console:

- users
- professionals
- bookings
- reviews
- availability
- enquiries
- notifications
- chats
- messages
- posts
- comments
- follows

### Firestore Indexes

Create composite indexes:

```javascript
// posts collection
-professionalId(ASC) +
  isActive(ASC) +
  createdAt(DESC) -
  userId(ASC) +
  isActive(ASC) +
  createdAt(DESC) -
  category(ASC) +
  isActive(ASC) +
  createdAt(DESC) -
  // comments collection
  postId(ASC) +
  parentCommentId(ASC) +
  isDeleted(ASC) +
  createdAt(DESC) -
  // follows collection
  followerId(ASC) +
  createdAt(DESC) -
  followingId(ASC) +
  createdAt(DESC) -
  // bookings collection
  clientId(ASC) +
  status(ASC) +
  createdAt(DESC) -
  professionalId(ASC) +
  status(ASC) +
  createdAt(DESC) -
  professionalId(ASC) +
  bookingDate(ASC) -
  // reviews collection
  professionalId(ASC) +
  status(ASC) +
  createdAt(DESC) -
  clientId(ASC) +
  createdAt(DESC) -
  // notifications collection
  userId(ASC) +
  isRead(ASC) +
  createdAt(DESC) -
  // enquiries collection
  clientId(ASC) +
  createdAt(DESC) -
  professionalId(ASC) +
  status(ASC) +
  createdAt(DESC);
```

## Build & Start

```bash
# Development
npm run dev

# Production
npm start
```

## Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]
```

Create `docker-compose.yml`:

```yaml
version: "3.8"

services:
  api:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs
```

Build and run:

```bash
docker-compose up -d
```

## Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourapp.com;

    location / {
        proxy_pass http://localhost:3000;
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

## SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d api.yourapp.com
```

## Monitoring

### PM2 Process Manager

```bash
npm install -g pm2

# Start
pm2 start src/server.js --name photography-api

# Monitor
pm2 monit

# Logs
pm2 logs photography-api

# Restart
pm2 restart photography-api

# Auto-start on reboot
pm2 startup
pm2 save
```

### Health Check Endpoint

```bash
curl https://api.yourapp.com/api/v1/health
```

## Security Checklist

- [ ] Change all default secrets
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable Firebase security rules
- [ ] Implement API key authentication for admin
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy
- [ ] Enable DDoS protection
- [ ] Set up error tracking (Sentry)

## Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Posts collection
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Follows collection
    match /follows/{followId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.followerId;
      allow delete: if request.auth.uid == resource.data.followerId;
    }
  }
}
```

## Performance Optimization

1. **Enable Caching**
   - Redis for session storage
   - CDN for static assets
   - Database query caching

2. **Database Optimization**
   - Create proper indexes
   - Use pagination
   - Implement data archiving

3. **API Optimization**
   - Compress responses (gzip)
   - Implement API versioning
   - Use connection pooling

## Backup Strategy

```bash
# Firestore backup (daily cron)
0 2 * * * gcloud firestore export gs://your-backup-bucket/$(date +\%Y-\%m-\%d)
```

## Monitoring & Alerts

Set up alerts for:

- API response time > 2s
- Error rate > 5%
- CPU usage > 80%
- Memory usage > 80%
- Disk space < 20%

## Testing

```bash
# Run tests
npm test

# Load testing
npm run test:load
```

## Rollback Plan

```bash
# Revert to previous version
pm2 stop photography-api
git checkout <previous-commit>
npm install
pm2 start photography-api
```

## Support

For issues, contact: support@yourapp.com
