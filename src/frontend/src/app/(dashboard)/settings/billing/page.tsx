"use client";

import { CreditCard, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InvoiceRow {
  date: string;
  description: string;
  amount: string;
  status: "Paid" | "Pending" | "Failed";
}

const INVOICES: InvoiceRow[] = [
  {
    date: "Jun 21, 2026",
    description: "Pro Plan - Monthly",
    amount: "$29.00",
    status: "Paid",
  },
  {
    date: "May 21, 2026",
    description: "Pro Plan - Monthly",
    amount: "$29.00",
    status: "Paid",
  },
  {
    date: "Apr 21, 2026",
    description: "Pro Plan - Monthly",
    amount: "$29.00",
    status: "Paid",
  },
  {
    date: "Mar 21, 2026",
    description: "Pro Plan - Monthly",
    amount: "$29.00",
    status: "Paid",
  },
];

const STATUS_VARIANT: Record<
  InvoiceRow["status"],
  "success" | "warning" | "danger"
> = {
  Paid: "success",
  Pending: "warning",
  Failed: "danger",
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-4 max-w-[640px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your subscription, payment method, and invoices.
        </p>
      </div>

      {/* Current Plan Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Current Plan
        </h2>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-900">Pro</span>
              <Badge variant="brand">Pro</Badge>
            </div>
            <p className="text-[13px] text-gray-500 mt-1">
              Next renewal: Jul 21, 2026
            </p>
          </div>
          <Button variant="secondary" size="sm">
            Change plan
          </Button>
        </div>
        <hr className="border-gray-100 my-4" />
        <div className="flex justify-end">
          <button className="text-sm text-red-600 hover:underline">
            Cancel subscription
          </button>
        </div>
      </Card>

      {/* Payment Method Card */}
      <Card padding="lg">
        <h2 className="text-base font-semibold text-gray-900 mb-4">
          Payment Method
        </h2>
        <div className="flex items-center gap-3">
          <CreditCard className="w-8 h-8 text-gray-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              Visa ending in 4242
            </p>
            <p className="text-xs text-gray-500">Expires 12/27</p>
          </div>
          <Button variant="secondary" size="sm">
            Update card
          </Button>
        </div>
      </Card>

      {/* Billing History Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-card">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-base font-semibold text-gray-900">
            Billing History
          </h2>
          <button className="text-sm text-brand-600 hover:underline">
            Download all
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Description", "Amount", "Status", "Invoice"].map(
                  (col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 text-left"
                    >
                      {col}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-[13px] text-gray-600 whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {row.description}
                  </td>
                  <td className="px-4 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">
                    {row.amount}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[row.status]}>
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
