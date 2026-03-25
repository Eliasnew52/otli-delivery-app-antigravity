import { initializeApp } from 'firebase/app';
import { initializeAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence is available at runtime in RN environments
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ⚠️ REPLACE these values with your own Firebase project config
// Get them from: Firebase Console → Project Settings → Your App → Config
const firebaseConfig = {
  apiKey: "AIzaSyB0T1iwu3sCe8EAEf5g5JawzBsryme6eJ4",
  authDomain: "otli-delivery-app-enhanced.firebaseapp.com",
  projectId: "otli-delivery-app-enhanced",
  storageBucket: "otli-delivery-app-enhanced.firebasestorage.app",
  messagingSenderId: "775181364931",
  appId: "1:775181364931:web:3450d576aee8d0d389bc76",
  measurementId: "G-5GCTTBR2KQ"
};

const app = initializeApp(firebaseConfig);

// Use AsyncStorage for auth persistence on React Native, default on web
let auth: Auth;
if (Platform.OS === 'web') {
  auth = initializeAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { auth };
export const db = getFirestore(app);

export default app;
