import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { SignupForm, LoginForm } from '@/types';


// Function to check if there are any existing admin users
async function hasAdminUser(): Promise<boolean> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'admin'));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

export async function signup(data: SignupForm) {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );

  const isAdminPresent = await hasAdminUser();
  const userRole = isAdminPresent ? 'user' : 'admin';

  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    firstName: data.firstName,
    lastName: data.lastName,
    role: userRole,
  });

  if (userRole === 'admin') {
      console.log(`First user signed up. Assigned role: ${userRole}`);
  }

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
