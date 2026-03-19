"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRestaurant } from "@/hooks/use-restaurant";
import { useState, useRef } from "react";
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  ExternalLink,
  ImageIcon,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

// ── Image thumbnail component ─────────────────────────────────

function ItemImage({
  storageId,
  onUpload,
}: {
  storageId?: string;
  onUpload: (id: string) => void;
}) {
  const url = useQuery(
    api.storage.getUrl,
    storageId ? { storageId: storageId as Id<"_storage"> } : "skip"
  );
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId: newId } = await result.json();
      onUpload(newId);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    }
    // Reset the input so the same file can be re-selected
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex-shrink-0">
      <input
        type="file"
        ref={fileRef}
        className="hidden"
        accept="image/*"
        onChange={handleUpload}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg transition-colors"
        style={{
          background: url ? "transparent" : "var(--surface-warm, rgba(200,150,62,0.06))",
          border: "1px solid var(--border-light)",
        }}
        title="Upload image"
      >
        {url ? (
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <ImageIcon
            className="h-5 w-5"
            style={{ color: "var(--text-muted)", opacity: 0.5 }}
          />
        )}
      </button>
    </div>
  );
}

// ── Editable item component ───────────────────────────────────

function EditableItem({
  item,
  confirmDeleteItemId,
  onConfirmDelete,
}: {
  item: any;
  confirmDeleteItemId: string | null;
  onConfirmDelete: (id: string | null) => void;
}) {
  const updateItem = useMutation(api.menus.updateItem);
  const removeItem = useMutation(api.menus.removeItem);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    description: item.description || "",
    price: String(item.price),
    tags: (item.tags || []).join(", "),
  });

  const handleSave = async () => {
    if (!editData.name.trim() || !editData.price.trim()) {
      toast.error("Name and price are required");
      return;
    }
    try {
      await updateItem({
        itemId: item._id,
        name: editData.name,
        description: editData.description || undefined,
        price: parseFloat(editData.price),
        tags: editData.tags
          ? editData.tags
              .split(",")
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
      });
      toast.success("Item updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update item");
    }
  };

  const handleCancel = () => {
    setEditData({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      tags: (item.tags || []).join(", "),
    });
    setEditing(false);
  };

  const handleImageUpload = async (storageId: string) => {
    try {
      await updateItem({
        itemId: item._id,
        imageStorageId: storageId as Id<"_storage">,
      });
    } catch {
      toast.error("Failed to save image");
    }
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
  };

  if (editing) {
    return (
      <div className="flex gap-3 px-4 py-3">
        <ItemImage
          storageId={item.imageStorageId}
          onUpload={handleImageUpload}
        />
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="text"
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            placeholder="Item name"
            className="flex-1 rounded-lg px-2 py-1 text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
            autoFocus
          />
          <input
            type="text"
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
            placeholder="Description (optional)"
            className="flex-1 rounded-lg px-2 py-1 text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
          />
          <input
            type="number"
            value={editData.price}
            onChange={(e) =>
              setEditData({ ...editData, price: e.target.value })
            }
            placeholder="Price"
            className="w-24 rounded-lg px-2 py-1 text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
            step="0.01"
          />
          <input
            type="text"
            value={editData.tags}
            onChange={(e) =>
              setEditData({ ...editData, tags: e.target.value })
            }
            placeholder="Tags (comma-separated)"
            className="flex-1 rounded-lg px-2 py-1 text-sm outline-none"
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-light)";
            }}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="rounded-lg p-1.5 transition-colors"
              style={{ color: "var(--accent)" }}
              title="Save"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleCancel}
              className="rounded-lg p-1.5 transition-colors"
              style={{ color: "var(--text-muted)" }}
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <ItemImage
        storageId={item.imageStorageId}
        onUpload={handleImageUpload}
      />
      <div className="flex-1 min-w-0">
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
        {item.tags?.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {item.tags.map((tag: string) => (
              <span
                key={tag}
                className="rounded-full px-2 py-0.5 text-xs"
                style={{
                  background: "rgba(200,150,62,0.1)",
                  color: "var(--accent)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
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
          onClick={() => setEditing(true)}
          className="rounded-lg p-1.5 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          title="Edit item"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={async () => {
            if (confirmDeleteItemId !== item._id) {
              onConfirmDelete(item._id);
              setTimeout(() => onConfirmDelete(null), 3000);
              return;
            }
            try {
              await removeItem({ itemId: item._id });
              toast.success("Item deleted");
            } catch {
              toast.error("Failed to delete item");
            }
            onConfirmDelete(null);
          }}
          className="rounded-lg px-1.5 py-0.5 text-xs font-medium transition-colors"
          style={
            confirmDeleteItemId === item._id
              ? { background: "var(--danger)", color: "#fff" }
              : { color: "var(--text-muted)" }
          }
        >
          {confirmDeleteItemId === item._id ? (
            "Confirm?"
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function MenuPage() {
  const restaurant = useRestaurant();
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
    try {
      await createMenu({ restaurantId: restaurant._id, name: newMenuName });
      toast.success("Menu created");
      setNewMenuName("");
      setShowAddMenu(false);
    } catch {
      toast.error("Failed to create menu");
    }
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
          className="flex flex-col items-center rounded-2xl py-12"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-light)",
          }}
        >
          <Edit2
            className="mb-3 h-10 w-10"
            style={{ color: "var(--text-muted)", opacity: 0.4 }}
          />
          <p
            className="text-sm font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Build your first menu
          </p>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Create a menu to organize your dishes and prices.
          </p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="mt-4 flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-md"
            style={{
              background:
                "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            }}
          >
            <Plus className="h-4 w-4" /> Create Menu
          </button>
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

// ── Menu section ──────────────────────────────────────────────

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

  const [confirmDeleteMenu, setConfirmDeleteMenu] = useState(false);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await createCategory({ menuId: menu._id, name: newCatName });
      toast.success("Category added");
      setNewCatName("");
      setShowAddCat(false);
    } catch {
      toast.error("Failed to add category");
    }
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
            onClick={async () => {
              if (!confirmDeleteMenu) {
                setConfirmDeleteMenu(true);
                setTimeout(() => setConfirmDeleteMenu(false), 3000);
                return;
              }
              try {
                await removeMenu({ menuId: menu._id });
                toast.success("Menu deleted");
              } catch {
                toast.error("Failed to delete menu");
              }
              setConfirmDeleteMenu(false);
            }}
            className="rounded-xl px-2 py-1.5 text-xs font-medium transition-colors"
            style={
              confirmDeleteMenu
                ? { background: "var(--danger)", color: "#fff" }
                : { color: "var(--text-muted)" }
            }
            onMouseEnter={(e) => {
              if (!confirmDeleteMenu) {
                e.currentTarget.style.background = "var(--danger-light)";
                e.currentTarget.style.color = "var(--danger)";
              }
            }}
            onMouseLeave={(e) => {
              if (!confirmDeleteMenu) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-muted)";
              }
            }}
          >
            {confirmDeleteMenu ? (
              "Confirm?"
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
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

// ── Category section ──────────────────────────────────────────

function CategorySection({ category }: { category: any }) {
  const items = useQuery(api.menus.listItems, {
    categoryId: category._id,
  });
  const createItem = useMutation(api.menus.createItem);
  const removeCategory = useMutation(api.menus.removeCategory);

  const [showAddItem, setShowAddItem] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(false);
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(
    null
  );
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    tags: "",
  });

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) return;
    try {
      await createItem({
        categoryId: category._id,
        name: newItem.name,
        price: parseFloat(newItem.price),
        description: newItem.description || undefined,
        tags: newItem.tags
          ? newItem.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
      });
      toast.success("Item added");
      setNewItem({ name: "", price: "", description: "", tags: "" });
      setShowAddItem(false);
    } catch {
      toast.error("Failed to add item");
    }
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
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
            onClick={async () => {
              if (!confirmDeleteCat) {
                setConfirmDeleteCat(true);
                setTimeout(() => setConfirmDeleteCat(false), 3000);
                return;
              }
              try {
                await removeCategory({ categoryId: category._id });
                toast.success("Category deleted");
              } catch {
                toast.error("Failed to delete");
              }
              setConfirmDeleteCat(false);
            }}
            className="rounded-lg px-1.5 py-0.5 text-xs font-medium transition-colors"
            style={
              confirmDeleteCat
                ? { background: "var(--danger)", color: "#fff" }
                : { color: "var(--text-muted)" }
            }
          >
            {confirmDeleteCat ? (
              "Confirm?"
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div>
        {showAddItem && (
          <div
            className="flex flex-col gap-2 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
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
              style={inputStyle}
              autoFocus
            />
            <input
              type="text"
              value={newItem.description}
              onChange={(e) =>
                setNewItem({ ...newItem, description: e.target.value })
              }
              placeholder="Description (optional)"
              className="flex-1 rounded-lg px-2 py-1 text-sm outline-none"
              style={inputStyle}
            />
            <input
              type="number"
              value={newItem.price}
              onChange={(e) =>
                setNewItem({ ...newItem, price: e.target.value })
              }
              placeholder="Price"
              className="w-full rounded-lg px-2 py-1 text-sm outline-none sm:w-24"
              style={inputStyle}
              step="0.01"
            />
            <input
              type="text"
              value={newItem.tags}
              onChange={(e) =>
                setNewItem({ ...newItem, tags: e.target.value })
              }
              placeholder="Tags (comma-separated, e.g. spicy, vegan)"
              className="flex-1 rounded-lg px-2 py-1 text-sm outline-none"
              style={inputStyle}
            />
            <div className="flex items-center gap-2">
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
          </div>
        )}

        {items?.map((item: any, index: number) => (
          <div
            key={item._id}
            style={{
              borderTop:
                index > 0 || showAddItem
                  ? "1px solid var(--border-light)"
                  : undefined,
            }}
          >
            <EditableItem
              item={item}
              confirmDeleteItemId={confirmDeleteItemId}
              onConfirmDelete={setConfirmDeleteItemId}
            />
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
