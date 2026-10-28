import { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  type TextInputProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/context/AuthContext";
import { COLORS } from "../../constants/colors";

import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

type FieldProps = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
};

// Labeled input with a leading icon and a highlighted border on focus
function Field({ label, icon, rightElement, ...inputProps }: FieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>

      <View style={[styles.field, focused && styles.fieldFocused]}>
        <Ionicons
          name={icon}
          size={20}
          color={focused ? COLORS.primary : COLORS.placeholder}
        />

        <TextInput
          {...inputProps}
          style={styles.fieldInput}
          placeholderTextColor={COLORS.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {rightElement}
      </View>
    </View>
  );
}

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email.trim(), password);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      Alert.alert(
        "Login failed",
        "Invalid email or password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        >
          {/* HERO */}
          <View style={[styles.hero, { paddingTop: insets.top + 40 }]}>
            <View style={styles.glowLarge} />
            <View style={styles.glowSmall} />

            <Text style={styles.brandName}>LedgerWise</Text>
            <Text style={styles.tagline}>Finance, refined.</Text>
          </View>

          {/* FORM */}
          <View style={styles.content}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.description}>
              Sign in to your account to continue.
            </Text>

            <Field
              label="Email address"
              icon="mail-outline"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            <Field
              label="Password"
              icon="lock-closed-outline"
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              rightElement={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.secondaryText}
                  />
                </Pressable>
              }
            />

            <Pressable
              style={styles.forgotPassword}
              hitSlop={8}
              onPress={() =>
                Alert.alert(
                  "Coming soon",
                  "Password recovery is not implemented yet."
                )
              }
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.buttonPressed,
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign in</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>New to LedgerWise? </Text>

              <Pressable hitSlop={8} onPress={() => router.push("/register")}>
                <Text style={styles.footerLink}>Create account</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // HERO
  hero: {
    backgroundColor: COLORS.text,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingBottom: 44,
    alignItems: "center",
    overflow: "hidden",
  },

  glowLarge: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -130,
    right: -90,
    backgroundColor: COLORS.primary,
    opacity: 0.55,
  },

  glowSmall: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    bottom: -80,
    left: -60,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  logoText: {
    fontSize: 24,
    color: COLORS.primary,
    fontFamily: "Montserrat_700Bold",
  },

  brandName: {
    fontSize: 28,
    color: "#FFFFFF",
    fontFamily: "Montserrat_700Bold",
    letterSpacing: -0.3,
  },

  tagline: {
    fontSize: 13,
    color: "#BFD3FB",
    marginTop: 6,
    fontFamily: "Montserrat_400Regular",
  },

  // FORM
  content: {
    paddingHorizontal: 24,
    paddingTop: 34,
  },

  title: {
    fontSize: 26,
    color: COLORS.text,
    fontFamily: "Montserrat_700Bold",
    letterSpacing: -0.3,
    marginBottom: 8,
  },

  description: {
    fontSize: 14,
    color: COLORS.secondaryText,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 28,
    lineHeight: 21,
  },

  fieldWrap: {
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: COLORS.text,
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: 8,
  },

  field: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 16,
  },

  fieldFocused: {
    borderColor: COLORS.primary,
  },

  fieldInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: COLORS.text,
    fontFamily: "Montserrat_400Regular",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 26,
  },

  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: "Montserrat_600SemiBold",
  },

  primaryButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  primaryButtonText: {
    fontSize: 15,
    color: "#FFFFFF",
    fontFamily: "Montserrat_700Bold",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    flexWrap: "wrap",
  },

  footerText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    fontFamily: "Montserrat_400Regular",
  },

  footerLink: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: "Montserrat_600SemiBold",
  },
});