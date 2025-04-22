import {
  Dimensions,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { ScreenWrapperProps } from "@/types";
import { colors, getColors } from "@/constants/theme";
import { useTheme } from "@/contexts/themeContext";

const { height } = Dimensions.get("window"); // android için height alındı

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  // Theme kontekstinden güncel temayı al
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  // types.ts in içinde bir components mevcut screenwrapperprops için
  let paddingTop = Platform.OS === "ios" ? height * 0.06 : 0; // android için 50px padding top verildi ve ios için %6 verildi

  return (
    <View
      style={[
        {
          paddingTop,
          flex: 1,
          backgroundColor: themeColors.background,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={themeColors.background}
      />
      {/* status bar rengi temaya göre ayarlandı */}
      {children}
      {/* children propsu ile gelen componentsler render edilecek */}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({});
