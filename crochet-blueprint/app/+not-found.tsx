import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Font, FontSize, Spacing, Border } from '../lib/constants';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={styles.root}>
        <Text style={styles.emoji}>🧶</Text>
        <Text style={styles.title}>Page not found</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Go home →</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[6],
  },
  emoji: { fontSize: 52, marginBottom: Spacing[4] },
  title: {
    fontFamily: Font.headingBold,
    fontSize: FontSize.xl,
    color: Colors.white,
    marginBottom: Spacing[6],
  },
  link: {
    backgroundColor: Colors.sun,
    borderRadius: Border.radius.pill,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
  },
  linkText: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
});
