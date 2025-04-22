import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import Typo from "./typo";
import { HeaderProps } from "@/types";
import * as Icons from "phosphor-react-native";
import { colors } from "@/constants/theme";

const Header = ({
  title = "",
  leftIcon,
  style,
  rightIcon,
  showBackButton,
  onPressBack,
  textColor = colors.text,
}: HeaderProps & {
  showBackButton?: boolean;
  onPressBack?: () => void;
  textColor?: string;
}) => {
  return (
    <View style={[styles.container, style]}>
      {showBackButton && (
        <TouchableOpacity style={styles.backButton} onPress={onPressBack}>
          <Icons.CaretLeft weight="bold" size={24} color={textColor} />
        </TouchableOpacity>
      )}
      {leftIcon && !showBackButton && (
        <View style={styles.leftIcon}>{leftIcon}</View>
      )}
      {title && (
        <Typo
          size={22}
          fontWeight={"600"}
          color={textColor}
          style={{
            textAlign: "center",
            width: leftIcon || showBackButton ? "82%" : "100%",
          }}
        >
          {title}
        </Typo>
      )}
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
  leftIcon: {
    alignSelf: "flex-start",
  },
  backButton: {
    padding: 5,
  },
  rightIcon: {
    position: "absolute",
    right: 0,
  },
});
