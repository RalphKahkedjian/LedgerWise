import { COLORS } from "@/constants/colors";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { transfer } from "@/services/wallet";
import axios from "axios";
import { router } from "expo-router";


export default function TransferScreen() {

  const [receiverEmail, setReceiverEmail] = useState("")
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleTransfer() {
    const receiverText = receiverEmail.trim();
    const amountText = amount.trim();

    const value = Number(amountText);
    const email = receiverEmail.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid receiver email.");
      return;
    }

    if (
      !/^\d+(\.\d{1,2})?$/.test(amountText) ||
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
      await transfer(receiverEmail, value);

      Alert.alert(
        "Transfer successful",
        `$${value.toFixed(2)} transferred successfully!`
      );

      setReceiverEmail("");
      setAmount("");
      
      router.push("/dashboard")
      
    } catch (error) {
      console.error("Transfer failed:", error);

      let message = "Unable to complete the transfer.";

      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;

        if (typeof data === "string") {
          message = data;
        } else if (typeof data?.message === "string") {
          message = data.message;
        }
      }

      Alert.alert("Transfer failed", message);
    } finally {
      setIsLoading(false);
    }

  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Transfer Money</Text>
      <Text style={styles.label}>Receiver Email</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter receiver email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={receiverEmail}
        onChangeText={setReceiverEmail}
      />

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Pressable
        style={styles.button}
        onPress={handleTransfer}
      >
        <Text style={styles.buttonText}>
          Transfer
        </Text>
      </Pressable>

    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: "700",
  },
});