
import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings as SettingsIcon,
  LogOut
} from 'lucide-react';
import { Settings } from '../types';

interface LayoutProps {
  settings: Settings;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ settings, onLogout }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Início', path: '/', icon: LayoutDashboard },
    { name: 'Vender', path: '/vender', icon: ShoppingCart },
    { name: 'Estoque', path: '/estoque', icon: Package },
    { name: 'Vendas', path: '/vendas', icon: History },
    { name: 'Ajustes', path: '/configuracoes', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 pb-20">
      {/* Header Fixo */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src={settings.shopLogo} alt="Logo" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
          <span className="font-bold text-slate-800 truncate max-w-[180px] text-sm italic uppercase tracking-tight">
            {settings.shopName}
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
          title="Sair"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 p-4 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Navegação Inferior (Mobile Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-1 flex justify-around items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all ${
                isActive 
                  ? 'text-indigo-600' 
                  : 'text-slate-400'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {item.name}
              </span>
              {isActive && <div className="w-1 h-1 bg-indigo-600 rounded-full mt-0.5"></div>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
