"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "./auth-context"
import localforage from "localforage"

interface FavoritesContextType {
  favorites: string[]
  loading: boolean
  isFavorite: (photoId: string) => boolean
  toggleFavorite: (photoId: string) => Promise<void>
  loadFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const FAVORITES_CACHE_KEY = "familyhub_favorites"

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([])
      return
    }

    setLoading(true)
    try {
      // Try cache first
      const cached = await localforage.getItem<string[]>(`${FAVORITES_CACHE_KEY}_${user.uid}`)
      if (cached) {
        setFavorites(cached)
        setLoading(false)
        return
      }

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userFavorites = userDoc.data().favorites || []
        setFavorites(userFavorites)
        await localforage.setItem(`${FAVORITES_CACHE_KEY}_${user.uid}`, userFavorites)
      }
    } catch (error) {
      console.error("Error loading favorites:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const isFavorite = useCallback((photoId: string) => favorites.includes(photoId), [favorites])

  const toggleFavorite = useCallback(
    async (photoId: string) => {
      if (!user) return

      setFavorites((currentFavorites) => {
        const isCurrentlyFavorite = currentFavorites.includes(photoId)
        const newFavorites = isCurrentlyFavorite
          ? currentFavorites.filter((id) => id !== photoId)
          : [...currentFavorites, photoId]

      // Optimistic update
        localforage.setItem(`${FAVORITES_CACHE_KEY}_${user.uid}`, newFavorites)

        // Update Firestore
        const userRef = doc(db, "users", user.uid)
        updateDoc(userRef, {
          favorites: isCurrentlyFavorite ? arrayRemove(photoId) : arrayUnion(photoId),
        }).catch((error) => {
        // Revert on error
          setFavorites(currentFavorites)
          localforage.setItem(`${FAVORITES_CACHE_KEY}_${user.uid}`, currentFavorites)
        console.error("Error toggling favorite:", error)
        })

        return newFavorites
      })
    },
    [user],
  )

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        loading,
        isFavorite,
        toggleFavorite,
        loadFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
