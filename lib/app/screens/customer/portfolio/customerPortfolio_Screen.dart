import 'package:clicknow/app/screens/customer/portfolio/getx/customerPortfolio_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomerPortfolioScreen extends StatelessWidget {
  const CustomerPortfolioScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = Get.put(CustomerPortfolioController());

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
                  'Our Portfolio',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(22),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(4)),
                Text(
                  'Showcasing excellence in event services',
                  style: TextStyle(
                    color: Colors.white.withValues(alpha: 0.55),
                    fontSize: scale.getScaledFont(12),
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(20)),

                // ── About ClickNow Card ──
                _AboutCard(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(14)),

                // ── Our Mission Card ──
                _InfoCard(
                  title: 'Our Mission',
                  body:
                  'To provide seamless, professional event services that exceed expectations and create lasting memories for our clients.',
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(14)),

                // ── Why Choose Us Card ──
                _WhyChooseUsCard(scale: scale),
                SizedBox(height: scale.getScaledHeight(22)),

                // ── Our Client Experiences ──
                Text(
                  'Our Client Experiences',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(16),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(12)),
                _ReviewSlider(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(22)),

                // ── Media Gallery ──
                Text(
                  'Media Gallery',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(16),
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(12)),
                _GalleryTabs(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(12)),
                _GalleryGrid(controller: controller, scale: scale),
                SizedBox(height: scale.getScaledHeight(24)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── About ClickNow Card ───────────────────────────────────────────────────────
class _AboutCard extends StatelessWidget {
  final CustomerPortfolioController controller;
  final ScalingUtility scale;
  const _AboutCard({required this.controller, required this.scale});

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
            'About ClickNow',
            style: TextStyle(
              color: Colors.white,
              fontSize: scale.getScaledFont(14),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(8)),
          Text(
            'We are India\'s premier event services platform, dedicated to making your special moments truly unforgettable. With years of experience and a team of talented professionals, we bring excellence to every event.',
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.55),
              fontSize: scale.getScaledFont(11),
              height: 1.6,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(18)),

          // ── Stats Row ──
          Obx(() => Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _StatItem(value: controller.eventsCount.value, label: 'Events', scale: scale),
              _StatItem(value: controller.professionalsCount.value, label: 'Professionals', scale: scale),
              _StatItem(value: controller.ratingsCount.value, label: 'Ratings', scale: scale),
            ],
          )),
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
  const _StatItem({required this.value, required this.label, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: Color(0xffBF00FF),
            fontSize: scale.getScaledFont(20),
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: scale.getScaledHeight(4)),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withValues(alpha: 0.7),
            fontSize: scale.getScaledFont(11),
          ),
        ),
      ],
    );
  }
}

// ─── Generic Info Card (Mission) ───────────────────────────────────────────────
class _InfoCard extends StatelessWidget {
  final String title;
  final String body;
  final ScalingUtility scale;
  const _InfoCard({required this.title, required this.body, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
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
            title,
            style: TextStyle(
              color: Colors.white,
              fontSize: scale.getScaledFont(14),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(8)),
          Text(
            body,
            style: TextStyle(
              color: Colors.white.withValues(alpha: 0.55),
              fontSize: scale.getScaledFont(11),
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Why Choose Us Card ────────────────────────────────────────────────────────
class _WhyChooseUsCard extends StatelessWidget {
  final ScalingUtility scale;
  const _WhyChooseUsCard({required this.scale});

  static const _points = [
    'Verified and experienced professionals',
    'Transparent pricing with no hidden costs',
    '24/7 customer support',
    'Quality guaranteed on every service',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
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
            'Why Choose Us?',
            style: TextStyle(
              color: Colors.white,
              fontSize: scale.getScaledFont(14),
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(10)),
          ..._points.map(
                (point) => Padding(
              padding: EdgeInsets.only(bottom: scale.getScaledHeight(7)),
              child: Row(
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
                      point,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.55),
                        fontSize: scale.getScaledFont(11),
                        height: 1.4,
                      ),
                    ),
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

// ─── Review Slider ─────────────────────────────────────────────────────────────
class _ReviewSlider extends StatelessWidget {
  final CustomerPortfolioController controller;
  final ScalingUtility scale;
  const _ReviewSlider({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        SizedBox(
          height: scale.getScaledHeight(160),
          child: Obx(() => PageView.builder(
            onPageChanged: controller.onReviewChanged,
            itemCount: controller.reviews.length,
            itemBuilder: (_, i) {
              final review = controller.reviews[i];
              return _ReviewCard(review: review, scale: scale);
            },
          )),
        ),
        SizedBox(height: scale.getScaledHeight(12)),

        // Dot indicators
        Obx(() => Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            controller.reviews.length,
                (i) => AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              margin: const EdgeInsets.symmetric(horizontal: 3),
              width: controller.currentReviewIndex.value == i ? 22 : 8,
              height: 8,
              decoration: BoxDecoration(
                color: controller.currentReviewIndex.value == i
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

// ─── Review Card ───────────────────────────────────────────────────────────────
class _ReviewCard extends StatelessWidget {
  final ClientReviewModel review;
  final ScalingUtility scale;
  const _ReviewCard({required this.review, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      padding: EdgeInsets.all(scale.getScaledWidth(14)),
      decoration: BoxDecoration(
        color: Color(0xff1C1736).withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Avatar + Name + Rating
          Row(
            children: [
              Container(
                width: scale.getScaledWidth(44),
                height: scale.getScaledHeight(44),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: Color(0xffBF00FF).withValues(alpha: 0.4),
                    width: 2,
                  ),
                ),
                child: ClipOval(
                  child: Image.asset(review.avatarPath, fit: BoxFit.cover),
                ),
              ),
              SizedBox(width: scale.getScaledWidth(10)),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.name,
                      style: TextStyle(
                        color: Color(0xffBF00FF),
                        fontSize: scale.getScaledFont(13),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: scale.getScaledHeight(2)),
                    Text(
                      review.location,
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.5),
                        fontSize: scale.getScaledFont(10),
                      ),
                    ),
                  ],
                ),
              ),

              // Rating
              Row(
                children: [
                  Text(
                    review.rating.toString(),
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: scale.getScaledFont(13),
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(width: scale.getScaledWidth(3)),
                  Icon(Icons.star_rounded, color: Color(0xffF5A623), size: 18),
                ],
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(10)),

          // Review text
          Expanded(
            child: Text(
              review.review,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.55),
                fontSize: scale.getScaledFont(11),
                height: 1.55,
                fontStyle: FontStyle.italic,
              ),
              maxLines: 4,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Gallery Tabs ──────────────────────────────────────────────────────────────
class _GalleryTabs extends StatelessWidget {
  final CustomerPortfolioController controller;
  final ScalingUtility scale;
  const _GalleryTabs({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Obx(() => Row(
        children: List.generate(
          controller.galleryTabs.length,
              (i) {
            final isSelected = controller.selectedGalleryTab.value == i;
            return GestureDetector(
              onTap: () => controller.selectGalleryTab(i),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                margin: EdgeInsets.only(right: scale.getScaledWidth(8)),
                padding: EdgeInsets.symmetric(
                  horizontal: scale.getScaledWidth(16),
                  vertical: scale.getScaledHeight(8),
                ),
                decoration: BoxDecoration(
                  color: isSelected
                      ? Color(0xffBF00FF)
                      : Colors.transparent,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: isSelected
                        ? Color(0xffBF00FF)
                        : Color(0xffBF00FF).withValues(alpha: 0.5),
                  ),
                ),
                child: Text(
                  controller.galleryTabs[i].label,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: scale.getScaledFont(12),
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.w400,
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

// ─── Gallery Grid ──────────────────────────────────────────────────────────────
class _GalleryGrid extends StatelessWidget {
  final CustomerPortfolioController controller;
  final ScalingUtility scale;
  const _GalleryGrid({required this.controller, required this.scale});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final media = controller.filteredMedia;

      if (media.isEmpty) {
        return SizedBox(
          height: scale.getScaledHeight(120),
          child: Center(
            child: Text(
              'No media available',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.4),
                fontSize: scale.getScaledFont(13),
              ),
            ),
          ),
        );
      }

      return GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: scale.getScaledWidth(10),
          mainAxisSpacing: scale.getScaledHeight(10),
          childAspectRatio: 1.0,
        ),
        itemCount: media.length,
        itemBuilder: (_, i) => _GalleryItem(
          item: media[i],
          scale: scale,
        ),
      );
    });
  }
}

// ─── Gallery Item ──────────────────────────────────────────────────────────────
class _GalleryItem extends StatelessWidget {
  final MediaItemModel item;
  final ScalingUtility scale;
  const _GalleryItem({required this.item, required this.scale});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: Image.asset(
        item.imagePath,
        fit: BoxFit.cover,
        width: double.infinity,
        height: double.infinity,
      ),
    );
  }
}