import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/constants/theme";

interface SwitchButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
}

const SwitchButton = ({ isEnabled, onToggle }: SwitchButtonProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      style={styles.container}
    >
      <View style={[styles.toggleSlot, isEnabled && styles.toggleSlotActive]}>
        <View style={styles.sunIconWrapper}>
          <Feather
            name="sun"
            size={16}
            color="#ffbb52"
            style={styles.sunIcon}
          />
        </View>
        <View
          style={[styles.toggleButton, isEnabled && styles.toggleButtonActive]}
        />
        <View style={styles.moonIconWrapper}>
          <Feather
            name="moon"
            size={16}
            color="white"
            style={styles.moonIcon}
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
    backgroundColor: "white",
    justifyContent: "center",
  },
  toggleSlotActive: {
    backgroundColor: "#374151",
  },
  toggleButton: {
    position: "absolute",
    left: 3,
    height: 22,
    width: 22,
    borderRadius: 22,
    backgroundColor: "#ffeccf",
    shadowColor: "#ffbb52",
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#485367",
    shadowColor: "white",
    transform: [{ translateX: 28 }],
  },
  sunIconWrapper: {
    position: "absolute",
    left: 6,
    opacity: 1,
    zIndex: 1,
  },
  sunIcon: {
    color: "#ffbb52",
  },
  moonIconWrapper: {
    position: "absolute",
    right: 6,
    opacity: 0.5,
    zIndex: 1,
  },
  moonIcon: {
    color: "white",
  },
});

export default SwitchButton;
