import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StripeRule } from "../components/design/StripeRule";
import {
  Colors,
  Font,
  FontSize,
  Spacing,
  Border,
  Shadow,
} from "../lib/constants";

// Required for OAuth redirect handling on Android
WebBrowser.maybeCompleteAuthSession();

type Step = "form" | "verify";

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const { startOAuthFlow: startGoogleOAuth } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startAppleOAuth } = useOAuth({
    strategy: "oauth_apple",
  });

  async function handleOAuth(provider: "google" | "apple") {
    setOauthLoading(provider);
    try {
      const startFlow =
        provider === "google" ? startGoogleOAuth : startAppleOAuth;
      const { createdSessionId, setActive: setOAuthActive } = await startFlow({
        redirectUrl: Linking.createURL("/oauth-native-callback", {
          scheme: "crochet-blueprint",
        }),
      });
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace("/(tabs)");
      }
    } catch (err: any) {
      Alert.alert(
        "Sign Up Error",
        err?.errors?.[0]?.longMessage ??
          err?.message ??
          "Something went wrong.",
      );
    } finally {
      setOauthLoading(null);
    }
  }

  async function handleSignUp() {
    if (!isLoaded) return;
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ??
        err?.message ??
        "Something went wrong.";
      Alert.alert("Sign Up Error", msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!isLoaded) return;
    if (!code.trim()) {
      Alert.alert(
        "Enter the code",
        "Check your email for the 6-digit verification code.",
      );
      return;
    }
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)");
      } else {
        Alert.alert("Verification incomplete", "Please try again.");
      }
    } catch (err: any) {
      const msg =
        err?.errors?.[0]?.longMessage ?? err?.message ?? "Invalid code.";
      Alert.alert("Verification Error", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() =>
              step === "verify" ? setStep("form") : router.back()
            }
            style={styles.backBtn}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>
            {step === "form" ? "Create Account" : "Verify Email"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <StripeRule height={7} />

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {step === "form" ? (
            <>
              <View style={styles.heroSection}>
                <Text style={styles.heroEmoji}>🧶</Text>
                <Text style={styles.heroTitle}>Join the Community</Text>
                <Text style={styles.heroSub}>
                  Create patterns powered by AI
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.gray}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="next"
                />

                <Text style={[styles.fieldLabel, { marginTop: Spacing[4] }]}>
                  Password
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={Colors.gray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignUp}
                />

                <Pressable
                  onPress={handleSignUp}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.btnWrapper,
                    pressed && {
                      transform: [{ translateX: 2 }, { translateY: 2 }],
                    },
                  ]}
                >
                  <View style={[styles.btn, loading && { opacity: 0.7 }]}>
                    {loading ? (
                      <ActivityIndicator color={Colors.ink} size="small" />
                    ) : (
                      <Text style={styles.btnText}>Create Account</Text>
                    )}
                  </View>
                </Pressable>
              </View>

              {/* ── SSO divider ── */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* ── SSO buttons ── */}
              <View style={styles.ssoRow}>
                <Pressable
                  onPress={() => handleOAuth("google")}
                  disabled={!!oauthLoading}
                  style={({ pressed }) => [
                    styles.ssoBtn,
                    pressed && {
                      transform: [{ translateX: 1 }, { translateY: 1 }],
                    },
                    !!oauthLoading && { opacity: 0.6 },
                  ]}
                >
                  {oauthLoading === "google" ? (
                    <ActivityIndicator color={Colors.ink} size="small" />
                  ) : (
                    <>
                      <Text style={styles.ssoIcon}>G</Text>
                      <Text style={styles.ssoBtnText}>Google</Text>
                    </>
                  )}
                </Pressable>

                {Platform.OS === "ios" && (
                  <Pressable
                    onPress={() => handleOAuth("apple")}
                    disabled={!!oauthLoading}
                    style={({ pressed }) => [
                      styles.ssoBtn,
                      styles.ssoBtnApple,
                      pressed && {
                        transform: [{ translateX: 1 }, { translateY: 1 }],
                      },
                      !!oauthLoading && { opacity: 0.6 },
                    ]}
                  >
                    {oauthLoading === "apple" ? (
                      <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                      <>
                        <Text style={[styles.ssoIcon, { color: Colors.white }]}>
                          &#xF8FF;
                        </Text>
                        <Text
                          style={[styles.ssoBtnText, { color: Colors.white }]}
                        >
                          Apple
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <Pressable onPress={() => router.replace("/sign-in")}>
                  <Text style={styles.switchLink}>Sign In</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View style={styles.heroSection}>
                <Text style={styles.heroEmoji}>📬</Text>
                <Text style={styles.heroTitle}>Check your email</Text>
                <Text style={styles.heroSub}>
                  We sent a 6-digit code to{"\n"}
                  <Text style={{ color: Colors.coral }}>{email}</Text>
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor={Colors.gray}
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  returnKeyType="done"
                  onSubmitEditing={handleVerify}
                  autoFocus
                />

                <Pressable
                  onPress={handleVerify}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.btnWrapper,
                    pressed && {
                      transform: [{ translateX: 2 }, { translateY: 2 }],
                    },
                  ]}
                >
                  <View style={[styles.btn, loading && { opacity: 0.7 }]}>
                    {loading ? (
                      <ActivityIndicator color={Colors.ink} size="small" />
                    ) : (
                      <Text style={styles.btnText}>Verify & Continue</Text>
                    )}
                  </View>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.offwhite },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.ink,
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[3],
    paddingBottom: Spacing[4],
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  backText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xl,
    color: Colors.sun,
  },
  headerTitle: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize.xl,
    color: Colors.sun,
  },

  content: { padding: Spacing[5], paddingBottom: 40 },

  heroSection: { alignItems: "center", marginBottom: Spacing[6] },
  heroEmoji: { fontSize: 56, marginBottom: Spacing[3] },
  heroTitle: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize["3xl"],
    color: Colors.ink,
  },
  heroSub: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.gray,
    marginTop: 4,
    textAlign: "center",
    lineHeight: 22,
  },

  card: {
    backgroundColor: Colors.white,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    borderRadius: Border.radius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[5],
    shadowColor: Colors.ink,
    shadowOffset: {
      width: Shadow.default.offsetX,
      height: Shadow.default.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.default.elevation,
  },

  fieldLabel: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
    marginBottom: Spacing[2],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: Border.width,
    borderColor: Colors.ink,
    borderRadius: Border.radius.md,
    padding: Spacing[3],
    fontFamily: Font.bodyBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    backgroundColor: Colors.offwhite,
  },
  codeInput: {
    textAlign: "center",
    fontSize: FontSize["2xl"],
    letterSpacing: 8,
    fontFamily: Font.headingBlack,
  },

  btnWrapper: {
    marginTop: Spacing[6],
    shadowColor: Colors.ink,
    shadowOffset: {
      width: Shadow.default.offsetX,
      height: Shadow.default.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.default.elevation,
  },
  btn: {
    backgroundColor: Colors.sun,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    borderRadius: Border.radius.md,
    paddingVertical: Spacing[4],
    alignItems: "center",
  },
  btnText: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },

  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing[2],
  },
  switchText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  switchLink: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.coral,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing[4],
  },
  dividerLine: { flex: 1, height: 1.5, backgroundColor: Colors.ink },
  dividerText: {
    fontFamily: Font.bodyBold,
    fontSize: FontSize.xs,
    color: Colors.gray,
    marginHorizontal: Spacing[3],
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  ssoRow: { flexDirection: "row", gap: Spacing[3], marginBottom: Spacing[4] },
  ssoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing[2],
    backgroundColor: Colors.white,
    borderWidth: Border.width,
    borderColor: Colors.ink,
    borderRadius: Border.radius.md,
    paddingVertical: Spacing[3],
    shadowColor: Colors.ink,
    shadowOffset: {
      width: Shadow.default.offsetX,
      height: Shadow.default.offsetY,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: Shadow.default.elevation,
  },
  ssoBtnApple: { backgroundColor: Colors.ink },
  ssoIcon: {
    fontFamily: Font.headingBlack,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  ssoBtnText: {
    fontFamily: Font.bodyExtraBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
});
