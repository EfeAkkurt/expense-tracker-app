import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { colors, getColors, spacingX, spacingY } from "@/constants/theme";
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
import { where } from "firebase/firestore";
import { orderBy } from "firebase/firestore";
import useFetchData from "@/hooks/useFetchData";
import TransactionList from "@/components/TransactionList";
import { useTheme } from "@/contexts/themeContext";

const SearchModal = () => {
  const { user, updateUserData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const constraints = [where("uid", "==", user?.uid), orderBy("date", "desc")];

  const {
    data: allTransactions,
    loading: TransactionsLoading,
    error,
  } = useFetchData<TransactionType>("transactions", constraints);

  const filteredTransactions = allTransactions.filter((item) => {
    if (search.length > 1) {
      if (
        item.category?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.type?.toLowerCase()?.includes(search?.toLowerCase()) ||
        item.amount?.toString()?.includes(search) ||
        item.description?.toLowerCase()?.includes(search?.toLowerCase())
      )
        return true;
    }
    return false;
  });

  return (
    <ModalWrapper
      bg={theme === "light" ? themeColors.white : themeColors.background}
    >
      <View style={styles.container}>
        <Header
          title={"Search"}
          leftIcon={<BackButton iconColor={themeColors.text} />}
          style={{ marginBottom: spacingY._10 }}
          textColor={themeColors.text}
        />
        {/*FORM*/}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
            <Input
              placeholder="Shoes..."
              value={search}
              placeholderTextColor={themeColors.textLight}
              containerStyle={{
                backgroundColor:
                  theme === "dark"
                    ? themeColors.backgroundLight
                    : themeColors.veryLightBlue,
                borderColor: themeColors.borderColor,
              }}
              inputStyle={{ color: themeColors.text }}
              onChangeText={(value) => {
                setSearch(value);
              }}
            />
          </View>

          {/*TRANSACTION LIST*/}
          <View>
            <TransactionList
              loading={TransactionsLoading}
              data={filteredTransactions}
              emptyListMessage="No transactions found"
              title="Search Results"
            />
          </View>
        </ScrollView>
      </View>
    </ModalWrapper>
  );
};

export default SearchModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
  },
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
