import { StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { useTheme } from "@/contexts/themeContext";
import { getColors, radius, spacingX, spacingY } from "@/constants/theme";
import Typo from "@/components/typo";
import Header from "@/components/Header";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { verticalScale } from "@/utils/styling";

const SettingsModal = () => {
  const { theme, toggleTheme, isSystemTheme, setIsSystemTheme } = useTheme();
  const colors = getColors(theme);
  const router = useRouter();

  return (
    <ScreenWrapper style={{ backgroundColor: colors.background }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Settings"
          style={{ marginVertical: spacingY._10 }}
          showBackButton
          onPressBack={() => router.back()}
          textColor={colors.text}
        />

        <View style={styles.settingsList}>
          {/* Tema Seçenekleri */}
          <View style={styles.section}>
            <Typo
              size={18}
              fontWeight="600"
              color={colors.text}
              style={{ marginBottom: spacingY._15 }}
            >
              View
            </Typo>

            {/* Dark Mode / Light Mode Geçişi */}
            <View
              style={[
                styles.settingItem,
                { backgroundColor: colors.backgroundLight },
              ]}
            >
              <View style={styles.settingContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: theme === "dark" ? "#6366f1" : "#2980b9",
                    },
                  ]}
                >
                  {theme === "dark" ? (
                    <Icons.Moon size={26} color={colors.white} weight="fill" />
                  ) : (
                    <Icons.Sun size={26} color={colors.white} weight="fill" />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Typo size={16} fontWeight="500" color={colors.text}>
                    {theme === "dark" ? "Karanlık Mod" : "Aydınlık Mod"}
                  </Typo>
                  <Typo size={14} color={colors.textLight}>
                    Change application theme
                  </Typo>
                </View>
              </View>
              <Switch
                value={theme === "dark"}
                onValueChange={toggleTheme}
                trackColor={{
                  false: "#767577",
                  true: theme === "dark" ? "#6366f1" : "#2980b9",
                }}
                thumbColor={colors.white}
              />
            </View>

            {/* Sistem Temasını Kullan */}
            <View
              style={[
                styles.settingItem,
                {
                  backgroundColor: colors.backgroundLight,
                  marginTop: spacingY._10,
                },
              ]}
            >
              <View style={styles.settingContent}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isSystemTheme
                        ? "#16a34a"
                        : colors.neutral700,
                    },
                  ]}
                >
                  <Icons.DeviceMobile
                    size={26}
                    color={colors.white}
                    weight="fill"
                  />
                </View>
                <View style={styles.textContainer}>
                  <Typo size={16} fontWeight="500" color={colors.text}>
                    Use system theme
                  </Typo>
                  <Typo size={14} color={colors.textLight}>
                    Automatically change based on device settings
                  </Typo>
                </View>
              </View>
              <Switch
                value={isSystemTheme}
                onValueChange={setIsSystemTheme}
                trackColor={{ false: "#767577", true: "#16a34a" }}
                thumbColor={colors.white}
              />
            </View>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SettingsModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  settingsList: {
    marginTop: spacingY._20,
  },
  section: {
    marginBottom: spacingY._25,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacingY._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    height: verticalScale(44),
    width: verticalScale(44),
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
    marginRight: spacingX._12,
  },
  textContainer: {
    flex: 1,
  },
});
