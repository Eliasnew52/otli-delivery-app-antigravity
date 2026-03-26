import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import MapView, { Region } from '../../../src/components/MapView';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../src/contexts/AuthContext';
import { adminService, StoreData } from '../../../src/services/adminService';
import Button from '../../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [storeName, setStoreName] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 12.2662,
    longitude: -86.5645,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const isAdmin = userProfile?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && !isAdmin) {
        router.replace('/(main)/home' as any);
      }
    }, [authLoading, isAdmin, router])
  );

  useEffect(() => {
    if (id) {
      loadStoreData();
    }
  }, [id]);

  const loadStoreData = async () => {
    setLoading(true);
    try {
      const store = await adminService.getStoreById(id as string);
      if (store) {
        setStoreName(store.name);
        setCurrentLogoUrl(store.logoUrl || null);
        setIsActive(store.isActive);
        const newRegion = {
          latitude: store.location.lat,
          longitude: store.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(newRegion);
        // Map might not be ready yet, animation handled in onMapReady or similar if needed
      } else {
        setError('Store not found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load store data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        setError('Location not found.');
      }
    } catch (err) {
      setError('Search failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
      setLogoBase64(result.assets[0].base64 || null);
    }
  };

  const handleUpdate = async () => {
    if (!storeName.trim()) {
      setError('Store name is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let logoUrl = currentLogoUrl || '';
      if (logoUri) {
        const fileName = `store_logos/${id}_${Date.now()}.jpg`;
        logoUrl = await adminService.uploadImage(logoUri, fileName);
      }

      await adminService.updateStore(id as string, {
        name: storeName.trim(),
        location: { lat: region.latitude, lng: region.longitude },
        logoUrl,
        isActive,
      });
      
      Alert.alert('Success', 'Store updated successfully!');
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to update store.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAdmin || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>EDIT STORE</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>STORE LOGO</Text>
            <TouchableOpacity style={styles.logoPicker} onPress={pickImage}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : currentLogoUrl ? (
                <Image source={{ uri: currentLogoUrl }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="camera" size={30} color={colors.textDim} />
                  <Text style={styles.logoPlaceholderText}>CHANGE LOGO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>STORE NAME</Text>
            <TextInput
              style={styles.input}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Store Name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.mapContainer}>
            <Text style={styles.label}>LOCATION</Text>
            <Text style={styles.helperText}>Drag the map to reposition the pin.</Text>
            
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.input, styles.searchInput]}
                placeholder="Search location..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <Button
                title={isSearching ? "..." : "GO"}
                onPress={handleSearch}
                variant="primary"
                disabled={isSearching}
                style={styles.searchButton}
              />
            </View>

            <View style={styles.mapWrapper}>
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation={true}
              />
              <View style={styles.centerPinContainer} pointerEvents="none">
                <Ionicons name="location" size={40} color={colors.primary} />
              </View>
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <Button
              title={saving ? "SAVING..." : "UPDATE STORE"}
              onPress={handleUpdate}
              disabled={saving}
              variant="primary"
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardAvoid: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { padding: spacing.xs },
  headerTitle: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.accent, letterSpacing: 2 },
  content: { padding: spacing.xl },
  inputContainer: { marginBottom: spacing.xl },
  label: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
  logoPicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignSelf: 'center', marginBottom: spacing.xs, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { alignItems: 'center' },
  logoPlaceholderText: { fontFamily: fonts.medium, fontSize: 10, color: colors.textDim, marginTop: 4 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontFamily: fonts.medium, fontSize: fontSize.md },
  mapContainer: { marginBottom: spacing.xl },
  helperText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textDim, marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  searchInput: { flex: 1, marginRight: spacing.sm, height: 48 },
  searchButton: { height: 48, justifyContent: 'center' },
  mapWrapper: { height: 250, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' },
  map: { width: '100%', height: '100%' },
  centerPinContainer: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -40, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.error, marginBottom: spacing.lg, textAlign: 'center' },
  actions: { marginTop: spacing.lg, marginBottom: spacing.xxl }
});
