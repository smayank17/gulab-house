import { AdminHeader } from "@/app/admin/components/AdminHeader";
import { SettingsForm } from "@/app/admin/components/SettingsForm";

export default function AdminSettingsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <AdminHeader title="Settings" />
      <SettingsForm />
      <div className="mt-8 text-sm text-neutral-600">
        Back to <a className="font-semibold text-maroon-800 hover:underline" href="/admin">Orders</a>
      </div>
    </main>
  );
}