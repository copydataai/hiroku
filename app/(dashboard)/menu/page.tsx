"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function MenuPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const menus = useQuery(
    api.menus.listMenus,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const createMenu = useMutation(api.menus.createMenu);
  const [newMenuName, setNewMenuName] = useState("");
  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!restaurant) return null;

  const handleCreateMenu = async () => {
    if (!newMenuName.trim()) return;
    await createMenu({ restaurantId: restaurant._id, name: newMenuName });
    setNewMenuName("");
    setShowAddMenu(false);
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          Menu Management
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Public Menu
          </Link>
          <button
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            }}
          >
            <Plus className="h-4 w-4" />
            Add Menu
          </button>
        </div>
      </div>

      {showAddMenu && (
        <div
          className="flex items-center gap-3 rounded-2xl p-4"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <input
            type="text"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateMenu()}
            placeholder="Menu name (e.g., Lunch, Dinner)"
            className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
            autoFocus
          />
          <button
            onClick={handleCreateMenu}
            className="rounded-xl px-4 py-2 text-sm font-medium text-white transition-all"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            }}
          >
            Create
          </button>
          <button
            onClick={() => setShowAddMenu(false)}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Menu list */}
      {menus === undefined ? (
        <div
          className="py-8 text-center text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Loading...
        </div>
      ) : menus.length === 0 ? (
        <div
          className="rounded-2xl py-12 text-center"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No menus yet. Create your first menu above.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {menus.map((menu: any) => (
            <MenuSection
              key={menu._id}
              menu={menu}
              restaurantId={restaurant._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MenuSection({
  menu,
  restaurantId,
}: {
  menu: any;
  restaurantId: Id<"restaurants">;
}) {
  const [expanded, setExpanded] = useState(true);
  const categories = useQuery(api.menus.listCategories, {
    menuId: menu._id,
  });
  const updateMenu = useMutation(api.menus.updateMenu);
  const removeMenu = useMutation(api.menus.removeMenu);
  const createCategory = useMutation(api.menus.createCategory);

  const [newCatName, setNewCatName] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await createCategory({ menuId: menu._id, name: newCatName });
    setNewCatName("");
    setShowAddCat(false);
  };

  return (
    <div
      className="overflow-hidden rounded-2xl"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border-light)",
      }}
    >
      <div
        className="flex items-center justify-between p-4"
        style={{ borderBottom: "1px solid var(--border-light)" }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-lg font-medium"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          {expanded ? (
            <ChevronDown
              className="h-5 w-5"
              style={{ color: "var(--text-muted)" }}
            />
          ) : (
            <ChevronRight
              className="h-5 w-5"
              style={{ color: "var(--text-muted)" }}
            />
          )}
          {menu.name}
        </button>
        <div className="flex items-center gap-2">
          <label
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <input
              type="checkbox"
              checked={menu.isActive}
              onChange={(e) =>
                updateMenu({ menuId: menu._id, isActive: e.target.checked })
              }
              className="rounded accent-[#c8963e]"
            />
            Active
          </label>
          <button
            onClick={() => setShowAddCat(true)}
            className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <Plus className="inline h-4 w-4" /> Category
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this menu and all its items?")) {
                removeMenu({ menuId: menu._id });
              }
            }}
            className="rounded-xl p-1.5 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--danger-light, rgba(220,38,38,0.08))";
              e.currentTarget.style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4">
          {showAddCat && (
            <div className="mb-4 flex items-center gap-3">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                placeholder="Category name"
                className="flex-1 rounded-xl px-3 py-2 text-sm outline-none transition-colors"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-light)";
                }}
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="rounded-xl px-3 py-2 text-sm font-medium text-white transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                }}
              >
                Add
              </button>
              <button
                onClick={() => setShowAddCat(false)}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                Cancel
              </button>
            </div>
          )}

          {categories && categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((cat: any) => (
                <CategorySection key={cat._id} category={cat} />
              ))}
            </div>
          ) : (
            <p
              className="py-4 text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No categories yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category }: { category: any }) {
  const items = useQuery(api.menus.listItems, {
    categoryId: category._id,
  });
  const createItem = useMutation(api.menus.createItem);
  const updateItem = useMutation(api.menus.updateItem);
  const removeItem = useMutation(api.menus.removeItem);
  const removeCategory = useMutation(api.menus.removeCategory);

  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
  });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    await createItem({
      categoryId: category._id,
      name: newItem.name,
      price: parseFloat(newItem.price),
      description: newItem.description || undefined,
    });
    setNewItem({ name: "", price: "", description: "" });
    setShowAddItem(false);
  };

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{ border: "1px solid var(--border-light)" }}
    >
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ background: "var(--surface-warm)" }}
      >
        <h3
          className="font-medium text-sm"
          style={{ color: "var(--text-primary)" }}
        >
          {category.name}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddItem(true)}
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: "var(--accent)" }}
          >
            <Plus className="inline h-4 w-4" /> Item
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this category and all its items?")) {
                removeCategory({ categoryId: category._id });
              }
            }}
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--danger)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
            }}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div>
        {showAddItem && (
          <div
            className="flex items-center gap-3 p-3"
            style={{ background: "rgba(200,150,62,0.08)" }}
          >
            <input
              type="text"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
              placeholder="Item name"
              className="flex-1 rounded-lg px-2 py-1 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              autoFocus
            />
            <input
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              placeholder="Price"
              className="w-24 rounded-lg px-2 py-1 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              step="0.01"
            />
            <button
              onClick={handleAddItem}
              className="rounded-lg px-3 py-1 text-sm font-medium text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
              }}
            >
              Add
            </button>
            <button
              onClick={() => setShowAddItem(false)}
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              Cancel
            </button>
          </div>
        )}

        {items?.map((item: any, index: number) => (
          <div
            key={item._id}
            className="flex items-center justify-between px-4 py-3"
            style={{
              borderTop: index > 0 || showAddItem ? "1px solid var(--border-light)" : undefined,
            }}
          >
            <div className="flex-1">
              <p
                className="font-medium text-sm"
                style={{ color: "var(--text-primary)" }}
              >
                {item.name}
              </p>
              {item.description && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span
                className="font-medium text-sm"
                style={{ color: "var(--accent)" }}
              >
                ${item.price.toFixed(2)}
              </span>
              <label
                className="flex items-center gap-1 text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={(e) =>
                    updateItem({
                      itemId: item._id,
                      isAvailable: e.target.checked,
                    })
                  }
                  className="accent-[#c8963e]"
                />
                Available
              </label>
              <button
                onClick={() => removeItem({ itemId: item._id })}
                className="transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--danger)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-muted)";
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {items && items.length === 0 && !showAddItem && (
          <p
            className="py-4 text-center text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            No items yet
          </p>
        )}
      </div>
    </div>
  );
}
