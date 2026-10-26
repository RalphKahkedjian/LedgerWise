
import { useEffect, useState } from "react";
import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

import { hasValidSession } from "../../services/auth";
import { COLORS } from "../../constants/colors";

export default function AppLayout() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuthentication() {
      try {
        const valid = await hasValidSession();
        setIsAuthenticated(valid);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    }

    checkAuthentication();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="transactions" />
    </Stack>
  );
}
