import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "./pages/NotFound.tsx";
import MobileShell from "./components/MobileShell";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import Guide from "./pages/Guide";
import Profile from "./pages/Profile";
import DestinationDetail from "./pages/DestinationDetail";
import ZoneSimulator from "./pages/ZoneSimulator";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MobileShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/destination/:slug" element={<DestinationDetail />} />
            <Route path="/zone/:zoneId" element={<ZoneSimulator />} />
          </Route>
          <Route path="/index" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
