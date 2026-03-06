import 'dart:convert';

import 'package:clicknow/app/services/auth_storage.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class ApiException implements Exception {
  ApiException(this.message, {this.statusCode, this.errorCode});

  final String message;
  final int? statusCode;
  final String? errorCode;

  @override
  String toString() => message;
}

class ApiClient {
  ApiClient({
    required this.baseUrl,
    AuthStorage? storage,
  }) : _storage = storage ?? AuthStorage();

  final String baseUrl;
  final AuthStorage _storage;

  Future<Map<String, dynamic>> get(
    String path, {
    bool authRequired = false,
  }) async {
    final uri = Uri.parse("$baseUrl$path");
    final headers = await _buildHeaders(authRequired);
    _logRequest("GET", uri, headers, null);
    try {
      final response = await http.get(uri, headers: headers).timeout(
            const Duration(seconds: 20),
          );
      _logResponse(response);
      return _handleResponse(response);
    } catch (error) {
      _logError("GET", uri, error);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
    bool authRequired = false,
  }) async {
    final uri = Uri.parse("$baseUrl$path");
    final headers = await _buildHeaders(authRequired);
    _logRequest("POST", uri, headers, body);
    try {
      final response = await http
          .post(
            uri,
            headers: headers,
            body: body == null ? null : jsonEncode(body),
          )
          .timeout(const Duration(seconds: 20));
      _logResponse(response);
      return _handleResponse(response);
    } catch (error) {
      _logError("POST", uri, error);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> put(
    String path, {
    Map<String, dynamic>? body,
    bool authRequired = false,
  }) async {
    final uri = Uri.parse("$baseUrl$path");
    final headers = await _buildHeaders(authRequired);
    _logRequest("PUT", uri, headers, body);
    try {
      final response = await http
          .put(
            uri,
            headers: headers,
            body: body == null ? null : jsonEncode(body),
          )
          .timeout(const Duration(seconds: 20));
      _logResponse(response);
      return _handleResponse(response);
    } catch (error) {
      _logError("PUT", uri, error);
      rethrow;
    }
  }

  Future<Map<String, dynamic>> delete(
    String path, {
    bool authRequired = false,
  }) async {
    final uri = Uri.parse("$baseUrl$path");
    final headers = await _buildHeaders(authRequired);
    _logRequest("DELETE", uri, headers, null);
    try {
      final response = await http
          .delete(uri, headers: headers)
          .timeout(const Duration(seconds: 20));
      _logResponse(response);
      return _handleResponse(response);
    } catch (error) {
      _logError("DELETE", uri, error);
      rethrow;
    }
  }

  Future<Map<String, String>> _buildHeaders(bool authRequired) async {
    final headers = <String, String>{
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (authRequired) {
      final token = _storage.accessToken;
      if (token != null && token.isNotEmpty) {
        headers["Authorization"] = "Bearer $token";
      }
    }
    return headers;
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    Map<String, dynamic> json;
    try {
      json = jsonDecode(response.body) as Map<String, dynamic>;
    } catch (_) {
      json = {};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json;
    }

    final message = json["message"]?.toString() ??
        "Request failed (${response.statusCode})";
    throw ApiException(
      message,
      statusCode: response.statusCode,
      errorCode: json["errorCode"]?.toString(),
    );
  }

  void _logRequest(
    String method,
    Uri uri,
    Map<String, String> headers,
    Map<String, dynamic>? body,
  ) {
    if (kDebugMode) {
      debugPrint("[API] $method $uri");
      debugPrint("[API] Headers: ${_redactHeaders(headers)}");
      if (body != null) {
        debugPrint("[API] Body: $body");
      }
    }
  }

  void _logResponse(http.Response response) {
    if (kDebugMode) {
      debugPrint("[API] Status: ${response.statusCode}");
      debugPrint("[API] Response: ${response.body}");
    }
  }

  void _logError(String method, Uri uri, Object error) {
    if (kDebugMode) {
      debugPrint("[API] ERROR $method $uri");
      debugPrint("[API] ERROR: $error");
    }
  }

  Map<String, String> _redactHeaders(Map<String, String> headers) {
    final copy = Map<String, String>.from(headers);
    if (copy.containsKey("Authorization")) {
      copy["Authorization"] = "Bearer ***";
    }
    return copy;
  }
}
