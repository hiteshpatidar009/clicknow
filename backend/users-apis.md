# Users APIs

Base URL: `http://localhost:5000/api/v1`

### 1. Send OTP (Login)
----------------------------------------
API NAME: Send OTP
ENDPOINT: `http://localhost:5000/api/v1/auth/send-otp`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "phone": "+919999999992",
  "role": "client"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "OTP sent",
  "data": { "phone": "+919999999992" },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Customer initiates login with phone number.

### 2. Verify OTP
----------------------------------------
API NAME: Verify OTP
ENDPOINT: `http://localhost:5000/api/v1/auth/verify-otp`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "phone": "+919999999992",
  "otp": "123456",
  "role": "client"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "_id": "...", "role": "client" }, "token": "..." },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Completes login and returns JWT token.

### 3. Register (Email/Password)
----------------------------------------
API NAME: Register
ENDPOINT: `http://localhost:5000/api/v1/auth/register`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "firstName": "Aman",
  "lastName": "Sharma",
  "phone": "+919999999992",
  "role": "client"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { "user": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Create a customer account with email/password.

### 4. Login (Email/Password)
----------------------------------------
API NAME: Login
ENDPOINT: `http://localhost:5000/api/v1/auth/login`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "_id": "..." }, "token": "..." },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Login and receive JWT token.

### 5. Refresh Token
----------------------------------------
API NAME: Refresh Token
ENDPOINT: `http://localhost:5000/api/v1/auth/refresh`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "refreshToken": "..."
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "token": "..." },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Refresh access token using refresh token.

### 6. Get Me
----------------------------------------
API NAME: Get Me
ENDPOINT: `http://localhost:5000/api/v1/auth/me`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "user": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get logged-in user details from token.

### 7. Change Password
----------------------------------------
API NAME: Change Password
ENDPOINT: `http://localhost:5000/api/v1/auth/change-password`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example):
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "changed": true },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Change password for logged-in user.

### 8. Logout
----------------------------------------
API NAME: Logout
ENDPOINT: `http://localhost:5000/api/v1/auth/logout`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "logout": true },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Logout the current session.

### 9. Get Profile
----------------------------------------
API NAME: Get Profile
ENDPOINT: `http://localhost:5000/api/v1/users/profile`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "user": {
      "_id": "...",
      "firstName": "...",
      "lastName": "...",
      "phone": "+919999999992"
    }
  },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Fetch the logged-in user profile.

### 10. Update Profile
----------------------------------------
API NAME: Update Profile
ENDPOINT: `http://localhost:5000/api/v1/users/profile`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example):
```json
{
  "firstName": "Aman",
  "lastName": "Sharma",
  "displayName": "Aman S.",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "+919999999992",
  "settings": {
    "language": "en",
    "currency": "INR",
    "notifications": {
      "push": true,
      "email": true,
      "whatsapp": false
    }
  }
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "user": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Update profile details for the logged-in user.

### 11. Update Notification Settings
----------------------------------------
API NAME: Update Notification Settings
ENDPOINT: `http://localhost:5000/api/v1/users/notifications/settings`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example):
```json
{
  "push": true,
  "email": true,
  "whatsapp": false,
  "bookingUpdates": true,
  "promotions": false,
  "reminders": true
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "settings": { "push": true } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Update notification preferences for the logged-in user.

### 12. Update FCM Token
----------------------------------------
API NAME: Update FCM Token
ENDPOINT: `http://localhost:5000/api/v1/users/fcm-token`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example):
```json
{
  "fcmToken": "fcm-token-string"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "fcmToken": "fcm-token-string" },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Register or update FCM token for push notifications.

### 13. List Users (Admin Only)
----------------------------------------
API NAME: List Users
ENDPOINT: `http://localhost:5000/api/v1/users`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": {
    "items": [
      { "_id": "...", "role": "user", "isActive": true }
    ]
  },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches users with optional query filters (role, isActive, page, pageSize, search).

### 14. User Statistics (Admin Only)
----------------------------------------
API NAME: User Statistics
ENDPOINT: `http://localhost:5000/api/v1/users/statistics`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalUsers": 100, "activeUsers": 85 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches overall user statistics.

### 15. Get User By ID (Admin Only)
----------------------------------------
API NAME: Get User By ID
ENDPOINT: `http://localhost:5000/api/v1/users/:id`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "user": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches a specific user by ID.

### 16. Activate User (Admin Only)
----------------------------------------
API NAME: Activate User
ENDPOINT: `http://localhost:5000/api/v1/users/:id/activate`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "user": { "_id": "...", "isActive": true } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin activates a user account.

### 17. Deactivate User (Admin Only)
----------------------------------------
API NAME: Deactivate User
ENDPOINT: `http://localhost:5000/api/v1/users/:id/deactivate`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "user": { "_id": "...", "isActive": false } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin deactivates a user account.

### 18. Delete User (Admin Only)
----------------------------------------
API NAME: Delete User
ENDPOINT: `http://localhost:5000/api/v1/users/:id`
METHOD: DELETE
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "deleted": true, "id": "..." },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin deletes a user account.
