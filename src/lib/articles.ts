
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
  deleteDoc,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import type { Article } from '@/types';

const db = getFirestore(firebaseApp);
const articlesCollection = collection(db, 'articles');

const toISOStringSafe = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  return new Date().toISOString();
};


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
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          createdAt: toISOStringSafe(data.createdAt),
          updatedAt: toISOStringSafe(data.updatedAt),
      } as Article;
  });
}

export async function getAllArticles(): Promise<Article[]> {
  const q = query(articlesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          createdAt: toISOStringSafe(data.createdAt),
          updatedAt: toISOStringSafe(data.updatedAt),
      } as Article;
  });
}

export async function updateArticleStatus(articleId: string, status: 'draft' | 'published'): Promise<void> {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
        status,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteArticle(articleId: string): Promise<void> {
    const articleRef = doc(db, 'articles', articleId);
    await deleteDoc(articleRef);
}
