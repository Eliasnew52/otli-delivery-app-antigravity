import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../../src/contexts/AuthContext';
import { storeService, ProductData, ProductOptionGroup, ProductOption } from '../../../../src/services/storeService';
import Button from '../../../../src/components/Button';
import { colors, fonts, fontSize, spacing, borderRadius, shadows } from '../../../../src/theme';
import { Ionicons } from '@expo/vector-icons';

export default function AddProductScreen() {
  const { id, productId } = useLocalSearchParams<{ id: string; productId?: string }>();
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    if (productId && id) {
      loadProductData();
    }
  }, [productId, id]);

  const loadProductData = async () => {
    setFetching(true);
    try {
      // We'll need a getProductById in storeService, but for now we can filter from list or add the method
      const products = await storeService.getProducts(id as string);
      const product = products.find(p => p.id === productId);
      
      if (product) {
        setName(product.name);
        setPrice(product.price.toString());
        setDescription(product.description || '');
        setCategory(product.category || '');
        setCurrentImageUrl(product.imageUrl || null);
        setOptionGroups(product.optionGroups || []);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load product details.');
    } finally {
      setFetching(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Option Group Handlers
  const addOptionGroup = () => {
    const newGroup: ProductOptionGroup = {
      id: Date.now().toString(),
      title: '',
      type: 'single',
      required: false,
      options: [{ name: '', price: 0 }]
    };
    setOptionGroups([...optionGroups, newGroup]);
  };

  const removeOptionGroup = (groupId: string) => {
    setOptionGroups(optionGroups.filter(g => g.id !== groupId));
  };

  const updateGroupTitle = (groupId: string, title: string) => {
    setOptionGroups(optionGroups.map(g => g.id === groupId ? { ...g, title } : g));
  };

  const toggleGroupType = (groupId: string) => {
    setOptionGroups(optionGroups.map(g => 
      g.id === groupId ? { ...g, type: g.type === 'single' ? 'multiple' : 'single' } : g
    ));
  };

  const addOptionToGroup = (groupId: string) => {
    setOptionGroups(optionGroups.map(g => 
      g.id === groupId ? { ...g, options: [...g.options, { name: '', price: 0 }] } : g
    ));
  };

  const removeOptionFromGroup = (groupId: string, optionIndex: number) => {
    setOptionGroups(optionGroups.map(g => 
      g.id === groupId ? { ...g, options: g.options.filter((_, i) => i !== optionIndex) } : g
    ));
  };

  const updateOptionDetail = (groupId: string, optionIndex: number, field: keyof ProductOption, value: string) => {
    setOptionGroups(optionGroups.map(g => {
      if (g.id === groupId) {
        const newOptions = [...g.options];
        if (field === 'price') {
          newOptions[optionIndex] = { ...newOptions[optionIndex], price: parseFloat(value) || 0 };
        } else {
          newOptions[optionIndex] = { ...newOptions[optionIndex], name: value };
        }
        return { ...g, options: newOptions };
      }
      return g;
    }));
  };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      setError('Name and price are required.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) {
      setError('Price must be a valid number.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      let imageUrl = currentImageUrl || '';
      if (imageUri) {
        const fileName = `product_${Date.now()}.jpg`;
        imageUrl = await storeService.uploadProductImage(imageUri, id as string, fileName);
      }

      const productData: Omit<ProductData, 'id' | 'createdAt'> = {
        name: name.trim(),
        price: priceNum,
        description: description.trim(),
        category: category.trim(),
        imageUrl,
        isAvailable: true,
        optionGroups,
      };

      if (productId) {
        await storeService.updateProduct(id as string, productId, productData);
        Alert.alert('Success', 'Product updated successfully!');
      } else {
        await storeService.addProduct(id as string, productData);
        Alert.alert('Success', 'Product added to catalog!');
      }
      
      router.back();
    } catch (err: any) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAdmin || fetching) {
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
          <Text style={styles.headerTitle}>{productId ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : currentImageUrl ? (
                <Image source={{ uri: currentImageUrl }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={40} color={colors.textDim} />
                  <Text style={styles.imagePlaceholderText}>ADD PRODUCT PHOTO</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PRODUCT NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Double Cheeseburger"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PRICE (USD)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CATEGORY</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Main Dishes, Drinks, Desserts"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Briefly describe the product ingredients or features..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>OPTIONS & VARIANTS</Text>
              <TouchableOpacity onPress={addOptionGroup} style={styles.addInternalButton}>
                <Ionicons name="add-circle" size={20} color={colors.secondary} />
                <Text style={styles.addInternalText}>ADD GROUP</Text>
              </TouchableOpacity>
            </View>

            {optionGroups.map((group) => (
              <View key={group.id} style={styles.optionGroupContainer}>
                <View style={styles.groupHeader}>
                  <TextInput
                    style={styles.groupTitleInput}
                    placeholder="Group Title (e.g. Size)"
                    placeholderTextColor={colors.textMuted}
                    value={group.title}
                    onChangeText={(text) => updateGroupTitle(group.id!, text)}
                  />
                  <TouchableOpacity onPress={() => removeOptionGroup(group.id!)}>
                    <Ionicons name="close-circle" size={24} color={colors.accent} />
                  </TouchableOpacity>
                </View>

                <View style={styles.groupSettings}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, group.type === 'multiple' && styles.toggleActive]}
                    onPress={() => toggleGroupType(group.id!)}
                  >
                    <Text style={[styles.toggleText, group.type === 'multiple' && styles.toggleTextActive]}>
                      {group.type === 'multiple' ? 'MULTIPLE CHOICE' : 'SINGLE CHOICE'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {group.options.map((option, index) => (
                  <View key={index} style={styles.optionRow}>
                    <TextInput
                      style={[styles.input, styles.optionNameInput]}
                      placeholder="Option Name"
                      placeholderTextColor={colors.textMuted}
                      value={option.name}
                      onChangeText={(text) => updateOptionDetail(group.id!, index, 'name', text)}
                    />
                    <TextInput
                      style={[styles.input, styles.optionPriceInput]}
                      placeholder="+$0.00"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="decimal-pad"
                      value={option.price === 0 ? '' : option.price.toString()}
                      onChangeText={(text) => updateOptionDetail(group.id!, index, 'price', text)}
                    />
                    <TouchableOpacity onPress={() => removeOptionFromGroup(group.id!, index)} style={styles.delOptionBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.textDim} />
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity 
                  onPress={() => addOptionToGroup(group.id!)}
                  style={styles.addOptionButton}
                >
                  <Ionicons name="add" size={16} color={colors.secondary} />
                  <Text style={styles.addOptionText}>ADD ITEM</Text>
                </TouchableOpacity>
              </View>
            ))}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.actions}>
              <Button
                title={saving ? "SAVING..." : (productId ? "UPDATE PRODUCT" : "ADD TO CATALOG")}
                onPress={handleSave}
                disabled={saving}
                variant="primary"
              />
              <View style={{ height: spacing.lg }} />
              <Button
                title="CANCEL"
                onPress={() => router.back()}
                disabled={saving}
                variant="ghost"
              />
            </View>
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
  imageSection: { alignItems: 'center', marginBottom: spacing.xl },
  imagePicker: { width: 140, height: 140, borderRadius: borderRadius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', ...shadows.card },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { fontFamily: fonts.bold, fontSize: 10, color: colors.textDim, marginTop: spacing.sm, textAlign: 'center' },
  form: { marginTop: spacing.md },
  inputGroup: { marginBottom: spacing.xl },
  label: { fontFamily: fonts.semiBold, fontSize: fontSize.xs, color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.md, padding: spacing.md, color: colors.text, fontFamily: fonts.medium, fontSize: fontSize.md },
  textArea: { height: 100, textAlignVertical: 'top' },
  errorText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.error, marginBottom: spacing.xl, textAlign: 'center' },
  actions: { marginTop: spacing.lg, marginBottom: spacing.xxl },
  
  // Variants Styles
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg, borderTopWidth: 1, borderTopColor: colors.surfaceLight, paddingTop: spacing.xl },
  sectionTitle: { fontFamily: fonts.bold, fontSize: fontSize.xs, color: colors.secondary, letterSpacing: 2 },
  addInternalButton: { flexDirection: 'row', alignItems: 'center' },
  addInternalText: { fontFamily: fonts.bold, fontSize: 10, color: colors.secondary, marginLeft: spacing.xs, letterSpacing: 1 },
  optionGroupContainer: { backgroundColor: colors.surfaceLighter, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  groupTitleInput: { flex: 1, fontFamily: fonts.bold, fontSize: fontSize.md, color: colors.text, paddingVertical: 4 },
  groupSettings: { marginBottom: spacing.md },
  toggleButton: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  toggleActive: { borderColor: colors.secondary, backgroundColor: colors.glowCyan },
  toggleText: { fontFamily: fonts.bold, fontSize: 10, color: colors.textDim, letterSpacing: 1 },
  toggleTextActive: { color: colors.secondary },
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  optionNameInput: { flex: 2, marginRight: spacing.sm, height: 40, fontSize: fontSize.sm },
  optionPriceInput: { flex: 1, marginRight: spacing.sm, height: 40, fontSize: fontSize.sm },
  delOptionBtn: { padding: 4 },
  addOptionButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginTop: spacing.xs, padding: spacing.xs },
  addOptionText: { fontFamily: fonts.bold, fontSize: 12, color: colors.secondary, marginLeft: 4 }
});
