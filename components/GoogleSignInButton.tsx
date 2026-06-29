"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { ArrowRight, Loader2 } from "lucide-react";

interface GoogleSignInButtonProps {
  text?: string;
  className?: string;
  showIcon?: boolean;
  size?: "default" | "sm" | "lg" | "icon";
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  text = "Get Started",
  className = "rounded-full px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all",
  showIcon = true,
  size = "lg",
}) => {
  const { signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    if (user) {
      router.push("/dashboard");
      return;
    }

    try {
      setIsSigningIn(true);
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign-in failed:", error);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <Button
      size={size}
      className={className}
      onClick={handleSignIn}
      disabled={isSigningIn}
    >
      {isSigningIn ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        <>
          {text}
          {showIcon && <ArrowRight className="ml-2 h-4 w-4" />}
        </>
      )}
    </Button>
  );
};
