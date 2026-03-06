import 'package:clicknow/app/data/models/api_response.dart';
import 'package:clicknow/app/services/api_client.dart';
import 'package:clicknow/app/utils/device_constants/apiConstants.dart';

class ProfessionalService {
  ProfessionalService({ApiClient? client})
      : _client = client ??
            ApiClient(baseUrl: ApiConstants.base_ApiUrl);

  final ApiClient _client;

  Future<Map<String, dynamic>> createProfile(
    Map<String, dynamic> payload,
  ) async {
    final response = await _client.post(
      ApiConstants.professional_Api,
      body: payload,
      authRequired: true,
    );
    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as Map<String, dynamic>,
    );
    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }
    return api.data!;
  }

  Future<Map<String, dynamic>> getMyProfile() async {
    final response = await _client.get(
      "/professionals/me/profile",
      authRequired: true,
    );
    final api = ApiResponse.fromJson(
      response,
      parser: (data) => data as Map<String, dynamic>,
    );
    if (!api.success || api.data == null) {
      throw ApiException(api.message);
    }
    return api.data!;
  }
}
