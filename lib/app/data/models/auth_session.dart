import 'user_model.dart';

class AuthSession {
  AuthSession({
    required this.user,
    required this.accessToken,
    required this.refreshToken,
    this.expiresIn,
    this.requireEmailVerification,
    this.isNewUser,
    this.message,
  });

  final UserModel user;
  final String accessToken;
  final String refreshToken;
  final String? expiresIn;
  final bool? requireEmailVerification;
  final bool? isNewUser;
  final String? message;

  factory AuthSession.fromJson(Map<String, dynamic> json) {
    final userJson = json["user"] as Map<String, dynamic>? ?? {};
    return AuthSession(
      user: UserModel.fromJson(userJson),
      accessToken: json["accessToken"]?.toString() ?? "",
      refreshToken: json["refreshToken"]?.toString() ?? "",
      expiresIn: json["expiresIn"]?.toString(),
      requireEmailVerification:
          json["requireEmailVerification"] == true,
      isNewUser: json["isNewUser"] == true,
      message: json["message"]?.toString(),
    );
  }
}
