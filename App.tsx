import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import SalesHistory from './pages/SalesHistory';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';

interface Tenant {
  id: string;
  whatsapp: string;
  shop_name: string;
  shop_logo: string;
  pix_key?: string;
  plan: string;
  status: string;
  isSuperAdmin?: boolean;
}

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
    color: 'white',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  }}>
    <div style={{
      width: 60,
      height: 60,
      border: '4px solid rgba(255,255,255,0.1)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    <p style={{ marginTop: 20, opacity: 0.7, fontSize: 14 }}>Carregando PdvCel...</p>
  </div>
);

const App: React.FC = () => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // Failsafe timeout
      const timeout = setTimeout(() => {
        if (isLoading) setIsLoading(false);
      }, 3000);

      try {
        const savedTenant = localStorage.getItem('pdv_tenant');
        if (savedTenant) {
          const parsed = JSON.parse(savedTenant);
          setTenant(parsed);
        }
      } catch (error) {
        console.error("Erro ao carregar sessão");
        localStorage.removeItem('pdv_tenant');
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handleLogin = (loggedTenant: Tenant) => {
    setTenant(loggedTenant);
    localStorage.setItem('pdv_tenant', JSON.stringify(loggedTenant));
  };

  const handleLogout = () => {
    setTenant(null);
    localStorage.removeItem('pdv_tenant');
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/cadastro" element={<SignUp />} />
        <Route 
          path="/login" 
          element={
            tenant ? 
            <Navigate to={tenant.isSuperAdmin ? "/superadmin" : "/app"} replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />

        {/* SuperAdmin */}
        <Route 
          path="/superadmin" 
          element={
            tenant?.isSuperAdmin ? 
            <SuperAdmin /> : 
            <Navigate to="/login" replace />
          } 
        />
        
        {/* App Routes */}
        <Route 
          path="/app" 
          element={
            tenant && !tenant.isSuperAdmin ? 
            <Layout tenant={tenant} onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="vender" element={<POS />} />
          <Route path="estoque" element={<Inventory />} />
          <Route path="vendas" element={<SalesHistory />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
