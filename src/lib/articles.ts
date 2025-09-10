

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
  limit,
  onSnapshot,
} from 'firebase/firestore';
import { firebaseApp } from './firebase';
import type { Article } from '@/types';
import { getAutoBloggerConfig } from './config';

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

export function getDashboardData(
  callback: (data: {
    counts: { drafts: number; published: number; total: number };
    recentDrafts: Article[];
  }) => void
) {
  const articlesQuery = query(articlesCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
    let draftsCount = 0;
    let publishedCount = 0;

    const allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));

    for (const article of allArticles) {
      if (article.status === 'draft') {
        draftsCount++;
      } else if (article.status === 'published') {
        publishedCount++;
      }
    }

    const recentDrafts = allArticles
      .filter(article => article.status === 'draft')
      .slice(0, 5)
      .map(draft => ({
        ...draft,
        createdAt: toISOStringSafe(draft.createdAt),
        updatedAt: toISOStringSafe(draft.updatedAt),
      }));

    callback({
      counts: {
        drafts: draftsCount,
        published: publishedCount,
        total: snapshot.size,
      },
      recentDrafts,
    });
  }, (error) => {
    console.error("Error fetching real-time dashboard data:", error);
    // You might want to handle errors more gracefully here
  });

  // Return the unsubscribe function so the component can clean up the listener
  return unsubscribe;
}


export async function getArticleCounts(): Promise<{ drafts: number; published: number; total: number }> {
  const allArticlesSnapshot = await getDocs(articlesCollection);
  
  let drafts = 0;
  let published = 0;

  allArticlesSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.status === 'draft') {
      drafts++;
    } else if (data.status === 'published') {
      published++;
    }
  });

  return {
    drafts,
    published,
    total: allArticlesSnapshot.size,
  };
}

export async function getArticlesByStatus(status: 'draft' | 'published'): Promise<Article[]> {
  const q = query(articlesCollection, where('status', '==', status));
  const snapshot = await getDocs(q);
  const generalConfig = await getAutoBloggerConfig();

  return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          postTitleColor: generalConfig?.postTitleColor,
          postContentColor: generalConfig?.postContentColor,
          createdAt: toISOStringSafe(data.createdAt),
          updatedAt: toISOStringSafe(data.updatedAt),
      } as Article;
  });
}

export async function getAllArticles(): Promise<Article[]> {
  const q = query(articlesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const generalConfig = await getAutoBloggerConfig();

  return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
          id: doc.id, 
          ...data,
          postTitleColor: generalConfig?.postTitleColor,
          postContentColor: generalConfig?.postContentColor,
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
