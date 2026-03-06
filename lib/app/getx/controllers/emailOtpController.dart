import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/services/auth_service.dart';
import 'package:clicknow/app/services/auth_storage.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class EmailOtpController extends GetxController {
  final AuthService _authService = AuthService();
  final AuthStorage _storage = AuthStorage();

  final TextEditingController otpController = TextEditingController();
  final RxString email = "".obs;
  final RxBool isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    final argEmail = Get.arguments is String ? Get.arguments as String : null;
    final storedEmail = _storage.pendingEmail;
    email.value = (argEmail ?? storedEmail ?? "").trim();
  }

  Future<void> verifyOtp() async {
    if (isLoading.value) return;
    final otp = otpController.text.trim();
    if (email.value.isEmpty) {
      Get.snackbar("Error", "Email not found. Please register again.");
      return;
    }
    if (otp.length != 6) {
      Get.snackbar("Error", "Enter valid 6-digit OTP");
      return;
    }

    isLoading.value = true;
    try {
      final session = await _authService.verifyOtp(
        email: email.value,
        otp: otp,
        role: "client",
      );
      await _storage.setPendingEmail(null);
      await AuthController.instance.setSession(session);
      await AuthController.instance.handleStartupNavigation();
      Get.snackbar("Success", session.message ?? "Email verified");
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    otpController.dispose();
    super.onClose();
  }
}
