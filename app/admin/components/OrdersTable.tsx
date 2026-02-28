"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Select } from "@/app/components/ui/Select";
import { Button } from "@/app/components/ui/Button";
import { centsToUsd } from "@/lib/formatting";

type Order = {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  email: string;
  fulfillment: string;
  requestedDate: string;
  timeWindow: string;
  subtotalCents: number;
  status: string;
  createdAt: string;
};

const statuses = ["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "SHIPPED"];

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/orders", { cache: "no-store" });
    const d = await r.json();
    setOrders(d.orders || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status })
    });
    load();
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-extrabold">Latest orders</div>
        <div className="flex gap-2">
          <a href="/api/admin/export" target="_blank" rel="noreferrer">
            <Button variant="secondary">Export CSV</Button>
          </a>
          <Button onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="text-left text-xs text-neutral-500">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Fulfillment</th>
              <th>Date</th>
              <th>Window</th>
              <th>Subtotal</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-black/10">
                <td className="py-3 font-semibold">{o.orderNumber}</td>
                <td>
                  <div className="font-semibold">{o.fullName}</div>
                  <div className="text-xs text-neutral-500">{o.phone} • {o.email}</div>
                </td>
                <td className="font-semibold">{o.fulfillment}</td>
                <td>{o.requestedDate.slice(0, 10)}</td>
                <td>{o.timeWindow}</td>
                <td className="font-semibold">{centsToUsd(o.subtotalCents)}</td>
                <td className="w-52">
                  <Select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}>
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-neutral-500">No orders yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}