
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Camera, X, Sparkles, ChefHat, HelpCircle, UtensilsCrossed, ExternalLink, Activity, History as HistoryIcon, CheckCircle, Search, AlertCircle, ShieldCheck as ShieldIcon, Calendar, ChevronRight, Trash2, Zap, AlertTriangle, ArrowUpDown, ChevronDown, ChevronUp, CheckSquare, Check, Key, Tag, Apple, Salad, Drumstick, Croissant, Wheat, Soup, Box } from 'lucide-react';
import { Button, Card, Section, Badge } from './ui';
import { analyzeFoodQuality, QualityAnalysisResult, generateRecipesFromSurplus, RecipeSuggestion, DetectedItem } from '../services/geminiService';

interface QualityCheckProps {
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
}

// --- SUB-COMPONENTS ---

const QuotaErrorView: React.FC<{ onRetry: () => void; onSelectKey: () => void }> = ({ onRetry, onSelectKey }) => (
  <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 text-center space-y-6 animate-in zoom-in duration-300 shadow-xl border border-rose-100 dark:border-rose-900/30">
    <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto">
      <AlertCircle size={40} className="text-rose-500" />
    </div>
    <div className="space-y-2">
      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Kuota API Habis</h3>
      <p className="text-sm text-slate-500 leading-relaxed">
        Anda telah mencapai batas penggunaan API gratis. Silakan coba lagi beberapa saat lagi atau gunakan API Key Anda sendiri dari Google AI Studio.
      </p>
    </div>
    <div className="flex flex-col gap-3">
      <Button onClick={onRetry} variant="outline" className="w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest border-2">
        Coba Lagi
      </Button>
      <Button onClick={onSelectKey} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">
        <Key size={16} /> Ganti API Key Mandiri
      </Button>
    </div>
    <p className="text-[10px] text-slate-400">
      Key mandiri memberikan kuota yang lebih besar dan stabil.
    </p>
  </div>
);

const RecipeCard: React.FC<{ recipe: RecipeSuggestion }> = ({ recipe }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMoreSteps = recipe.instructions && recipe.instructions.length > 3;
  const displayedSteps = isExpanded ? recipe.instructions : (recipe.instructions || []).slice(0, 3);

  const handleCookpadLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!recipe.sourceUrl) {
      e.preventDefault();
      alert("Link resep tidak tersedia.");
      return;
    }
    const url = recipe.sourceUrl.startsWith('http') ? recipe.sourceUrl : `https://${recipe.sourceUrl}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    e.preventDefault();
  };

  return (
    <Card className="p-0 overflow-hidden border-none shadow-lg rounded-[2.5rem] bg-white dark:bg-gray-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="p-6 bg-slate-50/50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight pr-2">{recipe.title}</h3>
        <Badge color={recipe.difficulty === 'Mudah' ? 'green' : recipe.difficulty === 'Sedang' ? 'blue' : 'red'}>
          {recipe.difficulty}
        </Badge>
      </div>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bahan Surplus:</p>
          <div className="flex flex-wrap gap-2">
            {(recipe.ingredientsUsed || []).map((ing, i) => (
              <span key={i} className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-bold rounded-lg border border-primary/10 lowercase">
                {ing}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Langkah Memasak:</p>
            {hasMoreSteps && (
              <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-gray-800 rounded-full text-[9px] font-black text-primary uppercase tracking-wider">
                {isExpanded ? 'Tutup' : `+${recipe.instructions.length - 3} Langkah`}
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}
          </div>
          <div className="space-y-4">
            {displayedSteps.map((step, sIdx) => (
              <div key={sIdx} className="flex gap-4 items-start group">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-400 text-[10px] font-black flex items-center justify-center border border-slate-200 dark:border-gray-700">{sIdx + 1}</span>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
        <a href={recipe.sourceUrl || '#'} onClick={handleCookpadLink} className="flex items-center justify-between bg-primary text-white p-5 rounded-3xl transition-all font-black text-[10px] uppercase tracking-[0.1em] shadow-lg shadow-primary/20 active:scale-95">
          Masak di Cookpad <ExternalLink size={16} />
        </a>
      </div>
    </Card>
  );
};

const ScannerView: React.FC<{
  image: string | null;
  setImage: (img: string | null) => void;
  input: string;
  setInput: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}> = ({ image, setImage, input, setInput, onAnalyze, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="w-full h-64 bg-white dark:bg-gray-900 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer relative overflow-hidden group hover:border-primary/50 transition-all shadow-sm" onClick={() => !image && fileInputRef.current?.click()}>
        {image ? (
          <>
            <img src={image} className="w-full h-full object-cover" alt="Scan preview" />
            <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-full p-2 shadow-lg"><X size={16}/></button>
          </>
        ) : (
          <div className="text-slate-400 text-center px-8">
            <div className="w-16 h-16 bg-slate-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-gray-700">
              <Camera size={28} className="text-slate-400 opacity-50"/>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-1 uppercase tracking-tight">Ambil Foto Pangan</p>
            <p className="text-[10px] opacity-70 font-medium leading-relaxed text-balance">AI akan memverifikasi kesegaran, kehalalan, dan skor higienitas secara instan.</p>
          </div>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
          }
        }} />
      </div>
      <textarea className="w-full bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/50 dark:text-white transition-all resize-none shadow-sm" placeholder="Contoh: Roti sisa hari ini, masih dalam plastik..." rows={3} value={input} onChange={e => setInput(e.target.value)} />
      <Button className="w-full h-14 text-white text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/30 rounded-2xl" isLoading={isLoading} disabled={!image && !input} onClick={onAnalyze}>Mulai Verifikasi AI</Button>
    </div>
  );
};

const AnalysisDashboard: React.FC<{ result: QualityAnalysisResult; onNewScan: () => void; onGoToRecipes: () => void }> = ({ result, onNewScan, onGoToRecipes }) => {
  const [activeItemCategory, setActiveItemCategory] = useState<string>('Semua');
  
  const categoryIcons: Record<string, any> = {
    'Buah': <Apple size={14} />,
    'Sayur': <Salad size={14} />,
    'Protein': <Drumstick size={14} />,
    'Karbohidrat': <Wheat size={14} />,
    'Olahan': <Box size={14} />,
    'Roti': <Croissant size={14} />,
    'Bumbu': <Soup size={14} />,
    'Lainnya': <Tag size={14} />
  };

  const categories = ['Semua', 'Buah', 'Sayur', 'Protein', 'Karbohidrat', 'Olahan', 'Roti', 'Bumbu', 'Lainnya'];

  const filteredItems = activeItemCategory === 'Semua' 
    ? result.detectedItems 
    : result.detectedItems.filter(item => item.category === activeItemCategory);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl border border-white/10">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">Quality Percentage</p>
              <h2 className="text-6xl font-black tracking-tighter">{result.qualityPercentage}%</h2>
            </div>
            <div className={`p-4 rounded-3xl ${result.isSafe ? 'bg-emerald-500' : 'bg-rose-500'} shadow-lg animate-pulse`}>
              {result.isSafe ? <CheckCircle size={36} /> : <AlertCircle size={36} />}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/5 group hover:bg-white/20 transition-all">
              <p className="text-[10px] uppercase font-bold opacity-60 mb-1 tracking-widest">Hygiene Score</p>
              <p className="text-xl font-black flex items-center gap-2"><Zap size={20} className="text-yellow-400 fill-yellow-400"/> {result.hygieneScore}/100</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/5 group hover:bg-white/20 transition-all">
              <p className="text-[10px] uppercase font-bold opacity-60 mb-1 tracking-widest">Status Halal</p>
              <p className="text-xl font-black flex items-center gap-2">
                <ShieldIcon size={20} className={result.isHalal ? 'text-emerald-400 fill-emerald-400/20' : 'text-rose-400'}/>
                {result.isHalal ? 'Halal' : 'Non-Halal'}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
      </div>

      <Section title="📦 Item Terdeteksi">
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setActiveItemCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 ${activeItemCategory === cat ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 border-slate-100 dark:border-gray-700 text-slate-400'}`}
              >
                {categoryIcons[cat]} {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {filteredItems.length > 0 ? filteredItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-2xl shadow-sm animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary">
                    {categoryIcons[item.category] || <Tag size={16} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.category}</p>
                  </div>
                </div>
                <Badge color="blue" className="rounded-lg">Terdeteksi</Badge>
              </div>
            )) : (
              <div className="py-12 text-center bg-slate-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-gray-700">
                <Search size={32} className="mx-auto text-slate-300 mb-2 opacity-50" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tidak ada item di kategori ini</p>
              </div>
            )}
          </div>
        </div>
      </Section>

      <Section title="⚠️ Alergen & Keamanan">
        <Card className={`p-5 border-none shadow-md overflow-hidden relative rounded-[2rem] ${result.allergens.length > 0 ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-emerald-50 dark:bg-emerald-950/20'}`}>
          {result.allergens.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">{result.allergens.map((alg, i) => (<Badge key={i} color="red" className="px-4 py-1.5 font-black uppercase tracking-widest text-[9px] rounded-xl shadow-sm">{alg}</Badge>))}</div>
              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold leading-relaxed border-t border-rose-200 dark:border-rose-900/50 pt-3 flex items-center gap-2"><AlertTriangle size={14}/> Waspada: Mengandung alergen di atas.</p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-full text-white"><Check size={16} strokeWidth={4}/></div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Aman: Tidak ada alergen umum terdeteksi secara visual.</p>
            </div>
          )}
        </Card>
      </Section>

      <Section title="💡 Rekomendasi Penyimpanan">
        <div className="space-y-3">
          {(result.storageTips || []).map((tip, i) => (
            <div key={i} className="flex gap-4 p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-slate-100 dark:border-gray-800 shadow-sm group hover:border-primary/30 transition-all">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 font-black text-xs group-hover:bg-primary group-hover:text-white transition-colors">{i+1}</div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed pt-2">{tip}</p>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex gap-4 pt-4 pb-12">
        <Button variant="outline" onClick={onNewScan} className="flex-1 h-14 rounded-3xl font-black text-[10px] uppercase border-2 tracking-widest">Cek Baru</Button>
        <Button onClick={onGoToRecipes} className="flex-1 h-14 rounded-3xl text-white font-black text-[10px] uppercase shadow-xl shadow-primary/30 tracking-widest"><ChefHat size={18}/> Rekomendasi Resep</Button>
      </div>
    </div>
  );
};

// --- MAIN SCREEN COMPONENT ---

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
  const [sortBy, setSortBy] = useState<'title' | 'difficulty'>('title');
  const [historySearch, setHistorySearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState<'all' | 'safe' | 'risky'>('all');
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | 'multiple' | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  const qualityHistory = globalState.qualityHistory || [];

  const handleSelectKey = async () => {
    try {
      if (window.aistudio?.openSelectKey) {
        await window.aistudio.openSelectKey();
        setIsQuotaExceeded(false);
      } else {
        alert("Fitur pemilihan API Key tidak tersedia di lingkungan ini.");
      }
    } catch (error) {
      console.error("Error opening key selector:", error);
    }
  };

  const confirmDelete = (id: number | 'multiple') => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const fetchRecipes = async (isMore = false) => {
    if (!result?.detectedItems) return;
    if (isMore) setIsMoreLoading(true); else setIsRecipeLoading(true);
    try {
      const newRecipes = await generateRecipesFromSurplus(result.detectedItems, recipes.map(r => r.title), iteration);
      if (newRecipes.length === 0) setCanLoadMore(false);
      setRecipes(prev => isMore ? [...prev, ...newRecipes] : newRecipes);
      setIteration(prev => prev + 1);
    } catch (error) { 
      console.error(error); 
    } finally {
      setIsRecipeLoading(false);
      setIsMoreLoading(false);
    }
  };

  useEffect(() => {
    if (activeMode === 'recipe' && result && recipes.length === 0 && !isRecipeLoading) {
      fetchRecipes();
    }
  }, [activeMode, result]);

  const processedRecipes = useMemo(() => {
    let filtered = recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || (r.ingredientsUsed || []).some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase())));
    if (difficultyFilter) filtered = filtered.filter(r => r.difficulty === difficultyFilter);
    return [...filtered].sort((a, b) => sortBy === 'title' ? a.title.localeCompare(b.title) : 0);
  }, [recipes, searchQuery, difficultyFilter, sortBy]);

  const filteredHistory = useMemo(() => {
    return qualityHistory.filter((item: any) => {
      const names = (item.details.detectedItems || []).map((i: any) => i.name.toLowerCase()).join(' ');
      const matchesSearch = names.includes(historySearch.toLowerCase());
      const matchesStatus = historyFilter === 'all' ? true : historyFilter === 'safe' ? item.details.isSafe : !item.details.isSafe;
      return matchesSearch && matchesStatus;
    });
  }, [qualityHistory, historySearch, historyFilter]);

  const handleAnalysis = async () => {
     setIsLoading(true);
     setResult(null);
     setIsQuotaExceeded(false);
     setRecipes([]);
     setIteration(1);
     setCanLoadMore(true);
     try {
       const response = await analyzeFoodQuality(ingredientInput ? [ingredientInput] : [], image || undefined);
       setResult(response);
       const historyItem = { id: Date.now(), date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), details: response, thumbnail: image };
       setGlobalState('qualityHistory', [historyItem, ...qualityHistory]);
     } catch (e: any) { 
       console.error(e);
       if (e.message?.includes("429") || e.message?.includes("quota") || e.message?.includes("RESOURCE_EXHAUSTED")) {
         setIsQuotaExceeded(true);
       } else {
         alert("Terjadi kesalahan sistem. Silakan coba beberapa saat lagi."); 
       }
     } finally { 
       setIsLoading(false); 
     }
  };

  const toggleSelectHistory = (id: number) => {
    const newSelected = new Set(selectedHistoryIds);
    if (newSelected.has(id)) newSelected.delete(id); else newSelected.add(id);
    setSelectedHistoryIds(newSelected);
  };

  const selectAllHistory = () => {
    if (selectedHistoryIds.size === filteredHistory.length && filteredHistory.length > 0) {
      setSelectedHistoryIds(new Set());
    } else {
      setSelectedHistoryIds(new Set(filteredHistory.map((item: any) => item.id)));
    }
  };

  const executeDelete = () => {
    let newHistory = qualityHistory;
    if (itemToDelete === 'multiple') {
      newHistory = qualityHistory.filter((item: any) => !selectedHistoryIds.has(item.id));
      setSelectedHistoryIds(new Set());
    } else {
      newHistory = qualityHistory.filter((item: any) => item.id !== itemToDelete);
    }
    setGlobalState('qualityHistory', newHistory);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950 relative transition-colors">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight uppercase">
          <div className="bg-primary p-1.5 rounded-lg text-white shadow-lg shadow-primary/20"><Sparkles size={18}/></div>AI Food Rescue
        </h1>
        <button onClick={() => setShowTips(true)} className="p-2 bg-slate-100 dark:bg-gray-800 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><HelpCircle size={20} /></button>
      </div>

      <div className="px-4 pt-4 pb-2">
         <div className="flex bg-slate-200/50 dark:bg-gray-800 p-1 rounded-2xl">
            {['scan', 'recipe', 'history'].map((mode) => (
              <button key={mode} onClick={() => setActiveMode(mode as any)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all ${activeMode === mode ? 'bg-white dark:bg-gray-700 text-primary shadow-md' : 'text-slate-500'}`}>
                {mode === 'scan' ? 'Cek Kualitas' : mode === 'recipe' ? 'Resep' : 'Riwayat'}
              </button>
            ))}
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-28 no-scrollbar">
        {activeMode === 'scan' ? (
          isQuotaExceeded ? (
            <QuotaErrorView onRetry={() => setIsQuotaExceeded(false)} onSelectKey={handleSelectKey} />
          ) : !result ? (
            <ScannerView image={image} setImage={setImage} input={ingredientInput} setInput={setIngredientInput} onAnalyze={handleAnalysis} isLoading={isLoading} />
          ) : (
            <AnalysisDashboard result={result} onNewScan={() => { setResult(null); setImage(null); }} onGoToRecipes={() => setActiveMode('recipe')} />
          )
        ) : activeMode === 'recipe' ? (
           <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
              <div className="flex flex-col gap-4">
                 <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Inspirasi Menu Surplus</h2>
                 <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" className="w-full bg-white dark:bg-gray-800 border-none rounded-3xl pl-14 pr-6 py-4 text-sm focus:ring-4 focus:ring-primary/5 dark:text-white shadow-sm" placeholder="Cari masakan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                 </div>
              </div>
              {isRecipeLoading ? (
                 <div className="flex flex-col items-center justify-center py-24"><Activity className="animate-spin mb-4 text-primary" size={36} /><p className="text-xs font-black uppercase tracking-widest text-slate-400">Meracik resep cerdas...</p></div>
              ) : processedRecipes.length > 0 ? (
                 <div className="space-y-6">
                    {processedRecipes.map((recipe, idx) => (<RecipeCard key={idx} recipe={recipe} />))}
                    {canLoadMore && (<Button variant="ghost" className="w-full py-4 text-[10px] font-black uppercase tracking-widest text-primary" onClick={() => fetchRecipes(true)} isLoading={isMoreLoading}>Lihat Lebih Banyak Resep</Button>)}
                 </div>
              ) : (
                 <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2.5rem]"><UtensilsCrossed size={48} className="mx-auto text-slate-200 mb-4" /><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Resep belum tersedia</p></div>
              )}
           </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-left duration-500 pb-20">
            <div className="sticky top-0 bg-slate-50 dark:bg-gray-950 z-20 space-y-4 pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Riwayat Analisis</h2>
                {qualityHistory.length > 0 && (
                   <div className="flex items-center gap-3">
                      {selectedHistoryIds.size > 0 && (
                        <button onClick={() => confirmDelete('multiple')} className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20"><Trash2 size={12}/> Hapus ({selectedHistoryIds.size})</button>
                      )}
                      <button onClick={selectAllHistory} className={`flex items-center gap-2 px-4 py-2 rounded-2xl transition-all border ${selectedHistoryIds.size === filteredHistory.length && filteredHistory.length > 0 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-slate-400 border-slate-100 dark:border-gray-700'}`}>
                         <CheckSquare size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Pilih Semua</span>
                      </button>
                   </div>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl pl-12 pr-4 py-3 text-xs focus:ring-4 focus:ring-primary/5 dark:text-white shadow-sm" placeholder="Cari riwayat..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
              </div>
            </div>
            {filteredHistory.length > 0 ? (
              <div className="space-y-4">
                {filteredHistory.map((item: any) => {
                  const isSelected = selectedHistoryIds.has(item.id);
                  return (
                    <Card key={item.id} className={`p-4 border-none shadow-sm bg-white dark:bg-gray-900 flex gap-4 items-center rounded-3xl transition-all relative ${isSelected ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-950' : 'hover:shadow-md'}`} onClick={() => selectedHistoryIds.size > 0 ? toggleSelectHistory(item.id) : null}>
                      <button onClick={(e) => { e.stopPropagation(); toggleSelectHistory(item.id); }} className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border-2 transition-all ${isSelected ? 'bg-primary border-primary text-white' : 'bg-slate-50 dark:bg-gray-800 border-slate-100 dark:border-gray-700 text-transparent'}`}><Check size={14} strokeWidth={4} /></button>
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-50 dark:border-gray-800">
                        {item.thumbnail ? <img src={item.thumbnail} className="w-full h-full object-cover" alt="History" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><HistoryIcon size={24}/></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar size={10}/> {item.date}</p>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">{(item.details.detectedItems || []).map((i: any) => i.name).join(', ')}</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <Badge color={item.details.qualityPercentage > 60 ? 'green' : 'red'} className="text-[8px] px-1.5 py-0.5 rounded-lg">Kualitas: {item.details.qualityPercentage}%</Badge>
                           <Badge color="blue" className="text-[8px] px-1.5 py-0.5 rounded-lg flex items-center gap-1"><Zap size={8} className="fill-blue-500/20"/> Higienitas: {item.details.hygieneScore}</Badge>
                           {selectedHistoryIds.size === 0 && (<button onClick={() => {setResult(item.details); setImage(item.thumbnail); setActiveMode('scan');}} className="ml-auto text-primary p-1 hover:bg-primary/10 rounded-lg transition-colors"><ChevronRight size={18}/></button>)}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm"><HistoryIcon size={48} className="mx-auto text-slate-100 mb-4" /><p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Kosong</p></div>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/10">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
              <h3 className="text-center font-black text-xl dark:text-white mb-2 uppercase tracking-tight">Hapus Riwayat</h3>
              <p className="text-center text-slate-500 text-xs mb-8">Data yang dihapus tidak dapat dikembalikan.</p>
              <div className="flex flex-col gap-3">
                 <button onClick={executeDelete} className="w-full h-14 bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Hapus Selamanya</button>
                 <button onClick={() => setShowDeleteConfirm(false)} className="w-full h-14 bg-slate-100 dark:bg-gray-800 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest">Batal</button>
              </div>
           </div>
        </div>
      )}

      {showTips && (
         <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowTips(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 w-full max-w-sm animate-in zoom-in duration-300 shadow-2xl" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-start mb-6"><div className="bg-primary/10 p-3 rounded-2xl text-primary"><Sparkles size={24}/></div><button onClick={() => setShowTips(false)} className="p-2 text-slate-400 rounded-full"><X size={20}/></button></div>
               <h3 className="font-black text-2xl dark:text-white mb-4 tracking-tight uppercase">AI Verification</h3>
               <p className="text-xs text-slate-500 leading-relaxed mb-8">Memanfaatkan Gemini 3 Flash Vision untuk memverifikasi setiap gram makanan surplus agar layak dikonsumsi dan higienis.</p>
               <Button className="w-full h-14 text-white font-black uppercase tracking-widest rounded-2xl" onClick={() => setShowTips(false)}>Saya Mengerti</Button>
            </div>
         </div>
      )}
    </div>
  );
};
