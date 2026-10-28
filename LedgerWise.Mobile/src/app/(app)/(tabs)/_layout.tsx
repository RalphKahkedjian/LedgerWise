import { Tabs } from "expo-router";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../../../constants/colors";

type IconName = keyof typeof Ionicons.glyphMap;

// Icon with a soft pill behind it when the tab is active
function TabIcon({
  focused,
  active,
  inactive,
}: {
  focused: boolean;
  active: IconName;
  inactive: IconName;
}) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Ionicons
        name={focused ? active : inactive}
        size={22}
        color={focused ? COLORS.primary : COLORS.placeholder}
      />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.placeholder,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          height: 50 + bottomPadding,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          shadowColor: COLORS.text,
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 16,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} active="home" inactive="home-outline" />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="receipt"
              inactive="receipt-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="pay"
        options={{
          title: "Pay",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="qr-code"
              inactive="qr-code-outline"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              active="person"
              inactive="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    width: 56,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  iconPillActive: {
    backgroundColor: "#EFF6FF",
  },
});