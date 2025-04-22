import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/typo";
import { colors, getColors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import * as Icons from "phosphor-react-native";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { useTheme } from "@/contexts/themeContext";

export default function RegisterScreen() {
  const { theme } = useTheme();
  const themeColors = getColors(theme);

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();

  const handleRegister = async () => {
    if (!nameRef.current || !emailRef.current || !passwordRef.current) {
      Alert.alert("Register", "Please fill all the fields");
      return;
    }
    setIsLoading(true);
    const res = await registerUser(
      emailRef.current,
      passwordRef.current,
      nameRef.current
    );
    setIsLoading(false);
    if (!res.success) {
      Alert.alert("Registration", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"} color={themeColors.text}>
            Create
          </Typo>
          <Typo size={30} fontWeight={"800"} color={themeColors.text}>
            Account
          </Typo>
        </View>
      </View>

      <View style={styles.form}>
        <Typo size={16} color={themeColors.textLight}>
          Register to get Started
        </Typo>
        <Input
          placeholder="Enter Your Name"
          onChangeText={(value) => (nameRef.current = value)}
          inputStyle={{ color: themeColors.text }}
          containerStyle={{
            borderColor:
              theme === "light" ? themeColors.navyBlue : colors.neutral600,
          }}
          icon={
            <Icons.User
              size={verticalScale(26)}
              color={
                theme === "light" ? themeColors.navyBlue : colors.neutral300
              }
              weight="fill"
            />
          }
        />
        <Input
          placeholder="Enter Your Email"
          onChangeText={(value) => (emailRef.current = value)}
          inputStyle={{ color: themeColors.text }}
          containerStyle={{
            borderColor:
              theme === "light" ? themeColors.navyBlue : colors.neutral600,
          }}
          icon={
            <Icons.At
              size={verticalScale(26)}
              color={
                theme === "light" ? themeColors.navyBlue : colors.neutral300
              }
              weight="fill"
            />
          }
        />
        <Input
          placeholder="Enter Your Password"
          secureTextEntry
          onChangeText={(value) => (passwordRef.current = value)}
          inputStyle={{ color: themeColors.text }}
          containerStyle={{
            borderColor:
              theme === "light" ? themeColors.navyBlue : colors.neutral600,
          }}
          icon={
            <Icons.Lock
              size={verticalScale(26)}
              color={
                theme === "light" ? themeColors.navyBlue : colors.neutral300
              }
              weight="fill"
            />
          }
        />

        <Button
          loading={isLoading}
          onPress={handleRegister}
          style={{ backgroundColor: themeColors.navyBlue }}
        >
          <Typo fontWeight={"700"} size={21} color={themeColors.white}>
            Sign Up
          </Typo>
        </Button>

        <View style={styles.footer}>
          <Typo size={15} color={themeColors.text}>
            Already have an account{" "}
          </Typo>
          <Pressable onPress={() => router.navigate("/(auth)/login")}>
            <Typo
              size={15}
              color={theme === "light" ? themeColors.navyBlue : colors.primary}
              fontWeight={"700"}
            >
              Sign In
            </Typo>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 30,
    paddingHorizontal: spacingX._20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  form: {
    gap: spacingY._20,
    paddingHorizontal: spacingX._20,
    paddingBottom: spacingY._30,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
