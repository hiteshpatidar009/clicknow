import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_constants/appStrings.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class MusicAndLivePerformanceScreen extends StatelessWidget {
  const MusicAndLivePerformanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    final double imageHeight = scale.getScaledHeight(370);

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          /// --- Scrollable Content
          SingleChildScrollView(
            physics: AlwaysScrollableScrollPhysics(),
            child: Column(
              children: [
                /// --- Background Image
                SizedBox(
                  height: imageHeight, width: double.infinity,
                  child: Image.asset(AppImages.musician, fit: BoxFit.cover,),
                ),

                /// -- Body Content
                Container(
                  width: double.infinity,
                  decoration: const BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16),),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16,),
                  child: _BodyContent(scale: scale),
                ),
              ],
            ),
          ),

          /// --- AppBar overlay
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  InkWell(
                    onTap: ()=> Get.back(),
                    child: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  SizedBox(width: scale.getScaledWidth(12)),
                  Expanded(
                    child: Text(
                      "Music & Live Performance",
                      style: TextStyle(
                        fontSize: scale.getScaledFont(18),
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
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

class _BodyContent extends StatelessWidget {
  final ScalingUtility scale;
  const _BodyContent({required this.scale});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [

        /// --- Premium + Rating
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xffDFE3F6),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text("PREMIUM MANAGED", style: TextStyle(fontSize: scale.getScaledFont(12), fontWeight: FontWeight.w600, color: const Color(0xff0007A1),),
              ),
            ),
            const Spacer(),
            const Icon(Icons.star, color: Color(0xffFFC107)),
            const SizedBox(width: 6),
            Text("4.0 (120+ Bookings)", style: TextStyle(fontSize: scale.getScaledFont(14), color: const Color(0xffFFC107), fontWeight: FontWeight.bold,),),
          ],
        ),
        const SizedBox(height: 12),

        Text(AppStrings.photographyTitle, style: TextStyle(fontSize: scale.getScaledFont(16), color: Colors.white, fontWeight: FontWeight.bold,),),
        const SizedBox(height: 6),

        Text(AppStrings.photographyDescription, style: TextStyle(fontSize: scale.getScaledFont(12), color: Colors.white.withValues(alpha: 0.6),),),
        const SizedBox(height: 16),

        ServiceContainers(scale: scale, icon: Icons.verified_user, cardTitle: "Professional Photographers", cardDescription: AppStrings.photographyBackgroundCheck,),
        const SizedBox(height: 10),
        ServiceContainers(scale: scale, icon: Icons.camera_alt_outlined, cardTitle: AppStrings.photographyUseCaseTile1, cardDescription: AppStrings.photographyUseCaseDescription1,),
        const SizedBox(height: 10),
        ServiceContainers(scale: scale, icon: Icons.camera_alt_outlined, cardTitle: AppStrings.photographyUseCaseTile2, cardDescription: AppStrings.photographyUseCaseDescription2,),
        const SizedBox(height: 10),
        ServiceContainers(scale: scale, icon: Icons.camera_alt_outlined, cardTitle: AppStrings.photographyUseCaseTile3, cardDescription: AppStrings.photographyUseCaseDescription3,),
        const SizedBox(height: 10),
        ServiceContainers(scale: scale, icon: Icons.camera_alt_outlined, cardTitle: AppStrings.photographyUseCaseTile4, cardDescription: AppStrings.photographyUseCaseDescription4,),

        /// -- Our Process Section
        OurProcessSection(scale: scale),

        /// -- Starting From
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(AppStrings.startingFrom, style: TextStyle(fontSize: scale.getScaledFont(16), color: Colors.white, fontWeight: FontWeight.bold,),),
            Text(AppStrings.photographyStartingFromRupee, style: TextStyle(fontSize: scale.getScaledFont(16), color: Colors.white, fontWeight: FontWeight.bold,),),
          ],
        ),

        /// -- Book this Service Button
        SizedBox(
          width: double.infinity,
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xffD9D9D9),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadiusGeometry.circular(6))
              ),
              child: Text("Book this Service", style: TextStyle(fontSize: scale.getScaledFont(16), color: Colors.black, fontWeight: FontWeight.bold,),),
            ),
          ),
        ),
      ],
    );
  }
}

class ServiceContainers extends StatelessWidget {
  const ServiceContainers({
    super.key,
    required this.scale,
    required this.icon,
    required this.cardTitle,
    required this.cardDescription,
  });

  final ScalingUtility scale;
  final IconData icon;
  final String cardTitle;
  final String cardDescription;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.6),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: Colors.white.withValues(alpha: 0.6)),
          SizedBox(width: scale.getScaledWidth(10)),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  cardTitle,
                  style: TextStyle(
                    fontSize: scale.getScaledFont(12),
                    fontWeight: FontWeight.bold,
                    color: Colors.white.withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  cardDescription,
                  style: TextStyle(
                    fontSize: scale.getScaledFont(10),
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class OurProcessSection extends StatelessWidget {
  const OurProcessSection({super.key, required this.scale,});

  final ScalingUtility scale;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      color: Colors.black,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text("Our Process", style: TextStyle(color: Colors.white, fontSize: scale.getScaledFont(14), fontWeight: FontWeight.bold,),),
          SizedBox(height: scale.getScaledHeight(10)),
          // -- Process Step 1
          ProcessStep(scale: scale, stepNumber: "1", title: AppStrings.photographyProcessStep1, description: AppStrings.photographyUseCaseDescription1, isLast: false,),
          // -- Process Step 2
          ProcessStep(scale: scale, stepNumber: "2", title: AppStrings.photographyProcessStep2, description: AppStrings.photographyProcessStepDescription2, isLast: false,),
          // -- Process Step 3
          ProcessStep(scale: scale, stepNumber: "3", title: AppStrings.photographyProcessStep3, description: AppStrings.photographyProcessStepDescription3, isLast: true,),
        ],
      ),
    );
  }
}

class ProcessStep extends StatelessWidget {
  final String stepNumber;
  final String title;
  final String description;
  final bool isLast;
  final ScalingUtility scale;

  const ProcessStep({
    super.key,
    required this.stepNumber,
    required this.title,
    required this.description,
    required this.isLast,
    required this.scale
  });

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Left Timeline Indicator
          Column(
            children: [
              Container(
                width: 36, height: 36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 1.5),
                ),
                alignment: Alignment.center,
                child: Text(stepNumber, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold,),),
              ),
              if (!isLast)
                Expanded(child: Container(width: 1.5, color: Colors.white,),),
            ],
          ),

          const SizedBox(width: 16),

          // Right Content
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: scale.getScaledHeight(14)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: Colors.white, fontSize: scale.getScaledFont(14), fontWeight: FontWeight.w600,),),
                  const SizedBox(height: 6),
                  Text(description, style: TextStyle(color: Colors.white70, fontSize: scale.getScaledFont(12),),),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


