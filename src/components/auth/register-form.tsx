import type React from "react";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
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

export function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState("");
  const [familyPassword, setFamilyPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!familyPassword.trim()) {
      setLocalError("The family password is required.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        email,
        passcode: familyPassword,
        displayName,
        relation,
      });
      navigate("/gallery", { replace: true });
    } catch {
      // Error is handled by context
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <Card className="w-full max-w-md bg-white border border-gray-200">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-medium">Join the family</CardTitle>
        <CardDescription className="text-sm text-gray-300">
          Create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div className="flex items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/15 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{displayError}</span>
              <button
                type="button"
                onClick={() => {
                  setLocalError(null);
                  clearError();
                }}
                className="ml-auto text-xs underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="displayName">Your Name</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="John Doe"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relation">Relation to Lewis</Label>
            <Input
              id="relation"
              type="text"
              placeholder="e.g. Sister, Uncle, Cousin"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyPassword">Family password</Label>
            <Input
              id="familyPassword"
              type="password"
              placeholder="Enter the shared password from Lewis"
              value={familyPassword}
              onChange={(e) => setFamilyPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              We use a single password for everyone so only family can join.
              Please keep it private.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Welcoming to the gallery...
              </>
            ) : (
              "Join the Photo Bomb"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
