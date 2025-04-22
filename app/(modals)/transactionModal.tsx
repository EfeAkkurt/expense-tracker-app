import {
  Alert,
  Platform,
  Pressable,
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
import { Image } from "expo-image";
import { getProfileImage } from "@/services/imageServices";
import * as Icons from "phosphor-react-native";
import Typo from "@/components/typo";
import { TransactionType, UserDataType, WalletType } from "@/types";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/UserService";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import ImageUpload from "@/components/ImageUpload";
import { createOrUpdateWallet, deleteWallet } from "@/services/walletService";
import { Dropdown } from "react-native-element-dropdown";
import { transactionTypes, expenseCategories } from "@/constants/data";
import useFetchData from "@/hooks/useFetchData";
import { where, orderBy } from "firebase/firestore";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  createOrUpdateTransaction,
  deleteTransaction,
} from "@/services/transactionService";
import { useTheme } from "@/contexts/themeContext";

const TransactionModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const [transaction, setTransaction] = useState<TransactionType>({
    type: "expense",
    amount: 0,
    description: "",
    category: "",
    date: new Date(),
    walletId: "",
    image: null,
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
    const curreentDate = selectedDate || transaction.date;
    setTransaction({ ...transaction, date: curreentDate });
    setShowDatePicker(Platform.OS == "ios" ? true : false);
  };

  const [loading, setLoading] = useState(false);

  type paramType = {
    id: string;
    type: string;
    amount: string;
    category?: string;
    date: string;
    description?: string;
    image?: string;
    uid?: string;
    walletId: string;
  };

  const oldTransaction: paramType = useLocalSearchParams();

  useEffect(() => {
    if (oldTransaction?.id) {
      console.log("🔍 oldTransaction: ", oldTransaction);
      setTransaction({
        type: oldTransaction?.type,
        amount: Number(oldTransaction.amount),
        category: oldTransaction.category || "",
        description: oldTransaction.description || "",
        date: new Date(),
        walletId: oldTransaction.walletId,
        image: oldTransaction?.image,
      });
    }
  }, []);

  const onsubmit = async () => {
    const { type, amount, description, category, date, walletId, image } =
      transaction;

    if (!walletId || !date || !amount || (type === "expense" && !category)) {
      Alert.alert("Transaction", "Please fill all the fields");
      return;
    }
    console.log("good to go");
    let transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image: image ? image : null,
      uid: user?.uid,
    };

    if (oldTransaction?.id) {
      transactionData.id = oldTransaction.id;
    }
    setLoading(true);
    const res = await createOrUpdateTransaction(transactionData);
    console.log("🔍 Transaction result: ", res);

    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Transaction", res.msg);
    }
  };

  const onDelete = async () => {
    console.log("delete wallet", oldTransaction?.id);
    if (!oldTransaction?.id) return;
    setLoading(true);
    const res = await deleteTransaction(
      oldTransaction?.id,
      oldTransaction?.walletId
    );
    setLoading(false);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Transaction", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert(
      "Delete Wallet",
      "Are you sure you want to delete this wallet?",
      [
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
      ]
    );
  };

  return (
    <ModalWrapper
      bg={theme === "light" ? themeColors.white : themeColors.background}
    >
      <View style={styles.container}>
        <Header
          title={oldTransaction?.id ? "Edit Transaction" : "New Transaction"}
          leftIcon={<BackButton iconColor={themeColors.text} />}
          style={{ marginBottom: spacingY._10 }}
          textColor={themeColors.text}
        />
        {/*FORM*/}
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          {/* transactions type */}
          <View style={styles.inputContainer}>
            <Typo
              color={theme === "light" ? themeColors.navyBlue : colors.white}
              size={16}
              fontWeight="600"
            >
              Type
            </Typo>
            <Dropdown
              style={[
                styles.dropdownContainer,
                {
                  borderColor:
                    theme === "light" ? themeColors.navyBlue : colors.white,
                },
              ]}
              activeColor={
                theme === "dark" ? colors.neutral800 : themeColors.veryLightBlue
              }
              selectedTextStyle={[
                styles.dropdownSelectedText,
                { color: themeColors.text },
              ]}
              iconStyle={styles.dropdownIcon}
              data={transactionTypes}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={[
                styles.dropdownItemText,
                { color: themeColors.text },
              ]}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={[
                styles.dropdownListContainer,
                {
                  backgroundColor:
                    theme === "dark"
                      ? themeColors.background
                      : themeColors.white,
                },
              ]}
              placeholder={"Select Type"}
              value={transaction.type}
              onChange={(item) => {
                setTransaction({ ...transaction, type: item.value });
              }}
            />
          </View>
          {/* wallets */}
          <View style={styles.inputContainer}>
            <Typo
              color={theme === "light" ? themeColors.navyBlue : colors.white}
              size={16}
              fontWeight="600"
            >
              Wallet
            </Typo>
            <Dropdown
              style={[
                styles.dropdownContainer,
                {
                  borderColor:
                    theme === "light" ? themeColors.navyBlue : colors.white,
                },
              ]}
              activeColor={
                theme === "dark" ? colors.neutral800 : themeColors.veryLightBlue
              }
              placeholderStyle={[
                styles.dropdownDownPlaceHolder,
                { color: themeColors.textLight },
              ]}
              selectedTextStyle={[
                styles.dropdownSelectedText,
                { color: themeColors.text },
              ]}
              iconStyle={styles.dropdownIcon}
              data={wallets.map((wallet) => ({
                label: `${wallet?.name} - ($${wallet.amount})`,
                value: wallet?.id,
              }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              itemTextStyle={[
                styles.dropdownItemText,
                { color: themeColors.text },
              ]}
              itemContainerStyle={styles.dropdownItemContainer}
              containerStyle={[
                styles.dropdownListContainer,
                {
                  backgroundColor:
                    theme === "dark"
                      ? themeColors.background
                      : themeColors.white,
                },
              ]}
              placeholder={"Select Wallet"}
              value={transaction.walletId}
              onChange={(item) => {
                setTransaction({ ...transaction, walletId: item.value || "" });
              }}
            />
          </View>
          {/* Expense Category */}
          {transaction.type === "expense" && (
            <View style={styles.inputContainer}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                size={16}
                fontWeight="600"
              >
                Expense Category
              </Typo>
              <Dropdown
                style={[
                  styles.dropdownContainer,
                  {
                    borderColor:
                      theme === "light" ? themeColors.navyBlue : colors.white,
                  },
                ]}
                activeColor={
                  theme === "dark"
                    ? colors.neutral800
                    : themeColors.veryLightBlue
                }
                placeholderStyle={[
                  styles.dropdownDownPlaceHolder,
                  { color: themeColors.textLight },
                ]}
                selectedTextStyle={[
                  styles.dropdownSelectedText,
                  { color: themeColors.text },
                ]}
                iconStyle={styles.dropdownIcon}
                data={Object.values(expenseCategories)}
                maxHeight={300}
                labelField="label"
                valueField="value"
                itemTextStyle={[
                  styles.dropdownItemText,
                  { color: themeColors.text },
                ]}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={[
                  styles.dropdownListContainer,
                  {
                    backgroundColor:
                      theme === "dark"
                        ? themeColors.background
                        : themeColors.white,
                  },
                ]}
                placeholder={"Select Category"}
                value={transaction.category}
                onChange={(item) => {
                  setTransaction({
                    ...transaction,
                    category: item.value || "",
                  });
                }}
              />
            </View>
          )}

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Typo
              color={theme === "light" ? themeColors.navyBlue : colors.white}
              size={16}
              fontWeight="600"
            >
              Date
            </Typo>
            {!showDatePicker && (
              <Pressable
                style={[
                  styles.dateInput,
                  {
                    borderColor:
                      theme === "light" ? themeColors.navyBlue : colors.white,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Typo size={14} color={themeColors.text}>
                  {(transaction.date as Date).toLocaleDateString()}
                </Typo>
              </Pressable>
            )}

            {showDatePicker && (
              <View style={Platform.OS == "ios" && styles.iosDatePicker}>
                <DateTimePicker
                  themeVariant={theme === "dark" ? "dark" : "light"}
                  value={transaction.date as Date}
                  textColor={themeColors.text}
                  mode="date"
                  display={Platform.OS == "ios" ? "spinner" : "default"}
                  onChange={onDateChange}
                />

                {Platform.OS == "ios" && (
                  <TouchableOpacity
                    style={[
                      styles.datePickerButton,
                      { backgroundColor: themeColors.navyBlue },
                    ]}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Typo size={15} fontWeight="500" color={themeColors.white}>
                      Ok
                    </Typo>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          {/* amount */}
          <View style={styles.inputContainer}>
            <Typo
              color={theme === "light" ? themeColors.navyBlue : colors.white}
              size={16}
              fontWeight="600"
            >
              Amount
            </Typo>
            <Input
              // placeholder="Salary"
              keyboardType="numeric"
              value={transaction.amount.toString()}
              containerStyle={{
                borderColor:
                  theme === "light" ? themeColors.navyBlue : colors.white,
              }}
              inputStyle={{ color: themeColors.text }}
              onChangeText={(value) => {
                setTransaction({
                  ...transaction,
                  amount: Number(value.replace(/[^0-9]/g, "")),
                });
              }}
            />
          </View>

          {/* description */}
          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                size={16}
                fontWeight="600"
              >
                Description
              </Typo>
              <Typo color={themeColors.textLight} size={14}>
                (optional)
              </Typo>
            </View>
            <Input
              // placeholder="Salary"
              value={transaction.description}
              multiline
              containerStyle={{
                flexDirection: "row",
                height: verticalScale(100),
                alignItems: "flex-start",
                paddingVertical: 15,
                borderColor:
                  theme === "light" ? themeColors.navyBlue : colors.white,
              }}
              inputStyle={{ color: themeColors.text }}
              onChangeText={(value) => {
                setTransaction({ ...transaction, description: value });
              }}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
              <Typo
                color={theme === "light" ? themeColors.navyBlue : colors.white}
                size={16}
                fontWeight="600"
              >
                Receipt
              </Typo>
              <Typo color={themeColors.textLight} size={14}>
                (optional)
              </Typo>
            </View>
            <ImageUpload
              file={transaction.image}
              onClear={() => setTransaction({ ...transaction, image: null })}
              onSelect={(file) =>
                setTransaction({ ...transaction, image: file })
              }
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>

      <View
        style={[styles.footer, { borderTopColor: themeColors.borderColor }]}
      >
        {oldTransaction?.id && !loading && (
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
          onPress={onsubmit}
          loading={loading}
          style={{
            flex: 1,
            backgroundColor:
              theme === "dark" ? colors.green : themeColors.navyBlue,
          }}
        >
          <Typo color={themeColors.white} fontWeight={"700"}>
            {oldTransaction?.id ? "Update" : "Submit"}
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._20,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  inputContainer: {
    gap: spacingY._10,
  },
  dropdownDownPlaceHolder: {
    fontSize: verticalScale(14),
  },
  iosDropDown: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  androidDropDown: {
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    fontSize: verticalScale(14),
    borderRadius: radius._17,
    borderCurve: "continuous",
  },
  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  iosDatePicker: {
    // backgroundColor: "red",
  },
  datePickerButton: {
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropdownItemText: {
    fontSize: verticalScale(14),
  },
  dropdownSelectedText: {
    fontSize: verticalScale(14),
  },
  dropdownListContainer: {
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
  },
  dropdownItemContainer: {
    // backgroundColor: "transparent",
  },
  dropdownIcon: {
    // color: "red",
  },
});
