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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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
        <div className="mb-8 flex flex-col items-center rounded-3xl border border-[color:var(--panel-border)] bg-[color:var(--panel)]/90 px-8 py-10 text-center shadow-[0_28px_60px_-32px_var(--shadow-glow)] backdrop-blur-lg">
          <Avatar className="mb-4 h-28 w-28 border-4 border-white/70 shadow-[0_18px_40px_-26px_var(--shadow-glow)]">
            <AvatarImage src={user.photoURL || undefined} />
            <AvatarFallback className="bg-[linear-gradient(135deg,var(--primary),#ff9f68)] text-2xl font-semibold uppercase text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-semibold tracking-tight">
            {userData?.displayName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
          {userData?.relation && (
            <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-[color:var(--panel-border)] bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <span className="size-2 rounded-full bg-primary" />
              {userData.relation}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="items-center py-6 text-center">
            <CardContent className="flex flex-col items-center py-0">
              <ImageIcon className="mb-3 h-6 w-6 text-primary" />
              {loadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <span className="text-2xl font-semibold">{photoCount}</span>
                  <span className="text-xs text-muted-foreground">
                    Photos shared
                  </span>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="items-center py-6 text-center">
            <CardContent className="flex flex-col items-center py-0">
              <Heart className="mb-3 h-6 w-6 text-[var(--favorite)]" />
              <span className="text-2xl font-semibold">{favorites.length}</span>
              <span className="text-xs text-muted-foreground">
                Favorites saved
              </span>
            </CardContent>
          </Card>
          <Card className="items-center py-6 text-center">
            <CardContent className="flex flex-col items-center py-0">
              <CalendarDays className="mb-3 h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">{joinedDate}</span>
              <span className="text-xs text-muted-foreground">Joined</span>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile */}
        <Card className="border border-[color:var(--panel-border)] bg-[color:var(--panel)]/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Profile details
            </CardTitle>
            <CardDescription>
              Update how your name appears to everyone in the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ""} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label>Relation to Lewis</Label>
              <Input
                value={userData?.relation || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
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
              className="w-full"
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
