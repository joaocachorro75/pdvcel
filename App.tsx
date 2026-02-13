
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import SalesHistory from './pages/SalesHistory';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/Layout';
import { Product, Sale, Settings } from './types';

const INITIAL_SETTINGS: Settings = {
  shopName: 'SmartPDV Carregando...',
  shopLogo: 'https://picsum.photos/seed/shop/200/200',
  adminPassword: 'admin',
  pixKey: ''
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do Banco JSON ao iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/db');
        const data = await response.json();
        
        if (data.settings) setSettings(data.settings);
        if (data.products) localStorage.setItem('pdv_products', JSON.stringify(data.products));
        if (data.sales) localStorage.setItem('pdv_sales', JSON.stringify(data.sales));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao carregar banco JSON:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sincronizar qualquer mudança de volta para o servidor
  const syncWithServer = async (newSettings?: Settings) => {
    const currentSettings = newSettings || settings;
    const products = JSON.parse(localStorage.getItem('pdv_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('pdv_sales') || '[]');
    
    try {
      await fetch('/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: currentSettings,
          products,
          sales
        })
      });
    } catch (error) {
      console.error("Erro na sincronização:", error);
    }
  };

  const handleLogin = (password: string) => {
    if (password.trim() === settings.adminPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const updateSettings = (newSettings: Settings | ((prev: Settings) => Settings)) => {
    setSettings(prev => {
      const next = typeof newSettings === 'function' ? newSettings(prev) : newSettings;
      localStorage.setItem('pdv_settings', JSON.stringify(next));
      // Dispara sync após o update do estado
      setTimeout(() => syncWithServer(next), 100);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-600 text-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold">Iniciando SmartPDV...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <Login onLogin={handleLogin} shopName={settings.shopName} shopLogo={settings.shopLogo} />
          } 
        />
        
        <Route element={isAuthenticated ? <Layout settings={settings} onLogout={handleLogout} /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/vender" element={<POS settings={settings} onSaleComplete={() => syncWithServer()} />} />
          <Route path="/estoque" element={<Inventory onUpdate={() => syncWithServer()} />} />
          <Route path="/vendas" element={<SalesHistory settings={settings} />} />
          <Route path="/configuracoes" element={<SettingsPage settings={settings} setSettings={updateSettings as any} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
