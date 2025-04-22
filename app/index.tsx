import { Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { colors, getColors } from "@/constants/theme";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";

const index = () => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);
  // const router = useRouter();
  // useEffect(() => {
  //   setTimeout(() => {
  //     router.push("/(auth)/welcome");
  //   }, 2000);
  // }, []);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.white }]}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require("../assets/images/splashImage.png")}
      />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: "20%",
    aspectRatio: 1,
  },
});
