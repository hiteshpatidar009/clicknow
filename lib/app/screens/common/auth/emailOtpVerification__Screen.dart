import 'package:clicknow/app/getx/controllers/emailOtpController.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class EmailOtpVerificationScreen extends StatelessWidget {
  const EmailOtpVerificationScreen({super.key});

  @override
  Widget build(BuildContext context) {

    /// -- Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();
    final emailOtpController = Get.put(EmailOtpController());

    return Container(
      height: double.maxFinite,
      width: double.maxFinite,
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: Scaffold(
        backgroundColor: AppColors.transparent,
        body: SizedBox(
          width: double.maxFinite,
          child: Padding(
            padding:  EdgeInsets.symmetric(horizontal: scale.getScaledWidth(16), vertical: scale.getScaledHeight(0)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                SizedBox(height: scale.getScaledHeight(70)),

                /// -- ClickNow Logo
                Center(
                  child: SizedBox(
                    height: scale.getScaledHeight(70),
                    width: double.maxFinite,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        /// -- "CN" in a box.
                        Container(
                          height: scale.getScaledHeight(70),
                          width: scale.getScaledWidth(70),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color: AppColors.white,
                          ),
                          child: Center(
                              child: Padding(
                                padding: scale.getPadding(all: 8),
                                child: Text("CN", style: TextStyle(fontSize: scale.getScaledFont(32), color: AppColors.purple3, fontWeight: FontWeight.bold),),
                              )),
                        ),

                        /// -- ClickNow
                        SizedBox(width: scale.getScaledWidth(8)),
                        Text('ClickNow', style: TextStyle(fontSize: scale.getScaledFont(38), fontWeight: FontWeight.bold, color: AppColors.white, height: 1),),
                      ],
                    ),
                  ),
                ),
                SizedBox(height: scale.getScaledHeight(40)),

                Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: const Color(0xff1C1736).withValues(alpha: 0.5),
                    border: Border.all(color: const Color(0xff1E2939)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      /// HEADER
                      const Padding(
                        padding: EdgeInsets.fromLTRB(10, 10, 10, 4),
                        child: Text(
                          "Verify Your Email Address",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        child: Text(
                          "We’ve sent a One-Time Password (OTP) to your registered email address. Please enter the OTP below to verify your email.",
                          style: TextStyle(
                            color: Colors.white60,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      const Divider(color: Color(0xff1E2939), thickness: 2),

                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [

                            /// -- Email Verification
                            Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                color: const Color(0xff1C1736).withValues(alpha: 0.5),
                                border: Border.all(color: const Color(0xff1E2939)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.only(left: 8.0, right: 8.0, top: 8.0, bottom: 8.0),
                                child: Obx(() => Text(
                                  emailOtpController.email.value.isEmpty
                                      ? "your@email.com"
                                      : emailOtpController.email.value,
                                  style: TextStyle(color: Color(0xff5B6274), fontSize: scale.getScaledFont(12), fontWeight: FontWeight.w500),),
                                ),
                              ),
                            ),
                            SizedBox(height: scale.getScaledHeight(8)),

                            /// Enter OTP Field
                            Row(
                              children: const [
                                Text("Enter OTP",
                                    style: TextStyle(color: Colors.white)),
                                SizedBox(width: 4),
                                Text("*",
                                    style: TextStyle(color: Colors.red)),
                              ],
                            ),

                            SizedBox(height: scale.getScaledHeight(6)),

                            SizedBox(
                              height: scale.getScaledHeight(44),
                              child: TextFormField(
                                controller: emailOtpController.otpController,
                                keyboardType: TextInputType.number,
                                maxLength: 6,
                                style: const TextStyle(color: Colors.white),
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                  LengthLimitingTextInputFormatter(6),
                                ],
                                decoration: InputDecoration(
                                  counterText: "",
                                  filled: true,
                                  fillColor: const Color(0xff1C1736)
                                      .withValues(alpha: 0.8),
                                  hintText: "Enter 6-digit OTP",
                                  hintStyle: TextStyle(
                                    color: Colors.white54,
                                    fontSize: scale.getScaledFont(12),
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              ),
                            ),

                            /// -- Security Verification
                            SizedBox(height: scale.getScaledHeight(12)),
                            Container(
                              width: double.infinity,
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(10),
                                color: const Color(0xff1C1736).withValues(alpha: 0.5),
                                border: Border.all(color: const Color(0xff1E2939)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Column(
                                  children: [
                                    /// -- Icon and Title
                                    Row(
                                      children: [
                                        // -- Icon
                                        Icon(Icons.shield_outlined, color: Color(0xff9235B1), size: 22,),
                                        SizedBox(width: scale.getScaledWidth(8),),
                                        // -- Title
                                        Text("Security Verification", style: TextStyle(color: Colors.white, fontSize: scale.getScaledFont(14), fontWeight: FontWeight.bold),),
                                      ],
                                    ),

                                    /// -- Description
                                    Padding(
                                      padding: const EdgeInsets.only(left: 28.0, right: 8.0, top: 6.0),
                                      child: Text(
                                        "Your phone number is encrypted and used only for booking confirmations and account security.",
                                        style: TextStyle(color: Color(0xff5B6274), fontSize: scale.getScaledFont(12), fontWeight: FontWeight.w500),),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                      /// -- back and Continue Buttons
                      const Divider(color: Color(0xff1E2939), height: 2,),
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.only(
                              bottomLeft: Radius.circular(10),
                              bottomRight: Radius.circular(10)
                          ),
                          color: const Color(0xff101425),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10.0, vertical: 20.0),
                          child: Column(
                            children: [
                              /// -- Verify and Continue
                              SizedBox(
                                height: scale.getScaledHeight(40),
                                width: double.maxFinite,
                                child: ElevatedButton(
                                  onPressed: emailOtpController.verifyOtp,
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.white,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadiusGeometry.circular(10),
                                    ),
                                  ),
                                  child: Text("Verify & Continue", style: TextStyle(color: AppColors.purple3, fontWeight: FontWeight.bold, fontSize: scale.getScaledFont(14)),),

                                ),
                              ),

                              /// --  Back Button
                              SizedBox(height: scale.getScaledHeight(10)),
                              SizedBox(
                                height: scale.getScaledHeight(40),
                                child: ElevatedButton(
                                  onPressed: ()=> Get.back(),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Color(0xff13182C),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadiusGeometry.circular(10),
                                      side: BorderSide(color: Color(0xff1E2939)),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.arrow_back, color: Colors.white, size: 22,),
                                      SizedBox(width: scale.getScaledWidth(8),),
                                      Text("Back", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: scale.getScaledFont(14)),),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
