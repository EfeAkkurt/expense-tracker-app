import { View, Platform, TouchableOpacity } from "react-native";
import { useLinkBuilder, useTheme } from "@react-navigation/native";
import { Text, PlatformPressable } from "@react-navigation/elements";
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from "@react-navigation/bottom-tabs";
import { colors } from "@/constants/theme";

export default function MyTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={{ flexDirection: "row", width: "100%", height: 100 }}>
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
            //href={buildHref(route.name, route.params)}
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ flex: 1 }}
          >
            <Text
              style={{ color: isFocused ? colors.primary : colors.neutral800 }}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
