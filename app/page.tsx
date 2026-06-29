import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Sparkles, Command } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background bg-subtle-grid">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2 font-semibold text-neutral-900 tracking-tight text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-white shadow-sm">
              <Command className="h-4 w-4" />
            </div>
            <span>SomeoneOS</span>
          </div>
          <nav className="flex items-center gap-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/80">
              v0.1.0 Preview
            </span>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-medium text-neutral-700 shadow-sm transition-all hover:bg-neutral-50 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-neutral-500" />
            <span>Introducing Next-Gen Productivity</span>
          </div>

          {/* Branding Header */}
          <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-7xl lg:text-8xl">
            SomeoneOS
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl text-neutral-600 font-normal leading-relaxed sm:text-2xl max-w-2xl mx-auto tracking-tight">
            Your autonomous personal chief of staff.
          </p>

          {/* Action Button */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <GoogleSignInButton />
          </div>
        </div>

        {/* Apple/Notion minimalist hero preview box */}
        <div className="mt-16 w-full max-w-4xl rounded-2xl border border-neutral-200/80 bg-white/70 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <div className="flex items-center gap-2 border-b border-neutral-100 pb-4 mb-6">
            <div className="h-3 w-3 rounded-full bg-neutral-300" />
            <div className="h-3 w-3 rounded-full bg-neutral-300" />
            <div className="h-3 w-3 rounded-full bg-neutral-300" />
            <span className="ml-2 text-xs font-mono text-neutral-400">workspace / SomeoneOS dashboard</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-800 mb-1">Autonomous Task Scheduling</h3>
              <p className="text-xs text-neutral-500 leading-normal">Intelligent background orchestration of your daily workflows and commitments.</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-800 mb-1">Context Synthesis</h3>
              <p className="text-xs text-neutral-500 leading-normal">Aggregates insights, messages, and priority updates seamlessly into actionable feeds.</p>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50/80 border border-neutral-100">
              <h3 className="text-sm font-semibold text-neutral-800 mb-1">Zero Overhead</h3>
              <p className="text-xs text-neutral-500 leading-normal">Designed for hyper-efficiency with an intuitive Notion-like clean workspace interface.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200/60 py-8 text-center text-xs text-neutral-500">
        <div className="mx-auto max-w-6xl px-6">
          <p>© {new Date().getFullYear()} SomeoneOS. Built with Next.js 15 & Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
}
