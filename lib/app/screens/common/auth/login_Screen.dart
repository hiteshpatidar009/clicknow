import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/routes/appRoutes.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_constants/appStrings.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class LoginScreen extends StatelessWidget {
  LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    /// -- Scaling Utility Instance
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    /// -- Auth Image height
    final double imageHeight = scale.getScaledHeight(300);

    return Scaffold(
      backgroundColor: AppColors.black,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          // physics: PageScrollPhysics(),
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom,
          ),
          child: Column(
            children: [
              SizedBox(
                height: imageHeight,
                width: double.infinity,
                child: Image.asset(AppImages.photographer, fit: BoxFit.cover),
              ),

              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(
                  horizontal: scale.getScaledWidth(16),
                  vertical: scale.getScaledHeight(6),
                ),
                child: _BodyContent(scale: scale),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _BodyContent extends StatelessWidget {
  const _BodyContent({required this.scale});

  final ScalingUtility scale;

  @override
  Widget build(BuildContext context) {
    /// -- Auth Controller Instance
    final AuthController controller = AuthController.instance;

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          /// -- Signup Title and Description
          Text(
            AppStrings.loginTitle,
            style: TextStyle(
              fontSize: scale.getScaledFont(20),
              color: AppColors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: scale.getScaledHeight(6)),
          Text(
            AppStrings.loginDescription,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: scale.getScaledFont(14),
              color: AppColors.descriptionColor,
            ),
          ),

          /// -- TextFields
          SizedBox(height: scale.getScaledHeight(20)),
          Form(
            key: controller.loginFormKey,
            child: Column(
              children: [
                // -- Email Textfield
                BuildTextFormFields(
                  textEditingController: controller.emailLoginController,
                  validatorString: AppStrings.emailTextfieldValidator,
                  validator: controller.validateEmail,
                  labelText: AppStrings.enterYourEmailTextfield,
                  icon: Icons.email_outlined,
                  scale: scale,
                ),
                SizedBox(height: scale.getScaledHeight(12)),

                // --  Password Field (Reactive)
                Obx(
                  () => BuildTextFormFields(
                    textEditingController: controller.passwordLoginController,
                    validatorString: AppStrings.passwordTextfieldValidator,
                    validator: controller.validatePassword,
                    labelText: AppStrings.cratePasswordTextfield,
                    icon: Icons.lock_outline_rounded,
                    scale: scale,
                    isPassword: controller.isPasswordHidden.value,
                    onToggle: controller.togglePassword,
                  ),
                ),
              ],
            ),
          ),

          SizedBox(height: scale.getScaledHeight(10)),

          // -- Forgot Password
          Align(
            alignment: Alignment.centerRight,
            child: Text(
              "Forgot Password?",
              style: TextStyle(
                fontSize: scale.getScaledFont(12),
                color: AppColors.blue,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),

          SizedBox(height: scale.getScaledHeight(16)),

          /// Login Reactive
          Obx(
            () => SizedBox(
              width: double.infinity,
              height: scale.getScaledHeight(45),
              child: ElevatedButton(
                onPressed: controller.isLoading.value ? null : controller.login,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.buttonBackground,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                    side: BorderSide(color: AppColors.white),
                  ),
                ),
                child: controller.isLoading.value
                    ? Padding(
                        padding: EdgeInsets.all(15),
                        child: AspectRatio(
                          aspectRatio: 1,
                          child: CircularProgressIndicator(
                            color: AppColors.white,
                            strokeWidth: 2,
                          ),
                        ),
                      )
                    : Text(
                        AppStrings.loginButton,
                        style: TextStyle(
                          fontSize: scale.getScaledFont(16),
                          color: AppColors.buttonForeground,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ),

          SizedBox(height: scale.getScaledHeight(8)),

          /// -- Create Account Button
          SizedBox(
            width: double.infinity,
            height: scale.getScaledHeight(45),
            child: ElevatedButton(
              onPressed: () => Get.offAllNamed(AppRoutes.signupRoute),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: AppColors.white),
                ),
              ),
              child: Text(
                AppStrings.createAccountButton,
                style: TextStyle(
                  fontSize: scale.getScaledFont(16),
                  color: AppColors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          SizedBox(height: scale.getScaledHeight(8)),

          /// -- OR Divider
          Row(
            children: [
              Expanded(
                child: Divider(
                  color: AppColors.dividerColor,
                  indent: 5,
                  endIndent: 5,
                ),
              ),
              Text(
                "Or, Continue with Google",
                style: TextStyle(
                  color: AppColors.dividerColor,
                  fontSize: scale.getScaledFont(10),
                ),
              ),
              Expanded(
                child: Divider(
                  color: AppColors.dividerColor,
                  indent: 5,
                  endIndent: 5,
                ),
              ),
            ],
          ),
          SizedBox(height: scale.getScaledHeight(8)),

          /// -- Signup with Google Button
          SizedBox(
            width: double.infinity,
            height: scale.getScaledHeight(45),
            child: ElevatedButton(
              onPressed: controller.isLoading.value
                  ? null
                  : controller.signInWithGoogle,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                  side: BorderSide(color: AppColors.white),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Image.asset(
                    AppImages.googleIcon,
                    width: scale.getScaledWidth(20),
                    height: scale.getScaledWidth(20),
                  ),
                  SizedBox(width: scale.getScaledWidth(10)),
                  Text(
                    AppStrings.singUpWithGoogleButton,
                    style: TextStyle(
                      fontSize: scale.getScaledFont(16),
                      color: AppColors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),

          SizedBox(height: scale.getScaledHeight(20)),
        ],
      ),
    );
  }
}

class BuildTextFormFields extends StatelessWidget {
  const BuildTextFormFields({
    super.key,
    required this.textEditingController,
    required this.validatorString,
    required this.labelText,
    required this.icon,
    required this.scale,
    this.isPassword = false,
    this.onToggle,
    this.validator,
  });

  final TextEditingController textEditingController;
  final String validatorString;
  final String labelText;
  final IconData icon;
  final ScalingUtility scale;
  final bool isPassword;
  final VoidCallback? onToggle;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: textEditingController,
      obscureText: isPassword,
      validator: (value) {
        if (validator != null) {
          return validator!(value);
        }
        if (value == null || value.isEmpty) {
          return validatorString;
        }
        return null;
      },
      style: const TextStyle(color: Colors.white),
      decoration: InputDecoration(
        labelText: labelText,
        labelStyle: TextStyle(
          fontSize: scale.getScaledFont(12),
          color: Colors.white.withValues(alpha: 0.6),
        ),
        prefixIcon: Icon(icon, color: Colors.white.withValues(alpha: 0.6)),
        suffixIcon: onToggle != null
            ? IconButton(
                icon: Icon(
                  isPassword ? Icons.visibility_off : Icons.visibility,
                  color: Colors.white.withValues(alpha: 0.6),
                ),
                onPressed: onToggle,
              )
            : null,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: Colors.white),
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.purple3),
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}
