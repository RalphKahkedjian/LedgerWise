
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { COLORS } from "../../constants/colors";
import {
  PendingTransfer,
  getIncomingTransfers,
  getOutgoingTransfers,
  acceptTransfer,
  rejectTransfer,
} from "../../services/wallet";
import { Ionicons } from "@expo/vector-icons";

type Tab = "incoming" | "sent";

export default function NotificationsScreen() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("incoming");
  const [incoming, setIncoming] = useState<PendingTransfer[]>([]);
  const [outgoing, setOutgoing] = useState<PendingTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadTransfers = useCallback(async () => {
    try {
      const [received, sent] = await Promise.all([
        getIncomingTransfers(),
        getOutgoingTransfers(),
      ]);

      setIncoming(received);
      setOutgoing(sent);
    } catch {
      Alert.alert("Error", "Could not load transfers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void loadTransfers();
    }, [loadTransfers])
  );

  const handleDecision = async (
    transferId: number,
    decision: "accept" | "reject"
  ) => {
    if (processingId !== null) return;

    setProcessingId(transferId);

    try {
      if (decision === "accept") {
        await acceptTransfer(transferId);
      } else {
        await rejectTransfer(transferId);
      }

      await loadTransfers();

      Alert.alert(
        "Success",
        decision === "accept"
          ? "Transfer accepted successfully."
          : "Transfer rejected. Funds returned to sender."
      );
    } catch {
      Alert.alert("Error", "Unable to process this transfer.");
    } finally {
      setProcessingId(null);
    }
  };

  const data = tab === "incoming" ? incoming : outgoing;
  const pendingCount = incoming.filter(
    (transfer) => transfer.status === "Pending"
  ).length;

  const renderTransfer = ({ item }: { item: PendingTransfer }) => {
    const isIncoming = tab === "incoming";
    const name = isIncoming ? item.senderName : item.receiverName;
    const email = isIncoming ? item.senderEmail : item.receiverEmail;
    const isPending = item.status === "Pending";

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>
              {name || "Unknown user"}
            </Text>
            <Text style={styles.email}>{email || ""}</Text>
          </View>

          <Text style={styles.amount}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text
            style={[
              styles.status,
              item.status === "Accepted" && styles.accepted,
              item.status === "Rejected" && styles.rejected,
            ]}
          >
            {item.status}
          </Text>

          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        {isIncoming && isPending && (
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.actionButton,
                styles.rejectButton,
                processingId !== null && styles.disabled,
              ]}
              disabled={processingId !== null}
              onPress={() =>
                void handleDecision(item.id, "reject")
              }
            >
              <Text style={styles.rejectText}>Reject</Text>
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.acceptButton,
                processingId !== null && styles.disabled,
              ]}
              disabled={processingId !== null}
              onPress={() =>
                void handleDecision(item.id, "accept")
              }
            >
              <Text style={styles.acceptText}>
                {processingId === item.id
                  ? "Processing..."
                  : "Accept"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name="chevron-back"
                size={22}  
                color={COLORS.text}
              />
              <Text style={styles.backText}>Back</Text>
        </Pressable>

        <Text style={styles.title}>Transfers</Text>
        <Text style={styles.subtitle}>
          Manage your transfer requests
        </Text>
      </View>

      <View style={styles.tabs}>
        <Pressable
          style={[
            styles.tab,
            tab === "incoming" && styles.activeTab,
          ]}
          onPress={() => setTab("incoming")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "incoming" && styles.activeTabText,
            ]}
          >
            Incoming ({pendingCount})
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.tab,
            tab === "sent" && styles.activeTab,
          ]}
          onPress={() => setTab("sent")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "sent" && styles.activeTabText,
            ]}
          >
            Sent
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransfer}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={() => {
            setLoading(true);
            void loadTransfers();
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {tab === "incoming"
                ? "No incoming transfer requests."
                : "No outgoing transfer requests."}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
  },
  back: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    color: COLORS.secondaryText,
    marginTop: 5,
  },
  tabs: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 5,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  tabText: {
    color: COLORS.secondaryText,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  personName: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  email: {
    color: COLORS.secondaryText,
    marginTop: 4,
    fontSize: 12,
  },
  amount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },
  status: {
    color: "#B7791F",
    fontWeight: "700",
    fontSize: 13,
  },
  accepted: {
    color: COLORS.success,
  },
  rejected: {
    color: COLORS.error,
  },
  date: {
    color: COLORS.secondaryText,
    fontSize: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  rejectButton: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  acceptButton: {
    backgroundColor: COLORS.primary,
  },
  rejectText: {
    color: COLORS.error,
    fontWeight: "700",
  },
  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.5,
  },
  empty: {
    textAlign: "center",
    color: COLORS.secondaryText,
    marginTop: 60,
    fontSize: 15,
  },
});
