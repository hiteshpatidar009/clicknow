import 'package:clicknow/app/utils/device_constants/appImages.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

// ─── Review Model ──────────────────────────────────────────────────────────────
class ClientReviewModel {
  final String name;
  final String location;
  final double rating;
  final String review;
  final String avatarPath;

  ClientReviewModel({
    required this.name,
    required this.location,
    required this.rating,
    required this.review,
    required this.avatarPath,
  });
}

// ─── Media Item Model ──────────────────────────────────────────────────────────
class MediaItemModel {
  final String imagePath;
  final String category; // 'All', 'Photography', 'Musician', 'DJ', 'Wedding Planner', 'Anchor', 'Magician'

  MediaItemModel({required this.imagePath, required this.category});
}

// ─── Gallery Tab Model ─────────────────────────────────────────────────────────
class GalleryTab {
  final String label;
  GalleryTab({required this.label});
}

// ─── Controller ───────────────────────────────────────────────────────────────
class CustomerPortfolioController extends GetxController {
  // Stats
  final eventsCount = '500+'.obs;
  final professionalsCount = '500+'.obs;
  final ratingsCount = '500+'.obs;

  // Reviews slider
  final currentReviewIndex = 0.obs;
  final reviews = <ClientReviewModel>[].obs;

  // Gallery tabs
  final selectedGalleryTab = 0.obs;
  final galleryTabs = [
    GalleryTab(label: 'All'),
    GalleryTab(label: 'Photography'),
    GalleryTab(label: 'Musician'),
    GalleryTab(label: 'DJ'),
    GalleryTab(label: 'Wedding Planner'),
    GalleryTab(label: 'Anchor'),
    GalleryTab(label: 'Magician'),
  ];

  // All media items
  final _allMedia = <MediaItemModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadReviews();
    _loadMedia();
  }

  void _loadReviews() {
    reviews.value = [
      ClientReviewModel(
        name: 'Tarun Jain',
        location: 'Indore, Madhya Pradesh',
        rating: 3.4,
        review:
        '" Our company portfolio showcases real projects and successful events, giving you confidence that your special moments are in experienced hands. "',
        avatarPath: AppImages.avtar2,
      ),
      ClientReviewModel(
        name: 'Priya Sharma',
        location: 'Bhopal, Madhya Pradesh',
        rating: 4.5,
        review:
        '" Amazing service! The team was professional and captured every moment beautifully. Highly recommended for any event. "',
        avatarPath: AppImages.avtar2,
      ),
      ClientReviewModel(
        name: 'Rahul Verma',
        location: 'Ujjain, Madhya Pradesh',
        rating: 5.0,
        review:
        '" Exceptional quality and on-time delivery. The photographers were very creative and the final output exceeded our expectations. "',
        avatarPath: AppImages.avtar2,
      ),
      ClientReviewModel(
        name: 'Sneha Patel',
        location: 'Jabalpur, Madhya Pradesh',
        rating: 4.2,
        review:
        '" Great experience overall. The team understood our requirements perfectly and delivered beyond what we imagined. "',
        avatarPath: AppImages.avtar2,
      ),
      ClientReviewModel(
        name: 'Amit Khare',
        location: 'Gwalior, Madhya Pradesh',
        rating: 4.8,
        review:
        '" Professional, punctual and highly talented. Would definitely hire again for future events. Truly outstanding work! "',
        avatarPath: AppImages.avtar2,
      ),
    ];
  }

  void _loadMedia() {
    // Using AppImages.photographer as placeholder for all categories
    // Admin will upload actual images via API
    _allMedia.value = [
      MediaItemModel(imagePath: AppImages.photographer, category: 'Photography'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Musician'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Photography'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Musician'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'DJ'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Wedding Planner'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'DJ'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Wedding Planner'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Anchor'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Magician'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Anchor'),
      MediaItemModel(imagePath: AppImages.photographer, category: 'Magician'),
    ];
  }

  // Filtered media based on selected tab
  List<MediaItemModel> get filteredMedia {
    final selectedLabel = galleryTabs[selectedGalleryTab.value].label;
    if (selectedLabel == 'All') return _allMedia;
    return _allMedia.where((m) => m.category == selectedLabel).toList();
  }

  void onReviewChanged(int index) => currentReviewIndex.value = index;
  void selectGalleryTab(int index) => selectedGalleryTab.value = index;
}