import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Border, Font, FontSize, Spacing } from '../../lib/constants';

interface PillBadgeProps {
  label: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function PillBadge({
  label,
  backgroundColor = Colors.sun,
  textColor = Colors.ink,
  borderColor = Colors.ink,
  style,
  textStyle,
}: PillBadgeProps) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor, borderColor },
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderRadius: Border.radius.pill,
    borderWidth: Border.widthThin,
    paddingHorizontal: Spacing[3],
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
