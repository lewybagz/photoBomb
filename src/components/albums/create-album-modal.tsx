"use client";

import type React from "react";

import { useState } from "react";
import { useAlbums } from "@/contexts/albums-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FolderPlus } from "lucide-react";

interface CreateAlbumModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (albumId: string) => void;
}

export function CreateAlbumModal({
  open,
  onOpenChange,
  onCreated,
}: CreateAlbumModalProps) {
  const { createAlbum } = useAlbums();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter an album name");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const albumId = await createAlbum(name.trim());
      setName("");
      onOpenChange(false);
      onCreated?.(albumId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create album");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            Create New Album
          </DialogTitle>
          <DialogDescription>
            Create a new album to organize your family photos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="albumName">Album Name</Label>
              <Input
                id="albumName"
                placeholder="Summer Vacation 2024"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="bg-background text-foreground"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Album"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
