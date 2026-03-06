import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/services/booking_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomerProfileController extends GetxController {
  final BookingService _bookingService = BookingService();

  // User Info
  final userName = 'User'.obs;
  final userEmail = ''.obs;

  // Stats
  final totalBookings = '0'.obs;
  final totalSpent = 'Rs.0'.obs;
  final totalRatings = '0'.obs;

  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUser();
    _loadStats();
  }

  void _loadUser() {
    final user = AuthController.instance.currentUser.value;
    userName.value = user?.fullName.isNotEmpty == true
        ? user!.fullName
        : (user?.email ?? "User");
    userEmail.value = user?.email ?? "";
  }

  Future<void> _loadStats() async {
    isLoading.value = true;
    try {
      final bookings = await _bookingService.getClientBookings();
      totalBookings.value = bookings.length.toString();
      final total = bookings.fold<num>(0, (sum, b) {
        final amount = b.pricing?["totalAmount"];
        if (amount is num) return sum + amount;
        return sum;
      });
      totalSpent.value = "Rs.${total.toStringAsFixed(0)}";
    } catch (_) {} finally {
      isLoading.value = false;
    }
  }

  void onEditProfessionalInfo() {
    Get.snackbar(
      'Edit Professional Information',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onInvoiceHistory() {
    Get.snackbar(
      'Invoice History',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onSavedAddress() {
    Get.snackbar(
      'Saved Address',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onSettings() {
    Get.snackbar(
      'Settings',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }
}
