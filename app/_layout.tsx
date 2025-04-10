import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { AuthProvider } from "@/contexts/authContexts";

const StackLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="(modals)/profileModal.tsx"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <StackLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({});
