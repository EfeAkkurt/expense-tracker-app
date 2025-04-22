import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import {
  colors,
  getColors,
  radius,
  spacingX,
  spacingY,
} from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./typo";
import { useTheme } from "@/contexts/themeContext";

interface HighlightCardProps {
  title: string;
  value: string;
  amount: number;
  loading?: boolean;
  icon: React.ReactNode;
  bgColor: string;
}

const HighlightCard = ({
  title,
  value,
  amount,
  loading = false,
  icon,
  bgColor,
}: HighlightCardProps) => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <Typo size={12} color={themeColors.white} style={styles.title}>
            {title}
          </Typo>
          {loading ? (
            <ActivityIndicator color={themeColors.white} size="small" />
          ) : (
            <>
              <Typo size={16} fontWeight="600" color={themeColors.white}>
                {value}
              </Typo>
              <Typo size={15} color={themeColors.white}>
                ${amount}
              </Typo>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default HighlightCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacingY._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    marginRight: spacingX._10,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: spacingY._5,
    opacity: 0.8,
  },
});
