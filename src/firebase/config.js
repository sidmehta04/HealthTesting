import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBtWbPNRi4ia5a3pJ7aTFqqj9Z4aMN01Os",
  authDomain: "healthcamp-f0c93.firebaseapp.com",
  databaseURL: "https://healthcamp-f0c93-default-rtdb.firebaseio.com",
  projectId: "healthcamp-f0c93",
  storageBucket: "healthcamp-f0c93.firebasestorage.app",
  messagingSenderId: "210176603069",
  appId: "1:210176603069:web:ec38016d08a8051b1bd8d4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);