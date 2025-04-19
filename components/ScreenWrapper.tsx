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
import { colors } from "@/constants/theme";

const { height } = Dimensions.get("window"); // android için height alındı

const ScreenWrapper = ({ style, children }: ScreenWrapperProps) => {
  // types.ts in içinde bir components mevcut screenwrapperprops için
  let paddingTop = Platform.OS === "ios" ? height * 0.06 : 0; // android için 50px padding top verildi ve ios için %6 verildi

  return (
    <View
      style={[
        {
          paddingTop,
          flex: 1,
          backgroundColor: colors.neutral900,
        },
        style,
      ]}
    >
      <StatusBar barStyle={"light-content"} backgroundColor={colors.neutral900}/>
      {/* status bar rengi beyaz yapıldı */}
      {children}
      {/* children propsu ile gelen componentsler render edilecek */}
    </View>
  );
};

export default ScreenWrapper;

const styles = StyleSheet.create({});
