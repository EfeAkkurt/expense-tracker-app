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

const Register = () => {
  {
    /* REFERENCES */
  }
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const nameRef = useRef("");

  {
    /* LOGIN CONTROL */
  }
  const handleSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Sign Up", "Please fill al the fields");
      return;
    }
    console.log("Name: ", nameRef.current);
    console.log("Email: ", emailRef.current);
    console.log("Password: ", passwordRef.current);
    console.log("good to go");
  };

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* BACK BUTTON */}
        <BackButton iconSize={28} />

        <View style={{ gap: 5, marginTop: spacingY._20 }}>
          <Typo size={30} fontWeight={"800"}>
            Let's
          </Typo>
          <Typo size={30} fontWeight={"800"}>
            Get Started
          </Typo>
        </View>
      </View>

      {/* FORM */}

      <View style={styles.form}>
        <Typo size={16} color={colors.textLighter}>
          Create An Account To Track Your Expenses
        </Typo>

        {/* INPUT */}
        <Input
          placeholder="Enter Your Name"
          onChangeText={(value) => (nameRef.current = value)} // referans değere girilen name değerini atıyor
          icon={
            <Icons.User
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />
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
          onChangeText={(value) => (passwordRef.current = value)} // referans değere girilen password değerini atıyor
          icon={
            <Icons.Lock
              size={verticalScale(26)}
              color={colors.neutral300}
              weight="fill"
            />
          }
        />

        {/*SIGN UP BUTTON */}
        <Button loading={isLoading} onPress={handleSubmit}>
          <Typo fontWeight={"700"} size={21} color={colors.black}>
            Sign Up
          </Typo>
        </Button>

        {/*FOOTER*/}

        <View style={styles.footer}>
          <Typo size={15}>
            Already have an account?
            <Pressable onPress={() => router.navigate("/(auth)/login")}>
              <Typo size={15} color={colors.primary} fontWeight={"700"}>
                Login
              </Typo>
            </Pressable>
          </Typo>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Register;

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
