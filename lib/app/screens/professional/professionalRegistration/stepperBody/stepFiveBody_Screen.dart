import 'package:clicknow/app/getx/controllers/professionalRegistrationController.dart';
import 'package:clicknow/app/getx/controllers/stepper_controller.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';

class StepFiveBodyScreen extends StatefulWidget {
  const StepFiveBodyScreen({super.key});

  @override
  State<StepFiveBodyScreen> createState() => _StepFiveBodyScreenState();
}

class _StepFiveBodyScreenState extends State<StepFiveBodyScreen> {
  final _formKey = GlobalKey<FormState>();
  final controller = Get.find<Professionalregistrationcontroller>();
  final stepperController = Get.find<StepperController>();

  @override
  Widget build(BuildContext context) {
    /// -- Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            Container(
              decoration: _mainDecoration(),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  /// Step 5:  Title and Description
                  const Padding(
                    padding: EdgeInsets.fromLTRB(10, 10, 10, 4),
                    child: Text(
                      "Pricing & Payment Setup",
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 10),
                    child: Text(
                      "Set your pricing and payment details for bookings.",
                      style: TextStyle(color: Colors.white60, fontSize: 12),
                    ),
                  ),
                  const Divider(color: Color(0xff1E2939)),

                  Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(
                      children: [
                        /// -- Pricing & Availability
                        _buildExpandable(
                          title: "Pricing & Availability",
                          isExpanded: controller.isPricingExpanded,
                          onTap: controller.togglePricing,
                          child: _pricingSection(),
                        ),
                        const SizedBox(height: 16),

                        /// -- Bank Information Section
                        _buildExpandable(
                          title: "Bank Information",
                          isExpanded: controller.isBankExpanded,
                          onTap: controller.toggleBank,
                          child: _bankSection(),
                        ),
                      ],
                    ),
                  ),

                  /// -- back and Continue Buttons
                  const Divider(color: Color(0xff1E2939), height: 2),
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(10),
                        bottomRight: Radius.circular(10),
                      ),
                      color: const Color(0xff101425),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10.0,
                        vertical: 20.0,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          /// -- Back Button
                          Expanded(
                            child: SizedBox(
                              height: scale.getScaledHeight(40),
                              child: ElevatedButton(
                                onPressed: () =>
                                    stepperController.previousStep(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xff13182C),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadiusGeometry.circular(
                                      10,
                                    ),
                                    side: BorderSide(color: Color(0xff1E2939)),
                                  ),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.arrow_back,
                                      color: Colors.white,
                                      size: 22,
                                    ),
                                    SizedBox(width: scale.getScaledWidth(8)),
                                    Text(
                                      "Back",
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: scale.getScaledFont(14),
                                      ),
                                    ),
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
                                onPressed: () => stepperController.nextStep(),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xff360248),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadiusGeometry.circular(
                                      10,
                                    ),
                                  ),
                                ),
                                child: Text(
                                  "Continue",
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: scale.getScaledFont(14),
                                  ),
                                ),
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
    );
  }

  // ------------------------------------------------

  Widget _pricingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: const [
            Text("Base Package Price", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _numberField(
          controller.basePriceController,
          "Base Package Price (Rs.)",
        ),
        const SizedBox(height: 12),

        Row(
          children: const [
            Text("Per Hour Charges", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _numberField(controller.perHourController, "Per Hour Charges (Rs.)"),
        const SizedBox(height: 16),

        /// Professional Type
        Row(
          children: const [
            Text("Professional Type", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        Obx(
          () => Row(
            children: [
              Radio(
                value: "Full-Time",
                groupValue: controller.professionalType.value,
                onChanged: (val) =>
                    controller.professionalType.value = val.toString(),
              ),
              Text(
                "Full-Time",
                style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
              ),
              Radio(
                value: "Freelancer",
                groupValue: controller.professionalType.value,
                onChanged: (val) =>
                    controller.professionalType.value = val.toString(),
              ),
              Text(
                "Freelancer",
                style: TextStyle(color: Colors.white.withValues(alpha: 0.6)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        /// Team Size
        Row(
          children: const [
            Text("Team Size", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        Obx(
          () => DropdownButtonFormField(
            value: controller.selectedTeamSize.value.isEmpty
                ? null
                : controller.selectedTeamSize.value,
            dropdownColor: const Color(0xff1C1736),
            items: controller.teamSizeOptions
                .map(
                  (e) => DropdownMenuItem(
                    value: e,
                    child: Text(e, style: const TextStyle(color: Colors.white)),
                  ),
                )
                .toList(),
            onChanged: (val) => controller.selectedTeamSize.value = val ?? "",
            decoration: _inputDecoration("Select Team Size"),
          ),
        ),

        const SizedBox(height: 16),
        _toggleTile(
          "Available for urgent bookings",
          controller.urgentAvailable,
        ),
        _toggleTile(
          "Willing to travel outside city",
          controller.willingToTravel,
        ),
        _toggleTile("Cancellation Policy", controller.cancellationAccepted),
        _toggleTile(
          "Platform Commission Agreement",
          controller.commissionAccepted,
        ),
      ],
    );
  }

  Widget _bankSection() {
    return Column(
      children: [
        Row(
          children: const [
            Text("Account Number", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _textField(controller.accountNumberController, "Account Number"),
        const SizedBox(height: 12),

        Row(
          children: const [
            Text("Upload Bank Passbook", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        Obx(
          () => GestureDetector(
            onTap: controller.pickBankPassbook,
            child: Container(
              height: 120,
              decoration: _uploadDecoration(),
              child: Center(
                child: controller.aadharFileName.value.isEmpty
                    ? const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.upload_file, color: Colors.white54),
                          SizedBox(height: 8),
                          Text(
                            "Tap to upload",
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            "Upload Front side of Bank Passbook\nin single PDF File",
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white54),
                          ),
                        ],
                      )
                    : Text(
                        controller.aadharFileName.value,
                        style: const TextStyle(color: Colors.purpleAccent),
                      ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        Row(
          children: const [
            Text("UPI ID", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _textField(controller.upiController, "UPI ID"),
        const SizedBox(height: 12),

        Row(
          children: const [
            Text("Bank Name", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _textField(controller.bankNameController, "Bank Name"),
        const SizedBox(height: 12),

        Row(
          children: const [
            Text("Branch Name", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _textField(controller.branchNameController, "Branch Name"),
        const SizedBox(height: 12),

        Row(
          children: const [
            Text("IFSC Code", style: TextStyle(color: Colors.white)),
            SizedBox(width: 4),
            Text("*", style: TextStyle(color: Colors.red)),
          ],
        ),
        const SizedBox(height: 8),
        _textField(controller.ifscController, "IFSC Code"),
      ],
    );
  }

  // ------------------------------------------------

  Widget _buildExpandable({
    required String title,
    required RxBool isExpanded,
    required VoidCallback onTap,
    required Widget child,
  }) {
    return Obx(
      () => Container(
        decoration: _innerDecoration(),
        child: Column(
          children: [
            ListTile(
              onTap: onTap,
              title: Text(title, style: const TextStyle(color: Colors.white)),
              trailing: Icon(
                isExpanded.value
                    ? Icons.keyboard_arrow_up
                    : Icons.keyboard_arrow_down,
                color: Colors.white,
              ),
            ),
            if (isExpanded.value)
              Padding(padding: const EdgeInsets.all(12), child: child),
          ],
        ),
      ),
    );
  }

  Widget _numberField(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.number,
      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
      style: const TextStyle(color: Colors.white),
      decoration: _inputDecoration(hint),
    );
  }

  Widget _textField(TextEditingController controller, String hint) {
    return TextFormField(
      controller: controller,
      style: const TextStyle(color: Colors.white),
      decoration: _inputDecoration(hint),
    );
  }

  Widget _toggleTile(String title, RxBool value) {
    return Obx(
      () => SwitchListTile(
        title: Text(title, style: const TextStyle(color: Colors.white)),
        value: value.value,
        activeColor: const Color(0xff7CFC00),
        onChanged: (val) => value.value = val,
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      filled: true,
      fillColor: const Color(0xff1C1736).withValues(alpha: 0.8),
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white54),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
    );
  }

  BoxDecoration _mainDecoration() {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      color: const Color(0xff1C1736).withValues(alpha: 0.5),
      border: Border.all(color: const Color(0xff1E2939)),
    );
  }

  BoxDecoration _innerDecoration() {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      color: const Color(0xff1C1736).withValues(alpha: 0.8),
      border: Border.all(color: const Color(0xff1E2939)),
    );
  }

  BoxDecoration _uploadDecoration() {
    return BoxDecoration(
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: const Color(0xff1E2939)),
      color: const Color(0xff1C1736).withValues(alpha: 0.6),
    );
  }
}
