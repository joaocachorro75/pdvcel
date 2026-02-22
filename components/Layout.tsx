import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  History, 
  Settings as SettingsIcon,
  LogOut,
  Crown
} from 'lucide-react';

interface Tenant {
  id: string;
  shop_name: string;
  shop_logo: string;
  plan?: string;
  isImpersonating?: boolean;
}

interface LayoutProps {
  tenant: Tenant;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ tenant, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isImpersonating = tenant.isImpersonating || localStorage.getItem('pdv_impersonating') === 'true';

  const handleBackToAdmin = () => {
    localStorage.removeItem('pdv_impersonating');
    localStorage.setItem('pdv_tenant', JSON.stringify({
      id: 'superadmin',
      whatsapp: '00000000000',
      shop_name: 'To-Ligado.com',
      shop_logo: 'https://to-ligado.com/logo.png',
      plan: 'superadmin',
      isSuperAdmin: true
    }));
    window.location.href = '/superadmin';
  };

  const menuItems = [
    { name: 'Início', path: '/app', icon: LayoutDashboard },
    { name: 'Vender', path: '/app/vender', icon: ShoppingCart },
    { name: 'Estoque', path: '/app/estoque', icon: Package },
    { name: 'Vendas', path: '/app/vendas', icon: History },
    { name: 'Ajustes', path: '/app/configuracoes', icon: SettingsIcon },
  ];

  return (
    <div className="app-no-scroll flex flex-col bg-slate-50 pb-20">
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="bg-indigo-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[60]">
          <div className="flex items-center gap-2 text-sm">
            <Crown size={16} />
            <span>Você está acessando como <strong>{tenant.shop_name}</strong></span>
          </div>
          <button
            onClick={handleBackToAdmin}
            className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-bold transition-colors"
          >
            ← Voltar ao Admin
          </button>
        </div>
      )}

      {/* Header Fixo */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img 
            src={tenant.shop_logo} 
            alt="Logo" 
            className="w-8 h-8 rounded-lg object-cover shadow-sm" 
            onError={e => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png'; }}
          />
          <span className="font-bold text-slate-800 truncate max-w-[180px] text-sm italic uppercase tracking-tight">
            {tenant.shop_name}
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
      <main className="flex-1 p-4 overflow-x-hidden overflow-y-auto">
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
