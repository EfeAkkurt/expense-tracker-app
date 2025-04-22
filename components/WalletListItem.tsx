import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { verticalScale } from "@/utils/styling";
import { colors, getColors, radius, spacingX } from "@/constants/theme";
import { WalletType } from "@/types";
import { Router } from "expo-router";
import { Image } from "expo-image";
import Typo from "./typo";
import * as Icons from "phosphor-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/contexts/themeContext";

const WalletListItem = ({
  item,
  index,
  router,
}: {
  item: WalletType;
  index: number;
  router: Router;
}) => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const openWallet = () => {
    router.push({
      pathname: "/(modals)/walletModal",
      params: {
        id: item?.id,
        name: item?.name,
        image: item?.image,
      },
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50)
        .springify()
        .damping(13)}
    >
      <TouchableOpacity style={styles.container} onPress={openWallet}>
        <View
          style={[
            styles.imageContainer,
            {
              borderColor:
                theme === "dark" ? themeColors.neutral600 : "#d1e6fa",
            },
          ]}
        >
          <Image
            style={{ flex: 1 }}
            source={item?.image}
            contentFit="cover"
            transition={100}
          />
        </View>
        <View style={styles.nameContainer}>
          <Typo size={16} color={themeColors.text}>
            {item?.name}
          </Typo>
          <Typo size={14} color={themeColors.textLight}>
            {item?.amount}
          </Typo>
        </View>

        <Icons.CaretRight
          size={verticalScale(20)}
          color={
            theme === "dark" ? themeColors.white : themeColors.navigationIcon
          }
          weight="bold"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default WalletListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(17),
  },
  imageContainer: {
    height: verticalScale(40),
    width: verticalScale(40),
    borderWidth: 1,
    borderRadius: radius._12,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginLeft: spacingX._10,
  },
});
