import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, type FamilyMember } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export function LoginForm() {
  const [familyPassword, setFamilyPassword] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(true);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const { login, fetchFamilyMembers, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setMembersError("Please choose who you are in the family.");
      return;
    }

    setIsLoading(true);
    try {
      await login(selectedMemberId, familyPassword);
      navigate("/gallery", { replace: true });
    } catch {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setMembersLoading(true);
        setMembersError(null);
        const loadedMembers = await fetchFamilyMembers();
        setMembers(loadedMembers);
        if (loadedMembers.length > 0) {
          setSelectedMemberId(loadedMembers[0].id);
        }
      } catch (err) {
        setMembersError(
          err instanceof Error
            ? err.message
            : "We couldn't load the family list. Please ask Lewis for help."
        );
      } finally {
        setMembersLoading(false);
      }
    };
    void loadMembers();
  }, [fetchFamilyMembers]);

  const selectedMember = useMemo(
    () => members.find((member) => member.id === selectedMemberId),
    [members, selectedMemberId]
  );

  return (
    <Card className="w-full max-w-md bg-transparent border-none">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-medium text-white">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-gray-300">
          Photo Bomb access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded border border-red-800 bg-red-950/50 p-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="ml-auto text-xs underline hover:no-underline text-red-300"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="family-member">Who are you?</Label>
            {membersLoading ? (
              <div className="flex items-center justify-center rounded border border-dashed border-gray-600 bg-gray-800/50 p-4 text-sm text-gray-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-red-400" />
                Gathering our family list...
              </div>
            ) : members.length > 0 ? (
              <select
                id="family-member"
                value={selectedMemberId}
                onChange={(event) => {
                  setSelectedMemberId(event.target.value);
                  setMembersError(null);
                }}
                disabled={isLoading}
                className="flex h-11 w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.displayName} — {member.relation}
                  </option>
                ))}
              </select>
            ) : (
              <div className="rounded border border-dashed border-gray-600 bg-gray-800/50 p-4 text-sm text-gray-400">
                No registered family members yet. Please ask Lewis to invite
                you.
              </div>
            )}
            {membersError && (
              <p className="text-sm text-red-400">{membersError}</p>
            )}

            {selectedMember && (
              <p className="text-xs text-gray-900">
                Signing in as{" "}
                <span className="font-medium text-white">
                  {selectedMember.displayName}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="family-password">Family password</Label>
            <Input
              id="family-password"
              type="password"
              placeholder="Enter super secret password"
              value={familyPassword}
              onChange={(e) => setFamilyPassword(e.target.value)}
              required
              disabled={isLoading || membersLoading || members.length === 0}
              className="border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 focus:ring-red-500"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            disabled={isLoading || membersLoading || members.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Letting you in...
              </>
            ) : (
              "Enter the gallery"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-400">
          Need a login? Please{" "}
          <Link
            to="/register"
            className="font-medium text-red-400 hover:text-red-300 hover:underline"
          >
            request access
          </Link>{" "}
          from Lewis.
        </p>
      </CardFooter>
    </Card>
  );
}
