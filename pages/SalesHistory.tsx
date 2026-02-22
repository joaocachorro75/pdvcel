import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  FileText, 
  Share2,
  X,
  User,
  Phone,
  Send,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Filter,
  Trash2
} from 'lucide-react';
import { Sale, Settings } from '../types';

interface SalesHistoryProps {
  settings: Settings;
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');

  // Carregar dados do tenant
  useEffect(() => {
    const loadData = async () => {
      try {
        const tenantData = localStorage.getItem('pdv_tenant');
        if (tenantData) {
          const tenant = JSON.parse(tenantData);
          const res = await fetch(`/api/tenant/${tenant.id}`);
          if (res.ok) {
            const data = await res.json();
            setSettings(data.settings);
            setSales((data.sales || []).reverse());
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    loadData();
  }, []);

  // Filter sales by period
  const filteredByPeriod = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return sales.filter(s => {
      const saleDate = new Date(s.timestamp);
      switch (filterPeriod) {
        case 'today':
          return saleDate >= today;
        case 'week':
          return saleDate >= weekAgo;
        case 'month':
          return saleDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [sales, filterPeriod]);

  // Search within filtered period
  const filteredSales = useMemo(() => {
    return filteredByPeriod.filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerPhone?.includes(searchTerm)
    );
  }, [filteredByPeriod, searchTerm]);

  // Stats for filtered period
  const stats = useMemo(() => {
    const totalSales = filteredByPeriod.length;
    const totalAmount = filteredByPeriod.reduce((acc, s) => acc + s.total, 0);
    const avgTicket = totalSales > 0 ? totalAmount / totalSales : 0;
    
    // Count by payment method
    const byPayment = filteredByPeriod.reduce((acc, s) => {
      acc[s.paymentMethod] = (acc[s.paymentMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalSales, totalAmount, avgTicket, byPayment };
  }, [filteredByPeriod]);

  const generateReceiptText = (sale: Sale) => {
    const itemsText = sale.items.map(i => `${i.quantity}x ${i.name} - R$ ${(i.price * i.quantity).toFixed(2)}`).join('\n');
    const buyerText = sale.buyerName ? `\nCLIENTE: ${sale.buyerName}` : '';
    const phoneText = sale.buyerPhone ? `\nTEL: ${sale.buyerPhone}` : '';
    
    return `🧾 *RECIBO - ${settings.shopName}*
━━━━━━━━━━━━━━━━━
📋 VENDA: #${sale.id}
📅 DATA: ${new Date(sale.timestamp).toLocaleString('pt-BR')}${buyerText}${phoneText}

📦 *ITENS:*
${itemsText}
━━━━━━━━━━━━━━━━━
💰 *TOTAL: R$ ${sale.total.toFixed(2)}*
💳 PGTO: ${sale.paymentMethod.toUpperCase()}

✨ Obrigado pela preferência!`;
  };

  const shareReceipt = (sale: Sale) => {
    const text = generateReceiptText(sale);
    
    if (navigator.share) {
      navigator.share({
        title: `Recibo ${settings.shopName}`,
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Recibo copiado!');
    }
  };

  const sendToWhatsApp = (sale: Sale) => {
    const text = generateReceiptText(sale);
    const phone = sale.buyerPhone?.replace(/\D/g, '') || '';
    
    if (phone) {
      const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Número do comprador não informado');
    }
  };

  const handleDeleteSale = (saleId: string) => {
    if (!confirm('Excluir esta venda do histórico?')) return;
    
    const updatedSales = sales.filter(s => s.id !== saleId);
    setSales(updatedSales);
    localStorage.setItem('pdv_sales', JSON.stringify(updatedSales));
    setSelectedSale(null);
  };

  const clearAllSales = () => {
    if (!confirm('ATENÇÃO: Isso vai apagar TODO o histórico de vendas!\n\nDeseja continuar?')) return;
    setSales([]);
    localStorage.setItem('pdv_sales', JSON.stringify([]));
  };

  const periodLabels: Record<FilterPeriod, string> = {
    all: 'Todo período',
    today: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Últimos 30 dias'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-4 space-y-4 max-w-4xl mx-auto pb-24">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800">📊 Histórico</h1>
          {sales.length > 0 && (
            <button 
              onClick={clearAllSales}
              className="text-xs text-red-500 font-bold px-3 py-2 bg-red-50 rounded-lg"
            >
              Limpar Tudo
            </button>
          )}
        </div>

        {/* Period Filter */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-1 overflow-x-auto">
          {(['today', 'week', 'month', 'all'] as FilterPeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`flex-1 min-w-fit px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                filterPeriod === period 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {periodLabels[period]}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingCart className="w-4 h-4 text-indigo-500" />
              <p className="text-xs text-slate-400 font-bold uppercase">Vendas</p>
            </div>
            <p className="text-2xl font-black text-slate-800">{stats.totalSales}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <p className="text-xs text-slate-400 font-bold uppercase">Faturamento</p>
            </div>
            <p className="text-2xl font-black text-emerald-600">R$ {stats.totalAmount.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-slate-400 font-bold uppercase">Ticket Médio</p>
            </div>
            <p className="text-2xl font-black text-blue-600">R$ {stats.avgTicket.toFixed(2)}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <Filter className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-slate-400 font-bold uppercase">Pagamentos</p>
            </div>
            <div className="text-xs font-bold text-slate-600 space-y-0.5">
              {stats.byPayment.pix > 0 && <p className="text-cyan-600">PIX: {stats.byPayment.pix}</p>}
              {stats.byPayment.money > 0 && <p className="text-emerald-600">$$: {stats.byPayment.money}</p>}
              {stats.byPayment.card > 0 && <p className="text-blue-600">Card: {stats.byPayment.card}</p>}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por ID, cliente ou telefone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none text-sm"
          />
        </div>

        {/* Sales List */}
        <div className="space-y-3">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Nenhuma venda encontrada</p>
              <p className="text-sm mt-1">para {periodLabels[filterPeriod].toLowerCase()}</p>
            </div>
          ) : (
            filteredSales.map(sale => (
              <div key={sale.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">#{sale.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        sale.paymentMethod === 'pix' ? 'bg-cyan-100 text-cyan-600' :
                        sale.paymentMethod === 'money' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {sale.paymentMethod}
                      </span>
                    </div>
                    <p className="text-lg font-black text-slate-800 mt-1">R$ {sale.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{new Date(sale.timestamp).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"
                    >
                      <Eye size={18} />
                    </button>
                    {sale.buyerPhone && (
                      <button 
                        onClick={() => sendToWhatsApp(sale)}
                        className="p-2 bg-green-50 text-green-600 rounded-xl"
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Buyer Info */}
                {(sale.buyerName || sale.buyerPhone) && (
                  <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-sm text-slate-500">
                    {sale.buyerName && (
                      <span className="flex items-center gap-1">
                        <User size={14} /> {sale.buyerName}
                      </span>
                    )}
                    {sale.buyerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone size={14} /> {sale.buyerPhone}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50 sticky top-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Detalhes da Venda</h3>
                <p className="text-xs text-slate-400 font-mono">#{selectedSale.id}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-white rounded-full text-slate-400 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Buyer Info */}
              {(selectedSale.buyerName || selectedSale.buyerPhone) && (
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dados do Comprador</h4>
                  {selectedSale.buyerName && (
                    <p className="flex items-center gap-2 text-slate-700 mb-2">
                      <User size={16} className="text-indigo-500" />
                      <span className="font-medium">{selectedSale.buyerName}</span>
                    </p>
                  )}
                  {selectedSale.buyerPhone && (
                    <p className="flex items-center gap-2 text-slate-700">
                      <Phone size={16} className="text-indigo-500" />
                      <span className="font-medium">{selectedSale.buyerPhone}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <FileText size={32} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">{new Date(selectedSale.timestamp).toLocaleString('pt-BR')}</p>
                  <p className="text-2xl font-black text-slate-800">R$ {selectedSale.total.toFixed(2)}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedSale.paymentMethod === 'pix' ? 'bg-cyan-100 text-cyan-600' :
                    selectedSale.paymentMethod === 'money' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {selectedSale.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Itens Comprados</h4>
                <div className="space-y-3">
                  {selectedSale.items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex gap-2">
                        <span className="text-indigo-600 font-bold">{item.quantity}x</span>
                        <span className="text-slate-700 font-medium">{item.name}</span>
                      </div>
                      <span className="text-slate-900 font-bold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {selectedSale.buyerPhone && (
                  <button 
                    onClick={() => sendToWhatsApp(selectedSale)}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
                  >
                    <Send size={18} />
                    Enviar via WhatsApp
                  </button>
                )}
                <button 
                  onClick={() => shareReceipt(selectedSale)}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                >
                  <Share2 size={18} />
                  Compartilhar
                </button>
                <button 
                  onClick={() => handleDeleteSale(selectedSale.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-red-500 font-bold border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all"
                >
                  <Trash2 size={18} />
                  Excluir Venda
                </button>
                <button 
                  onClick={() => setSelectedSale(null)}
                  className="w-full py-3 text-slate-400 font-bold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesHistory;
