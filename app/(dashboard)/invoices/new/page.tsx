"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type LineItem = {
  menuItemId?: Id<"menuItems">;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedLeadId = searchParams.get("leadId");

  const restaurant = useQuery(api.restaurants.get, {});
  const leads = useQuery(
    api.leads.list,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );
  const menuItems = useQuery(
    api.menus.listAllItems,
    restaurant ? { restaurantId: restaurant._id } : "skip"
  );

  const createInvoice = useMutation(api.invoices.create);

  const [leadId, setLeadId] = useState<string>(preselectedLeadId ?? "");
  const [items, setItems] = useState<LineItem[]>([
    { name: "", quantity: 1, unitPrice: 0 },
  ]);
  const [taxRate, setTaxRate] = useState<string>(
    String(restaurant?.defaultTaxRate ?? 0)
  );
  const [discount, setDiscount] = useState<string>("0");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!restaurant) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (parseFloat(taxRate || "0") / 100);
  const total = subtotal + taxAmount - parseFloat(discount || "0");

  const addItem = () => {
    setItems([...items, { name: "", quantity: 1, unitPrice: 0 }]);
  };

  const addFromMenu = (menuItem: any) => {
    setItems([
      ...items,
      {
        menuItemId: menuItem._id,
        name: menuItem.name,
        description: menuItem.description,
        quantity: 1,
        unitPrice: menuItem.price,
      },
    ]);
  };

  const updateItem = (index: number, updates: Partial<LineItem>) => {
    setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!leadId) return alert("Please select a lead");
    const validItems = items.filter((i) => i.name && i.unitPrice > 0);
    if (validItems.length === 0) return alert("Please add at least one item");

    setLoading(true);
    try {
      const invoiceId = await createInvoice({
        restaurantId: restaurant._id,
        leadId: leadId as Id<"leads">,
        items: validItems,
        taxRate: parseFloat(taxRate || "0"),
        discountAmount: parseFloat(discount || "0"),
        notes: notes || undefined,
      });
      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/invoices"
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Invoice</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead selection */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Bill To (Lead) *
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Select a lead...</option>
              {leads?.map((lead: any) => (
                <option key={lead._id} value={lead._id}>
                  {lead.name} {lead.phone ? `(${lead.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Line items */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Line Items
              </h2>
              <div className="flex gap-2">
                {menuItems && menuItems.length > 0 && (
                  <select
                    onChange={(e) => {
                      const item = menuItems.find(
                        (m: any) => m._id === e.target.value
                      );
                      if (item) addFromMenu(item);
                      e.target.value = "";
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Add from menu...
                    </option>
                    {menuItems.map((item: any) => (
                      <option key={item._id} value={item._id}>
                        {item.name} (${item.price.toFixed(2)})
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={addItem}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4" /> Custom Item
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium w-20">Qty</th>
                  <th className="pb-2 font-medium w-28">Unit Price</th>
                  <th className="pb-2 font-medium w-28 text-right">Total</th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2 pr-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(i, { name: e.target.value })
                        }
                        placeholder="Item name"
                        className="w-full rounded border px-2 py-1 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, {
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        min={1}
                        className="w-full rounded border px-2 py-1 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(i, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        className="w-full rounded border px-2 py-1 text-sm outline-none"
                      />
                    </td>
                    <td className="py-2 text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2 pl-2">
                      <button
                        onClick={() => removeItem(i)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Summary
            </h2>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-600">
                  Discount ($)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none"
                />
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${taxAmount.toFixed(2)}</span>
                </div>
                {parseFloat(discount || "0") > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-red-600">
                      -${parseFloat(discount || "0").toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
