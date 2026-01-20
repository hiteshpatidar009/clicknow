# Photography App Backend

A comprehensive, scalable Node.js backend server for a photographer booking mobile application.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js (ES Modules)
- **Database**: Firebase Firestore (Admin SDK)
- **Storage**: AWS S3
- **Authentication**: JWT + Firebase Auth
- **Notifications**: Firebase Cloud Messaging + WhatsApp Business API

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── app.config.js
│   │   ├── firebase.config.js
│   │   ├── aws.config.js
│   │   └── whatsapp.config.js
│   │
│   ├── database/         # Database connection
│   │   └── firebase.database.js
│   │
│   ├── repositories/     # Data access layer
│   │   ├── base.repository.js
│   │   ├── user.repository.js
│   │   ├── professional.repository.js
│   │   ├── booking.repository.js
│   │   ├── review.repository.js
│   │   ├── availability.repository.js
│   │   ├── chat.repository.js
│   │   ├── notification.repository.js
│   │   └── enquiry.repository.js
│   │
│   ├── models/           # Data models
│   │   ├── user.model.js
│   │   ├── professional.model.js
│   │   ├── booking.model.js
│   │   ├── review.model.js
│   │   ├── enquiry.model.js
│   │   └── notification.model.js
│   │
│   ├── services/         # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── professional.service.js
│   │   ├── booking.service.js
│   │   ├── review.service.js
│   │   ├── availability.service.js
│   │   ├── enquiry.service.js
│   │   ├── notification.service.js
│   │   ├── chat.service.js
│   │   ├── storage.service.js
│   │   └── search.service.js
│   │
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── professional.controller.js
│   │   ├── booking.controller.js
│   │   ├── review.controller.js
│   │   ├── availability.controller.js
│   │   ├── enquiry.controller.js
│   │   ├── chat.controller.js
│   │   ├── notification.controller.js
│   │   ├── search.controller.js
│   │   └── upload.controller.js
│   │
│   ├── routes/           # API routes
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── professional.routes.js
│   │   ├── booking.routes.js
│   │   ├── review.routes.js
│   │   ├── availability.routes.js
│   │   ├── enquiry.routes.js
│   │   ├── chat.routes.js
│   │   ├── notification.routes.js
│   │   ├── search.routes.js
│   │   ├── upload.routes.js
│   │   └── admin.routes.js
│   │
│   ├── middlewares/      # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── rateLimiter.middleware.js
│   │   ├── upload.middleware.js
│   │   └── logger.middleware.js
│   │
│   ├── validators/       # Request validation schemas
│   │   ├── auth.validator.js
│   │   ├── user.validator.js
│   │   ├── professional.validator.js
│   │   ├── booking.validator.js
│   │   ├── review.validator.js
│   │   ├── availability.validator.js
│   │   ├── enquiry.validator.js
│   │   ├── chat.validator.js
│   │   └── search.validator.js
│   │
│   ├── utils/            # Utility functions
│   │   ├── constants.util.js
│   │   ├── logger.util.js
│   │   ├── response.util.js
│   │   ├── errors.util.js
│   │   └── helpers.util.js
│   │
│   └── server.js         # Entry point
│
├── logs/                 # Log files
├── .env.example          # Environment variables template
├── package.json
└── README.md
```

## Installation

1. **Clone and navigate**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Add Firebase service account**
   - Download your Firebase service account key from Firebase Console
   - Save as `firebase-service-account.json` in the root directory

5. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/firebase` - Login with Firebase token
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/logout` - Logout

### Users

- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `PUT /api/v1/users/fcm-token` - Update FCM token

### Professionals

- `GET /api/v1/professionals` - Search professionals
- `GET /api/v1/professionals/featured` - Get featured professionals
- `GET /api/v1/professionals/:id` - Get professional profile
- `POST /api/v1/professionals` - Create professional profile
- `PUT /api/v1/professionals/me` - Update my profile
- `GET /api/v1/professionals/:id/availability/slots` - Get available slots

### Bookings

- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/client` - Get client's bookings
- `GET /api/v1/bookings/professional` - Get professional's bookings
- `PUT /api/v1/bookings/:id/confirm` - Confirm booking
- `PUT /api/v1/bookings/:id/cancel` - Cancel booking
- `PUT /api/v1/bookings/:id/reschedule` - Reschedule booking

### Reviews

- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/my` - Get my reviews
- `POST /api/v1/reviews/:id/response` - Add professional response

### Enquiries

- `POST /api/v1/enquiries` - Submit enquiry
- `GET /api/v1/enquiries/client` - Get my enquiries
- `PUT /api/v1/enquiries/:id/respond` - Respond to enquiry

### Chat

- `GET /api/v1/chats` - Get all chats
- `POST /api/v1/chats` - Create chat
- `GET /api/v1/chats/:id/messages` - Get messages
- `POST /api/v1/chats/:id/messages` - Send message

### Notifications

- `GET /api/v1/notifications` - Get notifications
- `PUT /api/v1/notifications/:id/read` - Mark as read
- `PUT /api/v1/notifications/read-all` - Mark all as read

### Search

- `GET /api/v1/search/professionals` - Search with filters
- `GET /api/v1/search/autocomplete` - Get suggestions

### Admin

- `GET /api/v1/admin/professionals/pending` - Pending approvals
- `PUT /api/v1/admin/professionals/:id/approve` - Approve professional
- `PUT /api/v1/admin/reviews/:id/approve` - Approve review

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
AWS_S3_BUCKET=your-bucket-name

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
```

## Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run lint    # Run ESLint
npm run test    # Run tests
```

## Features

- ✅ JWT Authentication with refresh tokens
- ✅ Firebase Auth integration
- ✅ Role-based access control (User, Professional, Admin)
- ✅ Professional profile with approval workflow
- ✅ Real-time availability management
- ✅ Booking system with conflict detection
- ✅ Review and rating system
- ✅ In-app chat/messaging
- ✅ Push notifications (FCM)
- ✅ WhatsApp notifications
- ✅ File uploads to AWS S3
- ✅ Search with filters and location
- ✅ Rate limiting
- ✅ Request validation
- ✅ Error handling
- ✅ Structured logging

## License

MIT
