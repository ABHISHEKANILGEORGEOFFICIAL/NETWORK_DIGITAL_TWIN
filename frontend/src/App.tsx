import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TopologyPage } from './pages/TopologyPage';
import { DevicesPage } from './pages/DevicesPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { InterfacesPage } from './pages/InterfacesPage';
import { HealthPage } from './pages/HealthPage';
import { TrafficPage } from './pages/TrafficPage';
import { AlertsPage } from './pages/AlertsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { SimulationPage } from './pages/SimulationPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { PathAnalysisPage } from './pages/PathAnalysisPage';
import { ConfigurationPage } from './pages/ConfigurationPage';
import { ManagementPage } from './pages/ManagementPage';
import { InventoryPage } from './pages/InventoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0B1120] flex items-center justify-center text-cyan-400 font-mono">
        Loading NetTwin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <Routes>
            {/* Public Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Dashboard Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="topology" element={<TopologyPage />} />
              <Route path="devices" element={<DevicesPage />} />
              <Route path="devices/:id" element={<DeviceDetailPage />} />
              <Route path="interfaces" element={<InterfacesPage />} />
              <Route path="health" element={<HealthPage />} />
              <Route path="traffic" element={<TrafficPage />} />
              <Route path="alerts" element={<AlertsPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="digital-twin" element={<DigitalTwinPage />} />
              <Route path="simulation" element={<SimulationPage />} />
              <Route path="what-if" element={<WhatIfPage />} />
              <Route path="path-analysis" element={<PathAnalysisPage />} />
              <Route path="configuration" element={<ConfigurationPage />} />
              <Route path="management" element={<ManagementPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
