import 'package:clicknow/app/getx/controllers/customerBottomNavController.dart';
import 'package:clicknow/app/utils/device_utils/scale_utility.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CustomerBottomNavBar extends StatelessWidget {
  CustomerBottomNavBar({super.key});

  final CustomerBottomNavController bottomNavController = Get.put(
    CustomerBottomNavController(),
  );

  @override
  Widget build(BuildContext context) {
    /// -- Scaling Utility
    final scale = ScalingUtility(context: context);
    scale.setCurrentDeviceSize();

    return Scaffold(
      backgroundColor: Colors.black,

      /// BODY`
      body: Obx(
        () => AnimatedSwitcher(
          duration: const Duration(milliseconds: 250),
          transitionBuilder: (child, animation) =>
              FadeTransition(opacity: animation, child: child),
          child: bottomNavController.screens[bottomNavController.index.value],
        ),
      ),

      /// BOTTOM NAVIGATION
      bottomNavigationBar: Obx(
        () => Container(
          height: scale.getScaledHeight(72),
          padding: EdgeInsets.symmetric(
            horizontal: scale.getScaledWidth(10),
            vertical: scale.getScaledHeight(8),
          ),
          decoration: const BoxDecoration(
            boxShadow: [
              BoxShadow(
                color: Colors.black54,
                blurRadius: 20,
                offset: Offset(0, -5),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              buildNavItem(
                scale: scale,
                index: 0,
                icon: Icons.home_outlined,
                activeIcon: Icons.home,
                label: "Dashboard",
              ),
              buildNavItem(
                scale: scale,
                index: 1,
                icon: Icons.grid_view_outlined,
                activeIcon: Icons.grid_view_rounded,
                label: "Portfolio",
              ),
              buildNavItem(
                scale: scale,
                index: 2,
                icon: Icons.inventory_2_outlined,
                activeIcon: Icons.inventory,
                label: "Bookings",
              ),
              buildNavItem(
                scale: scale,
                index: 3,
                icon: Icons.person_outline,
                activeIcon: Icons.person,
                label: "Profile",
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buildNavItem({
    required ScalingUtility scale,
    required int index,
    required IconData icon,
    required IconData activeIcon,
    required String label,
  }) {
    final bool isActive = bottomNavController.index.value == index;

    return Expanded(
      child: GestureDetector(
        onTap: () => bottomNavController.changeTab(index),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeInOut,
          padding: EdgeInsets.symmetric(vertical: scale.getScaledHeight(8)),
          decoration: BoxDecoration(
            color: isActive
                ? Colors.deepPurple.withValues(alpha: 0.15)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: Icon(
                  isActive ? activeIcon : icon,
                  key: ValueKey(isActive),
                  size: 26,
                  color: isActive ? Colors.deepPurple : Colors.grey,
                ),
              ),
              const SizedBox(height: 4),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  fontSize: scale.getScaledFont(10),
                  fontWeight: FontWeight.w600,
                  color: isActive ? Colors.deepPurple : Colors.grey,
                ),
                child: Text(label),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
