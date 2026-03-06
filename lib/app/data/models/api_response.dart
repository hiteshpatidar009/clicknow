class ApiResponse<T> {
  ApiResponse({
    required this.success,
    required this.message,
    this.data,
    this.errorCode,
  });

  final bool success;
  final String message;
  final T? data;
  final String? errorCode;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json, {
    T Function(dynamic json)? parser,
  }) {
    return ApiResponse<T>(
      success: json["success"] == true,
      message: json["message"]?.toString() ?? "",
      data: parser != null ? parser(json["data"]) : json["data"] as T?,
      errorCode: json["errorCode"]?.toString(),
    );
  }
}
