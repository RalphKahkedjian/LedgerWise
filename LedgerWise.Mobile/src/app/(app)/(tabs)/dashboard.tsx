import { useCallback, useState } from "react";
import { useFocusEffect, router } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import {
  getWallet,
  getTransactions,
  type Wallet,
  type WalletTransaction,
  getIncomingTransfers,
} from "../../../services/wallet";
import { COLORS } from "../../../constants/colors";

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(false);

  const [pendingCount, setPendingCount] = useState(0);

  // Load incoming transfers
  useFocusEffect(
    useCallback(()=>{
      let active = true;

      async function loadIncomingTransfers() {
        try {
          const transfers = await getIncomingTransfers();

          if (active) {
            const pendingTransfers = transfers.filter(
            (transfer) => transfer.status === "Pending"
          );
            setPendingCount(pendingTransfers.length);
          }
        } catch (err) {
          console.error("Failed to load incoming transfers:", err);
        }
      }

      loadIncomingTransfers();
      return ()=> {
        active=false;
      }
    }, [])
  )

  // Load wallet balance
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadWallet() {
        try {
          const data = await getWallet();
          if (active) {
            setWallet(data);
            setError(null);
          }
        } catch (err) {
          console.error("Failed to load wallet:", err);
          if (active) setError("Unable to load your balance.");
        } finally {
          if (active) setIsLoading(false);
        }
      }

      loadWallet();
      return () => {
        active = false;
      };
    }, [])
  );

  // Load recent transactions
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRecentTransactions() {
        try {
          const data = await getTransactions();
          if (active) {
            setTransactions(data.slice(0, 3));
            setTransactionsError(false);
          }
        } catch (err) {
          console.error("Failed to load transactions:", err);
          if (active) setTransactionsError(true);
        } finally {
          if (active) setTransactionsLoading(false);
        }
      }

      loadRecentTransactions();
      return () => {
        active = false;
      };
    }, [])
  );

  async function handleLogout() {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      Alert.alert("Logout failed", "Unable to sign out. Please try again.");
    }
  }

  function formatMoney(amount: number) {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function isIncoming(type: string) {
    return type === "Deposit" || type === "Transfer In";
  }

  // Split "$1,234.56" into "$1,234" and ".56" so the cents can be set smaller
  const [balanceWhole, balanceCents] = formatMoney(wallet?.balance ?? 0).split(".");

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>

          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || "User"}
            </Text>
          </View>

            <Pressable
            style={({ pressed }) => [
              styles.notificationContainer,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/notifications")}
            accessibilityRole="button"
            accessibilityLabel="Open notifications bar"
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.primary} />
            {pendingCount > 0 &&
              <Text style={styles.notificationBadge}>
                {pendingCount}
              </Text>
            }
          </Pressable>
        </View>

        {/* WALLET CARD */}
        <View style={styles.walletCard}>
          {/* Decorative glows */}
          <View style={styles.glowLarge} />
          <View style={styles.glowSmall} />

          <View style={styles.walletTop}>
            <View style={styles.walletBrand}>
              <View style={styles.brandIcon}>
                <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.walletBrandText}>LedgerWise Wallet</Text>
            </View>

            <View style={styles.currencyPill}>
              <Text style={styles.currencyText}>USD</Text>
            </View>
          </View>

          <View style={styles.balanceBlock}>
            <Text style={styles.walletLabel}>Total balance</Text>

            {isLoading ? (
              <View style={styles.balanceLoader}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            ) : error ? (
              <Text style={styles.walletError}>{error}</Text>
            ) : (
              <View style={styles.balanceRow}>
                <Text style={styles.balanceWhole} adjustsFontSizeToFit numberOfLines={1}>
                  {balanceWhole}
                </Text>
                {balanceCents ? (
                  <Text style={styles.balanceCents}>.{balanceCents}</Text>
                ) : null}
              </View>
            )}
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/deposit")}
            accessibilityRole="button"
            accessibilityLabel="Deposit money"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="arrow-down" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Deposit</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/withdraw")}
            accessibilityRole="button"
            accessibilityLabel="Withdraw money"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="arrow-up" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Withdraw</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/transfer")}
            accessibilityRole="button"
            accessibilityLabel="Transfer money"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="swap-horizontal" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Transfer</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/scan_qr")}
            accessibilityRole="button"
            accessibilityLabel="Pay"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="qr-code-outline" size={18} color={COLORS.primary} />
            </View>
            <Text style={styles.quickActionText}>Pay</Text>
          </Pressable>

        </View>

        {/* RECENT TRANSACTIONS HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>

          <Pressable
            onPress={() => router.push("/transactions")}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="See all transactions"
          >
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {/* RECENT TRANSACTIONS */}
        {transactionsLoading ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={styles.transactionsLoader}
          />
        ) : transactionsError ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="cloud-offline-outline"
              size={28}
              color={COLORS.placeholder}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>
              Unable to load transactions. Pull back to this screen to try again.
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons
              name="receipt-outline"
              size={28}
              color={COLORS.placeholder}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyText}>
              Make a deposit to get started. Your activity will show up here.
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {transactions.map((transaction, index) => {
              const incoming = isIncoming(transaction.type);

              return (
                <View
                  key={transaction.id}
                  style={[
                    styles.transactionRow,
                    index < transactions.length - 1 && styles.transactionBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      { backgroundColor: incoming ? "#DCFCE7" : "#FEE2E2" },
                    ]}
                  >
                    <Ionicons
                      name={incoming ? "arrow-down" : "arrow-up"}
                      size={18}
                      color={incoming ? COLORS.success : COLORS.error}
                    />
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionType}>{transaction.type}</Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric", year: "numeric" }
                      )}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      incoming && styles.incomingAmount,
                    ]}
                  >
                    {incoming ? "+" : "−"}
                    {formatMoney(Math.abs(transaction.amount))}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  headerInfo: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginBottom: 2,
  },

  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },


  notificationContainer: {
    position:'relative',
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  // WALLET CARD
  walletCard: {
    backgroundColor: COLORS.text,
    borderRadius: 28,
    padding: 22,
    overflow: "hidden",
    marginBottom: 16,
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

  walletTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  walletBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  walletBrandText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  currencyPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  currencyText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  balanceBlock: {
    marginTop: 34,
    marginBottom: 6,
  },

  walletLabel: {
    fontSize: 14,
    color: "#BFD3FB",
    marginBottom: 6,
  },

  balanceLoader: {
    height: 56,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  walletError: {
    fontSize: 14,
    color: "#FFFFFF",
    height: 56,
    textAlignVertical: "center",
    lineHeight: 56,
  },

  balanceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    height: 56,
  },

  balanceWhole: {
    fontSize: 46,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.5,
    flexShrink: 1,
  },

  balanceCents: {
    fontSize: 24,
    fontWeight: "600",
    color: "#BFD3FB",
    marginLeft: 2,
  },

  // QUICK ACTIONS (below the card). Fixed-size squares, left-aligned, so
  // adding a Transfer button later just continues the row.
  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
    marginBottom: 32,
  },

  quickAction: {
    width: 84,
    height: 84,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },

  // TRANSACTIONS
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  transactionsLoader: {
    marginVertical: 35,
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },

  transactionList: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  transactionDetails: {
    flex: 1,
  },

  transactionType: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 3,
  },

  transactionDate: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  transactionAmount: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },

  incomingAmount: {
    color: COLORS.success,
  },

  notificationBadge: {
    position:'absolute',
    top:-5,
    right:-5,
    color: COLORS.background,
    width: 18,
    height: 18,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: COLORS.error,
    fontWeight:'600',
    fontSize: 12,
    textAlign:'center',
    textAlignVertical:'center',
    paddingTop: 1
  }
});