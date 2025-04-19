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
import { colors, radius, spacingX, spacingY } from "@/constants/theme";
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
import { Dropdown } from 'react-native-element-dropdown';
import { transactionTypes, expenseCategories } from "@/constants/data";
import useFetchData from "@/hooks/useFetchData";
import { where, orderBy } from "firebase/firestore";
import DateTimePicker from '@react-native-community/datetimepicker';
import { createOrUpdateTransaction } from "@/services/transactionService";


const TransactionModal = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    error: walletError 
  } = useFetchData<WalletType>("wallets", 
    [
      where("uid", "==", user?.uid), 
      orderBy("created", "desc")
    ]);

    const onDateChange = (event: any, selectedDate: any) => {
      const curreentDate = selectedDate || transaction.date;
      setTransaction({...transaction, date: curreentDate});
      setShowDatePicker(Platform.OS == 'ios' ? true : false);
    };

  const [loading, setLoading] = useState(false);

  const oldTransaction: {name: string, image: string, id: string} = useLocalSearchParams();

  // useEffect(() => {
  //   if(oldTransaction?.id) {
  //     setTransaction({
  //       name: oldTransaction.name,
  //       image: oldTransaction.image,
  //     })
  //   }
  // }, [])

  const onsubmit = async () => {
    const { type, amount, description, category, date, walletId, image } = transaction;

    if(!walletId || !date || !amount || (type === "expense" && !category)) {
      Alert.alert("Transaction", "Please fill all the fields");
      return;
    }
    console.log('good to go');
    let transactionData: TransactionType = {
      type,
      amount,
      description,
      category,
      date,
      walletId,
      image,
      uid: user?.uid,
    }
    console.log("transactionData: ", transactionData);

    //todo: include transaction id for update
    setLoading(true);
    const res = await createOrUpdateTransaction(transactionData);
    console.log("🔍 Transaction result: ", res);

    setLoading(false);
    if(res.success) {
      router.back();
    } else {
      Alert.alert("Transaction", res.msg);
    }
  };

  const onDelete = async () => {
    console.log("delete wallet", oldTransaction?.id);
    if(!oldTransaction?.id) return;
    setLoading(true);
    const res = await deleteWallet(oldTransaction?.id);
    setLoading(false);
    if(res.success) {
      router.back();
    } else {
      Alert.alert("Wallet", res.msg);
    }
  }

  const showDeleteAlert = () => {
    Alert.alert("Delete Wallet", "Are you sure you want to delete this wallet?", [
      {
        text: "Cancel",
        onPress: () => {console.log("cancel delete")},
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: () => onDelete(),
        style: "destructive",
      }
    ])
  }

  return (
    <ModalWrapper>
      <View style={styles.container}>
        <Header
          title={oldTransaction?.id ? "Edit Transaction" : "New Transaction"}
          leftIcon={<BackButton />}
          style={{ marginBottom: spacingY._10 }}
        />
        {/*FORM*/}
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          {/* transactions type */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Type</Typo>
            <Dropdown
          style={styles.dropdownContainer}
          activeColor={colors.neutral800}
          // placeholderStyle={styles.dropdownDownPlaceHolder}
          selectedTextStyle={styles.dropdownSelectedText}
          iconStyle={styles.dropdownIcon}
          data={transactionTypes}
          maxHeight={300}
          labelField="label"
          valueField="value"
          itemTextStyle={styles.dropdownItemText}
          itemContainerStyle={styles.dropdownItemContainer}
          containerStyle={styles.dropdownListContainer}
          // placeholder={!isFocus ? 'Select item' : '...'}
          value={transaction.type}
          onChange={item => {
            setTransaction({ ...transaction, type: item.value });
          }}
        />
          </View>
          {/* wallets */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Wallet</Typo>
            <Dropdown
          style={styles.dropdownContainer}
          activeColor={colors.neutral800}
          placeholderStyle={styles.dropdownDownPlaceHolder}
          selectedTextStyle={styles.dropdownSelectedText}
          iconStyle={styles.dropdownIcon}
          data={wallets.map(wallet=>({
            label: `${wallet?.name} - ($${wallet.amount})`,
            value: wallet?.id,
          }))}
          maxHeight={300}
          labelField="label"
          valueField="value"
          itemTextStyle={styles.dropdownItemText}
          itemContainerStyle={styles.dropdownItemContainer}
          containerStyle={styles.dropdownListContainer}
          placeholder={'Select Wallet'}
          value={transaction.walletId}
          onChange={item => {
            setTransaction({ ...transaction, walletId: item.value || "" });
          }}
        />
          </View>
          {/* Expense Category */}
          {
            transaction.type === "expense" && (
              <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Expense Category</Typo>
            <Dropdown
          style={styles.dropdownContainer}
          activeColor={colors.neutral800}
          placeholderStyle={styles.dropdownDownPlaceHolder}
          selectedTextStyle={styles.dropdownSelectedText}
          iconStyle={styles.dropdownIcon}
          data={Object.values(expenseCategories)}
          maxHeight={300}
          labelField="label"
          valueField="value"
          itemTextStyle={styles.dropdownItemText}
          itemContainerStyle={styles.dropdownItemContainer}
          containerStyle={styles.dropdownListContainer}
          placeholder={'Select Category'}
          value={transaction.category}
          onChange={item => {
                    setTransaction({ ...transaction, category: item.value || "" });
                  }}
                />
              </View>
            )
          }

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200} size={16}>Date</Typo>
            {
              !showDatePicker && (
                <Pressable 
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
                >
                 <Typo size={14}>
                  {(transaction.date as Date).toLocaleDateString()}
                  </Typo> 
                </Pressable>
              )
            }

            {
              showDatePicker && (
                <View style={Platform.OS == 'ios' && styles.iosDatePicker}>
                <DateTimePicker
                themeVariant="dark"
                value={transaction.date as Date}
                textColor={colors.white}
                mode="date"
                display={Platform.OS == 'ios' ? "spinner" : "default"}
                onChange={onDateChange}
                />

                {
                  Platform.OS == 'ios' && (
                    <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(false)}
                    >
                      <Typo size={15} fontWeight="500">
                        Ok
                      </Typo>
                    </TouchableOpacity>
                  )
                }
                </View>
              )
            }
          </View>

          {/* amount */}

          <View style={styles.inputContainer}>
            <Typo color={colors.neutral200}  size={16}>Amount</Typo>
            <Input
              // placeholder="Salary"
              keyboardType="numeric"
              value={transaction.amount.toString()}
              onChangeText={(value) => {
                setTransaction({ ...transaction, amount: Number(value.replace(/[^0-9]/g, ""))});
              }}
            />
          </View>

          {/* description */}

          <View style={styles.inputContainer}>
            <View style={styles.flexRow}>
            <Typo color={colors.neutral200} size={16}>Description</Typo>
            <Typo color={colors.neutral500} size={14}>
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
              }}
              onChangeText={(value) => {
                setTransaction({ ...transaction, description: value });
              }}
            />
          </View>

          <View style={styles.inputContainer}>
          <View style={styles.flexRow}>
            <Typo color={colors.neutral200} size={16}>Receipt</Typo>
            <Typo color={colors.neutral500} size={14}>
              (optional)
            </Typo>
            </View>
            <ImageUpload
              file={transaction.image}
              onClear={() => setTransaction({ ...transaction, image: null })}
              onSelect={(file) => setTransaction({ ...transaction, image: file })}
              placeholder="Upload Image"
            />
          </View>
        </ScrollView>
      </View>
      
      <View style={styles.footer}>
              {oldTransaction?.id && !loading && (
                <Button
                  onPress={showDeleteAlert}
                  style={{ backgroundColor: colors.rose, 
                  paddingHorizontal: spacingX._15 }}
                >
                  <Icons.Trash
                    size={verticalScale(24)}
                    color={colors.white}
                    weight="bold"
                  />
                </Button>
              )}

        <Button onPress={onsubmit} loading={loading} style={{ flex: 1 }}>
          <Typo color={colors.black} fontWeight={"700"}>
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
  form:{
    gap: spacingY._20,
    paddingVertical: spacingY._15,
    paddingBottom: spacingY._40,
  },
  footer:{
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },
  inputContainer:{
    gap: spacingY._10,
  },
  iosDropDown:{
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    fontSize: verticalScale(14),
    borderWidth: 1,
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  androidDropDown:{
    height: verticalScale(54),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    fontSize: verticalScale(14),
    color: colors.white,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
  },
  flexRow:{
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },
  dateInput:{
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: "continuous",
    paddingHorizontal: spacingX._15,
  },
  iosDatePicker:{
    // backgroundColor: "red",
  },
  datePickerButton:{
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingY._15,
    borderRadius: radius._10,
  },
  dropdownContainer:{
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: "continuous",
  },
  dropdownItemText:{color: colors.white},
  dropdownSelectedText:{
    color: colors.white,
    fontSize: verticalScale(14),
  },
  dropdownListContainer:{
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: "continuous",
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },
  dropdownDownPlaceHolder:{
    color: colors.white,
  },
  dropdownItemContainer:{
    borderRadius: radius._15,
    marginHorizontal: spacingX._7,
  },
  dropdownIcon:{
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },
});
