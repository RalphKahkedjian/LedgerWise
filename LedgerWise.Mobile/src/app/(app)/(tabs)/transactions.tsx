
import { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
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

type TransactionFilter =
  | "All"
  | "Deposits"
  | "Withdrawals"
  | "Transfers";

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
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    const map = new Map<string, WalletTransaction[]>();
    let incomingTotal = 0;
    let outgoingTotal = 0;

    for (const transaction of sorted) {
      const title = new Date(
        transaction.createdAt
      ).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

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
      groups: Array.from(map, ([title, items]) => ({
        title,
        items,
      })),
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
                    params: {
                      id: String(transaction.id),
                    },
                  })
                }
                style={[
                  styles.row,
                  index < group.items.length - 1 &&
                    styles.rowBorder,
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: incoming
                        ? "#DCFCE7"
                        : "#FEE2E2",
                    },
                  ]}
                >
                  <Ionicons
                    name={incoming ? "arrow-down" : "arrow-up"}
                    size={18}
                    color={
                      incoming ? COLORS.success : COLORS.error
                    }
                  />
                </View>

                <View style={styles.info}>
                  <Text style={styles.type}>
                    {transaction.type}
                  </Text>

                  {transaction.counterpartyName ? (
                    <Text
                      style={styles.counterparty}
                      numberOfLines={1}
                    >
                      {transaction.type === "Transfer In"
                        ? "From: "
                        : "To: "}
                      {transaction.counterpartyName}
                    </Text>
                  ) : null}

                  <Text style={styles.date}>
                    {new Date(
                      transaction.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                <View style={styles.amountContainer}>
                  <Text
                    style={[
                      styles.amount,
                      incoming && styles.incomingAmount,
                    ]}
                  >
                    {incoming ? "+" : "−"}
                    {formatMoney(
                      Math.abs(transaction.amount)
                    )}
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
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: "#DCFCE7" },
          ]}
        >
          <Ionicons
            name="arrow-down"
            size={16}
            color={COLORS.success}
          />
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
        <View
          style={[
            styles.summaryIcon,
            { backgroundColor: "#FEE2E2" },
          ]}
        >
          <Ionicons
            name="arrow-up"
            size={16}
            color={COLORS.error}
          />
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

          <Text style={styles.stateTitle}>
            Something went wrong
          </Text>

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
              <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={COLORS.text}
                />
                <Text style={styles.backText}>Back</Text>
              </Pressable>

              <Text style={styles.title}>
                Transaction history
              </Text>

              <Text style={styles.subtitle}>
                All your wallet activity in one place
              </Text>

              <View style={styles.filters}>
                {(
                  [
                    "All",
                    "Deposits",
                    "Withdrawals",
                    "Transfers",
                  ] as const
                ).map((item) => (
                  <Pressable
                    key={item}
                    style={[
                      styles.filterButton,
                      filter === item && styles.activeFilter,
                    ]}
                    onPress={() => setFilter(item)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        filter === item &&
                          styles.activeFilterText,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>

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
              <Text style={styles.stateTitle}>
                No transactions found
              </Text>
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

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    marginBottom: 24,
  },

  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 22,
  },

  filters: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 20,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 3,
    borderRadius: 10,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  activeFilter: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },

  activeFilterText: {
    color: "#FFFFFF",
  },

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
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
