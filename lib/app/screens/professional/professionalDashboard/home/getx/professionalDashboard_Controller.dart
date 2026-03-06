import 'package:clicknow/app/data/models/booking_api_model.dart';
import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/services/booking_service.dart';
import 'package:clicknow/app/services/professional_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class BookingModel {
  final String bookingId;
  final String customerName;
  final String eventDescription;
  final String serviceType;
  final String dateTime;
  final String eventDuration;
  final String timeLeft;
  final String location;
  final String bookingAmount;
  RxBool isExpanded;

  BookingModel({
    required this.bookingId,
    required this.customerName,
    required this.eventDescription,
    required this.serviceType,
    required this.dateTime,
    required this.eventDuration,
    required this.timeLeft,
    required this.location,
    required this.bookingAmount,
    bool expanded = false,
  }) : isExpanded = expanded.obs;
}

class ProfessionalDashboardController extends GetxController {
  final BookingService _bookingService = BookingService();
  final ProfessionalService _professionalService = ProfessionalService();

  // User Info
  final userName = ''.obs;
  final isApprovedProfessional = false.obs;
  final notificationCount = 0.obs;

  // Visibility Toggle
  final isVisibleForBooking = true.obs;

  // Stats
  final todaysBookings = 0.obs;
  final upcomingBookings = 0.obs;
  final pendingAcceptance = 0.obs;
  final monthlyRevenue = '0'.obs;

  // Active Bookings
  final activeBookings = <BookingModel>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUser();
    _loadProfile();
    _loadBookings();
  }

  void _loadUser() {
    final user = AuthController.instance.currentUser.value;
    userName.value = user?.fullName.isNotEmpty == true
        ? user!.fullName
        : (user?.email ?? "Professional");
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _professionalService.getMyProfile();
      final status = profile["professional"]?["status"]?.toString() ??
          profile["status"]?.toString() ??
          "pending";
      isApprovedProfessional.value = status == "approved";
    } catch (_) {}
  }

  Future<void> _loadBookings() async {
    isLoading.value = true;
    try {
      final bookings = await _bookingService.getProfessionalBookings();
      _computeStats(bookings);
      activeBookings.assignAll(
        bookings
            .where((b) => _isActiveStatus(b.status))
            .map(_mapToBookingModel)
            .toList(),
      );
    } catch (error) {
      activeBookings.clear();
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void _computeStats(List<BookingApiModel> bookings) {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);
    final todayEnd = todayStart.add(const Duration(days: 1));

    todaysBookings.value = bookings
        .where((b) => b.bookingDate.isAfter(todayStart) && b.bookingDate.isBefore(todayEnd))
        .length;

    upcomingBookings.value = bookings
        .where((b) => b.bookingDate.isAfter(today) && _isUpcomingStatus(b.status))
        .length;

    pendingAcceptance.value = bookings
        .where((b) => ["pending", "processing", "assigned"].contains(b.status))
        .length;

    final revenue = bookings.fold<num>(0, (sum, b) {
      final total = b.pricing?["totalAmount"];
      if (total is num) return sum + total;
      return sum;
    });
    monthlyRevenue.value = revenue.toStringAsFixed(0);
  }

  bool _isActiveStatus(String status) {
    return ["confirmed", "processing", "assigned", "pending"].contains(status);
  }

  bool _isUpcomingStatus(String status) {
    return !["completed", "cancelled", "rejected"].contains(status);
  }

  BookingModel _mapToBookingModel(BookingApiModel booking) {
    final dateTime = _formatDateTime(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
    );
    final duration = _formatDuration(booking.duration);
    final timeLeft = _formatTimeLeft(booking.bookingDate);
    final location = _formatLocation(booking.location);
    final serviceType = _resolveServiceType(booking);
    final amount = booking.pricing?["totalAmount"]?.toString() ?? "0";
    final customerName =
        booking.eventDetails?["customerName"]?.toString() ??
        booking.eventDetails?["clientName"]?.toString() ??
        "Customer";
    final description =
        booking.eventDetails?["description"]?.toString() ?? "Event booking";

    return BookingModel(
      bookingId: booking.id,
      customerName: customerName,
      eventDescription: description,
      serviceType: serviceType,
      dateTime: dateTime,
      eventDuration: duration,
      timeLeft: timeLeft,
      location: location,
      bookingAmount: "Rs. $amount",
    );
  }

  String _formatDateTime(
    DateTime date,
    String? startTime,
    String? endTime,
  ) {
    final dateLabel = DateFormat("MMM d, yyyy").format(date);
    if (startTime != null && endTime != null) {
      return "$dateLabel • $startTime to $endTime";
    }
    if (startTime != null) {
      return "$dateLabel • $startTime";
    }
    return dateLabel;
  }

  String _formatDuration(num? duration) {
    if (duration == null || duration == 0) return "Duration TBD";
    final hours = (duration / 60).ceil();
    return "$hours Hrs.";
  }

  String _formatTimeLeft(DateTime date) {
    final diff = date.difference(DateTime.now());
    if (diff.inMinutes <= 0) return "(In progress)";
    if (diff.inDays > 0) return "(${diff.inDays} days left)";
    if (diff.inHours > 0) return "(${diff.inHours} hrs left)";
    return "(${diff.inMinutes} min left)";
  }

  String _formatLocation(Map<String, dynamic>? location) {
    if (location == null) return "Location not set";
    final parts = [
      location["address"],
      location["city"],
      location["state"],
    ].whereType<String>().where((v) => v.trim().isNotEmpty).toList();
    return parts.isEmpty ? "Location not set" : parts.join(", ");
  }

  String _resolveServiceType(BookingApiModel booking) {
    final serviceType =
        booking.eventDetails?["serviceType"]?.toString().trim();
    if (serviceType != null && serviceType.isNotEmpty) {
      return serviceType;
    }
    final eventType = booking.eventType?.trim();
    if (eventType != null && eventType.isNotEmpty) {
      return eventType;
    }
    return "Service";
  }

  void toggleVisibility(bool value) => isVisibleForBooking.value = value;

  void toggleBookingExpand(int index) {
    activeBookings[index].isExpanded.value =
        !activeBookings[index].isExpanded.value;
  }

  void contactCustomer(String bookingId) {
    Get.snackbar(
      'Contact Customer',
      'Contacting customer for booking $bookingId',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1A1A2E),
      colorText: Colors.white,
    );
  }

  void addMoreHours(String bookingId) {
    Get.snackbar(
      'Add More Hours',
      'Adding hours for booking $bookingId',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1A1A2E),
      colorText: Colors.white,
    );
  }

  void endBooking(String bookingId) {
    Get.dialog(
      AlertDialog(
        backgroundColor: const Color(0xFF12122A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        title: const Text(
          'End Booking',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Are you sure you want to end booking $bookingId?',
          style: const TextStyle(color: Color(0xFF9E9E9E)),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: const Text(
              'Cancel',
              style: TextStyle(color: Color(0xFF9B6FD4)),
            ),
          ),
          TextButton(
            onPressed: () {
              Get.back();
              Get.snackbar(
                'Booking Ended',
                'Booking $bookingId has been ended.',
                snackPosition: SnackPosition.BOTTOM,
                backgroundColor: const Color(0xFF1A1A2E),
                colorText: Colors.white,
              );
            },
            child: const Text(
              'End',
              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}
