import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useAlbums, type Album } from "@/contexts/albums-context";
import { GalleryHeader } from "@/components/gallery/gallery-header";
import { CreateAlbumModal } from "@/components/albums/create-album-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Plus,
  FolderOpen,
  MoreHorizontal,
  Trash2,
  Loader2,
} from "lucide-react";
import logoImage from "@/assets/images/familygallerylogonowords.png";

export function AlbumsPage() {
  const { user, loading: authLoading } = useAuth();
  const { albums, loading, loadAlbums, deleteAlbum } = useAlbums();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadAlbums();
    }
  }, [user, loadAlbums]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteAlbum(deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting album:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <GalleryHeader />
      <main className="flex-1 flex flex-col mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
        <div className="flex-shrink-0 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-medium mb-2">Family Albums</h1>
            <p className="text-gray-300 max-w-xl">
              Organize your photos into themed collections.
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-red-500/70 hover:bg-red-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Album
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto scrollbar-hide">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : albums.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center rounded">
                  <img
                    src={logoImage}
                    alt="Photo Bomb"
                    className="h-full w-full"
                  />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No albums yet
                </h2>
                <p className="mb-4 text-sm text-gray-300 max-w-sm">
                  Create your first album to organize your photos.
                </p>
                <Button
                  onClick={() => setCreateOpen(true)}
                  className="bg-red-500/70 hover:bg-red-600"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Album
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {albums.map((album) => (
                  <div key={album.id} className="group relative">
                    <Link
                      to={`/albums/${album.id}`}
                      className="block overflow-hidden rounded border border-border bg-card transition-colors duration-200 hover:border-border rounded-xl"
                    >
                      {/* Cover Image */}
                      <div className="aspect-square bg-gray-100 ">
                        {album.coverPhotoUrl ? (
                          <img
                            src={album.coverPhotoUrl || "/placeholder.svg"}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-50 text-gray-400">
                            <FolderOpen className="h-10 w-10" />
                            <span className="text-xs font-medium">
                              No cover yet
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Album Info */}
                      <div className="p-4">
                        <p className="truncate text-base font-medium text-foreground">
                          {album.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {album.photoCount} photo
                          {album.photoCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </Link>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-3 top-3 h-8 w-8 rounded-full border border-border bg-background/80 opacity-0 shadow-[0_14px_24px_-20px_var(--shadow-glow)] backdrop-blur transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.preventDefault();
                            setDeleteTarget(album);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Album
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <CreateAlbumModal open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Album</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? The photos
              will remain in your gallery but will be removed from this album.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
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
    </div>
  );
}
