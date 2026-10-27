
import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  getTransactions,
  type WalletTransaction,
} from "@/services/wallet";
import { COLORS } from "@/constants/colors";

function formatMoney(amount: number) {
  return Math.abs(amount).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [transaction, setTransaction] =
    useState<WalletTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTransaction() {
        try {
          setLoading(true);
          setError(null);

          const transactions = await getTransactions();

          const selected = transactions.find(
            (item) => String(item.id) === id
          );

          if (active) {
            setTransaction(selected ?? null);
          }
        } catch (err) {
          console.error("Failed to load transaction:", err);

          if (active) {
            setError("Unable to load transaction details.");
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      loadTransaction();

      return () => {
        active = false;
      };
    }, [id])
  );

  const incoming =
    transaction?.type === "Deposit" ||
    transaction?.type === "Transfer In";

  const isTransfer =
    transaction?.type === "Transfer In" ||
    transaction?.type === "Transfer Out";

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back"
          size={24}
          color={COLORS.text}
        />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      ) : error || !transaction ? (
        <View style={styles.center}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={COLORS.placeholder}
          />
          <Text style={styles.errorText}>
            {error ?? "Transaction not found."}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: incoming
                    ? "#DCFCE7"
                    : "#FEE2E2",
                },
              ]}
            >
              <Ionicons
                name={incoming ? "arrow-down" : "arrow-up"}
                size={28}
                color={
                  incoming ? COLORS.success : COLORS.error
                }
              />
            </View>

            <Text
              style={[
                styles.amount,
                incoming && styles.incomingAmount,
              ]}
            >
              {incoming ? "+" : "−"}
              {formatMoney(transaction.amount)}
            </Text>

            <Text style={styles.transactionType}>
              {transaction.type}
            </Text>

            <View style={styles.statusBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Transaction information
          </Text>

          <View style={styles.detailsCard}>
            {isTransfer && (
              <>
                <DetailRow
                  label={
                    transaction.type === "Transfer In"
                      ? "Sent by"
                      : "Sent to"
                  }
                  value={
                    transaction.counterpartyName ??
                    "Unavailable"
                  }
                />

                <DetailRow
                  label="Email"
                  value={
                    transaction.counterpartyEmail ??
                    "Unavailable"
                  }
                />
              </>
            )}

            <DetailRow
              label="Transaction ID"
              value={`#${transaction.id}`}
            />

            <DetailRow
              label="Type"
              value={transaction.type}
            />

            <DetailRow
              label="Amount"
              value={formatMoney(transaction.amount)}
            />

            <DetailRow
              label="Date"
              value={new Date(
                transaction.createdAt
              ).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            />

            <DetailRow
              label="Time"
              value={new Date(
                transaction.createdAt
              ).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    marginBottom: 20,
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  loader: {
    marginTop: 80,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  errorText: {
    fontSize: 15,
    color: COLORS.secondaryText,
    textAlign: "center",
  },

  content: {
    paddingBottom: 40,
  },

  header: {
    alignItems: "center",
    paddingVertical: 30,
    gap: 12,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },

  amount: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.text,
  },

  incomingAmount: {
    color: COLORS.success,
  },

  transactionType: {
    fontSize: 16,
    color: COLORS.secondaryText,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: "600",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
    marginTop: 14,
  },

  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    paddingVertical: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  detailLabel: {
    fontSize: 14,
    color: COLORS.secondaryText,
    flexShrink: 0,
  },

  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    flex: 1,
    textAlign: "right",
  },
});
