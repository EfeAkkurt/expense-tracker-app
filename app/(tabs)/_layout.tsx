import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Tabs } from "expo-router";
import CustomTabs from "@/components/CustomTabs";

const _layout = () => {
  return (
    <View>
      <Tabs tabBar={CustomTabs} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="statistics" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </View>
  );
};

export default _layout;

const styles = StyleSheet.create({});
