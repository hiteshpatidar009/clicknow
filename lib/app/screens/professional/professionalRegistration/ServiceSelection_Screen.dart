import 'package:clicknow/app/getx/controllers/ServiceSelection_Controller.dart';
import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class ServiceSelectionScreen extends StatelessWidget {
  const ServiceSelectionScreen({super.key});

  @override
  Widget build(BuildContext context) {

    final controller = Get.put(ServiceSelectionController());

    /// -- Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return Container(
      decoration:
      BoxDecoration(gradient: AppColors.primaryGradient),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          title: const Text(
            "Services & Specialty Selection",
            style: TextStyle(color: Colors.white),
          ),
          actions: [
            IconButton(
              onPressed: () => _showAddDialog(context, controller),
              icon: const Icon(Icons.add, color: Colors.white),
            )
          ],
        ),
        body: Column(
          children: [
            /// -- Selected Services Cards
            Expanded(
              child: Obx(() => controller.addedServices.isEmpty
                  ? const Center(child: Text("No Services Added", style: TextStyle(color: Colors.white),),)
                  : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: controller.addedServices.length,
                        itemBuilder: (context, index) {
                        final service = controller.addedServices[index];
                        return _serviceCard(service, controller);
                },
              )),
            ),

            /// -- Save and Continue Button
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: SizedBox(
                height: scale.getScaledHeight(40),
                width: double.maxFinite,
                child: Obx(() => ElevatedButton(
                  onPressed: controller.isSubmitting.value
                      ? null
                      : () => controller.saveServices(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xff360248),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadiusGeometry.circular(10)),
                  ),
                  child: controller.isSubmitting.value
                      ? SizedBox(
                          height: scale.getScaledHeight(18),
                          width: scale.getScaledHeight(18),
                          child: const CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : Text(
                          "Continue",
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: scale.getScaledFont(14),
                          ),
                        ),
                )),
              ),
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  // ------------------------------------------------
  // SERVICE CARD
  // ------------------------------------------------

  Widget _serviceCard(
      ServiceModel service,
      ServiceSelectionController controller) {
    return Obx(() => Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color:
        const Color(0xff1C1736),
        borderRadius:
        BorderRadius.circular(12),
        border: Border.all(
            color:
            const Color(0xff1E2939)),
      ),
      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius:
                BorderRadius.circular(
                    8),
                child: Image.asset(
                  service.image,
                  height: 80,
                  width: 80,
                  fit: BoxFit.cover,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment
                      .start,
                  children: [
                    Text(
                      service.serviceName,
                      style: const TextStyle(
                          color: Colors
                              .purpleAccent,
                          fontWeight:
                          FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      "Specialty:",
                      style: const TextStyle(
                          color:
                          Colors.white70),
                    ),
                    const SizedBox(height: 4),
                    ..._buildSpecialtyList(
                        service),
                    Align(
                      alignment:
                      Alignment.centerRight,
                      child: GestureDetector(
                        onTap: () =>
                            controller
                                .toggleExpand(
                                service),
                        child: Text(
                          service
                              .isExpanded
                              .value
                              ? "Less"
                              : "More",
                          style: const TextStyle(
                              color: Colors
                                  .purpleAccent),
                        ),
                      ),
                    )
                  ],
                ),
              )
            ],
          )
        ],
      ),
    ));
  }

  List<Widget> _buildSpecialtyList(
      ServiceModel service) {
    int limit =
    service.isExpanded.value
        ? service.specialties.length
        : 4;

    return service.specialties
        .take(limit)
        .map((e) => Text(
      "• $e",
      style: const TextStyle(
          color: Colors.white60),
    ))
        .toList();
  }

  // ------------------------------------------------
  // ADD SERVICE DIALOG
  // ------------------------------------------------

  void _showAddDialog(
      BuildContext context,
      ServiceSelectionController controller) {
    Get.dialog(
      Dialog(
        backgroundColor:
        const Color(0xff1C1736),
        shape: RoundedRectangleBorder(
            borderRadius:
            BorderRadius.circular(16)),
        child: Padding(
          padding:
          const EdgeInsets.all(16),
          child: Column(
            mainAxisSize:
            MainAxisSize.min,
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: [

              const Row(
                children: [
                  Icon(Icons.miscellaneous_services,
                      color:
                      Colors.purpleAccent),
                  SizedBox(width: 8),
                  Text(
                    "Add Service & Specialty",
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight:
                        FontWeight.bold),
                  )
                ],
              ),

              const SizedBox(height: 20),

              /// SERVICE DROPDOWN
              Obx(() => DropdownButtonFormField(
                dropdownColor:
                const Color(
                    0xff1C1736),
                value: controller
                    .selectedService
                    .value
                    .isEmpty
                    ? null
                    : controller
                    .selectedService
                    .value,
                items: controller
                    .serviceSpecialtyMap
                    .keys
                    .map((e) =>
                    DropdownMenuItem(
                      value: e,
                      child: Text(e,
                          style: const TextStyle(
                              color:
                              Colors.white)),
                    ))
                    .toList(),
                onChanged: (val) {
                  controller
                      .selectedService
                      .value = val!;
                  controller
                      .selectedSpecialties
                      .clear();
                },
                decoration:
                const InputDecoration(
                  hintText:
                  "Choose Service",
                  hintStyle:
                  TextStyle(
                      color:
                      Colors.white54),
                ),
              )),

              const SizedBox(height: 16),

              /// SPECIALTY MULTI SELECT
              Obx(() {
                if (controller
                    .selectedService
                    .value
                    .isEmpty) {
                  return const SizedBox();
                }

                final specialties =
                controller
                    .serviceSpecialtyMap[
                controller
                    .selectedService
                    .value]!;

                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children:
                  specialties.map((spec) {
                    bool selected =
                    controller
                        .selectedSpecialties
                        .contains(spec);
                    return GestureDetector(
                      onTap: () =>
                          controller
                              .toggleSpecialty(
                              spec),
                      child: Container(
                        padding:
                        const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6),
                        decoration:
                        BoxDecoration(
                          color: selected
                              ? Colors
                              .purpleAccent
                              : const Color(
                              0xff2A2E3F),
                          borderRadius:
                          BorderRadius
                              .circular(20),
                        ),
                        child: Text(
                          spec,
                          style: const TextStyle(
                              color:
                              Colors.white),
                        ),
                      ),
                    );
                  }).toList(),
                );
              }),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    controller.addService();
                    Get.back();
                  },
                  style:
                  ElevatedButton.styleFrom(
                    backgroundColor:
                    Colors.purpleAccent,
                  ),
                  child:
                  const Text("Continue"),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }
}
