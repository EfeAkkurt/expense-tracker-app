import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import React, { useState, useEffect, useCallback } from "react";
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
import { GoalType, WalletType } from "@/types";
import { useAuth } from "@/contexts/authContext";
import { where, orderBy, Timestamp } from "firebase/firestore";
import Loading from "@/components/Loading";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "@/contexts/themeContext";
import { completeGoal, deleteGoal } from "@/services/goalService";
import { useFocusEffect } from "@react-navigation/native";

const Goals = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeColors = getColors(theme);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch constraints for goals
  const activeGoalsConstraints = [
    where("uid", "==", user?.uid),
    where("completed", "==", false),
    orderBy("created", "desc"),
  ];

  const completedGoalsConstraints = [
    where("uid", "==", user?.uid),
    where("completed", "==", true),
    orderBy("created", "desc"),
  ];

  // Fetch active goals
  const {
    data: activeGoals,
    loading: activeGoalsLoading,
    error: activeGoalsError,
  } = useFetchData<GoalType>("goals", activeGoalsConstraints);

  // Fetch completed goals
  const {
    data: completedGoals,
    loading: completedGoalsLoading,
    error: completedGoalsError,
  } = useFetchData<GoalType>("goals", completedGoalsConstraints);

  // Fetch wallets for dropdown in add goal modal
  const { data: wallets } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      // Force a component re-render when the screen is focused
      setRefreshTrigger((prev) => prev + 1);
    }, [])
  );

  // Function to calculate days left until target date
  const calculateDaysLeft = (targetDate: Date | string | any) => {
    if (!targetDate) return 0;

    let target: Date;

    if (targetDate instanceof Date) {
      target = targetDate;
    } else if (targetDate instanceof Timestamp) {
      target = targetDate.toDate();
    } else {
      target = new Date(targetDate);
    }

    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  // Function to get wallet name by id
  const getWalletName = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    return wallet ? wallet.name : "Unknown Wallet";
  };

  // Navigate to add/edit goal modal
  const handleAddGoal = () => {
    router.push({
      pathname: "/(modals)/goalModal",
    });
  };

  const handleEditGoal = (goal: GoalType) => {
    let targetDate: string = "";

    if (goal.targetDate instanceof Date) {
      targetDate = goal.targetDate.toISOString();
    } else if (goal.targetDate instanceof Timestamp) {
      targetDate = goal.targetDate.toDate().toISOString();
    } else {
      targetDate = new Date().toISOString(); // Fallback
    }

    router.push({
      pathname: "/(modals)/goalModal",
      params: {
        id: goal.id,
        title: goal.title,
        targetAmount: goal.targetAmount.toString(),
        targetDate: targetDate,
        description: goal.description || "",
        image: goal.image,
        walletId: goal.walletId,
      },
    });
  };

  // Handle goal deletion
  const handleDeleteGoal = async (goalId: string) => {
    if (!goalId) return;

    setLoading(true);
    const result = await deleteGoal(goalId);
    setLoading(false);

    if (result.success) {
      // Force a refresh by incrementing the refresh trigger
      setRefreshTrigger((prev) => prev + 1);
    } else {
      Alert.alert("Error", result.msg || "Failed to delete goal");
    }
  };

  // Handle goal completion
  const handleCompleteGoal = async (goalId: string) => {
    if (!goalId) return;

    setLoading(true);
    const result = await completeGoal(goalId);
    setLoading(false);

    if (result.success) {
      // Force a refresh by incrementing the refresh trigger
      setRefreshTrigger((prev) => prev + 1);
    } else {
      Alert.alert("Error", result.msg || "Failed to complete goal");
    }
  };

  // Render goal item
  const renderGoalItem = ({
    item,
    index,
  }: {
    item: GoalType;
    index: number;
  }) => {
    // Calculate days left until target date
    const daysLeft = calculateDaysLeft(item.targetDate);

    // Calculate remaining amount
    const wallet = wallets.find((w) => w.id === item.walletId);
    const walletAmount = wallet?.amount || 0;
    const remainingAmount = Math.max(item.targetAmount - walletAmount, 0);

    // Check if goal can be completed (wallet has enough funds)
    const canComplete = walletAmount >= item.targetAmount;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.goalItem,
          {
            backgroundColor:
              theme === "dark" ? colors.neutral800 : themeColors.navyBlue,
          },
        ]}
      >
        {/* Image */}
        {item.image && (
          <View style={styles.goalImageContainer}>
            <Animated.Image
              source={{ uri: item.image }}
              style={styles.goalImage}
            />
          </View>
        )}

        {/* Goal details */}
        <View style={styles.goalDetails}>
          <View style={styles.goalHeader}>
            <Typo size={18} fontWeight="600" color={themeColors.white}>
              {item.title} {item.completed && "🎉"}
            </Typo>

            <TouchableOpacity onPress={() => handleEditGoal(item)}>
              <Icons.PencilSimple size={20} color={themeColors.white} />
            </TouchableOpacity>
          </View>

          {item.description && (
            <Typo
              size={14}
              color={themeColors.white}
              textProps={{ numberOfLines: 2 }}
            >
              {item.description}
            </Typo>
          )}

          <View style={styles.goalInfoRow}>
            <View style={styles.goalInfoItem}>
              <Icons.Wallet size={16} color={themeColors.white} />
              <Typo size={14} color={themeColors.white}>
                {getWalletName(item.walletId)}
              </Typo>
            </View>

            <View style={styles.goalInfoItem}>
              <Icons.ClockCountdown size={16} color={themeColors.white} />
              <Typo size={14} color={themeColors.white}>
                {daysLeft} days left
              </Typo>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <Typo
              size={18}
              fontWeight="600"
              color={
                canComplete || item.completed ? themeColors.green : colors.rose
              }
            >
              ${item.targetAmount.toFixed(2)}
            </Typo>

            <Typo
              size={14}
              color={
                canComplete || item.completed ? themeColors.green : colors.rose
              }
            >
              ${remainingAmount.toFixed(2)} more needed
            </Typo>
          </View>

          {/* Action buttons */}
          {!item.completed && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => {
                  Alert.alert(
                    "Delete Goal",
                    "Are you sure you want to delete this goal?",
                    [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () => {
                          handleDeleteGoal(item.id!);
                        },
                      },
                    ]
                  );
                }}
              >
                <Typo size={14} color={themeColors.white}>
                  Delete
                </Typo>
              </TouchableOpacity>

              {canComplete && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.completeButton,
                    {
                      backgroundColor:
                        theme === "dark" ? "#059669" : themeColors.green,
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      "Complete Goal",
                      `Mark this goal as completed? $${item.targetAmount.toFixed(
                        2
                      )} will be deducted from your ${getWalletName(
                        item.walletId
                      )} wallet.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Complete",
                          onPress: () => {
                            handleCompleteGoal(item.id!);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Typo size={14} color={themeColors.white}>
                    Complete
                  </Typo>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper style={{ backgroundColor: themeColors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Typo size={24} fontWeight="600" color={themeColors.text}>
            Goals
          </Typo>
          <TouchableOpacity onPress={handleAddGoal}>
            <Icons.PlusCircle
              weight="fill"
              color={
                theme === "dark" ? themeColors.primary : themeColors.primaryDark
              }
              size={verticalScale(33)}
            />
          </TouchableOpacity>
        </View>

        {/* Tab selector */}
        <View style={styles.tabSelector}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "active" && [
                styles.activeTab,
                {
                  borderBottomColor:
                    theme === "dark" ? colors.primary : themeColors.primaryDark,
                },
              ],
            ]}
            onPress={() => setActiveTab("active")}
          >
            <Typo
              size={16}
              fontWeight={activeTab === "active" ? "600" : "400"}
              color={themeColors.text}
            >
              Active Goals
            </Typo>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "completed" && [
                styles.activeTab,
                {
                  borderBottomColor:
                    theme === "dark" ? colors.primary : themeColors.primaryDark,
                },
              ],
            ]}
            onPress={() => setActiveTab("completed")}
          >
            <Typo
              size={16}
              fontWeight={activeTab === "completed" ? "600" : "400"}
              color={themeColors.text}
            >
              Completed
            </Typo>
          </TouchableOpacity>
        </View>

        {/* Goals list */}
        {activeTab === "active" ? (
          <View style={styles.goalsList}>
            {activeGoalsLoading || loading ? (
              <Loading />
            ) : activeGoals.length > 0 ? (
              <FlatList
                data={activeGoals}
                renderItem={renderGoalItem}
                keyExtractor={(item) => item.id || item.title}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icons.Trophy
                  size={70}
                  color={
                    theme === "dark" ? colors.neutral600 : colors.neutral300
                  }
                  weight="thin"
                />
                <Typo
                  size={18}
                  color={themeColors.textLight}
                  style={{ textAlign: "center" }}
                >
                  No active goals yet.{"\n"}Add a new goal to get started!
                </Typo>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.goalsList}>
            {completedGoalsLoading || loading ? (
              <Loading />
            ) : completedGoals.length > 0 ? (
              <FlatList
                data={completedGoals}
                renderItem={renderGoalItem}
                keyExtractor={(item) => item.id || item.title}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Icons.Trophy
                  size={70}
                  color={
                    theme === "dark" ? colors.neutral600 : colors.neutral300
                  }
                  weight="thin"
                />
                <Typo
                  size={18}
                  color={themeColors.textLight}
                  style={{ textAlign: "center" }}
                >
                  No completed goals yet.{"\n"}Complete goals to see them here!
                </Typo>
              </View>
            )}
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Goals;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: spacingY._15,
  },
  tabSelector: {
    flexDirection: "row",
    marginVertical: spacingY._10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral300,
  },
  tab: {
    flex: 1,
    paddingVertical: spacingY._10,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  goalsList: {
    flex: 1,
  },
  listContent: {
    paddingVertical: spacingY._10,
  },
  goalItem: {
    marginBottom: spacingY._15,
    borderRadius: radius._15,
    overflow: "hidden",
  },
  goalImageContainer: {
    height: verticalScale(150),
    width: "100%",
  },
  goalImage: {
    width: "100%",
    height: "100%",
  },
  goalDetails: {
    padding: spacingY._15,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },
  goalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacingY._10,
  },
  goalInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  amountContainer: {
    marginTop: spacingY._15,
    gap: spacingY._5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacingY._15,
    gap: spacingX._10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacingY._10,
    borderRadius: radius._10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButton: {
    backgroundColor: colors.rose,
  },
  completeButton: {
    backgroundColor: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacingY._15,
    marginTop: verticalScale(100),
  },
});
