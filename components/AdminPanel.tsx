
import React, { useState } from 'react';
import { Product, SiteConfig } from '../types';
import { generateProductDescription, generateHeroCopy } from '../services/geminiService';

interface AdminPanelProps {
  products: Product[];
  onUpdateProducts: (products: Product[]) => void;
  siteConfig: SiteConfig;
  onUpdateConfig: (config: SiteConfig) => void;
  onInstallRequest: () => void;
  canInstall: boolean;
  onLogout: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  products, 
  onUpdateProducts, 
  siteConfig, 
  onUpdateConfig, 
  onInstallRequest, 
  canInstall,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'site' | 'security'>('site');
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '', category: 'Candles', price: 200, description: '', imageUrl: '', discountPercentage: 5
  });

  const handleUpdateConfig = (field: keyof SiteConfig, value: any) => {
    onUpdateConfig({ ...siteConfig, [field]: value });
  };

  const handleMagicHero = async () => {
    setIsGenerating(true);
    const copy = await generateHeroCopy(siteConfig.siteName);
    onUpdateConfig({ ...siteConfig, heroTitle: copy.title, heroSubtitle: copy.subtitle });
    setIsGenerating(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
        alert("Please upload a JPG image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = () => {
    if (!newProduct.name || !newProduct.description) return;
    const item: Product = {
      id: Date.now().toString(),
      name: newProduct.name!,
      category: newProduct.category || 'Candles',
      price: Number(newProduct.price) || 200,
      description: newProduct.description!,
      imageUrl: newProduct.imageUrl || `https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=800&q=80`,
      discountPercentage: Number(newProduct.discountPercentage) || 5
    };
    onUpdateProducts([...products, item]);
    setIsAdding(false);
    // Reset state
    setNewProduct({ name: '', category: 'Candles', price: 200, description: '', imageUrl: '', discountPercentage: 5 });
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border shadow-sm w-fit">
          {['site', 'inventory', 'security'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold capitalize transition-all ${
                activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button 
          onClick={onLogout}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
        >
          Lock System
        </button>
      </div>

      {activeTab === 'security' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white p-8 rounded-3xl border shadow-sm">
            <h3 className="text-2xl font-black mb-6">Gatekeeper Controls</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem]">
                <div>
                  <div className="font-bold text-gray-900">Public Visibility</div>
                  <div className="text-sm text-gray-500">If OFF, visitors must enter passcode to see candles.</div>
                </div>
                <button 
                  onClick={() => handleUpdateConfig('isPublic', !siteConfig.isPublic)}
                  className={`w-14 h-8 rounded-full relative transition-colors ${siteConfig.isPublic ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${siteConfig.isPublic ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Master Passcode</label>
                <input 
                  type="text" 
                  maxLength={6}
                  value={siteConfig.masterPasscode}
                  onChange={(e) => handleUpdateConfig('masterPasscode', e.target.value.replace(/\D/g,''))}
                  className="w-full px-5 py-4 bg-gray-50 border-gray-200 border rounded-3xl focus:ring-2 focus:ring-amber-500 outline-none font-mono text-2xl tracking-[1em] text-center"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'site' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Mizo Branding</h3>
                <p className="text-sm text-gray-500">Control the mood and identity of your store.</p>
              </div>
              <button 
                onClick={handleMagicHero}
                disabled={isGenerating}
                className="w-full md:w-auto bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl text-xs font-black hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                {isGenerating ? 'AI Crafting...' : '✨ AI Writer'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Brand Name</label>
                  <input type="text" value={siteConfig.siteName} onChange={(e) => handleUpdateConfig('siteName', e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-2xl outline-none font-black" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Hero Ambience Image</label>
                  <input type="text" value={siteConfig.heroImageUrl} onChange={(e) => handleUpdateConfig('heroImageUrl', e.target.value)} className="w-full px-5 py-3 bg-gray-50 border-gray-200 border rounded-2xl outline-none text-xs font-mono" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Primary Headline</label>
                  <textarea value={siteConfig.heroTitle} onChange={(e) => handleUpdateConfig('heroTitle', e.target.value)} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none font-black text-lg h-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Candle Stock</h2>
            <button onClick={() => setIsAdding(!isAdding)} className="bg-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-gray-800 transition-all text-sm">
              {isAdding ? 'Close' : 'New Candle'}
            </button>
          </div>

          {isAdding && (
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-xl mb-10 border-amber-100 animate-slideDown">
              <h3 className="text-xl font-bold mb-6">Create Candle Listing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Candle Name</label>
                  <input type="text" placeholder="e.g., Midnight Rose" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Base Price (EGP)</label>
                  <input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className={inputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Discount (%)</label>
                  <input type="number" value={newProduct.discountPercentage} onChange={e => setNewProduct({...newProduct, discountPercentage: parseFloat(e.target.value)})} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Scent Profile Image (URL or JPG Upload)</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste image URL..." 
                      value={newProduct.imageUrl && !newProduct.imageUrl.startsWith('data:') ? newProduct.imageUrl : ''}
                      onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} 
                      className={`${inputClass} text-xs font-mono flex-grow`} 
                    />
                    <label className="cursor-pointer bg-white border border-gray-200 hover:border-amber-500 px-4 py-3 rounded-xl flex items-center justify-center transition-all group min-w-[3.5rem]">
                      <span className="text-xl group-hover:scale-110 transition-transform">📸</span>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg" 
                        className="hidden" 
                        onChange={handleFileChange} 
                      />
                    </label>
                  </div>
                  {newProduct.imageUrl && newProduct.imageUrl.startsWith('data:') && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-10 h-10 rounded-lg border overflow-hidden">
                        <img src={newProduct.imageUrl} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[9px] text-green-500 font-bold uppercase tracking-widest">JPG Uploaded Successfully</p>
                      <button onClick={() => setNewProduct({...newProduct, imageUrl: ''})} className="text-[9px] text-red-400 font-bold uppercase tracking-widest hover:text-red-600 underline">Clear</button>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Scent Description</label>
                  <textarea placeholder="Describe the atmosphere..." value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className={`${inputClass} h-24`} />
                </div>
              </div>
              <button onClick={handleAdd} className="mt-8 w-full py-5 bg-amber-600 text-white rounded-[2rem] font-black shadow-lg shadow-amber-100">Publish to Mizo Store</button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                  <div>
                    <div className="font-black text-gray-900">{p.name}</div>
                    <div className="text-xs text-amber-600 font-bold uppercase tracking-widest">{p.price} EGP (-{p.discountPercentage}%)</div>
                  </div>
                </div>
                <button onClick={() => onUpdateProducts(products.filter(item => item.id !== p.id))} className="p-4 text-red-300 hover:text-red-500 transition-colors">
                  <span className="text-xl">🗑️</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
