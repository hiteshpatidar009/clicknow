import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MonthlyData {
  final String month;
  final double revenue;
  final double payout;

  MonthlyData({
    required this.month,
    required this.revenue,
    required this.payout,
  });
}

class ProfessionalEarningsController extends GetxController {
  // Stats
  final totalRevenue = '2,60,000'.obs;
  final thisMonthRevenue = '60,000'.obs;
  final pendingPayout = '2,60,000'.obs;
  final settledAmount = '60,000'.obs;
  final commissionPaid = '18,000'.obs;

  // Monthly Chart Data
  final monthlyData = <MonthlyData>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadMonthlyData();
  }

  void _loadMonthlyData() {
    monthlyData.value = [
      MonthlyData(month: 'Jan', revenue: 52, payout: 38),
      MonthlyData(month: 'Feb', revenue: 65, payout: 80),
      MonthlyData(month: 'March', revenue: 75, payout: 15),
      MonthlyData(month: 'April', revenue: 80, payout: 12),
      MonthlyData(month: 'May', revenue: 68, payout: 62),
      MonthlyData(month: 'June', revenue: 35, payout: 30),
    ];
  }

  void viewPaymentHistory() {
    Get.snackbar(
      'Payment History',
      'Navigating to payment history...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }
}