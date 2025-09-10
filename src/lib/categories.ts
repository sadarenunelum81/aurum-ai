
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';

const db = getFirestore(firebaseApp);
const categoriesCollection = collection(db, 'categories');

export interface Category {
  id: string;
  name: string;
}

export async function addCategory(name: string): Promise<string> {
  const docRef = await addDoc(categoriesCollection, { name });
  return docRef.id;
}

export async function getAllCategories(): Promise<Category[]> {
  const q = query(categoriesCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
}

export async function deleteCategory(id: string): Promise<void> {
  const categoryRef = doc(db, 'categories', id);
  await deleteDoc(categoryRef);
}
