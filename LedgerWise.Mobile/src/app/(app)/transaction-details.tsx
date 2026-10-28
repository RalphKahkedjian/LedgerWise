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
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !isLast && styles.detailRowBorder]}>
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

  const counterpartyName = transaction?.counterpartyName ?? "Unavailable";
  const counterpartyInitial = transaction?.counterpartyName
    ? transaction.counterpartyName.charAt(0).toUpperCase()
    : "?";

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
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

        <Text style={styles.topBarTitle}>Transaction details</Text>

        {/* Spacer keeps the title centered */}
        <View style={styles.backButtonSpacer} />
      </View>

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
          {/* HERO */}
          <View style={styles.hero}>
            <View style={styles.glowLarge} />
            <View style={styles.glowSmall} />

            <View style={styles.heroIcon}>
              <Ionicons
                name={incoming ? "arrow-down" : "arrow-up"}
                size={26}
                color={incoming ? "#4ADE80" : "#FCA5A5"}
              />
            </View>

            <Text style={styles.heroType}>{transaction.type}</Text>

            <Text
              style={styles.heroAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {incoming ? "+" : "−"}
              {formatMoney(transaction.amount)}
            </Text>

            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          {/* COUNTERPARTY (transfers only) */}
          {isTransfer && (
            <>
              <Text style={styles.sectionTitle}>
                {transaction.type === "Transfer In" ? "Sent by" : "Sent to"}
              </Text>

              <View style={styles.personCard}>
                <View style={styles.personAvatar}>
                  <Text style={styles.personAvatarText}>
                    {counterpartyInitial}
                  </Text>
                </View>

                <View style={styles.personInfo}>
                  <Text style={styles.personName} numberOfLines={1}>
                    {counterpartyName}
                  </Text>
                  <Text style={styles.personEmail} numberOfLines={1}>
                    {transaction.counterpartyEmail ?? "Email unavailable"}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* DETAILS */}
          <Text style={styles.sectionTitle}>Transaction information</Text>

          <View style={styles.detailsCard}>
            <DetailRow label="Transaction ID" value={`#${transaction.id}`} />

            <DetailRow
              label="Date"
              value={new Date(transaction.createdAt).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" }
              )}
            />

            <DetailRow
              label="Time"
              value={new Date(transaction.createdAt).toLocaleTimeString(
                "en-US",
                { hour: "2-digit", minute: "2-digit" }
              )}
              isLast
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

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 20,
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

  // HERO
  hero: {
    backgroundColor: COLORS.text,
    borderRadius: 28,
    paddingVertical: 30,
    paddingHorizontal: 22,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 28,
    shadowColor: COLORS.text,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },

  glowLarge: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -110,
    right: -80,
    backgroundColor: COLORS.primary,
    opacity: 0.55,
  },

  glowSmall: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    bottom: -70,
    left: -50,
    backgroundColor: COLORS.primary,
    opacity: 0.18,
  },

  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  heroType: {
    fontSize: 14,
    color: "#BFD3FB",
    marginBottom: 6,
  },

  heroAmount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1,
    marginBottom: 16,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(74,222,128,0.16)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },

  statusText: {
    color: "#4ADE80",
    fontSize: 13,
    fontWeight: "600",
  },

  // SECTIONS
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },

  personCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 28,
  },

  personAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  personAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },

  personInfo: {
    flex: 1,
  },

  personName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 3,
  },

  personEmail: {
    fontSize: 13,
    color: COLORS.secondaryText,
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
  },

  detailRowBorder: {
    borderBottomWidth: 1,
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