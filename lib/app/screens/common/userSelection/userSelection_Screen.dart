import 'package:clicknow/app/routes/appRoutes.dart';
import 'package:clicknow/app/services/auth_storage.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_constants/appStrings.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class UserSelectionScreen extends StatelessWidget {
  UserSelectionScreen({super.key});

  final AuthStorage _storage = AuthStorage();

  @override
  Widget build(BuildContext context) {
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return Container(
      height: double.maxFinite,
      width: double.maxFinite,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Scaffold(
        backgroundColor: AppColors.transparent,
        body: SafeArea(
          child: Padding(
            padding: scale.getPadding(all: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: scale.getScaledHeight(20)),

                /// -- Illustration
                Expanded(
                  child: Image.asset(
                    AppImages.roleSelectionImage,
                    fit: BoxFit.contain,
                  ),
                ),

                SizedBox(height: scale.getScaledHeight(16)),

                /// -- Title
                Text(
                  AppStrings.userSelectionScreenTitle,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: scale.getScaledFont(18),
                    color: AppColors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(8)),

                /// -- Description
                Text(
                  AppStrings.userSelectionScreenDescription,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: scale.getScaledFont(12),
                    color: AppColors.descriptionColor,
                  ),
                ),

                SizedBox(height: scale.getScaledHeight(20)),

                /// -- Continue Button (Customer)
                SizedBox(
                  width: double.infinity,
                  height: scale.getScaledHeight(45),
                  child: ElevatedButton(
                    onPressed: () async {
                      await _storage.setRoleSelectionComplete(true);
                      Get.offAllNamed(AppRoutes.customerBottomNavigationRoute);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.purple3,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      "Continue",
                      style: TextStyle(
                        fontSize: scale.getScaledFont(14),
                        color: AppColors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),

                SizedBox(height: scale.getScaledHeight(10)),

                /// -- Signup as Professional
                GestureDetector(
                  onTap: () async {
                    await _storage.setRoleSelectionComplete(true);
                    Get.offAllNamed(AppRoutes.professionalRegistrationRoute);
                  },
                  child: Text(
                    "SignUp as Professional",
                    style: TextStyle(
                      fontSize: scale.getScaledFont(12),
                      color: AppColors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),

                SizedBox(height: scale.getScaledHeight(20)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
