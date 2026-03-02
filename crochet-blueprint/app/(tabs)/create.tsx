import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAction } from "convex/react";
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
  Shadow,
  CROCHET_TYPES,
  DIFFICULTY_LEVELS,
  COLOR_OPTIONS,
  SIZE_OPTIONS,
  YARN_WEIGHTS,
} from "../../lib/constants";
import type { GenerateFormState } from "../../lib/types";

const LOADING_STEPS = [
  { id: 0, label: "Reading your description...", emoji: "📖" },
  { id: 1, label: "Generating your design image...", emoji: "🎨" },
  { id: 2, label: "Designing stitch counts & shaping...", emoji: "🧮" },
  { id: 3, label: "Writing pattern sections...", emoji: "✍️" },
  { id: 4, label: "Checking for completeness...", emoji: "✅" },
  { id: 5, label: "Finalising your blueprint...", emoji: "📦" },
];

interface ChipRowProps {
  options: { id: string; label: string; emoji?: string; bg?: string }[];
  selected: string;
  onSelect: (id: string) => void;
  multi?: boolean;
  selectedMany?: string[];
  onToggle?: (id: string) => void;
}

function ChipRow({
  options,
  selected,
  onSelect,
  multi,
  selectedMany,
  onToggle,
}: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipRow}
    >
      {options.map((opt) => {
        const active = multi
          ? selectedMany?.includes(opt.id)
          : selected === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => (multi ? onToggle?.(opt.id) : onSelect(opt.id))}
            style={[styles.chip, active && styles.chipActive]}
          >
            {opt.emoji && <Text style={styles.chipEmoji}>{opt.emoji}</Text>}
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const DEFAULT_FORM: GenerateFormState = {
  type: "",
  description: "",
  size: "medium",
  difficulty: "beginner",
  colors: [],
  yarnWeight: "worsted",
  specialFeatures: [], // kept for backward compat, not shown in UI
};

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { type: preselectedType } = useLocalSearchParams<{ type?: string }>();
  const { user } = useUser();

  const [form, setForm] = useState<GenerateFormState>({
    ...DEFAULT_FORM,
    type: preselectedType ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const generatePattern = useAction(
    api.actions.generatePattern.generatePattern,
  );
  const stepProgress = useRef(new Animated.Value(0)).current;
  const orbAnim = useRef(new Animated.Value(0)).current;

  // Auto-advance loading step display (cosmetic only — real steps fire on server)
  useEffect(() => {
    if (!loading) return;
    // Image-first pipeline: ~30s total — intervals tuned accordingly
    const intervals = [1500, 8000, 14000, 20000, 26000];
    const timers = intervals.map((delay, i) =>
      setTimeout(() => setLoadingStep(i + 1), delay),
    );
    Animated.loop(
      Animated.timing(orbAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }),
    ).start();
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const orbRotate = orbAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  async function handleGenerate() {
    if (!user?.id) {
      setError("__signin__");
      return;
    }
    if (!form.type) {
      setError("Please select a type");
      return;
    }
    if (!form.description.trim()) {
      setError("Please add a description");
      return;
    }

    setError(null);
    setLoading(true);
    setLoadingStep(0);

    try {
      const result = await generatePattern({
        type: form.type,
        description: form.description,
        size: form.size,
        difficulty: form.difficulty,
        colors: form.colors,
        yarnWeight: form.yarnWeight,
        specialFeatures: form.specialFeatures,
      });

      router.push({
        pathname: "/pattern/[id]",
        params: { id: result.patternId },
      });
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const selectedType = CROCHET_TYPES.find((t) => t.id === form.type);

  // ── LOADING STATE ──
  if (loading) {
    return (
      <View
        style={[styles.root, styles.loadingRoot, { paddingTop: insets.top }]}
      >
        <View style={{ height: 0, backgroundColor: Colors.ink }} />
        <StripeRule height={8} />

        <View style={styles.loadingContent}>
          {/* Conic orb */}
          <Animated.View
            style={[styles.orbWrapper, { transform: [{ rotate: orbRotate }] }]}
          >
            {/* Multi-color ring — simplified concentric circles */}
            {[
              Colors.coral,
              Colors.sun,
              Colors.mint,
              Colors.sky,
              Colors.lavender,
            ].map((c, i) => (
              <View
                key={c}
                style={{
                  position: "absolute",
                  width: 130 - i * 18,
                  height: 130 - i * 18,
                  borderRadius: (130 - i * 18) / 2,
                  borderWidth: 6,
                  borderColor: c,
                  opacity: 1 - i * 0.1,
                }}
              />
            ))}
          </Animated.View>

          <Text style={styles.loadingTitle}>Crafting your pattern…</Text>

          <View style={styles.loadingSteps}>
            {LOADING_STEPS.map((step, i) => {
              const done = i < loadingStep;
              const active = i === loadingStep;
              return (
                <View
                  key={step.id}
                  style={[
                    styles.loadingStepRow,
                    !done && !active && { opacity: 0.35 },
                  ]}
                >
                  <Text style={styles.loadingStepEmoji}>
                    {done ? "✅" : active ? step.emoji : "○"}
                  </Text>
                  <Text
                    style={[
                      styles.loadingStepText,
                      active && {
                        color: Colors.sun,
                        fontFamily: Font.bodyExtraBold,
                      },
                    ]}
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text
            style={{
              color: Colors.gray,
              fontFamily: Font.body,
              fontSize: FontSize.sm,
              textAlign: "center",
              marginTop: Spacing[4],
              paddingHorizontal: Spacing[6],
            }}
          >
            This usually takes 20–30 seconds.{"\n"}Your pattern is being
            carefully crafted!
          </Text>
        </View>

        <StripeRule height={8} borderTop={true} borderBottom={false} />
      </View>
    );
  }

  // ── FORM ──
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create a Pattern</Text>
        <Text style={styles.headerSub}>Tell us what you want to make</Text>
      </View>

      <StripeRule height={7} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── TYPE SELECTOR ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>What are you making? *</Text>
          <FlatList
            data={CROCHET_TYPES}
            numColumns={4}
            scrollEnabled={false}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              const active = form.type === item.id;
              return (
                <Pressable
                  onPress={() => setForm((f) => ({ ...f, type: item.id }))}
                  style={[
                    styles.typeCard,
                    active && styles.typeCardActive,
                    { backgroundColor: item.bg },
                  ]}
                >
                  <Text style={styles.typeCardEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.typeCardLabel,
                      active && styles.typeCardLabelActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
            columnWrapperStyle={{ gap: Spacing[2] }}
            ItemSeparatorComponent={() => (
              <View style={{ height: Spacing[2] }} />
            )}
          />
        </View>

        {/* ── DESCRIPTION ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Describe it *</Text>
          <InkCard shadowOffset={{ x: 2, y: 2 }}>
            <TextInput
              value={form.description}
              onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
              placeholder={
                selectedType
                  ? `E.g. a ${selectedType.label.toLowerCase()} with a cute face and small ears…`
                  : "Tell us about your project, style, any special details…"
              }
              placeholderTextColor={Colors.gray}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              textAlignVertical="top"
            />
          </InkCard>
          <Text style={styles.fieldHint}>Be as specific as you like!</Text>
        </View>

        {/* ── SIZE ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Size</Text>
          <ChipRow
            options={
              // Hide "Large" for blanket & shawl — too many rows for a single generation
              (form.type === "blanket" || form.type === "shawl"
                ? SIZE_OPTIONS.filter((s) => s.id !== "large")
                : SIZE_OPTIONS
              ).map((s) => ({ id: s.id, label: s.label, emoji: s.emoji }))
            }
            selected={form.size}
            onSelect={(v) => setForm((f) => ({ ...f, size: v }))}
          />
        </View>

        {/* ── DIFFICULTY ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Difficulty</Text>
          <ChipRow
            options={DIFFICULTY_LEVELS.map((d) => ({
              id: d.id,
              label: d.label,
              emoji: d.emoji,
            }))}
            selected={form.difficulty}
            onSelect={(v) => setForm((f) => ({ ...f, difficulty: v }))}
          />
        </View>

        {/* ── COLORS ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Colors (pick up to 2)</Text>
          <View style={styles.colorGrid}>
            {COLOR_OPTIONS.map((c) => {
              const active = form.colors.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setForm((f) => {
                      const already = f.colors.includes(c.id);
                      if (already)
                        return {
                          ...f,
                          colors: f.colors.filter((x) => x !== c.id),
                        };
                      if (f.colors.length >= 2) return f;
                      return { ...f, colors: [...f.colors, c.id] };
                    });
                  }}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c.hex },
                    active && styles.colorSwatchActive,
                  ]}
                >
                  {active && <Text style={styles.colorCheck}>✓</Text>}
                </Pressable>
              );
            })}
          </View>
          {form.colors.length > 0 && (
            <Text style={styles.fieldHint}>
              Selected: {form.colors.join(", ")}
            </Text>
          )}
        </View>

        {/* ── YARN WEIGHT ── */}
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Yarn Weight</Text>
          <ChipRow
            options={YARN_WEIGHTS.map((y) => ({ id: y.id, label: y.label }))}
            selected={form.yarnWeight}
            onSelect={(v) => setForm((f) => ({ ...f, yarnWeight: v }))}
          />
        </View>

        {/* ── ERROR ── */}
        {error &&
          (error === "__signin__" ? (
            <Pressable
              onPress={() => router.push("/sign-in")}
              style={({ pressed }) => [
                styles.errorBox,
                styles.signinBox,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.errorText}>
                ⚠️ Please sign in to generate patterns
              </Text>
              <Text style={styles.signinLink}>Tap to Sign In →</Text>
            </Pressable>
          ) : (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          ))}
      </ScrollView>

      {/* ── GENERATE BUTTON ── */}
      <View
        style={[
          styles.generateBar,
          { paddingBottom: insets.bottom + Spacing[2] },
        ]}
      >
        <Pressable
          onPress={handleGenerate}
          style={({ pressed }) => [
            styles.generateWrapper,
            pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
          ]}
        >
          <View style={styles.generateShadow} />
          <View
            style={[
              styles.generateBtn,
              (!form.type || !form.description.trim()) && { opacity: 0.6 },
            ]}
          >
            <Text style={styles.generateText}>✨ Generate Pattern</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offwhite },

  // Header
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
    opacity: 0.7,
  },

  // Loading
  loadingRoot: { backgroundColor: Colors.ink },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing[6],
  },
  orbWrapper: {
    width: 130,
    height: 130,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing[8],
  },
  loadingTitle: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["2xl"],
    color: Colors.white,
    textAlign: "center",
    marginBottom: Spacing[8],
  },
  loadingSteps: { width: "100%", gap: Spacing[3] },
  loadingStepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing[3],
  },
  loadingStepEmoji: { fontSize: 20, width: 28, textAlign: "center" },
  loadingStepText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.white,
  },

  // Form
  fieldGroup: {
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[1],
  },
  fieldLabel: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    marginBottom: Spacing[2],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldHint: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginTop: Spacing[1],
  },

  // Type cards
  typeCard: {
    flex: 1,
    borderRadius: Border.radius.md,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    paddingVertical: Spacing[2],
    alignItems: "center",
    gap: 2,
  },
  typeCardActive: {
    borderWidth: Border.width,
    borderColor: Colors.ink,
  },
  typeCardEmoji: { fontSize: 20 },
  typeCardLabel: {
    fontFamily: Font.bodyBold,
    fontSize: 9,
    color: Colors.ink,
    textAlign: "center",
  },
  typeCardLabelActive: { fontFamily: Font.bodyExtraBold },

  // Chips
  chipRow: {
    paddingVertical: Spacing[1],
    gap: Spacing[2],
    paddingBottom: Spacing[1],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: Border.radius.pill,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.ink,
    borderColor: Colors.ink,
  },
  chipEmoji: { fontSize: 14 },
  chipText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  chipTextActive: { color: Colors.white },

  // TextInput
  textInput: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    padding: Spacing[4],
    minHeight: 110,
  },

  // Color swatches
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing[2],
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  colorSwatchActive: {
    borderWidth: Border.width,
    borderColor: Colors.ink,
  },
  colorCheck: { fontSize: 16, color: Colors.ink },

  // Error
  errorBox: {
    margin: Spacing[4],
    padding: Spacing[3],
    backgroundColor: Colors.coralBg,
    borderRadius: Border.radius.md,
    borderWidth: Border.widthThin,
    borderColor: Colors.coral,
  },
  errorText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  signinBox: { gap: 4 },
  signinLink: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.coral,
  },

  // Generate button
  generateBar: {
    backgroundColor: Colors.offwhite,
    borderTopWidth: Border.widthThin,
    borderTopColor: Colors.ink,
    padding: Spacing[4],
  },
  generateWrapper: { position: "relative" },
  generateShadow: {
    position: "absolute",
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.pill,
    backgroundColor: Colors.ink,
  },
  generateBtn: {
    backgroundColor: Colors.coral,
    borderRadius: Border.radius.pill,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    paddingVertical: Spacing[4],
    alignItems: "center",
  },
  generateText: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
});
