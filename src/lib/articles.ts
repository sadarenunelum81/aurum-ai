

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

export async function getDashboardData(): Promise<{ counts: { drafts: number; published: number; total: number }, recentDrafts: Article[] }> {
    const articlesQuery = query(articlesCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(articlesQuery);

    let drafts = 0;
    let published = 0;
    const recentDrafts: Article[] = [];

    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'draft') {
            drafts++;
            if (recentDrafts.length < 5) { // Get latest 5 drafts
                 recentDrafts.push({
                    id: doc.id,
                    ...data,
                    createdAt: toISOStringSafe(data.createdAt),
                    updatedAt: toISOStringSafe(data.updatedAt),
                } as Article);
            }
        } else if (data.status === 'published') {
            published++;
        }
    });

    return {
        counts: {
            drafts,
            published,
            total: snapshot.size,
        },
        recentDrafts,
    };
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
