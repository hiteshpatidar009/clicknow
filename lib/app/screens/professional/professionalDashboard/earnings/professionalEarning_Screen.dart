import 'package:clicknow/app/screens/professional/professionalDashboard/earnings/getx/professionalEarnings_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfessionalEarningsScreen extends StatelessWidget {
  const ProfessionalEarningsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(ProfessionalEarningsController());

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
                  'My Earnings',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(20),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(20)),

                // ── Stats 2x2 Grid ──
                _StatsGrid(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(12)),

                // ── Commission Paid Row ──
                _CommissionRow(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(16)),

                // ── Monthly Overview Chart ──
                _MonthlyOverviewCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(32)),

                // ── View Payment History Button ──
                _ViewPaymentHistoryButton(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(24)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Stats 2x2 Grid ────────────────────────────────────────────────────────────
class _StatsGrid extends StatelessWidget {
  final ProfessionalEarningsController controller;
  final ScalingUtility scale;
  const _StatsGrid({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(() => Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _EarningsStatCard(
                label: 'Total Revenue.',
                value: controller.totalRevenue.value,
                scale: scale,
              ),
            ),
            SizedBox(width: scale.getScaledWidth(12)),
            Expanded(
              child: _EarningsStatCard(
                label: 'This Monthly Revenue.',
                value: controller.thisMonthRevenue.value,
                scale: scale,
              ),
            ),
          ],
        ),
        SizedBox(height: scale.getScaledHeight(12)),
        Row(
          children: [
            Expanded(
              child: _EarningsStatCard(
                label: 'Pending Payout.',
                value: controller.pendingPayout.value,
                scale: scale,
              ),
            ),
            SizedBox(width: scale.getScaledWidth(12)),
            Expanded(
              child: _EarningsStatCard(
                label: 'Settled Amount.',
                value: controller.settledAmount.value,
                scale: scale,
              ),
            ),
          ],
        ),
      ],
    ));
  }
}

// ─── Earnings Stat Card ────────────────────────────────────────────────────────
class _EarningsStatCard extends StatelessWidget {
  final String label;
  final String value;
  final ScalingUtility scale;

  const _EarningsStatCard({
    required this.label,
    required this.value,
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
          // Label row with icon
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(top: 1),
                child: Icon(Icons.phone_in_talk,
                    color: Color(0xffBF00FF), size: 15),
              ),
              SizedBox(width: scale.getScaledWidth(6)),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(12),
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(10)),

          // Value with Rs. suffix
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Flexible(
                child: Text(
                  value,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(22),
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
        ],
      ),
    );
  }
}

// ─── Commission Paid Row ───────────────────────────────────────────────────────
class _CommissionRow extends StatelessWidget {
  final ProfessionalEarningsController controller;
  final ScalingUtility scale;
  const _CommissionRow({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(() => Container(
      padding: EdgeInsets.symmetric(
        horizontal: 14,
        vertical: scale.getScaledHeight(14),
      ),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Row(
        children: [
          const Icon(Icons.phone_in_talk,
              color: Color(0xffBF00FF), size: 15),
          SizedBox(width: scale.getScaledWidth(8)),
          Expanded(
            child: Text(
              'Commission Paid',
              style: TextStyle(
                color: Colors.white,
                fontSize: scale.getScaledFont(13),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: controller.commissionPaid.value,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(14),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const TextSpan(
                  text: 'Rs.',
                  style: TextStyle(
                    color: Color(0xffBF00FF),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ));
  }
}

// ─── Monthly Overview Card ─────────────────────────────────────────────────────
class _MonthlyOverviewCard extends StatelessWidget {
  final ProfessionalEarningsController controller;
  final ScalingUtility scale;
  const _MonthlyOverviewCard(
      {required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title + underline
          Text(
            'Montly Overview',
            style: TextStyle(
              color: Colors.white,
              fontSize: scale.getScaledFont(15),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(4)),
          Container(
            width: 36,
            height: 2.5,
            decoration: BoxDecoration(
              color: Colors.cyan,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          SizedBox(height: scale.getScaledHeight(16)),

          // Chart — monthlyData is loaded once in onInit, no reactive update needed
          _BarChart(data: controller.monthlyData, scale: scale),
          SizedBox(height: scale.getScaledHeight(12)),

          // Legend
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _LegendItem(color: const Color(0xff5B5BFF), label: 'Revenue', scale: scale),
              SizedBox(width: scale.getScaledWidth(20)),
              _LegendItem(color: const Color(0xff00C896), label: 'Payout', scale: scale),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Bar Chart (Custom Painter) ────────────────────────────────────────────────
class _BarChart extends StatelessWidget {
  final List<MonthlyData> data;
  final ScalingUtility scale;
  const _BarChart({required this.data, required this.scale});

  @override
  Widget build(BuildContext context) {
    if (data.isEmpty) return const SizedBox.shrink();

    const double chartHeight = 180;
    const double maxValue = 100;
    const double yAxisWidth = 36;
    const double barGroupWidth = 28;
    const double barWidth = 10;
    const double barSpacing = 4;

    // Y-axis labels
    final yLabels = ['0', '20', '40', '60', '80', '100'];

    return SizedBox(
      height: chartHeight + 30, // +30 for x-axis labels
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Y-axis labels
          SizedBox(
            width: yAxisWidth,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: yLabels.reversed
                  .map((l) => Padding(
                padding: const EdgeInsets.only(right: 6),
                child: Text(
                  l,
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.5),
                    fontSize: scale.getScaledFont(9),
                  ),
                ),
              ))
                  .toList(),
            ),
          ),

          // Chart area
          Expanded(
            child: CustomPaint(
              painter: _GridPainter(),
              child: Column(
                children: [
                  Expanded(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: data.map((d) {
                        final revH =
                            (d.revenue / maxValue) * (chartHeight - 20);
                        final payH =
                            (d.payout / maxValue) * (chartHeight - 20);
                        return SizedBox(
                          width: barGroupWidth,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              // Revenue bar
                              Container(
                                width: barWidth,
                                height: revH,
                                decoration: BoxDecoration(
                                  color: const Color(0xff5B5BFF),
                                  borderRadius: const BorderRadius.vertical(
                                    top: Radius.circular(3),
                                  ),
                                ),
                              ),
                              SizedBox(width: barSpacing),
                              // Payout bar
                              Container(
                                width: barWidth,
                                height: payH,
                                decoration: BoxDecoration(
                                  color: const Color(0xff00C896),
                                  borderRadius: const BorderRadius.vertical(
                                    top: Radius.circular(3),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ),

                  // X-axis labels
                  SizedBox(height: scale.getScaledHeight(6)),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: data
                        .map((d) => SizedBox(
                      width: barGroupWidth,
                      child: Text(
                        d.month,
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.6),
                          fontSize: scale.getScaledFont(9),
                        ),
                      ),
                    ))
                        .toList(),
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

// ─── Grid Painter ──────────────────────────────────────────────────────────────
class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.08)
      ..strokeWidth = 1;

    const int lines = 5;
    final double step = (size.height - 24) / lines; // -24 for x-label space

    for (int i = 0; i <= lines; i++) {
      final y = i * step;
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ─── Legend Item ───────────────────────────────────────────────────────────────
class _LegendItem extends StatelessWidget {
  final Color color;
  final String label;
  final ScalingUtility scale;
  const _LegendItem(
      {required this.color, required this.label, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 14,
          height: 14,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(3),
          ),
        ),
        SizedBox(width: scale.getScaledWidth(6)),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.8),
            fontSize: scale.getScaledFont(11),
          ),
        ),
      ],
    );
  }
}

// ─── View Payment History Button ───────────────────────────────────────────────
class _ViewPaymentHistoryButton extends StatelessWidget {
  final ProfessionalEarningsController controller;
  final ScalingUtility scale;
  const _ViewPaymentHistoryButton(
      {required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: controller.viewPaymentHistory,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.symmetric(vertical: scale.getScaledHeight(18)),
        decoration: BoxDecoration(
          color: Color(0xff360248),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Text(
            'View Payment History',
            style: TextStyle(
              color: Colors.white,
              fontSize: scale.getScaledFont(16),
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}