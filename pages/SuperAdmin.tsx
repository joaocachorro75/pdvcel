import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Store, 
  DollarSign, 
  TrendingUp, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Check,
  Crown,
  Clock,
  Ban,
  CheckCircle,
  AlertCircle,
  Star,
  Settings,
  LogOut,
  Eye,
  CreditCard,
  AlertTriangle,
  PiggyBank,
  Calendar,
  Send,
  QrCode
} from 'lucide-react';

interface Tenant {
  id: string;
  whatsapp: string;
  shop_name: string;
  shop_logo: string;
  plan: string;
  status: string;
  created_at: number;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
  hidden?: boolean;
}

interface Subscription {
  id: string;
  tenant_id: string;
  plan: string;
  price: number;
  status: string;
  due_date: number;
  paid_at: number | null;
  payment_method: string | null;
  shop_name: string;
  whatsapp: string;
}

interface SystemConfig {
  payment_pix_key: string;
  payment_pix_name: string;
  payment_due_day: number;
  trial_days: number;
  reminder_days: number;
  reminder_enabled: number;
}

interface Finance {
  pending: { count: number; total: number };
  paid: { count: number; total: number };
  overdue: { count: number; total: number };
  thisMonth: { count: number; total: number };
  byPlan: { plan: string; count: number; total: number }[];
}

interface Stats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  parceiroTenants: number;
  totalSales: number;
  totalRevenue: number;
  mrr: number;
  planCounts: { plan: string; count: number }[];
}

const SuperAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clientes' | 'planos' | 'financeiro'>('clientes');
  const [stats, setStats] = useState<Stats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [finance, setFinance] = useState<Finance | null>(null);
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [search, setSearch] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewCharge, setShowNewCharge] = useState(false);
  const [newClient, setNewClient] = useState({ whatsapp: '', shop_name: '', password: '', plan: 'iniciante', status: 'active' });
  const [newCharge, setNewCharge] = useState({ tenant_id: '', plan: 'iniciante', price: 29, due_date: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, tenantsRes, plansRes, financeRes, subsRes, configRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/tenants'),
        fetch('/api/admin/plans'),
        fetch('/api/admin/finance'),
        fetch('/api/admin/subscriptions'),
        fetch('/api/admin/config')
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (tenantsRes.ok) setTenants((await tenantsRes.json()).tenants);
      if (plansRes.ok) setPlans((await plansRes.json()).plans);
      if (financeRes.ok) setFinance(await financeRes.json());
      if (subsRes.ok) setSubscriptions((await subsRes.json()).subscriptions);
      if (configRes.ok) setConfig((await configRes.json()).config);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTenant = async (tenantId: string, data: Partial<Tenant>) => {
    try {
      const res = await fetch(`/api/admin/tenant/${tenantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        await loadData();
        setEditingTenant(null);
      }
    } catch (err) {
      console.error('Erro ao atualizar:', err);
    }
  };

  const deleteTenant = async (tenantId: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente? Todos os dados serão perdidos.')) return;
    
    try {
      const res = await fetch(`/api/admin/tenant/${tenantId}`, { method: 'DELETE' });
      if (res.ok) await loadData();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    }
  };

  const createTenant = async () => {
    if (!newClient.whatsapp || !newClient.password) {
      alert('WhatsApp e senha são obrigatórios');
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: newClient.whatsapp.replace(/\D/g, ''),
          shop_name: newClient.shop_name || 'Minha Loja',
          password: newClient.password
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Atualizar plano e status se necessário
        if (newClient.plan !== 'iniciante' || newClient.status !== 'trial') {
          await fetch(`/api/admin/tenant/${data.tenant.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plan: newClient.plan, status: newClient.status })
          });
        }
        
        await loadData();
        setShowNewClient(false);
        setNewClient({ whatsapp: '', shop_name: '', password: '', plan: 'iniciante', status: 'active' });
      } else {
        alert(data.error || 'Erro ao criar cliente');
      }
    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      alert('Erro ao criar cliente');
    }
  };

  const createCharge = async () => {
    if (!newCharge.tenant_id || !newCharge.due_date) {
      alert('Selecione o cliente e a data de vencimento');
      return;
    }

    try {
      const res = await fetch('/api/admin/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: newCharge.tenant_id,
          plan: newCharge.plan,
          price: newCharge.price,
          due_date: new Date(newCharge.due_date).getTime()
        })
      });

      if (res.ok) {
        await loadData();
        setShowNewCharge(false);
        setNewCharge({ tenant_id: '', plan: 'iniciante', price: 29, due_date: '' });
      }
    } catch (err) {
      console.error('Erro ao criar cobrança:', err);
    }
  };

  const markAsPaid = async (subscriptionId: string) => {
    try {
      await fetch(`/api/admin/subscription/${subscriptionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', payment_method: 'pix' })
      });
      await loadData();
    } catch (err) {
      console.error('Erro ao marcar como pago:', err);
    }
  };

  const saveConfig = async (newConfig: SystemConfig) => {
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      setConfig(newConfig);
    } catch (err) {
      console.error('Erro ao salvar configurações:', err);
    }
  };

  const savePlans = async (updatedPlans: Plan[]) => {
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: updatedPlans })
      });
      
      if (res.ok) {
        setPlans(updatedPlans);
        setEditingPlan(null);
      }
    } catch (err) {
      console.error('Erro ao salvar planos:', err);
    }
  };

  const impersonateTenant = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/admin/impersonate/${tenantId}`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('pdv_tenant', JSON.stringify(data.tenant));
        localStorage.setItem('pdv_impersonating', 'true');
        window.location.href = '/app';
      }
    } catch (err) {
      console.error('Erro ao impersonar:', err);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    t.whatsapp.includes(search)
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle size={12} /> Ativo</span>;
      case 'trial':
        return <span className="flex items-center gap-1 text-amber-600 text-xs font-bold"><Clock size={12} /> Trial</span>;
      case 'blocked':
        return <span className="flex items-center gap-1 text-red-600 text-xs font-bold"><Ban size={12} /> Bloqueado</span>;
      default:
        return <span className="text-slate-400 text-xs">{status}</span>;
    }
  };

  const getPlanBadge = (plan: string) => {
    const planData = plans.find(p => p.id === plan);
    const colors: Record<string, string> = {
      iniciante: 'bg-slate-100 text-slate-700',
      profissional: 'bg-indigo-100 text-indigo-700',
      empresarial: 'bg-amber-100 text-amber-700',
      parceiro: 'bg-emerald-100 text-emerald-700'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold ${colors[plan] || 'bg-slate-100'}`}>
        {plan === 'parceiro' ? '⭐ Parceiro' : (planData?.name || plan)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">SuperAdmin</h1>
              <p className="text-slate-400 text-xs">PdvCel - To-Ligado.com</p>
            </div>
          </div>
          <a href="/" className="text-slate-400 hover:text-white text-sm flex items-center gap-2">
            <LogOut size={16} /> Sair
          </a>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`px-6 py-3 rounded-t-xl font-bold transition-colors ${
              activeTab === 'clientes' 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="inline w-4 h-4 mr-2" />
            Clientes
          </button>
          <button
            onClick={() => setActiveTab('planos')}
            className={`px-6 py-3 rounded-t-xl font-bold transition-colors ${
              activeTab === 'planos' 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="inline w-4 h-4 mr-2" />
            Planos
          </button>
          <button
            onClick={() => setActiveTab('financeiro')}
            className={`px-6 py-3 rounded-t-xl font-bold transition-colors ${
              activeTab === 'financeiro' 
                ? 'bg-slate-800 text-white' 
                : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="inline w-4 h-4 mr-2" />
            Financeiro
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* TAB: Clientes */}
        {activeTab === 'clientes' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Total Clientes</span>
                </div>
                <p className="text-3xl font-black text-white">{stats?.totalTenants || 0}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Store className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Ativos</span>
                </div>
                <p className="text-3xl font-black text-white">{stats?.activeTenants || 0}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Em Trial</span>
                </div>
                <p className="text-3xl font-black text-white">{stats?.trialTenants || 0}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <span className="text-slate-400 text-sm">MRR Previsto</span>
                </div>
                <p className="text-3xl font-black text-white">R$ {stats?.mrr || 0}</p>
              </div>
            </div>

            {/* Stats secundários */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400 text-sm">Parceiros</span>
                </div>
                <p className="text-xl font-bold text-white mt-1">{stats?.parceiroTenants || 0}</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-400 text-sm">Vendas Totais</span>
                </div>
                <p className="text-xl font-bold text-white mt-1">{stats?.totalSales || 0}</p>
              </div>

              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400 text-sm">Faturamento Lojas</span>
                </div>
                <p className="text-xl font-bold text-white mt-1">R$ {stats?.totalRevenue?.toFixed(2) || '0,00'}</p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou WhatsApp..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowNewClient(true)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <Users size={18} /> Adicionar Cliente
              </button>
            </div>

            {/* Tenants Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Loja</th>
                      <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">WhatsApp</th>
                      <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Plano</th>
                      <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Status</th>
                      <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Cadastro</th>
                      <th className="text-right px-6 py-4 text-slate-400 text-xs font-bold uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map(tenant => (
                        <tr key={tenant.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={tenant.shop_logo} 
                                alt={tenant.shop_name}
                                className="w-10 h-10 rounded-lg object-cover bg-slate-700"
                                onError={e => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1162/1162456.png'; }}
                              />
                              <span className="text-white font-medium">{tenant.shop_name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300">{tenant.whatsapp}</td>
                          <td className="px-6 py-4">{getPlanBadge(tenant.plan)}</td>
                          <td className="px-6 py-4">{getStatusBadge(tenant.status)}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{formatDate(tenant.created_at)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => impersonateTenant(tenant.id)}
                                className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                title="Entrar como cliente"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => setEditingTenant(tenant)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() => deleteTenant(tenant.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB: Planos */}
        {activeTab === 'planos' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map(plan => (
              <div 
                key={plan.id} 
                className={`bg-slate-800 rounded-2xl p-6 border-2 ${
                  plan.hidden ? 'border-emerald-500/50' : 'border-slate-700'
                }`}
              >
                {plan.hidden && (
                  <span className="text-emerald-400 text-xs font-bold">⭐ OCULTO DO SITE</span>
                )}
                
                <div className="flex items-center justify-between mt-2 mb-4">
                  <h3 className="text-white font-bold text-xl">{plan.name}</h3>
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
                
                <div className="mb-4">
                  <span className="text-3xl font-black text-white">R$ {plan.price}</span>
                  <span className="text-slate-400">/mês</span>
                </div>
                
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* TAB: Financeiro */}
        {activeTab === 'financeiro' && (
          <>
            {/* Finance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Pendente</span>
                </div>
                <p className="text-3xl font-black text-white">{finance?.pending.count || 0}</p>
                <p className="text-amber-400 text-sm mt-1">R$ {finance?.pending.total?.toFixed(2) || '0,00'}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Vencido</span>
                </div>
                <p className="text-3xl font-black text-white">{finance?.overdue.count || 0}</p>
                <p className="text-red-400 text-sm mt-1">R$ {finance?.overdue.total?.toFixed(2) || '0,00'}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Pago (Mês)</span>
                </div>
                <p className="text-3xl font-black text-white">{finance?.thisMonth.count || 0}</p>
                <p className="text-emerald-400 text-sm mt-1">R$ {finance?.thisMonth.total?.toFixed(2) || '0,00'}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <PiggyBank className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-slate-400 text-sm">Total Pago</span>
                </div>
                <p className="text-3xl font-black text-white">{finance?.paid.count || 0}</p>
                <p className="text-indigo-400 text-sm mt-1">R$ {finance?.paid.total?.toFixed(2) || '0,00'}</p>
              </div>
            </div>

            {/* PIX Config */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <QrCode className="w-5 h-5 text-indigo-400" />
                <h3 className="text-white font-bold">Configuração de Pagamento</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Chave PIX</label>
                  <input
                    type="text"
                    value={config?.payment_pix_key || ''}
                    onChange={e => config && saveConfig({ ...config, payment_pix_key: e.target.value })}
                    placeholder="suporte@to-ligado.com"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Nome no PIX</label>
                  <input
                    type="text"
                    value={config?.payment_pix_name || ''}
                    onChange={e => config && saveConfig({ ...config, payment_pix_name: e.target.value })}
                    placeholder="To-Ligado.com"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Dia de Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={config?.payment_due_day || 5}
                    onChange={e => config && saveConfig({ ...config, payment_due_day: parseInt(e.target.value) || 5 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Dias de Trial</label>
                  <input
                    type="number"
                    min="0"
                    value={config?.trial_days || 7}
                    onChange={e => config && saveConfig({ ...config, trial_days: parseInt(e.target.value) || 7 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Lembrar X dias antes</label>
                  <input
                    type="number"
                    min="1"
                    value={config?.reminder_days || 3}
                    onChange={e => config && saveConfig({ ...config, reminder_days: parseInt(e.target.value) || 3 })}
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer pb-3">
                    <input
                      type="checkbox"
                      checked={config?.reminder_enabled === 1}
                      onChange={e => config && saveConfig({ ...config, reminder_enabled: e.target.checked ? 1 : 0 })}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-600"
                    />
                    <span className="text-slate-300">Enviar lembretes</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">Cobranças</h3>
              <button
                onClick={() => setShowNewCharge(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <CreditCard size={16} /> Nova Cobrança
              </button>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Cliente</th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Plano</th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Valor</th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Vencimento</th>
                    <th className="text-left px-6 py-4 text-slate-400 text-xs font-bold uppercase">Status</th>
                    <th className="text-right px-6 py-4 text-slate-400 text-xs font-bold uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        Nenhuma cobrança cadastrada
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map(sub => (
                      <tr key={sub.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{sub.shop_name}</p>
                            <p className="text-slate-400 text-xs">{sub.whatsapp}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-300 capitalize">{sub.plan}</td>
                        <td className="px-6 py-4 text-white font-bold">R$ {sub.price?.toFixed(2)}</td>
                        <td className="px-6 py-4 text-slate-300">{formatDate(sub.due_date)}</td>
                        <td className="px-6 py-4">
                          {sub.status === 'paid' ? (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                              <CheckCircle size={12} /> Pago
                            </span>
                          ) : sub.due_date < Date.now() ? (
                            <span className="flex items-center gap-1 text-red-400 text-xs font-bold">
                              <AlertTriangle size={12} /> Vencido
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                              <Clock size={12} /> Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {sub.status === 'pending' && (
                            <button
                              onClick={() => markAsPaid(sub.id)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors"
                            >
                              Marcar Pago
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Editar Cliente</h2>
              <button onClick={() => setEditingTenant(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Nome da Loja</label>
                <input
                  type="text"
                  value={editingTenant.shop_name}
                  onChange={e => setEditingTenant({ ...editingTenant, shop_name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">URL do Logo</label>
                <input
                  type="text"
                  value={editingTenant.shop_logo}
                  onChange={e => setEditingTenant({ ...editingTenant, shop_logo: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Plano</label>
                <select
                  value={editingTenant.plan}
                  onChange={e => setEditingTenant({ ...editingTenant, plan: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.hidden ? '(Oculto)' : ''} - R${p.price}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Status</label>
                <select
                  value={editingTenant.status}
                  onChange={e => setEditingTenant({ ...editingTenant, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                >
                  <option value="trial">Trial (Teste)</option>
                  <option value="active">Ativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setEditingTenant(null)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => updateTenant(editingTenant.id, {
                  shop_name: editingTenant.shop_name,
                  shop_logo: editingTenant.shop_logo,
                  plan: editingTenant.plan,
                  status: editingTenant.status
                })}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-lg border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Editar Plano</h2>
              <button onClick={() => setEditingPlan(null)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Nome do Plano</label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Preço (R$/mês)</label>
                <input
                  type="number"
                  value={editingPlan.price}
                  onChange={e => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Features (uma por linha)</label>
                <textarea
                  value={editingPlan.features.join('\n')}
                  onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n').filter(f => f.trim()) })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white h-32"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingPlan.hidden || false}
                  onChange={e => setEditingPlan({ ...editingPlan, hidden: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-indigo-600"
                />
                <span className="text-slate-300">Oculto do site (plano especial)</span>
              </label>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setEditingPlan(null)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const updatedPlans = plans.map(p => p.id === editingPlan.id ? editingPlan : p);
                  savePlans(updatedPlans);
                }}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {showNewClient && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Novo Cliente</h2>
              <button onClick={() => setShowNewClient(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={newClient.whatsapp}
                  onChange={e => setNewClient({ ...newClient, whatsapp: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Nome da Loja</label>
                <input
                  type="text"
                  placeholder="Minha Loja"
                  value={newClient.shop_name}
                  onChange={e => setNewClient({ ...newClient, shop_name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Senha *</label>
                <input
                  type="text"
                  placeholder="Senha do cliente"
                  value={newClient.password}
                  onChange={e => setNewClient({ ...newClient, password: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Plano</label>
                <select
                  value={newClient.plan}
                  onChange={e => setNewClient({ ...newClient, plan: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.hidden ? '⭐' : ''} - R${p.price}/mês
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Status</label>
                <select
                  value={newClient.status}
                  onChange={e => setNewClient({ ...newClient, status: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                >
                  <option value="active">Ativo</option>
                  <option value="trial">Trial (Teste)</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowNewClient(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createTenant}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} /> Criar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Charge Modal */}
      {showNewCharge && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Nova Cobrança</h2>
              <button onClick={() => setShowNewCharge(false)} className="text-slate-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Cliente</label>
                <select
                  value={newCharge.tenant_id}
                  onChange={e => {
                    const tenant = tenants.find(t => t.id === e.target.value);
                    const plan = plans.find(p => p.id === tenant?.plan);
                    setNewCharge({ 
                      ...newCharge, 
                      tenant_id: e.target.value,
                      plan: tenant?.plan || 'iniciante',
                      price: plan?.price || 29
                    });
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                >
                  <option value="">Selecione...</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>{t.shop_name} ({t.whatsapp})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Plano</label>
                <select
                  value={newCharge.plan}
                  onChange={e => {
                    const plan = plans.find(p => p.id === e.target.value);
                    setNewCharge({ ...newCharge, plan: e.target.value, price: plan?.price || 0 });
                  }}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - R${p.price}/mês</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Valor (R$)</label>
                <input
                  type="number"
                  value={newCharge.price}
                  onChange={e => setNewCharge({ ...newCharge, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-sm mb-1 block">Data de Vencimento</label>
                <input
                  type="date"
                  value={newCharge.due_date}
                  onChange={e => setNewCharge({ ...newCharge, due_date: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl py-3 px-4 text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowNewCharge(false)}
                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createCharge}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard size={18} /> Criar Cobrança
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdmin;
