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
  Eye
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
  const [activeTab, setActiveTab] = useState<'clientes' | 'planos'>('clientes');
  const [stats, setStats] = useState<Stats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState({ whatsapp: '', shop_name: '', password: '', plan: 'iniciante', status: 'active' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, tenantsRes, plansRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/tenants'),
        fetch('/api/admin/plans')
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (tenantsRes.ok) setTenants((await tenantsRes.json()).tenants);
      if (plansRes.ok) setPlans((await plansRes.json()).plans);
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
    </div>
  );
};

export default SuperAdmin;
