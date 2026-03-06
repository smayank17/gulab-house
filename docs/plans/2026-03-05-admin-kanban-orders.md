# Admin Kanban Orders Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/admin/orders` page showing a 3-column kanban board where admins drag order cards between columns to update status.

**Architecture:** A single client component (`KanbanBoard`) fetches orders from the existing `GET /api/admin/orders` endpoint and renders them into 3 columns based on status. HTML5 native drag-and-drop moves cards between columns, triggering `PATCH /api/admin/orders/[id]` to persist the status change. Active column cards include a sub-status dropdown.

**Tech Stack:** Next.js 16 (App Router), React, Tailwind CSS, native HTML5 drag-and-drop, existing Prisma/API layer.

---

### Task 1: Add "Orders" nav link to AdminHeader

**Files:**
- Modify: `app/admin/components/AdminHeader.tsx`

**Context:**
`AdminHeader` currently renders a title and a "Protected" label. We need to add a nav link to `/admin/orders`.

**Step 1: Update AdminHeader to include nav link**

Replace the file contents with:

```tsx
export function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold text-neutral-500">Gulab House Admin</div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <a href="/admin/orders" className="font-semibold text-maroon-800 hover:underline">Orders</a>
        <a href="/admin" className="font-semibold text-maroon-800 hover:underline">Settings</a>
        <span className="text-neutral-500">Protected</span>
      </div>
    </div>
  );
}
```

**Step 2: Verify visually**

Run `npm run dev` and visit `http://localhost:3000/admin`. Confirm "Orders" and "Settings" links appear in the header.

**Step 3: Commit**

```bash
git add app/admin/components/AdminHeader.tsx
git commit -m "feat: add Orders nav link to AdminHeader"
```

---

### Task 2: Create the KanbanBoard component

**Files:**
- Create: `app/admin/orders/KanbanBoard.tsx`

**Context:**
This is the core client component. It:
1. Fetches all orders from `GET /api/admin/orders`
2. Splits them into 3 column groups by status
3. Renders draggable cards and droppable column containers
4. On drop, calls `PATCH /api/admin/orders/[id]` with the column's default status
5. Re-fetches after every status change

**Column definitions:**
- **Submitted**: statuses `["NEW"]`, drop sets status to `"NEW"`
- **Active**: statuses `["CONFIRMED", "IN_PROGRESS", "READY"]`, drop sets status to `"CONFIRMED"`
- **Done**: statuses `["DELIVERED", "SHIPPED"]`, drop sets status to `"DELIVERED"`

**Step 1: Create the file**

Create `app/admin/orders/KanbanBoard.tsx`:

```tsx
"use client";

import { useEffect, useState, DragEvent } from "react";
import { centsToUsd } from "@/lib/formatting";
import { Select } from "@/app/components/ui/Select";

type Order = {
  id: string;
  orderNumber: string;
  fullName: string;
  phone: string;
  fulfillment: string;
  requestedDate: string;
  subtotalCents: number;
  status: string;
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
    const r = await fetch("/api/admin/orders", { cache: "no-store" });
    const d = await r.json();
    setOrders(d.orders || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
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
          const colOrders = orders.filter((o) => col.statuses.includes(o.status as any));
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

                    {ACTIVE_STATUSES.includes(order.status as any) && (
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
```

**Step 2: Commit**

```bash
git add app/admin/orders/KanbanBoard.tsx
git commit -m "feat: add KanbanBoard client component with HTML5 drag-and-drop"
```

---

### Task 3: Create the `/admin/orders` page

**Files:**
- Create: `app/admin/orders/page.tsx`

**Context:**
This is a simple server component page shell that renders `AdminHeader` and `KanbanBoard`. No auth needed in the component — the existing `adminGuard` middleware handles API-level auth. The page itself should be accessible only when Basic Auth credentials are provided (same as `/admin`).

**Step 1: Create the page file**

Create `app/admin/orders/page.tsx`:

```tsx
import { AdminHeader } from "@/app/admin/components/AdminHeader";
import { KanbanBoard } from "./KanbanBoard";

export default function AdminOrdersPage() {
  return (
    <main className="mx-auto max-w-screen-xl px-4 py-10">
      <AdminHeader title="Orders" />
      <KanbanBoard />
    </main>
  );
}
```

**Step 2: Verify the page renders**

Run `npm run dev` and visit `http://localhost:3000/admin/orders`. Confirm:
- Header shows "Orders" title with nav links
- 3 columns render: Submitted, Active, Done
- Existing orders appear in the correct column
- Dragging a card to another column updates its status and moves it

**Step 3: Test the Active column dropdown**

Move a card to the Active column. Confirm the sub-status dropdown appears with `CONFIRMED`, `IN_PROGRESS`, `READY` options. Change it and confirm the status updates without moving the card to a different column.

**Step 4: Commit**

```bash
git add app/admin/orders/page.tsx
git commit -m "feat: add /admin/orders kanban page"
```
