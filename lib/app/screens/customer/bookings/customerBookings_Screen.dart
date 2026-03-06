import 'package:clicknow/app/screens/customer/bookings/getx/customerBookings_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomerBookingsScreen extends StatelessWidget {
  const CustomerBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(CustomerBookingsController());

    /// -- Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return Container(
      height: double.maxFinite,
      width: double.maxFinite,
      decoration: BoxDecoration(gradient: AppColors.primaryGradient),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Page Title ──
              Padding(
                padding: EdgeInsets.fromLTRB(
                  16,
                  scale.getScaledHeight(14),
                  16,
                  0,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'My Bookings',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: scale.getScaledFont(20),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: scale.getScaledHeight(4)),
                    Text(
                      'View and manage your event bookings',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.55),
                        fontSize: scale.getScaledFont(12),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: scale.getScaledHeight(20)),

              // ── Filter Tabs ──
              _FilterTabs(controller: controller, scale: scale),
              SizedBox(height: scale.getScaledHeight(16)),

              // ── Bookings List ──
              Expanded(
                child: _BookingsList(controller: controller, scale: scale),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Filter Tabs ───────────────────────────────────────────────────────────────
class _FilterTabs extends StatelessWidget {
  final CustomerBookingsController controller;
  final ScalingUtility scale;
  const _FilterTabs({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: scale.getScaledWidth(16)),
      child: Obx(
        () => Row(
          children: List.generate(controller.tabs.length, (i) {
            final isSelected = controller.selectedTabIndex.value == i;
            return Expanded(
              child: GestureDetector(
                onTap: () => controller.selectTab(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: EdgeInsets.only(
                    right: i < controller.tabs.length - 1
                        ? scale.getScaledWidth(8)
                        : 0,
                  ),
                  padding: EdgeInsets.symmetric(
                    vertical: scale.getScaledHeight(11),
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? Color(0xffBF00FF)
                        : Color(0xff1C1736).withValues(alpha: 0.8),
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(
                      color: isSelected ? Color(0xffBF00FF) : Color(0xff1E2939),
                    ),
                  ),
                  child: Center(
                    child: Text(
                      controller.tabs[i].label,
                      style: TextStyle(
                        color: isSelected
                            ? Colors.white
                            : Colors.white.withValues(alpha: 0.6),
                        fontSize: scale.getScaledFont(13),
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.w500,
                      ),
                    ),
                  ),
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}

// ─── Bookings List ─────────────────────────────────────────────────────────────
class _BookingsList extends StatelessWidget {
  final CustomerBookingsController controller;
  final ScalingUtility scale;
  const _BookingsList({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final bookings = controller.filteredBookings;

      if (bookings.isEmpty) {
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.event_busy_outlined,
                color: Colors.white.withValues(alpha: 0.3),
                size: scale.getScaledWidth(60),
              ),
              SizedBox(height: scale.getScaledHeight(12)),
              Text(
                'No bookings found',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.4),
                  fontSize: scale.getScaledFont(14),
                ),
              ),
            ],
          ),
        );
      }

      return ListView.separated(
        padding: EdgeInsets.fromLTRB(16, 0, 16, scale.getScaledHeight(24)),
        itemCount: bookings.length,
        separatorBuilder: (_, _) => SizedBox(height: scale.getScaledHeight(14)),
        itemBuilder: (_, i) => _BookingCard(
          booking: bookings[i],
          controller: controller,
          scale: scale,
        ),
      );
    });
  }
}

// ─── Booking Card ──────────────────────────────────────────────────────────────
class _BookingCard extends StatelessWidget {
  final CustomerBookingModel booking;
  final CustomerBookingsController controller;
  final ScalingUtility scale;

  const _BookingCard({
    required this.booking,
    required this.controller,
    required this.scale,
  });

  @override
  Widget build(BuildContext context) {
    final statusLabel = controller.bookingStatusLabel(booking.title);
    final statusColor = controller.bookingStatusColor(booking.title);
    final statusBg = controller.bookingStatusBgColor(booking.title);

    return Container(
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Card Header ──
          Padding(
            padding: EdgeInsets.fromLTRB(
              scale.getScaledWidth(14),
              scale.getScaledHeight(14),
              scale.getScaledWidth(14),
              scale.getScaledHeight(10),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title + Booking ID
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        booking.title,
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: scale.getScaledFont(14),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      SizedBox(height: scale.getScaledHeight(4)),
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

                // Status Badge
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: scale.getScaledWidth(10),
                    vertical: scale.getScaledHeight(4),
                  ),
                  decoration: BoxDecoration(
                    color: statusBg,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    statusLabel,
                    style: TextStyle(
                      color: statusColor,
                      fontSize: scale.getScaledFont(11),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),

          Divider(color: Color(0xff1E2939), height: 1, thickness: 1),

          // ── Bullet Details ──
          Padding(
            padding: EdgeInsets.fromLTRB(
              scale.getScaledWidth(14),
              scale.getScaledHeight(10),
              scale.getScaledWidth(14),
              scale.getScaledHeight(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Date & Time
                _BulletRow(
                  text: 'Date & Time : ${booking.dateTime}',
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(5)),

                // Location
                _BulletRow(
                  text: 'Location : ${booking.location}',
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(5)),

                // Service Type label
                _BulletRow(text: 'Service Type :', scale: scale),

                // Sub-bullet service types
                ...booking.serviceTypes.map(
                  (s) => Padding(
                    padding: EdgeInsets.only(
                      left: scale.getScaledWidth(14),
                      top: scale.getScaledHeight(4),
                    ),
                    child: _BulletRow(text: s, scale: scale),
                  ),
                ),
              ],
            ),
          ),

          Divider(color: Color(0xff1E2939), height: 1, thickness: 1),

          // ── Payment Status + Arrow ──
          InkWell(
            onTap: () => controller.onBookingDetails(booking.bookingId),
            borderRadius: const BorderRadius.vertical(
              bottom: Radius.circular(12),
            ),
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
        Text(
          '• ',
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.5),
            fontSize: 13,
          ),
        ),
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
