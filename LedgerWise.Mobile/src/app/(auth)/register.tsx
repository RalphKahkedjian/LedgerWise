
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
} from "react-native";

import { register } from "@/services/auth";

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors";

import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
  });

  async function handleRegister() {
  if (
    !fullName.trim() ||
    !email.trim() ||
    !password ||
    !confirmPassword
  ) {
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
  }
}

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>

            {/* Branding */}
            <View style={styles.brandSection}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>LW</Text>
              </View>

              <Text style={styles.brandName}>
                LedgerWise
              </Text>

              <Text style={styles.tagline}>
                Finance, refined.
              </Text>
            </View>

            {/* Heading */}
            <Text style={styles.title}>
              Create account
            </Text>

            <Text style={styles.description}>
              Start your financial journey with LedgerWise.
            </Text>

            {/* Full Name */}
            <Text style={styles.label}>Full name</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.placeholder}
              autoCapitalize="words"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Email */}
            <Text style={styles.label}>Email address</Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="new-password"
                value={password}
                onChangeText={setPassword}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>
              Confirm password
            </Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={10}
              >
                <Text style={styles.showPassword}>
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            </View>

            {/* Register Button */}
            <Pressable
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>
                Create Account
              </Text>
            </Pressable>

            {/* Login Navigation */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Already have an account?{" "}
              </Text>

              <Pressable
                onPress={() => router.replace("/login")}
              >
                <Text style={styles.loginLink}>
                  Sign In
                </Text>
              </Pressable>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },

  content: {
    paddingHorizontal: 28,
  },

  brandSection: {
    alignItems: "center",
    marginBottom: 35,
  },

  logo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  logoText: {
    fontSize: 24,
    color: COLORS.background,
    fontFamily: "Montserrat_700Bold",
  },

  brandName: {
    fontSize: 29,
    color: COLORS.primary,
    fontFamily: "Montserrat_700Bold",
  },

  tagline: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 7,
    fontFamily: "Montserrat_400Regular",
  },

  title: {
    fontSize: 25,
    color: COLORS.primary,
    fontFamily: "Montserrat_700Bold",
    marginBottom: 9,
  },

  description: {
    fontSize: 12,
    color: COLORS.secondaryText,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 28,
    lineHeight: 20,
  },

  label: {
    fontSize: 12,
    color: COLORS.text,
    fontFamily: "Montserrat_600SemiBold",
    marginBottom: 10,
  },

  input: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 16,
    fontSize: 13,
    color: COLORS.text,
    fontFamily: "Montserrat_400Regular",
    marginBottom: 20,
  },

  passwordContainer: {
    height: 56,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    fontSize: 13,
    color: COLORS.text,
    fontFamily: "Montserrat_400Regular",
  },

  showPassword: {
    fontSize: 12,
    color: COLORS.accent,
    fontFamily: "Montserrat_600SemiBold",
  },

  registerButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },

  registerButtonText: {
    fontSize: 14,
    color: COLORS.surface,
    fontFamily: "Montserrat_700Bold",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    flexWrap: "wrap",
  },

  footerText: {
    fontSize: 11,
    color: COLORS.secondaryText,
    fontFamily: "Montserrat_400Regular",
  },

  loginLink: {
    fontSize: 11,
    color: COLORS.accent,
    fontFamily: "Montserrat_600SemiBold",
  },
});
