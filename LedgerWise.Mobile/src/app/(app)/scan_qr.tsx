import { useState } from "react";
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { COLORS } from "@/constants/colors";

export default function ScanQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const frameSize = Math.min(width * 0.7, 300);

  function handleQRCode(data: string) {
    try {
      const parsed = JSON.parse(data);

      if (
        parsed?.type !== "ledgerwise-payment" ||
        parsed?.version !== 1 ||
        typeof parsed?.recipientId !== "string" ||
        !parsed.recipientId.trim()
      ) {
        throw new Error("Invalid LedgerWise QR code");
      }

      Alert.alert("Valid QR Code", `Recipient ID: ${parsed.recipientId}`, [
        {
          text: "Scan Again",
          onPress: () => setScanned(false),
        },
      ]);
    } catch {
      Alert.alert(
        "Invalid QR Code",
        "Please scan a valid LedgerWise payment QR code.",
        [
          {
            text: "Try Again",
            onPress: () => setScanned(false),
          },
        ]
      );
    }
  }

  // PERMISSION: still checking
  if (!permission) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.permissionLoader}
        />
      </SafeAreaView>
    );
  }

  // PERMISSION: not granted
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.permissionTopBar}>
          <Pressable
            style={({ pressed }) => [
              styles.lightBackButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.permissionBody}>
          <View style={styles.permissionIcon}>
            <Ionicons name="camera-outline" size={36} color={COLORS.primary} />
          </View>

          <Text style={styles.permissionTitle}>Camera access needed</Text>

          <Text style={styles.permissionText}>
            LedgerWise needs your camera to scan payment QR codes. Your camera
            is only used while this screen is open.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.permissionButton,
              pressed && styles.pressed,
            ]}
            onPress={
              permission.canAskAgain
                ? requestPermission
                : () => Linking.openSettings()
            }
            accessibilityRole="button"
          >
            <Text style={styles.permissionButtonText}>
              {permission.canAskAgain ? "Allow camera" : "Open settings"}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // SCANNER
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned
            ? undefined
            : ({ data }) => {
                setScanned(true);
                handleQRCode(data);
              }
        }
      />

      {/* DIMMED OVERLAY WITH A CLEAR SCAN WINDOW */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.dim} />

        <View style={{ height: frameSize, flexDirection: "row" }}>
          <View style={styles.dim} />

          <View style={{ width: frameSize, height: frameSize }}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          <View style={styles.dim} />
        </View>

        <View style={styles.dim} />
      </View>

      {/* TOP BAR */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.roundButton,
            pressed && styles.pressed,
          ]}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Close scanner"
        >
          <Ionicons name="close" size={22} color="#FFFFFF" />
        </Pressable>

        <Text style={styles.topBarTitle}>Scan to pay</Text>

        <Pressable
          style={({ pressed }) => [
            styles.roundButton,
            torchOn && styles.roundButtonActive,
            pressed && styles.pressed,
          ]}
          onPress={() => setTorchOn(!torchOn)}
          accessibilityRole="button"
          accessibilityLabel={torchOn ? "Turn flashlight off" : "Turn flashlight on"}
        >
          <Ionicons
            name={torchOn ? "flash" : "flash-off"}
            size={20}
            color="#FFFFFF"
          />
        </Pressable>
      </View>

      {/* HINT */}
      <View style={[styles.hintWrap, { bottom: insets.bottom + 48 }]}>
        <View style={styles.hint}>
          <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
          <Text style={styles.hintText}>
            Point your camera at a LedgerWise QR code
          </Text>
        </View>
      </View>
    </View>
  );
}

const CORNER_SIZE = 38;
const CORNER_THICKNESS = 4;
const CORNER_RADIUS = 16;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  // OVERLAY
  dim: {
    flex: 1,
    backgroundColor: "rgba(20,35,64,0.65)",
  },

  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#FFFFFF",
  },

  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: CORNER_RADIUS,
  },

  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: CORNER_RADIUS,
  },

  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: CORNER_RADIUS,
  },

  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: CORNER_RADIUS,
  },

  // TOP BAR
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },

  roundButtonActive: {
    backgroundColor: COLORS.primary,
  },

  topBarTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // HINT
  hintWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
  },

  hint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  hintText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // PERMISSION SCREENS
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  permissionLoader: {
    marginTop: 80,
  },

  permissionTopBar: {
    marginTop: 12,
  },

  lightBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  permissionBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingBottom: 60,
  },

  permissionIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 10,
  },

  permissionText: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },

  permissionButton: {
    height: 56,
    alignSelf: "stretch",
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

  permissionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});