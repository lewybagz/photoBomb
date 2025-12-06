import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useAlbums } from "@/contexts/albums-context";
import { GalleryHeader } from "@/components/gallery/gallery-header";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { PhotoViewerModal } from "@/components/gallery/photo-viewer-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Photo } from "@/contexts/gallery-context";

export function AlbumDetailPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { albums, loadAlbums, getAlbumPhotos } = useAlbums();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const album = useMemo(
    () => albums.find((item) => item.id === id),
    [albums, id]
  );

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

  useEffect(() => {
    const loadPhotos = async () => {
      if (!id) return;
      setLoadingPhotos(true);
      try {
        const albumPhotos = await getAlbumPhotos(id);
        setPhotos(albumPhotos);
      } catch (error) {
        console.error("Error loading album photos:", error);
      } finally {
        setLoadingPhotos(false);
      }
    };

    void loadPhotos();
  }, [id, getAlbumPhotos]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <GalleryHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-[color:var(--panel-border)] bg-[color:var(--panel)]/90 px-6 py-8 shadow-[0_28px_60px_-32px_var(--shadow-glow)] backdrop-blur-lg sm:px-10">
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 inline-flex gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground hover:bg-primary-soft hover:text-foreground"
            asChild
          >
            <Link to="/albums">
              <ArrowLeft className="h-4 w-4" />
              Back to family albums
            </Link>
          </Button>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {album?.name ?? "Album"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {photos.length} memory{photos.length !== 1 ? "s" : ""} carefully tucked into this album.
          </p>
        </div>

        {loadingPhotos ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <PhotoGrid photos={photos} onPhotoClick={setSelectedPhoto} />
        )}
      </main>

      <PhotoViewerModal
        photo={selectedPhoto}
        open={Boolean(selectedPhoto)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPhoto(null);
          }
        }}
      />
    </div>
  );
}
