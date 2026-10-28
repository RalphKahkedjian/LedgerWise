import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import {
  getTransactions,
  type WalletTransaction,
} from "@/services/wallet";
import { COLORS } from "@/constants/colors";

type TransactionGroup = {
  title: string;
  items: WalletTransaction[];
};

type TransactionFilter = "All" | "Deposits" | "Withdrawals" | "Transfers";

const FILTERS: TransactionFilter[] = [
  "All",
  "Deposits",
  "Withdrawals",
  "Transfers",
];

function isIncoming(type: string) {
  return type === "Deposit" || type === "Transfer In";
}

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>("All");

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadTransactions() {
        try {
          setIsLoading(true);
          setError(null);

          const data = await getTransactions();

          if (active) {
            setTransactions(data);
          }
        } catch (err) {
          console.error("Failed to load transactions:", err);

          if (active) {
            setError("Unable to load transactions.");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      }

      loadTransactions();

      return () => {
        active = false;
      };
    }, [])
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filter === "All") return true;

      if (filter === "Deposits") {
        return transaction.type === "Deposit";
      }

      if (filter === "Withdrawals") {
        return transaction.type === "Withdraw";
      }

      if (filter === "Transfers") {
        return (
          transaction.type === "Transfer In" ||
          transaction.type === "Transfer Out"
        );
      }

      return true;
    });
  }, [transactions, filter]);

  const { groups, totalIn, totalOut } = useMemo(() => {
    const sorted = [...filteredTransactions].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const map = new Map<string, WalletTransaction[]>();
    let incomingTotal = 0;
    let outgoingTotal = 0;

    for (const transaction of sorted) {
      const title = new Date(transaction.createdAt).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      );

      if (!map.has(title)) {
        map.set(title, []);
      }

      map.get(title)!.push(transaction);

      if (isIncoming(transaction.type)) {
        incomingTotal += Math.abs(transaction.amount);
      } else {
        outgoingTotal += Math.abs(transaction.amount);
      }
    }

    return {
      groups: Array.from(map, ([title, items]) => ({ title, items })),
      totalIn: incomingTotal,
      totalOut: outgoingTotal,
    };
  }, [filteredTransactions]);

  function renderGroup({ item: group }: { item: TransactionGroup }) {
    return (
      <View style={styles.group}>
        <Text style={styles.groupTitle}>{group.title}</Text>

        <View style={styles.card}>
          {group.items.map((transaction, index) => {
            const incoming = isIncoming(transaction.type);

            return (
              <Pressable
                key={transaction.id}
                onPress={() =>
                  router.push({
                    pathname: "/transaction-details",
                    params: { id: String(transaction.id) },
                  })
                }
                style={({ pressed }) => [
                  styles.row,
                  index < group.items.length - 1 && styles.rowBorder,
                  pressed && styles.rowPressed,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: incoming ? "#DCFCE7" : "#FEE2E2" },
                  ]}
                >
                  <Ionicons
                    name={incoming ? "arrow-down" : "arrow-up"}
                    size={18}
                    color={incoming ? COLORS.success : COLORS.error}
                  />
                </View>

                <View style={styles.info}>
                  <Text style={styles.type}>{transaction.type}</Text>

                  {transaction.counterpartyName ? (
                    <Text style={styles.counterparty} numberOfLines={1}>
                      {transaction.type === "Transfer In" ? "From " : "To "}
                      <Text style={styles.counterpartyName}>
                        {transaction.counterpartyName}
                      </Text>
                    </Text>
                  ) : null}

                  <Text style={styles.date}>
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}
                  </Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text
                    style={[styles.amount, incoming && styles.incomingAmount]}
                  >
                    {incoming ? "+" : "−"}
                    {formatMoney(Math.abs(transaction.amount))}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={15}
                    color={COLORS.placeholder}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  const summary = (
    <View style={styles.summaryRow}>
      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: "#DCFCE7" }]}>
          <Ionicons name="arrow-down" size={16} color={COLORS.success} />
        </View>

        <Text style={styles.summaryLabel}>Money in</Text>
        <Text
          style={styles.summaryAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatMoney(totalIn)}
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={[styles.summaryIcon, { backgroundColor: "#FEE2E2" }]}>
          <Ionicons name="arrow-up" size={16} color={COLORS.error} />
        </View>

        <Text style={styles.summaryLabel}>Money out</Text>
        <Text
          style={styles.summaryAmount}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatMoney(totalOut)}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.stateWrap}>
          <Ionicons
            name="cloud-offline-outline"
            size={32}
            color={COLORS.placeholder}
          />

          <Text style={styles.stateTitle}>Something went wrong</Text>

          <Text style={styles.stateText}>
            {error} Leave this screen and come back to try again.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(group) => group.title}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* HEADER */}
              <View style={styles.header}>
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

                <View style={styles.headerText}>
                  <Text style={styles.title}>Transaction history</Text>
                  <Text style={styles.subtitle}>
                    All your wallet activity in one place
                  </Text>
                </View>
              </View>

              {/* FILTERS */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScroll}
                contentContainerStyle={styles.filters}
              >
                {FILTERS.map((item) => {
                  const selected = filter === item;

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.filterChip,
                        selected && styles.filterChipActive,
                      ]}
                      onPress={() => setFilter(item)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          selected && styles.filterTextActive,
                        ]}
                      >
                        {item}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {transactions.length > 0 ? summary : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.stateWrap}>
              <Ionicons
                name="receipt-outline"
                size={32}
                color={COLORS.placeholder}
              />
              <Text style={styles.stateTitle}>No transactions found</Text>
              <Text style={styles.stateText}>
                {transactions.length === 0
                  ? "Make a deposit to get started."
                  : "No transactions match this filter."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  loader: {
    marginTop: 60,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
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

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
  },

  // FILTERS (bleed to the screen edges so chips scroll under the margin)
  filtersScroll: {
    marginHorizontal: -20,
    marginBottom: 22,
    flexGrow: 0,
  },

  filters: {
    paddingHorizontal: 20,
    gap: 8,
  },

  filterChip: {
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  // SUMMARY
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },

  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginBottom: 4,
  },

  summaryAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.4,
  },

  // GROUPS
  group: {
    marginBottom: 24,
  },

  groupTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
    marginLeft: 4,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  rowPressed: {
    backgroundColor: COLORS.background,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  info: {
    flex: 1,
    paddingRight: 8,
  },

  type: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 3,
  },

  counterparty: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 3,
  },

  counterpartyName: {
    fontWeight: "600",
    color: COLORS.text,
  },

  date: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  amount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  incomingAmount: {
    color: COLORS.success,
  },

  // EMPTY / ERROR
  stateWrap: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingTop: 60,
  },

  stateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 14,
    marginBottom: 6,
  },

  stateText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },
});