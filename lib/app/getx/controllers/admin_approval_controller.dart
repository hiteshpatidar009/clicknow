import 'package:get/get.dart';

enum ApplicationStage {
  phoneVerified,
  profileSubmitted,
  underReview,
  approved,
  welcomed
}

class AdminApprovalController extends GetxController {

  Rx<ApplicationStage> currentStage =
      ApplicationStage.underReview.obs;

  /// Simulate Stage Update (Later connect to API)
  void updateStage(ApplicationStage stage) {
    currentStage.value = stage;
  }

  bool isCompleted(ApplicationStage stage) {
    return stage.index < currentStage.value.index;
  }

  bool isActive(ApplicationStage stage) {
    return stage.index == currentStage.value.index;
  }
}
