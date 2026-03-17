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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900">
            Restaurant not found
          </h1>
          <p className="mt-2 text-gray-500">
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-3xl px-4 py-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p className="mt-2 text-gray-600">{restaurant.description}</p>
          )}
        </div>
      </header>

      {/* Menu content */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        {menus.length === 0 ? (
          <div className="rounded-xl bg-white py-12 text-center shadow-sm">
            <UtensilsCrossed className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="text-gray-500">No menu items available</p>
          </div>
        ) : (
          <div className="space-y-8">
            {menus.map((menu: any) => (
              <div key={menu._id}>
                {menus.length > 1 && (
                  <h2 className="mb-4 text-2xl font-bold text-gray-900">
                    {menu.name}
                  </h2>
                )}
                {menu.description && (
                  <p className="mb-4 text-gray-600">{menu.description}</p>
                )}

                <div className="space-y-6">
                  {menu.categories.map((category: any) => (
                    <div
                      key={category._id}
                      className="rounded-xl bg-white shadow-sm"
                    >
                      <div className="border-b px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="mt-1 text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="divide-y">
                        {category.items.map((item: any) => (
                          <div
                            key={item._id}
                            className="flex items-start justify-between px-6 py-4"
                          >
                            <div className="flex-1 pr-4">
                              <h4 className="font-medium text-gray-900">
                                {item.name}
                              </h4>
                              {item.description && (
                                <p className="mt-1 text-sm text-gray-500">
                                  {item.description}
                                </p>
                              )}
                              {item.tags.length > 0 && (
                                <div className="mt-2 flex gap-1">
                                  {item.tags.map((tag: any) => (
                                    <span
                                      key={tag}
                                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="shrink-0 text-lg font-semibold text-gray-900">
                              {currencySymbol}
                              {item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}

                        {category.items.length === 0 && (
                          <p className="px-6 py-4 text-sm text-gray-400">
                            No items available
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 text-center text-sm text-gray-500">
        Powered by HirokuAI
      </footer>
    </div>
  );
}
