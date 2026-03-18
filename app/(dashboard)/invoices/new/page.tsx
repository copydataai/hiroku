"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
      toast.success("Invoice created");
      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border-light)",
    color: "var(--text-primary)",
  };

  const inputFocusStyle = "outline-none focus:ring-1 focus:ring-[#c8963e]";

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/invoices"
          className="rounded-xl p-2 transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1
          className="text-2xl tracking-tight"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--text-primary)",
          }}
        >
          New Invoice
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead selection */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Bill To (Lead) *
            </label>
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-sm ${inputFocusStyle}`}
              style={inputStyle}
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
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2
                className="text-lg font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
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
                    className="rounded-xl px-3 py-1.5 text-sm"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
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
                  className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Plus className="h-4 w-4" /> Custom Item
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--border-light)",
                  }}
                >
                  <th
                    className="pb-2 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Item
                  </th>
                  <th
                    className="pb-2 text-left text-xs font-medium uppercase tracking-wider w-20"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Qty
                  </th>
                  <th
                    className="pb-2 text-left text-xs font-medium uppercase tracking-wider w-28"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Unit Price
                  </th>
                  <th
                    className="pb-2 text-right text-xs font-medium uppercase tracking-wider w-28"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Total
                  </th>
                  <th className="pb-2 w-10" />
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: "1px solid var(--border-light)",
                    }}
                  >
                    <td className="py-2.5 pr-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateItem(i, { name: e.target.value })
                        }
                        placeholder="Item name"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-sm ${inputFocusStyle}`}
                        style={inputStyle}
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, {
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        min={1}
                        className={`w-full rounded-lg px-2.5 py-1.5 text-sm ${inputFocusStyle}`}
                        style={inputStyle}
                      />
                    </td>
                    <td className="py-2.5 pr-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(i, {
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        step="0.01"
                        className={`w-full rounded-lg px-2.5 py-1.5 text-sm ${inputFocusStyle}`}
                        style={inputStyle}
                      />
                    </td>
                    <td
                      className="py-2.5 text-right font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="py-2.5 pl-2">
                      <button
                        onClick={() => removeItem(i)}
                        className="transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--danger)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-muted)")
                        }
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
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <label
              className="mb-2 block text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional notes..."
              className={`w-full rounded-xl px-3 py-2 text-sm ${inputFocusStyle}`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="space-y-6">
          <div
            className="rounded-2xl p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <h2
              className="mb-4 text-lg font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Summary
            </h2>

            <div className="space-y-3">
              <div>
                <label
                  className="mb-1 block text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  step="0.01"
                  className={`w-full rounded-xl px-3 py-2 text-sm ${inputFocusStyle}`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Discount ($)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  step="0.01"
                  className={`w-full rounded-xl px-3 py-2 text-sm ${inputFocusStyle}`}
                  style={inputStyle}
                />
              </div>

              <div
                className="pt-3 space-y-2 text-sm"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>
                    Subtotal
                  </span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: "var(--text-secondary)" }}>Tax</span>
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>
                {parseFloat(discount || "0") > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>
                      Discount
                    </span>
                    <span
                      className="font-medium"
                      style={{ color: "var(--danger)" }}
                    >
                      -${parseFloat(discount || "0").toFixed(2)}
                    </span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-2 text-lg font-bold"
                  style={{ borderTop: "1px solid var(--border-light)" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--text-primary)",
                    }}
                  >
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-6 w-full rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent) 0%, #a07028 100%)",
                color: "#fff",
              }}
            >
              {loading ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
