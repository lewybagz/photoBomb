import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getCountFromServer,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useFavorites } from "@/contexts/favorites-context";
import { GalleryHeader } from "@/components/gallery/gallery-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Camera,
  Heart,
  ImageIcon,
  CalendarDays,
  Save,
  CheckCircle,
} from "lucide-react";

export function ProfilePage() {
  const { user, userData, loading: authLoading } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (userData) {
      setDisplayName(userData.displayName);
    }
  }, [userData]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      setLoadingStats(true);
      try {
        const photosRef = collection(db, "photos");
        const q = query(photosRef, where("ownerId", "==", user.uid));
        const snapshot = await getCountFromServer(q);
        setPhotoCount(snapshot.data().count);
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [user]);

  const handleSave = async () => {
    if (!user || !displayName.trim()) return;

    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(auth.currentUser!, {
        displayName: displayName.trim(),
      });
      await updateDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
      </div>
    );
  }

  const initials = userData?.displayName
    ? userData.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FM";

  const joinedDate = userData?.joinedAt
    ? new Date(userData.joinedAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="min-h-screen">
      <GalleryHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-center rounded-lg border border-gray-800 bg-gray-900 px-8 py-10 text-center">
          <Avatar className="mb-4 h-28 w-28 border-4 border-gray-700">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="bg-red-500 text-2xl font-semibold uppercase text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-medium text-white">
            {userData?.displayName}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{user.email}</p>
          {userData?.relation && (
            <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 px-4 py-1 text-xs font-medium uppercase tracking-wider text-red-400">
              <span className="size-2 rounded-full bg-red-400" />
              {userData.relation}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-gray-800 bg-gray-900 items-center py-6 text-center">
            <CardContent className="flex flex-col items-center py-0">
              <ImageIcon className="mb-3 h-6 w-6 text-red-400" />
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              ) : (
                <>
                  <span className="text-2xl font-semibold text-white">{photoCount}</span>
                  <span className="text-xs text-gray-400">
                    Photos shared
                  </span>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900 items-center py-6 text-center">
            <CardContent className="flex flex-col items-center py-0">
              <Heart className="mb-3 h-6 w-6 text-red-400" />
              <span className="text-2xl font-semibold text-white">{favorites.length}</span>
              <span className="text-xs text-gray-400">
                Favorites saved
              </span>
            </CardContent>
          </Card>
          <Card className="border-gray-800 bg-gray-900 items-center py-6 text-center">
            <CardContent className="flex flex-col items-center py-0">
              <CalendarDays className="mb-3 h-6 w-6 text-red-400" />
              <span className="text-sm font-semibold text-white">{joinedDate}</span>
              <span className="text-xs text-gray-400">Joined</span>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card className="border-gray-800 bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Camera className="h-5 w-5 text-red-400" />
              Profile details
            </CardTitle>
            <CardDescription className="text-gray-400">
              Update how your name appears to everyone in the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email</Label>
              <Input value={user.email || ""} disabled className="border-gray-700 bg-gray-800 text-gray-500" />
              <p className="text-xs text-gray-500">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Relation to Lewis</Label>
              <Input
                value={userData?.relation || ""}
                disabled
                className="border-gray-700 bg-gray-800 text-gray-500"
              />
              <p className="text-xs text-gray-500">
                Need this adjusted? Let Lewis know.
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !displayName.trim() ||
                displayName === userData?.displayName
              }
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
