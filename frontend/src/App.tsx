import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { getSessionId } from "@/lib/session";
import { useEffect } from "react";

import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Result from "@/pages/result";
import PublicResult from "@/pages/public-result";
import NotFound from "@/pages/not-found";

function Router() {
  // Initialize session on app load
  useEffect(() => {
    // Generate session ID if not exists
    const sessionId = getSessionId();
    console.log("Session initialized:", sessionId.substring(0, 8) + "...");
  }, []);

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/result/:id" component={Result} />
        <Route path="/public/:token" component={PublicResult} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
