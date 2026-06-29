"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";

export const UserProfile: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOutUser();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 flex items-center justify-center shadow-inner">
          {user.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "User Avatar"}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <UserIcon className="h-8 w-8 text-neutral-400" />
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 tracking-tight">
            {user.displayName || "Anonymous User"}
          </h2>
          <p className="text-sm text-neutral-500 font-normal">
            {user.email || "No email provided"}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-xl border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900 transition-all text-neutral-700"
      >
        {isSigningOut ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing out...
          </>
        ) : (
          <>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </>
        )}
      </Button>
    </div>
  );
};
