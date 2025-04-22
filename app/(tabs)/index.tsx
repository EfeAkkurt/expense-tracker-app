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
import { colors, spacingX, spacingY, radius } from "@/constants/theme";
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

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello
            </Typo>
            <Typo size={20} fontWeight={"500"}>
              {user?.name}
            </Typo>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => setShowWalletSelector(!showWalletSelector)}
              style={styles.walletSelector}
            >
              <Icons.Wallet size={verticalScale(16)} color={colors.primary} />
              <Typo size={12} color={colors.primary}>
                {selectedWalletId
                  ? wallets.find((w) => w.id === selectedWalletId)?.name ||
                    "Loading..."
                  : "All Wallets"}
              </Typo>
              <Icons.CaretDown
                size={verticalScale(12)}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(modals)/searchModal")}
              style={styles.searchIcon}
            >
              <Icons.MagnifyingGlass
                size={verticalScale(22)}
                color={colors.neutral200}
                weight="bold"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cüzdan Seçici Dropdown */}
        {showWalletSelector && (
          <View style={styles.walletDropdown}>
            <TouchableOpacity
              style={[
                styles.walletOption,
                !selectedWalletId && styles.selectedWalletOption,
              ]}
              onPress={() => {
                setSelectedWalletId(null);
                setShowWalletSelector(false);
              }}
            >
              <Icons.Wallet size={verticalScale(16)} color={colors.white} />
              <Typo size={14}>All Wallets</Typo>
            </TouchableOpacity>

            {wallets.map((wallet) => (
              <TouchableOpacity
                key={wallet.id}
                style={[
                  styles.walletOption,
                  selectedWalletId === wallet.id && styles.selectedWalletOption,
                ]}
                onPress={() => {
                  if (wallet.id) {
                    setSelectedWalletId(wallet.id);
                  }
                  setShowWalletSelector(false);
                }}
              >
                <Icons.Wallet size={verticalScale(16)} color={colors.white} />
                <Typo size={14}>{wallet.name}</Typo>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollViewStyle}
          showsVerticalScrollIndicator={false}
        >
          {/* CARD */}
          <View>
            <HomeCard selectedWalletId={selectedWalletId} />
          </View>

          {/* HIGHLIGHT CARDS */}
          <HighlightCard
            mostProfitableDay={financialHighlights.mostProfitableDay}
            mostExpensiveDay={financialHighlights.mostExpensiveDay}
            mostProfitableMonth={financialHighlights.mostProfitableMonth}
            mostExpensiveMonth={financialHighlights.mostExpensiveMonth}
          />

          <TransactionList
            data={recentTransactions}
            loading={TransactionsLoading}
            emptyListMessage="No transactions added yet!"
            title="Recent Transactions"
          />
        </ScrollView>

        <Button
          style={styles.floatingButton}
          onPress={() => router.push("/(modals)/transactionModal")}
        >
          <Icons.Plus
            color={colors.black}
            size={verticalScale(24)}
            weight="bold"
          />
        </Button>
      </View>
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._10,
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },
  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },
  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
  walletSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral800,
    paddingHorizontal: spacingX._7,
    paddingVertical: spacingY._5,
    borderRadius: 50,
    gap: spacingX._5,
  },
  walletDropdown: {
    position: "absolute",
    top: verticalScale(75),
    left: "auto",
    right: spacingX._20,
    zIndex: 10,
    backgroundColor: colors.neutral800,
    borderRadius: radius._12,
    padding: spacingX._10,
    width: "60%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._7,
    borderRadius: radius._10,
    gap: spacingX._7,
  },
  selectedWalletOption: {
    backgroundColor: colors.neutral700,
  },
});
