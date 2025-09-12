
import {
  collection,
  doc,
  getDoc,
  setDoc,
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
