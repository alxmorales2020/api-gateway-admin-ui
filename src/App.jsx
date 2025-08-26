import { BrowserRouter, NavLink } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes";

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <div className="border-b">
          <nav className="max-w-5xl mx-auto p-4 flex gap-4">
            <NavLink to="/" className="text-sm">Dashboard</NavLink>
            <NavLink to="/routes" className="text-sm">Routes</NavLink>
          </nav>
        </div>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}