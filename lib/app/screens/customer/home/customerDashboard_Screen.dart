import 'package:clicknow/app/screens/customer/home/getx/customerDashboard_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomerDashboardScreen extends StatelessWidget {
  const CustomerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(CustomerDashboardController());

    /// -- Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return Container(
      height: double.maxFinite,
      width: double.maxFinite,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Header ──
                _Header(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(22)),

                /// -- Our Leading Services
                _sectionTitle('Our Leading Services', scale),
                SizedBox(height: scale.getScaledHeight(12)),
                _BannerSlider(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(22)),

                /// -- Services At ClickNow
                _sectionTitle('Services At ClickNow', scale),
                SizedBox(height: scale.getScaledHeight(12)),
                _ServicesGrid(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(22)),

                /// -- Active Bookings
                _sectionTitle('Active Bookings', scale),
                SizedBox(height: scale.getScaledHeight(12)),
                _ActiveBookingsList(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(16)),

                /// -- Special Offer Card
                _SpecialOfferCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(24)),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static Widget _sectionTitle(String title, ScalingUtility scale) => Text(
    title,
    style: TextStyle(
      color: Colors.white,
      fontSize: scale.getScaledFont(16),
      fontWeight: FontWeight.bold,
    ),
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
class _Header extends StatelessWidget {
  final CustomerDashboardController controller;
  final ScalingUtility scale;
  const _Header({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Avatar
        Container(
          width: scale.getScaledWidth(48),
          height: scale.getScaledHeight(48),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Color(0xff2A1F4E),
            border: Border.all(
              color: Color(0xffBF00FF).withValues(alpha: 0.4),
              width: 2,
            ),
          ),
          child: ClipOval(
            child: Image.asset(AppImages.avtar2, fit: BoxFit.cover),
          ),
        ),
        SizedBox(width: scale.getScaledWidth(12)),

        // Welcome text
        Expanded(
          child: Obx(() => Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'welcome Back,',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: scale.getScaledFont(12),
                ),
              ),
              Text(
                controller.userName.value,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: scale.getScaledFont(16),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          )),
        ),

        // Cart Icon
        Obx(() => _IconBadge(
          imagePath: AppImages.bellIcon,
          count: controller.cartCount.value,
          onTap: controller.onCartTap,
          scale: scale,
          isCart: true,
        )),
        SizedBox(width: scale.getScaledWidth(10)),

        // Bell Icon
        Obx(() => _IconBadge(
          imagePath: AppImages.bellIcon,
          count: controller.notificationCount.value,
          onTap: controller.onNotificationTap,
          scale: scale,
        )),
      ],
    );
  }
}

// ─── Icon with Badge ───────────────────────────────────────────────────────────
class _IconBadge extends StatelessWidget {
  final String imagePath;
  final int count;
  final VoidCallback onTap;
  final ScalingUtility scale;
  final bool isCart;

  const _IconBadge({
    required this.imagePath,
    required this.count,
    required this.onTap,
    required this.scale,
    this.isCart = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: scale.getScaledWidth(40),
            height: scale.getScaledHeight(40),
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xffEBEBEB),
            ),
            child: Padding(
              padding: const EdgeInsets.all(9.0),
              child: Image.asset(imagePath, fit: BoxFit.contain),
            ),
          ),
          if (count > 0)
            Positioned(
              right: -3,
              top: -5,
              child: Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isCart
                      ? const Color(0xffF5A623)
                      : const Color(0xff4C15C2),
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '$count',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: scale.getScaledFont(10),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─── Banner Slider ─────────────────────────────────────────────────────────────
class _BannerSlider extends StatelessWidget {
  final CustomerDashboardController controller;
  final ScalingUtility scale;
  const _BannerSlider({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: double.infinity,
          height: scale.getScaledHeight(160),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: PageView.builder(
              onPageChanged: controller.onBannerChanged,
              itemCount: controller.totalBanners,
              itemBuilder: (_, i) => Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xffE8F4FD), Color(0xffD0E8F8)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: Row(
                  children: [
                    SizedBox(width: scale.getScaledWidth(16)),
                    Container(
                      width: scale.getScaledWidth(100),
                      height: scale.getScaledHeight(100),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Color(0xff1A6B9A), width: 3),
                      ),
                      child: ClipOval(
                        child: Image.asset(AppImages.photographer, fit: BoxFit.cover),
                      ),
                    ),
                    SizedBox(width: scale.getScaledWidth(12)),
                    Expanded(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'EVENT',
                            style: TextStyle(
                              color: Color(0xff1A6B9A),
                              fontSize: scale.getScaledFont(26),
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                            ),
                          ),
                          Text(
                            'PHOTO &\nVIDEOGRAPHY',
                            style: TextStyle(
                              color: Color(0xff1A3A5C),
                              fontSize: scale.getScaledFont(16),
                              fontWeight: FontWeight.bold,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
        SizedBox(height: scale.getScaledHeight(10)),

        // Dot indicators
        Obx(() => Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            controller.totalBanners,
                (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: controller.currentBannerIndex.value == i ? 22 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: controller.currentBannerIndex.value == i
                    ? Color(0xffBF00FF)
                    : Colors.white.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
        )),
      ],
    );
  }
}

// ─── Services Grid ─────────────────────────────────────────────────────────────
class _ServicesGrid extends StatelessWidget {
  final CustomerDashboardController controller;
  final ScalingUtility scale;
  const _ServicesGrid({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final services = controller.services;
      final professionalImages = [
        AppImages.photographer,
        AppImages.musician,
        AppImages.dj,
        AppImages.weddingPlanner,
        AppImages.anchor,
        AppImages.magician,
      ];
      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: scale.getScaledWidth(10),
          mainAxisSpacing: scale.getScaledHeight(10),
          childAspectRatio: 0.6,
        ),
        itemCount: services.length,
        itemBuilder: (_, i) => _ServiceCard(
          service: services[i],
          controller: controller,
          scale: scale,
          image: professionalImages[i],
        ),
      );
    });
  }
}

// ─── Service Card ──────────────────────────────────────────────────────────────
class _ServiceCard extends StatelessWidget {
  final ServiceModel service;
  final CustomerDashboardController controller;
  final ScalingUtility scale;
  final dynamic image;

  const _ServiceCard({
    required this.service,
    required this.controller,
    required this.scale,
    required this.image,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => controller.onServiceTap(service),
      child: Container(
        decoration: BoxDecoration(
          color: Color(0xff1C1736).withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Color(0xff1E2939)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              flex: 5,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
                child: Image.asset(
                  image,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
              ),
            ),

            // Info
            Expanded(
              flex: 4,
              child: Padding(
                padding: EdgeInsets.all(scale.getScaledWidth(6)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      service.title,
                      style: TextStyle(
                        color: Color(0xffBF00FF),
                        fontSize: scale.getScaledFont(9),
                        fontWeight: FontWeight.bold,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      service.description,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: scale.getScaledFont(8),
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          service.price,
                          style: TextStyle(
                            color: Color(0xffBF00FF),
                            fontSize: scale.getScaledFont(9),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Icon(
                          Icons.chevron_right_rounded,
                          color: Colors.white.withValues(alpha: 0.5),
                          size: scale.getScaledWidth(14),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Active Bookings List ──────────────────────────────────────────────────────
class _ActiveBookingsList extends StatelessWidget {
  final CustomerDashboardController controller;
  final ScalingUtility scale;
  const _ActiveBookingsList({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(() => Column(
      children: List.generate(
        controller.activeBookings.length,
            (i) => _ActiveBookingCard(
          booking: controller.activeBookings[i],
          controller: controller,
          scale: scale,
        ),
      ),
    ));
  }
}

// ─── Active Booking Card ───────────────────────────────────────────────────────
class _ActiveBookingCard extends StatelessWidget {
  final ActiveBookingModel booking;
  final CustomerDashboardController controller;
  final ScalingUtility scale;

  const _ActiveBookingCard({
    required this.booking,
    required this.controller,
    required this.scale,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.only(bottom: scale.getScaledHeight(14)),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(
              scale.getScaledWidth(14), scale.getScaledHeight(12),
              scale.getScaledWidth(14), scale.getScaledHeight(10),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Confirmed Bookings',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: scale.getScaledFont(14),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: scale.getScaledHeight(4)),
                      Text(
                        'Booking ID: ${booking.bookingId}',
                        style: TextStyle(color: Colors.green, fontSize: scale.getScaledFont(10)),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: scale.getScaledWidth(10),
                    vertical: scale.getScaledHeight(4),
                  ),
                  decoration: BoxDecoration(
                    color: Colors.green.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'Confirmed',
                    style: TextStyle(
                      color: Colors.green,
                      fontSize: scale.getScaledFont(11),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Divider(color: Color(0xff1E2939), height: 1, thickness: 1),
          Padding(
            padding: EdgeInsets.fromLTRB(
              scale.getScaledWidth(14), scale.getScaledHeight(10),
              scale.getScaledWidth(14), scale.getScaledHeight(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _BulletRow(text: 'Date & Time : ${booking.dateTime}', scale: scale),
                SizedBox(height: scale.getScaledHeight(5)),
                _BulletRow(text: 'Location : ${booking.location}', scale: scale),
                SizedBox(height: scale.getScaledHeight(5)),
                _BulletRow(text: 'Service Type :', scale: scale),
                ...booking.serviceTypes.map(
                      (s) => Padding(
                    padding: EdgeInsets.only(
                      left: scale.getScaledWidth(14),
                      top: scale.getScaledHeight(3),
                    ),
                    child: _BulletRow(text: s, scale: scale),
                  ),
                ),
              ],
            ),
          ),
          Divider(color: Color(0xff1E2939), height: 1, thickness: 1),
          InkWell(
            onTap: () => controller.onBookingDetailsTap(booking.bookingId),
            borderRadius: const BorderRadius.vertical(bottom: Radius.circular(12)),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: scale.getScaledWidth(14),
                vertical: scale.getScaledHeight(11),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: scale.getScaledWidth(12),
                      vertical: scale.getScaledHeight(5),
                    ),
                    decoration: BoxDecoration(
                      color: Color(0xff1E2939),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      'Payment : ${booking.paymentStatus}',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.8),
                        fontSize: scale.getScaledFont(11),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  Icon(
                    Icons.arrow_forward_rounded,
                    color: Colors.white.withValues(alpha: 0.7),
                    size: scale.getScaledWidth(18),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Bullet Row ────────────────────────────────────────────────────────────────
class _BulletRow extends StatelessWidget {
  final String text;
  final ScalingUtility scale;
  const _BulletRow({required this.text, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('• ', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 13)),
        Expanded(
          child: Text(
            text,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
              fontSize: scale.getScaledFont(11),
              height: 1.4,
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Special Offer Card ────────────────────────────────────────────────────────
class _SpecialOfferCard extends StatelessWidget {
  final CustomerDashboardController controller;
  final ScalingUtility scale;
  const _SpecialOfferCard({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(scale.getScaledWidth(16)),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Image.asset(AppImages.giftIcon, width: scale.getScaledWidth(20), height: scale.getScaledHeight(20)),
              SizedBox(width: scale.getScaledWidth(6)),
              Text(
                'Limited Offer',
                style: TextStyle(color: Color(0xffBF00FF), fontSize: scale.getScaledFont(12), fontWeight: FontWeight.w600),
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(10)),
          Text(
            'Wedding Season Special Offer 🎊',
            style: TextStyle(color: Colors.white, fontSize: scale.getScaledFont(15), fontWeight: FontWeight.bold),
          ),
          SizedBox(height: scale.getScaledHeight(6)),
          Text(
            'Get 20% off on all wedding packages. Book before March 31st!',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontSize: scale.getScaledFont(11), height: 1.5),
          ),
          SizedBox(height: scale.getScaledHeight(16)),
          InkWell(
            onTap: controller.onClaimOffer,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: EdgeInsets.symmetric(vertical: scale.getScaledHeight(12)),
              decoration: BoxDecoration(
                color: Color(0xff291349),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Center(
                child: Text(
                  'Claim Offer',
                  style: TextStyle(color: Colors.white, fontSize: scale.getScaledFont(14), fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}