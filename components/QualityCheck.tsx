import React, { useState, useRef } from 'react';
import { Camera, X, Plus, Info, UploadCloud, AlertTriangle, CheckCircle, Heart, Share2, ChevronRight, ChevronLeft, Sparkles, Clock, History as HistoryIcon, Lightbulb } from 'lucide-react';
import { Button, Card, Section } from './ui';
import { analyzeFoodQuality } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

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
  const [result, setResult] = useState<string | null>(null);
  const [questionStep, setQuestionStep] = useState(0);
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
         summary: response.substring(0, 50) + "...",
         isSafe: response.toLowerCase().includes("safe") || response.toLowerCase().includes("aman")
       };
       
       const currentHistory = globalState.qualityHistory || [];
       setGlobalState('qualityHistory', [newHistoryItem, ...currentHistory]);

     } catch (e) {
       console.error(e);
       setResult("Maaf, terjadi kesalahan saat menganalisis. Silakan coba lagi.");
     } finally {
       setIsLoading(false);
     }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="p-4 border-b border-gray-50 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cek Kualitas</h1>
        
        {/* Navigation Tabs (Top Right) */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-1">
           <button 
             onClick={() => setActiveTab('scan')} 
             className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'scan' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Pindai
           </button>
           <button 
             onClick={() => setActiveTab('tips')} 
             className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'tips' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Tips
           </button>
           <button 
             onClick={() => setActiveTab('history')} 
             className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${activeTab === 'history' ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
           >
             Riwayat
           </button>
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
                       <div className="w-12 h-12 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-2 shadow-sm">
                          <Camera size={24} />
                       </div>
                       <span className="text-sm font-medium">Ketuk untuk ambil foto</span>
                       <span className="text-xs text-gray-400 mt-1">atau pilih dari galeri</span>
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
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-white transition-all"
                    placeholder="Contoh: Ayam, Bawang, Kecap..."
                  />
                  <Button 
                    variant="outline-primary" 
                    className="w-auto px-4 py-3 rounded-xl bg-white border-orange-200 text-orange-500 font-medium dark:bg-gray-800 dark:border-gray-700"
                    onClick={addIngredient}
                  >
                     <Plus size={20} />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 min-h-[50px]">
                  {ingredients.length === 0 && <span className="text-xs text-gray-400 italic">Belum ada bahan ditambahkan.</span>}
                  {ingredients.map((ing, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-orange-50 dark:bg-orange-900/30 border border-orange-100 dark:border-orange-800 rounded-full text-xs font-medium text-orange-700 dark:text-orange-400 animate-in fade-in zoom-in duration-200">
                      {ing}
                      <button onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))} className="text-orange-400 hover:text-red-500">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis Button */}
            {!result && (
               <Button 
                  className="w-full mt-4" 
                  isLoading={isLoading} 
                  disabled={inputMode === 'photo' ? !image : ingredients.length === 0}
                  onClick={handleAnalysis}
               >
                  <Sparkles size={18} className="mr-2" /> Analisis Kualitas
               </Button>
            )}

            {/* Result Section */}
            {result && (
              <section className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
                 <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 relative overflow-hidden shadow-md">
                    <div className="flex items-center gap-2 mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                       <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400 shadow-sm">
                          <CheckCircle size={18} />
                       </div>
                       <h3 className="font-bold text-gray-900 dark:text-white">Hasil Analisis AI</h3>
                    </div>
                    
                    <div className="prose prose-sm text-gray-700 dark:text-gray-300 leading-relaxed relative z-10 max-h-96 overflow-y-auto pr-2">
                       <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                 </div>
                 
                 <Button variant="outline" onClick={() => { setResult(null); setQuestionStep(0); setImage(null); setIngredients([]); }} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-sm w-full">
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
                    <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                       <CheckCircle size={16} className="text-green-500 shrink-0" />
                       Fokuskan kamera pada objek makanan utama.
                    </li>
                    <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                       <CheckCircle size={16} className="text-green-500 shrink-0" />
                       Hindari latar belakang yang terlalu ramai.
                    </li>
                    <li className="flex gap-3 text-xs text-gray-600 dark:text-gray-400">
                       <CheckCircle size={16} className="text-green-500 shrink-0" />
                       Ambil foto dari jarak dekat (15-30cm).
                    </li>
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
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
                             <Clock size={10} /> {h.date}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${h.isSafe ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {h.isSafe ? 'Aman' : 'Peringatan'}
                          </span>
                       </div>
                       <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                          {h.summary}
                       </p>
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