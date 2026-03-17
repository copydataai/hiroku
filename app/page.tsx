"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { UtensilsCrossed, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <>
      <Authenticated>
        <RedirectToDashboard />
      </Authenticated>
      <Unauthenticated>
        <LandingPage />
      </Unauthenticated>
    </>
  );
}

function RedirectToDashboard() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
          <UtensilsCrossed className="h-7 w-7" />
        </div>
        <h1 className="text-4xl font-bold">HirokuAI</h1>
      </div>
      <p className="mb-8 max-w-md text-center text-lg text-slate-300">
        Restaurant lead management, WhatsApp orders, menus, and invoicing — all
        in one place.
      </p>
      <SignInButton mode="modal">
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-indigo-500">
          Get Started <ArrowRight className="h-5 w-5" />
        </button>
      </SignInButton>
    </div>
  );
}
