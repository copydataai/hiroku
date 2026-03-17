"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  ArrowRight,
  MessageSquare,
  BarChart3,
  FileText,
  UtensilsCrossed,
} from "lucide-react";

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
    <div className="flex h-screen items-center justify-center" style={{ background: "var(--background)" }}>
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div
          className="h-10 w-10 rounded-full border-2 animate-spin"
          style={{
            borderColor: "var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  const features = [
    {
      icon: MessageSquare,
      title: "WhatsApp Orders",
      description: "Auto-respond with menus & pricing via Business API chatbot",
    },
    {
      icon: BarChart3,
      title: "Lead Pipeline",
      description: "Track every lead from first contact to close with full CRM",
    },
    {
      icon: UtensilsCrossed,
      title: "Menu Management",
      description: "Beautiful public menu pages with real-time availability",
    },
    {
      icon: FileText,
      title: "Smart Invoicing",
      description: "Itemized invoices with tax, discounts & docket printing",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "#0a0a0a" }}>
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 grid-pattern"
        style={{ opacity: 0.7 }}
      />

      {/* Warm gradient orbs */}
      <div
        className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(200,150,62,0.12) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(200,150,62,0.08) 0%, transparent 70%)",
          animation: "float 10s ease-in-out infinite 2s",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
              }}
            >
              <UtensilsCrossed className="h-5 w-5 text-white" />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--sidebar-text-active)", fontFamily: "var(--font-display)" }}
            >
              HirokuAI
            </span>
          </div>
          <SignInButton mode="modal">
            <button
              className="rounded-lg px-5 py-2 text-sm font-medium transition-colors"
              style={{
                color: "var(--sidebar-text-active)",
                border: "1px solid var(--sidebar-border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent)";
                e.currentTarget.style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--sidebar-border)";
                e.currentTarget.style.color = "var(--sidebar-text-active)";
              }}
            >
              Sign In
            </button>
          </SignInButton>
        </nav>

        {/* Hero */}
        <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
          {/* Badge */}
          <div
            className="mb-8 animate-fade-up rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase"
            style={{
              color: "var(--accent)",
              border: "1px solid rgba(200,150,62,0.25)",
              background: "rgba(200,150,62,0.06)",
            }}
          >
            Restaurant Management, Reimagined
          </div>

          {/* Headline */}
          <h1
            className="animate-fade-up delay-100 max-w-4xl text-6xl leading-[1.1] tracking-tight md:text-7xl lg:text-8xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--sidebar-text-active)",
              fontWeight: 400,
            }}
          >
            Every guest,{" "}
            <span
              style={{
                color: "var(--accent)",
                fontStyle: "italic",
              }}
            >
              every order
            </span>
            , in one place
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fade-up delay-200 mt-6 max-w-xl text-lg leading-relaxed md:text-xl"
            style={{ color: "var(--sidebar-text)" }}
          >
            Manage leads, automate WhatsApp orders, build beautiful menus, and
            send invoices — built for restaurants that take hospitality seriously.
          </p>

          {/* CTA */}
          <div className="animate-fade-up delay-300 mt-10 flex items-center gap-4">
            <SignInButton mode="modal">
              <button
                className="group flex items-center gap-2 rounded-xl px-7 py-3.5 text-base font-medium text-white transition-all hover:gap-3"
                style={{
                  background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                  boxShadow: "0 4px 24px rgba(200,150,62,0.25)",
                }}
              >
                Start for Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </SignInButton>
          </div>

          {/* Decorative line */}
          <div
            className="animate-fade-up delay-400 mt-20 h-px w-32"
            style={{
              background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
              opacity: 0.4,
            }}
          />
        </div>

        {/* Features */}
        <div className="mx-auto max-w-4xl pb-24">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={`animate-fade-up delay-${(i + 4) * 100} group rounded-2xl p-8 transition-all`}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(200,150,62,0.2)";
                  e.currentTarget.style.background = "rgba(200,150,62,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{
                    background: "rgba(200,150,62,0.1)",
                    color: "var(--accent)",
                  }}
                >
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3
                  className="mb-2 text-lg font-medium"
                  style={{
                    color: "var(--sidebar-text-active)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--sidebar-text)" }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer
          className="border-t py-8 text-center text-sm"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            color: "var(--sidebar-text)",
          }}
        >
          Built for restaurants that care.
        </footer>
      </div>
    </div>
  );
}
