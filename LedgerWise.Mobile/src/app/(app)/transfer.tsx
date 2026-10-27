import { COLORS } from "@/constants/colors";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { transfer } from "@/services/wallet";
import axios from "axios";


export default function TransferScreen() {

  const [receiverUserId, setReceiverUserId] = useState("")
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleTransfer() {
    const receiverText = receiverUserId.trim();
    const amountText = amount.trim();

    const receiverId = Number(receiverText);
    const value = Number(amountText);

    if (
      !/^[1-9]\d*$/.test(receiverText) ||
      !Number.isSafeInteger(receiverId)
    ) {
      Alert.alert(
        "Invalid receiver",
        "Enter a valid receiver User ID."
      );
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
      await transfer(receiverId, value);

      Alert.alert(
        "Transfer successful",
        `$${value.toFixed(2)} transferred successfully!`
      );

      setReceiverUserId("");
      setAmount("");
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
      <Text style={styles.label}>Receiver User ID</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter receiver ID"
        keyboardType="number-pad"
        value={receiverUserId}
        onChangeText={setReceiverUserId}
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