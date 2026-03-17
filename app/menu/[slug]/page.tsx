"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>();
  const data = useQuery(api.menus.getPublicMenu, { slug });

  if (data === undefined) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-up">
          <div
            className="h-10 w-10 rounded-full border-2 animate-spin"
            style={{
              borderColor: "rgba(255,255,255,0.08)",
              borderTopColor: "var(--accent)",
            }}
          />
          <p
            className="text-sm"
            style={{
              color: "var(--sidebar-text)",
              fontFamily: "var(--font-body)",
            }}
          >
            Loading menu...
          </p>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "#0a0a0a" }}
      >
        <div className="text-center animate-fade-up">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "rgba(200,150,62,0.08)",
              border: "1px solid rgba(200,150,62,0.15)",
            }}
          >
            <UtensilsCrossed
              className="h-10 w-10"
              style={{ color: "var(--accent)" }}
            />
          </div>
          <h1
            className="text-3xl"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--sidebar-text-active)",
              fontWeight: 400,
            }}
          >
            Restaurant not found
          </h1>
          <p
            className="mt-3 text-base"
            style={{ color: "var(--sidebar-text)" }}
          >
            This menu page does not exist.
          </p>
        </div>
      </div>
    );
  }

  const { restaurant, menus } = data;

  const currencySymbol =
    restaurant.currency === "EUR"
      ? "\u20AC"
      : restaurant.currency === "GBP"
        ? "\u00A3"
        : "$";

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background: "#0a0a0a",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 grid-pattern"
        style={{ opacity: 0.5 }}
      />

      {/* Decorative gradient orb - top right */}
      <div
        className="absolute top-[-15%] right-[-8%] h-[500px] w-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(200,150,62,0.1) 0%, transparent 70%)",
          animation: "float 8s ease-in-out infinite",
        }}
      />

      {/* Decorative gradient orb - bottom left */}
      <div
        className="absolute bottom-[-10%] left-[-5%] h-[350px] w-[350px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(200,150,62,0.06) 0%, transparent 70%)",
          animation: "float 10s ease-in-out infinite 2s",
        }}
      />

      {/* Content layer */}
      <div className="relative z-10">
        {/* Header */}
        <header
          className="noise-overlay"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div className="mx-auto max-w-3xl px-6 py-16 text-center">
            {/* Decorative top line */}
            <div
              className="mx-auto mb-8 h-px w-16 animate-fade-up"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
              }}
            />

            <h1
              className="animate-fade-up delay-100 text-4xl tracking-tight md:text-5xl"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--sidebar-text-active)",
                fontWeight: 400,
                fontStyle: "italic",
                textShadow: "0 0 80px rgba(200,150,62,0.15)",
              }}
            >
              {restaurant.name}
            </h1>
            {restaurant.description && (
              <p
                className="animate-fade-up delay-200 mt-4 text-base leading-relaxed md:text-lg"
                style={{ color: "var(--sidebar-text)" }}
              >
                {restaurant.description}
              </p>
            )}

            {/* Decorative bottom line */}
            <div
              className="mx-auto mt-8 h-px w-24 animate-fade-up delay-300"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
                opacity: 0.4,
              }}
            />
          </div>
        </header>

        {/* Menu content */}
        <main className="mx-auto max-w-3xl px-6 py-12">
          {menus.length === 0 ? (
            <div
              className="animate-fade-up rounded-2xl py-16 text-center"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                style={{
                  background: "rgba(200,150,62,0.08)",
                  border: "1px solid rgba(200,150,62,0.12)",
                }}
              >
                <UtensilsCrossed
                  className="h-8 w-8"
                  style={{ color: "var(--accent)" }}
                />
              </div>
              <p style={{ color: "var(--sidebar-text)" }}>
                No menu items available
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {menus.map((menu: any, menuIndex: number) => (
                <div
                  key={menu._id}
                  className={`animate-fade-up delay-${Math.min((menuIndex + 1) * 100, 800)}`}
                >
                  {menus.length > 1 && (
                    <h2
                      className="mb-2 text-2xl tracking-tight md:text-3xl"
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--sidebar-text-active)",
                        fontWeight: 400,
                      }}
                    >
                      {menu.name}
                    </h2>
                  )}
                  {menu.description && (
                    <p
                      className="mb-6 text-sm leading-relaxed"
                      style={{ color: "var(--sidebar-text)" }}
                    >
                      {menu.description}
                    </p>
                  )}

                  <div className="space-y-8">
                    {menu.categories.map(
                      (category: any, catIndex: number) => (
                        <div
                          key={category._id}
                          className={`animate-fade-up delay-${Math.min((catIndex + 2) * 100, 800)} rounded-2xl overflow-hidden`}
                          style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {/* Category header */}
                          <div
                            className="px-7 py-5"
                            style={{
                              borderBottom:
                                "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <h3
                              className="text-lg tracking-wide"
                              style={{
                                fontFamily: "var(--font-display)",
                                color: "var(--accent)",
                                fontWeight: 500,
                              }}
                            >
                              {category.name}
                            </h3>
                            {category.description && (
                              <p
                                className="mt-1.5 text-sm"
                                style={{ color: "var(--sidebar-text)" }}
                              >
                                {category.description}
                              </p>
                            )}
                          </div>

                          {/* Items */}
                          <div>
                            {category.items.map(
                              (item: any, itemIndex: number) => (
                                <div
                                  key={item._id}
                                  className="flex items-start justify-between px-7 py-5 transition-colors"
                                  style={{
                                    borderBottom:
                                      itemIndex <
                                      category.items.length - 1
                                        ? "1px solid rgba(255,255,255,0.04)"
                                        : "none",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background =
                                      "rgba(200,150,62,0.03)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background =
                                      "transparent";
                                  }}
                                >
                                  <div className="flex-1 pr-6">
                                    <h4
                                      className="text-base"
                                      style={{
                                        color:
                                          "var(--sidebar-text-active)",
                                        fontWeight: 500,
                                        fontFamily: "var(--font-body)",
                                      }}
                                    >
                                      {item.name}
                                    </h4>
                                    {item.description && (
                                      <p
                                        className="mt-1.5 text-sm leading-relaxed"
                                        style={{
                                          color: "var(--sidebar-text)",
                                        }}
                                      >
                                        {item.description}
                                      </p>
                                    )}
                                    {item.tags.length > 0 && (
                                      <div className="mt-3 flex flex-wrap gap-1.5">
                                        {item.tags.map((tag: any) => (
                                          <span
                                            key={tag}
                                            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                                            style={{
                                              background:
                                                "rgba(200,150,62,0.1)",
                                              color: "var(--accent)",
                                              border:
                                                "1px solid rgba(200,150,62,0.15)",
                                            }}
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <span
                                    className="shrink-0 text-lg"
                                    style={{
                                      color: "var(--accent)",
                                      fontWeight: 600,
                                      fontFamily: "var(--font-body)",
                                    }}
                                  >
                                    {currencySymbol}
                                    {item.price.toFixed(2)}
                                  </span>
                                </div>
                              )
                            )}

                            {category.items.length === 0 && (
                              <p
                                className="px-7 py-5 text-sm"
                                style={{ color: "var(--sidebar-text)" }}
                              >
                                No items available
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer
          className="py-10 text-center"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Decorative line */}
          <div
            className="mx-auto mb-6 h-px w-12"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--accent), transparent)",
              opacity: 0.3,
            }}
          />
          <p
            className="text-sm tracking-wide"
            style={{ color: "var(--sidebar-text)" }}
          >
            Powered by{" "}
            <span
              style={{
                color: "var(--accent)",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              HirokuAI
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
