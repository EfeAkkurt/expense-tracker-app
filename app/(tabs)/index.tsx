import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import Button from "@/components/Button";
import Typo from "@/components/typo";
import {
  colors,
  getColors,
  spacingX,
  spacingY,
  radius,
} from "@/constants/theme";
import { useAuth } from "@/contexts/authContext";
import ScreenWrapper from "@/components/ScreenWrapper";
import { verticalScale } from "@/utils/styling";
import * as Icons from "phosphor-react-native";
import HomeCard from "@/components/HomeCard";
import TransactionList from "@/components/TransactionList";
import { useRouter } from "expo-router";
import {
  Timestamp,
  collection,
  getDocs,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";
import useFetchData from "@/hooks/useFetchData";
import { TransactionType, WalletType } from "@/types";
import HighlightCard from "@/components/HighlightCard";
import { firestore } from "@/config/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "@/contexts/themeContext";

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [financialHighlights, setFinancialHighlights] = useState({
    mostProfitableDay: { day: "Loading...", amount: 0 },
    mostExpensiveDay: { day: "Loading...", amount: 0 },
    mostProfitableMonth: { month: "Loading...", amount: 0 },
    mostExpensiveMonth: { month: "Loading...", amount: 0 },
  });
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  // Cüzdanları çek
  const { data: wallets, loading: walletsLoading } = useFetchData<WalletType>(
    "wallets",
    [where("uid", "==", user?.uid), orderBy("created", "desc")]
  );

  // İşlem filtrelemesi için constraints
  const constraints = [
    where("uid", "==", user?.uid),
    ...(selectedWalletId ? [where("walletId", "==", selectedWalletId)] : []),
    orderBy("date", "desc"),
    limit(30),
  ];

  const {
    data: recentTransactions,
    loading: TransactionsLoading,
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  // Finansal özet verilerini hesapla
  useEffect(() => {
    if (user?.uid) {
      calculateFinancialHighlights();
    }
  }, [user?.uid]);

  // İşlemler güncellendiğinde finansal özeti de güncelle
  useEffect(() => {
    if (user?.uid) {
      calculateFinancialHighlights();
    }
  }, [recentTransactions, selectedWalletId]);

  // Ekran her odaklandığında verileri yenile
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        calculateFinancialHighlights();
      }
    }, [user?.uid, selectedWalletId])
  );

  // Güncel ay ve yıl bilgisi
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Finansal özet verilerini hesaplama fonksiyonu
  const calculateFinancialHighlights = async () => {
    setHighlightsLoading(true);
    try {
      // Tüm işlemleri al - sadece mevcut ay ve yıl için limitleme yok
      const transactionsRef = collection(firestore, "transactions");
      let q;

      if (selectedWalletId) {
        q = query(
          transactionsRef,
          where("uid", "==", user?.uid),
          where("walletId", "==", selectedWalletId)
        );
      } else {
        q = query(transactionsRef, where("uid", "==", user?.uid));
      }

      const querySnapshot = await getDocs(q);
      const allTransactions: TransactionType[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as TransactionType;
        data.id = doc.id;

        // Timestamp'i Date'e çevir
        if (data.date && typeof data.date !== "string") {
          const timestamp = data.date as Timestamp;
          data.date = timestamp.toDate();
        } else if (typeof data.date === "string") {
          data.date = new Date(data.date);
        }

        allTransactions.push(data);
      });

      // Bu ayki işlemler
      const currentMonthTransactions = allTransactions.filter((txn) => {
        const txnDate =
          txn.date instanceof Date ? txn.date : new Date(txn.date as string);
        return (
          txnDate.getMonth() === currentMonth &&
          txnDate.getFullYear() === currentYear
        );
      });

      // Gün-bazlı analiz
      const dayStats = analyzeDayStats(currentMonthTransactions);

      // Ay-bazlı analiz
      const monthStats = analyzeMonthStats(allTransactions);

      setFinancialHighlights({
        mostProfitableDay: dayStats.mostProfitableDay,
        mostExpensiveDay: dayStats.mostExpensiveDay,
        mostProfitableMonth: monthStats.mostProfitableMonth,
        mostExpensiveMonth: monthStats.mostExpensiveMonth,
      });
    } catch (error) {
      console.error("Financial highlights calculation error:", error);
    } finally {
      setHighlightsLoading(false);
    }
  };

  // Gün bazlı istatistikleri analiz et
  const analyzeDayStats = (transactions: TransactionType[]) => {
    const dayMap: { [key: string]: { income: number; expense: number } } = {};
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    // İşlemleri günlere göre grupla
    transactions.forEach((txn) => {
      const txnDate =
        txn.date instanceof Date ? txn.date : new Date(txn.date as string);
      const dayOfWeek = daysOfWeek[txnDate.getDay()];

      if (!dayMap[dayOfWeek]) {
        dayMap[dayOfWeek] = { income: 0, expense: 0 };
      }

      if (txn.type === "income") {
        dayMap[dayOfWeek].income += txn.amount;
      } else {
        dayMap[dayOfWeek].expense += txn.amount;
      }
    });

    // En kazançlı ve en masraflı günü bul
    let maxIncome = 0;
    let maxExpense = 0;
    let mostProfitableDay = { day: "N/A", amount: 0 };
    let mostExpensiveDay = { day: "N/A", amount: 0 };

    Object.entries(dayMap).forEach(([day, stats]) => {
      if (stats.income > maxIncome) {
        maxIncome = stats.income;
        mostProfitableDay = { day, amount: Math.round(stats.income) };
      }

      if (stats.expense > maxExpense) {
        maxExpense = stats.expense;
        mostExpensiveDay = { day, amount: Math.round(stats.expense) };
      }
    });

    return { mostProfitableDay, mostExpensiveDay };
  };

  // Ay bazlı istatistikleri analiz et
  const analyzeMonthStats = (transactions: TransactionType[]) => {
    const monthMap: { [key: string]: { income: number; expense: number } } = {};
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // İşlemleri aylara göre grupla
    transactions.forEach((txn) => {
      const txnDate =
        txn.date instanceof Date ? txn.date : new Date(txn.date as string);
      const month = monthNames[txnDate.getMonth()];
      const year = txnDate.getFullYear();
      const monthKey = `${month} ${year}`;

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { income: 0, expense: 0 };
      }

      if (txn.type === "income") {
        monthMap[monthKey].income += txn.amount;
      } else {
        monthMap[monthKey].expense += txn.amount;
      }
    });

    // En kazançlı ve en masraflı ayı bul
    let maxIncome = 0;
    let maxExpense = 0;
    let mostProfitableMonth = { month: "N/A", amount: 0 };
    let mostExpensiveMonth = { month: "N/A", amount: 0 };

    Object.entries(monthMap).forEach(([monthKey, stats]) => {
      // İsim kısmını al (yıl olmadan)
      const monthName = monthKey.split(" ")[0];

      if (stats.income > maxIncome) {
        maxIncome = stats.income;
        mostProfitableMonth = {
          month: monthName,
          amount: Math.round(stats.income),
        };
      }

      if (stats.expense > maxExpense) {
        maxExpense = stats.expense;
        mostExpensiveMonth = {
          month: monthName,
          amount: Math.round(stats.expense),
        };
      }
    });

    return { mostProfitableMonth, mostExpensiveMonth };
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/*HELlO + SEARCH*/}
        <View style={styles.header}>
          <View>
            <Typo size={16} color={themeColors.textLight}>
              Hello,
            </Typo>
            <Typo size={20} fontWeight={"600"} color={themeColors.text}>
              {user?.name}!
            </Typo>
          </View>
          <TouchableOpacity
            style={[
              styles.searchBtn,
              {
                backgroundColor:
                  theme === "dark"
                    ? colors.neutral800
                    : themeColors.veryLightBlue,
              },
            ]}
            onPress={() => router.push("/(modals)/searchModal")}
          >
            <Icons.MagnifyingGlass
              color={
                theme === "dark"
                  ? colors.neutral300
                  : themeColors.navigationIcon
              }
            />
            <Typo
              size={14}
              color={
                theme === "dark" ? colors.neutral300 : themeColors.textLight
              }
            >
              Search
            </Typo>
          </TouchableOpacity>
        </View>

        {/*HOME CARD*/}
        <HomeCard
          selectedWalletId={selectedWalletId}
          setSelectedWalletId={setSelectedWalletId}
        />

        {/*HIGHLIGHTS*/}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.highlightsScrollView}
        >
          <HighlightCard
            title={"Most profitable day"}
            value={financialHighlights.mostProfitableDay.day}
            amount={financialHighlights.mostProfitableDay.amount}
            loading={highlightsLoading}
            icon={
              <Icons.TrendUp
                size={24}
                color={themeColors.white}
                weight="fill"
              />
            }
            bgColor={theme === "dark" ? colors.green : "#16a34a"}
          />
          <HighlightCard
            title={"Most expensive day"}
            value={financialHighlights.mostExpensiveDay.day}
            amount={financialHighlights.mostExpensiveDay.amount}
            loading={highlightsLoading}
            icon={
              <Icons.TrendDown
                size={24}
                color={themeColors.white}
                weight="fill"
              />
            }
            bgColor={theme === "dark" ? colors.rose : "#ef4444"}
          />
          <HighlightCard
            title={"Most profitable month"}
            value={financialHighlights.mostProfitableMonth.month}
            amount={financialHighlights.mostProfitableMonth.amount}
            loading={highlightsLoading}
            icon={
              <Icons.CalendarCheck
                size={24}
                color={themeColors.white}
                weight="fill"
              />
            }
            bgColor={
              theme === "dark" ? colors.primaryDark : themeColors.buttonBg
            }
          />
          <HighlightCard
            title={"Most expensive month"}
            value={financialHighlights.mostExpensiveMonth.month}
            amount={financialHighlights.mostExpensiveMonth.amount}
            loading={highlightsLoading}
            icon={
              <Icons.Warning
                size={24}
                color={themeColors.white}
                weight="fill"
              />
            }
            bgColor={theme === "dark" ? "#f97316" : "#f97316"}
          />
        </ScrollView>

        {/*RECENT TRANSACTIONS*/}
        <View style={styles.recentTransactions}>
          <View style={styles.highlightsHeader}>
            <Typo size={18} fontWeight={"600"} color={themeColors.text}>
              Recent Transactions
            </Typo>
          </View>

          <TransactionList
            data={recentTransactions}
            loading={TransactionsLoading}
            emptyListMessage={"No transactions yet!"}
          />
        </View>
      </ScrollView>

      {/* Floating Action Button for adding transactions */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor:
              theme === "dark" ? colors.primary : themeColors.addButtonBg,
          },
        ]}
        onPress={() => router.push("/(modals)/transactionModal")}
      >
        <Icons.Plus
          size={verticalScale(24)}
          color={themeColors.white}
          weight="bold"
        />
      </TouchableOpacity>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacingX._10,
    borderRadius: 50,
    gap: spacingX._5,
  },
  highlights: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
  highlightsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },
  highlightsScrollView: {
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._5,
    gap: spacingX._10,
  },
  recentTransactions: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
  fab: {
    position: "absolute",
    bottom: verticalScale(20),
    right: spacingX._20,
    width: verticalScale(56),
    height: verticalScale(56),
    borderRadius: verticalScale(28),
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
