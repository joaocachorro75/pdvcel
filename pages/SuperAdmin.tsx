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
  Star
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

interface Stats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  totalSales: number;
  totalRevenue: number;
  planCounts: { plan: string; count: number }[];
}

const SuperAdmin: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const plans = [
    { id: 'iniciante', name: 'Iniciante', price: 29 },
    { id: 'profissional', name: 'Profissional', price: 59 },
    { id: 'empresarial', name: 'Empresarial', price: 99 },
    { id: 'parceiro', name: '⭐ Parceiro (Gratuito)', price: 0, hidden: true }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, tenantsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/tenants')
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (tenantsRes.ok) setTenants((await tenantsRes.json()).tenants);
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
          <a href="/" className="text-slate-400 hover:text-white text-sm">Sair</a>
        </div>
      </header>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-8">
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
            <p className="text-3xl font-black text-white">
              R$ {stats?.mrr || 0}
            </p>
          </div>
        </div>

        {/* Segunda linha de stats */}
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
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou WhatsApp..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
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
      </div>

      {/* Edit Modal */}
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
                    <option key={p.id} value={p.id}>{p.name} - R${p.price}/mês</option>
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
    </div>
  );
};

export default SuperAdmin;
