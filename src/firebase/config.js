import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDu5-1Ka72C5CAwIVVT924uhrjJ20u0xeo",
  authDomain: "health-camptest.firebaseapp.com",
  databaseURL: "https://health-camptest-default-rtdb.firebaseio.com",
  projectId: "health-camptest",
  storageBucket: "health-camptest.firebasestorage.app",
  messagingSenderId: "30303192449",
  appId: "1:30303192449:web:61135972378bd7e5491480"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);