import 'package:clicknow/app/data/models/api_response.dart';
import 'package:clicknow/app/data/models/booking_api_model.dart';
import 'package:clicknow/app/services/api_client.dart';
import 'package:clicknow/app/utils/device_constants/apiConstants.dart';

class BookingService {
  BookingService({ApiClient? client})
      : _client = client ??
            ApiClient(baseUrl: ApiConstants.base_ApiUrl);

  final ApiClient _client;

  Future<List<BookingApiModel>> getClientBookings({
    int page = 1,
    int pageSize = 50,
  }) async {
    final response = await _client.get(
      "${ApiConstants.bookingsClient_Api}?page=$page&pageSize=$pageSize",
      authRequired: true,
    );
    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as List<dynamic>,
    );
    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }
    return api.data!
        .map((item) => BookingApiModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<BookingApiModel>> getProfessionalBookings({
    int page = 1,
    int pageSize = 50,
  }) async {
    final response = await _client.get(
      "${ApiConstants.bookingsProfessional_Api}?page=$page&pageSize=$pageSize",
      authRequired: true,
    );
    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as List<dynamic>,
    );
    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }
    return api.data!
        .map((item) => BookingApiModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }

  Future<List<BookingApiModel>> getUpcomingProfessionalBookings({
    int limit = 10,
  }) async {
    final response = await _client.get(
      "${ApiConstants.bookingsProfessionalUpcoming_Api}?limit=$limit",
      authRequired: true,
    );
    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as List<dynamic>,
    );
    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }
    return api.data!
        .map((item) => BookingApiModel.fromJson(item as Map<String, dynamic>))
        .toList();
  }
}
