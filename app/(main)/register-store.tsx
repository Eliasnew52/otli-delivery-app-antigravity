import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import MapView, { Region } from '../../src/components/MapView';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/contexts/AuthContext';
import { adminService } from '../../src/services/adminService';
import Button from '../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../src/theme';
import { Ionicons } from '@expo/vector-icons';

const NAGAROTE_LOCATION = {
  latitude: 12.2662,
  longitude: -86.5645,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function RegisterStoreScreen() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState<Region>(NAGAROTE_LOCATION);
  const [mapReady, setMapReady] = useState(false);

  const isAdmin = userProfile?.role === 'admin';

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && !isAdmin) {
        router.replace('/(main)/home' as any);
      }
    }, [authLoading, isAdmin, router])
  );

  // Request Permissions & Initialize Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } catch (e) {
          console.warn('Could not get current location, using Nagarote default.');
        }
      }
      setMapReady(true);
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      // API key / Geocoding uses the native OS service
      const results = await Location.geocodeAsync(searchQuery);
      if (results && results.length > 0) {
        const { latitude, longitude } = results[0];
        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        mapRef.current?.animateToRegion(newRegion, 1000);
      } else {
        setError('Location not found. Try a different query.');
      }
    } catch (err) {
      setError('Search failed. Please ensure location permissions are granted.');
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

  const handleRegister = async () => {
    if (!storeName.trim()) {
      setError('Store name is required.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let logoUrl = '';
      if (logoUri) {
        const fileName = `store_logos/${Date.now()}.jpg`;
        logoUrl = await adminService.uploadImage(logoUri, fileName);
      }

      // Region captures exactly where the center pin is located
      await adminService.registerStore(
        storeName.trim(),
        region.latitude,
        region.longitude,
        logoUrl
      );
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to register store. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAdmin || !mapReady) {
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
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>REGISTER STORE</Text>
          <Text style={styles.subtitle}>Fill out the details and locate the store on the map.</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>STORE LOGO</Text>
            <TouchableOpacity style={styles.logoPicker} onPress={pickImage}>
              {logoUri ? (
                <Image source={{ uri: logoUri }} style={styles.logoImage} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="camera" size={30} color={colors.textDim} />
                  <Text style={styles.logoPlaceholderText}>SELECT LOGO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>STORE NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Downtown Coffee"
              placeholderTextColor={colors.textMuted}
              value={storeName}
              onChangeText={(text) => {
                setStoreName(text);
                setError(null);
              }}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.mapContainer}>
            <Text style={styles.label}>LOCATION</Text>
            <Text style={styles.helperText}>Drag the map to position the pin exactly on the store.</Text>
            
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.input, styles.searchInput]}
                placeholder="Search city, neighborhood..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <Button
                title={isSearching ? "..." : "SEARCH"}
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
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                showsUserLocation={true}
              />
              {/* Fixed Center Pin rendered above map */}
              <View style={styles.centerPinContainer} pointerEvents="none">
                <Ionicons name="location" size={40} color={colors.primary} />
              </View>
            </View>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <Button
              title={saving ? "SAVING..." : "REGISTER STORE"}
              onPress={handleRegister}
              disabled={saving}
              variant="primary"
            />
            <View style={{ height: spacing.md }} />
            <Button
              title="CANCEL"
              onPress={() => router.back()}
              disabled={saving}
              variant="outline"
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
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.primary, marginBottom: spacing.xs, letterSpacing: 1 },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.textDim, marginBottom: spacing.xl },
  inputContainer: { marginBottom: spacing.xl },
  label: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
  logoPicker: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignSelf: 'center', marginBottom: spacing.md, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: '100%', height: '100%' },
  logoPlaceholder: { alignItems: 'center' },
  logoPlaceholderText: { fontFamily: fonts.medium, fontSize: 10, color: colors.textDim, marginTop: 4 },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontFamily: fonts.medium, fontSize: fontSize.md },
  mapContainer: { marginBottom: spacing.xl },
  helperText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.textDim, marginBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  searchInput: { flex: 1, marginRight: spacing.sm, height: 48 },
  searchButton: { height: 48, justifyContent: 'center' },
  mapWrapper: { height: 300, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, position: 'relative' },
  map: { width: '100%', height: '100%' },
  centerPinContainer: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -40, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.error, marginBottom: spacing.lg, textAlign: 'center' },
  actions: { marginTop: spacing.lg }
});
