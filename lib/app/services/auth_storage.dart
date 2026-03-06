import 'dart:convert';

import 'package:get_storage/get_storage.dart';

class AuthStorage {
  static const String _accessTokenKey = "accessToken";
  static const String _refreshTokenKey = "refreshToken";
  static const String _userKey = "currentUser";
  static const String _professionalOnboardingCompleteKey =
      "professionalOnboardingComplete";
  static const String _roleSelectionCompleteKey = "roleSelectionComplete";
  static const String _pendingEmailKey = "pendingEmail";

  final GetStorage _storage = GetStorage();

  String? get accessToken => _storage.read<String>(_accessTokenKey);
  String? get refreshToken => _storage.read<String>(_refreshTokenKey);

  Map<String, dynamic>? get userJson {
    final raw = _storage.read<String>(_userKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  bool get isProfessionalOnboardingComplete =>
      _storage.read<bool>(_professionalOnboardingCompleteKey) ?? false;
  bool get isRoleSelectionComplete =>
      _storage.read<bool>(_roleSelectionCompleteKey) ?? false;
  String? get pendingEmail => _storage.read<String>(_pendingEmailKey);

  Future<void> saveSession({
    required String accessToken,
    required String refreshToken,
    required Map<String, dynamic> userJson,
  }) async {
    await _storage.write(_accessTokenKey, accessToken);
    await _storage.write(_refreshTokenKey, refreshToken);
    await _storage.write(_userKey, jsonEncode(userJson));
  }

  Future<void> setProfessionalOnboardingComplete(bool value) async {
    await _storage.write(_professionalOnboardingCompleteKey, value);
  }

  Future<void> setRoleSelectionComplete(bool value) async {
    await _storage.write(_roleSelectionCompleteKey, value);
  }

  Future<void> setPendingEmail(String? email) async {
    if (email == null || email.isEmpty) {
      await _storage.remove(_pendingEmailKey);
      return;
    }
    await _storage.write(_pendingEmailKey, email);
  }

  Future<void> clearSession() async {
    await _storage.remove(_accessTokenKey);
    await _storage.remove(_refreshTokenKey);
    await _storage.remove(_userKey);
    await _storage.remove(_professionalOnboardingCompleteKey);
    await _storage.remove(_roleSelectionCompleteKey);
    await _storage.remove(_pendingEmailKey);
  }
}
