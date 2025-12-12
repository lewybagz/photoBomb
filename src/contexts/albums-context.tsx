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
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./auth-context";
import localforage from "localforage";
import type { Photo } from "./gallery-context";

export interface Album {
  id: string;
  name: string;
  coverPhotoId: string | null;
  coverPhotoUrl: string | null;
  createdAt: Date;
  photoCount: number;
  ownerId: string;
}

interface AlbumsContextType {
  albums: Album[];
  loading: boolean;
  loadAlbums: () => Promise<void>;
  createAlbum: (name: string) => Promise<string>;
  deleteAlbum: (albumId: string) => Promise<void>;
  addPhotoToAlbum: (
    photoId: string,
    albumId: string,
    thumbUrl: string
  ) => Promise<void>;
  removePhotoFromAlbum: (photoId: string, albumId: string) => Promise<void>;
  getAlbumPhotos: (albumId: string) => Promise<Photo[]>;
}

const AlbumsContext = createContext<AlbumsContextType | undefined>(undefined);

const ALBUMS_CACHE_KEY = "familyhub_albums";

export function AlbumsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAlbums = useCallback(async () => {
    if (!user) {
      setAlbums([]);
      return;
    }

    setLoading(true);
    try {
      // Try cache first
      const cached = await localforage.getItem<Album[]>(
        `${ALBUMS_CACHE_KEY}_${user.uid}`
      );
      if (cached && cached.length > 0) {
        setAlbums(cached);
        setLoading(false);
      }

      const albumsRef = collection(db, "albums");
      const q = query(albumsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const loadedAlbums: Album[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Album[];

      setAlbums(loadedAlbums);
      await localforage.setItem(
        `${ALBUMS_CACHE_KEY}_${user.uid}`,
        loadedAlbums
      );
    } catch (error) {
      console.error("Error loading albums:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createAlbum = useCallback(
    async (name: string): Promise<string> => {
      if (!user) throw new Error("Not authenticated");

      const albumData = {
        name,
        coverPhotoId: null,
        coverPhotoUrl: null,
        createdAt: serverTimestamp(),
        photoCount: 0,
        ownerId: user.uid,
      };

      const docRef = await addDoc(collection(db, "albums"), albumData);

      const newAlbum: Album = {
        id: docRef.id,
        ...albumData,
        createdAt: new Date(),
      };

      setAlbums((prev) => [newAlbum, ...prev]);
      return docRef.id;
    },
    [user]
  );

  const deleteAlbum = useCallback(async (albumId: string) => {
    await deleteDoc(doc(db, "albums", albumId));
    setAlbums((prev) => prev.filter((a) => a.id !== albumId));
  }, []);

  const addPhotoToAlbum = useCallback(
    async (photoId: string, albumId: string, thumbUrl: string) => {
      console.log(
        "addPhotoToAlbum: Adding photo",
        photoId,
        "to album",
        albumId
      );
      const albumRef = doc(db, "albums", albumId);
      const photoRef = doc(db, "photos", photoId);

      // Update photo to include album reference
      await updateDoc(photoRef, {
        albumIds: arrayUnion(albumId),
      });
      console.log("addPhotoToAlbum: Updated photo document with album ID");

      // Update album cover if it's the first photo
      const album = albums.find((a) => a.id === albumId);
      if (album && !album.coverPhotoId) {
        console.log("addPhotoToAlbum: Setting as cover photo");
        await updateDoc(albumRef, {
          coverPhotoId: photoId,
          coverPhotoUrl: thumbUrl,
          photoCount: (album.photoCount || 0) + 1,
        });
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumId
              ? {
                  ...a,
                  coverPhotoId: photoId,
                  coverPhotoUrl: thumbUrl,
                  photoCount: a.photoCount + 1,
                }
              : a
          )
        );
      } else {
        console.log("addPhotoToAlbum: Just updating photo count");
        await updateDoc(albumRef, {
          photoCount: (album?.photoCount || 0) + 1,
        });
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumId ? { ...a, photoCount: a.photoCount + 1 } : a
          )
        );
      }
      console.log("addPhotoToAlbum: Completed");
    },
    [albums]
  );

  const removePhotoFromAlbum = useCallback(
    async (photoId: string, albumId: string) => {
      const photoRef = doc(db, "photos", photoId);
      const albumRef = doc(db, "albums", albumId);

      await updateDoc(photoRef, {
        albumIds: arrayRemove(albumId),
      });

      const album = albums.find((a) => a.id === albumId);
      if (album) {
        const newCount = Math.max(0, album.photoCount - 1);
        const updates: Record<string, unknown> = { photoCount: newCount };

        // If this was the cover photo, remove it
        if (album.coverPhotoId === photoId) {
          updates.coverPhotoId = null;
          updates.coverPhotoUrl = null;
        }

        await updateDoc(albumRef, updates);
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumId
              ? {
                  ...a,
                  photoCount: newCount,
                  coverPhotoId:
                    album.coverPhotoId === photoId ? null : a.coverPhotoId,
                  coverPhotoUrl:
                    album.coverPhotoId === photoId ? null : a.coverPhotoUrl,
                }
              : a
          )
        );
      }
    },
    [albums]
  );

  const getAlbumPhotos = useCallback(
    async (albumId: string): Promise<Photo[]> => {
      console.log("getAlbumPhotos: Querying for album:", albumId);
      const photosRef = collection(db, "photos");
      const q = query(
        photosRef,
        where("albumIds", "array-contains", albumId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);

      console.log(
        "getAlbumPhotos: Query returned",
        snapshot.docs.length,
        "documents"
      );
      const photos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Photo[];

      console.log("getAlbumPhotos: Mapped photos:", photos);
      return photos;
    },
    []
  );

  return (
    <AlbumsContext.Provider
      value={{
        albums,
        loading,
        loadAlbums,
        createAlbum,
        deleteAlbum,
        addPhotoToAlbum,
        removePhotoFromAlbum,
        getAlbumPhotos,
      }}
    >
      {children}
    </AlbumsContext.Provider>
  );
}

export function useAlbums() {
  const context = useContext(AlbumsContext);
  if (context === undefined) {
    throw new Error("useAlbums must be used within an AlbumsProvider");
  }
  return context;
}
