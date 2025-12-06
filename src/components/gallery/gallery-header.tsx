import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { useGallery } from "@/contexts/gallery-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UploadModal } from "./upload-modal";
import {
  Camera,
  Plus,
  Heart,
  FolderOpen,
  RefreshCw,
  LogOut,
  User,
} from "lucide-react";
import logoImage from "@/assets/images/familygallerylogonowords.png";

export function GalleryHeader() {
  const { user, userData, logout } = useAuth();
  const { refreshPhotos, loading } = useGallery();
  const [uploadOpen, setUploadOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const initials = userData?.displayName
    ? userData.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FM";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-transparent">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/gallery"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-full w-full items-center justify-center rounded-lg">
              <img src={logoImage} alt="Photo Bomb" className="h-10 w-10" />
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400 font-bold">
                Photo
              </span>
              <span className="text-lg font-semibold text-red-400 -mt-0.5 font-bold">
                Bomb
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            <Link to="/gallery">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 px-3 py-2 text-sm ${
                  location.pathname === "/gallery"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "text-gray-300 hover:text-gray-900"
                }`}
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Gallery</span>
              </Button>
            </Link>
            <Link to="/favorites">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 px-3 py-2 text-sm ${
                  location.pathname === "/favorites"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "text-gray-300 hover:text-gray-900"
                }`}
              >
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Favorites</span>
              </Button>
            </Link>
            <Link to="/albums">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 px-3 py-2 text-sm ${
                  location.pathname === "/albums"
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "text-gray-300 hover:text-gray-900"
                }`}
              >
                <FolderOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Albums</span>
              </Button>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refreshPhotos()}
              disabled={loading}
              className="hidden text-gray-600 hover:bg-gray-100 hover:text-gray-900 sm:flex"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>

            <Button
              size="sm"
              onClick={() => setUploadOpen(true)}
              className="gap-2 bg-red-500/70 px-4 py-2 text-white hover:bg-red-600"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg hover:bg-gray-100"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback className="bg-red-500/70 text-xs font-semibold text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2.5">
                  <p className="text-sm font-medium text-gray-900">
                    {userData?.displayName}
                  </p>
                  <p className="truncate text-xs text-gray-500 mt-0.5">
                    {user?.email}
                  </p>
                  <p className="truncate text-xs text-gray-500 mt-0.5">
                    Made With Love By Lewis
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    navigate("/profile");
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm"
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <UploadModal open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
