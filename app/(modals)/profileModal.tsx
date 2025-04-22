import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  colors as themeConstants,
  getColors,
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
import { UserDataType } from "@/types";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/authContext";
import { updateUser } from "@/services/UserService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "@/contexts/themeContext";

const ProfileModal = () => {
  const { user, updateUserData } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const colors = getColors(theme);

  const [userData, setUserData] = useState<UserDataType>({
    name: "",
    image: null,
  });

  useEffect(() => {
    setUserData({
      name: user?.name || "",
      image: user?.image || null,
    });
  }, [user]);

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      // allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setUserData({ ...userData, image: result.assets[0] });
    }
  };

  const [loading, setLoading] = useState(false);

  const onsubmit = async () => {
    let { name, image } = userData;
    if (!name.trim()) {
      Alert.alert("User", "Please fill all the fields");
      return;
    }

    setLoading(true);
    const res = await updateUser(user?.uid as string, userData);
    setLoading(false);
    if (res.success) {
      // update user
      updateUserData(user?.uid as string);
      router.back();
    } else {
      Alert.alert("User", res.msg);
    }
  };

  return (
    <ModalWrapper bg={colors.white}>
      <View style={styles.container}>
        <Header
          title="Update Profile"
          leftIcon={
            <BackButton
              iconColor={theme === "dark" ? colors.white : colors.text}
            />
          }
          style={{ marginBottom: spacingY._10 }}
          textColor={theme === "dark" ? colors.white : colors.text}
        />
        {/*FORM*/}
        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.avatarContainer}>
            <Image
              style={[styles.avatar, { borderColor: colors.navyBlue }]}
              source={getProfileImage(userData.image)}
              contentFit="cover"
              transition={100}
            />

            <TouchableOpacity
              onPress={onPickImage}
              style={[styles.editIcon, { backgroundColor: colors.white }]}
            >
              <Icons.Pencil size={verticalScale(20)} color={colors.navyBlue} />
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Typo color={theme === "dark" ? colors.white : colors.text}>
              Name
            </Typo>
            <Input
              placeholder="Name"
              value={userData.name}
              onChangeText={(value) => {
                setUserData({ ...userData, name: value });
              }}
              containerStyle={{
                borderColor: colors.navyBlue,
                backgroundColor:
                  theme === "light" ? colors.white : colors.backgroundLight,
              }}
              inputStyle={{
                color: theme === "dark" ? colors.white : colors.text,
              }}
            />
          </View>
        </ScrollView>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
        <Button
          onPress={onsubmit}
          loading={loading}
          style={{ flex: 1, backgroundColor: colors.navyBlue }}
        >
          <Typo color={colors.white} fontWeight={"700"}>
            Update
          </Typo>
        </Button>
      </View>
    </ModalWrapper>
  );
};

export default ProfileModal;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
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
  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },
  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },
  avatar: {
    alignSelf: "center",
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
  },
  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },
  inputContainer: {
    gap: spacingY._10,
  },
});
