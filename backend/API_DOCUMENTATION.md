# API Documentation - Social Features

## Base URL

```
https://api.yourapp.com/api/v1
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

---

## Feed Endpoints

### Get Feed

Get posts for user's feed (all or following only)

**Endpoint**: `GET /feed`

**Query Parameters**:

- `feedType` (optional): `all` | `following` (default: `all`)
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Items per page (default: 20)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "post123",
      "user": {
        "id": "user456",
        "displayName": "John Doe",
        "avatar": "https://..."
      },
      "professional": {
        "id": "prof789",
        "businessName": "John's Photography",
        "category": "photographer"
      },
      "caption": "Beautiful sunset shoot",
      "media": [
        {
          "type": "image",
          "url": "https://...",
          "thumbnail": "https://..."
        }
      ],
      "category": "photographer",
      "tags": ["sunset", "portrait"],
      "location": {
        "city": "Mumbai",
        "coordinates": { "lat": 19.076, "lng": 72.8777 }
      },
      "likesCount": 150,
      "commentsCount": 23,
      "viewsCount": 1200,
      "isLiked": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 500,
    "totalPages": 25,
    "hasMore": true
  }
}
```

---

### Create Post

Create a new post

**Endpoint**: `POST /feed/posts`

**Request Body**:

```json
{
  "caption": "Check out this amazing shoot!",
  "media": [
    {
      "type": "image",
      "url": "https://...",
      "thumbnail": "https://..."
    }
  ],
  "category": "photographer",
  "tags": ["wedding", "outdoor"],
  "location": {
    "city": "Mumbai",
    "coordinates": { "lat": 19.076, "lng": 72.8777 }
  }
}
```

**Response**:

```json
{
  "success": true,
  "message": "Post created",
  "data": {
    "id": "post123",
    "userId": "user456",
    "caption": "Check out this amazing shoot!",
    "media": [...],
    "likesCount": 0,
    "commentsCount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Single Post

Get post details with engagement data

**Endpoint**: `GET /feed/posts/:id`

**Response**: Same as feed item with full details

---

### Like/Unlike Post

Toggle like on a post

**Endpoint**: `POST /feed/posts/:id/like`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "post123",
    "likesCount": 151,
    "isLiked": true
  }
}
```

---

### Add Comment

Add comment to a post

**Endpoint**: `POST /feed/posts/:id/comments`

**Request Body**:

```json
{
  "text": "Amazing work!"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Comment added",
  "data": {
    "id": "comment123",
    "postId": "post123",
    "user": {
      "id": "user456",
      "displayName": "Jane Doe",
      "avatar": "https://..."
    },
    "text": "Amazing work!",
    "likesCount": 0,
    "repliesCount": 0,
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

---

### Get Comments

Get comments for a post

**Endpoint**: `GET /feed/posts/:id/comments`

**Query Parameters**:

- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response**: Paginated list of comments

---

### Delete Post

Delete own post

**Endpoint**: `DELETE /feed/posts/:id`

**Response**:

```json
{
  "success": true,
  "message": "Post deleted"
}
```

---

## Social Endpoints

### Follow User

Follow a user/professional

**Endpoint**: `POST /social/follow`

**Request Body**:

```json
{
  "userId": "user789"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Followed successfully",
  "data": {
    "id": "follow123",
    "followerId": "user456",
    "followingId": "user789",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### Unfollow User

Unfollow a user/professional

**Endpoint**: `POST /social/unfollow`

**Request Body**:

```json
{
  "userId": "user789"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Unfollowed successfully"
}
```

---

### Get Followers

Get list of followers

**Endpoint**: `GET /social/followers/:userId?`

**Query Parameters**:

- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "follow123",
      "user": {
        "id": "user456",
        "displayName": "Jane Doe",
        "avatar": "https://..."
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

---

### Get Following

Get list of users being followed

**Endpoint**: `GET /social/following/:userId?`

**Response**: Same structure as followers

---

### Get Connection Stats

Get follower/following counts

**Endpoint**: `GET /social/stats/:userId?`

**Response**:

```json
{
  "success": true,
  "data": {
    "followersCount": 1250,
    "followingCount": 340
  }
}
```

---

### Check Following Status

Check if current user follows another user

**Endpoint**: `GET /social/check/:userId`

**Response**:

```json
{
  "success": true,
  "data": {
    "isFollowing": true
  }
}
```

---

## Updated Professional Profile Endpoint

### Get Professional Profile

Get full professional profile with social stats

**Endpoint**: `GET /professionals/:id`

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "prof123",
    "userId": "user456",
    "businessName": "John's Photography",
    "category": "photographer",
    "bio": "Professional photographer...",
    "portfolio": [...],
    "stats": {
      "averageRating": 4.8,
      "totalReviews": 150,
      "totalBookings": 200,
      "profileViews": 5000,
      "followersCount": 1250,
      "followingCount": 340,
      "postsCount": 85
    },
    "pricing": {...},
    "location": {...},
    "isFollowing": false,
    "canMessage": true,
    "canBook": true
  }
}
```

---

## Enquiry Flow (Updated)

### Submit Enquiry

Submit enquiry to view full profile

**Endpoint**: `POST /enquiries`

**Request Body**:

```json
{
  "professionalId": "prof123",
  "eventType": "wedding",
  "eventDate": "2024-06-15",
  "location": "Mumbai",
  "budget": 50000,
  "message": "Looking for wedding photographer"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Enquiry submitted",
  "data": {
    "id": "enq123",
    "status": "pending",
    "adminApproved": false,
    "profileAccessGranted": false,
    "message": "Your enquiry is under review"
  }
}
```

---

## Notification Types

### Push Notification Payload

```json
{
  "notification": {
    "title": "New Follower",
    "body": "John Doe started following you"
  },
  "data": {
    "type": "new_follower",
    "followerId": "user456",
    "action": "new_follower",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Notification Types

- `post_like` - Someone liked your post
- `post_comment` - Someone commented on your post
- `new_follower` - New follower
- `booking_request` - New booking request
- `booking_confirmed` - Booking confirmed
- `job_match` - New job matching your profile
- `enquiry_approved` - Enquiry approved by admin
- `marketing` - Marketing/promotional content

---

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "caption",
      "message": "Caption is required"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access token required",
  "errorCode": "AUTH_UNAUTHORIZED"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Post not found",
  "errorCode": "NOT_FOUND"
}
```

---

## Rate Limits

- Feed endpoints: 60 requests/minute
- Post creation: 10 posts/hour
- Follow/unfollow: 30 requests/minute
- Comments: 20 requests/minute
