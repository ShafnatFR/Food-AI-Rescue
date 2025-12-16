import React, { useState, useRef } from 'react';
import { Camera, X, Plus, Info, UploadCloud, AlertTriangle, CheckCircle, Heart, Share2, ChevronRight, ChevronLeft, Sparkles, Clock, History as HistoryIcon, Lightbulb, ShieldCheck, ThumbsDown, ThumbsUp, Activity } from 'lucide-react';
import { Button, Card, Section, Badge } from './ui';
import { analyzeFoodQuality, QualityAnalysisResult } from '../services/geminiService';

interface QualityCheckProps {
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
}

export const QualityCheckScreen: React.FC<QualityCheckProps> = ({ globalState, setGlobalState }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'tips' | 'history'>('scan');
  const [image, setImage] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<QualityAnalysisResult | null>(null);
  const [inputMode, setInputMode] = useState<'photo' | 'manual'>('photo');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    if (ingredientInput.trim()) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addIngredient();
    }
  };

  const handleAnalysis = async () => {
     setIsLoading(true);
     try {
       const response = await analyzeFoodQuality(ingredients, image || undefined);
       setResult(response);
       
       // Save to History
       const newHistoryItem = {
         id: Date.now(),
         date: new Date().toLocaleDateString(),
         summary: response.isSafe && response.isHalal ? "Aman & Halal" : "Perlu Perhatian",
         isSafe: response.isSafe,
         details: response
       };
       
       const currentHistory = globalState.qualityHistory || [];
       setGlobalState('qualityHistory', [newHistoryItem, ...currentHistory]);

     } catch (e) {
       console.error(e);
       alert("Gagal melakukan analisis. Silakan coba lagi.");
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="p-4 border-b border-gray-50 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cek Kualitas AI</h1>
        
        {/* Navigation Tabs (Top Right) */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
           <button onClick={() => setActiveTab('scan')} className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'scan' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Pindai</button>
           <button onClick={() => setActiveTab('tips')} className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'tips' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Tips</button>
           <button onClick={() => setActiveTab('history')} className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Riwayat</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-28">
        
        {activeTab === 'scan' && (
          <>
            {/* Input Toggle */}
            {!result && (
              <div className="flex gap-4 mb-2">
                 <button onClick={() => setInputMode('photo')} className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${inputMode === 'photo' ? 'border-primary bg-orange-50 dark:bg-gray-800 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                    <Camera size={20} />
                    <span className="text-xs font-bold">Foto</span>
                 </button>
                 <button onClick={() => setInputMode('manual')} className={`flex-1 py-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${inputMode === 'manual' ? 'border-primary bg-orange-50 dark:bg-gray-800 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                    <Plus size={20} />
                    <span className="text-xs font-bold">Manual</span>
                 </button>
              </div>
            )}

            {/* Input Section */}
            {!result && inputMode === 'photo' && (
              <div 
                className={`w-full h-48 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative overflow-hidden`}
                onClick={() => !image && fileInputRef.current?.click()}
              >
                 {image ? (
                    <>
                      <img src={image} className="w-full h-full object-cover" alt="Input" />
                      <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                         <X size={16} />
                      </button>
                    </>
                 ) : (
                    <div className="flex flex-col items-center text-gray-400 dark:text-gray-500">
                       <Camera size={32} className="mb-2 opacity-50" />
                       <span className="text-sm font-medium">Ketuk untuk ambil foto</span>
                    </div>
                 )}
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            )}

            {!result && inputMode === 'manual' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white"
                    placeholder="Contoh: Ayam, Bawang, Kecap..."
                  />
                  <Button variant="outline-primary" className="w-auto px-4" onClick={addIngredient}><Plus size={20} /></Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 min-h-[50px]">
                  {ingredients.length === 0 && <span className="text-xs text-gray-400 italic">Belum ada bahan ditambahkan.</span>}
                  {ingredients.map((ing, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 rounded-full text-xs font-medium text-orange-700 dark:text-orange-400 animate-in fade-in zoom-in duration-200">
                      {ing}
                      <button onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="text-orange-400 hover:text-red-500"><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis Button */}
            {!result && (
               <Button 
                  className="w-full mt-4 h-12 text-base" 
                  isLoading={isLoading} 
                  disabled={inputMode === 'photo' ? !image : ingredients.length === 0}
                  onClick={handleAnalysis}
               >
                  <Sparkles size={18} className="mr-2" /> Analisis Kualitas & Halal
               </Button>
            )}

            {/* Structured Result Section */}
            {result && (
              <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                 
                 {/* 1. Main Status Card */}
                 <div className={`rounded-3xl p-6 text-white shadow-lg ${result.isSafe && result.isHalal ? 'bg-gradient-to-br from-green-500 to-emerald-700' : 'bg-gradient-to-br from-red-500 to-rose-700'}`}>
                    <div className="flex justify-between items-start mb-4">
                       <div>
                          <h2 className="text-2xl font-bold mb-1">{result.isSafe ? "Makanan Aman" : "Tidak Disarankan"}</h2>
                          <p className="opacity-90 text-sm">{result.reasoning.substring(0, 80)}...</p>
                       </div>
                       <div className="bg-white/20 backdrop-blur p-2 rounded-xl">
                          {result.isSafe ? <CheckCircle size={32} /> : <ThumbsDown size={32} />}
                       </div>
                    </div>
                    
                    {/* Halal Badge */}
                    <div className="flex items-center gap-3 mt-4">
                       <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${result.isHalal ? 'bg-white/20 text-white' : 'bg-red-900/30 text-white'}`}>
                          <ShieldCheck size={14} /> {result.isHalal ? "HALAL CHECK: OK" : "NON-HALAL / SYUBHAT"}
                       </div>
                       <span className="text-xs opacity-75">{result.halalReasoning.substring(0, 40)}...</span>
                    </div>
                 </div>

                 {/* 2. Hygiene Score Bar */}
                 <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex justify-between items-end mb-2">
                       <h3 className="font-bold text-gray-900 dark:text-white text-sm">Skor Higienitas</h3>
                       <span className={`text-lg font-bold ${result.hygieneScore >= 7 ? 'text-green-500' : 'text-orange-500'}`}>{result.hygieneScore}/10</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                       <div 
                          className={`h-full rounded-full transition-all duration-1000 ${result.hygieneScore >= 7 ? 'bg-green-500' : 'bg-orange-500'}`} 
                          style={{ width: `${result.hygieneScore * 10}%` }}
                       ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 text-right">Berdasarkan visual kemasan & kondisi.</p>
                 </div>

                 {/* 3. Detailed Info */}
                 <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800">
                       <h4 className="font-bold text-orange-800 dark:text-orange-300 text-xs mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Alergen</h4>
                       <div className="flex flex-wrap gap-1">
                          {result.allergens.length > 0 ? result.allergens.map(a => (
                             <span key={a} className="text-[10px] px-2 py-1 bg-white dark:bg-gray-800 rounded border border-orange-200 dark:border-orange-700">{a}</span>
                          )) : <span className="text-xs text-gray-500">Tidak terdeteksi</span>}
                       </div>
                    </Card>
                    <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800">
                       <h4 className="font-bold text-blue-800 dark:text-blue-300 text-xs mb-2 flex items-center gap-1"><Clock size={12} /> Umur Simpan</h4>
                       <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">{result.shelfLifePrediction}</p>
                    </Card>
                 </div>

                 {/* 4. Full Analysis Text */}
                 <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Analisis Lengkap:</h4>
                    {result.reasoning}
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-orange-600 dark:text-orange-400 font-medium">
                       Halal Note: {result.halalReasoning}
                    </div>
                 </div>
                 
                 <Button variant="outline" onClick={() => { setResult(null); setImage(null); setIngredients([]); }} className="w-full">
                   Analisis Ulang
                 </Button>
              </section>
            )}
          </>
        )}

        {/* TIPS TAB */}
        {activeTab === 'tips' && (
           <div className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl flex gap-3 items-start">
                 <Lightbulb className="text-blue-500 mt-1 shrink-0" size={24} />
                 <div>
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-1">Pencahayaan itu Penting!</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">Pastikan makanan terkena cahaya yang cukup agar AI dapat melihat tekstur dan warna dengan jelas.</p>
                 </div>
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl">
                 <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Panduan Foto</h3>
                 <ul className="space-y-3">
                    <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400"><CheckCircle size={16} className="text-green-500 shrink-0" /> Fokuskan kamera pada objek makanan utama.</li>
                    <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400"><CheckCircle size={16} className="text-green-500 shrink-0" /> Hindari latar belakang yang terlalu ramai.</li>
                 </ul>
              </div>
           </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
           <div className="space-y-4 animate-in fade-in">
              {globalState.qualityHistory && globalState.qualityHistory.length > 0 ? (
                 globalState.qualityHistory.map((h: any) => (
                    <div key={h.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full"><Clock size={10} /> {h.date}</span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${h.isSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{h.isSafe ? 'Aman' : 'Peringatan'}</span>
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed font-bold">{h.summary}</p>
                       {h.details && <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">{h.details.reasoning}</p>}
                    </div>
                 ))
              ) : (
                 <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <HistoryIcon size={48} className="mb-3 opacity-20" />
                    <p className="text-sm">Belum ada riwayat analisis.</p>
                 </div>
              )}
           </div>
        )}
      </div>
    </div>
  );
};