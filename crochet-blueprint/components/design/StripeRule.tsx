import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { StripeColors, Border } from '../../lib/constants';

interface StripeRuleProps {
  height?: number;
  colors?: readonly string[];
  style?: ViewStyle;
  borderTop?: boolean;
  borderBottom?: boolean;
}

/**
 * StripeRule — horizontal multicolor stripe motif.
 * CSS: background: repeating-linear-gradient(to right, coral, coral 20%, sun 20%, ...)
 * RN:  A flex row of equal-width colored segments with ink top/bottom borders.
 */
export function StripeRule({
  height = 8,
  colors = StripeColors,
  style,
  borderTop = true,
  borderBottom = true,
}: StripeRuleProps) {
  return (
    <View
      style={[
        styles.container,
        {
          height,
          borderTopWidth:    borderTop    ? Border.widthThin : 0,
          borderBottomWidth: borderBottom ? Border.widthThin : 0,
        },
        style,
      ]}
    >
      {colors.map((color, i) => (
        <View
          key={i}
          style={{ flex: 1, backgroundColor: color }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderColor: '#1A1A2E',
    width: '100%',
  },
});
