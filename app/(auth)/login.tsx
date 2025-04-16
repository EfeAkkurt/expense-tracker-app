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
import { useAuth } from "@/contexts/authContexts";
import { auth } from "@/config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Login = () => {
  {
    /* REFERENCES */
  }
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const { login: loginUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const waitForFirebaseAuthReady = async () => {
    return new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(auth, () => {
        unsub();
        resolve();
      });
    });
  };

  {
    /* LOGIN CONTROL */
  }
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
        {/* BACK BUTTON */}
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

      {/* FORM */}

      <View style={styles.form}>
        <Typo size={16} color={colors.textLighter}>
          Login now to track all you expenses
        </Typo>
        {/* INPUT */}
        <Input
          placeholder="Enter Your Email"
          onChangeText={(value) => (emailRef.current = value)} // referans değere girilen email değerini atıyor
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
          onChangeText={(value) => (passwordRef.current = value)} // referans değere girilen password değerini atıyor
          icon={
            <Icons.Lock
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />

        {/*FORGOT PASSWORD*/}
        <Typo size={14} color={colors.text} style={{ alignSelf: "flex-end" }}>
          Forgot Password?
        </Typo>

        {/*LOGİN BUTTON */}
        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={"700"} size={21} color={colors.black}>
            Login
          </Typo>
        </Button>

        {/*FOOTER*/}

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
};

export default Login;

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
