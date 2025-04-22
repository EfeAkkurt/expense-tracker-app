import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import React, { useState } from "react";
import Typo from "./typo";
import { scale, verticalScale } from "@/utils/styling";
import {
  colors,
  getColors,
  radius,
  spacingX,
  spacingY,
} from "@/constants/theme";
import * as Icons from "phosphor-react-native";
import { orderBy, where } from "firebase/firestore";
import useFetchData from "@/hooks/useFetchData";
import { WalletType } from "@/types";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";

interface HomeCardProps {
  selectedWalletId?: string | null;
  setSelectedWalletId?: React.Dispatch<React.SetStateAction<string | null>>;
}

const HomeCard = ({ selectedWalletId, setSelectedWalletId }: HomeCardProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeColors = getColors(theme);
  const [showWalletSelector, setShowWalletSelector] = useState(false);

  const {
    data: wallets,
    loading: walletLoading,
    error,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const getTotals = () => {
    // Eğer belirli bir cüzdan seçilmişse sadece onun verilerini göster
    if (selectedWalletId) {
      const selectedWallet = wallets.find(
        (wallet) => wallet.id === selectedWalletId
      );
      if (selectedWallet) {
        return {
          Balance: Number(selectedWallet.amount) || 0,
          Income: Number(selectedWallet.totalIncome) || 0,
          Expenses: Number(selectedWallet.totalExpenses) || 0,
        };
      }
      return { Balance: 0, Income: 0, Expenses: 0 };
    }

    // Tüm cüzdanların toplamı
    return wallets.reduce(
      (totals: any, item: WalletType) => {
        totals.Balance = totals.Balance + Number(item.amount || 0);
        totals.Income = totals.Income + Number(item.totalIncome || 0);
        totals.Expenses = totals.Expenses + Number(item.totalExpenses || 0);
        return totals;
      },
      {
        Balance: 0,
        Income: 0,
        Expenses: 0,
      }
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/card.png")}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        {/* Total Balance */}
        <View style={styles.totalBalanceRow}>
          <Typo size={17} color={colors.neutral800} fontWeight={"500"}>
            {selectedWalletId
              ? wallets.find((w) => w.id === selectedWalletId)?.name ||
                "Selected Wallet"
              : "Total Balance"}
          </Typo>
          <TouchableOpacity onPress={() => setShowWalletSelector(true)}>
            <Icons.DotsThreeOutline
              size={verticalScale(22)}
              color={colors.black}
              weight="fill"
            />
          </TouchableOpacity>
        </View>
        <Typo size={30} color={colors.black} fontWeight={"bold"}>
          ${walletLoading ? "----" : getTotals()?.Balance?.toFixed(2)}
        </Typo>

        {/* Total Expense and Income */}
        <View style={styles.stats}>
          {/* Income */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowDown
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Income
              </Typo>
            </View>
            <View style={{ alignItems: "center" }}>
              <Typo
                size={17}
                color={theme === "dark" ? colors.green : "#16a34a"}
                fontWeight={"600"}
              >
                ${walletLoading ? "----" : getTotals()?.Income?.toFixed(2)}
              </Typo>
            </View>
          </View>
          {/* Expense */}
          <View style={{ gap: verticalScale(5) }}>
            <View style={styles.incomeExpense}>
              <View style={styles.statsIcon}>
                <Icons.ArrowUp
                  size={verticalScale(15)}
                  color={colors.black}
                  weight="bold"
                />
              </View>
              <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                Expense
              </Typo>
            </View>
            <View style={{ alignItems: "center" }}>
              <Typo size={17} color={colors.rose} fontWeight={"600"}>
                ${walletLoading ? "----" : getTotals()?.Expenses?.toFixed(2)}
              </Typo>
            </View>
          </View>
        </View>
      </View>

      {/* Wallet Selector Modal */}
      <Modal
        visible={showWalletSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWalletSelector(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWalletSelector(false)}
        >
          <View
            style={[
              styles.walletDropdown,
              {
                backgroundColor:
                  theme === "dark" ? colors.neutral800 : themeColors.navyBlue,
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.walletOption,
                !selectedWalletId && styles.selectedWalletOption,
              ]}
              onPress={() => {
                if (setSelectedWalletId) {
                  setSelectedWalletId(null);
                }
                setShowWalletSelector(false);
              }}
            >
              <Icons.Wallet
                size={verticalScale(16)}
                color={themeColors.white}
              />
              <Typo size={14} color={themeColors.white}>
                All Wallets
              </Typo>
            </TouchableOpacity>

            {wallets?.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[
                  styles.walletOption,
                  selectedWalletId === wallet.id && styles.selectedWalletOption,
                ]}
                onPress={() => {
                  if (wallet.id && setSelectedWalletId) {
                    setSelectedWalletId(wallet.id);
                  }
                  setShowWalletSelector(false);
                }}
              >
                <Icons.Wallet
                  size={verticalScale(16)}
                  color={themeColors.white}
                />
                <Typo size={14} color={themeColors.white}>
                  {wallet.name}
                </Typo>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  bgImage: {
    height: scale(210),
    width: "100%",
  },
  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: "87%",
    width: "100%",
    justifyContent: "space-between",
  },
  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  walletDropdown: {
    borderRadius: radius._12,
    padding: spacingX._10,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._7,
    paddingHorizontal: spacingX._5,
    borderRadius: radius._10,
    gap: spacingX._7,
  },
  selectedWalletOption: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
});
