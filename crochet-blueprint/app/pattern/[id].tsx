import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Image,
  Share,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation } from "convex/react";
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
  Shadow,
  CROCHET_TYPES,
  SECTION_COLORS,
} from "../../lib/constants";
import type { Id } from "../../convex/_generated/dataModel";
import type { PatternRecord } from "../../lib/types";

type TabId = "pattern" | "abbreviations" | "export";

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: "pattern", label: "Pattern", emoji: "📋" },
  { id: "abbreviations", label: "Abbrev.", emoji: "📖" },
  { id: "export", label: "Export", emoji: "📤" },
];

const COMMON_ABBREVIATIONS: { abbr: string; meaning: string }[] = [
  { abbr: "ch", meaning: "chain" },
  { abbr: "sc", meaning: "single crochet" },
  { abbr: "dc", meaning: "double crochet" },
  { abbr: "hdc", meaning: "half double crochet" },
  { abbr: "tc", meaning: "treble crochet" },
  { abbr: "sl st", meaning: "slip stitch" },
  { abbr: "MR", meaning: "magic ring" },
  { abbr: "inc", meaning: "increase (2 sc in same stitch)" },
  { abbr: "dec", meaning: "decrease (sc2tog)" },
  { abbr: "BLO", meaning: "back loop only" },
  { abbr: "FLO", meaning: "front loop only" },
  { abbr: "st(s)", meaning: "stitch(es)" },
  { abbr: "rnd", meaning: "round" },
  { abbr: "rep", meaning: "repeat" },
  { abbr: "sk", meaning: "skip" },
];

function parsePatternSections(
  text: string,
): { title: string; content: string }[] {
  if (!text) return [];
  // Matches "--- SECTION NAME ---" format produced by the GPT template
  const sectionRegex = /^---\s*([A-Z][A-Z\s&]+?)\s*---$/gm;
  const matches = [...text.matchAll(sectionRegex)];
  if (!matches.length) {
    return [{ title: "Pattern", content: text }];
  }
  const sections: { title: string; content: string }[] = [];
  matches.forEach((match, i) => {
    const start = match.index! + match[0].length;
    const end = matches[i + 1]?.index ?? text.length;
    sections.push({
      title: match[1].trim(),
      content: text.slice(start, end).trim(),
    });
  });
  return sections;
}

export default function PatternScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabId>("pattern");
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const pattern = useQuery(
    api.queries.getPatterns.getPatternById,
    id ? { id: id as Id<"patterns"> } : "skip",
  ) as PatternRecord | null | undefined;

  const toggleSaved = useMutation(api.mutations.savePattern.toggleSaved);
  const ratePattern = useMutation(api.mutations.savePattern.ratePattern);

  if (!pattern) {
    return (
      <View style={[styles.root, styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.sun} size="large" />
      </View>
    );
  }

  const typeInfo = CROCHET_TYPES.find((t) => t.id === pattern.metadata.type);
  const sections = parsePatternSections(pattern.patternText);

  async function handleToggleSave() {
    setSaving(true);
    await toggleSaved({ patternId: pattern!._id });
    setSaving(false);
  }

  async function handleShare() {
    await Share.share({
      message: `${pattern!.patternText}\n\n— Made with CrochetBlueprint`,
      title: "My Crochet Pattern",
    });
  }

  async function handleRate(stars: number) {
    await ratePattern({ patternId: pattern!._id, rating: stars });
  }

  const renderPattern = () => (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      bounces={false}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 40,
      }}
    >
      {/* Hero image */}
      {pattern.sectionImages?.["HERO"] && (
        <Pressable
          onPress={() => setImagePreview(pattern.sectionImages["HERO"])}
          style={styles.heroImageWrap}
        >
          <Image
            source={{ uri: pattern.sectionImages["HERO"] }}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </Pressable>
      )}

      {sections.map((section, i) => {
        const sectionColor = SECTION_COLORS[i % SECTION_COLORS.length];
        const sectionImage = pattern.sectionImages?.[section.title];
        return (
          <View key={i} style={styles.sectionBlock}>
            {/* Section header */}
            <View
              style={[styles.sectionHeader, { backgroundColor: sectionColor }]}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {sectionImage && (
              <Pressable onPress={() => setImagePreview(sectionImage)}>
                <Image
                  source={{ uri: sectionImage }}
                  style={styles.sectionImage}
                  resizeMode="cover"
                />
              </Pressable>
            )}

            {/* Section body */}
            <View style={styles.sectionBody}>
              {section.content
                .split("\n")
                .filter((line) => !line.trim().startsWith("IMAGE PROMPT:"))
                .map((line, li) => {
                  const isRoundLine = /^R\d+:|^Round \d+/i.test(line.trim());
                  return (
                    <Text
                      key={li}
                      style={[
                        styles.patternLine,
                        isRoundLine && styles.roundLine,
                      ]}
                    >
                      {line}
                    </Text>
                  );
                })}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderAbbreviations = () => (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      bounces={false}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 40,
        padding: Spacing[4],
      }}
    >
      <Text style={styles.abbrHeader}>Standard Abbreviations</Text>
      {COMMON_ABBREVIATIONS.map((a, i) => (
        <View key={i} style={styles.abbrRow}>
          <View style={styles.abbrBadge}>
            <Text style={styles.abbrCode}>{a.abbr}</Text>
          </View>
          <Text style={styles.abbrMeaning}>{a.meaning}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderExport = () => (
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      overScrollMode="never"
      bounces={false}
      contentContainerStyle={{
        padding: Spacing[5],
        gap: Spacing[4],
        paddingBottom: insets.bottom + 40,
      }}
    >
      <Text style={styles.exportTitle}>Export & Share</Text>

      <Pressable onPress={handleShare} style={styles.exportOptionWrapper}>
        <View style={styles.exportOptionShadow} />
        <View
          style={[styles.exportOption, { backgroundColor: Colors.sky + "30" }]}
        >
          <Text style={styles.exportOptionEmoji}>📤</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.exportOptionTitle}>Share Text</Text>
            <Text style={styles.exportOptionSub}>
              Share the pattern text via any app
            </Text>
          </View>
          <Text style={styles.exportArrow}>→</Text>
        </View>
      </Pressable>

      {/* Rate */}
      <Text style={styles.exportTitle}>Rate This Pattern</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => handleRate(star)}>
            <Text
              style={[
                styles.star,
                (pattern.rating ?? 0) >= star && styles.starFilled,
              ]}
            >
              {(pattern.rating ?? 0) >= star ? "★" : "☆"}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </Pressable>

        <View style={styles.headerMeta}>
          <Text style={styles.headerEmoji}>{typeInfo?.emoji ?? "🧶"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {pattern.metadata.size} {pattern.metadata.type}
            </Text>
            <View style={styles.headerBadges}>
              <PillBadge
                label={pattern.metadata.difficulty}
                backgroundColor={Colors.lavenderBg}
              />
              <PillBadge
                label={pattern.metadata.yarnWeight}
                backgroundColor={Colors.sunBg}
              />
            </View>
          </View>

          {/* Save button */}
          <Pressable
            onPress={handleToggleSave}
            disabled={saving}
            style={styles.saveBtn}
          >
            <Text
              style={[styles.saveIcon, pattern.isSaved && styles.saveFilled]}
            >
              {pattern.isSaved ? "♥" : "♡"}
            </Text>
          </Pressable>
        </View>
      </View>

      <StripeRule height={7} />

      {/* Inner Tab Bar */}
      <View style={styles.innerTabBar}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.innerTab,
              activeTab === tab.id && styles.innerTabActive,
            ]}
          >
            <Text style={styles.innerTabEmoji}>{tab.emoji}</Text>
            <Text
              style={[
                styles.innerTabLabel,
                activeTab === tab.id && styles.innerTabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1, overflow: "hidden" }}>
        {activeTab === "pattern" && renderPattern()}
        {activeTab === "abbreviations" && renderAbbreviations()}
        {activeTab === "export" && renderExport()}
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={!!imagePreview}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setImagePreview(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setImagePreview(null)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: imagePreview ?? "" }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
          <Pressable
            onPress={() => setImagePreview(null)}
            style={styles.modalCloseBtn}
          >
            <Text style={styles.modalCloseTxt}>✕</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offwhite },
  center: { justifyContent: "center", alignItems: "center" },

  header: {
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  backBtn: { paddingBottom: Spacing[2] },
  backBtnText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.white,
    opacity: 0.8,
  },
  headerMeta: { flexDirection: "row", alignItems: "center", gap: Spacing[3] },
  headerEmoji: { fontSize: 36 },
  headerTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.white,
    flex: 1,
  },
  headerBadges: { flexDirection: "row", gap: Spacing[2], marginTop: 4 },
  saveBtn: { padding: Spacing[2] },
  saveIcon: { fontSize: 28, color: Colors.white },
  saveFilled: { color: Colors.coral },

  // Inner tabs
  innerTabBar: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
  },
  innerTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: Spacing[3],
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  innerTabActive: { borderBottomColor: Colors.coral },
  innerTabEmoji: { fontSize: 14 },
  innerTabLabel: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  innerTabLabelActive: { color: Colors.ink, fontFamily: Font.bodyExtraBold },

  // Pattern sections
  heroImageWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: Colors.offwhite,
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
  },
  heroImage: { width: "100%", height: "100%" },
  sectionBlock: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[4],
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    borderRadius: Border.radius.md,
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
  },
  sectionTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  sectionImage: {
    width: "100%",
    height: 150,
    borderBottomWidth: Border.widthThin,
    borderBottomColor: Colors.ink,
  },
  sectionBody: { padding: Spacing[4], gap: 4, backgroundColor: Colors.white },
  patternLine: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    lineHeight: 22,
  },
  roundLine: { fontFamily: Font.bodyExtraBold, color: Colors.coral },

  // Abbreviations
  abbrHeader: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
    marginBottom: Spacing[4],
  },
  abbrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    paddingVertical: Spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: Colors.offwhite,
  },
  abbrBadge: {
    width: 60,
    backgroundColor: Colors.sunBg,
    borderRadius: Border.radius.sm,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    alignItems: "center",
  },
  abbrCode: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  abbrMeaning: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    flex: 1,
  },

  // Export
  exportTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
    marginBottom: Spacing[2],
  },
  exportOptionWrapper: { position: "relative" },
  exportOptionShadow: {
    position: "absolute",
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.lg,
    backgroundColor: Colors.ink,
  },
  exportOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
    padding: Spacing[4],
    borderRadius: Border.radius.lg,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
  },
  exportOptionEmoji: { fontSize: 28 },
  exportOptionTitle: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  exportOptionSub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  exportArrow: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  ratingRow: { flexDirection: "row", gap: Spacing[3] },
  star: { fontSize: 36, color: Colors.gray },
  starFilled: { color: Colors.sun },

  // Image preview modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "70%",
  },
  modalImage: {
    width: "100%",
    height: "100%",
    borderRadius: Border.radius.md,
  },
  modalCloseBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseTxt: {
    fontSize: 20,
    color: Colors.white,
    fontFamily: Font.bodyExtraBold,
  },
});
