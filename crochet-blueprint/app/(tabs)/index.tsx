import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Animated,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "../../convex/_generated/api";
import { ConicGradient } from "../../components/design/ConicGradient";
import { StripeRule } from "../../components/design/StripeRule";
import { InkCard } from "../../components/design/InkCard";
import { PillBadge } from "../../components/design/PillBadge";
import {
  Colors,
  Font,
  FontSize,
  Spacing,
  Border,
  Shadow,
  CROCHET_TYPES,
  DIFFICULTY_LEVELS,
} from "../../lib/constants";
import type { PatternRecord } from "../../lib/types";

function TypeChip({
  item,
  onPress,
}: {
  item: (typeof CROCHET_TYPES)[number];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.typeChipWrapper,
        pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
      ]}
    >
      <View style={styles.typeChipShadow} />
      <View style={[styles.typeChip, { backgroundColor: item.bg }]}>
        <Text style={styles.typeEmoji}>{item.emoji}</Text>
        <Text style={styles.typeLabel}>{item.label}</Text>
      </View>
    </Pressable>
  );
}

function PatternCardSmall({ pattern }: { pattern: PatternRecord }) {
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/pattern/[id]", params: { id: pattern._id } })
      }
      style={({ pressed }) => [
        styles.patternCardWrapper,
        pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
      ]}
    >
      <InkCard style={styles.patternCard} shadowOffset={{ x: 3, y: 3 }}>
        {pattern.sectionImages?.["HERO"] ? (
          <Image
            source={{ uri: pattern.sectionImages["HERO"] }}
            style={styles.patternCardImage}
            resizeMode="cover"
          />
        ) : null}
        <View style={styles.patternCardInner}>
          <View style={styles.patternCardHeader}>
            <Text style={styles.patternCardEmoji}>
              {CROCHET_TYPES.find((t) => t.id === pattern.metadata.type)
                ?.emoji ?? "🧶"}
            </Text>
            {pattern.isSaved && <Text style={styles.savedHeart}>♥</Text>}
          </View>
          <Text style={styles.patternCardTitle} numberOfLines={2}>
            {`${pattern.metadata.size} ${pattern.metadata.type}`}
          </Text>
          <PillBadge
            label={pattern.metadata.difficulty}
            backgroundColor={Colors.lavenderBg}
            style={{ marginTop: Spacing[1] }}
          />
        </View>
      </InkCard>
    </Pressable>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useUser();
  const spinAnim = useRef(new Animated.Value(0)).current;

  const patterns = useQuery(
    api.queries.getPatterns.getPatternsByUser,
    user?.id ? { clerkId: user.id } : "skip",
  ) as PatternRecord[] | undefined;

  const savedCount = patterns?.filter((p) => p.isSaved).length ?? 0;
  const recentPatterns = patterns?.slice(0, 6) ?? [];

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 16000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Status bar area */}
      <View style={{ height: 0, backgroundColor: Colors.ink }} />

      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        {/* ── HERO ── */}
        <LinearGradient colors={[Colors.ink, "#2A2A4E"]} style={styles.hero}>
          {/* Blobs */}
          <View
            style={[
              styles.blob,
              { backgroundColor: Colors.coral, top: -20, right: -30 },
            ]}
          />
          <View
            style={[
              styles.blob,
              {
                backgroundColor: Colors.sun,
                bottom: 10,
                left: -40,
                width: 120,
                height: 120,
              },
            ]}
          />

          <View style={styles.heroContent}>
            <View style={styles.heroLogoRow}>
              <Animated.View style={{ transform: [{ rotate: spin }] }}>
                <ConicGradient size={40} />
              </Animated.View>
              <Text style={styles.heroLogo}>CrochetBlueprint</Text>
            </View>

            <Text style={styles.heroTitle}>
              Make <Text style={styles.heroTitleHighlight}>anything</Text>
            </Text>
            <Text style={styles.heroSub}>
              Describe it. Get a full pattern, sized for you.
            </Text>

            {/* CTA */}
            <Pressable
              onPress={() => router.push("/(tabs)/create")}
              style={({ pressed }) => [
                styles.heroCTAWrapper,
                pressed && {
                  transform: [{ translateX: 2 }, { translateY: 2 }],
                },
              ]}
            >
              <View style={styles.heroCTAShadow} />
              <View style={styles.heroCTABtn}>
                <Text style={styles.heroCTAText}>✨ Create a Pattern</Text>
              </View>
            </Pressable>
          </View>

          <StripeRule height={8} style={{ marginTop: Spacing[2] }} />
        </LinearGradient>

        {/* ── STICKY NAV BAR ── */}
        <View style={styles.stickyBar}>
          <Text style={styles.stickyTitle}>Explore Types</Text>
        </View>

        {/* ── TYPE BROWSER ── */}
        <View style={styles.section}>
          <FlatList
            data={CROCHET_TYPES}
            keyExtractor={(i) => i.id}
            numColumns={4}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TypeChip
                item={item}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/create",
                    params: { type: item.id },
                  })
                }
              />
            )}
            columnWrapperStyle={{ gap: Spacing[2], marginBottom: Spacing[2] }}
            style={{ paddingHorizontal: Spacing[4] }}
          />
        </View>

        <StripeRule height={6} style={{ marginVertical: Spacing[2] }} />

        {/* ── STATS BAR ── */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{patterns?.length ?? 0}</Text>
            <Text style={styles.statLabel}>Patterns Made</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{savedCount}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{CROCHET_TYPES.length}</Text>
            <Text style={styles.statLabel}>Item Types</Text>
          </View>
        </View>

        <StripeRule height={6} style={{ marginTop: Spacing[2] }} />

        {/* ── RECENT PATTERNS ── */}
        {recentPatterns.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Patterns</Text>
              <Pressable onPress={() => router.push("/(tabs)/library")}>
                <Text style={styles.sectionLink}>See All →</Text>
              </Pressable>
            </View>

            <View style={styles.grid}>
              {recentPatterns.map((p) => (
                <View
                  key={p._id}
                  style={{ width: (width - Spacing[4] * 2 - Spacing[3]) / 2 }}
                >
                  <PatternCardSmall pattern={p} />
                </View>
              ))}
            </View>
          </View>
        )}

        {recentPatterns.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🧶</Text>
            <Text style={styles.emptyTitle}>No patterns yet</Text>
            <Text style={styles.emptySub}>
              Tap Create to generate your first pattern!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── FAB ── */}
      <Pressable
        onPress={() => router.push("/(tabs)/create")}
        style={({ pressed }) => [
          styles.fabWrapper,
          { bottom: insets.bottom + 80 },
          pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
        ]}
      >
        <View style={styles.fabShadow} />
        <View style={styles.fab}>
          <Text style={styles.fabText}>✨</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offwhite },

  // ── Hero ──
  hero: { paddingBottom: 0 },
  blob: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.15,
  },
  heroContent: { padding: Spacing[5], paddingTop: Spacing[6] },
  heroLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[2],
    marginBottom: Spacing[4],
  },
  heroLogo: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.base,
    color: Colors.sun,
  },
  heroTitle: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["5xl"],
    color: Colors.white,
    lineHeight: FontSize["5xl"] * 1.1,
    marginBottom: Spacing[2],
  },
  heroTitleHighlight: { color: Colors.sun },
  heroSub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.white,
    opacity: 0.8,
    marginBottom: Spacing[6],
  },
  heroCTAWrapper: { position: "relative" },
  heroCTAShadow: {
    position: "absolute",
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.pill,
    backgroundColor: Colors.sun,
    opacity: 0.6,
  },
  heroCTABtn: {
    backgroundColor: Colors.sun,
    borderRadius: Border.radius.pill,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    paddingVertical: Spacing[3] + 2,
    alignItems: "center",
  },
  heroCTAText: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },

  // ── Sticky bar ──
  stickyBar: {
    backgroundColor: Colors.offwhite,
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
  },
  stickyTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },

  // ── Type chip ──
  section: { paddingVertical: Spacing[4] },
  typeChipWrapper: { flex: 1, padding: Spacing[1], position: "relative" },
  typeChipShadow: {
    position: "absolute",
    top: Shadow.default.offsetY + Spacing[1],
    left: Shadow.default.offsetX + Spacing[1],
    right: -Shadow.default.offsetX + Spacing[1],
    bottom: -Shadow.default.offsetY + Spacing[1],
    borderRadius: Border.radius.md,
    backgroundColor: Colors.ink,
  },
  typeChip: {
    borderRadius: Border.radius.md,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    paddingVertical: Spacing[2],
    alignItems: "center",
    gap: 2,
  },
  typeEmoji: { fontSize: 22 },
  typeLabel: {
    fontFamily: Font.bodyBold,
    fontSize: 10,
    color: Colors.ink,
    textAlign: "center",
  },

  // ── Stats ──
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.ink,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statNum: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["3xl"],
    color: Colors.sun,
  },
  statLabel: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.white,
    opacity: 0.7,
  },
  statDivider: { width: 1, backgroundColor: Colors.white, opacity: 0.2 },

  // ── Recent patterns ──
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing[5],
    marginBottom: Spacing[3],
  },
  sectionTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  sectionLink: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.coral,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  patternCardWrapper: { position: "relative" },
  patternCard: { overflow: "hidden" },
  patternCardImage: {
    width: "100%",
    aspectRatio: 1,
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
  },
  patternCardInner: { padding: Spacing[3] },
  patternCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing[2],
  },
  patternCardEmoji: { fontSize: 28 },
  savedHeart: { fontSize: 16, color: Colors.coral },
  patternCardTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    textTransform: "capitalize",
  },

  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing[10],
    paddingHorizontal: Spacing[8],
  },
  emptyEmoji: { fontSize: 56, marginBottom: Spacing[4] },
  emptyTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
    marginBottom: Spacing[2],
  },
  emptySub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    opacity: 0.6,
    textAlign: "center",
  },

  // ── FAB ──
  fabWrapper: { position: "absolute", right: Spacing[5], zIndex: 50 },
  fabShadow: {
    position: "absolute",
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: 32,
    backgroundColor: Colors.ink,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.sun,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { fontSize: 26 },
});
