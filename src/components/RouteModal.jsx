import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateRouteMutation } from "../api/routes";

const schema = z.object({
  path: z.string().min(1),
  methods: z.string().min(1), // comma-separated in UI, converted below
  upstream: z.string().url(),
  strip_prefix: z.boolean().optional(),
  plugins: z.string().optional(), // comma-separated in UI, converted below
});

export default function RouteModal({ onSuccess }) {
  const { mutateAsync, isPending } = useCreateRouteMutation();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      path: "/*",
      methods: "GET",
      upstream: "http://localhost:8000",
      strip_prefix: true,
      plugins: "logging",
    },
  });

  async function onSubmit(values) {
    const payload = {
      path: values.path.trim(),
      methods: values.methods.split(",").map(s => s.trim()).filter(Boolean),
      upstream: values.upstream.trim(),
      strip_prefix: !!values.strip_prefix,
      plugins: (values.plugins ?? "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
    };
    await mutateAsync(payload);
    onSuccess?.();
    reset({ ...values, path: "", methods: "GET", plugins: "" });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="text-sm">Path</label>
        <input className="w-full border rounded p-2" {...register("path")} placeholder="/service/*" />
        {errors.path && <p className="text-red-500 text-sm">{errors.path.message}</p>}
      </div>

      <div>
        <label className="text-sm">Methods (comma-separated)</label>
        <input className="w-full border rounded p-2" {...register("methods")} placeholder="GET,POST" />
        {errors.methods && <p className="text-red-500 text-sm">{errors.methods.message}</p>}
      </div>

      <div>
        <label className="text-sm">Upstream</label>
        <input className="w-full border rounded p-2" {...register("upstream")} placeholder="http://localhost:8000" />
        {errors.upstream && <p className="text-red-500 text-sm">{errors.upstream.message}</p>}
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register("strip_prefix")} />
        Strip prefix
      </label>

      <div>
        <label className="text-sm">Plugins (comma-separated)</label>
        <input className="w-full border rounded p-2" {...register("plugins")} placeholder="logging,rate_limit" />
      </div>

      <button
        className="px-3 py-2 rounded bg-black text-white disabled:opacity-50"
        disabled={isPending}
      >
        {isPending ? "Creating…" : "Create"}
      </button>
    </form>
  );
}

// Named export: simple accessible modal wrapper that hosts the RouteModal
export function CreateRouteModal({ open, onClose }) {
    useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" 
      onClick={onClose} 
    >
      <div className="w-full max-w-lg rounded-xl border bg-gray-950 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">Create Route</h2>
          <button className="text-sm text-gray-400" onClick={onClose}>X</button>
        </div>
        <RouteModal onSuccess={onClose} />
      </div>
    </div>
  );
}