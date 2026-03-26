import { collection, query, where, getCountFromServer, addDoc, serverTimestamp, getDocs, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';

export interface StoreData {
  id?: string;
  name: string;
  location: { lat: number; lng: number };
  logoUrl?: string;
  isActive: boolean;
  createdAt: any;
}

export interface DriverProfile {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: any;
}

export const adminService = {
  async getActiveDriversCount(): Promise<number> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'driver'));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error fetching drivers count:', error);
      return 0;
    }
  },

  async getStoresCount(): Promise<number> {
    try {
      const q = query(collection(db, 'stores'), where('isActive', '==', true));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      console.error('Error fetching stores count:', error);
      return 0;
    }
  },

  async registerStore(name: string, lat: number, lng: number, logoUrl?: string): Promise<string> {
    const storeData = {
      name,
      location: { lat, lng },
      logoUrl: logoUrl || '',
      isActive: true,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'stores'), storeData);
    return docRef.id;
  },

  async updateStore(id: string, updates: Partial<StoreData>): Promise<void> {
    const docRef = doc(db, 'stores', id);
    await updateDoc(docRef, updates);
  },

  async getStoreById(id: string): Promise<StoreData | null> {
    try {
      const docRef = doc(db, 'stores', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as StoreData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  },

  async getStores(): Promise<StoreData[]> {
    try {
      const q = query(collection(db, 'stores'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StoreData[];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },

  async getDrivers(): Promise<DriverProfile[]> {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'driver'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as DriverProfile[];
    } catch (error) {
      console.error('Error fetching drivers:', error);
      return [];
    }
  },

  async uploadImage(uri: string, path: string): Promise<string> {
    try {
      // 🚀 The XHR approach is the most stable way to handle Blobs in React Native for Firebase Storage
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

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, blob);
      
      // Clear the blob to prevent memory leaks in some environments
      // @ts-ignore
      if (typeof blob.close === 'function') {
        // @ts-ignore
        blob.close();
      }

      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image details:', error);
      if (error.code === 'storage/unauthorized') {
        throw new Error('Upload failed: Please check your Firebase Storage rules.');
      }
      throw error;
    }
  }
};
