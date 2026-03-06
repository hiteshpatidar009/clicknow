import 'package:clicknow/app/screens/customer/profile/getx/customerProfile_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomerProfileScreen extends StatelessWidget {
  const CustomerProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(CustomerProfileController());

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
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Page Title ──
                Text(
                  'My Profile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(20),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(4)),
                Text(
                  'Manage your account and preferences',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.55),
                    fontSize: scale.getScaledFont(12),
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(20)),

                // ── User Info Card ──
                _UserInfoCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(16)),

                // ── General Settings Card ──
                _GeneralSettingsCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(16)),

                // ── Your Stats Card ──
                _YourStatsCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(24)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── User Info Card ────────────────────────────────────────────────────────────
class _UserInfoCard extends StatelessWidget {
  final CustomerProfileController controller;
  final ScalingUtility scale;
  const _UserInfoCard({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: scale.getScaledWidth(14),
        vertical: scale.getScaledHeight(14),
      ),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Obx(() => Row(
        children: [
          // Avatar
          Container(
            width: scale.getScaledWidth(54),
            height: scale.getScaledHeight(54),
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
          SizedBox(width: scale.getScaledWidth(14)),

          // Name + Email
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                controller.userName.value,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: scale.getScaledFont(16),
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: scale.getScaledHeight(4)),
              Text(
                controller.userEmail.value,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.55),
                  fontSize: scale.getScaledFont(11),
                ),
              ),
            ],
          ),
        ],
      )),
    );
  }
}

// ─── General Settings Card ─────────────────────────────────────────────────────
class _GeneralSettingsCard extends StatelessWidget {
  final CustomerProfileController controller;
  final ScalingUtility scale;
  const _GeneralSettingsCard({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Section Title
          Padding(
            padding: EdgeInsets.fromLTRB(
              scale.getScaledWidth(14),
              scale.getScaledHeight(14),
              scale.getScaledWidth(14),
              scale.getScaledHeight(12),
            ),
            child: Text(
              'General Settings',
              style: TextStyle(
                color: Colors.white,
                fontSize: scale.getScaledFont(13),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          // Menu Items
          _MenuItem(
            label: 'Edit Professional Information',
            onTap: controller.onEditProfessionalInfo,
            scale: scale,
          ),
          _MenuItem(
            label: 'Invoice History',
            onTap: controller.onInvoiceHistory,
            scale: scale,
          ),
          _MenuItem(
            label: 'Saved Address',
            onTap: controller.onSavedAddress,
            scale: scale,
          ),
          _MenuItem(
            label: 'Settings',
            onTap: controller.onSettings,
            scale: scale,
            showDivider: false,
          ),
        ],
      ),
    );
  }
}

// ─── Menu Item ─────────────────────────────────────────────────────────────────
class _MenuItem extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final ScalingUtility scale;
  final bool showDivider;

  const _MenuItem({
    required this.label,
    required this.onTap,
    required this.scale,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (showDivider)
          Divider(
            color: Color(0xff1E2939),
            height: 1,
            thickness: 1,
            indent: 14,
            endIndent: 14,
          ),
        InkWell(
          onTap: onTap,
          borderRadius: showDivider
              ? BorderRadius.zero
              : const BorderRadius.vertical(bottom: Radius.circular(12)),
          child: Padding(
            padding: EdgeInsets.symmetric(
              horizontal: scale.getScaledWidth(14),
              vertical: scale.getScaledHeight(14),
            ),
            child: Row(
              children: [
                // Phone icon
                Icon(
                  Icons.phone_in_talk,
                  color: Color(0xffBF00FF),
                  size: scale.getScaledWidth(18),
                ),
                SizedBox(width: scale.getScaledWidth(12)),

                // Label
                Expanded(
                  child: Text(
                    label,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.85),
                      fontSize: scale.getScaledFont(13),
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),

                // Arrow
                Icon(
                  Icons.chevron_right_rounded,
                  color: Colors.white.withValues(alpha: 0.5),
                  size: scale.getScaledWidth(20),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Your Stats Card ───────────────────────────────────────────────────────────
class _YourStatsCard extends StatelessWidget {
  final CustomerProfileController controller;
  final ScalingUtility scale;
  const _YourStatsCard({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(scale.getScaledWidth(16)),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your Stats',
            style: TextStyle(
              color: Colors.white,
              fontSize: scale.getScaledFont(13),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(18)),

          // Stats Row
          Obx(() => Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(
                value: controller.totalBookings.value,
                label: 'Bookings',
                scale: scale,
                valueColor: Color(0xffBF00FF),
              ),
              _StatItem(
                value: controller.totalSpent.value,
                label: 'Spent',
                scale: scale,
                valueColor: Color(0xffBF00FF),
              ),
              _StatItem(
                value: controller.totalRatings.value,
                label: 'Ratings',
                scale: scale,
                valueColor: Color(0xffBF00FF),
              ),
            ],
          )),
          SizedBox(height: scale.getScaledHeight(4)),
        ],
      ),
    );
  }
}

// ─── Stat Item ─────────────────────────────────────────────────────────────────
class _StatItem extends StatelessWidget {
  final String value;
  final String label;
  final ScalingUtility scale;
  final Color valueColor;

  const _StatItem({
    required this.value,
    required this.label,
    required this.scale,
    required this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: valueColor,
            fontSize: scale.getScaledFont(22),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: scale.getScaledHeight(5)),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.55),
            fontSize: scale.getScaledFont(11),
          ),
        ),
      ],
    );
  }
}