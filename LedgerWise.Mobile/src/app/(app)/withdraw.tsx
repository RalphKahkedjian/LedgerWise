import { COLORS } from "@/constants/colors";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withdraw } from "@/services/wallet";
import axios from "axios";
import { router } from "expo-router";

export default function WithdrawScreen() {
  
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleWithdraw() {
    const trimmedAmount = amount.trim();
    const value = Number(trimmedAmount);

    if (
      !/^\d+(\.\d{1,2})?$/.test(trimmedAmount) ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      Alert.alert(
        "Invalid amount",
        "Enter a positive amount with up to 2 decimal places."
      );
      return;
    }

    if (isLoading)
      return;

    try {
      setIsLoading(true);
      await withdraw(value);

      Alert.alert(
        "Success",
        `$${value.toFixed(2)} withdrawn successfully`
      );

      router.push("/dashboard")

      setAmount("");
    } catch(error) {
      console.error("Withdrawal failed:", error);

      let message = "Unable to complete the withdrawal.";

      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;

        if (typeof data === "string") {
          message = data;
        } else if (typeof data?.message === "string") {
          message = data.message;
        }
      }

      Alert.alert("Withdrawal failed", message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        Withdraw Money
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Pressable
        style={styles.button}
        onPress={handleWithdraw}
        disabled={isLoading}
      >
        {isLoading ?
          (
            <ActivityIndicator color="#FFFFFF" />
          ) :
          (
            <Text style={styles.buttonText}>
              Withdraw
            </Text>
          )
        }
      </Pressable>
      
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 24,
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
});