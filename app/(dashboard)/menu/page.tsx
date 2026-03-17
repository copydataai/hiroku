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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/menu/${restaurant.slug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink className="h-4 w-4" />
            Public Menu
          </Link>
          <button
            onClick={() => setShowAddMenu(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Menu
          </button>
        </div>
      </div>

      {showAddMenu && (
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
          <input
            type="text"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateMenu()}
            placeholder="Menu name (e.g., Lunch, Dinner)"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            autoFocus
          />
          <button
            onClick={handleCreateMenu}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Create
          </button>
          <button
            onClick={() => setShowAddMenu(false)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Menu list */}
      {menus === undefined ? (
        <div className="py-8 text-center text-gray-400">Loading...</div>
      ) : menus.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center shadow-sm">
          <p className="text-gray-500">No menus yet. Create your first menu above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {menus.map((menu: any) => (
            <MenuSection key={menu._id} menu={menu} restaurantId={restaurant._id} />
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
    <div className="rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900"
        >
          {expanded ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          {menu.name}
        </button>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={menu.isActive}
              onChange={(e) =>
                updateMenu({ menuId: menu._id, isActive: e.target.checked })
              }
              className="rounded"
            />
            Active
          </label>
          <button
            onClick={() => setShowAddCat(true)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Plus className="inline h-4 w-4" /> Category
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this menu and all its items?")) {
                removeMenu({ menuId: menu._id });
              }
            }}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddCat(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
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
            <p className="py-4 text-center text-sm text-gray-400">
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
  const [newItem, setNewItem] = useState({ name: "", price: "", description: "" });

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
    <div className="rounded-lg border">
      <div className="flex items-center justify-between bg-gray-50 px-4 py-2">
        <h3 className="font-medium text-gray-700">{category.name}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddItem(true)}
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            <Plus className="inline h-4 w-4" /> Item
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this category and all its items?")) {
                removeCategory({ categoryId: category._id });
              }
            }}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="divide-y">
        {showAddItem && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50">
            <input
              type="text"
              value={newItem.name}
              onChange={(e) =>
                setNewItem({ ...newItem, name: e.target.value })
              }
              placeholder="Item name"
              className="flex-1 rounded border px-2 py-1 text-sm outline-none"
              autoFocus
            />
            <input
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              placeholder="Price"
              className="w-24 rounded border px-2 py-1 text-sm outline-none"
              step="0.01"
            />
            <button
              onClick={handleAddItem}
              className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddItem(false)}
              className="text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        )}

        {items?.map((item: any) => (
          <div
            key={item._id}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900">
                ${item.price.toFixed(2)}
              </span>
              <label className="flex items-center gap-1 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={(e) =>
                    updateItem({
                      itemId: item._id,
                      isAvailable: e.target.checked,
                    })
                  }
                />
                Available
              </label>
              <button
                onClick={() => removeItem({ itemId: item._id })}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {items && items.length === 0 && !showAddItem && (
          <p className="py-4 text-center text-sm text-gray-400">
            No items yet
          </p>
        )}
      </div>
    </div>
  );
}
