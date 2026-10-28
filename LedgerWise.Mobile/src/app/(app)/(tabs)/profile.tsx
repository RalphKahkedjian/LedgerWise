import { COLORS } from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MyQRCode from "@/components/MyQRCode";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const avatarInitial = (user?.name || "U").charAt(0).toUpperCase();

  async function handleLogout() {
    try {
      await signOut();
      router.replace("/login");
    } catch (err) {
      Alert.alert("Logout failed", "Unable to sign out. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Profile</Text>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.glowLarge} />
          <View style={styles.glowSmall} />

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>

          <Text style={styles.name} numberOfLines={1}>
            {user?.name || "User"}
          </Text>

          <Text style={styles.email} numberOfLines={1}>
            {user?.email || ""}
          </Text>
        </View>

        {/* RECEIVE MONEY (QR) */}
        <Text style={styles.sectionTitle}>Receive money</Text>

        <View style={styles.qrCard}>
          <View style={styles.qrHeader}>
            <View style={styles.infoIcon}>
              <Ionicons name="qr-code-outline" size={18} color={COLORS.primary} />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.qrTitle}>My payment code</Text>
              <Text style={styles.qrSubtitle}>
                Let others scan this code to pay you.
              </Text>
            </View>
          </View>

          {/* White frame keeps the code easy to scan */}
          <View style={styles.qrFrame}>
            <MyQRCode />
          </View>
        </View>

        {/* ACCOUNT DETAILS */}
        <Text style={styles.sectionTitle}>Account</Text>

        <View style={styles.infoCard}>
          <View style={[styles.infoRow, styles.infoBorder]}>
            <View style={styles.infoIcon}>
              <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Full name</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user?.name || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            </View>

            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Email address</Text>
              <Text style={styles.infoValue} numberOfLines={1}>
                {user?.email || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* SIGN OUT */}
        <Pressable
          style={({ pressed }) => [
            styles.signOutButton,
            pressed && styles.pressed,
          ]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
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

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 20,
  },

  // PROFILE CARD
  profileCard: {
    backgroundColor: COLORS.text,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 22,
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 32,
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

  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.25)",
    marginBottom: 16,
  },

  avatarText: {
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.primary,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 4,
  },

  email: {
    fontSize: 14,
    color: "#BFD3FB",
  },

  // SECTIONS
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 14,
  },

  // QR CARD
  qrCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 32,
  },

  qrHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  qrTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 3,
  },

  qrSubtitle: {
    fontSize: 12,
    color: COLORS.secondaryText,
  },

  qrFrame: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },

  // ACCOUNT DETAILS
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },

  infoBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  infoIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  // SIGN OUT
  signOutButton: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.error,
  },
});