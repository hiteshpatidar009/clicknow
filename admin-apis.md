# Admin APIs

Base URL: `http://localhost:5000/api/v1`

### 1. Register (Admin)
----------------------------------------
API NAME: Register Admin
ENDPOINT: `http://localhost:5000/api/v1/auth/register`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "email": "admin@example.com",
  "password": "StrongPass123",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+919999999992",
  "role": "admin"
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
PURPOSE: Create an admin account (if enabled).

### 2. Login (Admin)
----------------------------------------
API NAME: Admin Login
ENDPOINT: `http://localhost:5000/api/v1/auth/login`
METHOD: POST
AUTH HEADER: None
BODY (JSON example):
```json
{
  "email": "admin@example.com",
  "password": "StrongPass123"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "user": { "_id": "...", "role": "admin" }, "token": "..." },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Login and receive JWT token.

### 3. Refresh Token
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

### 4. Get Me
----------------------------------------
API NAME: Get Me
ENDPOINT: `http://localhost:5000/api/v1/auth/me`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "user": { "_id": "...", "role": "admin" } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Get logged-in admin details from token.

### 5. Change Password
----------------------------------------
API NAME: Change Password
ENDPOINT: `http://localhost:5000/api/v1/auth/change-password`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <admin-token>`
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
PURPOSE: Change admin password.

### 6. Logout
----------------------------------------
API NAME: Logout
ENDPOINT: `http://localhost:5000/api/v1/auth/logout`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <admin-token>`
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
PURPOSE: Logout the admin session.

### 7. Dashboard Stats
----------------------------------------
API NAME: Dashboard Stats
ENDPOINT: `http://localhost:5000/api/v1/admin/dashboard`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalUsers": 100, "totalBookings": 50 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin dashboard metrics.

### 8. Revenue Report
----------------------------------------
API NAME: Revenue Report
ENDPOINT: `http://localhost:5000/api/v1/admin/reports/revenue`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalRevenue": 250000 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin revenue analytics.

### 9. Get Settings
----------------------------------------
API NAME: Get Settings
ENDPOINT: `http://localhost:5000/api/v1/admin/settings`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "settings": { "commissionRate": 10 } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Fetch application settings.

### 10. Update Settings
----------------------------------------
API NAME: Update Settings
ENDPOINT: `http://localhost:5000/api/v1/admin/settings`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example):
```json
{
  "commissionRate": 12
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "settings": { "commissionRate": 12 } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Update application settings.

### 11. List Users
----------------------------------------
API NAME: List Users
ENDPOINT: `http://localhost:5000/api/v1/admin/users`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "role": "user" } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches all users.

### 12. List Professionals
----------------------------------------
API NAME: List Professionals
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
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
PURPOSE: Admin fetches all professionals.

### 13. Pending Professionals
----------------------------------------
API NAME: Pending Professionals
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/pending`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "status": "pending" } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches pending professional approvals.

### 14. Professional Statistics
----------------------------------------
API NAME: Professional Statistics
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/statistics`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalProfessionals": 120 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin statistics for professionals.

### 15. Verify Professional
----------------------------------------
API NAME: Verify Professional
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/:id/verify`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "professional": { "_id": "...", "isVerified": true } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin verifies a professional account.

### 16. Set Featured Professional
----------------------------------------
API NAME: Set Featured Professional
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/:id/featured`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example):
```json
{
  "isFeatured": true,
  "order": 1
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "professional": { "_id": "...", "isFeatured": true } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin sets featured status/order for a professional.

### 17. Add Professional Portfolio Item
----------------------------------------
API NAME: Add Professional Portfolio Item
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/:id/portfolio`
METHOD: POST
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example):
```json
{
  "id": "portfolio-item-id",
  "type": "image",
  "url": "https://example.com/photo.jpg",
  "thumbnailUrl": "https://example.com/photo-thumb.jpg",
  "title": "Sample",
  "description": "Sample description",
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
PURPOSE: Admin adds a portfolio item to a professional.

### 18. Remove Professional Portfolio Item
----------------------------------------
API NAME: Remove Professional Portfolio Item
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/:id/portfolio/:itemId`
METHOD: DELETE
AUTH HEADER: `Authorization: Bearer <admin-token>`
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
PURPOSE: Admin removes a portfolio item from a professional.

### 19. Update Professional About
----------------------------------------
API NAME: Update Professional About
ENDPOINT: `http://localhost:5000/api/v1/admin/professionals/:id/about`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example):
```json
{
  "businessName": "Lens Studio",
  "bio": "Updated by admin",
  "experience": 6
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
PURPOSE: Admin updates professional about section.

### 20. List Bookings
----------------------------------------
API NAME: List Bookings
ENDPOINT: `http://localhost:5000/api/v1/admin/bookings`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "..." } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches bookings.

### 21. Booking Statistics
----------------------------------------
API NAME: Booking Statistics
ENDPOINT: `http://localhost:5000/api/v1/admin/bookings/statistics`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalBookings": 50 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin booking statistics.

### 22. Pending Reviews
----------------------------------------
API NAME: Pending Reviews
ENDPOINT: `http://localhost:5000/api/v1/admin/reviews/pending`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "status": "pending" } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches reviews waiting for approval.

### 23. Reported Reviews
----------------------------------------
API NAME: Reported Reviews
ENDPOINT: `http://localhost:5000/api/v1/admin/reviews/reported`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "...", "status": "reported" } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches reported reviews.

### 24. Review Statistics
----------------------------------------
API NAME: Review Statistics
ENDPOINT: `http://localhost:5000/api/v1/admin/reviews/statistics`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalReviews": 250 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin review statistics.

### 25. Approve Review
----------------------------------------
API NAME: Approve Review
ENDPOINT: `http://localhost:5000/api/v1/admin/reviews/:id/approve`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "review": { "_id": "...", "status": "approved" } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin approves a review.

### 26. Reject Review
----------------------------------------
API NAME: Reject Review
ENDPOINT: `http://localhost:5000/api/v1/admin/reviews/:id/reject`
METHOD: PUT
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example):
```json
{
  "reason": "Inappropriate content"
}
```
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "review": { "_id": "...", "status": "rejected" } },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin rejects a review with reason.

### 27. Delete Review
----------------------------------------
API NAME: Delete Review
ENDPOINT: `http://localhost:5000/api/v1/admin/reviews/:id`
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
PURPOSE: Admin deletes a review.

### 28. List Enquiries
----------------------------------------
API NAME: List Enquiries
ENDPOINT: `http://localhost:5000/api/v1/admin/enquiries`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "items": [ { "_id": "..." } ] },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin fetches enquiries.

### 29. Enquiry Statistics
----------------------------------------
API NAME: Enquiry Statistics
ENDPOINT: `http://localhost:5000/api/v1/admin/enquiries/statistics`
METHOD: GET
AUTH HEADER: `Authorization: Bearer <admin-token>`
BODY (JSON example): None
RESPONSE (JSON example):
```json
{
  "success": true,
  "message": "Success",
  "data": { "totalEnquiries": 80 },
  "timestamp": "2026-02-24T12:00:00.000Z"
}
```
PURPOSE: Admin enquiry statistics.
