import type { ReactNode } from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { GalleryProvider } from "@/contexts/gallery-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { AlbumsProvider } from "@/contexts/albums-context"
import { ThemeProvider } from "@/components/theme-provider"

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="familyhub-theme">
        <AuthProvider>
          <GalleryProvider>
            <FavoritesProvider>
              <AlbumsProvider>{children}</AlbumsProvider>
            </FavoritesProvider>
          </GalleryProvider>
        </AuthProvider>
    </ThemeProvider>
  )
}
