import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StripeRule } from "../../components/design/StripeRule";
import { InkCard } from "../../components/design/InkCard";
import { ConicGradient } from "../../components/design/ConicGradient";
import { PillBadge } from "../../components/design/PillBadge";
import {
  Colors,
  Font,
  FontSize,
  Spacing,
  Border,
  Shadow,
} from "../../lib/constants";
import type { PatternRecord } from "../../lib/types";

interface MenuItemProps {
  emoji: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  badge?: string;
  danger?: boolean;
}

function MenuItem({
  emoji,
  label,
  sublabel,
  onPress,
  badge,
  danger,
}: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.75 }]}
    >
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, danger && { color: Colors.coral }]}>
          {label}
        </Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      {badge && <PillBadge label={badge} backgroundColor={Colors.sunBg} />}
      <Text style={[styles.menuArrow, danger && { color: Colors.coral }]}>
        ›
      </Text>
    </Pressable>
  );
}

function SignInPrompt() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <StripeRule height={7} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: Spacing[6],
        }}
      >
        <Text style={{ fontSize: 64, marginBottom: Spacing[4] }}>🧶</Text>
        <Text
          style={[
            styles.userName,
            { textAlign: "center", marginBottom: Spacing[2] },
          ]}
        >
          Save & manage your patterns
        </Text>
        <Text
          style={[
            styles.userEmail,
            { textAlign: "center", marginBottom: Spacing[6] },
          ]}
        >
          Sign in to unlock your library, ratings and more.
        </Text>
        <Pressable
          onPress={() => router.push("/sign-in")}
          style={({ pressed }) => ({
            width: "100%",
            backgroundColor: Colors.sun,
            borderWidth: Border.width,
            borderColor: Colors.ink,
            borderRadius: Border.radius.md,
            paddingVertical: Spacing[4],
            alignItems: "center",
            opacity: pressed ? 0.8 : 1,
            shadowColor: Colors.ink,
            shadowOffset: {
              width: Shadow.default.offsetX,
              height: Shadow.default.offsetY,
            },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: Shadow.default.elevation,
          })}
        >
          <Text
            style={{
              fontFamily: Font.headingBlack,
              fontSize: FontSize.lg,
              color: Colors.ink,
            }}
          >
            Sign In
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/sign-up")}
          style={{ marginTop: Spacing[4] }}
        >
          <Text style={styles.switchLink}>Create an account →</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { signOut } = useAuth();

  // Must be called unconditionally — before any early return — to satisfy Rules of Hooks.
  const patterns = useQuery(
    api.queries.getPatterns.getPatternsByUser,
    user?.id ? { clerkId: user.id } : "skip",
  ) as PatternRecord[] | undefined;

  if (!user) return <SignInPrompt />;

  const savedCount = patterns?.filter((p) => p.isSaved).length ?? 0;
  const avgRating = patterns?.length
    ? (
        patterns.reduce((s, p) => s + (p.rating ?? 0), 0) /
          patterns.filter((p) => p.rating).length || 0
      ).toFixed(1)
    : "—";

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/onboarding");
        },
      },
    ]);
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <StripeRule height={7} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      >
        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <ConicGradient size={80} />
            {/* Initials overlay */}
            <View style={styles.avatarInitials} pointerEvents="none">
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] ??
                  user?.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ??
                  "?"}
              </Text>
            </View>
          </View>
          <Text style={styles.userName}>
            {user?.firstName
              ? `${user.firstName} ${user.lastName ?? ""}`.trim()
              : "Crocheter"}
          </Text>
          <Text style={styles.userEmail}>
            {user?.emailAddresses[0]?.emailAddress ?? ""}
          </Text>

          {/* Free badge */}
          <PillBadge
            label="Free Plan"
            backgroundColor={Colors.mint + "50"}
            style={{ marginTop: Spacing[2] }}
          />
        </View>

        <StripeRule height={6} />

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{patterns?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Patterns</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{avgRating}</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        <StripeRule height={6} />

        {/* Upgrade banner */}
        <Pressable
          onPress={() => router.push("/paywall")}
          style={({ pressed }) => [
            styles.upgradeBannerWrapper,
            pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
          ]}
        >
          <View style={styles.upgradeShadow} />
          <View style={styles.upgradeBanner}>
            <Text style={styles.upgradeBannerEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeBannerTitle}>Unlock Premium</Text>
              <Text style={styles.upgradeBannerSub}>
                Unlimited patterns, HD images, PDF export &amp; more
              </Text>
            </View>
            <Text style={styles.upgradeArrow}>→</Text>
          </View>
        </Pressable>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>Account</Text>

          <InkCard shadowOffset={{ x: 2, y: 2 }} style={styles.menuCard}>
            <MenuItem
              emoji="♥"
              label="Saved Patterns"
              sublabel={`${savedCount} saved`}
              onPress={() => router.push("/(tabs)/library")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              emoji="✨"
              label="Upgrade to Premium"
              badge="New"
              onPress={() => router.push("/paywall")}
            />
          </InkCard>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionLabel}>Support</Text>
          <InkCard shadowOffset={{ x: 2, y: 2 }} style={styles.menuCard}>
            <MenuItem
              emoji="📧"
              label="Send Feedback"
              onPress={() => Alert.alert("Feedback", "Feature coming soon!")}
            />
            <View style={styles.menuDivider} />
            <MenuItem emoji="📋" label="Privacy Policy" onPress={() => {}} />
          </InkCard>
        </View>

        <View style={styles.menuSection}>
          <InkCard shadowOffset={{ x: 2, y: 2 }} style={styles.menuCard}>
            <MenuItem
              emoji="🚪"
              label="Sign Out"
              danger
              onPress={handleSignOut}
            />
          </InkCard>
        </View>

        <Text style={styles.version}>CrochetBlueprint v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offwhite },

  header: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
  },
  headerTitle: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["2xl"],
    color: Colors.sun,
  },

  avatarSection: {
    alignItems: "center",
    paddingVertical: Spacing[8],
    backgroundColor: Colors.white,
  },
  avatarWrapper: { position: "relative", marginBottom: Spacing[3] },
  avatarInitials: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["2xl"],
    color: Colors.white,
    textShadowColor: Colors.ink,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userName: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  userEmail: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.gray,
    marginTop: 2,
  },

  statsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[5],
    backgroundColor: Colors.ink,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["2xl"],
    color: Colors.sun,
  },
  statLabel: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.white,
    opacity: 0.7,
  },
  statDivider: { width: 1, backgroundColor: Colors.white, opacity: 0.2 },

  // Upgrade banner
  upgradeBannerWrapper: {
    position: "relative",
    margin: Spacing[4],
  },
  upgradeShadow: {
    position: "absolute",
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.lg,
    backgroundColor: Colors.ink,
  },
  upgradeBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    backgroundColor: Colors.sun,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    borderRadius: Border.radius.lg,
    padding: Spacing[4],
  },
  upgradeBannerEmoji: { fontSize: 28 },
  upgradeBannerTitle: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  upgradeBannerSub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.ink,
    opacity: 0.75,
  },
  upgradeArrow: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },

  // Menu
  menuSection: { paddingHorizontal: Spacing[4], marginTop: Spacing[4] },
  menuSectionLabel: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: Spacing[2],
  },
  menuCard: {},
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    padding: Spacing[4],
  },
  menuEmoji: { fontSize: 22, width: 28 },
  menuLabel: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  menuSublabel: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  menuArrow: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xl,
    color: Colors.gray,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.offwhite,
    marginHorizontal: Spacing[4],
  },

  version: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: "center",
    marginTop: Spacing[6],
    opacity: 0.5,
  },
  switchLink: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.coral,
  },
});
