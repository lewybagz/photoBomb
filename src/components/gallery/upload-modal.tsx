"use client";

import type React from "react";

import { useState, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useGallery, type Photo } from "@/contexts/gallery-context";
import { compressImage, generateId } from "@/lib/image-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, ImageIcon, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
  title?: string;
}

export function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { user, userData } = useAuth();
  const { addPhoto } = useGallery();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files).filter((file) =>
          file.type.startsWith("image/")
        );
        addFiles(selectedFiles);
      }
    },
    []
  );

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => ({
      id: generateId(),
      file,
      preview: URL.createObjectURL(file),
      status: "pending",
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const updateFileTitle = (id: string, title: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, title: title || undefined } : f))
    );
  };

  const uploadFiles = async () => {
    if (!user || !userData || files.length === 0) return;

    setIsUploading(true);

    for (const uploadFile of files) {
      if (uploadFile.status !== "pending") continue;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id
            ? { ...f, status: "uploading", progress: 10 }
            : f
        )
      );

      try {
        // Compress image
        const compressed = await compressImage(uploadFile.file);

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 30 } : f))
        );

        const photoId = generateId();

        // Upload full image
        const fullRef = ref(
          storage,
          `photos/${user.uid}/original/${photoId}.jpg`
        );
        await uploadBytes(fullRef, compressed.full);
        const fullUrl = await getDownloadURL(fullRef);

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 60 } : f))
        );

        // Upload thumbnail
        const thumbRef = ref(
          storage,
          `photos/${user.uid}/thumb/${photoId}.jpg`
        );
        await uploadBytes(thumbRef, compressed.thumb);
        const thumbUrl = await getDownloadURL(thumbRef);

        setFiles((prev) =>
          prev.map((f) => (f.id === uploadFile.id ? { ...f, progress: 80 } : f))
        );

        // Create Firestore document
        const photoData = {
          ownerId: user.uid,
          ownerName: userData.displayName,
          createdAt: serverTimestamp(),
          fullUrl,
          thumbUrl,
          albumIds: [],
          commentCount: 0,
          width: compressed.width,
          height: compressed.height,
          ...(uploadFile.title && { title: uploadFile.title }),
        };

        const docRef = await addDoc(collection(db, "photos"), photoData);

        // Add to local gallery
        const photo: Photo = {
          id: docRef.id,
          ...photoData,
          createdAt: new Date(),
        };
        addPhoto(photo);

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "done", progress: 100 } : f
          )
        );
      } catch (error) {
        console.error("Upload error:", error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error", error: "Failed to upload" }
              : f
          )
        );
      }
    }

    setIsUploading(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    onOpenChange(false);
  };

  const allDone = files.length > 0 && files.every((f) => f.status === "done");
  const pendingCount = files.filter((f) => f.status === "pending").length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[90vw] max-h-[85vh] sm:max-w-2xl sm:max-h-[80vh] rounded-xl overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Upload Photos</DialogTitle>
          <DialogDescription>
            Add photos to your Photo Bomb. Images are automatically compressed.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex min-h-[200px] flex-col items-center justify-center rounded border-2 border-dashed border-muted transition-colors",
              isDragging
                ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                : "hover:border-red-400"
            )}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isUploading}
            />
            <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drag and drop photos here
            </p>
            <p className="text-xs text-muted-foreground">or click to browse</p>
          </div>

          {/* File Previews */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">
                {files.length} photo{files.length !== 1 ? "s" : ""} selected
              </p>
              <div className="grid max-h-[250px] sm:max-h-[400px] grid-cols-3 gap-4 overflow-y-auto">
                {files.map((file) => (
                  <div key={file.id} className="space-y-2">
                    <div className="group relative aspect-square overflow-hidden rounded bg-gray-100">
                      <img
                        src={file.preview || "/placeholder.svg"}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />

                      {/* Status Overlay */}
                      {file.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                          <div className="text-center">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-red-500" />
                            <span className="mt-1 block text-xs text-muted-foreground">
                              {file.progress}%
                            </span>
                          </div>
                        </div>
                      )}

                      {file.status === "done" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green-50">
                          <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                      )}

                      {file.status === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
                          <X className="h-8 w-8 text-red-500" />
                        </div>
                      )}

                      {/* Remove Button */}
                      {file.status === "pending" && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="absolute right-1 top-1 rounded bg-white/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>

                    {/* Title Input */}
                    {file.status === "pending" && (
                      <Input
                        type="text"
                        placeholder="Photo title (optional)"
                        value={file.title || ""}
                        onChange={(e) =>
                          updateFileTitle(file.id, e.target.value)
                        }
                        className="text-xs border-border bg-background text-foreground placeholder:text-muted-foreground"
                        maxLength={100}
                      />
                    )}
                    {file.status !== "pending" && file.title && (
                      <p className="text-xs text-muted-foreground truncate px-1">
                        {file.title}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex-shrink-0 mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            {allDone ? "Done" : "Cancel"}
          </Button>
          {!allDone && (
            <Button
              onClick={uploadFiles}
              disabled={pendingCount === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Upload {pendingCount > 0 ? pendingCount : ""} Photo
                  {pendingCount !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
