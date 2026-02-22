import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Image as ImageIcon,
  X,
  Package,
  Camera,
  Loader2,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';

interface InventoryProps {
  onUpdate?: () => void;
}

interface ImageResult {
  thumbnail: string;
  original: string;
  title: string;
}

const Inventory: React.FC<InventoryProps> = ({ onUpdate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [searchedImages, setSearchedImages] = useState<ImageResult[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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
    return () => stopCamera();
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
    setShowImageSearch(false);
    setSearchedImages([]);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Permissão de câmera negada ou dispositivo não encontrado.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, image: imageData }));
        stopCamera();
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  // Buscar imagens automaticamente pelo nome do produto
  const searchImages = async () => {
    if (!formData.name.trim()) {
      alert('Digite o nome do produto primeiro');
      return;
    }
    
    setSearchingImages(true);
    setShowImageSearch(true);
    
    try {
      const response = await fetch(`/api/search-image?q=${encodeURIComponent(formData.name)}`);
      const data = await response.json();
      setSearchedImages(data.images || []);
    } catch (err) {
      console.error('Erro ao buscar imagens:', err);
      alert('Erro ao buscar imagens. Tente novamente.');
    } finally {
      setSearchingImages(false);
    }
  };

  const selectImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image: imageUrl }));
    setShowImageSearch(false);
    setSearchedImages([]);
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
    stopCamera();
    setShowImageSearch(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este produto?')) {
      const updated = products.filter(p => p.id !== id);
      saveToStorage(updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black text-slate-800">📦 Estoque</h1>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar no estoque..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none shadow-sm text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pb-24">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-16 h-16 mx-auto mb-3 opacity-30" />
              <p>Nenhum produto cadastrado</p>
              <p className="text-sm">Toque no + para adicionar</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate">{product.name}</h3>
                  <p className="text-xs text-slate-400 uppercase font-bold">{product.category}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-indigo-600 font-black text-lg">R$ {product.price.toFixed(2)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      product.stock <= 5 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      Qtd: {product.stock}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(product)} className="p-3 text-indigo-600 bg-indigo-50 rounded-xl">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-3 text-red-500 bg-red-50 rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-start sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full sm:max-w-lg min-h-screen sm:min-h-0 sm:rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-black text-lg text-slate-800">{editingProduct ? 'Editar' : 'Novo'} Produto</h3>
              <button onClick={() => { setIsModalOpen(false); stopCamera(); setShowImageSearch(false); }} className="p-2 bg-slate-100 rounded-full"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Image Section */}
              <div className="space-y-3">
                {showCamera ? (
                  <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                      <button type="button" onClick={takePhoto} className="bg-white text-slate-900 p-4 rounded-full shadow-lg">
                        <Camera size={24} />
                      </button>
                      <button type="button" onClick={stopCamera} className="bg-red-500 text-white p-4 rounded-full shadow-lg">
                        <X size={24} />
                      </button>
                    </div>
                  </div>
                ) : showImageSearch ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-600">Selecione uma imagem:</p>
                      <button type="button" onClick={() => { setShowImageSearch(false); setSearchedImages([]); }} className="text-sm text-slate-400">Fechar</button>
                    </div>
                    {searchingImages ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        <span className="ml-2 text-slate-500">Buscando imagens...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {searchedImages.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectImage(img.thumbnail)}
                            className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-colors"
                          >
                            <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <label className="relative w-28 h-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer shrink-0">
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-300 w-8 h-8" />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                    <div className="flex flex-col gap-2 w-full">
                      <button type="button" onClick={searchImages} className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-3 rounded-xl font-bold text-sm w-full">
                        <Sparkles size={18} /> Buscar Imagem
                      </button>
                      <button type="button" onClick={startCamera} className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 px-4 py-3 rounded-xl font-bold text-sm w-full">
                        <Camera size={18} /> Usar Câmera
                      </button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <input 
                  placeholder="Nome do Produto" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} required
                />
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    placeholder="Preço R$" type="number" step="0.01" inputMode="decimal"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} required
                  />
                  <input 
                    placeholder="Estoque" type="number" inputMode="numeric"
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                    value={formData.stock} onChange={e => setFormData(prev => ({ ...prev, stock: e.target.value }))} required
                  />
                </div>
                <input 
                  placeholder="Categoria" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                  value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} required
                />
              </div>

              <button type="submit" className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl active:scale-95 transition-transform">
                Salvar Produto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
