import React, { useState } from 'react';
import { 
  Smartphone, 
  Mail, 
  Lock, 
  Eye,
  EyeOff
} from 'lucide-react';

interface LoginProps {
  onLogin?: (email: string, password: string) => boolean;
  shopName?: string;
  shopLogo?: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, shopName, shopLogo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simular login
    setTimeout(() => {
      if (onLogin) {
        const success = onLogin(password);
        if (!success) {
          setError('E-mail ou senha incorretos');
        }
      } else {
        // Login demo - qualquer senha funciona
        localStorage.setItem('pdv_auth', 'true');
        window.location.href = '/';
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
              {shopLogo ? (
                <img src={shopLogo} alt={shopName} className="w-12 h-12 object-contain" />
              ) : (
                <Smartphone className="w-10 h-10 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-black text-slate-900">{shopName || 'PdvCel'}</h1>
            <p className="text-slate-500 mt-1">Sistema de Vendas Mobile</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Sua senha"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white text-base"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 mt-6"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-2">
            <a href="#" className="text-sm text-indigo-600 font-medium hover:underline">
              Esqueci minha senha
            </a>
            <p className="text-sm text-slate-500">
              Não tem conta? <a href="/cadastro" className="text-indigo-600 font-medium hover:underline">Criar conta grátis</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          © 2026 PdvCel - Um produto <a href="https://to-ligado.com" target="_blank" className="underline hover:text-white">To-Ligado.com</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
