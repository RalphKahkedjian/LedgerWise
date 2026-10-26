import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";

import { COLORS } from "../constants/colors";
import { hasValidSession } from "../services/auth";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean | null>(null);

  useEffect(() => {
    async function checkSession() {
      console.log("Checking authentication session...");

      try {
        const valid = await hasValidSession();

        console.log("Session valid:", valid);
        setIsAuthenticated(valid);
      } catch (error) {
        console.error("Session check failed:", error);
        setIsAuthenticated(false);
      }
    }

    checkSession();
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
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Redirect href={isAuthenticated ? "/dashboard" : "/login"} />
  );
}