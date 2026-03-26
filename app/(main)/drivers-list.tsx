import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { adminService, DriverProfile } from '../../src/services/adminService';
import Button from '../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DriversListScreen() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && !isAdmin) {
        router.replace('/(main)/home' as any);
        return;
      }

      if (isAdmin) {
        loadDrivers();
      }
    }, [authLoading, isAdmin, router])
  );

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDrivers();
      setDrivers(data);
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

  if (!isAdmin) return null;

  const renderDriver = ({ item }: { item: DriverProfile }) => (
    <View style={[styles.card, shadows.card]}>
      <View style={styles.cardHeader}>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.displayName || 'Unnamed Driver'}</Text>
          <Text style={styles.driverEmail}>{item.email}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>ACTIVE</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ACTIVE DRIVERS</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          renderItem={renderDriver}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No drivers found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: spacing.md, paddingHorizontal: 0 },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.accent, letterSpacing: 2 },
  loader: { marginTop: spacing.xxl },
  listContent: { padding: spacing.xl },
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverInfo: { flex: 1 },
  driverName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  driverEmail: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textDim },
  statusBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.success },
  statusText: { fontFamily: fonts.semiBold, fontSize: 10, color: colors.success, letterSpacing: 1 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl }
});
