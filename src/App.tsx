import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Demo from "./pages/Demo";
import DrivingLicenseService from "./pages/DrivingLicenseService";
import DrivingSimulator from "./pages/DrivingSimulator";
import IncomeCertificateService from "./pages/IncomeCertificateService";
import VoiceTest from "./pages/VoiceTest";
import NotificationPage from "./pages/NotificationPage";
import PushNotificationAdmin from "./pages/PushNotificationAdmin";
import PaymentPage from "./pages/PaymentPage";
import AdminPage from "./pages/AdminPage";
import CitizensPage from "./pages/CitizensPage";
import DashboardPage from "./pages/DashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import DataViewer from "./pages/DataViewer";
import NotFound from "./pages/NotFound";
import AISahayak from "./components/AISahayak";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <LanguageProvider>
      <NotificationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/services/driving-license" element={<DrivingLicenseService />} />
                <Route path="/services/driving-simulator" element={<DrivingSimulator />} />
                <Route path="/services/income-certificate" element={<IncomeCertificateService />} />
                <Route path="/voice-test" element={<VoiceTest />} />
                <Route path="/notifications" element={<NotificationPage />} />
                <Route path="/push-admin" element={<PushNotificationAdmin />} />
                <Route path="/payments" element={<PaymentPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/data-viewer" element={<DataViewer />} />
                <Route path="/citizens" element={<CitizensPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/feedback/:applicationId" element={<FeedbackPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            {/* AI Sahayak - Available on all pages */}
            <AISahayak />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </NotificationProvider>
  </LanguageProvider>
</ThemeProvider>
);

export default App;
