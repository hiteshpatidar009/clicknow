import 'package:clicknow/app/data/models/booking_api_model.dart';
import 'package:clicknow/app/services/booking_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

// Booking Status Enum
enum CustomerBookingStatus { upcoming, completed, canceled }

// Customer Booking Model
class CustomerBookingModel {
  final String bookingId;
  final String title;
  final String dateTime;
  final String location;
  final List<String> serviceTypes;
  final String paymentStatus;
  final CustomerBookingStatus status;

  CustomerBookingModel({
    required this.bookingId,
    required this.title,
    required this.dateTime,
    required this.location,
    required this.serviceTypes,
    required this.paymentStatus,
    required this.status,
  });
}

// Tab Model
class CustomerBookingTab {
  final String label;
  final CustomerBookingStatus status;
  CustomerBookingTab({required this.label, required this.status});
}

class CustomerBookingsController extends GetxController {
  final BookingService _bookingService = BookingService();

  // Selected tab index
  final selectedTabIndex = 0.obs;

  // All tabs
  final tabs = [
    CustomerBookingTab(
      label: 'Upcoming',
      status: CustomerBookingStatus.upcoming,
    ),
    CustomerBookingTab(
      label: 'Completed',
      status: CustomerBookingStatus.completed,
    ),
    CustomerBookingTab(
      label: 'Canceled',
      status: CustomerBookingStatus.canceled,
    ),
  ];

  // All bookings
  final _allBookings = <CustomerBookingModel>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    fetchBookings();
  }

  // Filtered bookings based on selected tab
  List<CustomerBookingModel> get filteredBookings {
    final currentStatus = tabs[selectedTabIndex.value].status;
    return _allBookings.where((b) => b.status == currentStatus).toList();
  }

  void selectTab(int index) => selectedTabIndex.value = index;

  Future<void> fetchBookings() async {
    isLoading.value = true;
    try {
      final bookings = await _bookingService.getClientBookings();
      _allBookings.assignAll(bookings.map(_mapToCustomerBooking).toList());
    } catch (error) {
      _allBookings.clear();
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  void onBookingDetails(String bookingId) {
    Get.snackbar(
      'Booking Details',
      'Viewing details for $bookingId',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  String bookingStatusLabel(String title) {
    if (title.toLowerCase().contains('confirmed')) return 'Confirmed';
    if (title.toLowerCase().contains('pending')) return 'Pending';
    if (title.toLowerCase().contains('canceled')) return 'Canceled';
    return '';
  }

  Color bookingStatusColor(String title) {
    if (title.toLowerCase().contains('confirmed')) {
      return const Color(0xFF00C853);
    }
    if (title.toLowerCase().contains('pending')) return const Color(0xFFB8860B);
    if (title.toLowerCase().contains('canceled')) {
      return const Color(0xFFCC3300);
    }
    return Colors.white;
  }

  Color bookingStatusBgColor(String title) {
    if (title.toLowerCase().contains('confirmed')) {
      return const Color(0xFF00C853).withValues(alpha: 0.12);
    }
    if (title.toLowerCase().contains('pending')) {
      return const Color(0xFFB8860B).withValues(alpha: 0.18);
    }
    if (title.toLowerCase().contains('canceled')) {
      return const Color(0xFFCC3300).withValues(alpha: 0.18);
    }
    return Colors.transparent;
  }

  CustomerBookingModel _mapToCustomerBooking(BookingApiModel booking) {
    final status = _resolveCustomerStatus(booking.status);
    final title = _resolveTitle(booking.status);
    final dateTime = _formatDateTime(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
    );
    final location = _formatLocation(booking.location);
    final serviceTypes = _resolveServiceTypes(booking);
    final paymentStatus =
        booking.pricing?["paymentStatus"]?.toString() ?? "Pending";

    return CustomerBookingModel(
      bookingId: booking.id,
      title: title,
      dateTime: dateTime,
      location: location,
      serviceTypes: serviceTypes,
      paymentStatus: _capitalize(paymentStatus),
      status: status,
    );
  }

  CustomerBookingStatus _resolveCustomerStatus(String status) {
    switch (status) {
      case "completed":
        return CustomerBookingStatus.completed;
      case "cancelled":
      case "rejected":
        return CustomerBookingStatus.canceled;
      default:
        return CustomerBookingStatus.upcoming;
    }
  }

  String _resolveTitle(String status) {
    switch (status) {
      case "confirmed":
      case "completed":
        return "Confirmed Bookings";
      case "cancelled":
      case "rejected":
        return "Canceled Bookings";
      default:
        return "Pending Bookings";
    }
  }

  List<String> _resolveServiceTypes(BookingApiModel booking) {
    final serviceType = booking.eventDetails?["serviceType"]?.toString().trim();
    if (serviceType != null && serviceType.isNotEmpty) {
      return [serviceType];
    }
    final eventType = booking.eventType?.trim();
    if (eventType != null && eventType.isNotEmpty) {
      return [eventType];
    }
    return ["Service"];
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

  String _capitalize(String value) {
    if (value.isEmpty) return value;
    return value[0].toUpperCase() + value.substring(1);
  }
}
