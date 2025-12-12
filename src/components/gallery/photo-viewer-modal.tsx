"use client";

import { useState, useEffect, useCallback } from "react";
import { useFavorites } from "@/contexts/favorites-context";
import { useGallery, type Photo } from "@/contexts/gallery-context";
import { useAuth } from "@/contexts/auth-context";
import { useAlbums } from "@/contexts/albums-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Heart,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  MessageCircle,
  Loader2,
  FolderPlus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentsSection } from "./comments-section";
import { AddToAlbumModal } from "@/components/albums/add-to-album-modal";
import { getStorage, ref, getBlob, deleteObject } from "firebase/storage";
import {
  deleteDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PhotoViewerModalProps {
  photo: Photo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PhotoViewerModal({
  photo,
  open,
  onOpenChange,
}: PhotoViewerModalProps) {
  const { photos, refreshPhotos, removePhoto } = useGallery();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { removePhotoFromAlbum } = useAlbums();
  const [showComments, setShowComments] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(photo);

  useEffect(() => {
    setCurrentPhoto(photo);
    setImageLoading(true);
    setShowComments(false);
  }, [photo]);

  const currentIndex = currentPhoto
    ? photos.findIndex((p) => p.id === currentPhoto.id)
    : -1;

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentPhoto(photos[currentIndex - 1]);
      setImageLoading(true);
    }
  }, [currentIndex, photos]);

  const goToNext = useCallback(() => {
    if (currentIndex < photos.length - 1) {
      setCurrentPhoto(photos[currentIndex + 1]);
      setImageLoading(true);
    }
  }, [currentIndex, photos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === "Escape") onOpenChange(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, goToPrevious, goToNext, onOpenChange]);

  const handleDownload = async () => {
    if (!currentPhoto) return;

    try {
      // Extract storage path and download as blob
      const url = new URL(currentPhoto.fullUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+)/);
      if (!pathMatch) {
        throw new Error("Invalid storage URL format");
      }

      const storagePath = decodeURIComponent(pathMatch[1]);
      const storage = getStorage();
      const storageRef = ref(storage, storagePath);

      // Download the file as a blob
      const blob = await getBlob(storageRef);

      // Create a blob URL for download
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = currentPhoto.title
        ? `${currentPhoto.title}.jpg`
        : `familyhub-${currentPhoto.id}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);

      // Fallback: try to open in new tab
      try {
        const a = document.createElement("a");
        a.href = currentPhoto.fullUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    }
  };

  const handleDelete = async () => {
    if (!currentPhoto || !user) return;

    setIsDeleting(true);
    const photoId = currentPhoto.id;

    try {
      // Check if photo document exists in Firestore
      const photoDocRef = doc(db, "photos", photoId);
      const photoDoc = await getDoc(photoDocRef);
      const photoExists = photoDoc.exists();

      if (photoExists) {
        // First, delete all comments for this photo
        try {
          const commentsRef = collection(db, "photos", photoId, "comments");
          const commentsSnapshot = await getDocs(commentsRef);
          const deleteCommentPromises = commentsSnapshot.docs.map(
            (commentDoc) =>
              deleteDoc(doc(db, "photos", photoId, "comments", commentDoc.id))
          );
          await Promise.all(deleteCommentPromises);
        } catch (error) {
          console.warn(
            "Failed to delete comments (may already be deleted):",
            error
          );
        }

        // Remove photo from all albums
        if (currentPhoto.albumIds && currentPhoto.albumIds.length > 0) {
          const albumRemovalPromises = currentPhoto.albumIds.map((albumId) =>
            removePhotoFromAlbum(photoId, albumId).catch((error) => {
              console.warn(
                `Failed to remove photo from album ${albumId}:`,
                error
              );
            })
          );
          await Promise.all(albumRemovalPromises);
        }

        // Delete from Firestore
        try {
          await deleteDoc(photoDocRef);
        } catch (error) {
          // If delete fails due to permissions, photo might already be deleted
          console.warn(
            "Failed to delete photo document (may already be deleted):",
            error
          );
        }

        // Remove this photo from all users' favorites
        try {
          const usersRef = collection(db, "users");
          const q = query(
            usersRef,
            where("favorites", "array-contains", photoId)
          );
          const usersSnapshot = await getDocs(q);

          const updatePromises = usersSnapshot.docs.map((userDoc) =>
            updateDoc(doc(db, "users", userDoc.id), {
              favorites: arrayRemove(photoId),
            }).catch((error) => {
              console.warn(
                `Failed to remove from user ${userDoc.id} favorites:`,
                error
              );
            })
          );

          await Promise.all(updatePromises);
        } catch (error) {
          console.warn("Failed to remove from favorites:", error);
        }

        // Extract storage paths and delete files
        if (currentPhoto.fullUrl) {
          try {
            const url = new URL(currentPhoto.fullUrl);
            const pathMatch = url.pathname.match(/\/o\/(.+)/);
            if (pathMatch) {
              const storagePath = decodeURIComponent(pathMatch[1]);
              const storage = getStorage();

              // Delete both original and thumbnail
              const originalPath = storagePath.replace("/thumb/", "/original/");
              const thumbPath = storagePath.replace("/original/", "/thumb/");

              try {
                await deleteObject(ref(storage, originalPath));
              } catch (error) {
                console.warn("Failed to delete original image:", error);
              }

              try {
                await deleteObject(ref(storage, thumbPath));
              } catch (error) {
                console.warn("Failed to delete thumbnail:", error);
              }
            }
          } catch (error) {
            console.warn("Failed to delete storage files:", error);
          }
        }
      } else {
        // Photo doesn't exist in Firestore, just clean up local state
        console.log(
          "Photo document doesn't exist, cleaning up local state only"
        );
      }

      // Remove from local state and cache immediately (regardless of Firestore state)
      removePhoto(photoId);

      // Refresh the gallery to ensure consistency
      await refreshPhotos();

      // Close the modal
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete photo:", error);
      // Even if there's an error, try to remove from local state
      removePhoto(photoId);
      // Still close the modal and refresh
      onOpenChange(false);
      await refreshPhotos();
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!currentPhoto) return null;

  const favorite = isFavorite(currentPhoto.id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[95vh] max-w-[95vw] gap-0 overflow-hidden bg-black p-0 sm:max-w-5xl rounded-2xl">
          <DialogTitle className="sr-only">
            Photo by {currentPhoto.ownerName} -{" "}
            {currentPhoto.createdAt.toLocaleDateString()}
          </DialogTitle>
          {/* Header */}
          <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-black/80 p-4">
            <div className="flex flex-col gap-1">
              {currentPhoto.title && (
                <h2 className="text-sm font-medium text-white">
                  {currentPhoto.title}
                </h2>
              )}
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-300">
                  {currentPhoto.ownerName}
                </p>
                <span className="text-gray-500">·</span>
                <p className="text-xs text-gray-400">
                  {currentPhoto.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Image Container */}
          <div className="relative flex h-[70vh] items-center justify-center bg-black">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            <img
              src={currentPhoto.fullUrl || "/placeholder.svg"}
              alt=""
              className={cn(
                "max-h-full max-w-full object-contain transition-opacity",
                imageLoading ? "opacity-0" : "opacity-100"
              )}
              onLoad={() => setImageLoading(false)}
            />

            {/* Navigation Arrows */}
            {currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}
            {currentIndex < photos.length - 1 && (
              <button
                onClick={goToNext}
                className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between bg-black px-4 py-3">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(currentPhoto.id)}
                className={cn(
                  "gap-1",
                  favorite ? "text-red-500" : "text-white hover:text-gray-300"
                )}
              >
                <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAlbumModal(true)}
                className="gap-1 text-white hover:text-gray-300"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="gap-1 text-white hover:text-gray-300"
              >
                <MessageCircle className="h-4 w-4" />
                {currentPhoto.commentCount > 0 && (
                  <span className="text-xs">{currentPhoto.commentCount}</span>
                )}
              </Button>
            </div>
            <div className="flex items-center gap-1">
              {user && currentPhoto.ownerId === user.uid && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                  className="gap-1 text-red-500 hover:text-red-400 hover:bg-red-500/70/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="gap-1 text-white hover:text-gray-300"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Comments Panel */}
          {showComments && (
            <div className="max-h-[200px] overflow-y-auto border-t border-white/10 bg-black/80 p-4">
              <CommentsSection photoId={currentPhoto.id} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add to Album Modal */}
      {currentPhoto && (
        <AddToAlbumModal
          open={showAlbumModal}
          onOpenChange={setShowAlbumModal}
          photoId={currentPhoto.id}
          photoThumbUrl={currentPhoto.thumbUrl}
          currentAlbumIds={currentPhoto.albumIds}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be
              undone and will permanently remove the photo from your gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
