
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
import type { Comment } from '@/types';

const db = getFirestore(firebaseApp);
const commentsCollection = collection(db, 'comments');

// Create a new comment
export async function addComment(comment: { articleId: string, articleTitle: string, authorName: string, content: string }): Promise<string> {
  const docRef = await addDoc(commentsCollection, {
    ...comment,
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
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
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
            createdAt: (data.createdAt as Timestamp)?.toDate()?.toISOString() || new Date().toISOString(),
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
