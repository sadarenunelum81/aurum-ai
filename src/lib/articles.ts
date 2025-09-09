
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import type { Article } from '@/types';

const db = getFirestore(firebaseApp);
const articlesCollection = collection(db, 'articles');

export async function saveArticle(article: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(articlesCollection, {
    ...article,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateArticle(articleId: string, article: Partial<Omit<Article, 'id' | 'authorId'>>): Promise<void> {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
        ...article,
        updatedAt: serverTimestamp(),
    });
}


export async function getArticleCounts(): Promise<{ drafts: number; published: number }> {
  const draftQuery = query(articlesCollection, where('status', '==', 'draft'));
  const publishedQuery = query(articlesCollection, where('status', '==', 'published'));

  const draftSnapshot = await getDocs(draftQuery);
  const publishedSnapshot = await getDocs(publishedQuery);

  return {
    drafts: draftSnapshot.size,
    published: publishedSnapshot.size,
  };
}

export async function getArticlesByStatus(status: 'draft' | 'published'): Promise<Article[]> {
  const q = query(articlesCollection, where('status', '==', status));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
}
