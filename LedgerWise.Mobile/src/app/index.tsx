
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../context/AuthContext";
import { COLORS } from "../constants/colors";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
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

  return (
    <Redirect
      href={isAuthenticated ? "/dashboard" : "/login"}
    />
  );
}
