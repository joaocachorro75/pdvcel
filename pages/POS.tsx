import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode,
  X,
  CheckCircle2,
  Share2,
  ShoppingCart,
  ChevronUp,
  Copy,
  Check,
  MessageCircle,
  User,
  Phone,
  Send
} from 'lucide-react';
import { Product, CartItem, Sale, Settings } from '../types';

interface POSProps {
  settings: Settings;
  onSaleComplete?: () => void;
}

const POS: React.FC<POSProps> = ({ settings, onSaleComplete }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);
  const [saleResult, setSaleResult] = useState<Sale | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [lastAddedName, setLastAddedName] = useState('');
  
  // Buyer info
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('pdv_products');
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    setLastAddedName(product.name);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  }, [cart]);

  const cartItemsCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.quantity, 0);
  }, [cart]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
  };

  const initiatePayment = (method: 'money' | 'pix' | 'card') => {
    if (method === 'pix') {
      setIsCheckoutModalOpen(false);
      setIsPixModalOpen(true);
    } else {
      confirmPayment(method);
    }
  };

  const confirmPayment = (method: 'money' | 'pix' | 'card') => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...cart],
      total: cartTotal,
      paymentMethod: method,
      timestamp: Date.now(),
      buyerName: buyerName.trim() || undefined,
      buyerPhone: buyerPhone.trim() || undefined,
    };

    const savedSales = JSON.parse(localStorage.getItem('pdv_sales') || '[]');
    const updatedSales = [...savedSales, newSale];
    localStorage.setItem('pdv_sales', JSON.stringify(updatedSales));

    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('pdv_products', JSON.stringify(updatedProducts));

    setSaleResult(newSale);
    setCart([]);
    setIsCheckoutModalOpen(false);
    setIsPixModalOpen(false);
    setIsCartOpenMobile(false);

    if (onSaleComplete) onSaleComplete();
  };

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

  const shareReceipt = () => {
    if (!saleResult) return;
    const text = generateReceiptText(saleResult);
    
    if (navigator.share) {
      navigator.share({ title: `Recibo ${settings.shopName}`, text: text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Recibo copiado!');
    }
  };

  const sendToWhatsApp = () => {
    if (!saleResult) return;
    
    const text = generateReceiptText(saleResult);
    const phone = saleResult.buyerPhone?.replace(/\D/g, '') || '';
    
    if (phone) {
      const whatsappUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Número do comprador não informado');
    }
  };

  const pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126360014BR.GOV.BCB.PIX0114${settings.pixKey}520400005303986540${cartTotal.toFixed(2)}5802BR5913${settings.shopName.slice(0,13)}6008SAO%20PAULO62070503***6304`;

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative">
      
      {/* Toast de Confirmação */}
      <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${showToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold border border-white/10">
          <Check size={14} className="text-emerald-400" />
          {lastAddedName} adicionado!
        </div>
      </div>

      {/* Busca */}
      <div className="mb-4 sticky top-0 bg-slate-50 z-20 py-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produto..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none text-base"
          />
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="flex-1 overflow-y-auto pb-40 custom-scrollbar px-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`bg-white p-2 rounded-2xl border border-slate-200 text-left transition-all active:scale-95 relative ${
                product.stock <= 0 ? 'opacity-60 grayscale' : 'hover:shadow-md'
              }`}
            >
              <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100 relative">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                    SÓ {product.stock}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-800 text-xs line-clamp-2 min-h-[2rem] leading-tight px-1">{product.name}</h3>
              <p className="text-indigo-600 font-black text-sm mt-1 px-1">R$ {product.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Carrinho Flutuante */}
      <div className="fixed bottom-[84px] left-4 right-4 z-[45]">
        <button 
          onClick={() => setIsCartOpenMobile(true)}
          className={`w-full bg-indigo-600 text-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between transition-all duration-500 active:scale-95 ${
            cartItemsCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <ShoppingCart size={22} />
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-indigo-100 leading-none">Total no Carrinho</p>
              <p className="text-lg font-black leading-tight">R$ {cartTotal.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-indigo-500 px-3 py-1.5 rounded-lg flex items-center gap-1 font-bold text-sm">
            {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'itens'}
            <ChevronUp size={16} />
          </div>
        </button>
      </div>

      {/* Gaveta do Carrinho */}
      {isCartOpenMobile && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCartOpenMobile(false)} />
          <div className="bg-white rounded-t-[40px] w-full max-h-[90vh] flex flex-col relative animate-in slide-in-from-bottom duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto my-4" />
            
            <div className="px-6 flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                Carrinho
                <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg text-xs font-bold">{cartItemsCount}</span>
              </h2>
              <button onClick={() => setIsCartOpenMobile(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-10 custom-scrollbar">
              {cart.map(item => (
                <CartItemRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeFromCart} />
              ))}
            </div>

            <div className="p-6 bg-white border-t space-y-4 pb-[100px] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold text-lg">Subtotal</span>
                <span className="text-3xl font-black text-indigo-600">R$ {cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full py-5 bg-indigo-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-200 active:scale-95 transition-transform"
              >
                Cobrar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagamento + Dados do Comprador */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 pb-[100px] animate-in slide-in-from-bottom duration-300 overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-slate-800 mb-4 text-center">Finalizar Venda</h3>
            
            {/* Dados do Comprador */}
            <div className="mb-6 space-y-3">
              <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <User size={16} /> Dados do Comprador (opcional)
              </p>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Nome do cliente"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="tel"
                  placeholder="WhatsApp (com DDD)"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <p className="text-sm font-bold text-slate-600 mb-3">Forma de Pagamento</p>
            <div className="space-y-3">
              <PaymentButton icon={<QrCode />} label="Gerar QR PIX" color="cyan" onClick={() => initiatePayment('pix')} />
              <PaymentButton icon={<Banknote />} label="Dinheiro" color="emerald" onClick={() => initiatePayment('money')} />
              <PaymentButton icon={<CreditCard />} label="Cartão / Outros" color="blue" onClick={() => initiatePayment('card')} />
            </div>
            <button onClick={() => setIsCheckoutModalOpen(false)} className="w-full mt-6 py-3 text-slate-400 font-bold">Voltar</button>
          </div>
        </div>
      )}

      {/* Modal PIX */}
      {isPixModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 text-center animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-slate-800 mb-2">Pagar via PIX</h3>
            <div className="bg-white p-4 rounded-3xl mb-6 inline-block border-2 border-indigo-100 shadow-inner">
              <img src={pixQrCodeUrl} alt="QR Code PIX" className="mx-auto w-56 h-56" />
            </div>
            <p className="text-3xl font-black text-indigo-600 leading-none mb-1">R$ {cartTotal.toFixed(2)}</p>
            <div className="space-y-3 mt-6">
              <button 
                onClick={() => confirmPayment('pix')}
                className="w-full py-5 bg-emerald-500 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-100 active:scale-95"
              >
                Confirmar Pagamento
              </button>
              <button onClick={() => setIsPixModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-sm">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Recibo Final */}
      {saleResult && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center relative animate-in zoom-in-95 duration-300">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
              {[...Array(8)].map((_, i) => <div key={i} className="w-4 h-4 bg-white rounded-full -mt-2 shadow-sm" />)}
            </div>
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-3" />
            <h2 className="font-black text-slate-800 uppercase tracking-tighter text-lg leading-tight">{settings.shopName}</h2>
            
            {saleResult.buyerName && (
              <p className="text-sm text-slate-500 mt-1">Cliente: {saleResult.buyerName}</p>
            )}
            
            <div className="border-t border-dashed border-slate-200 my-4 py-4 text-left space-y-1.5 font-mono">
              {saleResult.items.map(i => (
                <div key={i.id} className="flex justify-between text-[11px] text-slate-600">
                  <span>{i.quantity}x {i.name.slice(0, 18)}</span>
                  <span className="font-bold">R$ {(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-black text-xl text-slate-800 pt-2 border-t border-dashed">
              <span>TOTAL</span>
              <span>R$ {saleResult.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-3 mt-6">
              {saleResult.buyerPhone && (
                <button 
                  onClick={sendToWhatsApp}
                  className="w-full py-4 bg-green-500 text-white font-black rounded-xl flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send size={20} /> Enviar via WhatsApp
                </button>
              )}
              <button 
                onClick={shareReceipt} 
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-xl flex items-center justify-center gap-2 active:scale-95"
              >
                <Share2 size={20} /> Compartilhar Recibo
              </button>
              <button 
                onClick={() => { setSaleResult(null); setBuyerName(''); setBuyerPhone(''); }} 
                className="w-full py-3 text-slate-500 font-bold border rounded-xl hover:bg-slate-50"
              >
                Nova Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CartItemRow: React.FC<{ item: CartItem, onUpdate: (id: string, delta: number) => void, onRemove: (id: string) => void }> = ({ item, onUpdate, onRemove }) => (
  <div className="flex gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-white" />
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 text-sm truncate leading-tight">{item.name}</h4>
      <p className="text-xs text-indigo-600 font-black">R$ {item.price.toFixed(2)}</p>
    </div>
    <div className="flex items-center gap-1 bg-white border rounded-xl p-1 shadow-sm">
      <button onClick={() => onUpdate(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-lg"><Minus size={14} /></button>
      <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
      <button onClick={() => onUpdate(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-lg"><Plus size={14} /></button>
    </div>
    <button onClick={() => onRemove(item.id)} className="text-red-400 p-2"><Trash2 size={18} /></button>
  </div>
);

const PaymentButton: React.FC<{ icon: any, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100'
  };
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 border-2 rounded-2xl transition-all active:scale-[0.98] ${colors[color]}`}>
      <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
      <span className="font-black text-slate-800 text-lg">{label}</span>
    </button>
  );
};

export default POS;
