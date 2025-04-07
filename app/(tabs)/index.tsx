import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/config/firebase";
import Button from "@/components/Button";
import Typo from "@/components/typo";
import { colors } from "@/constants/theme";
import { useAuth } from "@/contexts/authContexts";

const Home = () => {
  const { user } = useAuth();

  console.log("user: ", user);
  //EXIT
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <View>
      <Text>Home</Text>
      <Button onPress={handleLogout}>
        <Typo color={colors.black}>Logout</Typo>
      </Button>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});
