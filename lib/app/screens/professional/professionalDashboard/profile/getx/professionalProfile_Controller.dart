import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/services/professional_service.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfessionalProfileController extends GetxController {
  final ProfessionalService _professionalService = ProfessionalService();

  // User Info
  final userName = 'Professional'.obs;
  final isApprovedProfessional = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadUser();
    _loadProfile();
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

  void onEditProfessionalInfo() {
    Get.snackbar(
      'Edit Professional Information',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onAvailabilitySchedule() {
    Get.snackbar(
      'Availability & Schedule',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onDocumentStatus() {
    Get.snackbar(
      'Document Status',
      'Navigating...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onBankDetails() {
    Get.snackbar(
      'Bank Details',
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
