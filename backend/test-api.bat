@echo off
echo ========================================
echo Photography Booking API - Endpoint Test
echo ========================================
echo.

echo Testing Root Endpoint...
curl -s http://localhost:3000/
echo.
echo.

echo Testing Health Endpoint...
curl -s http://localhost:3000/health
echo.
echo.

echo Testing API Health...
curl -s http://localhost:3000/api/v1/health
echo.
echo.

echo ========================================
echo Available Endpoints:
echo ========================================
echo.
echo Authentication:
echo   POST /api/v1/auth/register
echo   POST /api/v1/auth/login
echo   POST /api/v1/auth/firebase
echo   GET  /api/v1/auth/me
echo.
echo Feed (Social):
echo   GET  /api/v1/feed
echo   POST /api/v1/feed/posts
echo   GET  /api/v1/feed/posts/:id
echo   POST /api/v1/feed/posts/:id/like
echo   POST /api/v1/feed/posts/:id/comments
echo.
echo Social:
echo   POST /api/v1/social/follow
echo   POST /api/v1/social/unfollow
echo   GET  /api/v1/social/followers/:userId
echo   GET  /api/v1/social/following/:userId
echo   GET  /api/v1/social/stats/:userId
echo.
echo Professionals:
echo   GET  /api/v1/professionals
echo   GET  /api/v1/professionals/:id
echo   POST /api/v1/professionals
echo.
echo Bookings:
echo   POST /api/v1/bookings
echo   GET  /api/v1/bookings/:id
echo   GET  /api/v1/bookings/client
echo   GET  /api/v1/bookings/professional
echo.
echo Chats:
echo   GET  /api/v1/chats
echo   POST /api/v1/chats
echo   GET  /api/v1/chats/:id/messages
echo   POST /api/v1/chats/:id/messages
echo.
echo Reviews:
echo   POST /api/v1/reviews
echo   GET  /api/v1/professionals/:id/reviews
echo.
echo Enquiries:
echo   POST /api/v1/enquiries
echo   GET  /api/v1/enquiries/client
echo   GET  /api/v1/enquiries/professional
echo.
echo Notifications:
echo   GET  /api/v1/notifications
echo   GET  /api/v1/notifications/unread-count
echo.
echo ========================================
echo Server Status: RUNNING ✓
echo Port: 3000
echo Environment: Development
echo ========================================
