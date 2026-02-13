
import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (password: string) => boolean;
  shopName: string;
  shopLogo: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, shopName, shopLogo }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError('');
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  const handleResetData = () => {
    if (confirm('Deseja resetar o sistema para as configurações de fábrica? Isso limpará a senha customizada e voltará para "admin". Seus produtos e vendas NÃO serão apagados.')) {
      const savedSettings = localStorage.getItem('pdv_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        settings.adminPassword = 'admin';
        localStorage.setItem('pdv_settings', JSON.stringify(settings));
        alert('Senha resetada para "admin".');
        window.location.reload();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-4 bg-indigo-50 rounded-2xl mb-4">
              <img src={shopLogo} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">{shopName}</h1>
            <p className="text-slate-500 text-sm mt-1">Acesso Administrativo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  readOnly
                  value="admin"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 bg-slate-50 rounded-lg text-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                <AlertCircle size={12} />
                Dica: A senha padrão é <span className="font-bold">admin</span>
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-red-500 text-sm font-medium text-center">{error}</p>
                <button 
                  type="button"
                  onClick={handleResetData}
                  className="w-full text-[10px] text-red-400 hover:text-red-600 underline mt-1"
                >
                  Esqueceu a senha? Resetar para padrão.
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center"
            >
              Entrar no Sistema
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-8">
            SmartPDV v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
