
import { useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { COLORS } from "@/constants/colors";
import products from "@/data/products.json";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  icon: string;
  image?: string;
};

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const productIcons: Record<number, IconName> = {
  1: "musical-notes-outline",
  2: "cloud-outline",
  3: "game-controller-outline",
  4: "school-outline",
};

// Optional local images
const productImages: Record<number, ImageSourcePropType> = {
  // 1: require("@/assets/images/products/music.jpg"),
  // 2: require("@/assets/images/products/cloud.jpg"),
  // 3: require("@/assets/images/products/games.jpg"),
  // 4: require("@/assets/images/products/learning.jpg"),
};

// Product image URLs
const productImageUrls: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1620322068252-e6f8ee316ecb?auto=format&fit=crop&w=600&q=70",
  2: "https://images.pexels.com/photos/17489163/pexels-photo-17489163/free-photo-of-computer-server-in-data-center-room.jpeg?auto=compress&cs=tinysrgb&w=600",
  3: "https://images.unsplash.com/photo-1724856349360-baaefb5e87f2?auto=format&fit=crop&w=600&q=70",
  4: "https://images.unsplash.com/photo-1523726491678-bf852e717f6a?auto=format&fit=crop&w=600&q=70",
};

function formatMoney(amount: number) {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

// Product image component with icon fallback
function ProductImage({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);

  const url = product.image ?? productImageUrls[product.id];

  const source: ImageSourcePropType | null =
    productImages[product.id] ?? (url ? { uri: url } : null);

  return (
    <View style={styles.imageWrap}>
      {source && !failed ? (
        <Image
          source={source}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
          accessibilityLabel={product.name}
        />
      ) : (
        <Ionicons
          name={productIcons[product.id] ?? "cube-outline"}
          size={40}
          color={COLORS.primary}
        />
      )}

      {source && !failed && (
        <View style={styles.badge}>
          <Ionicons
            name={productIcons[product.id] ?? "cube-outline"}
            size={16}
            color={COLORS.primary}
          />
        </View>
      )}
    </View>
  );
}

export default function MarketplaceScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.title}>Marketplace</Text>
            <Text style={styles.subtitle}>
              Browse digital products and services.
            </Text>
          </View>
        </View>

        {/* PRODUCT GRID */}
        <View style={styles.productGrid}>
          {(products as Product[]).map((product) => (
            <View key={product.id} style={styles.productCard}>
              <ProductImage product={product} />

              <View style={styles.productBody}>
                <View style={styles.categoryPill}>
                  <Text
                    style={styles.categoryText}
                    numberOfLines={1}
                  >
                    {product.category}
                  </Text>
                </View>

                <Text
                  style={styles.productName}
                  numberOfLines={2}
                >
                  {product.name}
                </Text>

                <Text style={styles.productPrice}>
                  {formatMoney(product.price)}
                </Text>
              </View>
            </View>
          ))}
        </View>
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

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.secondaryText,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  // GRID
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
    marginTop: 0,
  },

  productCard: {
    width: "48%",
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },

  // IMAGE
  imageWrap: {
    height: 120,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  // PRODUCT BODY
  productBody: {
    padding: 14,
    alignItems: "flex-start",
  },

  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    marginBottom: 8,
  },

  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.secondaryText,
  },

  productName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 20,
    minHeight: 40,
    marginBottom: 10,
  },

  productPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
});
