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
import { colors, fonts, fontSize, spacing, borderRadius } from '../../src/theme';
import { ROLES, UserRole } from '../../src/utils/roles';
export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('client');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) newErrors.displayName = 'Name is required.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email address format.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim(), selectedRole);
      // Navigation is handled by the auth state listener in _layout.tsx
    } catch (err) {
      if (err instanceof FirebaseError) {
        setErrors({ general: getErrorMessage(err.code) });
      } else {
        setErrors({ general: 'An unexpected error occurred.' });
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
          <Text style={styles.title}>NEW USER REGISTRATION</Text>
          <View style={styles.titleUnderline} />

          {errors.general ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠</Text>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            error={errors.displayName}
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            secureTextEntry
            error={errors.confirmPassword}
          />

          {/* Role Selection */}
          <Text style={styles.roleLabel}>SELECT ROLE</Text>
          <View style={styles.roleContainer}>
            {ROLES.map((role) => (
              <TouchableOpacity
                key={role.value}
                onPress={() => setSelectedRole(role.value)}
                style={[
                  styles.roleOption,
                  selectedRole === role.value && styles.roleOptionSelected,
                ]}
              >
                <Text style={styles.roleIcon}>{role.icon}</Text>
                <Text
                  style={[
                    styles.roleText,
                    selectedRole === role.value && styles.roleTextSelected,
                  ]}
                >
                  {role.label.toUpperCase()}
                </Text>
                {selectedRole === role.value && <View style={styles.roleIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="REGISTER"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backText}>
              ALREADY HAVE AN ACCOUNT?{' '}
              <Text style={styles.backLink}>LOG IN</Text>
            </Text>
          </TouchableOpacity>
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  topLine: {
    height: 2,
    backgroundColor: colors.secondary,
    marginBottom: spacing.xl,
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
  roleLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textDim,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    position: 'relative',
    overflow: 'hidden',
  },
  roleOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(242, 233, 0, 0.05)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  roleText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    color: colors.textDim,
    letterSpacing: 1,
  },
  roleTextSelected: {
    color: colors.primary,
  },
  roleIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary,
  },
  registerButton: {
    marginBottom: spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  backText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  backLink: {
    fontFamily: fonts.semiBold,
    color: colors.secondary,
  },
});
