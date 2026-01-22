# Photography Booking Platform - Hybrid Social Architecture

## Overview

A hybrid Instagram/LinkedIn platform for professional photographers and other creative professionals (musicians, magicians, etc.) to showcase work, connect with clients, and manage bookings.

## Core Features

### 1. Social Feed System (LinkedIn-style)

**Purpose**: Content discovery and engagement

**Features**:

- Infinite scroll feed with posts from professionals
- Like, comment, share functionality
- View count tracking
- Post filtering (following/all)
- Rich media support (images/videos)
- Hashtag and location tagging

**User Flow**:

```
User opens app → Feed screen → Scroll posts → Like/Comment →
Click on post → View photographer profile → Follow/Message/Hire
```

**API Endpoints**:

- `GET /api/v1/feed` - Get feed (all or following)
- `POST /api/v1/feed/posts` - Create post
- `GET /api/v1/feed/posts/:id` - Get single post
- `POST /api/v1/feed/posts/:id/like` - Like/unlike post
- `POST /api/v1/feed/posts/:id/comments` - Add comment
- `GET /api/v1/feed/posts/:id/comments` - Get comments
- `DELETE /api/v1/feed/posts/:id` - Delete post

### 2. Profile Discovery (Instagram-style)

**Purpose**: Professional showcase and client acquisition

**Features**:

- Click any post → Navigate to photographer profile
- Portfolio gallery (grid view)
- Bio, experience, specialties
- Follower/following counts
- Follow/unfollow functionality
- Featured professionals (admin-controlled)
- Category-based browsing

**Profile Sections**:

- Header: Avatar, name, category, follow button
- Stats: Posts, followers, following
- Bio: Description, location, pricing
- Portfolio: Grid of media posts
- Reviews: Client testimonials
- Availability: Calendar view

**API Endpoints**:

- `GET /api/v1/professionals/:id` - Get profile
- `GET /api/v1/professionals/:id/posts` - Get user posts
- `POST /api/v1/social/follow` - Follow user
- `POST /api/v1/social/unfollow` - Unfollow user
- `GET /api/v1/social/followers/:userId` - Get followers
- `GET /api/v1/social/following/:userId` - Get following
- `GET /api/v1/social/stats/:userId` - Get connection stats

### 3. Messaging System (Instagram DM-style)

**Purpose**: Direct communication between clients and professionals

**Features**:

- Real-time chat
- Media sharing (images/videos)
- Message read receipts
- Typing indicators
- Chat list with unread counts
- Message search
- Archive chats

**API Endpoints**:

- `GET /api/v1/chats` - Get chat list
- `GET /api/v1/chats/:id` - Get chat details
- `POST /api/v1/chats` - Create/get chat
- `GET /api/v1/chats/:id/messages` - Get messages
- `POST /api/v1/chats/:id/messages` - Send message
- `PUT /api/v1/chats/:id/read` - Mark as read
- `DELETE /api/v1/chats/:chatId/messages/:messageId` - Delete message

### 4. Hiring System (LinkedIn-style)

**Purpose**: Professional booking and job matching

**Features**:

- Enquiry form before profile access (gated content)
- Direct hire from profile
- Job matching notifications
- Booking management
- Calendar integration
- Automated reminders

**Enquiry Flow**:

```
Client sees post → Interested → Fill enquiry form →
Admin approval → Profile access granted →
Client views full profile → Message/Hire
```

**API Endpoints**:

- `POST /api/v1/enquiries` - Submit enquiry
- `GET /api/v1/enquiries/client` - Get client enquiries
- `GET /api/v1/enquiries/professional` - Get professional enquiries
- `PUT /api/v1/enquiries/:id/respond` - Respond to enquiry
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings` - Get bookings

## Database Schema

### Collections

#### posts

```javascript
{
  id: string,
  professionalId: string,
  userId: string,
  caption: string,
  media: [{ type: 'image|video', url: string, thumbnail: string }],
  category: string,
  tags: [string],
  location: { city: string, coordinates: GeoPoint },
  likes: [userId],
  likesCount: number,
  commentsCount: number,
  sharesCount: number,
  viewsCount: number,
  isActive: boolean,
  isPinned: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### comments

```javascript
{
  id: string,
  postId: string,
  userId: string,
  text: string,
  parentCommentId: string | null,
  likes: [userId],
  likesCount: number,
  repliesCount: number,
  isDeleted: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### follows

```javascript
{
  id: string,
  followerId: string,
  followingId: string,
  createdAt: timestamp
}
```

#### enquiries (Updated)

```javascript
{
  id: string,
  clientId: string,
  professionalId: string,
  eventType: string,
  eventDate: date,
  location: string,
  budget: number,
  message: string,
  status: 'pending|responded|converted|closed',
  adminApproved: boolean,
  profileAccessGranted: boolean,
  respondedAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Notification System

### Notification Types

1. **Social Notifications**
   - New follower
   - Post like
   - Post comment
   - Comment reply

2. **Booking Notifications**
   - New booking request
   - Booking confirmed
   - Booking cancelled
   - Booking reminder (24h before)

3. **Job Matching Notifications**
   - New enquiry matching profile
   - Profile viewed by client
   - Enquiry approved by admin

4. **Marketing Notifications**
   - Featured professional promotion
   - Platform updates
   - Special offers

### Notification Channels

- **Push Notifications**: Firebase Cloud Messaging
- **WhatsApp**: Business API integration
- **Email**: Optional (Phase 2)

## User Flows

### Client Journey

```
1. Open app → See feed
2. Scroll posts → Like/comment
3. Click post → View photographer profile
4. Interested → Fill enquiry form
5. Wait for admin approval
6. Profile access granted → View full portfolio
7. Message photographer → Discuss requirements
8. Hire → Book session
9. Complete session → Leave review
```

### Professional Journey

```
1. Register → Admin approval
2. Setup profile → Add bio, portfolio
3. Create posts → Share work
4. Receive enquiries → Respond
5. Get booking requests → Accept/decline
6. Manage calendar → Set availability
7. Complete sessions → Get reviews
8. Build following → Increase visibility
```

### Admin Journey

```
1. Review professional registrations → Approve/reject
2. Monitor enquiries → Grant profile access
3. Moderate content → Posts, comments, reviews
4. Manage featured professionals
5. View analytics → Platform metrics
6. Handle disputes → Chat visibility
```

## Technical Implementation

### Feed Algorithm

```javascript
// Priority scoring for feed posts
score =
  recency_weight * time_score +
  engagement_weight * (likes + comments * 2) +
  relevance_weight * category_match +
  connection_weight * is_following;
```

### Search & Discovery

- **Elasticsearch** for full-text search
- **Geolocation** for proximity-based results
- **Category filters** for professional types
- **Availability filters** for booking dates

### Real-time Features

- **WebSocket** for chat messaging
- **Firebase Realtime Database** for typing indicators
- **Push notifications** for instant alerts

### Performance Optimization

- **Image CDN** for fast media loading
- **Lazy loading** for infinite scroll
- **Caching** for frequently accessed data
- **Pagination** for large datasets

## Security Considerations

1. **Profile Access Control**
   - Enquiry-based gating
   - Admin approval required
   - Rate limiting on enquiries

2. **Content Moderation**
   - Automated profanity filter
   - Report/flag system
   - Admin review queue

3. **Data Privacy**
   - GDPR compliance
   - User data encryption
   - Secure file storage

## Mobile App Screens

### Main Navigation

1. **Feed** - Home screen with posts
2. **Search** - Discover professionals
3. **Messages** - Chat inbox
4. **Bookings** - Manage bookings
5. **Profile** - User/professional profile

### Key Screens

- Feed screen (infinite scroll)
- Post detail screen
- Profile screen (portfolio grid)
- Chat screen (messaging)
- Booking screen (calendar)
- Enquiry form screen
- Search/filter screen

## API Response Examples

### Feed Response

```json
{
  "success": true,
  "data": [
    {
      "id": "post123",
      "user": {
        "id": "user456",
        "displayName": "John Photographer",
        "avatar": "url"
      },
      "professional": {
        "id": "prof789",
        "businessName": "John's Photography",
        "category": "photographer"
      },
      "caption": "Beautiful sunset shoot",
      "media": [{ "type": "image", "url": "url" }],
      "likesCount": 150,
      "commentsCount": 23,
      "isLiked": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

## Future Enhancements

1. **Stories** (Instagram-style 24h content)
2. **Live streaming** for events
3. **Payment integration** for bookings
4. **AI-powered recommendations**
5. **Video calls** for consultations
6. **Portfolio templates** for professionals
7. **Analytics dashboard** for professionals
8. **Referral program** for growth
