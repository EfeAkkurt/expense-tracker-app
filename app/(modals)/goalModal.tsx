import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  colors,
  getColors,
  radius,
  spacingX,
  spacingY,
} from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import ScreenWrapper from "@/components/ScreenWrapper";
import ModalWrapper from "@/components/ModalWrapper";
import Header from "@/components/Header";
import BackButton from "@/components/BackButton";
import Typo from "@/components/typo";
import { GoalType, WalletType } from "@/types";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import ImageUpload from "@/components/ImageUpload";
import { Dropdown } from "react-native-element-dropdown";
import useFetchData from "@/hooks/useFetchData";
import { where, orderBy, Timestamp } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "@/contexts/themeContext";
import * as Icons from "phosphor-react-native";
import { createOrUpdateGoal, deleteGoal } from "@/services/goalService";
import { SafeAreaView } from "react-native-safe-area-context";

const GoalModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  // Current date as default
  const today = new Date();

  const [goal, setGoal] = useState<GoalType>({
    title: "",
    targetAmount: 0,
    currentAmount: 0,
    targetDate: today,
    description: "",
    walletId: "",
    image: null,
    completed: false,
  });

  const {
    data: wallets,
    loading: walletLoading,
    error: walletError,
  } = useFetchData<WalletType>("wallets", [
    where("uid", "==", user?.uid),
    orderBy("created", "desc"),
  ]);

  const onDateChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate || goal.targetDate;
    setGoal({ ...goal, targetDate: currentDate });
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }
  };

  const [loading, setLoading] = useState(false);

  type paramType = {
    id: string;
    title: string;
    targetAmount: string;
    targetDate: string;
    description?: string;
    image?: string;
    walletId: string;
  };

  const oldGoal: paramType = useLocalSearchParams();

  useEffect(() => {
    if (oldGoal?.id) {
      setGoal({
        title: oldGoal.title,
        targetAmount: Number(oldGoal.targetAmount),
        targetDate: new Date(oldGoal.targetDate),
        description: oldGoal.description || "",
        walletId: oldGoal.walletId,
        image: oldGoal?.image,
        completed: false,
      });
    }
  }, []);

  const onSubmit = async () => {
    const { title, targetAmount, targetDate, description, walletId, image } =
      goal;

    if (!walletId || !targetDate || !targetAmount || !title) {
      Alert.alert("Goal", "Please fill all the required fields");
      return;
    }

    if (targetAmount <= 0) {
      Alert.alert("Goal", "Target amount must be greater than zero");
      return;
    }

    let goalData: GoalType = {
      title,
      targetAmount,
      targetDate,
      description,
      walletId,
      image: image ? image : null,
      uid: user?.uid,
      completed: false,
    };

    if (oldGoal?.id) {
      goalData.id = oldGoal.id;
    }

    setLoading(true);

    const result = await createOrUpdateGoal(goalData);

    setLoading(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert("Goal", result.msg || "Error saving goal");
    }
  };

  const onDelete = async () => {
    if (!oldGoal?.id) return;

    setLoading(true);

    const result = await deleteGoal(oldGoal.id);

    setLoading(false);

    if (result.success) {
      router.back();
    } else {
      Alert.alert("Goal", result.msg || "Error deleting goal");
    }
  };

  const showDeleteAlert = () => {
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      {
        text: "Cancel",
        onPress: () => {
          console.log("cancel delete");
        },
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(),
        style: "destructive",
      },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <ModalWrapper
        bg={theme === "light" ? themeColors.white : themeColors.background}
      >
        <View style={styles.container}>
          <Header
            title={oldGoal?.id ? "Edit Goal" : "New Goal"}
            leftIcon={<BackButton iconColor={themeColors.text} />}
            style={{ marginBottom: spacingY._10 }}
            textColor={themeColors.text}
          />

          {/*FORM*/}
          <ScrollView
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
          >
            {/* Goal title */}
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                fontWeight="600"
              >
                Goal Title*
              </Typo>
              <Input
                placeholder="New Laptop"
                value={goal.title}
                containerStyle={{
                  borderColor:
                    theme === "light" ? themeColors.navyBlue : colors.white,
                }}
                inputStyle={{ color: themeColors.text }}
                onChangeText={(value) => {
                  setGoal({ ...goal, title: value });
                }}
              />
            </View>

            {/* Target amount */}
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                fontWeight="600"
              >
                Target Amount*
              </Typo>
              <Input
                placeholder="1500"
                value={goal.targetAmount ? goal.targetAmount.toString() : ""}
                containerStyle={{
                  borderColor:
                    theme === "light" ? themeColors.navyBlue : colors.white,
                }}
                inputStyle={{ color: themeColors.text }}
                keyboardType="numeric"
                onChangeText={(value) => {
                  setGoal({ ...goal, targetAmount: parseFloat(value) || 0 });
                }}
              />
            </View>

            {/* Target date */}
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                fontWeight="600"
              >
                Target Date*
              </Typo>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  {
                    borderColor:
                      theme === "light" ? themeColors.navyBlue : colors.white,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Typo color={themeColors.text} size={16}>
                  {formatDate(
                    goal.targetDate instanceof Date ? goal.targetDate : today
                  )}
                </Typo>
                <Icons.CalendarBlank size={24} color={themeColors.text} />
              </TouchableOpacity>

              {showDatePicker && (
                <>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={
                      goal.targetDate instanceof Date ? goal.targetDate : today
                    }
                    mode="date"
                    is24Hour={true}
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onDateChange}
                    minimumDate={today}
                  />

                  {Platform.OS === "ios" && (
                    <View style={styles.datePickerButtons}>
                      <TouchableOpacity
                        style={[
                          styles.datePickerButton,
                          {
                            backgroundColor:
                              theme === "light"
                                ? themeColors.navyBlue
                                : colors.primary,
                          },
                        ]}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Typo color={themeColors.white} fontWeight="600">
                          Done
                        </Typo>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                fontWeight="600"
              >
                Description
              </Typo>
              <Input
                placeholder="For work and programming projects"
                value={goal.description}
                containerStyle={{
                  borderColor:
                    theme === "light" ? themeColors.navyBlue : colors.white,
                  height: verticalScale(100),
                }}
                inputStyle={{ color: themeColors.text, height: "100%" }}
                multiline={true}
                onChangeText={(value) => {
                  setGoal({ ...goal, description: value });
                }}
              />
            </View>

            {/* Wallet Selection */}
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                fontWeight="600"
              >
                Select Wallet*
              </Typo>
              <View
                style={[
                  styles.dropdownContainer,
                  {
                    borderColor:
                      theme === "light" ? themeColors.navyBlue : colors.white,
                  },
                ]}
              >
                <Dropdown
                  style={[
                    styles.dropdown,
                    { backgroundColor: themeColors.background },
                  ]}
                  placeholderStyle={[
                    styles.placeholderStyle,
                    { color: themeColors.textLight },
                  ]}
                  selectedTextStyle={[
                    styles.selectedTextStyle,
                    { color: themeColors.text },
                  ]}
                  data={wallets.map((wallet) => ({
                    label: wallet.name,
                    value: wallet.id,
                  }))}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder="Select Wallet"
                  value={goal.walletId}
                  onChange={(item) => {
                    setGoal({ ...goal, walletId: item.value });
                  }}
                />
              </View>
            </View>

            {/* Image Upload */}
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                fontWeight="600"
              >
                Goal Image
              </Typo>
              <ImageUpload
                file={goal.image}
                onClear={() => setGoal({ ...goal, image: null })}
                onSelect={(file) => setGoal({ ...goal, image: file })}
                placeholder="Upload Image"
              />
            </View>
          </ScrollView>
        </View>

        <View
          style={[styles.footer, { borderTopColor: themeColors.borderColor }]}
        >
          {oldGoal?.id && !loading && (
            <Button
              onPress={showDeleteAlert}
              style={{
                backgroundColor: colors.rose,
                paddingHorizontal: spacingX._15,
              }}
            >
              <Icons.Trash
                size={verticalScale(24)}
                color={themeColors.white}
                weight="bold"
              />
            </Button>
          )}

          <Button
            onPress={onSubmit}
            loading={loading}
            style={{
              flex: 1,
              backgroundColor:
                theme === "light" ? themeColors.navyBlue : colors.primary,
            }}
          >
            <Typo color={themeColors.white} fontWeight={"700"}>
              {oldGoal?.id ? "Update Goal" : "Add Goal"}
            </Typo>
          </Button>
        </View>
      </ModalWrapper>
    </SafeAreaView>
  );
};

export default GoalModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  form: {
    gap: spacingY._20,
    paddingBottom: spacingY._30,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
    paddingVertical: spacingY._12,
  },
  datePickerButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: spacingY._10,
  },
  datePickerButton: {
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._10,
    borderRadius: radius._10,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: radius._10,
    paddingHorizontal: spacingX._15,
  },
  dropdown: {
    height: verticalScale(50),
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    gap: spacingX._10,
    paddingHorizontal: spacingX._20,
    paddingVertical: spacingY._15,
    borderTopWidth: 1,
  },
});
