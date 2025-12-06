"use client";

import { useEffect, useState } from "react";
import { useAlbums } from "@/contexts/albums-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FolderOpen, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateAlbumModal } from "./create-album-modal";

interface AddToAlbumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  photoId: string;
  photoThumbUrl: string;
  currentAlbumIds: string[];
}

export function AddToAlbumModal({
  open,
  onOpenChange,
  photoId,
  photoThumbUrl,
  currentAlbumIds,
}: AddToAlbumModalProps) {
  const { albums, loading, loadAlbums, addPhotoToAlbum, removePhotoFromAlbum } =
    useAlbums();
  const [updating, setUpdating] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadAlbums();
    }
  }, [open, loadAlbums]);

  const toggleAlbum = async (albumId: string) => {
    setUpdating(albumId);
    try {
      if (currentAlbumIds.includes(albumId)) {
        await removePhotoFromAlbum(photoId, albumId);
      } else {
        await addPhotoToAlbum(photoId, albumId, photoThumbUrl);
      }
    } catch (error) {
      console.error("Error toggling album:", error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Add to Album</DialogTitle>
            <DialogDescription>
              Select albums to add this photo to, or create a new album
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : albums.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FolderOpen className="mb-3 h-12 w-12 text-gray-400" />
                <p className="text-sm text-muted-foreground">No albums yet</p>
                <Button
                  variant="link"
                  className="mt-2 text-red-500 hover:text-red-600"
                  onClick={() => setCreateOpen(true)}
                >
                  Create your first album
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {albums.map((album) => {
                  const isInAlbum = currentAlbumIds.includes(album.id);
                  const isUpdating = updating === album.id;

                  return (
                    <button
                      key={album.id}
                      onClick={() => toggleAlbum(album.id)}
                      disabled={isUpdating}
                      className={cn(
                        "flex w-full items-center gap-3 rounded border p-3 text-left transition-colors",
                        isInAlbum
                          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      {/* Album Cover */}
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-gray-100">
                        {album.coverPhotoUrl ? (
                          <img
                            src={album.coverPhotoUrl || "/placeholder.svg"}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <FolderOpen className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Album Info */}
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium text-foreground">
                          {album.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {album.photoCount} photo
                          {album.photoCount !== 1 ? "s" : ""}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        {isUpdating ? (
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        ) : isInAlbum ? (
                          <Check className="h-5 w-5 text-red-500" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Album
            </Button>
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateAlbumModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
