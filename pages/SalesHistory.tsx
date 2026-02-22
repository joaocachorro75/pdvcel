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
  Printer,
  User,
  Phone,
  MessageCircle,
  Send
} from 'lucide-react';
import { Sale, Settings } from '../types';

interface SalesHistoryProps {
  settings: Settings;
}

const SalesHistory: React.FC<SalesHistoryProps> = ({ settings }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('pdv_sales');
    if (saved) setSales(JSON.parse(saved).reverse());
  }, []);

  const filteredSales = useMemo(() => {
    return sales.filter(s => 
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.buyerPhone?.includes(searchTerm)
    );
  }, [sales, searchTerm]);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-4 space-y-4 max-w-4xl mx-auto pb-24">
        <h1 className="text-xl font-black text-slate-800">📊 Histórico de Vendas</h1>

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

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-400 font-bold uppercase">Total de Vendas</p>
            <p className="text-2xl font-black text-slate-800">{sales.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200">
            <p className="text-xs text-slate-400 font-bold uppercase">Faturamento</p>
            <p className="text-2xl font-black text-emerald-600">R$ {sales.reduce((acc, s) => acc + s.total, 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-3">
          {filteredSales.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Nenhuma venda encontrada</p>
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
