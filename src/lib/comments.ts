
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
} from 'firebase/firestore';
import { db } from './firebase';
import type { Comment } from '@/types';
import { getUserProfile } from './auth';


const commentsCollection = collection(db, 'comments');

// Helper to safely convert Firestore Timestamp to ISO string
const toISOStringSafe = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  // This handles the case where the data from Firestore is already `{ seconds: number, nanoseconds: number }`
  if (typeof timestamp === 'object' && timestamp !== null && typeof timestamp.seconds === 'number') {
    return new Date(timestamp.seconds * 1000).toISOString();
  }
  // This handles the case where it might already be a string.
  if (typeof timestamp === 'string') {
    const d = new Date(timestamp);
    if (!isNaN(d.getTime())) {
      return d.toISOString();
    }
  }
  // Fallback for any other unexpected format
  console.warn('Unknown date format for comment, using current time:', timestamp);
  return new Date().toISOString();
};


// Create a new comment
export async function addComment(comment: { articleId: string; articleTitle: string; authorId: string; content: string }): Promise<string> {
    const userProfile = await getUserProfile(comment.authorId);
    const authorName = (userProfile?.firstName && userProfile?.lastName)
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : userProfile?.email || 'Anonymous';

    const docRef = await addDoc(commentsCollection, {
        ...comment,
        authorName,
        createdAt: serverTimestamp(),
        status: 'visible', // Or 'pending_approval'
    });
    return docRef.id;
}

// Get all comments for a specific article
export async function getCommentsForArticle(articleId: string): Promise<Comment[]> {
  const q = query(
    commentsCollection, 
    where('articleId', '==', articleId), 
    where('status', '==', 'visible'),
    // orderBy('createdAt', 'asc') // This requires a composite index. It's safer to sort on the client.
  );
  const snapshot = await getDocs(q);
   const comments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: toISOStringSafe(data.createdAt),
        } as Comment;
    });
  
  // Sort comments by date after fetching
  return comments.sort((a, b) => new Date(a.createdAt as string).getTime() - new Date(b.createdAt as string).getTime());
}

// Get all comments for admin view
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


// Update a comment's status (e.g., hide or show)
export async function updateCommentStatus(commentId: string, status: 'visible' | 'hidden'): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await updateDoc(commentRef, { status });
}

// Delete a comment
export async function deleteComment(commentId: string): Promise<void> {
  const commentRef = doc(db, 'comments', commentId);
  await deleteDoc(commentRef);
}
