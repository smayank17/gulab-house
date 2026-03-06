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
