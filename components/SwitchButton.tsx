import React, { useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors, getColors, radius } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";

interface SwitchButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const SwitchButton = ({
  isEnabled,
  onToggle,
  disabled = false,
}: SwitchButtonProps) => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  // Create animated value for toggle position
  const toggleAnim = new Animated.Value(isEnabled ? 1 : 0);

  // Update animation when isEnabled changes
  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isEnabled ? 1 : 0,
      friction: 5.5,
      tension: 300,
      useNativeDriver: true,
    }).start();
  }, [isEnabled, toggleAnim]);

  // Interpolate for toggle button position
  const translateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 31],
  });

  // Interpolate for icon opacity
  const barChartOpacity = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.4],
  });

  const areaChartOpacity = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={styles.container}
      disabled={disabled}
    >
      <View
        style={[
          styles.toggleSlot,
          {
            backgroundColor:
              theme === "dark" ? colors.neutral800 : themeColors.navyBlue,
          },
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.sunIconWrapper}>
          <Animated.View style={{ opacity: barChartOpacity }}>
            <AntDesign
              name="barschart"
              size={16}
              color={theme === "dark" ? colors.green : themeColors.white}
              style={[styles.sunIcon, disabled && styles.disabledIcon]}
            />
          </Animated.View>
        </View>
        <Animated.View
          style={[
            styles.toggleButton,
            {
              backgroundColor:
                theme === "dark" ? colors.neutral200 : themeColors.white,
              transform: [{ translateX }],
            },
            isEnabled && {
              backgroundColor:
                theme === "dark" ? colors.green : themeColors.veryLightBlue,
            },
            disabled && styles.disabledButton,
          ]}
        />
        <View style={styles.moonIconWrapper}>
          <Animated.View style={{ opacity: areaChartOpacity }}>
            <AntDesign
              name="areachart"
              size={16}
              color={theme === "dark" ? colors.green : themeColors.white}
              style={[styles.moonIcon, disabled && styles.disabledIcon]}
            />
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  toggleSlot: {
    position: "relative",
    height: 28,
    width: 56,
    borderRadius: 28,
    justifyContent: "center",
  },
  toggleButton: {
    position: "absolute",
    height: 22,
    width: 22,
    borderRadius: 22,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sunIconWrapper: {
    position: "absolute",
    left: 6,
    zIndex: 1,
  },
  sunIcon: {},
  moonIconWrapper: {
    position: "absolute",
    right: 6,
    zIndex: 1,
  },
  moonIcon: {},
  disabled: {
    opacity: 0.5,
  },
  disabledIcon: {
    opacity: 0.5,
  },
  disabledButton: {
    backgroundColor: colors.neutral400,
  },
});

export default SwitchButton;
