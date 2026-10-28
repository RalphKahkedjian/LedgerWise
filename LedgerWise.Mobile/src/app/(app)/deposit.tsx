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
import { deposit } from "@/services/wallet";
import { router } from "expo-router";

const QUICK_AMOUNTS = [10, 25, 50, 100];

export default function DepositScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");

  async function handleDeposit() {
    const value = Number(amount.trim());

    if (
      !amount.trim() ||
      !Number.isFinite(value) ||
      value <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(amount.trim())
    ) {
      Alert.alert(
        "Invalid amount",
        "Please enter a positive amount with up to 2 decimal places."
      );
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      await deposit(value);

      Alert.alert("Success", `$${value.toFixed(2)} deposited successfully!`);

      router.push("/dashboard");

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

  const canSubmit = amount.trim().length > 0 && !isLoading;

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

          <Text style={styles.topBarTitle}>Deposit money</Text>

          {/* Spacer keeps the title centered */}
          <View style={styles.backButtonSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* AMOUNT CARD */}
          <View style={styles.amountCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="arrow-down" size={22} color={COLORS.success} />
            </View>

            <Text style={styles.amountLabel}>How much do you want to add?</Text>

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
                accessibilityLabel="Deposit amount"
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
              The amount will be added to your LedgerWise wallet balance.
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
            onPress={handleDeposit}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Deposit"
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Deposit</Text>
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
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  amountLabel: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 14,
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
