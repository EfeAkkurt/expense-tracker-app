import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { verticalScale, scale } from "@/utils/styling";
import Typo from "./typo";
import * as Icons from "phosphor-react-native";

interface HighlightItemProps {
  title: string;
  value: string;
  subtitle: string;
  iconName: keyof typeof Icons;
  color: string;
}

const HighlightItem = ({
  title,
  value,
  subtitle,
  iconName,
  color,
}: HighlightItemProps) => {
  const Icon = Icons[iconName] as any;

  return (
    <View style={styles.highlightItem}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Icon size={verticalScale(22)} color="white" weight="fill" />
      </View>
      <View style={styles.contentContainer}>
        <Typo size={12} color={colors.neutral350}>
          {title}
        </Typo>
        <Typo size={16} fontWeight="bold" color={colors.white}>
          {value}
        </Typo>
        <Typo size={11} color={colors.neutral350}>
          {subtitle}
        </Typo>
      </View>
    </View>
  );
};

interface HighlightCardProps {
  mostProfitableDay?: {
    day: string;
    amount: number;
  };
  mostExpensiveDay?: {
    day: string;
    amount: number;
  };
  mostProfitableMonth?: {
    month: string;
    amount: number;
  };
  mostExpensiveMonth?: {
    month: string;
    amount: number;
  };
}

const HighlightCard = ({
  mostProfitableDay = { day: "Friday", amount: 532 },
  mostExpensiveDay = { day: "Saturday", amount: 285 },
  mostProfitableMonth = { month: "March", amount: 2458 },
  mostExpensiveMonth = { month: "July", amount: 1670 },
}: HighlightCardProps) => {
  const highlights: HighlightItemProps[] = [
    {
      title: "Most gains this month",
      value: `$${mostProfitableDay.amount}`,
      subtitle: `${mostProfitableDay.day}`,
      iconName: "ArrowUp",
      color: colors.primary,
    },
    {
      title: "Most expensive day this month",
      value: `$${mostExpensiveDay.amount}`,
      subtitle: `${mostExpensiveDay.day}`,
      iconName: "ArrowDown",
      color: colors.rose,
    },
    {
      title: "Most profitable month",
      value: `$${mostProfitableMonth.amount}`,
      subtitle: `${mostProfitableMonth.month}`,
      iconName: "CalendarPlus",
      color: colors.primary,
    },
    {
      title: "Most expensive month",
      value: `$${mostExpensiveMonth.amount}`,
      subtitle: `${mostExpensiveMonth.month}`,
      iconName: "CalendarMinus",
      color: colors.rose,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Typo size={18} fontWeight="500">
          Financial Summary
        </Typo>
        {/* <TouchableOpacity>
          <Icons.Info size={verticalScale(18)} color={colors.neutral350} />
        </TouchableOpacity> */}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {highlights.map((item, index) => (
          <HighlightItem
            key={index}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            iconName={item.iconName}
            color={item.color}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacingY._10,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  scrollContainer: {
    paddingRight: spacingX._20,
  },
  highlightItem: {
    width: scale(160),
    height: verticalScale(90),
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingY._10,
    marginRight: spacingX._10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: verticalScale(40),
    height: verticalScale(40),
    borderRadius: radius._12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacingX._10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
});

export default HighlightCard;
