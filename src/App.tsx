import { Navigate, Route, Routes } from "react-router-dom"
import { AlbumsPage } from "@/pages/AlbumsPage"
import { AlbumDetailPage } from "@/pages/AlbumDetailPage"
import { FavoritesPage } from "@/pages/FavoritesPage"
import { GalleryPage } from "@/pages/GalleryPage"
import { HealthPage } from "@/pages/HealthPage"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { RegisterPage } from "@/pages/RegisterPage"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/albums" element={<AlbumsPage />} />
      <Route path="/albums/:id" element={<AlbumDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


