import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { adminService } from '../../src/services/adminService';
import Button from '../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../src/theme';

export default function AdminDashboardScreen() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [driversCount, setDriversCount] = useState<number | null>(null);
  const [storesCount, setStoresCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      // Security Check
      if (!authLoading && !isAdmin) {
        // Safe casting to relative path string for strict TS router
        router.replace('/(main)/home' as any);
        return;
      }

      if (isAdmin) {
        loadData();
      }
    }, [authLoading, isAdmin, router])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [drivers, stores] = await Promise.all([
        adminService.getActiveDriversCount(),
        adminService.getStoresCount(),
      ]);
      setDriversCount(drivers);
      setStoresCount(stores);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!isAdmin && loading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ADMIN SYSTEM</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>SYSTEM OVERVIEW</Text>
        
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statCard, shadows.card]}
            onPress={() => router.push('/(main)/drivers-list' as any)}
          >
            <Text style={styles.statValue}>
              {loading || driversCount === null ? '--' : driversCount}
            </Text>
            <Text style={styles.statLabel}>ACTIVE DRIVERS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statCard, shadows.card]}
            onPress={() => router.push('/(main)/stores-list' as any)}
          >
            <Text style={styles.statValue}>
              {loading || storesCount === null ? '--' : storesCount}
            </Text>
            <Text style={styles.statLabel}>STORES</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionContainer}>
          <Button
            title="REGISTER NEW STORE"
            onPress={() => router.push('/(main)/register-store' as any)}
            variant="primary"
          />
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="BACK TO HOME"
          onPress={() => router.push('/(main)/home' as any)}
          variant="ghost"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { alignItems: 'center', paddingVertical: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.accent, letterSpacing: 3 },
  content: { padding: spacing.xl },
  sectionTitle: { fontFamily: fonts.semiBold, fontSize: fontSize.sm, color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.lg },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxl },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center', marginHorizontal: spacing.sm },
  statValue: { fontFamily: fonts.bold, fontSize: 36, color: colors.primary, marginBottom: spacing.xs, textShadowColor: colors.glowYellow, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  statLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.textDim, letterSpacing: 1 },
  actionContainer: { marginTop: spacing.xl },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }
});
