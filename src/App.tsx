import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/useAuth";
import { GreenhouseProvider } from "@/contexts/GreenhouseContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const GreenhouseViewPage = lazy(() => import("./pages/GreenhouseViewPage"));
const GreenhouseSettingsPage = lazy(
  () => import("./pages/GreenhouseSettingsPage"),
);
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const AiChatPage = lazy(() => import("./pages/AiChatPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AuthBootstrapScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthBootstrapScreen />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route wrapper (redirects to dashboard if logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthBootstrapScreen />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<AuthBootstrapScreen />}>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistant"
          element={
            <ProtectedRoute>
              <AiChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/greenhouse/:id"
          element={
            <ProtectedRoute>
              <GreenhouseViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/greenhouse/:id/assistant"
          element={
            <ProtectedRoute>
              <AiChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/greenhouse/:id/settings"
          element={
            <ProtectedRoute>
              <GreenhouseSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/greenhouse/:id/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
      <AuthProvider>
        <GreenhouseProvider>
          <TooltipProvider>
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </GreenhouseProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
