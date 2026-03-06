import {
  userService,
  bookingService,
  professionalService,
  reviewService,
} from "../services/index.js";
import ApiResponse from "../utils/response.util.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import Logger from "../utils/logger.util.js";
import { ServiceUnavailableError } from "../utils/errors.util.js";

const MOCK_USERS = [
  { id: "u-1", firstName: "Aarav", lastName: "Shah", displayName: "Aarav Shah", email: "aarav@example.com", phone: "+919900000001", role: "client", isActive: true },
  { id: "u-2", firstName: "Riya", lastName: "Kapoor", displayName: "Riya Kapoor", email: "riya@example.com", phone: "+919900000002", role: "client", isActive: true },
  { id: "u-3", firstName: "Meera", lastName: "Patel", displayName: "Meera Patel", email: "meera@example.com", phone: "+919900000003", role: "client", isActive: false },
  { id: "u-4", firstName: "Dev", lastName: "User", displayName: "Dev User", email: "dev@local.test", phone: "+919900000004", role: "admin", isActive: true },
];

const MOCK_PROFESSIONALS = [
  { id: "p-1", name: "Lens Studio", service: "photographer", city: "Mumbai", experience: "6 years", status: "Approved", date: "2026-01-12" },
  { id: "p-2", name: "Candid Frames", service: "videographer", city: "Pune", experience: "4 years", status: "Pending", date: "2026-01-20" },
  { id: "p-3", name: "Wedding Craft", service: "photographer", city: "Delhi", experience: "8 years", status: "Approved", date: "2025-12-22" },
];

const MOCK_BOOKINGS = [
  { id: "b-1", clientName: "Aarav Shah", professionalName: "Lens Studio", eventType: "Wedding", bookingDate: "2026-03-01", status: "confirmed", location: { city: "Mumbai" }, pricing: { totalAmount: 45000, paymentStatus: "paid" }, amount: 45000, eventDate: "2026-03-01", customerName: "Aarav Shah", serviceType: "Wedding" },
  { id: "b-2", clientName: "Riya Kapoor", professionalName: "Candid Frames", eventType: "Engagement", bookingDate: "2026-03-10", status: "pending", location: { city: "Pune" }, pricing: { totalAmount: 20000, paymentStatus: "pending" }, amount: 20000, eventDate: "2026-03-10", customerName: "Riya Kapoor", serviceType: "Engagement" },
  { id: "b-3", clientName: "Meera Patel", professionalName: "Wedding Craft", eventType: "Pre-wedding", bookingDate: "2026-02-15", status: "completed", location: { city: "Delhi" }, pricing: { totalAmount: 15000, paymentStatus: "paid" }, amount: 15000, eventDate: "2026-02-15", customerName: "Meera Patel", serviceType: "Pre-wedding" },
];

class AdminController {
  /**
   * GET /api/v1/admin/dashboard
   * Get aggregated dashboard statistics
   */
  getDashboardStats = asyncHandler(async (req, res) => {
    try {
      const allUsers = await userService.getUsers({ page: 1, pageSize: 1000 });
      const users = allUsers.data;

      const totalUsers = users.length;
      const activeUsers = users.filter((u) => u.isActive).length;
      const totalProfessionals = users.filter(
        (u) => u.role === "professional",
      ).length;

      const allBookings = await bookingService.getAllBookings({
        page: 1,
        pageSize: 1000,
      });
      const bookings = allBookings.data;
      const totalBookings = allBookings.pagination.totalCount;
      const completedBookings = bookings.filter(
        (b) => b.status === "completed",
      ).length;
      const revenue = bookings.reduce(
        (sum, b) => sum + (b.totalAmount || b.pricing?.total || 0),
        0,
      );

      const professionalStats = await professionalService.getStatistics();

      const bookingStatusCounts = {};
      bookings.forEach((b) => {
        const s = b.status || "unknown";
        bookingStatusCounts[s] = (bookingStatusCounts[s] || 0) + 1;
      });

      const dashboardData = {
        overview: {
          totalUsers,
          activeUsers,
          totalProfessionals,
          pendingApprovals: professionalStats.pending || 0,
          totalBookings,
          completedBookings,
          revenue,
        },
        recentActivity: {
          users: users.slice(0, 5),
          bookings: bookings.slice(0, 5),
        },
        charts: {
          bookingsByStatus: bookingStatusCounts,
          revenueOverTime: [],
          userGrowth: [],
        },
      };

      return ApiResponse.success(
        res,
        dashboardData,
        "Dashboard stats retrieved successfully",
      );
    } catch (error) {
      if (shouldUseDevMockFallback() && isServiceUnavailableError(error)) {
        Logger.warn("Using mock dashboard data due to Firestore unavailability");
        const revenue = MOCK_BOOKINGS.reduce((sum, b) => sum + (b.amount || 0), 0);
        return ApiResponse.success(res, {
          overview: {
            totalUsers: MOCK_USERS.length,
            activeUsers: MOCK_USERS.filter((u) => u.isActive).length,
            totalProfessionals: MOCK_PROFESSIONALS.length,
            pendingApprovals: MOCK_PROFESSIONALS.filter((p) => p.status.toLowerCase() === "pending").length,
            totalBookings: MOCK_BOOKINGS.length,
            completedBookings: MOCK_BOOKINGS.filter((b) => b.status === "completed").length,
            revenue,
          },
          recentActivity: {
            users: MOCK_USERS.slice(0, 5),
            bookings: MOCK_BOOKINGS.slice(0, 5),
          },
          charts: {
            bookingsByStatus: {
              confirmed: MOCK_BOOKINGS.filter((b) => b.status === "confirmed").length,
              pending: MOCK_BOOKINGS.filter((b) => b.status === "pending").length,
              completed: MOCK_BOOKINGS.filter((b) => b.status === "completed").length,
            },
            revenueOverTime: [],
            userGrowth: [],
          },
          fallback: "mock_data",
        });
      }
      throw error;
    }
  });

  /**
   * GET /api/v1/admin/users
   * Get all users with advanced filtering
   */
  getUsers = asyncHandler(async (req, res) => {
    const { role, status, search, page, pageSize, sortBy, sortOrder } = req.query;
    const parsedPage = parseInt(page) || 1;
    const parsedPageSize = parseInt(pageSize) || 20;

    try {
      const result = await userService.getUsers({
        role,
        isActive: status === 'active' ? true : (status === 'inactive' ? false : undefined),
        search,
        page: parsedPage,
        pageSize: parsedPageSize,
        sortBy,
        sortOrder
      });

      return ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      if (shouldUseDevMockFallback() && isServiceUnavailableError(error)) {
        Logger.warn("Using mock users data due to Firestore unavailability");
        let filtered = [...MOCK_USERS];
        if (role) filtered = filtered.filter((u) => u.role === role);
        if (status) {
          const isActive = status === "active";
          filtered = filtered.filter((u) => u.isActive === isActive);
        }
        if (search) {
          const q = String(search).toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.displayName.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              u.id.toLowerCase().includes(q),
          );
        }
        const paged = paginate(filtered, parsedPage, parsedPageSize);
        return ApiResponse.paginated(res, paged.data, paged.pagination);
      }
      throw error;
    }
  });

  getBookings = asyncHandler(async (req, res) => {
    const { status, professionalId, clientId, page, pageSize, startDate, endDate, paymentStatus } = req.query;
    const parsedPage = parseInt(page) || 1;
    const parsedPageSize = parseInt(pageSize) || 20;

    try {
      const result = await bookingService.getAllBookings({
          status,
          professionalId,
          clientId,
          startDate,
          endDate,
          paymentStatus,
          page: parsedPage,
          pageSize: parsedPageSize 
      });

      return ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      if (shouldUseDevMockFallback() && isServiceUnavailableError(error)) {
        Logger.warn("Using mock bookings data due to Firestore unavailability");
        let filtered = [...MOCK_BOOKINGS];
        if (status) filtered = filtered.filter((b) => b.status === status);
        if (paymentStatus) {
          const p = String(paymentStatus).toLowerCase();
          filtered = filtered.filter(
            (b) => (b.pricing?.paymentStatus || "").toLowerCase() === p,
          );
        }
        const paged = paginate(filtered, parsedPage, parsedPageSize);
        return ApiResponse.paginated(res, paged.data, paged.pagination);
      }
      throw error;
    }
  });

  /**
   * PUT /api/v1/admin/professionals/:id/verify
   * Approve or reject a professional
   */
  verifyProfessional = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body; // status: 'approved' | 'rejected'

    let result;
    if (status === 'approved') {
      result = await professionalService.approve(id, req.user.userId);
      Logger.info(`Professional ${id} approved by admin ${req.user.userId}`);
    } else if (status === 'rejected') {
      result = await professionalService.reject(id, req.user.userId, reason);
      Logger.info(`Professional ${id} rejected by admin ${req.user.userId}`);
    } else {
      return ApiResponse.badRequest(res, "Invalid status. Use 'approved' or 'rejected'");
    }

    return ApiResponse.success(res, result, `Professional ${status} successfully`);
  });

  /**
   * PUT /api/v1/admin/professionals/:id/suspend
   *
   * Suspend a professional:
   *  - Sets professional status → 'suspended'
   *  - Downgrades user role → 'client'
   *  - Professional loses access to all vendor routes
   *  - They can still login and use the app as a customer
   */
  suspendProfessional = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return ApiResponse.badRequest(res, 'A suspension reason is required');
    }

    const result = await professionalService.suspend(id, req.user.userId, reason.trim());
    Logger.info(`Professional ${id} SUSPENDED by admin ${req.user.userId}. Reason: ${reason}`);

    return ApiResponse.success(res, result, 'Professional suspended successfully');
  });

  /**
   * PUT /api/v1/admin/professionals/:id/reactivate
   *
   * Reactivate a suspended professional:
   *  - Sets professional status → 'approved'
   *  - Restores user role → 'professional'
   */
  reactivateProfessional = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await professionalService.reactivate(id, req.user.userId);
    Logger.info(`Professional ${id} REACTIVATED by admin ${req.user.userId}`);

    return ApiResponse.success(res, result, 'Professional reactivated successfully');
  });

  /**
   * POST /api/v1/admin/professionals/:id/portfolio
   * Admin can add portfolio item to any professional profile
   */
  addProfessionalPortfolioItem = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await professionalService.addPortfolioItem(id, req.body);
    return ApiResponse.success(res, updated, "Portfolio item added by admin");
  });

  /**
   * DELETE /api/v1/admin/professionals/:id/portfolio/:itemId
   * Admin can remove portfolio item from any professional profile
   */
  removeProfessionalPortfolioItem = asyncHandler(async (req, res) => {
    const { id, itemId } = req.params;
    const updated = await professionalService.removePortfolioItem(id, itemId);
    return ApiResponse.success(res, updated, "Portfolio item removed by admin");
  });

  /**
   * PUT /api/v1/admin/professionals/:id/about
   * Admin can update about/category block for any professional profile
   */
  updateProfessionalAbout = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updated = await professionalService.updateProfile(id, req.body);
    return ApiResponse.success(
      res,
      updated,
      "Professional about details updated by admin",
    );
  });

  /**
   * GET /api/v1/admin/reports/revenue
   * Get revenue reports
   */
  getRevenueReport = asyncHandler(async (req, res) => {
    const { startDate, endDate, groupBy } = req.query; // groupBy: 'day', 'month'
    
    if (!startDate || !endDate) {
        return ApiResponse.badRequest(res, "StartDate and EndDate are required");
    }

    const report = await bookingService.getRevenueStats(startDate, endDate, groupBy || 'day');

    return ApiResponse.success(res, report, "Revenue report retrieved");
  });
  /**
   * GET /api/v1/admin/professionals
   * Get all professionals (admin view)
   */
  getAllProfessionals = asyncHandler(async (req, res) => {
    const { status, category, search, page, pageSize } = req.query;
    const parsedPage = parseInt(page) || 1;
    const parsedPageSize = parseInt(pageSize) || 20;
    
    try {
      const result = await professionalService.adminSearch({
          status,
          category,
          search
      }, {
          page: parsedPage,
          pageSize: parsedPageSize
      });

      return ApiResponse.paginated(res, result.data, result.pagination);
    } catch (error) {
      if (shouldUseDevMockFallback() && isServiceUnavailableError(error)) {
        Logger.warn(
          "Using mock professionals data due to Firestore unavailability",
        );
        let filtered = [...MOCK_PROFESSIONALS];
        if (status) {
          const s = String(status).toLowerCase();
          filtered = filtered.filter((p) => p.status.toLowerCase() === s);
        }
        if (category) {
          const c = String(category).toLowerCase();
          filtered = filtered.filter((p) => p.service.toLowerCase() === c);
        }
        if (search) {
          const q = String(search).toLowerCase();
          filtered = filtered.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.id.toLowerCase().includes(q) ||
              p.city.toLowerCase().includes(q),
          );
        }
        const paged = paginate(filtered, parsedPage, parsedPageSize);
        return ApiResponse.paginated(res, paged.data, paged.pagination);
      }
      throw error;
    }
  });
}

function shouldUseDevMockFallback() {
  return (
    process.env.NODE_ENV !== "production" &&
    (process.env.AUTH_DEV_FALLBACK || "true").toLowerCase() === "true"
  );
}

function isServiceUnavailableError(error) {
  return (
    error instanceof ServiceUnavailableError ||
    error?.statusCode === 503 ||
    (error?.message || "").toLowerCase().includes("quota exceeded")
  );
}

function paginate(data, page, pageSize) {
  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = data.slice(start, end);

  return {
    data: pageData,
    pagination: {
      page: safePage,
      pageSize,
      totalCount,
      totalPages,
      hasMore: safePage < totalPages,
      nextCursor: null,
    },
  };
}

export default new AdminController();
