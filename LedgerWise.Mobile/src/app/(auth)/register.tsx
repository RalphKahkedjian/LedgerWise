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

import { register } from "@/services/auth";
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
  hint?: string;
};

// Labeled input with a leading icon and a highlighted border on focus
function Field({ label, icon, rightElement, hint, ...inputProps }: FieldProps) {
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

      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Your passwords do not match.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Weak password", "Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSubmitting(true);

      await register({
        name: fullName.trim(),
        email: email.trim(),
        password: password,
      });

      Alert.alert(
        "Account created",
        "Your LedgerWise account was created successfully.",
        [
          {
            text: "Sign In",
            onPress: () => router.replace("/login"),
          },
        ]
      );
    } catch (error) {
      console.error("Registration failed:", error);

      Alert.alert(
        "Registration failed",
        "Unable to create your account. The email may already be registered."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!fontsLoaded) return null;

  const eyeToggle = (
    <Pressable
      onPress={() => setShowPassword(!showPassword)}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
    >
      <Ionicons
        name={showPassword ? "eye-off-outline" : "eye-outline"}
        size={20}
        color={COLORS.secondaryText}
      />
    </Pressable>
  );

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
          {/* HERO (more compact than login, since the form is longer) */}
          <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
            <View style={styles.glowLarge} />
            <View style={styles.glowSmall} />

            <View style={styles.brandRow}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>LW</Text>
              </View>

              <View>
                <Text style={styles.brandName}>LedgerWise</Text>
                <Text style={styles.tagline}>Finance, refined.</Text>
              </View>
            </View>
          </View>

          {/* FORM */}
          <View style={styles.content}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.description}>
              Start your financial journey with LedgerWise.
            </Text>

            <Field
              label="Full name"
              icon="person-outline"
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
            />

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
              placeholder="Create a password"
              hint="Use at least 8 characters."
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
              rightElement={eyeToggle}
            />

            <Field
              label="Confirm password"
              icon="shield-checkmark-outline"
              placeholder="Confirm your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              rightElement={eyeToggle}
            />

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                (pressed || isSubmitting) && styles.buttonPressed,
              ]}
              onPress={handleRegister}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Create account</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>

              <Pressable hitSlop={8} onPress={() => router.replace("/login")}>
                <Text style={styles.footerLink}>Sign in</Text>
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
    paddingBottom: 30,
    paddingHorizontal: 24,
    overflow: "hidden",
  },

  glowLarge: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -120,
    right: -80,
    backgroundColor: COLORS.primary,
    opacity: 0.55,
  },

  glowSmall: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: 85,
    bottom: -80,
    left: -50,
    backgroundColor: COLORS.primary,
    opacity: 0.2,
  },

  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  logo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 20,
    color: COLORS.primary,
    fontFamily: "Montserrat_700Bold",
  },

  brandName: {
    fontSize: 24,
    color: "#FFFFFF",
    fontFamily: "Montserrat_700Bold",
    letterSpacing: -0.3,
  },

  tagline: {
    fontSize: 12,
    color: "#BFD3FB",
    marginTop: 2,
    fontFamily: "Montserrat_400Regular",
  },

  // FORM
  content: {
    paddingHorizontal: 24,
    paddingTop: 30,
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
    marginBottom: 26,
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

  hint: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontFamily: "Montserrat_400Regular",
    marginTop: 6,
    marginLeft: 4,
  },

  primaryButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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