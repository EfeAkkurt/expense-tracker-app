import { StyleSheet, Text, View, TouchableOpacity, Image } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/typo";
import { verticalScale } from "@/utils/styling";
import { colors, getColors, spacingX, spacingY } from "@/constants/theme";
import { Colors } from "react-native/Libraries/NewAppScreen";
import Button from "@/components/Button";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";

const Welcome = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Login button & image*/}
        <View>
          <TouchableOpacity
            onPress={() => router.push("../login")}
            style={styles.loginButton}
          >
            <Typo fontWeight={"500"} color={themeColors.text}>
              Sign in
            </Typo>
          </TouchableOpacity>

          <Animated.Image
            entering={FadeIn.duration(1800)}
            source={require("../../assets/images/welcome.png")}
            style={styles.welcomeImage}
            resizeMode="contain"
          />

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { backgroundColor: themeColors.welcomeFooterBg },
            ]}
          >
            <Animated.View
              entering={FadeInDown.duration(2600).springify().damping(17)}
              style={{ alignItems: "center" }}
            >
              <Typo
                size={30}
                fontWeight={"800"}
                color={theme === "dark" ? themeColors.text : themeColors.text}
              >
                Always take control
              </Typo>
              <Typo
                size={30}
                fontWeight={"800"}
                color={theme === "dark" ? themeColors.text : themeColors.text}
              >
                of your finances
              </Typo>
            </Animated.View>
          </View>
          <Animated.View
            entering={FadeInDown.duration(2000)
              .delay(180)
              .springify()
              .damping(17)}
            style={{ alignItems: "center", gap: 2 }}
          >
            <Typo size={17} color={themeColors.welcomeTextLight}>
              finances must be arranged to set a better
            </Typo>
            <Typo size={17} color={themeColors.welcomeTextLight}>
              lifestyle in future
            </Typo>
          </Animated.View>

          {/* Get started button */}
          <Animated.View
            entering={FadeInDown.duration(3000)
              .delay(360)
              .springify()
              .damping(17)}
            style={styles.buttonContainer}
          >
            <Button
              onPress={() => router.push("../register")}
              style={{ backgroundColor: themeColors.welcomeStartBg }}
            >
              <Typo size={22} color={themeColors.white} fontWeight={"600"}>
                Get Started
              </Typo>
            </Button>
          </Animated.View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacingY._7,
  },
  welcomeImage: {
    width: "100%",
    height: verticalScale(300),
    alignSelf: "center",
    marginTop: verticalScale(100),
  },
  loginButton: {
    alignSelf: "flex-end",
    marginRight: spacingX._20,
  },
  footer: {
    alignItems: "center",
    paddingTop: verticalScale(30),
    paddingBottom: verticalScale(45),
    gap: spacingY._20,
    shadowColor: "white",
    shadowOffset: { width: 0, height: -10 },
    elevation: 10,
    shadowRadius: 25,
    shadowOpacity: 0.15,
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: spacingX._25,
  },
});
