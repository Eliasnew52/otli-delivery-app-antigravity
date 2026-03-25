import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import Button from '../../src/components/Button';
import Logo from '../../src/components/Logo';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../src/theme';
import { ROLE_LABELS } from '../../src/utils/roles';

export default function HomeScreen() {
  const { user, userProfile, logout } = useAuth();

  const roleBadgeColor = {
    admin: colors.accent,
    driver: colors.secondary,
    client: colors.primary,
  };

  const role = userProfile?.role || 'client';
  const badgeColor = roleBadgeColor[role];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Logo size="sm" />
      </View>

      <View style={styles.content}>
        {/* Welcome Card */}
        <View style={[styles.card, shadows.card]}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM ONLINE</Text>
          </View>

          <Text style={styles.welcomeText}>WELCOME BACK,</Text>
          <Text style={styles.nameText}>
            {userProfile?.displayName || user?.email || 'User'}
          </Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>EMAIL</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ROLE</Text>
            <View style={[styles.roleBadge, { borderColor: badgeColor }]}>
              <Text style={[styles.roleBadgeText, { color: badgeColor }]}>
                {ROLE_LABELS[role]}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <Text style={[styles.infoValue, { color: colors.success }]}>ACTIVE</Text>
          </View>
        </View>

        {/* Coming Soon Card */}
        <View style={[styles.comingSoonCard, shadows.card]}>
          <Text style={styles.comingSoonTitle}>// MODULES LOADING</Text>
          <Text style={styles.comingSoonText}>
            Dashboard, Orders, Store Management, and more features coming soon.
          </Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="DISCONNECT"
          onPress={logout}
          variant="ghost"
          textStyle={{ color: colors.accent }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: spacing.sm,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.success,
    letterSpacing: 2,
  },
  welcomeText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.md,
    color: colors.textDim,
    letterSpacing: 3,
  },
  nameText: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xxl,
    color: colors.primary,
    letterSpacing: 1,
    textShadowColor: colors.glowYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: 1.5,
  },
  infoValue: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: 0.5,
  },
  roleBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  roleBadgeText: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.xs,
    letterSpacing: 1.5,
  },
  comingSoonCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  comingSoonTitle: {
    fontFamily: fonts.semiBold,
    fontSize: fontSize.sm,
    color: colors.secondary,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  comingSoonText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.sm,
    color: colors.textDim,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.surfaceLight,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '15%',
    height: '100%',
    backgroundColor: colors.secondary,
    borderRadius: 2,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
