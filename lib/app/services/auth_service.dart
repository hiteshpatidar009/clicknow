import 'package:clicknow/app/data/models/api_response.dart';
import 'package:clicknow/app/data/models/auth_session.dart';
import 'package:clicknow/app/services/api_client.dart';
import 'package:clicknow/app/utils/device_constants/apiConstants.dart';

class AuthService {
  AuthService({ApiClient? client})
      : _client = client ??
            ApiClient(baseUrl: ApiConstants.base_ApiUrl);

  final ApiClient _client;

  Future<String> register({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      ApiConstants.register_Api,
      body: {
        "email": email.trim(),
        "password": password,
      },
    );

    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as Map<String, dynamic>?,
    );

    if (!api.success) {
      throw ApiException(api.message);
    }

    return api.message.isNotEmpty ? api.message : "OTP sent";
  }

  Future<AuthSession> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      ApiConstants.login_Api,
      body: {
        "email": email.trim().toLowerCase(),
        "password": password,
      },
    );

    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as Map<String, dynamic>,
    );

    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }

    return AuthSession.fromJson(api.data!);
  }

  Future<void> logout() async {
    await _client.post(ApiConstants.logout_Api, authRequired: true);
  }

  Future<AuthSession> loginWithFirebase({
    required String idToken,
  }) async {
    final response = await _client.post(
      ApiConstants.firebaseLogin_Api,
      body: {
        "idToken": idToken,
      },
    );

    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as Map<String, dynamic>,
    );

    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }

    return AuthSession.fromJson(api.data!);
  }

  Future<AuthSession> verifyOtp({
    String? email,
    String? phone,
    required String otp,
    String role = "client",
  }) async {
    final body = <String, dynamic>{
      "otp": otp,
      "role": role,
    };
    if (email != null && email.isNotEmpty) {
      body["email"] = email.trim().toLowerCase();
    }
    if (phone != null && phone.isNotEmpty) {
      body["phone"] = phone.trim();
    }

    final response = await _client.post(
      ApiConstants.verifyOtp_Api,
      body: body,
    );

    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as Map<String, dynamic>,
    );

    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }

    return AuthSession.fromJson(api.data!);
  }

  Future<void> sendOtp({
    String? email,
    String? phone,
    String role = "client",
  }) async {
    final body = <String, dynamic>{
      "role": role,
    };
    if (email != null && email.isNotEmpty) {
      body["email"] = email.trim().toLowerCase();
    }
    if (phone != null && phone.isNotEmpty) {
      body["phone"] = phone.trim();
    }

    await _client.post(
      ApiConstants.sendOtp_Api,
      body: body,
    );
  }
}
