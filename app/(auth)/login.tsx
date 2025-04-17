import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typo from "@/components/typo";
import { colors, spacingX, spacingY } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import BackButton from "@/components/BackButton";
import Input from "@/components/Input";
import * as Icons from "phosphor-react-native";
import Button from "@/components/Button";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/authContext";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function LoginScreen() {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const { login: loginUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const waitForFirebaseAuthReady = async () => {
    return new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(auth, () => {
        unsub();
        resolve();
      });
    });
  };

  const handleSubmit = async () => {
    await waitForFirebaseAuthReady();
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Login", "Please fill al the fields");
      return;
    }
    setIsLoading(true);
    const res = await loginUser(emailRef.current, passwordRef.current);
    setIsLoading(false);
    if (!res.success) {
      Alert.alert("login:", res.msg);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            Hey
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Welcome back
          </Typo>
        </View>
      </View>

      <View style={styles.form}>
        <Typo size={16} color={colors.textLighter}>
          Login now to track all you expenses
        </Typo>
        <Input
          placeholder="Enter Your Email"
          onChangeText={(value) => (emailRef.current = value)}
          icon={
            <Icons.At
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />
        <Input
          placeholder="Enter Your Password"
          secureTextEntry
          onChangeText={(value) => (passwordRef.current = value)}
          icon={
            <Icons.Lock
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />

        <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>
          Forgot Password?
        </Typo>

        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={"700"} size={21} color={colors.black}>
            Login
          </Typo>
        </Button>

        <View style={styles.footer}>
          <Typo size={15}>
            Don't have an account
            <Pressable onPress={() => router.navigate("/(auth)/register")}>
              <Typo size={15} color={colors.primary} fontWeight={"700"}>
                Sign Up
              </Typo>
            </Pressable>
          </Typo>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacingY._30,
    paddingHorizontal: spacingX._20,
  },
  welcomeText: {
    fontSize: verticalScale(20),
    fontWeight: "bold",
    color: colors.text,
  },
  form: {
    gap: spacingY._20,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: "500",
    color: colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: colors.text,
    fontSize: verticalScale(15),
  },
});
