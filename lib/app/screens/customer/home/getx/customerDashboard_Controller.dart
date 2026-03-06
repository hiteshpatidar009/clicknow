import 'package:clicknow/app/data/models/booking_api_model.dart';
import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/screens/customer/home/customerDashboard_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/anchor/professionalAnchorServices_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/dj/professionalDjService_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/magicians/professionalMagicianServices_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/music/musicAndLivePerformance_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/photoAndVideography/photoAndVideoGraphy_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/weddingPlanner/weddingPlannerAndManagement_Screen.dart';
import 'package:clicknow/app/services/booking_service.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';

class ServiceModel {
  final String title;
  final String description;
  final String price;
  final String imagePath;
  final Widget destinationScreen;

  ServiceModel({
    required this.title,
    required this.description,
    required this.price,
    required this.imagePath,
    required this.destinationScreen,
  });
}

class ActiveBookingModel {
  final String bookingId;
  final String dateTime;
  final String location;
  final List<String> serviceTypes;
  final String paymentStatus;

  ActiveBookingModel({
    required this.bookingId,
    required this.dateTime,
    required this.location,
    required this.serviceTypes,
    required this.paymentStatus,
  });
}

class CustomerDashboardController extends GetxController {
  final BookingService _bookingService = BookingService();

  // User Info
  final userName = ''.obs;

  // Notification & Cart count
  final notificationCount = 0.obs;
  final cartCount = 0.obs;

  // Banner slider
  final currentBannerIndex = 0.obs;
  final totalBanners = 5;

  // Services list
  final services = <ServiceModel>[].obs;

  // Active Bookings
  final activeBookings = <ActiveBookingModel>[].obs;
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    _loadServices();
    _loadUser();
    _loadActiveBookings();
  }

  void _loadUser() {
    final user = AuthController.instance.currentUser.value;
    userName.value = user?.fullName.isNotEmpty == true
        ? user!.fullName
        : (user?.email ?? "User");
  }

  void _loadServices() {
    services.value = [
      ServiceModel(
        title: 'Photography &\nVideography',
        description: 'Professional Photo and video Coverage',
        price: 'Rs.15,000',
        imagePath: AppImages.photographer,
        destinationScreen: const PhotoAndVideographyScreen(),
      ),
      ServiceModel(
        title: 'Music & Live\nPerformance',
        description: 'Professional Photo and video Coverage',
        price: 'Rs.20,000',
        imagePath: AppImages.photographer,
        destinationScreen: const MusicAndLivePerformanceScreen(),
      ),
      ServiceModel(
        title: 'Professional DJ\nServices',
        description: 'Professional Photo and video Coverage',
        price: 'Rs.12,000',
        imagePath: AppImages.photographer,
        destinationScreen: const ProfessionalDjServiceScreen(),
      ),
      ServiceModel(
        title: 'Wedding Planner &\nmanagement',
        description: 'Professional Photo and video Coverage',
        price: 'Rs.30,000',
        imagePath: AppImages.photographer,
        destinationScreen: const WeddingPlannerAndManagementScreen(),
      ),
      ServiceModel(
        title: 'Professional Anchor\nServices',
        description: 'Professional Photo and video Coverage',
        price: 'Rs.8,000',
        imagePath: AppImages.photographer,
        destinationScreen: const ProfessionalAnchorServicesScreen(),
      ),
      ServiceModel(
        title: 'Professional Magician\nServices',
        description: 'Professional Photo and video Coverage',
        price: 'Rs.10,000',
        imagePath: AppImages.photographer,
        destinationScreen: const ProfessionalMagicianServicesScreen(),
      ),
    ];
  }

  Future<void> _loadActiveBookings() async {
    isLoading.value = true;
    try {
      final bookings = await _bookingService.getClientBookings();
      final active = bookings.where((b) => _isUpcoming(b.status)).toList();
      activeBookings.assignAll(
        active.map(_mapToActiveBooking).toList(),
      );
    } catch (error) {
      activeBookings.clear();
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  bool _isUpcoming(String status) {
    return !["completed", "cancelled", "rejected"].contains(status);
  }

  ActiveBookingModel _mapToActiveBooking(BookingApiModel booking) {
    final dateTime = _formatDateTime(
      booking.bookingDate,
      booking.startTime,
      booking.endTime,
    );
    final location = _formatLocation(booking.location);
    final serviceTypes = _resolveServiceTypes(booking);
    final paymentStatus =
        booking.pricing?["paymentStatus"]?.toString() ?? "Pending";

    return ActiveBookingModel(
      bookingId: booking.id,
      dateTime: dateTime,
      location: location,
      serviceTypes: serviceTypes,
      paymentStatus: paymentStatus,
    );
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

  List<String> _resolveServiceTypes(BookingApiModel booking) {
    final serviceType =
        booking.eventDetails?["serviceType"]?.toString().trim();
    if (serviceType != null && serviceType.isNotEmpty) {
      return [serviceType];
    }
    final eventType = booking.eventType?.trim();
    if (eventType != null && eventType.isNotEmpty) {
      return [eventType];
    }
    return ["Service"];
  }

  void onBannerChanged(int index) => currentBannerIndex.value = index;

  void onServiceTap(ServiceModel service) => Get.to(() => service.destinationScreen);

  void onCartTap() {
    Get.snackbar(
      'Cart',
      'Navigating to cart...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onNotificationTap() {
    Get.snackbar(
      'Notifications',
      'Navigating to notifications...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onBookingDetailsTap(String bookingId) {
    Get.snackbar(
      'Booking Details',
      'Viewing $bookingId...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }

  void onClaimOffer() {
    Get.snackbar(
      'Limited Offer',
      'Claiming your special offer!',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF1C1736),
      colorText: Colors.white,
    );
  }
}
