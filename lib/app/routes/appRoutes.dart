import 'package:clicknow/app/screens/common/auth/emailOtpVerification__Screen.dart';
import 'package:clicknow/app/screens/customer/CustomerBottomNavBar.dart';
import 'package:clicknow/app/screens/common/auth/login_Screen.dart';
import 'package:clicknow/app/screens/common/auth/signup_Screen.dart';
import 'package:clicknow/app/screens/common/onboarding/onboarding_Screen.dart';
import 'package:clicknow/app/screens/common/userSelection/userSelection_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/photoAndVideography/photoAndVideoGraphy_Screen.dart';
import 'package:clicknow/app/screens/customer/home/services/photoAndVideography/photoAndVideographyServiceForm_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalBottomNavBar.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/AdminApproval_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/ServiceSelection_Screen.dart';
import 'package:clicknow/app/screens/professional/professionalRegistration/professionalRegistration_Screen.dart';
import 'package:get/get_navigation/src/routes/get_route.dart';
import '../screens/common/splash/splash_Screen.dart';

class AppRoutes {
  AppRoutes._();

  /// -- Routes
  static const String initialRoute = "/";
  static const String onBoardingRoute = "/onBoarding";
  static const String userSelectionRoute = "/userSelection";

  // -- Authentication Screen Routes
  static const String loginRoute = "/login";
  static const String signupRoute = "/signup";
  static const String emailOTPVerificationRoute = "/email_OTP_Verification";

  // -- Bottom Navigation
  static const String customerBottomNavigationRoute = "/bottomNavigation";
  static const String professionalBottomNavigationRoute = "/professionalBottomNavigation";

  // -- Professional onboarding process routes
  static const String professionalRegistrationRoute = "/professionalRegistration";

  // -- Service Selection Screen Route
  static const String serviceSelectionScreen = "/serviceSelectionScreen";

  // -- Admin Approval Screen Route
  static const String adminApprovalScreen = "/adminApprovalScreen";


  // -- Services Description Screen Route
  static const String photoAndVideographyServiceRoute = "/photoAndVideographyService";
  static const String musicAndLivePerformanceServiceRoute = "/musicAndLivePerformanceService";
  static const String professionalDjServiceServiceRoute = "/professionalDjService";
  static const String weddingPlannerServiceRoute = "/weddingPlannerService";
  static const String professionalAnchorServiceRoute = "/professionalAnchorService";
  static const String professionalMagicianServiceRoute = "/professionalMagicianService";

  // -- Services Form Screen Route
  static const String photoAndVideographyServiceFormRoute = "/photoAndVideographyServiceForm";
  static const String musicAndLivePerformanceServiceFormRoute = "/musicAndLivePerformanceServiceForm";
  static const String professionalDjServiceServiceFormRoute = "/professionalDjServiceForm";
  static const String weddingPlannerServiceFormRoute = "/weddingPlannerServiceForm";
  static const String professionalAnchorServiceFormRoute = "/professionalAnchorServiceForm";
  static const String professionalMagicianServiceFormRoute = "/professionalMagicianServiceForm";

  /// -- Pages
  static final pages = [
    GetPage(name: initialRoute, page: ()=> SplashScreen()),
    GetPage(name: onBoardingRoute, page: ()=> OnBoardingScreen()),
    GetPage(name: userSelectionRoute, page: ()=> UserSelectionScreen()),
    GetPage(name: loginRoute, page: ()=> LoginScreen()),
    GetPage(name: signupRoute, page: ()=> SignupScreen()),
    GetPage(name: emailOTPVerificationRoute, page: ()=> EmailOtpVerificationScreen()),

    // --  Bottom Navigation Page
    GetPage(name: customerBottomNavigationRoute, page: ()=> CustomerBottomNavBar()),
    GetPage(name: professionalBottomNavigationRoute, page: ()=> ProfessionalBottomNavBar()),

    // -- Professional Onboarding Process Page
    GetPage(name: professionalRegistrationRoute, page: ()=> ProfessionalRegistrationScreen()),

    // -- Service Selection Screen Page
    GetPage(name: serviceSelectionScreen, page: ()=> ServiceSelectionScreen()),

    // -- Admin Approval Screen Page
    GetPage(name: adminApprovalScreen, page: ()=> AdminApprovalScreen()),

    // -- Services Description Page
    GetPage(name: photoAndVideographyServiceRoute, page: ()=> PhotoAndVideographyScreen()), // done
    GetPage(name: musicAndLivePerformanceServiceRoute, page: ()=> PhotoAndVideographyScreen()), // done

    // -- Services Form Page
    GetPage(name: photoAndVideographyServiceRoute, page: ()=> PhotoAndVideographyServiceFormScreen()),
    GetPage(name: photoAndVideographyServiceRoute, page: ()=> PhotoAndVideographyServiceFormScreen()),

  ];
}
