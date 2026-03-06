class BookingApiModel {
  BookingApiModel({
    required this.id,
    required this.status,
    required this.bookingDate,
    this.startTime,
    this.endTime,
    this.duration,
    this.eventType,
    this.eventDetails,
    this.location,
    this.pricing,
  });

  final String id;
  final String status;
  final DateTime bookingDate;
  final String? startTime;
  final String? endTime;
  final num? duration;
  final String? eventType;
  final Map<String, dynamic>? eventDetails;
  final Map<String, dynamic>? location;
  final Map<String, dynamic>? pricing;

  factory BookingApiModel.fromJson(Map<String, dynamic> json) {
    final bookingDateRaw = json["bookingDate"]?.toString() ?? "";
    final parsedDate = DateTime.tryParse(bookingDateRaw) ?? DateTime.now();
    return BookingApiModel(
      id: json["id"]?.toString() ?? json["_id"]?.toString() ?? "",
      status: json["status"]?.toString() ?? "pending",
      bookingDate: parsedDate,
      startTime: json["startTime"]?.toString(),
      endTime: json["endTime"]?.toString(),
      duration: json["duration"] is num ? json["duration"] as num : num.tryParse(json["duration"]?.toString() ?? ""),
      eventType: json["eventType"]?.toString(),
      eventDetails: json["eventDetails"] is Map<String, dynamic>
          ? json["eventDetails"] as Map<String, dynamic>
          : null,
      location: json["location"] is Map<String, dynamic>
          ? json["location"] as Map<String, dynamic>
          : null,
      pricing: json["pricing"] is Map<String, dynamic>
          ? json["pricing"] as Map<String, dynamic>
          : null,
    );
  }
}
