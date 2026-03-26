import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { adminService, StoreData } from '../../src/services/adminService';
import Button from '../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StoresListScreen() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && !isAdmin) {
        router.replace('/(main)/home' as any);
        return;
      }

      if (isAdmin) {
        loadStores();
      }
    }, [authLoading, isAdmin, router])
  );

  const loadStores = async () => {
    setLoading(true);
    try {
      const data = await adminService.getStores();
      setStores(data);
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

  const handleStorePress = (store: StoreData) => {
    setSelectedStore(store);
    setMenuVisible(true);
  };

  const navigateToConfig = () => {
    setMenuVisible(false);
    if (selectedStore) {
      router.push({ pathname: '/(main)/store/[id]', params: { id: selectedStore.id } } as any);
    }
  };

  const navigateToCatalog = () => {
    setMenuVisible(false);
    if (selectedStore) {
      router.push({ pathname: '/(main)/store/[id]/catalog', params: { id: selectedStore.id } } as any);
    }
  };

  const renderStore = ({ item }: { item: StoreData }) => (
    <TouchableOpacity 
      style={[styles.card, shadows.card]}
      onPress={() => handleStorePress(item)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.storeInfo}>
          {item.logoUrl ? (
            <Image source={{ uri: item.logoUrl }} style={styles.storeLogo} />
          ) : (
            <View style={[styles.storeLogo, styles.logoPlaceholder]}>
              <Ionicons name="storefront-outline" size={20} color={colors.textDim} />
            </View>
          )}
          <View>
            <Text style={styles.storeName}>{item.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={colors.textDim} />
              <Text style={styles.infoText}>
                {item.location.lat.toFixed(3)}, {item.location.lng.toFixed(3)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{item.isActive ? "ACTIVE" : "INACTIVE"}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          <Text style={styles.headerTitle}>REGISTERED STORES</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          renderItem={renderStore}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No stores have been registered yet.</Text>
          }
        />
      )}

      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>{selectedStore?.name?.toUpperCase() || 'STORE'}</Text>
              <Text style={styles.menuSubtitle}>SELECT AN ACTION</Text>
            </View>
            
            <TouchableOpacity style={styles.menuItem} onPress={navigateToConfig}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.glowYellow }]}>
                <Ionicons name="settings-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>STORE CONFIG</Text>
                <Text style={styles.menuItemDescription}>Update name, location, and logo</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.menuSeparator} />

            <TouchableOpacity style={styles.menuItem} onPress={navigateToCatalog}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.glowCyan }]}>
                <Ionicons name="list-outline" size={24} color={colors.secondary} />
              </View>
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>EDIT CATALOG</Text>
                <Text style={styles.menuItemDescription}>Manage products, prices, and stock</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.closeMenuButton} 
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeMenuText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
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
  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  storeInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  storeLogo: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.md },
  logoPlaceholder: { backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  storeName: { fontFamily: fonts.semiBold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  statusBadge: { backgroundColor: colors.surfaceLight, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm, borderWidth: 1, borderColor: colors.success },
  statusText: { fontFamily: fonts.semiBold, fontSize: 10, color: colors.success, letterSpacing: 1 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textDim, marginLeft: 4 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  menuContainer: { backgroundColor: colors.surface, borderRadius: borderRadius.xl, width: '100%', borderWidth: 1, borderColor: colors.border, padding: spacing.xl, overflow: 'hidden' },
  menuHeader: { alignItems: 'center', marginBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.surfaceLight, paddingBottom: spacing.lg },
  menuTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.accent, letterSpacing: 2, marginBottom: 4 },
  menuSubtitle: { fontFamily: fonts.medium, fontSize: 10, color: colors.textDim, letterSpacing: 3 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  menuIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
  menuItemTextContainer: { flex: 1 },
  menuItemTitle: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, marginBottom: 2 },
  menuItemDescription: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textDim },
  menuSeparator: { height: 1, backgroundColor: colors.surfaceLight, marginLeft: 64 },
  closeMenuButton: { marginTop: spacing.xl, paddingVertical: spacing.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.surfaceLight, paddingTop: spacing.xl },
  closeMenuText: { fontFamily: fonts.bold, fontSize: fontSize.sm, color: colors.textMuted, letterSpacing: 2 }
});
