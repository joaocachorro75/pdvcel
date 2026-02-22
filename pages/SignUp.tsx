import React, { useState } from 'react';
import { Smartphone, Lock, Store, Check, ChevronLeft, AlertCircle } from 'lucide-react';

const SignUp: React.FC = () => {
  const [step, setStep] = useState(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [shopName, setShopName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const formatWhatsapp = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const cleanWhatsapp = whatsapp.replace(/\D/g, '');
      if (cleanWhatsapp.length < 10 || cleanWhatsapp.length > 11) {
        setError('Digite um WhatsApp válido com DDD');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!shopName.trim()) {
        setError('Digite o nome da sua loja');
        return;
      }
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: whatsapp.replace(/\D/g, ''),
          shop_name: shopName,
          password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('pdv_tenant', JSON.stringify(data.tenant));
        setSuccess(true);
      } else {
        setError(data.error || 'Erro ao criar conta');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Conta criada!</h1>
          <p className="text-indigo-200 mb-8">Sua loja está pronta para começar a vender.</p>
          <a
            href="/login"
            className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-colors"
          >
            Fazer Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                s <= step ? 'bg-white text-indigo-600' : 'bg-white/20 text-white/60'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-16 h-1 mx-2 rounded transition-colors ${
                s < step ? 'bg-white' : 'bg-white/20'
              }`} />}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm mb-5">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {/* Step 1: WhatsApp */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Seu WhatsApp</h2>
                  <p className="text-slate-500 mt-2">Usaremos para entrar na sua conta</p>
                </div>

                <div>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={whatsapp}
                    onChange={e => setWhatsapp(formatWhatsapp(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-800 text-center text-lg placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
                >
                  Continuar
                </button>
              </div>
            )}

            {/* Step 2: Shop Name */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Nome da Loja</h2>
                  <p className="text-slate-500 mt-2">Seus clientes verão esse nome</p>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Ex: Mercadinho do João"
                    value={shopName}
                    onChange={e => setShopName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-800 text-center text-lg placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={20} /> Voltar
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Password */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">Crie uma senha</h2>
                  <p className="text-slate-500 mt-2">Mínimo 4 caracteres</p>
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-800 text-center text-lg placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 text-slate-800 text-center text-lg placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={20} /> Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Conta'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <span className="text-slate-500 text-sm">Já tem conta? </span>
            <a href="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
              Fazer login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
