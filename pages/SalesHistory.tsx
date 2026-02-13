
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
  Printer
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
      s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sales, searchTerm]);

  const shareReceipt = (sale: Sale) => {
    const text = `Recibo - ${settings.shopName}\nVenda: #${sale.id}\nTotal: R$ ${sale.total.toFixed(2)}\nPagamento: ${sale.paymentMethod.toUpperCase()}\nData: ${new Date(sale.timestamp).toLocaleString()}\n\nObrigado pela preferência!`;
    
    if (navigator.share) {
      navigator.share({
        title: `Recibo ${settings.shopName}`,
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Recibo copiado para a área de transferência!');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Histórico de Vendas</h1>
        <p className="text-slate-500">Acompanhe todas as transações realizadas no PDV.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por ID ou forma de pagamento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="date" className="pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">ID da Venda</th>
                <th className="px-6 py-4">Itens</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span className="font-semibold">{new Date(sale.timestamp).toLocaleDateString()}</span>
                      <span className="text-xs opacity-60">{new Date(sale.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">#{sale.id}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sale.items.reduce((acc, curr) => acc + curr.quantity, 0)} itens
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      sale.paymentMethod === 'pix' ? 'bg-cyan-100 text-cyan-600' :
                      sale.paymentMethod === 'money' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-800">
                    R$ {sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => shareReceipt(sale)}
                        className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-slate-400">Nenhuma venda encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-slate-500 text-xs font-medium">
          <span>{filteredSales.length} transações</span>
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-slate-100 rounded disabled:opacity-30" disabled><ChevronLeft size={18} /></button>
            <span className="w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg font-bold">1</span>
            <button className="p-1 hover:bg-slate-100 rounded disabled:opacity-30" disabled><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Detalhes da Venda</h3>
                <p className="text-xs text-slate-400 font-mono">#{selectedSale.id}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-2 hover:bg-white rounded-full text-slate-400 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <FileText size={32} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">{new Date(selectedSale.timestamp).toLocaleString()}</p>
                  <p className="text-lg font-black text-slate-800">R$ {selectedSale.total.toFixed(2)}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {selectedSale.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Itens Comprados</h4>
                <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
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
                <button 
                  onClick={() => shareReceipt(selectedSale)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                >
                  <Share2 size={18} />
                  Compartilhar
                </button>
                <button 
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition-all"
                >
                  <Printer size={18} />
                  Imprimir
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
