import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InspectionPage from "@/pages/inspection";
import TwoPhaseInspectionPage from "@/pages/two-phase-inspection";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TwoPhaseInspectionPage} />
      <Route path="/two-phase/:orderNumber?" component={TwoPhaseInspectionPage} />
      <Route path="/inspection/:orderNumber?" component={InspectionPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
