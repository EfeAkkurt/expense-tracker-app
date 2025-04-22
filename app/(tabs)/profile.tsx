import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import {
  colors,
  getColors,
  radius,
  spacingX,
  spacingY,
} from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import Typo from "@/components/typo";
import { useAuth } from "@/contexts/authContext";
import { Image } from "expo-image";
import { getProfileImage } from "@/services/imageServices";
import { accountOptionType } from "@/types";
import * as Icons from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const accountOptions: accountOptionType[] = [
    {
      title: "Edit Profile",
      icon: <Icons.User size={26} color={themeColors.white} weight="fill" />,
      routeName: "/(modals)/profileModal",
      bgColor: theme === "dark" ? "#6366f1" : themeColors.buttonBg,
    },
    {
      title: "Settings",
      icon: <Icons.GearSix size={26} color={themeColors.white} weight="fill" />,
      routeName: "/(modals)/settingsModal",
      bgColor: theme === "dark" ? "#059669" : themeColors.buttonBg,
    },
    {
      title: "Privacy Policy",
      icon: <Icons.Lock size={26} color={themeColors.white} weight="fill" />,
      //routeName: "/(modals)/profileModal",
      bgColor: theme === "dark" ? themeColors.neutral800 : themeColors.buttonBg,
    },
    {
      title: "Logout",
      icon: <Icons.Power size={26} color={themeColors.white} weight="fill" />,
      //routeName: "/(modals)/profileModal",
      bgColor: "#e11d48",
    },
  ];

  const handleLogout = async () => {
    await signOut(auth);
  };

  const showLogoutAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to logout", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel logout"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => handleLogout(),
        style: "destructive",
      },
    ]);
  };

  const handlePress = async (item: accountOptionType) => {
    if (item.title == "Logout") showLogoutAlert();
    if (item.routeName) router.push(item.routeName);
  };

  return (
    <ScreenWrapper>
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        {/* HEADER */}
        <Header
          title="Profile"
          style={{ marginVertical: spacingY._10 }}
          textColor={themeColors.text}
        />
        {/*USER INFO*/}
        <View style={styles.userInfo}>
          {/*AVATAR*/}
          <View>
            {/*USER IMAGE*/}
            <Image
              source={getProfileImage(user?.image)}
              style={styles.avatar}
              contentFit="cover"
              transition={100}
            />
          </View>
          {/*NAME & EMAIL*/}
          <View style={styles.nameContainer}>
            <Typo size={24} fontWeight={"600"} color={themeColors.text}>
              {user?.name}
            </Typo>

            <Typo size={15} color={themeColors.textLight}>
              {user?.email}
            </Typo>
          </View>
        </View>
        {/*ACCOUNT OPTIONS*/}
        <View style={styles.accountOptions}>
          {accountOptions.map((item, index) => {
            return (
              <Animated.View
                key={index.toString()}
                entering={FadeInDown.delay(index * 80)
                  .springify()
                  .damping(24)}
                style={styles.listItem}
              >
                <TouchableOpacity
                  style={styles.flexRow}
                  onPress={() => handlePress(item)}
                >
                  {/*ICON*/}
                  <View
                    style={[
                      styles.listIcon,
                      {
                        backgroundColor: item?.bgColor,
                      },
                    ]}
                  >
                    {item.icon && item.icon}
                  </View>
                  <Typo
                    size={16}
                    style={{ flex: 1 }}
                    fontWeight={"500"}
                    color={themeColors.text}
                  >
                    {item.title}
                  </Typo>
                  <Icons.CaretRight
                    size={verticalScale(20)}
                    weight="bold"
                    color={
                      theme === "dark"
                        ? themeColors.white
                        : themeColors.navigationIcon
                    }
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  userInfo: {
    marginTop: verticalScale(30),
    alignItems: "center",
    gap: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: 5,
  },
  nameContainer: {
    gap: verticalScale(8),
    alignItems: "center",
  },
  listIcon: {
    height: verticalScale(44),
    width: verticalScale(44),
    backgroundColor: colors.neutral500,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  listItem: {
    marginBottom: verticalScale(17),
  },
  accountOptions: {
    marginTop: spacingY._35,
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
});
