import 'package:clicknow/app/utils/device_constants/appColors.dart';
import 'package:flutter/material.dart';

class PhotoAndVideographyServiceFormScreen extends StatelessWidget {
  const PhotoAndVideographyServiceFormScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
        height: double.maxFinite,
        width: double.maxFinite,
        decoration: BoxDecoration(
          gradient: AppColors.primaryGradient,
        ),
        child: Scaffold(
          backgroundColor: Colors.transparent,
        )
    );
  }
}
