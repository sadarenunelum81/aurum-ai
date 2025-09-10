
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './firebase';

const categoriesCollection = collection(db, 'categories');

export interface Category {
  id: string;
  name: string;
  parentId?: string;
}

export async function addCategory(data: { name: string; parentId?: string }): Promise<string> {
  const docRef = await addDoc(categoriesCollection, data);
  return docRef.id;
}

export async function getAllCategories(): Promise<Category[]> {
  const q = query(categoriesCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function deleteCategory(id: string): Promise<void> {
  const categoryRef = doc(db, 'categories', id);
  // Note: This doesn't handle orphaned sub-categories. 
  // For a production app, you might want to either delete them or re-parent them.
  await deleteDoc(categoryRef);
}
