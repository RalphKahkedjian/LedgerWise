import MyQRCode from "@/components/MyQRCode";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PayScreen() {
  const [showQR, setShowQR] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Pay & receive</Text>
        <Text style={styles.subtitle}>
          Send and receive money with LedgerWise.
        </Text>

        {/* ACTIONS */}
        <View style={styles.actions}>
          {/* Scan to pay (primary action) */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              styles.scanCard,
              pressed && styles.pressed,
            ]}
            onPress={() => router.push("/scan_qr")}
            accessibilityRole="button"
            accessibilityLabel="Scan a QR code to pay"
          >
            <View style={styles.glow} />

            <View style={[styles.actionIcon, styles.scanIcon]}>
              <Ionicons name="scan-outline" size={24} color="#FFFFFF" />
            </View>

            <View>
              <Text style={[styles.actionTitle, styles.scanTitle]}>
                Scan to pay
              </Text>
              <Text style={[styles.actionSubtitle, styles.scanSubtitle]}>
                Use your camera
              </Text>
            </View>
          </Pressable>

          {/* My QR code (toggle) */}
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              styles.qrCardButton,
              showQR && styles.qrCardButtonActive,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowQR(!showQR)}
            accessibilityRole="button"
            accessibilityState={{ expanded: showQR }}
            accessibilityLabel={showQR ? "Hide my QR code" : "Show my QR code"}
          >
            <View
              style={[styles.actionIcon, showQR && styles.actionIconActive]}
            >
              <Ionicons
                name="qr-code-outline"
                size={24}
                color={showQR ? "#FFFFFF" : COLORS.primary}
              />
            </View>

            <View>
              <Text style={styles.actionTitle}>My QR code</Text>
              <Text style={styles.actionSubtitle}>
                {showQR ? "Tap to hide" : "Get paid"}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* MY QR CODE */}
        {showQR && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Scan to pay me</Text>
            <Text style={styles.qrSubtitle}>
              Others can scan this code to send you money.
            </Text>

            {/* White frame keeps the code easy to scan */}
            <View style={styles.qrFrame}>
              <MyQRCode />
            </View>
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
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  // HEADER
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 6,
  },

  // ACTIONS
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
  },

  actionCard: {
    flex: 1,
    height: 150,
    borderRadius: 24,
    padding: 18,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  scanCard: {
    backgroundColor: COLORS.text,
    shadowColor: COLORS.text,
    shadowOpacity: 0.22,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -70,
    right: -60,
    backgroundColor: COLORS.primary,
    opacity: 0.55,
  },

  qrCardButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  qrCardButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
  },

  actionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionIconActive: {
    backgroundColor: COLORS.primary,
  },

  scanIcon: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 3,
  },

  actionSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  scanTitle: {
    color: "#FFFFFF",
  },

  scanSubtitle: {
    color: "#BFD3FB",
  },

  // MY QR CODE
  qrContainer: {
    marginTop: 24,
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 28,
    paddingHorizontal: 20,
  },

  qrTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6,
  },

  qrSubtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },

  qrFrame: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
});