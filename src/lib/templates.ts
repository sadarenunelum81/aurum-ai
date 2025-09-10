

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { TemplateConfig } from '@/types';

const templatesCollection = collection(db, 'templates');

// Get a specific template's configuration by its ID
export async function getTemplateConfig(templateId: string): Promise<TemplateConfig | null> {
  const docRef = doc(db, 'templates', templateId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as TemplateConfig;
  }
  return null;
}

// Get the currently active template for the main page
export async function getActiveTemplate(): Promise<TemplateConfig | null> {
  const q = query(templatesCollection, where('isActive', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null; // No active template found
  }
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as TemplateConfig;
}

// Get a template by its custom path (light or dark)
export async function getTemplateByPath(path: string): Promise<{ config: TemplateConfig; theme: 'light' | 'dark' } | null> {
    const lightPathQuery = query(templatesCollection, where('customPathLight', '==', path));
    const lightSnapshot = await getDocs(lightPathQuery);

    if (!lightSnapshot.empty) {
        const doc = lightSnapshot.docs[0];
        return {
            config: { id: doc.id, ...doc.data() } as TemplateConfig,
            theme: 'light'
        };
    }

    const darkPathQuery = query(templatesCollection, where('customPathDark', '==', path));
    const darkSnapshot = await getDocs(darkPathQuery);

    if (!darkSnapshot.empty) {
        const doc = darkSnapshot.docs[0];
        return {
            config: { id: doc.id, ...doc.data() } as TemplateConfig,
            theme: 'dark'
        };
    }

    return null;
}


// Save a template's configuration
export async function saveTemplateConfig(templateId: string, config: Partial<TemplateConfig>): Promise<void> {
  const docRef = doc(db, 'templates', templateId);
  await setDoc(docRef, config, { merge: true });
}

// Set a template as active, and all others as inactive
export async function setActiveTemplate(templateId: string): Promise<void> {
    const batch = writeBatch(db);

    // First, find all currently active templates and set them to inactive
    const q = query(templatesCollection, where('isActive', '==', true));
    const activeDocs = await getDocs(q);
    activeDocs.forEach(document => {
        batch.update(document.ref, { isActive: false });
    });

    // Then, set the new template to active
    const newActiveRef = doc(db, 'templates', templateId);
    batch.update(newActiveRef, { isActive: true });
    
    // Ensure the document exists if it doesn't already
    batch.set(newActiveRef, { id: templateId, isActive: true }, { merge: true });


    await batch.commit();
}
