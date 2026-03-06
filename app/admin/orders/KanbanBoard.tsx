"use client";

import { useEffect, useState, DragEvent } from "react";
import { centsToUsd } from "@/lib/formatting";
import { Select } from "@/app/components/ui/Select";

type Status = "NEW" | "CONFIRMED" | "IN_PROGRESS" | "READY" | "DELIVERED" | "SHIPPED";

type Order = {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  fulfillment: string;
  requestedDate: string;
  subtotalCents: number;
  status: Status;
};

const ACTIVE_STATUSES = ["CONFIRMED", "IN_PROGRESS", "READY"] as const;

const COLUMNS = [
  { label: "Submitted", statuses: ["NEW"], dropStatus: "NEW" },
  { label: "Active", statuses: ["CONFIRMED", "IN_PROGRESS", "READY"], dropStatus: "CONFIRMED" },
  { label: "Done", statuses: ["DELIVERED", "SHIPPED"], dropStatus: "DELIVERED" },
] as const;

export function KanbanBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/orders", { cache: "no-store" });
      if (!r.ok) throw new Error("Failed to fetch");
      const d = await r.json();
      setOrders(d.orders || []);
    } catch {
      // keep existing orders on error
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      load();
    } catch {
      // silently fail, board stays as-is
    }
  }

  function onDragStart(e: DragEvent, id: string) {
    setDraggingId(id);
    e.dataTransfer.setData("orderId", id);
  }

  function onDragOver(e: DragEvent, colLabel: string) {
    e.preventDefault();
    setDragOverCol(colLabel);
  }

  function onDragLeave() {
    setDragOverCol(null);
  }

  async function onDrop(e: DragEvent, dropStatus: string) {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData("orderId");
    if (!id) return;
    await updateStatus(id, dropStatus);
    setDraggingId(null);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-extrabold">Orders Board</div>
        <button
          onClick={load}
          disabled={loading}
          className="text-xs font-semibold text-maroon-800 hover:underline disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => (col.statuses as readonly string[]).includes(o.status));
          const isOver = dragOverCol === col.label;

          return (
            <div
              key={col.label}
              onDragOver={(e) => onDragOver(e, col.label)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, col.dropStatus)}
              className={`flex w-72 flex-shrink-0 flex-col rounded-xl border-2 p-3 transition-colors ${
                isOver ? "border-maroon-800 bg-maroon-50" : "border-black/10 bg-neutral-100"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">{col.label}</span>
                <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold">
                  {colOrders.length}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {colOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, order.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={`cursor-grab rounded-lg bg-white p-3 shadow-sm transition-opacity ${
                      draggingId === order.id ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-extrabold">{order.orderNumber}</span>
                      <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs">
                        {order.fulfillment}
                      </span>
                    </div>
                    <div className="mt-1 font-semibold">{order.fullName}</div>
                    <div className="text-xs text-neutral-500">{order.phone}</div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {order.requestedDate.slice(0, 10)}
                    </div>
                    <div className="mt-1 text-sm font-bold">
                      {centsToUsd(order.subtotalCents)}
                    </div>

                    {(ACTIVE_STATUSES as readonly string[]).includes(order.status) && (
                      <div className="mt-2">
                        <Select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                        >
                          {ACTIVE_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Select>
                      </div>
                    )}
                  </div>
                ))}

                {colOrders.length === 0 && (
                  <div className="py-6 text-center text-xs text-neutral-400">No orders</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
