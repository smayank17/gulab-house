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