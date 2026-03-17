"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";

export default function TeamSettingsPage() {
  const restaurant = useQuery(api.restaurants.get, {});
  const members = useQuery(
    api.teamMembers.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const addMember = useMutation(api.teamMembers.add);
  const updateRole = useMutation(api.teamMembers.updateRole);
  const removeMember = useMutation(api.teamMembers.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "manager" | "staff">("staff");
  const [newClerkId, setNewClerkId] = useState("");

  if (!restaurant) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClerkId || !newName) return;

    try {
      await addMember({
        restaurantId: restaurant._id,
        clerkUserId: newClerkId,
        role: newRole,
        name: newName,
        email: newEmail,
      });
      setShowAdd(false);
      setNewEmail("");
      setNewName("");
      setNewClerkId("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const inputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
    e.currentTarget.style.boxShadow = "0 0 0 2px rgba(200,150,62,0.1)";
  };

  const inputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "var(--border-light)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Team Management
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage team members and their roles.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
            color: "#fff",
          }}
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="max-w-md space-y-4 rounded-2xl p-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
        >
          <h2
            className="font-semibold"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Add Team Member
          </h2>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Clerk User ID *
            </label>
            <input
              type="text"
              value={newClerkId}
              onChange={(e) => setNewClerkId(e.target.value)}
              placeholder="user_..."
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
              onFocus={inputFocus}
              onBlur={inputBlur}
              required
            />
            <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
              The user must already have a Clerk account.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
                onFocus={inputFocus}
                onBlur={inputBlur}
                required
              />
            </div>
            <div>
              <label
                className="mb-1 block text-sm font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  color: "var(--text-primary)",
                }}
                onFocus={inputFocus}
                onBlur={inputBlur}
              />
            </div>
          </div>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full rounded-xl px-3 py-2 text-sm outline-none"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-primary)",
              }}
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="rounded-xl px-4 py-2 text-sm"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border-light)",
                color: "var(--text-secondary)",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl px-4 py-2 text-sm font-medium"
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                color: "#fff",
              }}
            >
              Add Member
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
      >
        <table className="w-full text-left text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
              <th
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Name
              </th>
              <th
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Email
              </th>
              <th
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Role
              </th>
              <th
                className="px-4 py-3 text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member: any) => (
              <tr
                key={member._id}
                style={{ borderBottom: "1px solid var(--border-light)" }}
                className="last:border-0"
              >
                <td
                  className="px-4 py-3 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {member.name || "\u2014"}
                </td>
                <td className="px-4 py-3" style={{ color: "var(--text-secondary)" }}>
                  {member.email || "\u2014"}
                </td>
                <td className="px-4 py-3">
                  {member.role === "owner" ? (
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium"
                      style={{
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                      }}
                    >
                      owner
                    </span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRole({
                          memberId: member._id,
                          role: e.target.value as any,
                        })
                      }
                      className="rounded-lg px-2 py-1 text-sm"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border-light)",
                        color: "var(--text-primary)",
                      }}
                    >
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="staff">Staff</option>
                    </select>
                  )}
                </td>
                <td className="px-4 py-3">
                  {member.role !== "owner" && (
                    <button
                      onClick={() => {
                        if (confirm("Remove this team member?")) {
                          removeMember({ memberId: member._id });
                        }
                      }}
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
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
