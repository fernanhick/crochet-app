import React, { useRef, useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  useWindowDimensions, Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ConicGradient } from '../components/design/ConicGradient';
import { StripeRule } from '../components/design/StripeRule';
import { InkCard } from '../components/design/InkCard';
import {
  Colors, Font, FontSize, Spacing, Border, Shadow,
} from '../lib/constants';

const SLIDES = [
  {
    id: 0,
    emoji: '🧶',
    title: 'Your crochet\nblueprint,\ninstantly.',
    subtitle:
      'Describe what you want to make. Get a complete, professional pattern — sized exactly for you.',
    bg: Colors.sunBg,
    accent: Colors.sun,
  },
  {
    id: 1,
    emoji: '✨',
    title: 'AI-powered\npatterns,\nmade simple.',
    subtitle:
      'From a tiny amigurumi to a king-size blanket, every pattern includes rounds, stitch counts and yarn estimates.',
    bg: Colors.coralBg,
    accent: Colors.coral,
  },
  {
    id: 2,
    emoji: '📚',
    title: 'Save, revisit\nand export\nanytime.',
    subtitle:
      'Your library keeps every pattern organised. Export as PDF or share with friends — your work, your way.',
    bg: Colors.mintBg,
    accent: Colors.mint,
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ringAnim = useRef(new Animated.Value(0)).current;

  // Spin animation for the conic ball
  React.useEffect(() => {
    Animated.loop(
      Animated.timing(ringAnim, {
        toValue: 1,
        duration: 12000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  async function handleContinue() {
    if (activeIndex < SLIDES.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: width * next, animated: true });
    } else {
      await AsyncStorage.setItem('@crochet_onboarded', '1');
      router.replace('/(tabs)');
    }
  }

  const slide = SLIDES[activeIndex];
  const isLast = activeIndex === SLIDES.length - 1;

  return (
    <View style={[styles.root, { backgroundColor: slide.bg }]}>
      {/* Top safe area bar */}
      <View style={{ height: insets.top, backgroundColor: Colors.ink }} />

      {/* Header */}
      <View style={styles.header}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <ConicGradient size={36} />
        </Animated.View>
        <Text style={styles.brand}>CrochetBlueprint</Text>
      </View>

      <StripeRule height={7} />

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: width * SLIDES.length }}
      >
        {SLIDES.map((s) => (
          <View key={s.id} style={[styles.slide, { width }]}>
            {/* Big emoji */}
            <View style={styles.emojiWrap}>
              <Text style={styles.emoji}>{s.emoji}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{s.title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{s.subtitle}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && { backgroundColor: Colors.ink, width: 20 },
            ]}
          />
        ))}
      </View>

      {/* CTA Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing[4] }]}>
        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => [
            styles.ctaWrapper,
            pressed && { transform: [{ translateX: 2 }, { translateY: 2 }] },
          ]}
        >
          <View style={styles.ctaShadow} />
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText}>
              {isLast ? 'Get Started →' : 'Next →'}
            </Text>
          </View>
        </Pressable>
      </View>

      <StripeRule height={6} borderTop={false} />
      <View style={{ height: insets.bottom > 0 ? 0 : 4, backgroundColor: Colors.ink }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.ink,
  },
  brand: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.lg,
    color: Colors.sun,
    letterSpacing: -0.5,
  },
  slide: {
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[10],
  },
  emojiWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.white,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[8],
    // Hard shadow
    shadowColor: Colors.ink,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  emoji: { fontSize: 52 },
  title: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize['4xl'],
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: FontSize['4xl'] * 1.15,
    marginBottom: Spacing[5],
  },
  subtitle: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    textAlign: 'center',
    lineHeight: FontSize.base * 1.6,
    opacity: 0.75,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: Spacing[5],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[2],
  },
  ctaWrapper: { position: 'relative', width: '100%' },
  ctaShadow: {
    position: 'absolute',
    top:    Shadow.default.offsetY,
    left:   Shadow.default.offsetX,
    right:  -Shadow.default.offsetX,
    bottom: -Shadow.default.offsetY,
    borderRadius: Border.radius.pill,
    backgroundColor: Colors.ink,
  },
  ctaButton: {
    backgroundColor: Colors.sun,
    borderRadius: Border.radius.pill,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.lg,
    color: Colors.ink,
    letterSpacing: -0.3,
  },
});
