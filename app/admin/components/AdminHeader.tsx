export function AdminHeader({ title }: { title: string }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <div className="text-xs font-semibold text-neutral-500">Gulab House Admin</div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
      </div>
      <div className="text-xs text-neutral-500">Protected</div>
    </div>
  );
}