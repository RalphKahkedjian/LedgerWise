import { COLORS } from "@/constants/colors";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deposit } from "@/services/wallet";
import { router } from "expo-router";

export default function DepositScreen() {

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");

  async function handleDeposit() {

    const value = Number(amount.trim());

    if (!amount.trim() || !Number.isFinite(value) || value <= 0 ||  !/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      Alert.alert(
        "Invalid amount",
        "Please enter a positive amount with up to 2 decimal places."
      );
      return;
    }

    if (isLoading)
        return;

    try {
      setIsLoading(true);
      await deposit(value);

      Alert.alert(
        "Success",
        `$${value.toFixed(2)} deposited successfully!`
      );

      router.push("/dashboard")

      setAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);

      Alert.alert(
        "Deposit failed",
        "Unable to complete the deposit. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Deposit Money</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />
      <Pressable
        style={styles.button}
        onPress={handleDeposit}
        disabled={isLoading}
      >
        {isLoading ?
          (
            <ActivityIndicator color="#FFFFFF" />
          ) : 
          (
            <Text style={styles.buttonText}>Deposit</Text>
          )
        }
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 40
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 24
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
})