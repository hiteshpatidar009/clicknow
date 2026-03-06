class ApiConstants {
  ApiConstants._();

  /// -- Base URL
  static const String base_ApiUrl = "https://clicknow.onrender.com/api/v1";

  /// -- Authentication
  static const String register_Api = "/auth/register";
  static const String login_Api = "/auth/login";
  static const String logout_Api = "/auth/logout";
  static const String refresh_Api = "/auth/refresh";
  static const String me_Api = "/auth/me";
  static const String sendOtp_Api = "/auth/send-otp";
  static const String verifyOtp_Api = "/auth/verify-otp";
  static const String firebaseLogin_Api = "/auth/firebase";

  /// -- Google Sign-In (Web client ID from Firebase)
  static const String googleServerClientId =
      "245525941263-7n34a4vmqjgoppv5tk1rkr26bn1jsis8.apps.googleusercontent.com";

  /// -- Professionals
  static const String professional_Api = "/professionals";
  static const String professionalMe_Api = "/professionals/me";

  /// -- Bookings
  static const String bookings_Api = "/bookings";
  static const String bookingsClient_Api = "/bookings/client";
  static const String bookingsProfessional_Api = "/bookings/professional";
  static const String bookingsProfessionalUpcoming_Api =
      "/bookings/professional/upcoming";
}
