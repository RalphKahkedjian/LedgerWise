import { COLORS } from "@/constants/colors";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { transfer } from "@/services/wallet";
import axios from "axios";
import { router } from "expo-router";

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function TransferScreen() {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

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

    if (isLoading) return;

    try {
      setIsLoading(true);
      // Trimmed so stray spaces from typing or pasting don't break the lookup
      await transfer(receiverText, value);

      Alert.alert(
        "Transfer successful",
        `$${value.toFixed(2)} transferred successfully!`
      );

      setReceiverEmail("");
      setAmount("");

      router.push("/dashboard");
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

  const canSubmit =
    receiverEmail.trim().length > 0 && amount.trim().length > 0 && !isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </Pressable>

          <Text style={styles.topBarTitle}>Transfer money</Text>

          {/* Spacer keeps the title centered */}
          <View style={styles.backButtonSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* RECEIVER */}
          <Text style={styles.sectionLabel}>Send to</Text>

          <View
            style={[styles.field, emailFocused && styles.fieldFocused]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={emailFocused ? COLORS.primary : COLORS.placeholder}
            />

            <TextInput
              style={styles.fieldInput}
              placeholder="Receiver email"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={receiverEmail}
              onChangeText={setReceiverEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              accessibilityLabel="Receiver email"
            />
          </View>

          {/* AMOUNT CARD */}
          <Text style={styles.sectionLabel}>Amount</Text>

          <View style={styles.amountCard}>
            <View style={styles.cardIcon}>
              <Ionicons
                name="swap-horizontal"
                size={22}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.amountRow}>
              <Text style={styles.currency}>$</Text>

              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
                maxLength={12}
                selectionColor={COLORS.primary}
                accessibilityLabel="Transfer amount"
              />
            </View>

            {/* QUICK AMOUNTS */}
            <View style={styles.quickRow}>
              {QUICK_AMOUNTS.map((value) => {
                const selected = amount === String(value);

                return (
                  <Pressable
                    key={value}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() => setAmount(String(value))}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextActive]}
                    >
                      ${value}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* INFO NOTE */}
          <View style={styles.note}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={COLORS.secondaryText}
            />
            <Text style={styles.noteText}>
              Double-check the email. The money goes to the LedgerWise account
              registered with it.
            </Text>
          </View>
        </ScrollView>

        {/* FOOTER BUTTON */}
        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.pressed,
            ]}
            onPress={handleTransfer}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Transfer"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Transfer</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonSpacer: {
    width: 44,
    height: 44,
  },

  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 10,
    marginLeft: 4,
  },

  // RECEIVER FIELD
  field: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
    marginBottom: 24,
  },

  fieldFocused: {
    borderColor: COLORS.primary,
  },

  fieldInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.text,
  },

  // AMOUNT CARD
  amountCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },

  currency: {
    fontSize: 40,
    fontWeight: "700",
    color: COLORS.placeholder,
    marginRight: 6,
  },

  amountInput: {
    minWidth: 120,
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1,
    padding: 0,
  },

  // QUICK AMOUNTS
  quickRow: {
    flexDirection: "row",
    gap: 8,
  },

  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  // NOTE
  note: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 6,
  },

  noteText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.secondaryText,
    lineHeight: 19,
  },

  // FOOTER
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },

  button: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});