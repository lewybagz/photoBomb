"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  startAfter,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, ChevronUp } from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

interface CommentsSectionProps {
  photoId: string;
}

const COMMENTS_PER_PAGE = 10;

export function CommentsSection({ photoId }: CommentsSectionProps) {
  const { user, userData } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const commentsRef = collection(db, "photos", photoId, "comments");
      const q = query(
        commentsRef,
        orderBy("createdAt", "desc"),
        limit(COMMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const loadedComments: Comment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Comment[];

      setComments(loadedComments.reverse());
      setLastDoc(snapshot.docs[0] || null);
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }, [photoId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const loadEarlier = async () => {
    if (!lastDoc || loadingMore) return;

    setLoadingMore(true);
    try {
      const commentsRef = collection(db, "photos", photoId, "comments");
      const q = query(
        commentsRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(COMMENTS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const earlierComments: Comment[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Comment[];

      setComments((prev) => [...earlierComments.reverse(), ...prev]);
      setLastDoc(snapshot.docs[0] || null);
      setHasMore(snapshot.docs.length === COMMENTS_PER_PAGE);
    } catch (error) {
      console.error("Error loading earlier comments:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData || !newComment.trim()) return;

    setSending(true);
    try {
      const commentsRef = collection(db, "photos", photoId, "comments");
      const commentData = {
        userId: user.uid,
        userName: userData.displayName,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(commentsRef, commentData);

      // Update comment count
      await updateDoc(doc(db, "photos", photoId), {
        commentCount: increment(1),
      });

      setComments((prev) => [
        ...prev,
        {
          id: docRef.id,
          ...commentData,
          createdAt: new Date(),
        },
      ]);
      setNewComment("");
    } catch (error) {
      console.error("Error sending comment:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Load Earlier Button */}
      {hasMore && (
        <button
          onClick={loadEarlier}
          disabled={loadingMore}
          className="flex w-full items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground"
        >
          {loadingMore ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ChevronUp className="h-4 w-4" />
              Load earlier comments
            </>
          )}
        </button>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-red-500/70 text-xs text-white">
                  {comment.userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.userName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {comment.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-foreground">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-background text-foreground placeholder:text-muted-foreground"
          disabled={sending}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!newComment.trim() || sending}
          className="shrink-0 bg-red-500/70 hover:bg-red-600"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
