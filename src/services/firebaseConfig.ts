import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore"; // Importa o Firestore
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey ?? '',
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain ?? '',
  projectId: Constants.expoConfig?.extra?.firebaseProjectId ?? '',
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket ?? '',
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId ?? '',
  appId: Constants.expoConfig?.extra?.firebaseAppId ?? '',
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId ?? '',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const storage = getStorage(app);
const db = getFirestore(app); // Inicializa o Firestore

export { storage, db }; // Exporta o Storage e o Firestore