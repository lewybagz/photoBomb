import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { GalleryHeader } from "@/components/gallery/gallery-header";
import { PhotoGrid } from "@/components/gallery/photo-grid";
import { PhotoViewerModal } from "@/components/gallery/photo-viewer-modal";
import { UploadModal } from "@/components/gallery/upload-modal";
import type { Photo } from "@/contexts/gallery-context";
import { Upload } from "lucide-react";

export function GalleryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

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
          <h1 className="text-3xl font-medium mb-2">Photo Bomb</h1>
          <p className="text-gray-300 max-w-xl">
            Share and enjoy your family memories together.
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <PhotoGrid
            onPhotoClick={setSelectedPhoto}
            emptyAction={{
              label: "Upload Photos",
              onClick: () => setUploadOpen(true),
              icon: <Upload className="mr-2 h-4 w-4" />,
            }}
          />
        </div>
      </main>

      <PhotoViewerModal
        photo={selectedPhoto}
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && setSelectedPhoto(null)}
      />

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
