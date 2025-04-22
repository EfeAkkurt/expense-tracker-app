import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
import Typo from "@/components/typo";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { useAuth } from "@/contexts/authContext";
import { where, orderBy } from "firebase/firestore";
import Loading from "@/components/Loading";
import WalletListItem from "@/components/WalletListItem";
import { useTheme } from "@/contexts/themeContext";

const Wallet = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const {
    data: wallets,
    loading,
    error,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  console.log("🚀 ~ Wal ~ wallets:", wallets);

  const getTotalBalance = () =>
    wallets.reduce((total, item) => {
      total = total + (item.amount || 0);
      return total;
    }, 0);
  console.log("🚀 ~ Wallet ~ getTotalBalance:", getTotalBalance());
  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      <View style={styles.container}>
        {/*BALANCE VIEW*/}
        <View
          style={[
            styles.balanceView,
            { backgroundColor: themeColors.totalBalanceBg },
          ]}
        >
          <View style={{ alignItems: "center" }}>
            <Typo size={45} fontWeight={"500"} color={themeColors.white}>
              ${getTotalBalance()?.toFixed(2)}
            </Typo>
            <Typo size={16} color={themeColors.white}>
              Total Balance
            </Typo>
          </View>
        </View>

        {/*WALLETS*/}
        <View
          style={[styles.wallets, { backgroundColor: themeColors.background }]}
        >
          {/*HEADER*/}
          <View style={styles.flexRow}>
            <Typo
              size={20}
              fontWeight={"500"}
              color={
                theme === "dark"
                  ? themeColors.text
                  : themeColors.walletHeaderText
              }
            >
              My Wallets
            </Typo>
            <TouchableOpacity
              onPress={() => router.push("/(modals)/walletModal")}
            >
              <Icons.PlusCircle
                weight="fill"
                color={
                  theme === "dark"
                    ? themeColors.primary
                    : themeColors.primaryDark
                }
                size={verticalScale(33)}
              />
            </TouchableOpacity>
          </View>

          {/*WALLETS LIST*/}
          {loading && <Loading />}
          <FlatList
            data={wallets}
            renderItem={({ item, index }) => {
              return (
                <WalletListItem item={item} index={index} router={router} />
              );
            }}
            contentContainerStyle={styles.listStyle}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Wallet;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  balanceView: {
    height: verticalScale(160),
    justifyContent: "center",
    alignItems: "center",
  },
  flexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  wallets: {
    flex: 1,
    borderTopRightRadius: radius._30,
    borderTopLeftRadius: radius._30,
    padding: spacingX._20,
    paddingTop: spacingX._25,
  },
  listStyle: {
    paddingVertical: spacingY._25,
    paddingTop: spacingY._15,
  },
});
