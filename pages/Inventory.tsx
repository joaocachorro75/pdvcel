
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  X,
  Package
} from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  onUpdate?: () => void;
}

const Inventory: React.FC<InventoryProps> = ({ onUpdate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('pdv_products');
    if (saved) setProducts(JSON.parse(saved));
  }, []);

  const saveToStorage = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('pdv_products', JSON.stringify(newProducts));
    if (onUpdate) onUpdate();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        image: product.image
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: '', stock: '', image: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock),
      image: formData.image || `https://picsum.photos/seed/${formData.name}/200/200`
    };

    let updated;
    if (editingProduct) {
      updated = products.map(p => p.id === editingProduct.id ? newProduct : p);
    } else {
      updated = [...products, newProduct];
    }
    
    saveToStorage(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este produto?')) {
      const updated = products.filter(p => p.id !== id);
      saveToStorage(updated);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-slate-800">Estoque</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg active:scale-90 transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar no estoque..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm text-sm"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 pb-20">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-800 text-sm truncate">{product.name}</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold">{product.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-indigo-600 font-black text-sm">R$ {product.price.toFixed(2)}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                }`}>
                  Qtd: {product.stock}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => handleOpenModal(product)} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 bg-red-50 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center opacity-40">
            <Package className="mx-auto mb-2" size={48} />
            <p className="text-sm font-bold">Estoque vazio</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-black text-slate-800">{editingProduct ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="flex justify-center">
                <label className="relative w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer">
                  {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300" />}
                  <input type="file" className="hidden" onChange={handleImageChange} />
                </label>
              </div>
              <input 
                placeholder="Nome do Produto" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  placeholder="Preço (R$)" type="number" step="0.01"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required
                />
                <input 
                  placeholder="Qtd Estoque" type="number"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.stock} onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))} required
                />
              </div>
              <input 
                placeholder="Categoria (Ex: Bebidas)" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} required
              />
              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-lg active:scale-95 transition-all">
                Salvar no Estoque
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
