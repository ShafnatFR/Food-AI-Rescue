
import React, { useState, useRef, useMemo } from 'react';
import { Camera, X, UploadCloud, ChevronLeft, Sparkles, ChefHat, HelpCircle, Timer, UtensilsCrossed, ExternalLink, Activity, History as HistoryIcon, Loader2, RefreshCw, CheckCircle, Search, SlidersHorizontal, Filter, AlertCircle, ShieldCheck as ShieldIcon, Info, Calendar, ChevronRight, Trash2, Leaf, Droplets, Zap, AlertTriangle, Carrot, Apple, Beef, Sandwich, Coffee, Utensils } from 'lucide-react';
import { Button, Card, Section, Badge, Input } from './ui';
import { analyzeFoodQuality, QualityAnalysisResult, generateRecipesFromSurplus, RecipeSuggestion, DetectedItem } from '../services/geminiService';

interface QualityCheckProps {
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
}

export const QualityCheckScreen: React.FC<QualityCheckProps> = ({ globalState, setGlobalState }) => {
  const [activeMode, setActiveMode] = useState<'scan' | 'recipe' | 'history'>('scan');
  const [showTips, setShowTips] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [result, setResult] = useState<QualityAnalysisResult | null>(null);
  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [iteration, setIteration] = useState(1);
  const [canLoadMore, setCanLoadMore] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qualityHistory = globalState.qualityHistory || [];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalysis = async () => {
     setIsLoading(true);
     setResult(null);
     setRecipes([]);
     setIteration(1);
     try {
       const response = await analyzeFoodQuality(ingredientInput ? [ingredientInput] : [], image || undefined);
       setResult(response);
       
       const historyItem = { 
         id: Date.now(), 
         date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), 
         details: response,
         thumbnail: image
       };
       setGlobalState('qualityHistory', [historyItem, ...qualityHistory]);
     } catch (e) {
       alert("Gagal melakukan analisis.");
     } finally {
       setIsLoading(false);
     }
  };

  const handleInitialRecipes = async () => {
    if (!result || result.detectedItems.length === 0) return;
    setIsRecipeLoading(true);
    setActiveMode('recipe');
    try {
      const suggested = await generateRecipesFromSurplus(result.detectedItems, [], 1);
      setRecipes(suggested);
      setIteration(2);
      if (suggested.length === 0) setCanLoadMore(false);
    } catch (e) {
      console.error("Gagal memuat resep.");
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!result || isMoreLoading || !canLoadMore) return;
    setIsMoreLoading(true);
    try {
      const existingTitles = recipes.map(r => r.title.toLowerCase());
      const moreRecipes = await generateRecipesFromSurplus(result.detectedItems, existingTitles, iteration);
      const uniqueNewRecipes = moreRecipes.filter(newRec => !existingTitles.includes(newRec.title.toLowerCase()));

      if (uniqueNewRecipes.length === 0) {
        setCanLoadMore(false);
      } else {
        setRecipes(prev => [...prev, ...uniqueNewRecipes]);
        setIteration(prev => prev + 1);
      }
    } catch (e) {
      console.error("Gagal memuat lebih banyak resep.");
    } finally {
      setIsMoreLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           recipe.ingredientsUsed.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDifficulty = difficultyFilter ? recipe.difficulty === difficultyFilter : true;
      return matchesSearch && matchesDifficulty;
    });
  }, [recipes, searchQuery, difficultyFilter]);

  // Grouping logic for ingredients
  const groupedItems = useMemo(() => {
    // FIX: Added explicit cast to help TypeScript infer detectedItems as an array
    const detectedItems = (result?.detectedItems as DetectedItem[]) || [];
    if (detectedItems.length === 0) return {};
    return detectedItems.reduce((acc, item) => {
      const cat = item.category || 'Lainnya';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item.name);
      return acc;
    }, {} as Record<string, string[]>);
  }, [result]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Buah': return <Apple size={16} />;
      case 'Sayur': return <Carrot size={16} />;
      case 'Protein': return <Beef size={16} />;
      case 'Roti': return <Sandwich size={16} />;
      case 'Minuman': return <Coffee size={16} />;
      case 'Bumbu': return <Utensils size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950 relative transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
          <div className="bg-primary p-1.5 rounded-lg text-white">
            <Sparkles size={18}/> 
          </div>
          AI Food Quality
        </h1>
        <button onClick={() => setShowTips(true)} className="p-2 bg-slate-100 dark:bg-gray-800 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
          <HelpCircle size={20} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-2">
         <div className="flex bg-slate-200/50 dark:bg-gray-800 p-1 rounded-2xl">
            {['scan', 'recipe', 'history'].map((mode) => (
              <button 
                key={mode}
                onClick={() => setActiveMode(mode as any)} 
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${activeMode === mode ? 'bg-white dark:bg-gray-700 text-primary shadow-md' : 'text-slate-500'}`}
              >
                {mode === 'scan' ? 'Verifikasi' : mode === 'recipe' ? 'Resep AI' : 'Riwayat'}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28 no-scrollbar">
        {activeMode === 'scan' ? (
          <>
            {!result ? (
               <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="w-full h-60 bg-white dark:bg-gray-900 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group hover:border-primary/50 transition-all shadow-sm" onClick={() => !image && fileInputRef.current?.click()}>
                     {image ? (
                       <>
                         <img src={image} className="w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <RefreshCw size={32} className="text-white animate-spin-slow" />
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg"><X size={16}/></button>
                       </>
                     ) : (
                       <div className="text-slate-400 text-center px-8">
                         <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-gray-700">
                           <Camera size={28} className="text-slate-400 opacity-50"/>
                         </div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Ambil Foto Bahan</p>
                         <p className="text-xs opacity-70">AI akan menganalisis visual makanan Anda secara mendalam.</p>
                       </div>
                     )}
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </div>
                  <textarea 
                    className="w-full bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-3xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 dark:text-white transition-all resize-none shadow-sm" 
                    placeholder="Sebutkan bahan atau berikan detail tambahan..." 
                    rows={3}
                    value={ingredientInput} 
                    onChange={e => setIngredientInput(e.target.value)} 
                  />
                  <Button className="w-full h-14 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20" isLoading={isLoading} disabled={!image && !ingredientInput} onClick={handleAnalysis}>
                    Mulai Verifikasi Pangan
                  </Button>
               </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                 {/* Visual Dashboard Card */}
                 <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Skor Kualitas AI</p>
                          <h2 className="text-5xl font-black">{result.qualityPercentage}%</h2>
                        </div>
                        <div className={`p-4 rounded-2xl ${result.isSafe ? 'bg-emerald-500' : 'bg-rose-500'} shadow-lg animate-pulse`}>
                          {result.isSafe ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                           <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Higienitas</p>
                           <p className="text-lg font-bold flex items-center gap-2"><Zap size={18} className="text-yellow-400"/> {result.hygieneScore}/100</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5">
                           <p className="text-[10px] uppercase font-bold opacity-60 mb-1">Kehalalan</p>
                           <p className="text-lg font-bold flex items-center gap-2">
                             <ShieldIcon size={18} className={result.isHalal ? 'text-emerald-400' : 'text-rose-400'}/>
                             {result.isHalal ? 'Halal' : 'Non-Halal'}
                           </p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
                 </div>

                 {/* Allergen Detection - NEW SECTION */}
                 <Section title="⚠️ Alergen yang Terdeteksi">
                    {/* FIX: Use defensive checks and explicit casting to resolve 'unknown' property error */}
                    <Card className={`p-5 border-none shadow-md overflow-hidden relative ${((result?.allergens as string[]) || []).length > 0 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'}`}>
                       <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-xl ${((result?.allergens as string[]) || []).length > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                             {((result?.allergens as string[]) || []).length > 0 ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">Status Alergen Pangan</h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Hasil Analisis Gemini 3</p>
                          </div>
                       </div>
                       
                       {/* FIX: Added explicit cast to string[] and used defensive check to handle property access on 'unknown' */}
                       {((result?.allergens as string[]) || []).length > 0 ? (
                          <div className="space-y-3">
                             <div className="flex flex-wrap gap-2">
                                {((result?.allergens as string[]) || []).map((alg, i) => (
                                   <Badge key={i} color="red" className="px-4 py-1.5 font-black uppercase tracking-widest text-[9px] rounded-lg">
                                      {alg}
                                   </Badge>
                                ))}
                             </div>
                             <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold leading-relaxed italic border-t border-rose-200 dark:border-rose-900/50 pt-2">
                                * Peringatan: Bahan ini mengandung alergen potensial. Hindari jika Anda memiliki sensitivitas diet.
                             </p>
                          </div>
                       ) : (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                             Tidak ada alergen umum yang terdeteksi secara visual dalam bahan ini.
                          </p>
                       )}
                    </Card>
                 </Section>

                 {/* Categorized Food Items - RE-IMPLEMENTED & IMPROVED */}
                 <Section title="📦 Kategori Surplus Terdeteksi">
                    <div className="space-y-4">
                       {Object.keys(groupedItems).length > 0 ? (
                         Object.entries(groupedItems).map(([category, items]) => (
                           <Card key={category} className="p-5 border-none bg-white dark:bg-gray-900 shadow-sm border-l-4 border-l-primary">
                             <div className="flex items-center justify-between mb-3">
                               <div className="flex items-center gap-2">
                                 <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                                    {getCategoryIcon(category)}
                                 </div>
                                 <h4 className="font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest">{category}</h4>
                               </div>
                               <Badge color="orange" className="px-2 py-0.5 text-[9px]">{items.length} Item</Badge>
                             </div>
                             <div className="flex flex-wrap gap-2">
                               {items.map((item, i) => (
                                 <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-xl text-xs font-bold border border-slate-100 dark:border-gray-700 shadow-xs">
                                   {item}
                                 </span>
                               ))}
                             </div>
                           </Card>
                         ))
                       ) : (
                         <div className="p-8 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-slate-200 dark:border-gray-800">
                            <p className="text-xs text-slate-400 font-medium">Gagal mengelompokkan bahan secara otomatis.</p>
                         </div>
                       )}
                    </div>
                 </Section>

                 {/* Eco Impact */}
                 <Section title="🌍 Dampak Penyelamatan">
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4 border-none bg-emerald-50 dark:bg-emerald-950/20 shadow-sm flex flex-col items-center text-center">
                          <Leaf size={24} className="text-emerald-600 mb-2" />
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">CO2 Disimpan</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{result.environmentalImpact.co2Saved}</p>
                        </Card>
                        <Card className="p-4 border-none bg-blue-50 dark:bg-blue-950/20 shadow-sm flex flex-col items-center text-center">
                          <Droplets size={24} className="text-blue-600 mb-2" />
                          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Air Dihemat</p>
                          <p className="text-lg font-black text-slate-900 dark:text-white">{result.environmentalImpact.waterSaved}</p>
                        </Card>
                    </div>
                 </Section>

                 {/* Storage Tips */}
                 <Section title="💡 Tips Penyimpanan Cerdas">
                    <div className="space-y-3">
                       {result.storageTips.map((tip, i) => (
                          <div key={i} className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-[1.5rem] border border-slate-100 dark:border-gray-800 shadow-sm group hover:border-primary/30 transition-all">
                             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 font-black text-xs group-hover:bg-primary group-hover:text-white transition-colors">{i+1}</div>
                             <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{tip}</p>
                          </div>
                       ))}
                    </div>
                 </Section>

                 {/* Hygiene Breakdown */}
                 <Section title="🔍 Analisis Higienitas">
                    <Card className="p-5 border-none bg-slate-100/50 dark:bg-gray-900/50 rounded-[2rem]">
                       <div className="space-y-4">
                          {result.hygieneBreakdown.map((item, i) => (
                             <div key={i} className="flex items-start gap-4">
                                <div className="p-1 bg-emerald-100 dark:bg-emerald-900/50 rounded-full shrink-0">
                                  <CheckCircle size={12} className="text-emerald-500" />
                                </div>
                                <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item}</span>
                             </div>
                          ))}
                       </div>
                    </Card>
                 </Section>

                 <div className="flex gap-4 pt-4 pb-12">
                    <Button variant="outline" onClick={() => { setResult(null); setImage(null); }} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase border-2">Scan Baru</Button>
                    <Button onClick={handleInitialRecipes} className="flex-1 h-14 rounded-2xl text-white font-black text-xs uppercase shadow-xl shadow-primary/30"><ChefHat size={20}/> Masak Yuk!</Button>
                 </div>
              </div>
            )}
          </>
        ) : activeMode === 'recipe' ? (
           <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
              <div className="flex flex-col gap-4">
                 <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Katalog Resep Anti-Waste</h2>
                    <Badge color="orange">Grounded AI</Badge>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text"
                      className="w-full bg-white dark:bg-gray-800 border-none rounded-[1.5rem] pl-14 pr-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 dark:text-white shadow-sm"
                      placeholder="Cari resep spesifik..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>

              {isRecipeLoading ? (
                 <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                    <Activity className="animate-spin mb-4 text-primary" size={36} />
                    <p className="text-sm font-black animate-pulse text-slate-900 dark:text-white">Gemini sedang meracik menu...</p>
                 </div>
              ) : filteredRecipes.length > 0 ? (
                 <div className="space-y-6">
                    {filteredRecipes.map((recipe, idx) => (
                       <Card key={idx} className="p-0 overflow-hidden border-none shadow-lg rounded-[2.5rem] bg-white dark:bg-gray-900">
                          <div className="p-6 bg-slate-50/50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
                             <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">{recipe.title}</h3>
                             <Badge color={recipe.difficulty === 'Mudah' ? 'green' : recipe.difficulty === 'Sedang' ? 'blue' : 'red'}>{recipe.difficulty}</Badge>
                          </div>
                          <div className="p-6 space-y-4">
                             <div className="bg-slate-50 dark:bg-gray-800 p-4 rounded-2xl italic text-xs text-slate-500 border border-slate-100 dark:border-gray-700">
                                "{recipe.instructions}"
                             </div>
                             {recipe.sourceUrl && (
                                <a href={recipe.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between bg-primary/10 hover:bg-primary text-primary hover:text-white p-5 rounded-3xl transition-all font-black text-[10px] uppercase tracking-[0.1em]">
                                   Lihat Resep Cookpad <ExternalLink size={16} />
                                </a>
                             )}
                          </div>
                       </Card>
                    ))}
                    {canLoadMore && (
                       <Button variant="outline" className="w-full h-16 border-dashed border-2 rounded-[2rem] bg-white dark:bg-gray-900" isLoading={isMoreLoading} onClick={handleLoadMore}>Muat Lebih Banyak</Button>
                    )}
                 </div>
              ) : (
                 <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2.5rem]">
                    <UtensilsCrossed size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Resep tidak ditemukan</p>
                    <p className="text-xs text-slate-300 mt-2 px-12 leading-relaxed">Pastikan Anda sudah melakukan verifikasi bahan terlebih dahulu.</p>
                 </div>
              )}
           </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-left duration-500 pb-10">
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Riwayat Penyelamatan</h2>
            {qualityHistory.length > 0 ? (
              <div className="space-y-4">
                {qualityHistory.map((item: any) => (
                  <Card key={item.id} className="p-4 border-none shadow-sm bg-white dark:bg-gray-900 flex gap-4 items-center rounded-3xl hover:shadow-md transition-shadow">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-50 dark:border-gray-800">
                      {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><HistoryIcon size={24}/></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-1"><Calendar size={10}/> {item.date}</p>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.details.detectedItems.map((i: any) => i.name).join(', ')}</h4>
                      <div className="flex items-center gap-2 mt-2">
                         <span className={`text-[9px] font-black px-2 py-0.5 rounded text-white ${item.details.qualityPercentage > 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}>Score: {item.details.qualityPercentage}%</span>
                         <button onClick={() => {setResult(item.details); setImage(item.thumbnail); setActiveMode('scan');}} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline ml-auto">Detail &rarr;</button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm">
                <HistoryIcon size={48} className="mx-auto text-slate-100 mb-4" />
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Riwayat Kosong</p>
                <p className="text-xs text-slate-300 mt-2">Mulai scan makanan Anda untuk menyimpannya di sini.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showTips && (
         <div className="absolute inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 w-full max-w-sm animate-in zoom-in duration-300 shadow-2xl border border-white/10">
               <div className="flex justify-between items-start mb-6">
                  <div className="bg-primary/10 p-3 rounded-2xl text-primary"><Sparkles size={24}/></div>
                  <button onClick={() => setShowTips(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"><X size={20}/></button>
               </div>
               <h3 className="font-black text-2xl dark:text-white mb-4 tracking-tight">Teknologi Gemini 3</h3>
               <div className="space-y-6">
                  {[
                    {t: "Verifikasi Pangan", d: "Mendeteksi kesegaran, kehalalan, dan kategori bahan secara akurat."},
                    {t: "Deteksi Alergen", d: "Peringatan otomatis untuk bahan yang berisiko bagi kesehatan Anda."},
                    {t: "Dampak Lingkungan", d: "Menghitung kontribusi Anda dalam mengurangi limbah karbon."}
                  ].map((p, i) => (
                    <div key={i} className="flex gap-4">
                       <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-gray-800 flex items-center justify-center font-black text-sm dark:text-white shrink-0">{i+1}</div>
                       <div>
                          <p className="text-xs font-black uppercase tracking-widest mb-1 dark:text-white">{p.t}</p>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.d}</p>
                       </div>
                    </div>
                  ))}
               </div>
               <Button className="w-full mt-10 h-14 text-white font-black uppercase tracking-widest shadow-xl shadow-primary/30" onClick={() => setShowTips(false)}>Mulai Penyelamatan</Button>
            </div>
         </div>
      )}
    </div>
  );
};
