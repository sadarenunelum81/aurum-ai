

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
  getCountFromServer,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Comment } from '@/types';
import { getUserProfile } from './auth';


const commentsCollection = collection(db, 'comments');

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
  console.warn('Unknown date format for comment, using current time:', timestamp);
  return new Date().toISOString();
};

export async function addComment(comment: { articleId: string; articleTitle: string; authorId: string; content: string }): Promise<string> {
    const userProfile = await getUserProfile(comment.authorId);
    const authorName = (userProfile?.firstName && userProfile?.lastName)
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile?.email || 'Anonymous';

    const docRef = await addDoc(commentsCollection, {
        ...comment,
        authorName,
        createdAt: serverTimestamp(),
        status: 'visible',
    });
    return docRef.id;
}

export async function getCommentsForArticle(articleId: string): Promise<Comment[]> {
  const q = query(
    commentsCollection, 
    where('articleId', '==', articleId), 
    where('status', '==', 'visible'),
    orderBy('createdAt', 'asc')
  );
  try {
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
              id: doc.id,
              ...data,
              createdAt: toISOStringSafe(data.createdAt),
          } as Comment;
      });
    return comments;
  } catch (error: any) {
     if (error.code === 'failed-precondition') {
      console.warn("The composite index for comments is missing. Sorting will be done on the client. Please create the index in your Firebase console.");
      const fallbackQuery = query(
          commentsCollection, 
          where('articleId', '==', articleId), 
          where('status', '==', 'visible')
      );
      const snapshot = await getDocs(fallbackQuery);
      const comments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: toISOStringSafe(doc.data().createdAt) } as Comment));
      return comments.sort((a, b) => new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime());
    }
    throw error;
  }
}

export async function getAllComments(): Promise<Comment[]> {
    const q = query(commentsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const comments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: toISOStringSafe(data.createdAt),
        } as Comment;
    });
    return comments;
}

export async function updateCommentStatus(commentId: string, status: 'visible' | 'hidden'): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, { status });
}

export async function deleteComment(commentId: string): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);
}
