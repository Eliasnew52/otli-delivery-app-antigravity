import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import Logo from '../../src/components/Logo';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, fonts, fontSize, spacing } from '../../src/theme';
export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      if (err instanceof FirebaseError) {
        setError(getErrorMessage(err.code));
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const KeyboardWrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;

  return (
    <KeyboardWrapper
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative top line */}
        <View style={styles.topLine} />
        
        <View style={styles.logoContainer}>
          <Logo size="lg" />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>ACCESS TERMINAL</Text>
          <View style={styles.titleUnderline} />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/forgot-password')}
            style={styles.forgotButton}
          >
            <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
          </TouchableOpacity>

          <Button
            title="INITIALIZE"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          <Button
            title="CREATE ACCOUNT"
            onPress={() => router.push('/(auth)/register')}
            variant="outline"
            style={styles.registerButton}
          />
        </View>

        {/* Decorative bottom elements */}
        <View style={styles.bottomDecor}>
          <View style={styles.decorLine} />
          <Text style={styles.decorText}>OTLI SYSTEMS v1.0</Text>
          <View style={styles.decorLine} />
        </View>
      </ScrollView>
    </KeyboardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxl,
  },
  topLine: {
    height: 2,
    backgroundColor: colors.primary,
    marginBottom: spacing.xxl,
    opacity: 0.3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    letterSpacing: 4,
    textAlign: 'center',
  },
  titleUnderline: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 61, 148, 0.1)',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 6,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorIcon: {
    fontSize: fontSize.lg,
    marginRight: spacing.sm,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.accent,
    flex: 1,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.secondary,
    letterSpacing: 1,
  },
  loginButton: {
    marginBottom: spacing.md,
  },
  registerButton: {
    marginBottom: spacing.xxl,
  },
  bottomDecor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  decorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  decorText: {
    fontFamily: fonts.light,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    letterSpacing: 2,
  },
});
