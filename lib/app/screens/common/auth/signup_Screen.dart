import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/routes/appRoutes.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:clicknow/app/utils/device_constants/appStrings.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    /// -- Scaling utility Instance
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    /// -- Auth Image Height
    final double imageHeight = scale.getScaledHeight(300);

    return Scaffold(
      backgroundColor: AppColors.black,
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: SingleChildScrollView(
          // physics: const PageScrollPhysics(),
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
                  vertical: scale.getScaledHeight(20),
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

    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        /// -- Signup Title and Description
        Text(
          AppStrings.signupTitle,
          style: TextStyle(
            fontSize: scale.getScaledFont(20),
            color: AppColors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        SizedBox(height: scale.getScaledHeight(6)),
        Text(
          AppStrings.signupDescription,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: scale.getScaledFont(14),
            color: AppColors.descriptionColor,
          ),
        ),

        /// -- TextFields
        SizedBox(height: scale.getScaledHeight(20)),
        Form(
          key: controller.signupFormKey,
          child: Column(
            children: [
              // -- Email Textfield
              BuildTextFormFields(
                textEditingController: controller.emailController,
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
                  textEditingController: controller.passwordController,
                  validatorString: AppStrings.passwordTextfieldValidator,
                  validator: controller.validatePassword,
                  labelText: AppStrings.cratePasswordTextfield,
                  icon: Icons.lock_outline_rounded,
                  scale: scale,
                  isPassword: controller.isPasswordHidden.value,
                  onToggle: controller.togglePassword,
                ),
              ),
              SizedBox(height: scale.getScaledHeight(12)),

              // -- Re-enter Password
              Obx(
                () => BuildTextFormFields(
                  textEditingController: controller.reEnterPasswordController,
                  validatorString: AppStrings.reEnterPasswordTextfield,
                  validator: controller.validateConfirmPassword,
                  labelText: AppStrings.reEnterPasswordTextfield,
                  icon: Icons.lock_outline_rounded,
                  scale: scale,
                  isPassword: controller.isRePasswordHidden.value,
                  onToggle: controller.toggleRePassword,
                ),
              ),
            ],
          ),
        ),

        /// -- Checkbox, T&C and Privacy Policy.
        Obx(
          () => Row(
            children: [
              /// -- T&C and Privacy Policy CheckBox
              Checkbox(
                value: controller.isChecked.value,
                onChanged: controller.toggleCheckbox,
                activeColor: AppColors.blue,
                side: BorderSide(color: AppColors.blue),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  Text(
                    "Agree ",
                    style: TextStyle(
                      fontSize: scale.getScaledFont(12),
                      color: AppColors.white,
                      fontWeight: FontWeight.normal,
                    ),
                  ),

                  /// -- Terms and Condition
                  InkWell(
                    onTap: () {
                      // -- Route to T&C
                    },
                    child: Text(
                      "Terms & Condition ",
                      style: TextStyle(
                        fontSize: scale.getScaledFont(12),
                        color: AppColors.blue,
                        fontWeight: FontWeight.normal,
                      ),
                    ),
                  ),
                  Text(
                    "and ",
                    style: TextStyle(
                      fontSize: scale.getScaledFont(12),
                      color: AppColors.white,
                      fontWeight: FontWeight.normal,
                    ),
                  ),

                  /// -- Privacy Policy
                  InkWell(
                    onTap: () {
                      // -- Route to Privacy Policy
                    },
                    child: Text(
                      "Privacy Policy",
                      style: TextStyle(
                        fontSize: scale.getScaledFont(12),
                        color: AppColors.blue,
                        fontWeight: FontWeight.normal,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        /// Button Reactive
        Obx(
          () => SizedBox(
            width: double.infinity,
            height: scale.getScaledHeight(45),
            child: ElevatedButton(
              onPressed: controller.isLoading.value
                  ? null
                  : controller.register,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.buttonBackground,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
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
                      AppStrings.createAccountButton,
                      style: TextStyle(
                        fontSize: scale.getScaledFont(16),
                        color: AppColors.buttonForeground,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
            ),
          ),
        ),

        SizedBox(height: scale.getScaledHeight(12)),

        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              "Already have an account?",
              style: TextStyle(
                color: Colors.white,
                fontSize: scale.getScaledFont(12),
              ),
            ),
            GestureDetector(
              onTap: () => Get.offAllNamed(AppRoutes.loginRoute),
              child: Text(
                " Signin",
                style: TextStyle(
                  color: Color(0xff2F4BE9),
                  fontSize: scale.getScaledFont(12),
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),

        SizedBox(height: scale.getScaledHeight(8)),
      ],
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
          borderSide: const BorderSide(color: AppColors.white),
          borderRadius: BorderRadius.circular(8),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: AppColors.white),
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}
