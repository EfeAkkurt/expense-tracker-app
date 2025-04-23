import { StyleSheet, Text, View, Platform } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import { colors, getColors } from "@/constants/theme";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";
import { useTheme } from "@/contexts/themeContext";

const _layout = () => {
  let theme: "dark" | "light" = "dark";
  let themeColors = getColors(theme);

  try {
    const { theme: currentTheme } = useTheme();
    theme = currentTheme;
    themeColors = getColors(theme);
  } catch (error) {
    console.log(
      "Theme context not available in tab layout, using default theme"
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.navigationBg,
          borderTopColor: theme === "dark" ? themeColors.neutral700 : "#d1e6fa",
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? verticalScale(83) : verticalScale(60),
        },
        tabBarActiveTintColor: themeColors.navigationActiveIcon,
        tabBarInactiveTintColor: themeColors.navigationIcon,
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const iconSize = verticalScale(30);

          if (route.name === "index") {
            return (
              <Icons.House
                size={iconSize}
                weight={focused ? "fill" : "regular"}
                color={color}
              />
            );
          } else if (route.name === "statistics") {
            return (
              <Icons.ChartBar
                size={iconSize}
                weight={focused ? "fill" : "regular"}
                color={color}
              />
            );
          } else if (route.name === "wallet") {
            return (
              <Icons.Wallet
                size={iconSize}
                weight={focused ? "fill" : "regular"}
                color={color}
              />
            );
          } else if (route.name === "goals") {
            return (
              <Icons.Trophy
                size={iconSize}
                weight={focused ? "fill" : "regular"}
                color={color}
              />
            );
          } else if (route.name === "profile") {
            return (
              <Icons.User
                size={iconSize}
                weight={focused ? "fill" : "regular"}
                color={color}
              />
            );
          }
        },
      })}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="statistics" />
      <Tabs.Screen name="wallet" />
      <Tabs.Screen name="goals" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
};

export default _layout;

const styles = StyleSheet.create({});
