import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { GalleryHeader } from "@/components/gallery/gallery-header";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { PhotoViewerModal } from "@/components/gallery/photo-viewer-modal";
import type { Photo } from "@/contexts/gallery-context";
import { ArrowRight } from "lucide-react";

export function FavoritesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
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
        <div className="flex-shrink-0 mb-8">
          <h1 className="text-3xl font-medium mb-2">Family Favorites</h1>
          <p className="text-gray-300 max-w-xl">
            Photos you've marked as favorites.
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PhotoGrid
            onPhotoClick={setSelectedPhoto}
            filterFavorites
            emptyAction={{
              label: "Explore Gallery",
              onClick: () => navigate("/gallery"),
              icon: <ArrowRight className="mr-2 h-4 w-4" />,
            }}
          />
        </div>
      </main>

      <PhotoViewerModal
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      />
    </div>
  );
}
