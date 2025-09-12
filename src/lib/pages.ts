
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PageConfig } from '@/types';

const pagesCollection = collection(db, 'pages');

export async function getPageConfig(pageId: string): Promise<PageConfig | null> {
  const docRef = doc(db, 'pages', pageId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PageConfig;
  }
  return null;
}

export async function savePageConfig(pageId: string, config: Partial<PageConfig>): Promise<void> {
  const docRef = doc(db, 'pages', pageId);
  await setDoc(docRef, config, { merge: true });
}

export async function getAllPagesAction(): Promise<{ success: true, data: { pages: PageConfig[] } } | { success: false, error: string }> {
    try {
        const snapshot = await getDocs(pagesCollection);
        const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PageConfig));
        return { success: true, data: { pages } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePageAction(pageId: string): Promise<{ success: true, data: {} } | { success: false, error: string }> {
    try {
        await deleteDoc(doc(db, 'pages', pageId));
        return { success: true, data: {} };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
