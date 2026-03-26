import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { storeService, ProductData } from '../../../../src/services/storeService';
import { adminService, StoreData } from '../../../../src/services/adminService';
import Button from '../../../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StoreCatalogScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && !isAdmin) {
        router.replace('/(main)/home' as any);
        return;
      }

      if (isAdmin && id) {
        loadData();
      }
    }, [authLoading, isAdmin, router, id])
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [storeData, productsData] = await Promise.all([
        adminService.getStoreById(id as string),
        storeService.getProducts(id as string)
      ]);
      setStore(storeData);
      setProducts(productsData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load catalog data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to remove this product from the catalog?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await storeService.deleteProduct(id as string, productId);
              loadData(); // Reload list
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product.');
            }
          }
        }
      ]
    );
  };

  if (authLoading || (!isAdmin && loading)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAdmin) return null;

  const renderProduct = ({ item }: { item: ProductData }) => (
    <View style={[styles.productCard, shadows.card]}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons name="fast-food-outline" size={30} color={colors.textDim} />
        </View>
      )}
      <View style={styles.productInfo}>
        <View style={styles.productMainInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        </View>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description || 'No description provided.'}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity 
          onPress={() => router.push({ pathname: '/(main)/store/[id]/add-product', params: { id: id, productId: item.id } } as any)}
          style={styles.actionButton}
        >
          <Ionicons name="pencil" size={18} color={colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleDeleteProduct(item.id!)}
          style={styles.actionButton}
        >
          <Ionicons name="trash" size={18} color={colors.accent} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.accent} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>STORE CATALOG</Text>
            <Text style={styles.storeName}>{store?.name?.toUpperCase() || 'LOADING...'}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id!}
          contentContainerStyle={styles.listContent}
          renderItem={renderProduct}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={60} color={colors.surfaceLight} />
              <Text style={styles.emptyText}>No products found in this store.</Text>
              <Button 
                title="ADD YOUR FIRST PRODUCT" 
                onPress={() => router.push({ pathname: '/(main)/store/[id]/add-product', params: { id: id } } as any)}
                variant="outline"
                style={{ marginTop: spacing.xl }}
              />
            </View>
          }
        />
      )}

      {!loading && products.length > 0 && (
        <TouchableOpacity 
          style={[styles.fab, shadows.glowCyan]}
          onPress={() => router.push({ pathname: '/(main)/store/[id]/add-product', params: { id: id } } as any)}
        >
          <Ionicons name="add" size={32} color={colors.black} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  backButton: { padding: spacing.xs },
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.textDim, letterSpacing: 4, marginBottom: 2 },
  storeName: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.accent, letterSpacing: 1 },
  loader: { marginTop: spacing.xxl },
  listContent: { padding: spacing.xl, paddingBottom: 100 },
  productCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  productImage: { width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.surfaceLight },
  imagePlaceholder: { width: 60, height: 60, borderRadius: borderRadius.md, backgroundColor: colors.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, marginLeft: spacing.md },
  productMainInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  productName: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text },
  productPrice: { fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.primary },
  productDescription: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textDim, lineHeight: 16 },
  productActions: { flexDirection: 'row', marginLeft: spacing.sm },
  actionButton: { padding: spacing.sm, marginLeft: spacing.xs },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: spacing.xxl },
  emptyText: { fontFamily: fonts.medium, fontSize: fontSize.md, color: colors.textDim, textAlign: 'center', marginTop: spacing.lg },
  fab: { position: 'absolute', right: spacing.xl, bottom: spacing.xl, width: 64, height: 64, borderRadius: 32, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center', zIndex: 10 }
});
