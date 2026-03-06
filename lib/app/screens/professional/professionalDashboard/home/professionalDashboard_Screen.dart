import 'package:clicknow/app/screens/professional/professionalDashboard/home/getx/professionalDashboard_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfessionalDashboardScreen extends StatelessWidget {
  const ProfessionalDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(ProfessionalDashboardController());

    /// --  Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return Container(
      height: double.maxFinite,
      width: double.maxFinite,
      decoration: BoxDecoration(gradient: AppColors.primaryGradient),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Header(controller: controller, scale: scale),
                const SizedBox(height: 16),
                _VisibilityCard(controller: controller, scale: scale),
                const SizedBox(height: 22),
                _sectionTitle('Professional Overview Dashboard'),
                const SizedBox(height: 12),
                _StatsGrid(controller: controller, scale: scale),
                const SizedBox(height: 22),
                _sectionTitle('Current Active Bookings'),
                const SizedBox(height: 12),
                _BookingsList(controller: controller, scale: scale),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  static Widget _sectionTitle(String title) => Text(
    title,
    style: const TextStyle(
      color: Colors.white,
      fontSize: 15,
      fontWeight: FontWeight.bold,
      letterSpacing: 0.2,
    ),
  );
}

/// -- App Bar Section
class _Header extends StatelessWidget {
  final ProfessionalDashboardController controller;
  final ScalingUtility scale;
  const _Header({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Obx(
            () => Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hey, ${controller.userName.value}',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(18),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(2)),
                if (controller.isApprovedProfessional.value)
                  Row(
                    children: [
                      Icon(Icons.check_circle, color: Colors.green, size: 14),
                      SizedBox(width: scale.getScaledWidth(5)),
                      Text(
                        'Approved Professional',
                        style: TextStyle(
                          color: Colors.green,
                          fontSize: scale.getScaledFont(10),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
        Obx(
          () => Stack(
            clipBehavior: Clip.none,
            children: [
              Container(
                width: scale.getScaledWidth(36),
                height: scale.getScaledHeight(36),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xffEBEBEB),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Image.asset("assets/icons/bell.png"),
                ),
              ),
              if (controller.notificationCount.value > 0)
                Positioned(
                  right: -2,
                  top: -5,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Color(0xff4C15C2),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${controller.notificationCount.value}',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: scale.getScaledFont(12),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

/// -- Visibility Card
class _VisibilityCard extends StatelessWidget {
  final ProfessionalDashboardController controller;
  final ScalingUtility scale;
  const _VisibilityCard({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 14),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.phone_in_talk,
                color: Color(0xffBF00FF),
                size: 18,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Visibility & Available For Booking.',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(12),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Obx(
                () => Switch(
                  value: controller.isVisibleForBooking.value,
                  onChanged: controller.toggleVisibility,
                  activeThumbColor: Colors.green,
                  activeTrackColor: Colors.green.withValues(alpha: 0.25),
                  inactiveThumbColor: Colors.grey,
                  inactiveTrackColor: Colors.grey.withValues(alpha: 0.25),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(4)),
          Text(
            'Your professional profile is under admin review. Our team is currently reviewing your professional credentials. This usually takes 24-48 hours. You will get notified as we proceed.',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.6),
              fontSize: scale.getScaledFont(10),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Stats Grid ────────────────────────────────────────────────────────────────
class _StatsGrid extends StatelessWidget {
  final ProfessionalDashboardController controller;
  final ScalingUtility scale;
  const _StatsGrid({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: "Today's Booking.",
                  value: '${controller.todaysBookings.value}',
                  subLabel: 'Bookings',
                  scale: scale,
                ),
              ),
              SizedBox(width: scale.getScaledWidth(12)),
              Expanded(
                child: _StatCard(
                  label: 'Upcoming Bookings.',
                  value: '${controller.upcomingBookings.value}',
                  subLabel: 'Bookings',
                  scale: scale,
                ),
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(12)),
          Row(
            children: [
              Expanded(
                child: _StatCard(
                  label: 'Pending Acceptance.',
                  value: '${controller.pendingAcceptance.value}',
                  subLabel: 'Bookings',
                  scale: scale,
                ),
              ),
              SizedBox(width: scale.getScaledWidth(12)),
              Expanded(
                child: _StatCard(
                  label: 'Monthly Revenue.',
                  value: controller.monthlyRevenue.value,
                  subLabel: 'Rs.',
                  isRevenue: true,
                  scale: scale,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String subLabel;
  final bool isRevenue;
  final ScalingUtility scale;

  const _StatCard({
    required this.label,
    required this.value,
    required this.subLabel,
    this.isRevenue = false,
    required this.scale,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Label row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(top: 1),
                child: Icon(
                  Icons.phone_in_talk,
                  color: Color(0xffBF00FF),
                  size: 15,
                ),
              ),
              SizedBox(width: scale.getScaledWidth(6)),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(10)),

          // Value
          if (isRevenue) ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Flexible(
                  child: Text(
                    value,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: scale.getScaledFont(20),
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 3),
                const Padding(
                  padding: EdgeInsets.only(bottom: 2),
                  child: Text(
                    'Rs.',
                    style: TextStyle(
                      color: Color(0xffBF00FF),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 30,
                    fontWeight: FontWeight.bold,
                    height: 1,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  subLabel,
                  style: const TextStyle(
                    color: Color(0xffBF00FF),
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// -- Booking List
class _BookingsList extends StatelessWidget {
  final ProfessionalDashboardController controller;
  final ScalingUtility scale;
  const _BookingsList({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(
      () => Column(
        children: List.generate(
          controller.activeBookings.length,
          (i) => _BookingCard(
            booking: controller.activeBookings[i],
            index: i,
            controller: controller,
            scale: scale,
          ),
        ),
      ),
    );
  }
}

/// -- Booking Card
class _BookingCard extends StatelessWidget {
  final BookingModel booking;
  final int index;
  final ProfessionalDashboardController controller;
  final ScalingUtility scale;

  const _BookingCard({
    required this.booking,
    required this.index,
    required this.controller,
    required this.scale,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Collapsed header ──
            InkWell(
              onTap: () => controller.toggleBookingExpand(index),
              child: Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 14,
                ),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Running Bookings',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: scale.getScaledFont(14),
                            ),
                          ),
                          SizedBox(height: scale.getScaledHeight(6)),
                          Text(
                            'Booking ID: ${booking.bookingId}',
                            style: TextStyle(
                              color: Colors.green,
                              fontSize: scale.getScaledFont(10),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Obx(
                      () => Icon(
                        booking.isExpanded.value
                            ? Icons.keyboard_arrow_up_rounded
                            : Icons.keyboard_arrow_down_rounded,
                        color: Color(0xffFFFFFF).withValues(alpha: 0.6),
                        size: 22,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Expanded body ──
            Obx(() {
              if (!booking.isExpanded.value) return const SizedBox.shrink();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Divider(color: Color(0xff1E2939), height: 1, thickness: 1),
                  Padding(
                    padding: const EdgeInsets.all(14),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Customer name
                        Text(
                          'Customer -  ${booking.customerName}',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                            fontSize: scale.getScaledFont(12),
                          ),
                        ),
                        SizedBox(height: scale.getScaledHeight(10)),

                        // Bullet rows
                        _BulletRow(
                          richContent: [
                            TextSpan(
                              text: 'Event Description: ',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 12,
                              ),
                            ),
                            TextSpan(
                              text: booking.eventDescription.length > 72
                                  ? '${booking.eventDescription.substring(0, 72)}...'
                                  : booking.eventDescription,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                            TextSpan(
                              text: '  more',
                              style: TextStyle(
                                color: Color(0xffBF00FF),
                                fontSize: scale.getScaledFont(11),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                          scale: scale,
                        ),
                        const SizedBox(height: 6),
                        _BulletRow(
                          richContent: [
                            TextSpan(
                              text: 'Service Type : ',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                            TextSpan(
                              text: booking.serviceType,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                          ],
                          scale: scale,
                        ),
                        const SizedBox(height: 6),
                        _BulletRow(
                          richContent: [
                            TextSpan(
                              text: "Date & Time : ",
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                            TextSpan(
                              text: booking.dateTime,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                          ],
                          scale: scale,
                        ),
                        const SizedBox(height: 6),
                        _BulletRow(
                          richContent: [
                            TextSpan(
                              text: 'Event Duration : ',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                            TextSpan(
                              text: booking.eventDuration,
                              style: const TextStyle(
                                color: Colors.green,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            TextSpan(
                              text: ' ${booking.timeLeft}',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.6),
                                fontSize: 12,
                              ),
                            ),
                          ],
                          scale: scale,
                        ),
                        const SizedBox(height: 6),
                        _BulletRow(
                          richContent: [
                            TextSpan(
                              text: 'Location : ',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                            // _value(booking.location),
                            TextSpan(
                              text: booking.location,
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                          ],
                          scale: scale,
                        ),
                        const SizedBox(height: 6),
                        _BulletRow(
                          richContent: [
                            TextSpan(
                              text: 'Booking Amount : ',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: scale.getScaledFont(11),
                              ),
                            ),
                            TextSpan(
                              text: booking.bookingAmount,
                              style: TextStyle(
                                color: Colors.green,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                          scale: scale,
                        ),
                        const SizedBox(height: 16),

                        // ── Action Buttons Row ──
                        Row(
                          children: [
                            Expanded(
                              child: _OutlineButton(
                                icon: Icons.phone_in_talk_outlined,
                                label: 'Contact Customer',
                                onTap: () => controller.contactCustomer(
                                  booking.bookingId,
                                ),
                              ),
                            ),
                            SizedBox(width: scale.getScaledWidth(10)),
                            Expanded(
                              child: _OutlineButton(
                                icon: Icons.phone_in_talk_outlined,
                                label: 'Add More Hours',
                                onTap: () =>
                                    controller.addMoreHours(booking.bookingId),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: scale.getScaledHeight(10)),

                        /// -- End Booking Button
                        InkWell(
                          onTap: () => controller.endBooking(booking.bookingId),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            decoration: BoxDecoration(
                              color: Color(0xff331D37),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: Color(0xff6E2135),
                                width: 1.5,
                              ),
                            ),
                            child: const Center(
                              child: Text(
                                'END BOOKING',
                                style: TextStyle(
                                  color: Color(0xffFD6366),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  letterSpacing: 1.2,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            }),
          ],
        ),
      ),
    );
  }

  // // Helpers for RichText spans
  // static TextSpan _label(String text) => ;

  // static TextSpan _value(String text) => TextSpan(
  //   text: text,
  //   style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: scale.getScaledFont(11)),
  // );
}

// ─── Bullet Row Helper ─────────────────────────────────────────────────────────
class _BulletRow extends StatelessWidget {
  final List<InlineSpan> richContent;
  final ScalingUtility scale;
  const _BulletRow({required this.richContent, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.only(top: 1),
          child: Text(
            '• ',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.5),
              fontSize: 13,
            ),
          ),
        ),
        Expanded(
          child: RichText(
            text: TextSpan(
              children: richContent,
              style: TextStyle(color: Colors.white.withValues(alpha: 0.5)),
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Outline Action Button ─────────────────────────────────────────────────────
class _OutlineButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _OutlineButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 6),
        decoration: BoxDecoration(
          color: Color(0xff291349),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.white, size: 15),
            const SizedBox(width: 5),
            Flexible(
              child: Text(
                label,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
