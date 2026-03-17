"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const handleStatusChange = async (status: string, paymentMethod?: string) => {
    await updateStatus({
      invoiceId: invoice._id,
      status: status as any,
      ...(paymentMethod ? { paymentMethod: paymentMethod as any } : {}),
    });
  };

  const handlePrintDocket = async () => {
    if (!items) return;
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
    alert("Docket created!");
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    sent: "bg-blue-100 text-blue-700",
    paid: "bg-emerald-100 text-emerald-700",
    overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500",
    refunded: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-sm text-gray-500">
              To: {invoice.leadName}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              statusColors[invoice.status] ?? "bg-gray-100"
            }`}
          >
            {invoice.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintDocket}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" /> Print Docket
          </button>

          {invoice.status === "draft" && (
            <button
              onClick={() => handleStatusChange("sent")}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
                className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
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
              className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Invoice content */}
      <div className="rounded-xl bg-white p-8 shadow-sm">
        <div className="mb-8 flex justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {restaurant.name}
            </h2>
            {restaurant.address && (
              <p className="text-sm text-gray-500">{restaurant.address}</p>
            )}
            {restaurant.phone && (
              <p className="text-sm text-gray-500">{restaurant.phone}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Date: {new Date(invoice._creationTime).toLocaleDateString()}
            </p>
            {invoice.dueAt && (
              <p className="text-sm text-gray-500">
                Due: {new Date(invoice.dueAt).toLocaleDateString()}
              </p>
            )}
            {invoice.paidAt && (
              <p className="text-sm text-emerald-600">
                Paid: {new Date(invoice.paidAt).toLocaleDateString()}
                {invoice.paymentMethod && ` (${invoice.paymentMethod})`}
              </p>
            )}
          </div>
        </div>

        {/* Line items table */}
        <table className="mb-6 w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-right">Qty</th>
              <th className="pb-2 font-medium text-right">Unit Price</th>
              <th className="pb-2 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items?.map((item: any) => (
              <tr key={item._id} className="border-b">
                <td className="py-3 font-medium text-gray-900">{item.name}</td>
                <td className="py-3 text-gray-500">
                  {item.description ?? "-"}
                </td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">
                  ${item.unitPrice.toFixed(2)}
                </td>
                <td className="py-3 text-right font-medium">
                  ${item.totalPrice.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="ml-auto w-64 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">
              Tax ({invoice.taxRate}%)
            </span>
            <span className="font-medium">
              ${invoice.taxAmount.toFixed(2)}
            </span>
          </div>
          {invoice.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="font-medium text-red-600">
                -${invoice.discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-lg font-bold">
            <span>Total</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 border-t pt-4">
            <p className="text-sm text-gray-500">
              <strong>Notes:</strong> {invoice.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
