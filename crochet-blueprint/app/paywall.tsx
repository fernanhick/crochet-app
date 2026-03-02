import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StripeRule } from '../components/design/StripeRule';
import { InkCard } from '../components/design/InkCard';
import {
  Colors, Font, FontSize, Spacing, Border, Shadow,
} from '../lib/constants';

const FEATURES = [
  { emoji: '✨', label: 'Unlimited pattern generations' },
  { emoji: '🎨', label: 'HD AI section illustrations' },
  { emoji: '📄', label: 'PDF export with cover page' },
  { emoji: '📚', label: 'Unlimited saved patterns' },
  { emoji: '⚡', label: 'Priority generation speed' },
  { emoji: '🧶', label: 'Advanced pattern customisation' },
];

const PLANS = [
  { id: 'monthly', label: 'Monthly', price: '$4.99', period: '/month', badge: null },
  { id: 'annual', label: 'Annual', price: '$2.99', period: '/month', badge: 'Best Value', savings: 'Save 40%' },
];

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    // RevenueCat integration goes here (Phase 2)
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Simulate
    setLoading(false);
    Alert.alert('Coming Soon', 'Premium subscriptions will be available at launch!');
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>

      <StripeRule height={7} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={styles.heroTitle}>
            Unlock{'\n'}
            <Text style={styles.heroHighlight}>CrochetBlueprint</Text>
            {'\n'}Premium
          </Text>
          <Text style={styles.heroSub}>
            Everything you need to create, save and share beautiful patterns — for less than a coffee.
          </Text>
        </View>

        <StripeRule height={6} />

        {/* Features list */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What's included</Text>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureCheck}>✓</Text>
            </View>
          ))}
        </View>

        <StripeRule height={6} />

        {/* Plan selector */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose your plan</Text>
          <View style={styles.plansRow}>
            {PLANS.map(plan => {
              const active = selectedPlan === plan.id;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id as any)}
                  style={({ pressed }) => [
                    styles.planWrapper,
                    pressed && { transform: [{ translateX: 1 }, { translateY: 1 }] },
                  ]}
                >
                  <View style={[styles.planShadow, active && { backgroundColor: Colors.sun }]} />
                  <View style={[
                    styles.planCard,
                    active && styles.planCardActive,
                  ]}>
                    {plan.badge && (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    )}
                    <Text style={[styles.planLabel, active && styles.planLabelActive]}>
                      {plan.label}
                    </Text>
                    <Text style={[styles.planPrice, active && styles.planPriceActive]}>
                      {plan.price}
                    </Text>
                    <Text style={[styles.planPeriod, active && styles.planPeriodActive]}>
                      {plan.period}
                    </Text>
                    {plan.savings && (
                      <Text style={styles.planSavings}>{plan.savings}</Text>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + Spacing[2] }]}>
        <Pressable
          onPress={handleUpgrade}
          disabled={loading}
          style={({ pressed }) => [
            styles.ctaWrapper,
            pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
            loading && { opacity: 0.7 },
          ]}
        >
          <View style={styles.ctaShadow} />
          <View style={styles.ctaBtn}>
            <Text style={styles.ctaText}>
              {loading ? 'Processing…' : `Start ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'} Plan →`}
            </Text>
          </View>
        </Pressable>
        <Text style={styles.ctaDisclaimer}>
          Cancel anytime. Billed via App Store or Google Play.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offwhite },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.ink,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontFamily: Font.bodyBold, fontSize: FontSize.base, color: Colors.white },

  hero: {
    backgroundColor: Colors.ink,
    padding: Spacing[6],
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 52, marginBottom: Spacing[3] },
  heroTitle: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize['4xl'],
    color: Colors.white,
    textAlign: 'center',
    lineHeight: FontSize['4xl'] * 1.15,
    marginBottom: Spacing[3],
  },
  heroHighlight: { color: Colors.sun },
  heroSub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.75,
    lineHeight: FontSize.base * 1.6,
  },

  featuresSection: {
    padding: Spacing[5],
    gap: Spacing[3],
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
    marginBottom: Spacing[2],
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  featureEmoji: { fontSize: 22, width: 30 },
  featureLabel: { flex: 1, fontFamily: Font.bodyBold, fontSize: FontSize.base, color: Colors.ink },
  featureCheck: { fontFamily: Font.bodyBold, fontSize: FontSize.base, color: Colors.mint },

  plansSection: {
    padding: Spacing[5],
  },
  plansRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  planWrapper: { flex: 1, position: 'relative' },
  planShadow: {
    position: 'absolute',
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.lg,
    backgroundColor: Colors.ink,
  },
  planCard: {
    borderRadius: Border.radius.lg,
    borderWidth: Border.widthThin,
    borderColor: Colors.ink,
    backgroundColor: Colors.white,
    padding: Spacing[4],
    alignItems: 'center',
    gap: 2,
  },
  planCardActive: {
    backgroundColor: Colors.sun,
    borderWidth: Border.width,
  },
  planBadge: {
    backgroundColor: Colors.coral,
    borderRadius: Border.radius.pill,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
    marginBottom: Spacing[1],
  },
  planBadgeText: { fontFamily: Font.bodyExtraBold, fontSize: 10, color: Colors.white },
  planLabel: { fontFamily: Font.bodyBold, fontSize: FontSize.sm, color: Colors.gray },
  planLabelActive: { color: Colors.ink },
  planPrice: { fontFamily: Font.headingBlack, fontSize: FontSize['3xl'], color: Colors.ink },
  planPriceActive: { color: Colors.ink },
  planPeriod: { fontFamily: Font.bodyBold, fontSize: FontSize.xs, color: Colors.gray },
  planPeriodActive: { color: Colors.ink },
  planSavings: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.xs,
    color: Colors.coral,
    marginTop: Spacing[1],
  },

  ctaBar: {
    backgroundColor: Colors.offwhite,
    borderTopWidth: Border.widthThin,
    borderTopColor: Colors.ink,
    padding: Spacing[4],
    gap: Spacing[2],
  },
  ctaWrapper: { position: 'relative' },
  ctaShadow: {
    position: 'absolute',
    top: Shadow.default.offsetY,
    left: Shadow.default.offsetX,
    right: -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.pill,
    backgroundColor: Colors.ink,
  },
  ctaBtn: {
    backgroundColor: Colors.sun,
    borderRadius: Border.radius.pill,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  ctaText: { fontFamily: Font.bodyExtraBold, fontSize: FontSize.lg, color: Colors.ink },
  ctaDisclaimer: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'center',
  },
});
