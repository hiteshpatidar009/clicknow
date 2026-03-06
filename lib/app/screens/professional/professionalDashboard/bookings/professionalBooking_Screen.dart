import 'package:clicknow/app/screens/professional/professionalDashboard/bookings/getx/professionalBookings_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfessionalBookingsScreen extends StatelessWidget {
  const ProfessionalBookingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(ProfessionalBookingsController());

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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Page Title ──
              Padding(
                padding: EdgeInsets.fromLTRB(16, scale.getScaledHeight(14), 16, 0),
                child: Text(
                  'My Bookings',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(20),
                    fontWeight: FontWeight.bold,
                  ),
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
  final ProfessionalBookingsController controller;
  final ScalingUtility scale;
  const _FilterTabs({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.symmetric(horizontal: scale.getScaledWidth(16)),
      child: Obx(() => Row(
        children: List.generate(
          controller.tabs.length,
              (i) {
            final isSelected = controller.selectedTabIndex.value == i;
            return GestureDetector(
              onTap: () => controller.selectTab(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: EdgeInsets.only(right: scale.getScaledWidth(8)),
                padding: EdgeInsets.symmetric(
                  horizontal: scale.getScaledWidth(18),
                  vertical: scale.getScaledHeight(8),
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Color(0xffBF00FF)
                      : Color(0xff1C1736).withValues(alpha: 0.8),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? Color(0xffBF00FF)
                        : Color(0xff1E2939),
                  ),
                ),
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
            );
          },
        ),
      )),
    );
  }
}

// ─── Bookings List ─────────────────────────────────────────────────────────────
class _BookingsList extends StatelessWidget {
  final ProfessionalBookingsController controller;
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
        padding: EdgeInsets.fromLTRB(
          16,
          0,
          16,
          scale.getScaledHeight(24),
        ),
        itemCount: bookings.length,
        separatorBuilder: (_, __) =>
            SizedBox(height: scale.getScaledHeight(14)),
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
  final BookingItemModel booking;
  final ProfessionalBookingsController controller;
  final ScalingUtility scale;

  const _BookingCard({
    required this.booking,
    required this.controller,
    required this.scale,
  });

  @override
  Widget build(BuildContext context) {
    final statusLabel = controller.statusLabel(booking.status);
    final statusColor = controller.statusColor(booking.status);
    final statusBg = controller.statusBgColor(booking.status);

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

          // ── Divider ──
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
              children: [
                _BulletRow(
                  label: 'Customer : ',
                  value: booking.customerName,
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(5)),
                _BulletRow(
                  label: 'Service Type : ',
                  value: booking.serviceType,
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(5)),
                _BulletRow(
                  label: 'Date & Time : ',
                  value: booking.dateTime,
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(5)),
                _BulletRow(
                  label: 'Location : ',
                  value: booking.location,
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(5)),
                _BulletRow(
                  label: 'Booking Amount : ',
                  value: booking.bookingAmount,
                  scale: scale,
                  valueColor: Colors.green,
                  valueBold: true,
                ),
              ],
            ),
          ),

          // ── Divider ──
          Divider(color: Color(0xff1E2939), height: 1, thickness: 1),

          // ── See Details Row ──
          InkWell(
            onTap: () => controller.onSeeDetails(booking.bookingId),
            borderRadius: const BorderRadius.vertical(
              bottom: Radius.circular(12),
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: scale.getScaledWidth(14),
                vertical: scale.getScaledHeight(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'See Details',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: scale.getScaledFont(13),
                      fontWeight: FontWeight.w500,
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
  final String label;
  final String value;
  final ScalingUtility scale;
  final Color? valueColor;
  final bool valueBold;

  const _BulletRow({
    required this.label,
    required this.value,
    required this.scale,
    this.valueColor,
    this.valueBold = false,
  });

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
          child: RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: label,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: scale.getScaledFont(11),
                  ),
                ),
                TextSpan(
                  text: value,
                  style: TextStyle(
                    color: valueColor ?? Colors.white.withValues(alpha: 0.5),
                    fontSize: scale.getScaledFont(11),
                    fontWeight:
                    valueBold ? FontWeight.w600 : FontWeight.normal,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}