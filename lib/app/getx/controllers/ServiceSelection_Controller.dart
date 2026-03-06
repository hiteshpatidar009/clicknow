import 'package:clicknow/app/getx/controllers/authController.dart';
import 'package:clicknow/app/getx/controllers/professionalRegistrationController.dart';
import 'package:clicknow/app/routes/appRoutes.dart';
import 'package:clicknow/app/services/auth_storage.dart';
import 'package:clicknow/app/services/professional_service.dart';
import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:get/get.dart';

class ServiceModel {
  String serviceName;
  String image;
  List<String> specialties;
  RxBool isExpanded = false.obs;

  ServiceModel({
    required this.serviceName,
    required this.image,
    required this.specialties,
  });
}

class ServiceSelectionController extends GetxController {
  final ProfessionalService _professionalService = ProfessionalService();
  final AuthStorage _storage = AuthStorage();

  /// Available Services with Specialties
  final Map<String, List<String>> serviceSpecialtyMap = {
    "Photography & Videography": [
      "Family Events",
      "Weddings",
      "Pre-Weddings",
      "Corporate Events",
      "Birthday Parties",
      "Product Shoots",
      "Fashion",
      "Real Estate"
    ],
    "Music & Live Performance": [
      "Family Events",
      "Weddings",
      "Pre-Weddings",
      "Corporate Events",
      "Concerts",
      "Private Shows"
    ],
    "Professional DJ Service": [
      "Club Events",
      "Weddings",
      "Corporate Parties",
      "Festivals"
    ]
  };

  /// Service Images
  final Map<String, String> serviceImages = {
    "Photography & Videography": AppImages.photographer,
    "Music & Live Performance": AppImages.photographer,
    "Professional DJ Service": AppImages.photographer,
  };

  /// Selected Values (Dialog)
  RxString selectedService = "".obs;
  RxList<String> selectedSpecialties = <String>[].obs;

  /// Final Added Services
  RxList<ServiceModel> addedServices = <ServiceModel>[].obs;
  RxBool isSubmitting = false.obs;

  void toggleSpecialty(String specialty) {
    if (selectedSpecialties.contains(specialty)) {
      selectedSpecialties.remove(specialty);
    } else {
      selectedSpecialties.add(specialty);
    }
  }

  void addService() {
    if (selectedService.value.isEmpty || selectedSpecialties.isEmpty) return;

    addedServices.add(ServiceModel(
      serviceName: selectedService.value,
      image: serviceImages[selectedService.value]!,
      specialties: List.from(selectedSpecialties),
    ));

    selectedService.value = "";
    selectedSpecialties.clear();
  }

  void toggleExpand(ServiceModel service) {
    service.isExpanded.toggle();
    addedServices.refresh();
  }

  Future<void> saveServices() async {
    if (addedServices.isEmpty) {
      Get.snackbar("Error", "Please add at least one service");
      return;
    }

    final professionalController =
        Get.find<Professionalregistrationcontroller>();

    if (!professionalController.isPhoneVerified.value) {
      Get.snackbar("Error", "Please verify your phone number first");
      return;
    }

    final payload = _buildProfessionalPayload(
      professionalController: professionalController,
    );

    if (payload["businessName"] == null ||
        payload["businessName"].toString().isEmpty) {
      Get.snackbar("Error", "Business name is required");
      return;
    }

    isSubmitting.value = true;
    try {
      await _professionalService.createProfile(payload);
      await _storage.setProfessionalOnboardingComplete(true);
      Get.offAllNamed(AppRoutes.adminApprovalScreen);
      Get.snackbar("Success", "Profile submitted successfully");
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isSubmitting.value = false;
    }
  }

  Map<String, dynamic> _buildProfessionalPayload({
    required Professionalregistrationcontroller professionalController,
  }) {
    final Map<String, dynamic> payload = {};
    final contact = <String, dynamic>{};
    final personalDetails = <String, dynamic>{};
    final workDetails = <String, dynamic>{};
    final documents = <String, dynamic>{};
    final pricing = <String, dynamic>{};
    final bankDetails = <String, dynamic>{};

    final user = AuthController.instance.currentUser.value;
    if (user?.email != null && user!.email.isNotEmpty) {
      contact["email"] = user.email;
    }

    final phone = professionalController.phoneController.text.trim();
    if (phone.isNotEmpty) {
      contact["phone"] = "+91$phone";
    }

    final gender = professionalController.selectedGender.value.trim();
    if (gender.isNotEmpty) {
      personalDetails["gender"] = gender.toLowerCase();
    }

    final dob = professionalController.selectedDob.value;
    if (dob != null) {
      personalDetails["dob"] = dob.toIso8601String();
    }

    if (professionalController.selectedLanguages.isNotEmpty) {
      personalDetails["languagesKnown"] =
          professionalController.selectedLanguages.toList();
    }

    final address =
        professionalController.permanentAddressController.text.trim();
    if (address.isNotEmpty) {
      personalDetails["permanentAddress"] = address;
    }

    final workingDays = professionalController.selectedWorkingDays.toList();
    if (workingDays.isNotEmpty) {
      workDetails["availableWorkingDays"] = workingDays;
    }

    final equipment = professionalController.equipmentController.text.trim();
    if (equipment.isNotEmpty) {
      workDetails["equipmentDetails"] = equipment;
    }

    final socialLinks = <String, dynamic>{};
    final instagram = professionalController.instagramController.text.trim();
    if (instagram.isNotEmpty) {
      socialLinks["instagram"] = instagram;
    }
    final website = professionalController.websiteController.text.trim();
    if (website.isNotEmpty) {
      socialLinks["website"] = website;
    }
    final googleDrive = professionalController.googleDriveController.text.trim();
    if (googleDrive.isNotEmpty) {
      socialLinks["googleMap"] = googleDrive;
    }
    if (socialLinks.isNotEmpty) {
      workDetails["socialLinks"] = socialLinks;
    }

    final aadharNumber = professionalController.aadharController.text.trim();
    if (aadharNumber.isNotEmpty) {
      documents["aadharNumber"] = aadharNumber;
    }
    final panNumber = professionalController.panController.text.trim();
    if (panNumber.isNotEmpty) {
      documents["panNumber"] = panNumber;
    }

    final hourlyRate =
        int.tryParse(professionalController.perHourController.text.trim());
    if (hourlyRate != null) {
      pricing["hourlyRate"] = hourlyRate;
    }
    final basePrice =
        int.tryParse(professionalController.basePriceController.text.trim());
    if (basePrice != null) {
      pricing["packages"] = [
        {
          "name": "Base Package",
          "description": "Base service package",
          "price": basePrice,
          "duration": 1,
        }
      ];
    }

    final accountNumber =
        professionalController.accountNumberController.text.trim();
    if (accountNumber.isNotEmpty) {
      bankDetails["accountNumber"] = accountNumber;
    }
    final ifsc = professionalController.ifscController.text.trim();
    if (ifsc.isNotEmpty) {
      bankDetails["ifscCode"] = ifsc;
    }
    final bankName = professionalController.bankNameController.text.trim();
    if (bankName.isNotEmpty) {
      bankDetails["bankName"] = bankName;
    }
    final accountHolder =
        professionalController.nameController.text.trim();
    if (accountHolder.isNotEmpty) {
      bankDetails["accountHolderName"] = accountHolder;
    }
    final upi = professionalController.upiController.text.trim();
    if (upi.isNotEmpty) {
      bankDetails["upiId"] = upi;
    }

    final experienceText =
        professionalController.selectedExperience.value.trim();
    final experience =
        int.tryParse(experienceText.split(" ").first);
    if (experience != null) {
      payload["experience"] = experience;
    }

    final shortBio = professionalController.shortBioController.text.trim();
    if (shortBio.isNotEmpty) {
      payload["bio"] = shortBio;
    }

    final companyName = professionalController.companyNameController.text.trim();
    final fullName = professionalController.nameController.text.trim();
    payload["businessName"] =
        companyName.isNotEmpty ? companyName : (fullName.isNotEmpty ? fullName : "Independent Professional");

    payload["category"] = _resolveCategoryFromServices();
    payload["specialties"] = _resolveSpecialties();

    if (contact.isNotEmpty) payload["contact"] = contact;
    if (personalDetails.isNotEmpty) {
      payload["personalDetails"] = personalDetails;
    }
    if (workDetails.isNotEmpty) payload["workDetails"] = workDetails;
    if (documents.isNotEmpty) payload["documents"] = documents;
    if (pricing.isNotEmpty) payload["pricing"] = pricing;
    if (bankDetails.isNotEmpty) payload["bankDetails"] = bankDetails;

    return payload;
  }

  String _resolveCategoryFromServices() {
    if (addedServices.isEmpty) return "other";
    final name = addedServices.first.serviceName.toLowerCase();
    if (name.contains("photo")) return "photographer";
    if (name.contains("video")) return "videographer";
    if (name.contains("dj")) return "dj";
    if (name.contains("music")) return "musician";
    if (name.contains("anchor")) return "anchor";
    if (name.contains("wedding")) return "live_wedding_planner";
    return "other";
  }

  List<String> _resolveSpecialties() {
    final specialties = <String>[];
    for (final service in addedServices) {
      specialties.addAll(service.specialties);
    }
    return specialties.toSet().toList();
  }
}
