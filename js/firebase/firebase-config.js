// ============================================================
// firebase/firebase-config.js — Firebase init (singleton)
// ============================================================
import { initializeApp }         from 'firebase/app';
import { getAuth }               from 'firebase/auth';
import { getFirestore }          from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyAoEPG7EZmn5scGd8om9TXCMNA949hRXmE',
  authDomain:        'tu-tien-c3258.firebaseapp.com',
  projectId:         'tu-tien-c3258',
  storageBucket:     'tu-tien-c3258.firebasestorage.app',
  messagingSenderId: '879646591678',
  appId:             '1:879646591678:web:63fc3d0c4dd3daf0c9acef',
  measurementId:     'G-LJ3MJY3100',
};

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);