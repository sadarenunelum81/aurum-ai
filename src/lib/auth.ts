import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import type { SignupForm, LoginForm } from '@/types';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export async function signup(data: SignupForm) {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    role: 'user',
  });
  return user;
}

export async function login(data: LoginForm) {
  const { user } = await signInWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );
  return user;
}

export function logout() {
  return signOut(auth);
}

export function onAuthStateChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(userId: string) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
        return userDoc.data();
    }
    return null;
}

export async function getAllUsers() {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return userList;
}