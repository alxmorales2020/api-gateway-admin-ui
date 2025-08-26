import { api } from "./client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function fetchRoutes() {
  return api.get("/routes").then(response => response.data);
}
export function createRoute(payload) {
  return api.post("/routes", payload).then(response => response.data);
}
export function deleteRoute(id) {
  return api.delete(`/routes/${id}`).then(response => response.data);
}

export function useRoutesQuery() {
  return useQuery({ queryKey: ["routes"], queryFn: fetchRoutes });
}

export function useCreateRouteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createRoute,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });
}

export function useDeleteRouteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["routes"] }),
  });
}