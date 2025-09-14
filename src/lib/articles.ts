

import {
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
  getDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Article } from '@/types';
import { getAutoBloggerConfig } from './config';
import { format } from 'date-fns';

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

export async function updateArticle(articleId: string, article: Partial<Omit<Article, 'id' | 'authorId' | 'createdAt'>>): Promise<void> {
    const articleRef = doc(db, 'articles', articleId);
    await updateDoc(articleRef, {
        ...article,
        updatedAt: serverTimestamp(),
    });
}

export function getDashboardData(
  callback: (data: {
    chartData: any[];
    stats24h: any;
    allTimeStats: any;
  }) => void
) {
  const articlesQuery = query(articlesCollection, orderBy('createdAt', 'desc'));

  const unsubscribe = onSnapshot(articlesQuery, (snapshot) => {
    const allArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Article));
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    
    // Time Series Data for Chart (last 15 days)
    const chartDataMap = new Map();
    for (let i = 0; i < 15; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const formattedDate = format(date, 'MMM d');
        chartDataMap.set(formattedDate, {
            date: formattedDate,
            published: 0,
            failed: 0,
            draft: 0,
            cron: 0,
            manual: 0,
        });
    }

    // Stats for last 24 hours and all time
    const stats24h = { total: 0, published: 0, failed: 0, draft: 0, manual: 0, cron: 0 };
    const allTimeStats = { total: 0, published: 0, failed: 0, draft: 0, manual: 0, cron: 0, editor: 0 };

    allArticles.forEach(article => {
        const createdAt = (article.createdAt as Timestamp)?.toDate() || new Date(article.createdAt as string);

        // Process for all-time stats
        allTimeStats.total++;
        if (article.status === 'published') allTimeStats.published++;
        if (article.status === 'draft') allTimeStats.draft++;
        if (article.generationSource === 'cron') allTimeStats.cron++;
        if (article.generationSource === 'manual') allTimeStats.manual++;
        if (article.generationSource === 'editor') allTimeStats.editor++;
        if (article.generationStatus === 'failed') allTimeStats.failed++;

        // Process for 24h stats
        if (createdAt >= twentyFourHoursAgo) {
            stats24h.total++;
            if (article.status === 'published') stats24h.published++;
            if (article.status === 'draft') stats24h.draft++;
            if (article.generationSource === 'cron') stats24h.cron++;
            if (article.generationSource === 'manual') stats24h.manual++;
            if (article.generationStatus === 'failed') stats24h.failed++;
        }

        // Process for chart data
        const formattedDate = format(createdAt, 'MMM d');
        if (chartDataMap.has(formattedDate)) {
            const dayData = chartDataMap.get(formattedDate);
            if (article.status === 'published') dayData.published++;
            if (article.status === 'draft') dayData.draft++;
            if (article.generationStatus === 'failed') dayData.failed++;
            if (article.generationSource === 'cron') dayData.cron++;
            if (article.generationSource === 'manual') dayData.manual++;
        }
    });

    const chartData = Array.from(chartDataMap.values()).reverse();

    callback({
      chartData,
      stats24h,
      allTimeStats
    });
  }, (error) => {
    console.error("Error fetching real-time dashboard data:", error);
  });

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

export async function getArticlesByStatus(status: 'draft' | 'published', limitCount?: number): Promise<Article[]> {
  const constraints = [where('status', '==', status), orderBy('updatedAt', 'desc')];
  if (limitCount) {
    constraints.push(limit(limitCount));
  }
  const q = query(articlesCollection, ...constraints);
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

export async function getArticleById(articleId: string): Promise<Article | null> {
    const articleRef = doc(db, 'articles', articleId);
    const docSnap = await getDoc(articleRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const generalConfig = await getAutoBloggerConfig();
        return {
            id: docSnap.id,
            ...data,
            postTitleColor: generalConfig?.postTitleColor,
            postContentColor: generalConfig?.postContentColor,
            createdAt: toISOStringSafe(data.createdAt),
            updatedAt: toISOStringSafe(data.updatedAt),
        } as Article;
    } else {
        return null;
    }
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
