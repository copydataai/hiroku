"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Printer } from "lucide-react";
import { toast } from "sonner";

export default function InvoiceDetailPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const router = useRouter();

  const invoice = useQuery(api.invoices.get, {
    invoiceId: invoiceId as Id<"invoices">,
  });
  const items = useQuery(api.invoiceItems.listByInvoice, {
    invoiceId: invoiceId as Id<"invoices">,
  });
  const restaurant = useQuery(api.restaurants.get, {});
  const updateStatus = useMutation(api.invoices.updateStatus);
  const createDocket = useMutation(api.dockets.create);

  if (!invoice || !restaurant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  const handleStatusChange = async (status: string, paymentMethod?: string) => {
    try {
      await updateStatus({
        invoiceId: invoice._id,
        status: status as any,
        ...(paymentMethod ? { paymentMethod: paymentMethod as any } : {}),
      });
      toast.success(`Invoice marked as ${status}`);
    } catch { toast.error("Failed to update invoice"); }
  };

  const handlePrintDocket = async () => {
    if (!items) return;
    try {
      await createDocket({
        restaurantId: restaurant._id,
        invoiceId: invoice._id,
        leadId: invoice.leadId,
        type: "receipt",
        items: items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
        })),
      });
      toast.success("Docket created");
    } catch { toast.error("Failed to create docket"); }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "paid":
        return { background: "var(--success-light)", color: "var(--success)" };
      case "sent":
        return { background: "rgba(99,102,241,0.08)", color: "#6366f1" };
      case "overdue":
        return { background: "var(--danger-light)", color: "var(--danger)" };
      case "cancelled":
        return { background: "var(--border-light)", color: "var(--text-muted)" };
      case "refunded":
        return { background: "var(--warning-light)", color: "var(--warning)" };
      case "draft":
      default:
        return { background: "var(--warning-light)", color: "var(--warning)" };
    }
  };

  return (
    <div className="animate-fade-up space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-muted)" }}>
        <Link href="/invoices" className="transition-colors hover:underline" style={{ color: "var(--text-muted)" }}>
          Invoices
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span style={{ color: "var(--text-primary)" }}>{invoice.invoiceNumber}</span>
      </nav>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1
              className="text-2xl tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {invoice.invoiceNumber}
            </h1>
            <p
              className="text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              To: {invoice.leadName}
            </p>
          </div>
          <span
            className="rounded-full px-3 py-1 text-sm font-medium capitalize"
            style={getStatusStyle(invoice.status)}
          >
            {invoice.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintDocket}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
              color: "var(--text-secondary)",
            }}
          >
            <Printer className="h-4 w-4" /> Print Docket
          </button>

          {invoice.status === "draft" && (
            <button
              onClick={() => handleStatusChange("sent")}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
              style={{
                background: "rgba(99,102,241,0.08)",
                color: "#6366f1",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              Mark as Sent
            </button>
          )}
          {(invoice.status === "sent" || invoice.status === "overdue") && (
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleStatusChange("paid", e.target.value);
                  }
                }}
                className="rounded-xl px-3 py-2 text-sm"
                style={{
                  background: "var(--success-light)",
                  border: "1px solid var(--success)",
                  color: "var(--success)",
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Mark Paid...
                </option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
            <button
              onClick={() => handleStatusChange("cancelled")}
              className="rounded-xl px-4 py-2 text-sm transition-colors"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--danger)",
                color: "var(--danger)",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Invoice content - premium document feel */}
      <div
        className="rounded-2xl p-10"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-light)",
        }}
      >
        <div className="mb-10 flex justify-between">
          <div>
            <h2
              className="text-xl tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--text-primary)",
              }}
            >
              {restaurant.name}
            </h2>
            {restaurant.address && (
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {restaurant.address}
              </p>
            )}
            {restaurant.phone && (
              <p
                className="text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {restaurant.phone}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Date: {new Date(invoice._creationTime).toLocaleDateString()}
            </p>
            {invoice.dueAt && (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Due: {new Date(invoice.dueAt).toLocaleDateString()}
              </p>
            )}
            {invoice.paidAt && (
              <p className="text-sm" style={{ color: "var(--success)" }}>
                Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                {invoice.paymentMethod && ` (${invoice.paymentMethod})`}
              </p>
            )}
          </div>
        </div>

        {/* Line items table */}
        <table className="mb-8 w-full text-sm">
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--border-light)",
              }}
            >
              <th
                className="pb-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Item
              </th>
              <th
                className="pb-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Description
              </th>
              <th
                className="pb-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Qty
              </th>
              <th
                className="pb-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Unit Price
              </th>
              <th
                className="pb-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: "var(--text-muted)" }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any) => (
              <tr
                key={item._id}
                style={{
                  borderBottom: "1px solid var(--border-light)",
                }}
              >
                <td
                  className="py-3.5 font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  {item.name}
                </td>
                <td
                  className="py-3.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {item.description ?? "-"}
                </td>
                <td
                  className="py-3.5 text-right"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.quantity}
                </td>
                <td
                  className="py-3.5 text-right"
                  style={{ color: "var(--text-secondary)" }}
                >
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td
                  className="py-3.5 text-right font-medium"
                  style={{ color: "var(--text-primary)" }}
                >
                  ${item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              ${invoice.subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--text-secondary)" }}>
              Tax ({invoice.taxRate}%)
            </span>
            <span
              className="font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              ${invoice.taxAmount.toFixed(2)}
            </span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between">
              <span style={{ color: "var(--text-secondary)" }}>Discount</span>
              <span
                className="font-medium"
                style={{ color: "var(--danger)" }}
              >
                -${invoice.discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div
            className="flex justify-between pt-3 text-xl font-bold"
            style={{ borderTop: "2px solid var(--border-light)" }}
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
                color: "var(--accent)",
              }}
            >
              ${invoice.total.toFixed(2)}
            </span>
          </div>
        </div>

        {invoice.notes && (
          <div
            className="mt-10 pt-5"
            style={{ borderTop: "1px solid var(--border-light)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              <strong style={{ color: "var(--text-secondary)" }}>Notes:</strong>{" "}
              {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
