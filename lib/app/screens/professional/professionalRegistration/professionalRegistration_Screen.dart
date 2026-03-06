import 'package:clicknow/app/getx/controllers/professionalRegistrationController.dart';
import 'package:clicknow/app/getx/controllers/stepper_controller.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/horizontal_stepper.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/stepperBody/stepFiveBody_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/stepperBody/stepFourBody_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/stepperBody/stepOneBody_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/stepperBody/stepThreeBody_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/stepperBody/stepTwoBody_Screen.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ProfessionalRegistrationScreen extends StatelessWidget {
  const ProfessionalRegistrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    final StepperController controller =
    Get.put(StepperController());

    Get.put(Professionalregistrationcontroller());

    return Container(
      height: double.maxFinite,
      width: double.maxFinite,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: SafeArea(
          child: SizedBox(
            width: double.maxFinite,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: HorizontalStepper(),
                ),

                const Divider(
                  color: Color(0xff1E2939),
                  thickness: 2,
                ),

                /// BODY SCREENS
                Expanded(
                  child: PageView(
                    controller: controller.pageController,
                    physics:
                    const NeverScrollableScrollPhysics(),
                    children: [
                      StepOneBodyScreen(),
                      StepTwoBodyScreen(),
                      StepThreeBodyScreen(),
                      StepFourBodyScreen(),
                      StepFiveBodyScreen(),
                    ],
                  ),
                ),

                /// ACTION BUTTONS
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    /// -- Need Help? Text
                    Text("Need help? Contact support at", style: TextStyle(color: Colors.white, fontSize: 16,),),

                    /// -- Contact Support Text
                    Text(" support@example.com", style: TextStyle(color: Color(0xff9235B1), fontSize: 16,),),
                  ],
                ),
                const SizedBox(height: 10,),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
