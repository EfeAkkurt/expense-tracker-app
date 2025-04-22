import { Platform, StyleSheet, Text, View } from "react-native";
import React from "react";
import { colors, getColors, spacingY } from "@/constants/theme";
import { ModalWrapperProps } from "@/types";
import { useTheme } from "@/contexts/themeContext";

const isIOS = Platform.OS == "ios";

const ModalWrapper = ({ style, children, bg }: ModalWrapperProps) => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  // Use provided bg, or fallback to theme background color
  const backgroundColor =
    bg || (theme === "dark" ? themeColors.background : themeColors.white);

  return (
    <View style={[styles.container, { backgroundColor }, style && style]}>
      {children}
    </View>
  );
};

export default ModalWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isIOS ? spacingY._15 : 20,
    paddingBottom: isIOS ? spacingY._20 : spacingY._10,
  },
});
