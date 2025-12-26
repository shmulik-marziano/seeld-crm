import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RecentCustomers from "./components/layout/RecentCustomers";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import ServiceIndividuals from "./pages/ServiceIndividuals";
import ServiceAgents from "./pages/ServiceAgents";
import ServiceAI from "./pages/ServiceAI";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ClientAuth from "./pages/auth/ClientAuth";
import AgentAuth from "./pages/auth/AgentAuth";
import AgentDashboard from "./pages/dashboard/AgentDashboard";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import AgentCommandCenter from "./pages/agent/AgentCommandCenter";
import ClientOnboarding from "./pages/agent/ClientOnboarding";
import CommissionsDashboard from "./pages/agent/CommissionsDashboard";
import CustomerCard from "./pages/agent/CustomerCard";
import ProcessManagement from "./pages/agent/ProcessManagement";
import AgentSettings from "./pages/agent/AgentSettings";
import CustomerPortfolio from "./pages/agent/CustomerPortfolio";
import DataImport from "./pages/agent/DataImport";
import DocumentWorkflow from "./pages/DocumentWorkflow";
import ProfileEdit from "./pages/ProfileEdit";
import LeadsManagement from "./pages/dashboard/LeadsManagement";
import PoliciesManagement from "./pages/dashboard/PoliciesManagement";
import Notifications from "./pages/dashboard/Notifications";
import Analytics from "./pages/dashboard/Analytics";
import Recommendations from "./pages/dashboard/Recommendations";
import RecommendationTracking from "./pages/dashboard/RecommendationTracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <RecentCustomers />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/individuals" element={<ServiceIndividuals />} />
              <Route path="/services/agents" element={<ServiceAgents />} />
              <Route path="/services/seeld-ai" element={<ServiceAI />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/client/auth" element={<ClientAuth />} />
              <Route path="/client/dashboard" element={<ClientDashboard />} />
              <Route path="/agent/auth" element={<AgentAuth />} />
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/agent/command-center" element={<AgentCommandCenter />} />
              <Route path="/agent/onboard-client" element={<ClientOnboarding />} />
              <Route path="/agent/commissions" element={<CommissionsDashboard />} />
              <Route path="/agent/leads" element={<LeadsManagement />} />
              <Route path="/agent/customer/:id" element={<CustomerCard />} />
              <Route path="/agent/processes" element={<ProcessManagement />} />
              <Route path="/agent/settings" element={<AgentSettings />} />
              <Route path="/agent/customer/:clientId/portfolio" element={<CustomerPortfolio />} />
              <Route path="/agent/data-import" element={<DataImport />} />
              <Route path="/agent/documents" element={<DocumentWorkflow />} />
              <Route path="/profile/edit" element={<ProfileEdit />} />
              <Route path="/client/policies" element={<PoliciesManagement />} />
              <Route path="/client/notifications" element={<Notifications />} />
          <Route path="/client/analytics" element={<Analytics />} />
          <Route path="/client/recommendations" element={<Recommendations />} />
          <Route path="/client/recommendation-tracking" element={<RecommendationTracking />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
