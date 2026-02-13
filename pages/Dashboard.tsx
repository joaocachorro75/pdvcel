
import React, { useMemo } from 'react';
import { ShoppingBag, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Sale } from '../types';

const Dashboard: React.FC = () => {
  const sales: Sale[] = useMemo(() => {
    const saved = localStorage.getItem('pdv_sales');
    return saved ? JSON.parse(saved) : [];
  }, []);

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => new Date(s.timestamp).setHours(0,0,0,0) === today);
    return {
      todayCount: todaySales.length,
      todayAmount: todaySales.reduce((acc, curr) => acc + curr.total, 0),
      totalAmount: sales.reduce((acc, curr) => acc + curr.total, 0),
    };
  }, [sales]);

  return (
    <div className="space-y-6 pb-10">
      <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-100">
        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Vendas de Hoje</p>
        <h2 className="text-4xl font-black mb-4">R$ {stats.todayAmount.toFixed(2)}</h2>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold">
            {stats.todayCount} Pedidos
          </div>
          <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1">
            <TrendingUp size={14} /> +15%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 w-fit mb-3">
            <DollarSign size={20} />
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase">Total Acumulado</p>
          <p className="text-lg font-black text-slate-800">R$ {stats.totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
          <div className="bg-amber-50 p-2 rounded-xl text-amber-600 w-fit mb-3">
            <ShoppingBag size={20} />
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase">Ticket Médio</p>
          <p className="text-lg font-black text-slate-800">
            R$ {stats.todayCount > 0 ? (stats.todayAmount / stats.todayCount).toFixed(2) : '0,00'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="font-black text-slate-800">Últimas do Dia</h3>
        </div>
        <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
          {sales.slice(-5).reverse().map((sale) => (
            <div key={sale.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 p-2 rounded-xl text-slate-400">
                  <DollarSign size={16} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-800">#{sale.id.slice(0, 5)}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{sale.paymentMethod}</p>
                </div>
              </div>
              <p className="font-black text-indigo-600">R$ {sale.total.toFixed(2)}</p>
            </div>
          ))}
          {sales.length === 0 && (
            <div className="p-10 text-center opacity-30 italic text-sm font-medium">Sem vendas registradas hoje.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
