import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import Header from "@/components/Header";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import { BarChart, LineChart } from "react-native-gifted-charts";
import Typo from "@/components/typo";
import Loading from "@/components/Loading";
import { useAuth } from "@/contexts/authContext";
import {
  fetchMonthlyStats,
  fetchWeeklyStats,
  fetchYearlyStats,
} from "@/services/transactionService";
import TransactionList from "@/components/TransactionList";
import SwitchButton from "@/components/SwitchButton";
import * as Icons from "phosphor-react-native";
import {
  where,
  orderBy,
  collection,
  query,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { firestore } from "@/config/firebase";
import { WalletType } from "@/types";
import useFetchData from "@/hooks/useFetchData";
import { useFocusEffect } from "@react-navigation/native";

const Statistics = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { user } = useAuth();
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [chartData, setChartData] = useState([
    {
      value: 40,
      label: "Mon",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
      topLabelComponent: () => (
        <Typo size={8} style={{ marginBottom: 4 }} fontWeight={"bold"}>
          50
        </Typo>
      ),
    },
    {
      value: 20,
      frontColor: colors.rose,
    },
    {
      value: 50,
      label: "Tue",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 40,
      frontColor: colors.rose,
    },
    {
      value: 75,
      label: "Wed",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 25,
      frontColor: colors.rose,
    },
    {
      value: 30,
      label: "Thu",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 20,
      frontColor: colors.rose,
    },
    {
      value: 60,
      label: "Fri",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 40,
      frontColor: colors.rose,
    },
    {
      value: 65,
      label: "Sat",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 30,
      frontColor: colors.rose,
    },
    {
      value: 65,
      label: "Sun",
      spacing: scale(4),
      labelWidth: scale(30),
      frontColor: colors.primary,
    },
    {
      value: 30,
      frontColor: colors.rose,
    },
  ]);
  const [chartLoading, setChartLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLineChart, setIsLineChart] = useState(false);

  // Cüzdanları çek
  const { data: wallets, loading: walletsLoading } = useFetchData<WalletType>(
    "wallets",
    [where("uid", "==", user?.uid), orderBy("created", "desc")]
  );

  // STATS
  useEffect(() => {
    if (activeIndex === 0) {
      getWeeklyStats();
    }
    if (activeIndex === 1) {
      getMonthlyStats();
    }
    if (activeIndex === 2) {
      getYearlyStats();
    }
  }, [activeIndex, selectedWalletId]);

  // Sayfa her odaklandığında verileri yenile
  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        if (activeIndex === 0) {
          getWeeklyStats();
        } else if (activeIndex === 1) {
          getMonthlyStats();
        } else if (activeIndex === 2) {
          getYearlyStats();
        }
      }
    }, [user?.uid, activeIndex, selectedWalletId])
  );

  const getWeeklyStats = async () => {
    setChartLoading(true);
    let res = await fetchWeeklyStats(user?.uid as string, selectedWalletId);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("error :", res.msg);
    }
  };

  const getMonthlyStats = async () => {
    setChartLoading(true);
    let res = await fetchMonthlyStats(user?.uid as string, selectedWalletId);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("error :", res.msg);
    }
  };

  const getYearlyStats = async () => {
    setChartLoading(true);
    let res = await fetchYearlyStats(user?.uid as string, selectedWalletId);
    setChartLoading(false);
    if (res.success) {
      setChartData(res?.data?.stats);
      setTransactions(res?.data?.transactions);
    } else {
      Alert.alert("error :", res.msg);
    }
  };

  const toggleChartType = () => {
    setIsLineChart((prevState) => !prevState);
  };

  // Format for LineChart - transform BarChart data
  const getLineChartData = () => {
    return chartData
      .filter((item) => item.label)
      .map((item) => ({
        value: item.value,
        label: item.label,
        dataPointText: item.value.toString(),
        textColor: colors.neutral350,
        textFontSize: verticalScale(10),
      }));
  };

  // Segmente tıklama işlemi - yükleme sırasında devre dışı bırakmayı yönetir
  const handleSegmentChange = (event) => {
    if (!chartLoading) {
      setActiveIndex(event.nativeEvent.selectedSegmentIndex);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <Header title="Statistics" />
        </View>

        {/* Cüzdan Seçici */}
        <View style={styles.headerOptions}>
          <TouchableOpacity
            onPress={() => setShowWalletSelector(!showWalletSelector)}
            style={styles.walletSelector}
          >
            <Icons.Wallet size={verticalScale(16)} color={colors.primary} />
            <Typo size={14} color={colors.primary}>
              {selectedWalletId
                ? wallets?.find((w) => w.id === selectedWalletId)?.name ||
                  "Loading..."
                : "All Wallets"}
            </Typo>
            <Icons.CaretDown size={verticalScale(12)} color={colors.primary} />
          </TouchableOpacity>
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

            {wallets?.map((wallet) => (
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
          contentContainerStyle={{
            gap: spacingY._20,
            paddingTop: spacingY._5,
            paddingBottom: verticalScale(100),
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={chartLoading ? styles.disabledSegment : {}}>
            <SegmentedControl
              values={["Weekly", "Monthly", "Yearly"]}
              selectedIndex={activeIndex}
              onChange={handleSegmentChange}
              tintColor={colors.neutral200}
              backgroundColor={colors.neutral800}
              appearance="dark"
              activeFontStyle={styles.segmentFontStyle}
              style={[
                styles.segmentStyle,
                chartLoading && styles.segmentDisabled,
              ]}
              fontStyle={{
                ...styles.segmentFontStyle,
                color: chartLoading ? colors.neutral500 : colors.white,
              }}
              enabled={!chartLoading}
            />
          </View>

          <View style={styles.chartHeader}>
            <Typo size={16} fontWeight={"500"}>
              {isLineChart ? "Area Chart" : "Bar Chart"}
            </Typo>
            <SwitchButton
              isEnabled={isLineChart}
              onToggle={toggleChartType}
              disabled={chartLoading}
            />
          </View>

          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              !isLineChart ? (
                <BarChart
                  data={chartData}
                  barWidth={scale(12)}
                  spacing={[1, 2].includes(activeIndex) ? scale(25) : scale(15)}
                  roundedTop
                  roundedBottom
                  hideRules
                  yAxisLabelPrefix="$"
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisLabelWidth={
                    [1, 2].includes(activeIndex) ? scale(38) : scale(35)
                  }
                  yAxisTextStyle={{ color: colors.neutral350 }}
                  xAxisLabelTextStyle={{
                    color: colors.neutral350,
                    fontSize: verticalScale(12),
                  }}
                  noOfSections={3}
                  minHeight={5}
                />
              ) : (
                <LineChart
                  data={getLineChartData()}
                  areaChart
                  curved
                  height={verticalScale(210)}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  spacing={[1, 2].includes(activeIndex) ? scale(38) : scale(35)}
                  showDataPointOnFocus
                  showStripOnFocus
                  focusEnabled
                  startFillColor={colors.primary}
                  endFillColor={colors.primary}
                  startOpacity={0.4}
                  endOpacity={0.1}
                  color={colors.primary}
                  yAxisTextStyle={{ color: colors.neutral350 }}
                  xAxisLabelTextStyle={{
                    color: colors.neutral350,
                    fontSize: verticalScale(12),
                  }}
                  yAxisLabelWidth={
                    [1, 2].includes(activeIndex) ? scale(38) : scale(35)
                  }
                  yAxisLabelPrefix="$"
                  noOfSections={3}
                />
              )
            ) : (
              <View style={styles.noChart} />
            )}

            {chartLoading && (
              <View style={styles.chartLoadingContainer}>
                <Loading />
              </View>
            )}
          </View>

          {/* transactions */}
          <View>
            <Typo size={20} fontWeight={"500"}>
              Transactions
            </Typo>
            <TransactionList
              emptyListMessage="No transactions found"
              data={transactions}
            />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Statistics;

const styles = StyleSheet.create({
  chartContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  chartLoadingContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: radius._12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  header: {},
  noChart: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    height: verticalScale(210),
  },
  searchIcon: {
    backgroundColor: colors.neutral700,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 100,
    height: verticalScale(35),
    width: verticalScale(35),
    borderCurve: "continuous",
  },
  segmentStyle: {
    height: scale(37),
  },
  segmentDisabled: {
    opacity: 0.7,
  },
  segmentFontStyle: {
    fontSize: verticalScale(13),
    fontWeight: "bold",
    color: colors.black,
  },
  disabledSegment: {
    position: "relative",
  },
  container: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._5,
    gap: spacingY._10,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  headerOptions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: spacingY._10,
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
    top: verticalScale(100),
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
