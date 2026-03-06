import 'package:clicknow/app/data/models/booking_api_model.dart';
import 'package:clicknow/app/services/booking_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

enum BookingStatus { confirmed, pending, completed, canceled }

class BookingItemModel {
  final String bookingId;
  final String customerName;
  final String serviceType;
  final String dateTime;
  final String location;
  final String bookingAmount;
  final BookingStatus status;

  BookingItemModel({
    required this.bookingId,
    required this.customerName,
    required this.serviceType,
    required this.dateTime,
    required this.location,
    required this.bookingAmount,
    required this.status,
  });
}

class BookingTab {
  final String label;
  final BookingStatus? status; // null = All

  BookingTab({required this.label, this.status});
}

class ProfessionalBookingsController extends GetxController {
  final BookingService _bookingService = BookingService();

  // Selected tab index
  final selectedTabIndex = 0.obs;

  // All tabs
  final tabs = [
    BookingTab(label: 'All', status: null),
    BookingTab(label: 'Pending', status: BookingStatus.pending),
    BookingTab(label: 'Confirmed', status: BookingStatus.confirmed),
    BookingTab(label: 'Completed', status: BookingStatus.completed),
    BookingTab(label: 'Canceled', status: BookingStatus.canceled),
  ];

  final _allBookings = <BookingItemModel>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchBookings();
  }

  // Filtered bookings based on selected tab
  List<BookingItemModel> get filteredBookings {
    final currentStatus = tabs[selectedTabIndex.value].status;
    if (currentStatus == null) return _allBookings;
    return _allBookings.where((b) => b.status == currentStatus).toList();
  }

  void selectTab(int index) => selectedTabIndex.value = index;

  Future<void> fetchBookings() async {
    isLoading.value = true;
    try {
      final bookings = await _bookingService.getProfessionalBookings();
      _allBookings.assignAll(bookings.map(_mapToBookingItem).toList());
    } catch (error) {
      _allBookings.clear();
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void onSeeDetails(String bookingId) {
    Get.snackbar(
      'Booking Details',
      'Viewing details for $bookingId',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  String statusLabel(BookingStatus status) {
    switch (status) {
      case BookingStatus.confirmed:
        return 'Confirmed';
      case BookingStatus.pending:
        return 'Pending';
      case BookingStatus.completed:
        return 'Completed';
      case BookingStatus.canceled:
        return 'Canceled';
    }
  }

  Color statusColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.confirmed:
        return const Color(0xFF00C853);
      case BookingStatus.pending:
        return const Color(0xFFB8860B);
      case BookingStatus.completed:
        return const Color(0xFFBF00FF);
      case BookingStatus.canceled:
        return const Color(0xFFCC3300);
    }
  }

  Color statusBgColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.confirmed:
        return const Color(0xFF00C853).withValues(alpha: 0.12);
      case BookingStatus.pending:
        return const Color(0xFFB8860B).withValues(alpha: 0.18);
      case BookingStatus.completed:
        return const Color(0xFFBF00FF).withValues(alpha: 0.12);
      case BookingStatus.canceled:
        return const Color(0xFFCC3300).withValues(alpha: 0.18);
    }
  }

  BookingItemModel _mapToBookingItem(BookingApiModel booking) {
    final status = _resolveStatus(booking.status);
    final dateTime = _formatDateTime(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
    );
    final location = _formatLocation(booking.location);
    final serviceType = _resolveServiceType(booking);
    final amount = booking.pricing?["totalAmount"]?.toString() ?? "0";
    final customerName =
        booking.eventDetails?["customerName"]?.toString() ??
        booking.eventDetails?["clientName"]?.toString() ??
        "Customer";

    return BookingItemModel(
      bookingId: booking.id,
      customerName: customerName,
      serviceType: serviceType,
      dateTime: dateTime,
      location: location,
      bookingAmount: "Rs. $amount",
      status: status,
    );
  }

  BookingStatus _resolveStatus(String status) {
    switch (status) {
      case "confirmed":
        return BookingStatus.confirmed;
      case "completed":
        return BookingStatus.completed;
      case "cancelled":
      case "rejected":
        return BookingStatus.canceled;
      default:
        return BookingStatus.pending;
    }
  }

  String _resolveServiceType(BookingApiModel booking) {
    final serviceType = booking.eventDetails?["serviceType"]?.toString().trim();
    if (serviceType != null && serviceType.isNotEmpty) {
      return serviceType;
    }
    final eventType = booking.eventType?.trim();
    if (eventType != null && eventType.isNotEmpty) {
      return eventType;
    }
    return "Service";
  }

  String _formatDateTime(DateTime date, String? startTime, String? endTime) {
    final dateLabel = DateFormat("MMM d, yyyy").format(date);
    if (startTime != null && endTime != null) {
      return "$dateLabel • $startTime to $endTime";
    }
    if (startTime != null) {
      return "$dateLabel • $startTime";
    }
    return dateLabel;
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
}
