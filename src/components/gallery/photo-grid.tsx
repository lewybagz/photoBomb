"use client";

import { useEffect, useCallback, useRef, useMemo } from "react";
import { useGallery, type Photo } from "@/contexts/gallery-context";
import { useFavorites } from "@/contexts/favorites-context";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "@/assets/images/familygallerylogonowords.png";

interface PhotoGridProps {
  photos?: Photo[];
  onPhotoClick: (photo: Photo) => void;
  filterFavorites?: boolean;
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function PhotoGrid({
  photos: propPhotos,
  onPhotoClick,
  filterFavorites,
  emptyAction,
}: PhotoGridProps) {
  const {
    photos: contextPhotos,
    loading,
    hasMore,
    loadPhotos,
    loadMorePhotos,
  } = useGallery();
  const { favorites, isFavorite } = useFavorites();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadMorePhotosRef = useRef(loadMorePhotos);

  // Keep ref updated with latest function
  loadMorePhotosRef.current = loadMorePhotos;

  const photos = propPhotos || contextPhotos;
  const displayPhotos = useMemo(
    () =>
      filterFavorites ? photos.filter((p) => favorites.includes(p.id)) : photos,
    [photos, favorites, filterFavorites]
  );

  useEffect(() => {
    if (!propPhotos) {
      loadPhotos();
    }
  }, [loadPhotos, propPhotos]);

  // Infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && !propPhotos) {
        loadMorePhotosRef.current();
      }
    },
    [hasMore, loading, propPhotos]
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      rootMargin: "100px",
    });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  if (loading && displayPhotos.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (displayPhotos.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-24 w-24 items-center justify-center rounded">
          <img src={logoImage} alt="Photo Bomb" className="h-full w-full" />
        </div>
        <p className="text-lg font-medium text-gray-900">
          {filterFavorites ? "No favorites yet" : "No photos yet"}
        </p>
        <p className="mb-4 text-sm text-gray-300 max-w-sm">
          {filterFavorites
            ? "Photos you favorite will appear here. Start exploring your gallery to find photos you love!"
            : "Upload some family memories to get started. Share your special moments with loved ones."}
        </p>
        {emptyAction && (
          <Button
            onClick={emptyAction.onClick}
            className="bg-red-500/70 hover:bg-red-600"
          >
            {emptyAction.icon}
            {emptyAction.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayPhotos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            isFavorite={isFavorite(photo.id)}
            onClick={() => onPhotoClick(photo)}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {!propPhotos && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
        </div>
      )}
    </>
  );
}

interface PhotoCardProps {
  photo: Photo;
  isFavorite: boolean;
  onClick: () => void;
}

function PhotoCard({ photo, isFavorite, onClick }: PhotoCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative aspect-square overflow-hidden bg-gray-100 focus:outline-none focus:ring-1 focus:ring-red-500 hover:bg-gray-200 transition-colors duration-200 rounded-xl"
    >
      <img
        src={photo.thumbUrl || "/placeholder.svg"}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
      />

      {/* Favorite Icon */}
      {isFavorite && (
        <div className="absolute top-2 right-2">
          <Heart className="h-4 w-4 text-red-500" />
        </div>
      )}

      {/* Photo Info - Always visible on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {photo.title ? (
          <div className="text-white">
            <p className="truncate text-xs font-medium">{photo.title}</p>
            <p className="truncate text-xs text-gray-300">{photo.ownerName}</p>
          </div>
        ) : (
          <p className="truncate text-xs text-white">{photo.ownerName}</p>
        )}
      </div>
    </button>
  );
}
