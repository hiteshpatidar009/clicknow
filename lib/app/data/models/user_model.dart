class UserModel {
  UserModel({
    required this.id,
    required this.email,
    required this.role,
    this.firstName,
    this.lastName,
    this.displayName,
    this.phone,
    this.avatar,
    this.isActive,
    this.isVerified,
  });

  final String id;
  final String email;
  final String role;
  final String? firstName;
  final String? lastName;
  final String? displayName;
  final String? phone;
  final String? avatar;
  final bool? isActive;
  final bool? isVerified;

  String get fullName {
    final composed = [
      if (firstName != null && firstName!.trim().isNotEmpty) firstName!.trim(),
      if (lastName != null && lastName!.trim().isNotEmpty) lastName!.trim(),
    ].join(" ");
    return composed.isNotEmpty ? composed : (displayName ?? "");
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json["id"]?.toString() ?? json["_id"]?.toString() ?? "",
      email: json["email"]?.toString() ?? "",
      role: json["role"]?.toString() ?? "client",
      firstName: json["firstName"]?.toString(),
      lastName: json["lastName"]?.toString(),
      displayName: json["displayName"]?.toString(),
      phone: json["phone"]?.toString(),
      avatar: json["avatar"]?.toString(),
      isActive: json["isActive"] == null ? null : json["isActive"] == true,
      isVerified: json["isVerified"] == null ? null : json["isVerified"] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "email": email,
      "role": role,
      "firstName": firstName,
      "lastName": lastName,
      "displayName": displayName,
      "phone": phone,
      "avatar": avatar,
      "isActive": isActive,
      "isVerified": isVerified,
    };
  }
}
