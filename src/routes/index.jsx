import { Routes, Route } from "react-router-dom";
import RoutesPage from "../pages/RoutesPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoutesPage />} />
      <Route path="/routes" element={<RoutesPage />} />
    </Routes>
  );
}