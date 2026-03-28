import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp, getDocFromServer, increment, collection, query, where, getDocs, deleteDoc, addDoc, orderBy, onSnapshot, limit, arrayUnion } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. The client is offline.");
    }
  }
}
testConnection();

export { signInWithPopup, firebaseSignOut, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, serverTimestamp, increment, collection, query, where, getDocs, deleteDoc, addDoc, orderBy, onSnapshot, limit, arrayUnion };
export type { User } from 'firebase/auth';
