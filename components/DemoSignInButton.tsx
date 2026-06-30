"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Sparkles, Loader2 } from "lucide-react";

export const DemoSignInButton: React.FC = () => {
  const { signInMockUser } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoMode = () => {
    setIsLoading(true);
    signInMockUser();
    
    setTimeout(() => {
      router.push("/dashboard");
      setIsLoading(false);
    }, 400);
  };

  return (
    <Button
      size="lg"
      variant="outline"
      onClick={handleDemoMode}
      disabled={isLoading}
      className="rounded-full px-8 py-6 text-base font-semibold shadow-md bg-neutral-900 border-neutral-900 text-white hover:bg-neutral-800 transition-all flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading Sandbox...
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
          Launch Demo Console
        </>
      )}
    </Button>
  );
};
