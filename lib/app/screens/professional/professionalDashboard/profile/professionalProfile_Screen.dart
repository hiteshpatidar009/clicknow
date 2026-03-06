import 'package:clicknow/app/screens/professional/professionalDashboard/profile/getx/professionalProfile_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfessionalProfileScreen extends StatelessWidget {
  const ProfessionalProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(ProfessionalProfileController());

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
                // ── Page Title ──
                Text(
                  'My Profile',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(20),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(20)),

                // ── Profile Card ──
                _ProfileCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(16)),

                // ── Professional Information Section ──
                _MenuSection(
                  title: 'Professional Information',
                  scale: scale,
                  items: [
                    _MenuItem(
                      label: 'Edit Professional Information',
                      onTap: controller.onEditProfessionalInfo,
                      scale: scale,
                    ),
                    _MenuItem(
                      label: 'Availability & Schedule',
                      onTap: controller.onAvailabilitySchedule,
                      scale: scale,
                      showDivider: false,
                    ),
                  ],
                ),
                SizedBox(height: scale.getScaledHeight(16)),

                // ── Document & Banking Section ──
                _MenuSection(
                  title: 'Document & Banking',
                  scale: scale,
                  items: [
                    _MenuItem(
                      label: 'Document Status',
                      onTap: controller.onDocumentStatus,
                      scale: scale,
                      badge: 'Approved',
                    ),
                    _MenuItem(
                      label: 'Bank Details',
                      onTap: controller.onBankDetails,
                      scale: scale,
                      showDivider: false,
                    ),
                  ],
                ),
                SizedBox(height: scale.getScaledHeight(16)),

                // ── Account Settings Section ──
                _MenuSection(
                  title: 'Account Settings',
                  scale: scale,
                  items: [
                    _MenuItem(
                      label: 'Settings',
                      onTap: controller.onSettings,
                      scale: scale,
                      showDivider: false,
                    ),
                  ],
                ),
                SizedBox(height: scale.getScaledHeight(24)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Profile Card ──────────────────────────────────────────────────────────────
class _ProfileCard extends StatelessWidget {
  final ProfessionalProfileController controller;
  final ScalingUtility scale;
  const _ProfileCard({required this.controller, required this.scale});

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
          // Profile Image
          Container(
            width: scale.getScaledWidth(56),
            height: scale.getScaledHeight(56),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0xff2A1F4E),
              border: Border.all(
                color: Color(0xff1E2939).withValues(alpha: 0.4),
                width: 2,
              ),
            ),
            child: ClipOval(
              child: Image.asset(
                AppImages.avtar2,
                fit: BoxFit.cover,
              ),
            ),
          ),
          SizedBox(width: scale.getScaledWidth(14)),

          // Name + Badge
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
              SizedBox(height: scale.getScaledHeight(5)),
              if (controller.isApprovedProfessional.value)
                Row(
                  children: [
                    Icon(Icons.check_circle,
                        color: Colors.green, size: 13),
                    SizedBox(width: scale.getScaledWidth(4)),
                    Text(
                      'Approved Professional',
                      style: TextStyle(
                        color: Colors.green,
                        fontSize: scale.getScaledFont(11),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
            ],
          ),
        ],
      )),
    );
  }
}

// ─── Menu Section ──────────────────────────────────────────────────────────────
class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;
  final ScalingUtility scale;

  const _MenuSection({
    required this.title,
    required this.items,
    required this.scale,
  });

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
              title,
              style: TextStyle(
                color: Colors.white,
                fontSize: scale.getScaledFont(13),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          // Menu Items
          ...items,
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
  final String? badge;
  final bool showDivider;

  const _MenuItem({
    required this.label,
    required this.onTap,
    required this.scale,
    this.badge,
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

                // Optional badge
                if (badge != null) ...[
                  Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: scale.getScaledWidth(10),
                      vertical: scale.getScaledHeight(3),
                    ),
                    decoration: BoxDecoration(
                      color: Colors.transparent,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.green, width: 1.2),
                    ),
                    child: Text(
                      badge!,
                      style: TextStyle(
                        color: Colors.green,
                        fontSize: scale.getScaledFont(10),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  SizedBox(width: scale.getScaledWidth(8)),
                ],

                // Arrow icon
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