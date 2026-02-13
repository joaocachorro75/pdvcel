
import React, { useState } from 'react';
import { 
  Store, 
  Image as ImageIcon, 
  Key, 
  Lock, 
  Save, 
  RefreshCcw,
  QrCode
} from 'lucide-react';
import { Settings } from '../types';

interface SettingsPageProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, setSettings }) => {
  const [formData, setFormData] = useState<Settings>(settings);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, shopLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      setSettings(prev => ({
        ...prev,
        shopName: formData.shopName,
        shopLogo: formData.shopLogo,
        pixKey: formData.pixKey
      }));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPassword !== settings.adminPassword) {
      alert('Senha atual incorreta!');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (newPassword.length < 4) {
      alert('A nova senha deve ter pelo menos 4 caracteres!');
      return;
    }

    setSettings(prev => ({ ...prev, adminPassword: newPassword }));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Senha alterada com sucesso!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações do Sistema</h1>
        <p className="text-slate-500">Personalize a identidade da sua loja e configurações de segurança.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Store size={20} />
              </div>
              <h2 className="font-bold text-slate-800">Identidade Visual</h2>
            </div>
            <form onSubmit={handleSaveGeneral} className="p-6 space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                    <img src={formData.shopLogo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity rounded-2xl">
                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">Trocar</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                  </label>
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-bold text-slate-800">Logo da Marca</h3>
                  <p className="text-xs text-slate-500">JPG, PNG ou WebP. Tamanho recomendado: 512x512px.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nome da Loja</label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.shopName}
                      onChange={(e) => setFormData(prev => ({ ...prev, shopName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Nome do seu negócio"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Chave PIX (Para Recebimentos)</label>
                  <div className="relative">
                    <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      value={formData.pixKey}
                      onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="Chave PIX (CPF, E-mail, Celular...)"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={saveStatus !== 'idle'}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all"
              >
                {saveStatus === 'saving' ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                {saveStatus === 'success' ? 'Configurações Salvas!' : 'Salvar Alterações'}
              </button>
            </form>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <Lock size={20} />
              </div>
              <h2 className="font-bold text-slate-800">Segurança do Administrador</h2>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Senha Atual</label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nova Senha</label>
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="Nova senha"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Confirmar Senha</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="Confirmar nova senha"
                    />
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all"
              >
                <Key size={18} />
                Atualizar Senha
              </button>
            </form>
          </div>
        </div>

        {/* Info Side */}
        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
            <h3 className="font-bold text-lg mb-2">SmartPDV Pro</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
              Você está utilizando a versão local. Todos os seus dados são salvos apenas neste dispositivo.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-medium text-indigo-100 bg-white/10 p-3 rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Ativo para Usuário Único
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-indigo-100 bg-white/10 p-3 rounded-xl border border-white/10">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                Backup Local Habilitado
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Suporte</h3>
            <p className="text-slate-500 text-sm mb-6">Precisa de ajuda com o sistema ou deseja solicitar uma customização?</p>
            <a 
              href="mailto:suporte@smartpdv.com"
              className="block text-center py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all"
            >
              Contato Suporte
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
