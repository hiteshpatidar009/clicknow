import 'package:clicknow/app/getx/controllers/professionalRegistrationController.dart';
import 'package:clicknow/app/getx/controllers/stepper_controller.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class StepThreeBodyScreen extends StatefulWidget {
  const StepThreeBodyScreen({super.key});

  @override
  State<StepThreeBodyScreen> createState() =>
      _StepThreeBodyScreenState();
}

class _StepThreeBodyScreenState
    extends State<StepThreeBodyScreen> {
  final _formKey = GlobalKey<FormState>();
  final controller = Get.find<Professionalregistrationcontroller>();
  final stepperController = Get.find<StepperController>();

  @override
  Widget build(BuildContext context) {
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            Container(
              decoration: _mainContainer(),
              child: Column(
                crossAxisAlignment:
                CrossAxisAlignment.start,
                children: [

                  /// Step 3 Title and description
                  const Padding(
                    padding: EdgeInsets.fromLTRB(10, 10, 10, 4),
                    child: Text("Build Your Professional Profile", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10),
                    child: Text(
                      "This information will be visible to clicknow customers and helpful for us to deliver booking orders.",
                      style: TextStyle(color: Colors.white60, fontSize: 12),),
                  ),
                  const Divider(
                      color: Color(0xff1E2939)),

                  Padding(
                    padding:
                    const EdgeInsets.all(10),
                    child: Column(
                      children: [

                        /// --  Work Information Section
                        _buildExpandable(
                          title: "Work Information",
                          isExpanded: controller.isWorkExpanded,
                          onTap: controller.toggleWork,
                          child: _workSection(),
                        ),
                        const SizedBox(height: 12),

                        /// -- Profile & Online Presence Section
                        _buildExpandable(
                          title: "Profile & Online Presence",
                          isExpanded: controller.isProfileExpanded,
                          onTap: controller.toggleProfile,
                          child: _profileSection(),
                        ),
                        const SizedBox(height: 12),

                        /// -- Additional Details
                        _buildExpandable(
                          title: "Additional Details",
                          isExpanded: controller.isAdditionalExpanded,
                          onTap: controller.toggleAdditional,
                          child: _additionalSection(),
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
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          /// -- Back Button
                          Expanded(
                            child: SizedBox(
                              height: scale.getScaledHeight(40),
                              child: ElevatedButton(
                                onPressed: ()=> stepperController.previousStep(),
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
                          ),

                          /// -- Continue Button
                          SizedBox(width: scale.getScaledWidth(8)),
                          Expanded(
                            child: SizedBox(
                              height: scale.getScaledHeight(40),
                              child: ElevatedButton(
                                onPressed: ()=> stepperController.nextStep(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xff360248),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadiusGeometry.circular(10)),
                                ),
                                child: Text("Continue", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: scale.getScaledFont(14)),),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  /// -- Expandable Container Widget
  Widget _buildExpandable({
    required String title,
    required RxBool isExpanded,
    required VoidCallback onTap,
    required Widget child,
  }) {
    return Obx(() => Container(
      decoration: _innerContainer(),
      child: Column(
        children: [
          ListTile(
            onTap: onTap,
            leading: const Icon(Icons.phone, color: Color(0xff9235B1),),
            title: Text(title, style: const TextStyle(color: Colors.white)),
            trailing: Icon(isExpanded.value ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down, color: Colors.white,),
          ),
          if (isExpanded.value)
            Padding(padding: const EdgeInsets.all(12), child: child,)
        ],
      ),
    ));
  }

  /// -- Work Information Section
  Widget _workSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        /// Experience Dropdown
        Row(
          children: const [
            Text("Years of Experience", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 6),
        Obx(() => DropdownButtonFormField(
          value: controller.selectedExperience.value.isEmpty ? null : controller.selectedExperience.value,
          dropdownColor:
          const Color(0xff1C1736),
          items: controller.experienceOptions.map((e) => DropdownMenuItem(value: e, child: Text(e, style: const TextStyle(color: Colors.white)),)).toList(),
          onChanged: (val) => controller.selectedExperience.value = val ?? "",
          decoration: _inputDecoration("Enter Years"),
        )),

        const SizedBox(height: 16),

        /// Working Days Chips
        Row(
          children: const [
            Text("Available Working Days", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 6),

        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: controller.workingDaysOptions.map((day) => Obx(() {
            bool selected =
            controller.selectedWorkingDays.contains(day);
            return GestureDetector(
              onTap: () => controller.toggleWorkingDay(day),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration:
                BoxDecoration(
                  color: selected ? const Color(0xff360248) : const Color(0xff2A2E3F),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(day, style: const TextStyle(color: Colors.white)),
              ),
            );
          }))
              .toList(),
        ),

        const SizedBox(height: 16),

        /// Short Bio
        Row(
          children: const [
            Text("Short Bio", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller:
          controller.shortBioController,
          maxLength: 300,
          maxLines: 4,
          style:
          const TextStyle(color: Colors.white),
          decoration: _inputDecoration(
              "Tell Customers about yourself and your expertise..."),
        ),
      ],
    );
  }

  /// -- Profile & Online Presence Section
  Widget _profileSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Google Work Drive URL", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.googleDriveController, "Google Work Drive URL"),
        const SizedBox(height: 12),

        Text("Instagram Profile URL", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.instagramController, "Instagram Profile URL"),
        const SizedBox(height: 12),

        Text("Website URL", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.websiteController, "Website URL"),
      ],
    );
  }



  Widget _additionalSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text("Company/Brand Name", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.companyNameController, "Company/Brand Name"),
        const SizedBox(height: 12),

        Text("Equipment Details", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.equipmentController, "Equipment Details"),
        const SizedBox(height: 12),

        Text("Past Client Experience", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.clientExperienceController, "Past Client Experience"),
        const SizedBox(height: 12),

        Text("Awards & Achievements", style: TextStyle(color: Colors.white)),
        const SizedBox(height: 8),
        _textField(controller.awardsController, "Awards & Achievements"),
      ],
    );
  }

  // ------------------------------------------------

  Widget _textField(
      TextEditingController controller,
      String hint) {
    return TextFormField(
      controller: controller,
      style:
      const TextStyle(color: Colors.white),
      decoration: _inputDecoration(hint),
    );
  }

  InputDecoration _inputDecoration(
      String hint) {
    return InputDecoration(
      filled: true,
      fillColor:
      const Color(0xff1C1736).withValues(alpha: 0.8),
      hintText: hint,
      hintStyle:
      const TextStyle(color: Colors.white54),
      border: OutlineInputBorder(
          borderRadius:
          BorderRadius.circular(10)),
    );
  }

  BoxDecoration _mainContainer() {
    return BoxDecoration(
      borderRadius:
      BorderRadius.circular(10),
      color:
      const Color(0xff1C1736).withValues(alpha: 0.5),
      border: Border.all(
          color: const Color(0xff1E2939)),
    );
  }

  BoxDecoration _innerContainer() {
    return BoxDecoration(
      borderRadius:
      BorderRadius.circular(10),
      color:
      const Color(0xff1C1736).withValues(alpha: 0.8),
      border: Border.all(
          color: const Color(0xff1E2939)),
    );
  }
}
