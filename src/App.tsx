import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/contexts/I18nContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Elections from "./pages/Elections";
import Candidates from "./pages/Candidates";
import Schedule from "./pages/Schedule";
import Guidelines from "./pages/Guidelines";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import VoterLogin from "./pages/VoterLogin";
import AdminLogin from "./pages/AdminLogin";
import VotingPage from "./pages/VotingPage";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import SecurityPolicy from "./pages/SecurityPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout><Home /></Layout>} />
              <Route path="/about" element={<Layout><About /></Layout>} />
              <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
              <Route path="/elections" element={<Layout><Elections /></Layout>} />
              <Route path="/candidates" element={<Layout><Candidates /></Layout>} />
              <Route path="/schedule" element={<Layout><Schedule /></Layout>} />
              <Route path="/guidelines" element={<Layout><Guidelines /></Layout>} />
              <Route path="/faq" element={<Layout><FAQ /></Layout>} />
              <Route path="/contact" element={<Layout><Contact /></Layout>} />
              <Route path="/login" element={<Layout><VoterLogin /></Layout>} />
              <Route path="/admin-login" element={<Layout><AdminLogin /></Layout>} />
              <Route path="/vote" element={<Layout><VotingPage /></Layout>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Layout><NotFound /></Layout>} />
              <Route path="/privacy" element={<Layout><PrivacyPolicy /></Layout>} />
<Route path="/security-policy" element={<Layout><SecurityPolicy /></Layout>} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
