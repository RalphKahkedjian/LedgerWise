import { useState } from "react";
import { router } from "expo-router";
import { login } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
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

import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../constants/colors"

import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from "@expo-google-fonts/montserrat";

export default function LoginScreen() {

  const {signIn} = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      await signIn(email.trim(), password);

      router.replace("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      Alert.alert(
        "Login failed",
        "Invalid email or password. Please try again."
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

              <Text style={styles.brandName}>LedgerWise</Text>

              <Text style={styles.tagline}>
                Finance, refined.
              </Text>
            </View>

            {/* Heading */}
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.description}>
              Sign in to your account to continue.
            </Text>

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
                placeholder="Enter your password"
                placeholderTextColor={COLORS.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
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

            <Pressable
              style={styles.forgotPassword}
              onPress={() =>
                Alert.alert(
                  "Coming soon",
                  "Password recovery is not implemented yet."
                )
              }
            >
              <Text style={styles.forgotText}>
                Forgot password?
              </Text>
            </Pressable>

            {/* Login button */}
            <Pressable
              style={styles.loginButton}
              onPress={handleLogin}
            >
              <Text style={styles.loginText}>Sign In</Text>
            </Pressable>

            {/* Registration */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                New to LedgerWise?{" "}
              </Text>

              <Pressable
                onPress={()=> {
                  router.push("/register")
                }}
              >
                <Text style={styles.registerText}>
                  Create account
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
    marginBottom: 52,
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
    marginBottom: 32,
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
    marginBottom: 24,
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
    color: COLORS.goldText,
    fontFamily: "Montserrat_600SemiBold",
  },

  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 15,
    marginBottom: 30,
  },

  forgotText: {
    fontSize: 11,
    color: COLORS.goldText,
    fontFamily: "Montserrat_600SemiBold",
  },

  loginButton: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },

  loginText: {
    fontSize: 14,
    color: COLORS.background,
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

  registerText: {
    fontSize: 11,
    color: COLORS.goldText,
    fontFamily: "Montserrat_600SemiBold",
  },
});