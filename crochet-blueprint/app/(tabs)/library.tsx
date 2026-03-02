import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/clerk-expo";
import { api } from "../../convex/_generated/api";
import { StripeRule } from "../../components/design/StripeRule";
import { InkCard } from "../../components/design/InkCard";
import { PillBadge } from "../../components/design/PillBadge";
import {
  Colors,
  Font,
  FontSize,
  Spacing,
  Border,
  CROCHET_TYPES,
} from "../../lib/constants";
import type { PatternRecord } from "../../lib/types";

type Filter = "all" | "saved" | string; // string = type id

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useUser();
  const [filter, setFilter] = useState<Filter>("all");

  const allPatterns = useQuery(
    api.queries.getPatterns.getPatternsByUser,
    user?.id ? { clerkId: user.id } : "skip",
  ) as PatternRecord[] | undefined;

  const displayed = (allPatterns ?? []).filter((p) => {
    if (filter === "all") return true;
    if (filter === "saved") return p.isSaved;
    return p.metadata.type === filter;
  });

  const cardWidth = (width - Spacing[4] * 2 - Spacing[3]) / 2;

  const filterOptions: { id: Filter; label: string; emoji?: string }[] = [
    { id: "all", label: "All" },
    { id: "saved", label: "Saved", emoji: "♥" },
    ...CROCHET_TYPES.map((t) => ({
      id: t.id as Filter,
      label: t.label,
      emoji: t.emoji,
    })),
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library</Text>
        <Text style={styles.headerSub}>
          {allPatterns?.length ?? 0} pattern
          {(allPatterns?.length ?? 0) !== 1 ? "s" : ""}
        </Text>
      </View>

      <StripeRule height={7} />

      {/* Filter chips (sticky) */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filterOptions.map((opt) => {
            const active = filter === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFilter(opt.id)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {opt.emoji && (
                  <Text style={styles.filterEmoji}>{opt.emoji}</Text>
                )}
                <Text
                  style={[styles.filterText, active && styles.filterTextActive]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid */}
      {displayed.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>
            {filter === "all" ? "No patterns yet" : "Nothing here"}
          </Text>
          <Text style={styles.emptySub}>
            {filter === "all"
              ? "Generate your first pattern on the Create tab!"
              : "Try a different filter or create something new."}
          </Text>
          <Pressable
            onPress={() => router.push("/(tabs)/create")}
            style={styles.emptyBtn}
          >
            <Text style={styles.emptyBtnText}>✨ Create Pattern</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(p) => p._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[
            styles.gridContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const typeInfo = CROCHET_TYPES.find(
              (t) => t.id === item.metadata.type,
            );
            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/pattern/[id]",
                    params: { id: item._id },
                  })
                }
                style={({ pressed }) => [
                  { width: cardWidth },
                  pressed && {
                    transform: [{ translateX: 2 }, { translateY: 2 }],
                  },
                ]}
              >
                <InkCard shadowOffset={{ x: 3, y: 3 }}>
                  <View style={styles.patternCard}>
                    {item.sectionImages?.["HERO"] ? (
                      <Image
                        source={{ uri: item.sectionImages["HERO"] }}
                        style={styles.cardImage}
                        resizeMode="cover"
                      />
                    ) : null}
                    <View style={styles.patternTop}>
                      <Text style={styles.patternEmoji}>
                        {typeInfo?.emoji ?? "🧶"}
                      </Text>
                      {item.isSaved && <Text style={styles.heartIcon}>♥</Text>}
                    </View>
                    <Text style={styles.patternType} numberOfLines={1}>
                      {item.metadata.type}
                    </Text>
                    <Text style={styles.patternSize} numberOfLines={1}>
                      {item.metadata.size}
                    </Text>
                    <View style={styles.patternBadges}>
                      <PillBadge
                        label={item.metadata.difficulty}
                        backgroundColor={Colors.lavenderBg}
                        style={{ maxWidth: "100%" }}
                      />
                    </View>
                    <Text style={styles.patternDate}>
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </View>
                </InkCard>
              </Pressable>
            );
          }}
        />
      )}
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
  headerSub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.65,
  },

  filterBar: {
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
    backgroundColor: Colors.white,
    paddingVertical: Spacing[2],
  },
  filterScroll: { paddingHorizontal: Spacing[4], gap: Spacing[2] },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1] + 2,
    borderRadius: Border.radius.pill,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
  },
  filterChipActive: { backgroundColor: Colors.ink },
  filterEmoji: { fontSize: 12 },
  filterText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.ink,
  },
  filterTextActive: { color: Colors.white },

  gridRow: { gap: Spacing[3], paddingHorizontal: Spacing[4] },
  gridContent: { gap: Spacing[3], paddingTop: Spacing[4] },

  patternCard: { overflow: "hidden" },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
  },
  patternTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing[2],
  },
  patternEmoji: { fontSize: 32, marginTop: Spacing[3], marginLeft: Spacing[3] },
  heartIcon: {
    fontSize: 18,
    color: Colors.coral,
    marginTop: Spacing[3],
    marginRight: Spacing[3],
  },
  patternType: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    textTransform: "capitalize",
    paddingHorizontal: Spacing[3],
  },
  patternSize: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textTransform: "capitalize",
    marginBottom: Spacing[2],
    paddingHorizontal: Spacing[3],
  },
  patternBadges: { marginBottom: Spacing[2], paddingHorizontal: Spacing[3] },
  patternDate: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    paddingHorizontal: Spacing[3],
    paddingBottom: Spacing[3],
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing[8],
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
    marginBottom: Spacing[6],
  },
  emptyBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Border.radius.pill,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
  },
  emptyBtnText: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});
