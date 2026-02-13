
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

const DEFAULT_SETTINGS: Settings = {
  shopName: 'MEU PDV MODERNO',
  shopLogo: 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png',
  adminPassword: 'admin',
  pixKey: 'seu-pix-aqui@pix.com'
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Inicialização: Tenta carregar do Servidor, senão usa LocalStorage
  useEffect(() => {
    const initApp = async () => {
      try {
        const response = await fetch('/api/db');
        if (response.ok) {
          const data = await response.json();
          if (data.settings) setSettings(data.settings);
          if (data.products) localStorage.setItem('pdv_products', JSON.stringify(data.products));
          if (data.sales) localStorage.setItem('pdv_sales', JSON.stringify(data.sales));
          console.log("Dados sincronizados com o servidor.");
        } else {
          loadFromLocal();
        }
      } catch (error) {
        console.warn("Servidor não detectado (modo local/preview).");
        loadFromLocal();
      } finally {
        setIsLoading(false);
      }
    };

    const loadFromLocal = () => {
      const savedSettings = localStorage.getItem('pdv_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    };

    initApp();
  }, []);

  // 2. Sincronização: Salva dados no servidor quando houver mudanças importantes
  const syncWithServer = async (updatedSettings?: Settings) => {
    const currentSettings = updatedSettings || settings;
    const products = JSON.parse(localStorage.getItem('pdv_products') || '[]');
    const sales = JSON.parse(localStorage.getItem('pdv_sales') || '[]');
    
    // Salva no local por garantia imediata
    localStorage.setItem('pdv_settings', JSON.stringify(currentSettings));

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
      console.log("Mudanças salvas no servidor.");
    } catch (error) {
      console.warn("Falha ao sincronizar com servidor (venda salva apenas localmente).");
    }
  };

  const handleLogin = (password: string) => {
    if (password === settings.adminPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    syncWithServer(newSettings);
  };

  if (isLoading) return null; // O HTML já tem um loader básico

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
