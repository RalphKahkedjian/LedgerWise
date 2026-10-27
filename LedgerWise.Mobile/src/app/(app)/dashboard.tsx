
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";
import {
  getWallet,
  getTransactions,
  type Wallet,
  type WalletTransaction,
} from "../../services/wallet";
import { COLORS } from "../../constants/colors";

export default function DashboardScreen() {
  const { user, signOut } = useAuth();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<
    WalletTransaction[]
  >([]);
  const [transactionsLoading, setTransactionsLoading] =
    useState(true);
  const [transactionsError, setTransactionsError] =
    useState(false);

  const [profileVisible, setProfileVisible] = useState(false);

  const avatarInitial = (user?.name || "U")
    .charAt(0)
    .toUpperCase();

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

            if (active) {
              setError("Unable to load wallet balance.");
            }
          } finally {
            if (active) {
              setIsLoading(false);
            }
          }
        }

        loadWallet();

        return () => {
          active = false;
        };
      }, [])
    );

  // Fetch recent transactions
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRecentTransactions() {
        try {
          const data = await getTransactions();

          if (active) {
            setTransactions(data.slice(0, 5));
            setTransactionsError(false);
          }
        } catch (err) {
          console.error("Failed to load transactions:", err);

          if (active) {
            setTransactionsError(true);
          }
        } finally {
          if (active) {
            setTransactionsLoading(false);
          }
        }
      }

      loadRecentTransactions();

      return () => {
        active = false;
      };
    }, [])
  );

  // Sign out
  async function handleLogout() {
    try {
      await signOut();
      setProfileVisible(false);
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);

      Alert.alert(
        "Logout failed",
        "Unable to sign out. Please try again."
      );
    }
  }

  // Format money
  function formatMoney(amount: number) {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  // Determine transaction direction
  function isIncoming(type: string) {
    return type === "Deposit" || type === "Transfer In";
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text style={styles.greeting}>
              Welcome back,
            </Text>

            <Text style={styles.userName}>
              {user?.name || "User"}
            </Text>
          </View>

          <Pressable
            style={styles.profileAvatar}
            onPress={() => setProfileVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Open profile menu"
          >
            <Text style={styles.avatarText}>
              {avatarInitial}
            </Text>
          </Pressable>
        </View>

        {/* WALLET CARD */}
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>
            TOTAL WALLET BALANCE
          </Text>

          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.surface}
              style={styles.walletLoader}
            />
          ) : error ? (
            <Text style={styles.walletError}>
              {error}
            </Text>
          ) : (
            <Text style={styles.balance}>
              {formatMoney(wallet?.balance ?? 0)}
            </Text>
          )}

          <View style={styles.walletFooter}>
            <Text style={styles.walletFooterText}>
              LedgerWise Wallet
            </Text>

            <Text style={styles.walletFooterText}>
              USD
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.depositButton}
          onPress={()=> router.push("/deposit")}
        >
          <Text style={styles.depositButton}>
            + Deposit Money
          </Text>
        </Pressable>

        {/* RECENT TRANSACTIONS HEADER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Recent Transactions
          </Text>

          <Pressable
            onPress={() => router.push("/transactions")}
          >
            <Text style={styles.seeAll}>
              See all
            </Text>
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
            <Text style={styles.emptyText}>
              Unable to load transactions.
            </Text>
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No transactions yet
            </Text>

            <Text style={styles.emptyText}>
              Your deposits, withdrawals, and transfers
              will appear here.
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
                    index < transactions.length - 1 &&
                      styles.transactionBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor: incoming
                          ? "#DCFCE7"
                          : "#FEE2E2",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.transactionArrow,
                        {
                          color: incoming
                            ? COLORS.success
                            : COLORS.error,
                        },
                      ]}
                    >
                      {incoming ? "↓" : "↑"}
                    </Text>
                  </View>

                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionType}>
                      {transaction.type}
                    </Text>

                    <Text style={styles.transactionDate}>
                      {new Date(
                        transaction.createdAt
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.transactionAmount,
                      incoming && styles.incomingAmount,
                    ]}
                  >
                    {incoming ? "+" : "-"}
                    {formatMoney(
                      Math.abs(transaction.amount)
                    )}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* PROFILE MENU */}
      <Modal
        visible={profileVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setProfileVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfileVisible(false)}
        >
          <Pressable
            style={styles.profileMenu}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Text style={styles.menuAvatarText}>
                  {avatarInitial}
                </Text>
              </View>

              <View style={styles.menuUserInfo}>
                <Text style={styles.menuName}>
                  {user?.name || "User"}
                </Text>

                <Text
                  style={styles.menuEmail}
                  numberOfLines={1}
                >
                  {user?.email || ""}
                </Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <Pressable
              style={styles.menuLogout}
              onPress={handleLogout}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <Text style={styles.menuLogoutText}>
                Sign Out
              </Text>

              <Text style={styles.logoutArrow}>
                →
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },

  headerInfo: {
    flex: 1,
    paddingRight: 12,
  },

  greeting: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginBottom: 6,
  },

  userName: {
    fontSize: 23,
    fontWeight: "700",
    color: COLORS.text,
  },

  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.surface,
  },

  // WALLET
  walletCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 25,
    minHeight: 190,
    justifyContent: "space-between",
    marginBottom: 30,
  },

  walletLabel: {
    fontSize: 12,
    color: "#DBEAFE",
    letterSpacing: 1,
    fontWeight: "600",
  },

  walletLoader: {
    marginVertical: 25,
  },

  walletError: {
    fontSize: 14,
    color: COLORS.surface,
    marginVertical: 25,
  },

  balance: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.surface,
    marginVertical: 22,
  },

  walletFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  walletFooterText: {
    fontSize: 12,
    color: "#DBEAFE",
    fontWeight: "600",
  },

  // TRANSACTIONS
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  seeAll: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },

  transactionsLoader: {
    marginVertical: 35,
  },

  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  emptyIcon: {
    fontSize: 32,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },

  transactionList: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },

  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  transactionArrow: {
    fontSize: 22,
    fontWeight: "700",
  },

  transactionDetails: {
    flex: 1,
  },

  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 5,
  },

  transactionDate: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },

  transactionAmount: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },

  incomingAmount: {
    color: COLORS.success,
  },

  // PROFILE POPUP
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 105,
    paddingHorizontal: 20,
  },

  profileMenu: {
    width: 285,
    maxWidth: "100%",
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 8,
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuAvatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
  },

  menuAvatarText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  menuUserInfo: {
    flex: 1,
  },

  menuName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  menuEmail: {
    color: COLORS.secondaryText,
    fontSize: 11,
  },

  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  menuLogout: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },

  menuLogoutText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: "600",
  },

  logoutArrow: {
    color: COLORS.error,
    fontSize: 19,
  },
  depositButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },

  depositButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "700",
  },
});
