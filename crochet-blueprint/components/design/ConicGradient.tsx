import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { StripeColors, Colors, Border } from '../../lib/constants';

interface ConicGradientProps {
  size?: number;
  colors?: readonly string[];
  borderWidth?: number;
  borderColor?: string;
}

/**
 * ConicGradient — SVG arc-slice approximation of a conic gradient.
 * Used for: logo ball (34px), loading orb (130px), profile avatar (80px).
 * Divides a circle into N equal pie slices, one per color.
 */
export function ConicGradient({
  size = 34,
  colors = StripeColors,
  borderWidth = Border.width,
  borderColor = Colors.ink,
}: ConicGradientProps) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const n = colors.length;
  const sliceAngle = (2 * Math.PI) / n;

  function describeSlice(index: number): string {
    const startAngle = index * sliceAngle - Math.PI / 2;
    const endAngle   = startAngle + sliceAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {colors.map((color, i) => (
          <Path key={i} d={describeSlice(i)} fill={color} />
        ))}
        {/* Ink border ring */}
        <Circle
          cx={cx}
          cy={cy}
          r={r - borderWidth / 2}
          fill="none"
          stroke={borderColor}
          strokeWidth={borderWidth}
        />
      </Svg>
    </View>
  );
}
