
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";

import { logout } from "../../services/auth";
import { COLORS } from "../../constants/colors";

import { useEffect, useState } from "react";
import { getCurrentUser } from "../../services/auth";

export default function DashboardScreen() {

  const [user, setUser] = useState<{
    id?: String;
    name?: String;
    email?: String;
  } | null>(null);


  useEffect(()=>{
    async function loadUser() {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    }

    loadUser();
  }, [])

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert(
        "Logout failed",
        "Unable to sign out. Please try again."
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        LedgerWise Dashboard
      </Text>

      <Text style={styles.subtitle}>
        Welcome back, {user?.name || "User"}!
      </Text>

      <Text style={styles.subtitle}>
        {user?.email || ""}
      </Text>

      <Pressable
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          Sign Out
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 28,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginBottom: 30,
  },

  logoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 35,
    borderRadius: 13,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.surface,
  },
});
