import { useEffect, useMemo, useState } from "react";
import { useRoutesQuery, useDeleteRouteMutation } from "../api/routes";
import { CreateRouteModal } from "./RouteModal";

export default function RouteTable() {
  const { data, isLoading, isError, error } = useRoutesQuery();
  const { mutateAsync: remove, isPending: deleting } = useDeleteRouteMutation();

  const routes = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Selection state for bulk deletion
  const [selected, setSelected] = useState(() => new Set());
  useEffect(() => {
    setSelected(new Set());
  }, [routes.length]);

  const allIds = useMemo(
    () => routes.map((r) => r.id || r._id).filter(Boolean),
    [routes]
  );
  const allSelected = selected.size > 0 && selected.size === allIds.length;
  const someSelected = selected.size > 0 && selected.size < allIds.length;

  function toggleOne(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
  }

  async function bulkDelete() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected route(s)?`)) return;
    const ids = Array.from(selected);
    for (const id of ids) { try { await remove(id); } catch {} }
    setSelected(new Set());
  }

  // Modal state
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      {/* Header with title and bulk actions */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Routes</h1>
        <div className="flex items-center gap-2">
          <button
            className="rounded border px-3 py-2 text-sm disabled:opacity-50"
            onClick={bulkDelete}
            disabled={selected.size === 0 || deleting}
            aria-disabled={selected.size === 0}
            title={selected.size === 0 ? "Select rows to enable" : "Delete selected"}
          >
            Delete Selected ({selected.size})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-[900px] w-full border-collapse">
          <thead className="bg-gray-900/40">
            <tr className="[&>th]:text-left [&>th]:px-4 [&>th]:py-3">
              <th className="w-[44px]">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  ref={(el) => el && (el.indeterminate = someSelected)}
                  onChange={toggleAll}
                />
              </th>
              <th>Path</th>
              <th>Methods</th>
              <th>Upstream</th>
              <th>Strip Prefix</th>
              <th>Plugins</th>
              <th className="text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:px-4 [&>tr>td]:py-3">
            {isLoading && (
              <tr className="border-t"><td colSpan={7}>Loading…</td></tr>
            )}
            {isError && (
              <tr className="border-t"><td colSpan={7} className="text-red-500">Error loading routes: {String(error?.message ?? "failed")}</td></tr>
            )}
            {!isLoading && !isError && routes.length === 0 && (
              <tr className="border-t"><td colSpan={7} className="text-gray-400">No routes found.</td></tr>
            )}
            {routes.map((r) => {
              const id = r.id || r._id;
              const checked = id ? selected.has(id) : false;
              return (
                <tr key={id || r.path + r.upstream} className="border-t">
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.path}`}
                      checked={checked}
                      onChange={() => id && toggleOne(id)}
                      disabled={!id}
                    />
                  </td>
                  <td className="font-mono">{r.path}</td>
                  <td className="space-x-1">{(r.methods || []).join(", ")}</td>
                  <td className="truncate">{r.upstream}</td>
                  <td>{r.strip_prefix ? "✓" : "—"}</td>
                  <td className="space-x-1">{(r.plugins || []).join(", ")}</td>
                  <td className="text-right">
                    <button
                      className="text-red-500 hover:underline disabled:opacity-50"
                      onClick={async () => {
                        if (!id) return alert("Missing id on record");
                        if (!confirm(`Delete route ${r.path}?`)) return;
                        await remove(id);
                      }}
                      disabled={deleting}
                      aria-label={`Delete route ${r.path}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
            {deleting && (
              <tr className="border-t"><td colSpan={7} className="text-sm text-gray-500">Deleting route…</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sticky full-width Create button aligned with table/container width */}
      <div className="sticky bottom-0 mt-4">
        <div className="mx-auto max-w-6xl">
          <button
            className="w-full rounded-lg bg-black px-4 py-3 text-white shadow-lg disabled:opacity-50"
            onClick={() => setOpen(true)}
          >
            Create
          </button>
        </div>
      </div>

      <CreateRouteModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}