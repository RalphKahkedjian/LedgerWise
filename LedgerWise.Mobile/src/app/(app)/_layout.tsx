
import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";

import { useAuth } from "../../context/AuthContext";
import { COLORS } from "../../constants/colors";

export default function AppLayout() {
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

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="deposit" options={{headerShown: false}} />
      <Stack.Screen name="withdraw" options={{headerShown: false}} />
      <Stack.Screen name="transfer" options={{headerShown: false}} />
    </Stack>
  );
}
