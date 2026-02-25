# Professional APIs

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
  "role": "professional"
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
PURPOSE: Professional initiates login with phone number.

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
  "role": "professional"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "_id": "...", "role": "professional" }, "token": "..." },
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
  "email": "pro@example.com",
  "password": "StrongPass123",
  "firstName": "Aman",
  "lastName": "Sharma",
  "phone": "+919999999992",
  "role": "professional"
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
PURPOSE: Create a professional user account.

### 4. Login (Email/Password)
----------------------------------------
API NAME: Login
ENDPOINT: `http://localhost:5000/api/v1/auth/login`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "email": "pro@example.com",
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
PURPOSE: Change password for logged-in professional.

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

### 9. Create Professional Profile
----------------------------------------
API NAME: Create Professional Profile
ENDPOINT: `http://localhost:5000/api/v1/professionals`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <token>`
BODY (JSON example):
```json
{
  "category": "wedding_photography",
  "businessName": "Lens Studio",
  "bio": "We capture weddings beautifully.",
  "experience": 5,
  "pricing": { "hourlyRate": 2000, "currency": "INR" },
  "location": { "city": "Mumbai", "state": "MH", "country": "India" },
  "documents": {
    "aadharFront": "https://example.com/aadhar-front.jpg",
    "aadharBack": "https://example.com/aadhar-back.jpg",
    "panCard": "https://example.com/pan.jpg",
    "policeVerificationCertificate": "https://example.com/pvc.jpg"
  }
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { "professional": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Create a professional profile for a logged-in user.

### 10. Get My Profile (Professional)
----------------------------------------
API NAME: Get My Profile
ENDPOINT: `http://localhost:5000/api/v1/professionals/me/profile`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <professional-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "professional": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get the logged-in professional profile.

### 11. Update My Profile (Professional)
----------------------------------------
API NAME: Update My Profile
ENDPOINT: `http://localhost:5000/api/v1/professionals/me`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <professional-token>`
BODY (JSON example):
```json
{
  "bio": "Updated bio",
  "pricing": { "hourlyRate": 2500 },
  "settings": { "instantBooking": true }
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "professional": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Update the logged-in professional profile.

### 12. Toggle Active Status (Professional)
----------------------------------------
API NAME: Toggle Active
ENDPOINT: `http://localhost:5000/api/v1/professionals/me/active`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <professional-token>`
BODY (JSON example):
```json
{
  "isActive": true
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "isActive": true },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Turn professional visibility on/off.

### 13. Add Portfolio Item (Professional)
----------------------------------------
API NAME: Add Portfolio Item
ENDPOINT: `http://localhost:5000/api/v1/professionals/me/portfolio`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <professional-token>`
BODY (JSON example):
```json
{
  "id": "portfolio-item-id",
  "type": "image",
  "url": "https://example.com/photo.jpg",
  "thumbnailUrl": "https://example.com/photo-thumb.jpg",
  "title": "Engagement Shoot",
  "description": "Golden hour portraits",
  "category": "wedding"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "item": { "id": "portfolio-item-id" } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Add a portfolio item to the logged-in professional.

### 14. Remove Portfolio Item (Professional)
----------------------------------------
API NAME: Remove Portfolio Item
ENDPOINT: `http://localhost:5000/api/v1/professionals/me/portfolio/:itemId`
METHOD: DELETE
AUTH HEADER: `Authorization: Bearer <professional-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "deleted": true, "itemId": "..." },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Remove a portfolio item from the logged-in professional.

### 15. List Professionals
----------------------------------------
API NAME: List Professionals
ENDPOINT: `http://localhost:5000/api/v1/professionals`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "businessName": "..." } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Public search and listing of professionals with optional query filters.

### 16. Get Featured Professionals
----------------------------------------
API NAME: Get Featured Professionals
ENDPOINT: `http://localhost:5000/api/v1/professionals/featured`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "isFeatured": true } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Fetch featured professionals for home page.

### 17. Get Top Rated Professionals
----------------------------------------
API NAME: Get Top Rated Professionals
ENDPOINT: `http://localhost:5000/api/v1/professionals/top-rated`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "rating": 4.9 } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Fetch top rated professionals.

### 18. Get Professionals By Category
----------------------------------------
API NAME: Get Professionals By Category
ENDPOINT: `http://localhost:5000/api/v1/professionals/category/:category`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "category": "..." } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Fetch professionals for a given category.

### 19. Get Portfolio Gallery
----------------------------------------
API NAME: Get Portfolio Gallery
ENDPOINT: `http://localhost:5000/api/v1/professionals/:id/gallery`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "id": "...", "url": "..." } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get portfolio gallery for a professional (supports query: category, page, pageSize).

### 20. Get Professional By ID
----------------------------------------
API NAME: Get Professional By ID
ENDPOINT: `http://localhost:5000/api/v1/professionals/:id`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "professional": { "_id": "..." } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Fetch a professional profile by ID.

### 21. Get Availability
----------------------------------------
API NAME: Get Availability
ENDPOINT: `http://localhost:5000/api/v1/professionals/:id/availability`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "availability": [] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get availability schedule for a professional.

### 22. Get Available Slots
----------------------------------------
API NAME: Get Available Slots
ENDPOINT: `http://localhost:5000/api/v1/professionals/:id/availability/slots`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "slots": ["10:00", "11:00"] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get available slots (requires query: date, duration).

### 23. Get Reviews
----------------------------------------
API NAME: Get Reviews
ENDPOINT: `http://localhost:5000/api/v1/professionals/:id/reviews`
METHOD: GET
AUTH HEADER: None
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "rating": 5 } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get reviews for a professional.
