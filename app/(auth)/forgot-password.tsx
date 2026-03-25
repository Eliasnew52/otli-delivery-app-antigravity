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
export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      if (err instanceof FirebaseError) {
        switch (err.code) {
          case 'auth/user-not-found':
            setError('No account found with this email.');
            break;
          case 'auth/invalid-email':
            setError('Invalid email address format.');
            break;
          default:
            setError('An error occurred. Please try again.');
        }
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
        <View style={styles.topLine} />

        <View style={styles.logoContainer}>
          <Logo size="sm" />
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>PASSWORD RECOVERY</Text>
          <View style={styles.titleUnderline} />

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successTitle}>RESET EMAIL SENT</Text>
              <Text style={styles.successMessage}>
                Check your inbox for a password reset link. If you don't see it, check your spam
                folder.
              </Text>
              <Button
                title="BACK TO LOGIN"
                onPress={() => router.back()}
                variant="outline"
                style={styles.backToLoginButton}
              />
            </View>
          ) : (
            <>
              <Text style={styles.description}>
                Enter the email address linked to your account. We'll send you a link to reset your
                password.
              </Text>

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

              <Button
                title="SEND RESET LINK"
                onPress={handleReset}
                loading={loading}
                style={styles.resetButton}
              />

              <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backText}>← BACK TO LOGIN</Text>
              </TouchableOpacity>
            </>
          )}
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
    backgroundColor: colors.accent,
    marginBottom: spacing.xxl,
    opacity: 0.3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textDim,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
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
  resetButton: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.secondary,
    letterSpacing: 1,
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  successIcon: {
    fontSize: 48,
    color: colors.success,
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0, 255, 136, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  successTitle: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.success,
    letterSpacing: 3,
    marginBottom: spacing.md,
  },
  successMessage: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  backToLoginButton: {
    width: '100%',
  },
});
