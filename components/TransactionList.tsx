import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import {
  TransactionItemProps,
  TransactionListType,
  TransactionType,
} from "@/types";
import {
  colors,
  getColors,
  radius,
  spacingX,
  spacingY,
} from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import Typo from "./typo";
import { FlashList } from "@shopify/flash-list";
import Loading from "./Loading";
import { expenseCategories, incomeCategory } from "@/constants/data";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useTheme } from "@/contexts/themeContext";

const TransactionList = ({
  data,
  title,
  loading,
  emptyListMessage,
}: TransactionListType) => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);
  const router = useRouter();
  const handleClick = (item: TransactionType) => {
    router.push({
      pathname: "/(modals)/transactionModal",
      params: {
        id: item?.id,
        type: item?.type,
        amount: item?.amount?.toString(),
        category: item?.category,
        date: (item.date as Timestamp)?.toDate()?.toLocaleDateString(),
        description: item?.description,
        image: item?.image,
        uid: item?.uid,
        walletId: item?.walletId,
      },
    });
  };

  return (
    <View style={styles.container}>
      {title && (
        <Typo size={20} fontWeight={"500"} color={themeColors.text}>
          {title}
        </Typo>
      )}
      <View style={styles.list}>
        <FlashList
          data={data}
          renderItem={({ item, index }) => (
            <TransactionItem
              item={item}
              index={index}
              handleClick={handleClick}
            />
          )}
          estimatedItemSize={60}
        />
      </View>

      {!loading && data.length === 0 && (
        <Typo
          size={15}
          color={themeColors.textLight}
          style={{ textAlign: "center", marginTop: spacingY._15 }}
        >
          {emptyListMessage}
        </Typo>
      )}
      {loading && (
        <View style={{ top: verticalScale(100) }}>
          <Loading />
        </View>
      )}
    </View>
  );
};

const TransactionItem = ({
  item,
  index,
  handleClick,
}: TransactionItemProps) => {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  let category =
    item?.type == "income"
      ? incomeCategory
      : expenseCategories[item?.category!];

  const date = (item?.date as Timestamp)?.toDate().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const IconComponent = category.icon;
  //console.log('category: ',category)
  return (
    <Animated.View entering={FadeInDown.delay(index * 75)}>
      <TouchableOpacity
        style={[
          styles.row,
          {
            backgroundColor:
              theme === "dark" ? colors.neutral800 : themeColors.navyBlue,
          },
        ]}
        onPress={() => handleClick(item)}
      >
        <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
          {IconComponent && (
            <IconComponent
              size={verticalScale(25)}
              weight="fill"
              color={colors.white}
            />
          )}
        </View>

        <View style={styles.categoryDes}>
          <Typo size={17} color={themeColors.white}>
            {category.label}
          </Typo>
          <Typo
            size={12}
            color={themeColors.white}
            textProps={{ numberOfLines: 1 }}
          >
            {item?.description}
          </Typo>
        </View>
        <View style={styles.amountDate}>
          <Typo
            fontWeight={"500"}
            color={item?.type == "income" ? colors.primary : colors.rose}
          >
            {`${item?.type == "income" ? "+ $" : "- $"} ${item?.amount}`}
          </Typo>
          <Typo size={13} color={themeColors.white}>
            {date}
          </Typo>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._17,
  },
  list: {
    minHeight: 3,
  },
  row: {
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    gap: spacingX._12,
    marginBottom: spacingY._12,

    // list with background (color is now applied conditionally in the component)
    padding: spacingY._10,
    paddingHorizontal: spacingY._10,
    borderRadius: radius._17,
  },
  icon: {
    height: verticalScale(44),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._12,
    borderCurve: "continuous",
  },
  categoryDes: {
    flex: 1,
    gap: 2.5,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 3,
  },
});
