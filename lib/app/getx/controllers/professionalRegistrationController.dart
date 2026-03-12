import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:file_picker/file_picker.dart';
import 'package:clicknow/app/services/auth_service.dart';

class Professionalregistrationcontroller extends GetxController {
  static Professionalregistrationcontroller get instance => Get.find();

  /// -- Form Keys
  final GlobalKey<FormState> professionalRegistrationFormKey =
      GlobalKey<FormState>();

  /// -- Textfield Controllers
  final TextEditingController genderController = TextEditingController();
  final TextEditingController dobController = TextEditingController();

  /// -- Step 1 TextField Controllers
  final TextEditingController phoneController = TextEditingController();
  final TextEditingController otpController = TextEditingController();

  /// -- Step 2 TextField Controllers
  final TextEditingController nameController = TextEditingController();
  final List<String> genderOptions = ["Male", "Female", "Other"];
  RxString selectedGender = "".obs;
  Rx<DateTime?> selectedDob = Rx<DateTime?>(null);
  final List<String> languageOptions = [
    "English",
    "Hindi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Malayalam",
    "Bengali",
    "Marathi",
  ];
  RxList<String> selectedLanguages = <String>[].obs;
  final TextEditingController permanentAddressController =
      TextEditingController();

  /// -- Step 3 States
  RxBool isWorkExpanded = false.obs;
  RxBool isProfileExpanded = false.obs;
  RxBool isAdditionalExpanded = false.obs;

  /// -- Step 4 States
  RxBool isAadharExpanded = false.obs;
  RxBool isPanExpanded = false.obs;
  void toggleAadhar() => isAadharExpanded.toggle();
  void togglePan() => isPanExpanded.toggle();
  final TextEditingController aadharController = TextEditingController();
  final TextEditingController panController = TextEditingController();
  RxString aadharFileName = "".obs;
  RxString panFileName = "".obs;

  /// -- Step 5 States
  RxBool isPricingExpanded = true.obs;
  RxBool isBankExpanded = false.obs;

  void togglePricing() => isPricingExpanded.toggle();
  void toggleBank() => isBankExpanded.toggle();

  final TextEditingController basePriceController = TextEditingController();
  final TextEditingController perHourController = TextEditingController();

  RxString professionalType = "Full-Time".obs;

  final List<String> teamSizeOptions = [
    "1-5 Members",
    "5-10 Members",
    "10-20 Members",
    "20+ Members",
  ];

  RxString selectedTeamSize = "".obs;

  /// Toggles
  RxBool urgentAvailable = false.obs;
  RxBool willingToTravel = false.obs;
  RxBool cancellationAccepted = false.obs;
  RxBool commissionAccepted = false.obs;

  final TextEditingController accountNumberController = TextEditingController();
  final TextEditingController upiController = TextEditingController();
  final TextEditingController bankNameController = TextEditingController();
  final TextEditingController branchNameController = TextEditingController();
  final TextEditingController ifscController = TextEditingController();

  RxString bankPassbookFileName = "".obs;

  Future<void> pickBankPassbook() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null) {
      bankPassbookFileName.value = result.files.single.name;
    }
  }

  Future<void> pickAadharFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null) {
      aadharFileName.value = result.files.single.name;
    }
  }

  Future<void> pickPanFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null) {
      panFileName.value = result.files.single.name;
    }
  }

  /// Toggle Sections
  void toggleWork() {
    isWorkExpanded.toggle();
  }

  void toggleProfile() {
    isProfileExpanded.toggle();
  }

  void toggleAdditional() {
    isAdditionalExpanded.toggle();
  }

  /// Work Information
  final TextEditingController workCityController = TextEditingController();
  final TextEditingController shortBioController = TextEditingController();
  final List<String> experienceOptions = List.generate(
    11,
    (index) => "$index Years",
  );
  RxString selectedExperience = "".obs;

  final List<String> workingDaysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  RxList<String> selectedWorkingDays = <String>[].obs;

  void toggleWorkingDay(String day) {
    if (selectedWorkingDays.contains(day)) {
      selectedWorkingDays.remove(day);
    } else {
      selectedWorkingDays.add(day);
    }
  }

  /// Profile Links
  final TextEditingController googleDriveController = TextEditingController();
  final TextEditingController instagramController = TextEditingController();
  final TextEditingController websiteController = TextEditingController();

  /// Additional Details
  final TextEditingController companyNameController = TextEditingController();
  final TextEditingController equipmentController = TextEditingController();
  final TextEditingController clientExperienceController =
      TextEditingController();
  final TextEditingController awardsController = TextEditingController();

  /// Toggle Language Selection
  void toggleLanguage(String language) {
    if (selectedLanguages.contains(language)) {
      selectedLanguages.remove(language);
    } else {
      selectedLanguages.add(language);
    }
  }

  /// -- Reactive States
  RxBool isOtpSent = false.obs;
  RxBool isPhoneVerified = false.obs;
  RxInt secondsRemaining = 60.obs;
  RxBool canResendOtp = false.obs;
  RxBool isOtpLoading = false.obs;

  Timer? _timer;
  final AuthService _authService = AuthService();

  /// -- Request OTP
  Future<void> requestOtp() async {
    if (phoneController.text.length != 10) {
      Get.snackbar("Error", "Enter valid 10-digit phone number");
      return;
    }

    isOtpLoading.value = true;
    try {
      final phone = "+91${phoneController.text}";
      await _authService.sendOtp(phone: phone);
      isOtpSent.value = true;
      isPhoneVerified.value = false;
      startTimer();
      Get.snackbar("Success", "OTP sent successfully");
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isOtpLoading.value = false;
    }
  }

  /// -- Verify OTP
  Future<void> verifyOtp() async {
    if (otpController.text.length != 6) {
      Get.snackbar("Error", "Enter valid 6-digit OTP");
      return;
    }

    isOtpLoading.value = true;
    try {
      final phone = "+91${phoneController.text}";
      await _authService.verifyPhoneOtp(phone: phone, otp: otpController.text);

      isPhoneVerified.value = true;
      isOtpSent.value = false;
      _timer?.cancel();
      Get.snackbar("Success", "Phone verified successfully");
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isOtpLoading.value = false;
    }
  }

  /// -- Start Timer
  void startTimer() {
    secondsRemaining.value = 60;
    canResendOtp.value = false;

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (secondsRemaining.value > 0) {
        secondsRemaining.value--;
      } else {
        canResendOtp.value = true;
        timer.cancel();
      }
    });
  }

  /// -- Resend OTP
  void resendOtp() {
    startTimer();
  }

  @override
  void onClose() {
    _timer?.cancel();
    super.onClose();
  }
}
