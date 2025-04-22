import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

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
          isEnabled && styles.toggleSlotActive,
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.sunIconWrapper}>
          <AntDesign
            name="barschart"
            size={16}
            color={colors.primary}
            style={[styles.sunIcon, disabled && styles.disabledIcon]}
          />
        </View>
        <View
          style={[
            styles.toggleButton,
            isEnabled && styles.toggleButtonActive,
            disabled && styles.disabledButton,
          ]}
        />
        <View style={styles.moonIconWrapper}>
          <AntDesign
            name="areachart"
            size={16}
            color="white"
            style={[styles.moonIcon, disabled && styles.disabledIcon]}
          />
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
    backgroundColor: colors.neutral700,
    justifyContent: "center",
  },
  toggleSlotActive: {
    backgroundColor: colors.neutral800,
  },
  toggleButton: {
    position: "absolute",
    left: 3,
    height: 22,
    width: 22,
    borderRadius: 22,
    backgroundColor: colors.neutral200,
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toggleButtonActive: {
    backgroundColor: colors.primary,
    transform: [{ translateX: 28 }],
  },
  sunIconWrapper: {
    position: "absolute",
    left: 6,
    opacity: 1,
    zIndex: 1,
  },
  sunIcon: {
    color: colors.primary,
  },
  moonIconWrapper: {
    position: "absolute",
    right: 6,
    opacity: 0.5,
    zIndex: 1,
  },
  moonIcon: {
    color: colors.white,
  },
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
