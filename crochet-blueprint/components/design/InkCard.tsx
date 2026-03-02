import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Border } from '../../lib/constants';

interface InkCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadowOffset?: { x: number; y: number };
  shadowColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  backgroundColor?: string;
  onPress?: () => void;
}

/**
 * InkCard — replicates the CSS neo-brutalist hard offset drop shadow.
 * CSS: box-shadow: 3px 3px 0 #1A1A2E
 * RN:  A dark View absolutely positioned +offset behind the content View.
 */
export function InkCard({
  children,
  style,
  shadowOffset = { x: 3, y: 3 },
  shadowColor = Colors.ink,
  borderRadius = Border.radius.lg,
  borderWidth = Border.width,
  backgroundColor = Colors.white,
}: InkCardProps) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Shadow layer — sits behind */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            backgroundColor: shadowColor,
            borderRadius,
            top:    shadowOffset.y,
            left:   shadowOffset.x,
            right:  -shadowOffset.x,
            bottom: -shadowOffset.y,
          },
        ]}
      />
      {/* Content layer */}
      <View
        style={{
          backgroundColor,
          borderRadius,
          borderWidth,
          borderColor: Colors.ink,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
});
