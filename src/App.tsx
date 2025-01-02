import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MusicSessionProvider } from "./contexts/MusicSessionContext";
import Index from "./pages/Index";
import Session from "./pages/Session";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MusicSessionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/session/:sessionId" element={<Session />} />
          </Routes>
        </BrowserRouter>
      </MusicSessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;