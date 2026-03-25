import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, spacing } from '../theme';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ size = 'lg' }: LogoProps) {
  const titleSize = size === 'lg' ? fontSize.display : size === 'md' ? fontSize.xxxl : fontSize.xxl;
  const subtitleSize = size === 'lg' ? fontSize.md : size === 'md' ? fontSize.sm : fontSize.xs;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontSize: titleSize }]}>
        OTLI
      </Text>
      <View style={styles.divider} />
      <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
        DELIVERY
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.bold,
    color: colors.primary,
    letterSpacing: 8,
    textShadowColor: colors.glowYellow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: colors.secondary,
    marginVertical: spacing.sm,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  subtitle: {
    fontFamily: fonts.medium,
    color: colors.secondary,
    letterSpacing: 6,
    textShadowColor: colors.glowCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});
