import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Border, Font, FontSize, Spacing, Shadow } from '../../lib/constants';

interface TabIconProps {
  label: string;
  emoji: string;
  focused: boolean;
}

function TabIcon({ label, emoji, focused }: TabIconProps) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.barWrapper, { paddingBottom: insets.bottom }]}>
      {/* Ink shadow */}
      <View style={styles.barShadow} />
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabPressable}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              {options.tabBarIcon?.({ focused: isFocused })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Home" emoji="🏠" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Create" emoji="✨" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Library" emoji="📚" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Profile" emoji="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  barWrapper: {
    position: 'relative',
    backgroundColor: Colors.ink,
  },
  barShadow: {
    position: 'absolute',
    top: -3,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.ink,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: Border.width,
    borderTopColor: Colors.ink,
    height: 62,
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    paddingTop: Spacing[1],
    gap: 2,
  },
  tabItemActive: {
    // highlight via label color
  },
  tabEmoji: {
    fontSize: 20,
    lineHeight: 22,
  },
  tabLabel: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  tabLabelActive: {
    color: Colors.ink,
  },
});
