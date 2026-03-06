# Admin Kanban Orders Page — Design

**Date:** 2026-03-05

## Summary

Add a new page at `/admin/orders` showing all orders in a kanban-style board. Admins can drag cards between columns to update order status, and use a dropdown within the Active column for sub-status changes.

## Route

`app/admin/orders/page.tsx` — new page, protected by existing admin auth (Basic Auth via `adminGuard`).

## Columns

| Column     | Statuses shown               | Drop sets status to |
|------------|------------------------------|---------------------|
| Submitted  | NEW                          | NEW                 |
| Active     | CONFIRMED, IN_PROGRESS, READY | CONFIRMED          |
| Done       | DELIVERED, SHIPPED           | DELIVERED           |

## Components

- `app/admin/orders/page.tsx` — page shell, renders `KanbanBoard`
- `app/admin/orders/KanbanBoard.tsx` — client component with full board logic

## Card Content

Each card displays:
- Order number
- Customer name and phone
- Fulfillment type
- Requested date
- Subtotal

Cards in the **Active** column additionally show a dropdown to change between `CONFIRMED`, `IN_PROGRESS`, and `READY`.

## Drag & Drop

- HTML5 native drag-and-drop (`draggable` attribute), no extra dependencies
- `dragstart`: store order ID in `dataTransfer`
- `dragover`: prevent default to allow drop
- `drop`: read order ID, call `PATCH /api/admin/orders/[id]` with the column's default status, re-fetch orders

## Data

- Fetch: `GET /api/admin/orders` — existing endpoint, returns all orders
- Update: `PATCH /api/admin/orders/[id]` — existing endpoint, accepts `{ status }`
- Board re-fetches after every status change

## Navigation

Add an "Orders" link to `AdminHeader` pointing to `/admin/orders`.
