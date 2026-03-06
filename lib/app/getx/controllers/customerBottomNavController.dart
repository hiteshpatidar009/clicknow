import 'package:clicknow/app/screens/customer/bookings/customerBookings_Screen.dart';
import 'package:clicknow/app/screens/customer/home/customerDashboard_Screen.dart';
import 'package:clicknow/app/screens/customer/portfolio/customerPortfolio_Screen.dart';
import 'package:clicknow/app/screens/customer/profile/customerProfile_Screen.dart';
import 'package:get/get.dart';

class CustomerBottomNavController extends GetxController {
  var index = 0.obs;

  final screens = [
    CustomerDashboardScreen(),
    CustomerPortfolioScreen(),
    CustomerBookingsScreen(),
    CustomerProfileScreen(),
  ];

  void changeTab(int i) {
    index.value = i;
  }
}