import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { BackButtonProps } from "@/types";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { colors, radius, getColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";

const BackButton = ({ style, iconSize = 26, iconColor }: BackButtonProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={[
        styles.button,
        {
          backgroundColor:
            theme === "dark" ? colors.neutral600 : themeColors.veryLightBlue,
        },
        style,
      ]}
    >
      {/*back button */}
      <CaretLeft
        size={verticalScale(iconSize)}
        color={iconColor || themeColors.text}
        weight="bold"
      />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    borderRadius: radius._12,
    borderCurve: "continuous",
    padding: 5,
  },
});
