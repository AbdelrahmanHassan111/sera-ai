import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '@/components/ui/Toast';
import { Navbar } from '@/components/layout/Navbar';
import { ParticleField } from '@/components/background/ParticleField';
import { FloatingElements3D } from '@/components/background/FloatingElements3D';
import { useAppStore } from '@/store/useAppStore';

// Routes
import { LandingPage } from '@/routes/LandingPage';
import { Onboarding } from '@/routes/Onboarding';
import { UploadGenetics } from '@/routes/UploadGenetics';
import { ManualEntry } from '@/routes/ManualEntry';
import { Dashboard } from '@/routes/Dashboard';
import { Recommendations } from '@/routes/Recommendations';
import { Chat } from '@/routes/Chat';
import { LifestylePlanner } from '@/routes/LifestylePlanner';
import { Settings } from '@/routes/Settings';
import { GeminiTest } from '@/routes/GeminiTest';

function App() {
  const { consentGiven, onboardingCompleted } = useAppStore();

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!consentGiven) {
      return <Navigate to="/" replace />;
    }
    if (!onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
  };

  return (
    <ToastProvider>
      <Router>
        <div className="min-h-screen bg-bg relative overflow-hidden">
          {/* Background Effects */}
          <div className="fixed inset-0 z-0">
            <ParticleField />
            <FloatingElements3D />
          </div>
          
          {/* Main Content */}
          <div className="relative z-10 min-h-screen">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <UploadGenetics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manual"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <ManualEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Recommendations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lifestyle"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <LifestylePlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Settings />
                </ProtectedRoute>
              }
            />
            
            {/* Gemini Test Page - Hidden route for debugging */}
            <Route
              path="/gemini-test"
              element={
                <>
                  <Navbar />
                  <GeminiTest />
                </>
              }
            />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;

