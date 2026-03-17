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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="max-w-md space-y-4 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-gray-900">Add Team Member</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Clerk User ID *
            </label>
            <input
              type="text"
              value={newClerkId}
              onChange={(e) => setNewClerkId(e.target.value)}
              placeholder="user_..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              The user must already have a Clerk account.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
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
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Add Member
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((member: any) => (
              <tr key={member._id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {member.name || "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {member.email || "—"}
                </td>
                <td className="px-4 py-3">
                  {member.role === "owner" ? (
                    <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
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
                      className="rounded-lg border border-gray-200 px-2 py-1 text-sm"
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
                      className="text-gray-400 hover:text-red-600"
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
