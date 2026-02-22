import React, { useState } from 'react';
import { 
  Smartphone, 
  User, 
  Mail, 
  Lock, 
  Store,
  Phone,
  Eye,
  EyeOff,
  ChevronLeft,
  Check
} from 'lucide-react';

const SignUp: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    storeName: '',
    password: '',
    plan: 'profissional'
  });

  const plans = [
    { id: 'iniciante', name: 'Iniciante', price: 29 },
    { id: 'profissional', name: 'Profissional', price: 59 },
    { id: 'empresarial', name: 'Empresarial', price: 99 }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    
    // TODO: Implementar cadastro real
    setTimeout(() => {
      alert('Cadastro realizado com sucesso! (demo)');
      setLoading(false);
      window.location.href = '/login';
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Header */}
      <header className="p-4">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <a href="/" className="p-2 hover:bg-white rounded-xl transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </a>
          <span className="font-bold text-slate-800">Criar conta</span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-md mx-auto px-4 mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div 
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-indigo-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Passo {step} de 3
        </p>
      </div>

      {/* Form */}
      <div className="max-w-md mx-auto px-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Step 1: Dados pessoais */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Seus dados</h2>
                <p className="text-slate-500">Precisamos de algumas informações para criar sua conta</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seu nome</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="email"
                      required
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Dados da loja */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Sua loja</h2>
                <p className="text-slate-500">Como sua loja vai se chamar?</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome da loja</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Mercadinho do João"
                      value={formData.storeName}
                      onChange={e => setFormData({ ...formData, storeName: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-base"
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
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-base"
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
              </div>
            </div>
          )}

          {/* Step 3: Escolher plano */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Escolha seu plano</h2>
                <p className="text-slate-500">Você pode mudar de plano a qualquer momento</p>
              </div>
              
              <div className="space-y-3">
                {plans.map(plan => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: plan.id })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      formData.plan === plan.id 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800">{plan.name}</p>
                        <p className="text-sm text-slate-500">R$ {plan.price}/mês</p>
                      </div>
                      {formData.plan === plan.id && (
                        <Check className="w-6 h-6 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-xs text-slate-400 text-center">
                ✓ Teste grátis por 7 dias ✓ Cancele quando quiser
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3 pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : step === 3 ? 'Criar minha conta' : 'Continuar'}
            </button>
            
            {step > 1 && (
              <button 
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-full py-4 text-slate-600 font-medium"
              >
                Voltar
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Já tem uma conta? <a href="/login" className="text-indigo-600 font-medium">Entrar</a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
