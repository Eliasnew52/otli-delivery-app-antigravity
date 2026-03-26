import { collection, query, addDoc, serverTimestamp, getDocs, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface ProductOption {
  name: string;
  price: number;
}

export interface ProductOptionGroup {
  id?: string;
  title: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: ProductOption[];
}

export interface ProductData {
  id?: string;
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  category?: string;
  isAvailable: boolean;
  optionGroups?: ProductOptionGroup[];
  createdAt?: any;
}

export const storeService = {
  async getProducts(storeId: string): Promise<ProductData[]> {
    try {
      const q = query(
        collection(db, 'stores', storeId, 'products'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProductData[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async addProduct(storeId: string, data: Omit<ProductData, 'id' | 'createdAt'>): Promise<string> {
    const productData = {
      ...data,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'stores', storeId, 'products'), productData);
    return docRef.id;
  },

  async updateProduct(storeId: string, productId: string, updates: Partial<ProductData>): Promise<void> {
    const docRef = doc(db, 'stores', storeId, 'products', productId);
    await updateDoc(docRef, updates);
  },

  async deleteProduct(storeId: string, productId: string): Promise<void> {
    const docRef = doc(db, 'stores', storeId, 'products', productId);
    await deleteDoc(docRef);
  },

  async uploadProductImage(uri: string, storeId: string, fileName: string): Promise<string> {
    try {
      // Re-using the robust XHR approach from adminService
      const blob: Blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.error('XHR Error:', e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      const storageRef = ref(storage, `product_images/${storeId}/${fileName}`);
      await uploadBytes(storageRef, blob);
      
      // @ts-ignore
      if (typeof blob.close === 'function') {
        // @ts-ignore
        blob.close();
      }

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading product image:', error);
      throw error;
    }
  }
};
