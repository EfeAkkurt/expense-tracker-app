import React from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { useTheme } from "@/contexts/themeContext";
import { colors, getColors } from "@/constants/theme";

const Loading = () => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      <ActivityIndicator
        size="large"
        color={theme === "light" ? themeColors.navyBlue : colors.primary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loading;
