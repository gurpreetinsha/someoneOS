"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Command, LogOut, User as UserIcon, Loader2 } from "lucide-react";

export const TopNavigation: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOutUser();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* SomeoneOS Logo */}
        <div className="flex items-center gap-2.5 font-semibold text-neutral-900 tracking-tight text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-sm">
            <Command className="h-4 w-4" />
          </div>
          <span className="font-bold">SomeoneOS</span>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200/60 rounded-full py-1 px-3">
              <div className="relative h-7 w-7 overflow-hidden rounded-full border border-neutral-200 bg-neutral-100 flex items-center justify-center">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    fill
                    className="object-cover"
                    sizes="28px"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-neutral-400" />
                )}
              </div>
              <span className="text-xs font-medium text-neutral-700 hidden sm:inline-block">
                {user.displayName || user.email}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="text-xs text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              aria-label="Sign out button"
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
              ) : (
                <>
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sign Out
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};
