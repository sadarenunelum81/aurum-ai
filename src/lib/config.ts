
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import type { AutoBloggerConfig } from '@/types';

const db = getFirestore(firebaseApp);
const configCollection = 'autoBloggerConfig';
const mainConfigDocId = 'main_config';

export async function saveAutoBloggerConfig(config: AutoBloggerConfig): Promise<void> {
  const configRef = doc(db, configCollection, mainConfigDocId);
  await setDoc(configRef, {
    ...config,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getAutoBloggerConfig(): Promise<AutoBloggerConfig | null> {
  const configRef = doc(db, configCollection, mainConfigDocId);
  const docSnap = await getDoc(configRef);

  if (docSnap.exists()) {
    return docSnap.data() as AutoBloggerConfig;
  } else {
    return null;
  }
}
