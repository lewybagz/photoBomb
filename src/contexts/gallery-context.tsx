"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import localforage from "localforage";

export interface Photo {
  id: string;
  ownerId: string;
  ownerName: string;
  createdAt: Date;
  fullUrl: string;
  thumbUrl: string;
  albumIds: string[];
  commentCount: number;
  width?: number;
  height?: number;
  title?: string;
}

interface GalleryContextType {
  photos: Photo[];
  loading: boolean;
  hasMore: boolean;
  loadPhotos: (refresh?: boolean) => Promise<void>;
  loadMorePhotos: () => Promise<void>;
  getPhoto: (photoId: string) => Promise<Photo | null>;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoId: string) => void;
  refreshPhotos: () => Promise<void>;
}

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

const PHOTOS_PER_PAGE = 30;
const CACHE_KEY = "familyhub_photos";

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);

  const loadPhotos = useCallback(
    async (refresh = false) => {
      if (loading) return;

      setLoading(true);
      try {
        // Try to load from cache first
        if (!refresh) {
          const cached = await localforage.getItem<Photo[]>(CACHE_KEY);
          if (cached && cached.length > 0) {
            setPhotos(cached);
            setLoading(false);
            return;
          }
        }

        const photosRef = collection(db, "photos");
        const q = query(
          photosRef,
          orderBy("createdAt", "desc"),
          limit(PHOTOS_PER_PAGE)
        );

        const snapshot = await getDocs(q);
        const loadedPhotos: Photo[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Photo[];

        setPhotos(loadedPhotos);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
        setHasMore(snapshot.docs.length === PHOTOS_PER_PAGE);

        // Cache the photos
        await localforage.setItem(CACHE_KEY, loadedPhotos);
      } catch (error) {
        console.error("Error loading photos:", error);
      } finally {
        setLoading(false);
      }
    },
    [] // Remove loading from dependencies to prevent recreation
  );

  const loadMorePhotos = useCallback(async () => {
    if (loading || !hasMore || !lastDoc) return;

    setLoading(true);
    try {
      const photosRef = collection(db, "photos");
      const q = query(
        photosRef,
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PHOTOS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const newPhotos: Photo[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Photo[];

      setPhotos((prevPhotos) => {
        const allPhotos = [...prevPhotos, ...newPhotos];
        // Update cache asynchronously
        localforage.setItem(CACHE_KEY, allPhotos);
        return allPhotos;
      });
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === PHOTOS_PER_PAGE);
    } catch (error) {
      console.error("Error loading more photos:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, lastDoc]);

  const getPhoto = useCallback(
    async (photoId: string): Promise<Photo | null> => {
      // Check local cache first
      const cached = photos.find((p) => p.id === photoId);
      if (cached) return cached;

      // Fetch from Firestore
      try {
        const photoDoc = await getDoc(doc(db, "photos", photoId));
        if (photoDoc.exists()) {
          return {
            id: photoDoc.id,
            ...photoDoc.data(),
            createdAt: photoDoc.data().createdAt?.toDate() || new Date(),
          } as Photo;
        }
      } catch (error) {
        console.error("Error fetching photo:", error);
      }
      return null;
    },
    [photos]
  );

  const addPhoto = useCallback((photo: Photo) => {
    setPhotos((prev) => [photo, ...prev]);
    localforage.getItem<Photo[]>(CACHE_KEY).then((cached) => {
      localforage.setItem(CACHE_KEY, [photo, ...(cached || [])]);
    });
  }, []);

  const removePhoto = useCallback((photoId: string) => {
    setPhotos((prev) => {
      const updated = prev.filter((p) => p.id !== photoId);
      // Update cache asynchronously
      localforage.setItem(CACHE_KEY, updated);
      return updated;
    });
  }, []);

  const refreshPhotos = useCallback(async () => {
    setLastDoc(null);
    setHasMore(true);
    await loadPhotos(true);
  }, [loadPhotos]);

  return (
    <GalleryContext.Provider
      value={{
        photos,
        loading,
        hasMore,
        loadPhotos,
        loadMorePhotos,
        getPhoto,
        addPhoto,
        removePhoto,
        refreshPhotos,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error("useGallery must be used within a GalleryProvider");
  }
  return context;
}
