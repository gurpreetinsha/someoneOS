"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { TopNavigation } from "@/components/workspace/TopNavigation";
import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
        <p className="mt-4 text-xs font-semibold text-neutral-700 animate-pulse tracking-wide uppercase">
          Authenticating secure space & syncing memory indexes...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-background bg-subtle-grid">
      <TopNavigation />
      <main className="flex-1 flex flex-col">
        <WorkspaceLayout />
      </main>
      <footer className="w-full border-t border-neutral-200/60 py-6 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} SomeoneOS AI Workspace.</p>
        </div>
      </footer>
    </div>
  );
}
