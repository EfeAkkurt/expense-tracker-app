import { View, Platform, TouchableOpacity, StyleSheet } from "react-native";
import {
  useLinkBuilder,
  useTheme as useNavTheme,
} from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { colors, getColors, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import { useTheme } from "@/contexts/themeContext";

export default function MyTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  // Tema sisteminden mevcut temayı al - normal şekilde useTheme hook'unu kullanalım
  // Eğer hook çağrısı hata verirse, varsayılan değerleri kullanacağız
  let theme: "dark" | "light" = "dark"; // varsayılan değer
  let themeColors = getColors(theme);

  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    themeColors = getColors(theme);
  } catch (error) {
    console.log("Theme context not available, using default theme");
  }

  const tabbarIcons: any = {
    index: (isFocused: boolean) => (
      <Icons.House
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={
          isFocused
            ? themeColors.navigationActiveIcon
            : themeColors.navigationIcon
        }
      />
    ),
    statistics: (isFocused: boolean) => (
      <Icons.ChartBar
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={
          isFocused
            ? themeColors.navigationActiveIcon
            : themeColors.navigationIcon
        }
      />
    ),
    wallet: (isFocused: boolean) => (
      <Icons.Wallet
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={
          isFocused
            ? themeColors.navigationActiveIcon
            : themeColors.navigationIcon
        }
      />
    ),
    profile: (isFocused: boolean) => (
      <Icons.User
        size={verticalScale(30)}
        weight={isFocused ? "fill" : "regular"}
        color={
          isFocused
            ? themeColors.navigationActiveIcon
            : themeColors.navigationIcon
        }
      />
    ),
  };

  return (
    <View
      style={[
        styles.tabbar,
        {
          backgroundColor: themeColors.navigationBg,
          borderTopColor: theme === "dark" ? themeColors.neutral700 : "#d1e6fa",
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label: any =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        return (
          <TouchableOpacity
            key={route.name} // Her TouchableOpacity'ye benzersiz key ekle
            // href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabbarItem}
          >
            {tabbarIcons[route.name] && tabbarIcons[route.name](isFocused)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabbar: {
    flexDirection: "row",
    width: "100%",
    height: Platform.OS == "ios" ? verticalScale(73) : verticalScale(55),
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
  },
  tabbarItem: {
    marginBottom: Platform.OS == "ios" ? spacingY._10 : spacingY._5,
    justifyContent: "center",
    alignItems: "center",
  },
});
