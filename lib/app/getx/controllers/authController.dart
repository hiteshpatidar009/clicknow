import 'package:clicknow/app/data/models/auth_session.dart';
import 'package:clicknow/app/data/models/user_model.dart';
import 'package:clicknow/app/routes/appRoutes.dart';
import 'package:clicknow/app/screens/professional/professionalBottomNavBar.dart';
import 'package:clicknow/app/services/auth_service.dart';
import 'package:clicknow/app/services/auth_storage.dart';
import 'package:clicknow/app/utils/device_constants/apiConstants.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_sign_in/google_sign_in.dart';

class AuthController extends GetxController {

  static AuthController get instance => Get.find();

  /// Separate Form Keys
  final GlobalKey<FormState> signupFormKey = GlobalKey<FormState>();
  final GlobalKey<FormState> loginFormKey = GlobalKey<FormState>();

  /// Signup Controllers
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final reEnterPasswordController = TextEditingController();

  /// Login Controllers
  final emailLoginController = TextEditingController();
  final passwordLoginController = TextEditingController();

  /// Reactive
  RxBool isChecked = false.obs;
  RxBool isPasswordHidden = true.obs;
  RxBool isRePasswordHidden = true.obs;
  RxBool isLoading = false.obs;
  RxBool isAuthenticated = false.obs;
  Rxn<UserModel> currentUser = Rxn<UserModel>();

  final AuthService _authService = AuthService();
  final AuthStorage _storage = AuthStorage();

  @override
  void onInit() {
    super.onInit();
    _loadSession();
  }

  Future<void> _loadSession() async {
    final userJson = _storage.userJson;
    final accessToken = _storage.accessToken;
    if (userJson != null && accessToken != null && accessToken.isNotEmpty) {
      currentUser.value = UserModel.fromJson(userJson);
      isAuthenticated.value = true;
    }
  }

  void toggleCheckbox(bool? value) {
    isChecked.value = value ?? false;
  }

  void togglePassword() {
    isPasswordHidden.value = !isPasswordHidden.value;
  }

  void toggleRePassword() {
    isRePasswordHidden.value = !isRePasswordHidden.value;
  }

  String? validateEmail(String? value) {
    final trimmed = value?.trim() ?? "";
    if (trimmed.isEmpty) {
      return "Email is required";
    }
    final emailRegex =
        RegExp(r"^[\w\.\-]+@([\w\-]+\.)+[\w\-]{2,}$");
    if (!emailRegex.hasMatch(trimmed)) {
      return "Enter a valid email address";
    }
    return null;
  }

  String? validatePassword(String? value) {
    final raw = value ?? "";
    if (raw.isEmpty) {
      return "Password is required";
    }
    if (raw.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (raw.length > 100) {
      return "Password must be under 100 characters";
    }
    return null;
  }

  String? validateConfirmPassword(String? value) {
    if (value == null || value.isEmpty) {
      return "Please confirm your password";
    }
    if (value != passwordController.text) {
      return "Passwords do not match";
    }
    return null;
  }

  /// REGISTER
  Future<void> register() async {
    if (!signupFormKey.currentState!.validate()) return;

    if (!isChecked.value) {
      Get.snackbar("Error", "Please accept Terms & Conditions");
      return;
    }

    isLoading.value = true;

    try {
      final message = await _authService.register(
        email: emailController.text.trim(),
        password: passwordController.text,
      );
      final pendingEmail = emailController.text.trim();
      await _storage.setPendingEmail(pendingEmail);
      Get.offAllNamed(AppRoutes.emailOTPVerificationRoute, arguments: pendingEmail);
      Get.snackbar("Success", message);
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  /// LOGIN
  Future<void> login() async {
    if (!loginFormKey.currentState!.validate()) return;

    isLoading.value = true;

    try {
      final session = await _authService.login(
        email: emailLoginController.text.trim(),
        password: passwordLoginController.text,
      );
      await _persistSession(session);

      await _routeAfterAuth(session.user);

      Get.snackbar("Success", "Successfully Logged In");
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> setSession(AuthSession session) async {
    await _persistSession(session);
  }

  Future<void> _persistSession(AuthSession session) async {
    await _storage.saveSession(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      userJson: session.user.toJson(),
    );
    currentUser.value = session.user;
    isAuthenticated.value = true;
  }

  Future<void> logout() async {
    try {
      await _authService.logout();
    } catch (_) {}
    await _storage.clearSession();
    isAuthenticated.value = false;
    currentUser.value = null;
    Get.offAllNamed(AppRoutes.loginRoute);
  }

  Future<void> signInWithGoogle() async {
    if (isLoading.value) return;
    isLoading.value = true;

    try {
      if (ApiConstants.googleServerClientId.trim().isEmpty) {
        throw Exception(
          "Google Sign-In is not configured. Add the Web client ID from Firebase to ApiConstants.googleServerClientId.",
        );
      }

      await GoogleSignIn.instance.initialize(
        serverClientId: ApiConstants.googleServerClientId,
      );
      final googleUser = await GoogleSignIn.instance.authenticate();
      final googleAuth = googleUser.authentication;
      final credential = GoogleAuthProvider.credential(
        idToken: googleAuth.idToken,
      );

      final userCredential =
          await FirebaseAuth.instance.signInWithCredential(credential);

      final firebaseUser = userCredential.user;
      final idToken = await firebaseUser?.getIdToken();
      if (idToken == null || idToken.isEmpty) {
        throw Exception("Failed to get Firebase ID token");
      }

      final session = await _authService.loginWithFirebase(idToken: idToken);
      await _persistSession(session);

      await _routeAfterAuth(session.user);

      Get.snackbar("Success", "Signed in with Google");
    } catch (error) {
      Get.snackbar("Error", error.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> handleStartupNavigation() async {
    await _loadSession();
    if (isAuthenticated.value) {
      if (currentUser.value?.role == "professional" &&
          !_storage.isProfessionalOnboardingComplete) {
        Get.offAllNamed(AppRoutes.professionalRegistrationRoute);
        return;
      }
      if (currentUser.value?.role == "professional") {
        Get.offAll(() => ProfessionalBottomNavBar());
        return;
      }
      if (!_storage.isRoleSelectionComplete) {
        Get.offAllNamed(AppRoutes.userSelectionRoute);
        return;
      }
      Get.offAllNamed(AppRoutes.customerBottomNavigationRoute);
      return;
    }
    Get.offAllNamed(AppRoutes.onBoardingRoute);
  }

  Future<void> _routeAfterAuth(UserModel user) async {
    final role = user.role;
    if (role == "professional") {
      if (!_storage.isProfessionalOnboardingComplete) {
        Get.offAllNamed(AppRoutes.professionalRegistrationRoute);
      } else {
        Get.offAll(() => ProfessionalBottomNavBar());
      }
      return;
    }
    if (!_storage.isRoleSelectionComplete) {
      Get.offAllNamed(AppRoutes.userSelectionRoute);
      return;
    }
    Get.offAllNamed(AppRoutes.customerBottomNavigationRoute);
  }

  @override
  void onClose() {
    emailController.dispose();
    passwordController.dispose();
    reEnterPasswordController.dispose();
    emailLoginController.dispose();
    passwordLoginController.dispose();
    super.onClose();
  }
}
