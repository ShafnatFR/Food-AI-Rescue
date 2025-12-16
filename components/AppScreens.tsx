import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, SlidersHorizontal, MapPin, Clock, ArrowRight, User as UserIcon, Settings, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Edit2, Info, Calendar, Percent, Truck, Shield, HelpCircle, LogOut, Store, Leaf, TrendingUp, MessageCircle, Heart, Bookmark, CheckCircle, Lock, Camera, Mail, Phone, MoreVertical, Archive, Trash2, CheckSquare, Square, Eye, Grid, History, Plus, X, Home, Building2, Briefcase, Coffee, Utensils, Star, Moon, Sun, AlertCircle, UploadCloud, Sparkles } from 'lucide-react';
import { ScreenName, User } from '../types';
import { Button, Input, Header, ScreenLayout, ScrollableContent, ListItem, Card, Section, Badge } from './ui';

interface AppScreenProps {
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  user?: User;
  onSwitchMode?: (mode: 'USER' | 'PARTNER') => void;
  userMode?: 'USER' | 'PARTNER';
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
  isDarkMode?: boolean;
  toggleTheme?: () => void;
}

// Algoritma Sederhana "AI Matching" sesuai Proposal
const calculateMatchScore = (item: any) => {
  let score = 0;

  // 1. Prioritas Jarak (Semakin dekat, skor makin tinggi)
  // Asumsi format distance: "0.5 km"
  const distance = parseFloat(item.distance.split(' ')[0]);
  if (distance < 1.0) score += 50;       // Sangat dekat (< 1km)
  else if (distance < 3.0) score += 30;  // Dekat (< 3km)
  else score += 10;

  // 2. Prioritas Urgensi Waktu (Mencegah Basi)
  // Asumsi format timeLeft: "Hari ini, s/d 21:00"
  if (item.timeLeft.includes("s/d 12:00") || item.timeLeft.includes("Segera")) {
     score += 40; // Kritis
  } else if (item.timeLeft.includes("Hari ini")) {
     score += 20; // Sedang
  }

  // 3. Prioritas Stok (Habiskan stok sedikit dulu)
  const qty = parseInt(item.quantity.split(' ')[0]);
  if (qty < 3) score += 15;

  return score;
};

export const HomeScreen: React.FC<AppScreenProps> = ({ navigate, setGlobalState, globalState }) => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showCategoryWidget, setShowCategoryWidget] = useState(false);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const savedItems = globalState.savedItems || [];

  const toggleSave = (id: number) => {
    let newSaved;
    if (savedItems.includes(id)) {
      newSaved = savedItems.filter((itemId: number) => itemId !== id);
    } else {
      newSaved = [...savedItems, id];
    }
    setGlobalState('savedItems', newSaved);
  };

  const handleReservation = (item: any) => {
    setGlobalState('reservationItem', item);
    navigate('PARTNER_DETAIL');
  };

  const handleQuickReservation = (item: any) => {
    setGlobalState('reservationItem', item);
    navigate('RESERVATION_FORM');
  };

  // Data Mockup untuk Feed Makanan Surplus
  const allFoodFeed = [
    {
      id: 1,
      partner: "Bakery Pagi Sore",
      status: "Buka",
      foodName: "Roti Manis & Donat Sisa Produksi",
      distance: "0.5 km",
      timeLeft: "Hari ini, s/d 21:00",
      quantity: "5 Paket",
      image: "https://picsum.photos/400/200?random=101",
      avatar: "https://picsum.photos/100/100?random=1",
      tags: ["Roti", "Manis"],
      category: "Roti & Kue",
      deliveryType: 'pickup',
      dateAdded: "Hari ini, 08:00"
    },
    {
      id: 2,
      partner: "Restoran Padang Murah",
      status: "Buka",
      foodName: "Nasi Lauk Campur (Layak Makan)",
      distance: "1.2 km",
      timeLeft: "Hari ini, s/d 17:00",
      quantity: "2 Porsi",
      image: "https://picsum.photos/400/200?random=102",
      avatar: "https://picsum.photos/100/100?random=2",
      tags: ["Berat", "Halal"],
      category: "Makanan Berat",
      deliveryType: 'delivery',
      dateAdded: "Hari ini, 11:30"
    },
    {
      id: 3,
      partner: "Toko Buah Segar Jaya",
      status: "Buka",
      foodName: "Paket Buah Potong & Jus",
      distance: "2.0 km",
      timeLeft: "Hari ini, s/d 19:00",
      quantity: "8 Paket",
      image: "https://picsum.photos/400/200?random=103",
      avatar: "https://picsum.photos/100/100?random=3",
      tags: ["Sehat", "Vegan"],
      category: "Sayur & Buah",
      deliveryType: 'pickup',
      dateAdded: "Hari ini, 13:00"
    },
    {
      id: 4,
      partner: "Kopi Senja",
      status: "Buka",
      foodName: "Es Kopi Susu Gula Aren",
      distance: "0.8 km",
      timeLeft: "Hari ini, s/d 22:00",
      quantity: "4 Cup",
      image: "https://picsum.photos/400/200?random=104",
      avatar: "https://picsum.photos/100/100?random=4",
      tags: ["Minuman", "Kopi"],
      category: "Minuman",
      deliveryType: 'delivery',
      dateAdded: "Hari ini, 15:00"
    }
  ];

  // 1. Filter dasar (Kategori)
  let processedFeed = activeCategory === 'Semua'
    ? allFoodFeed
    : activeCategory === 'Tersimpan'
      ? allFoodFeed.filter(item => savedItems.includes(item.id))
      : allFoodFeed.filter(item => item.category === activeCategory);

  // 2. AI MATCHING: Sortir berdasarkan Skor Kecocokan
  // Ini memenuhi janji "Optimasi Logistik" di proposal
  processedFeed = processedFeed.map(item => ({
    ...item,
    matchScore: calculateMatchScore(item) // Hitung skor
  })).sort((a, b) => b.matchScore - a.matchScore); // Urutkan dari skor tertinggi

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    setShowSearchOverlay(false);
    navigate('EXPLORE');
  };

  const moreCategories = [
    { name: 'Daging', icon: '🥩' },
    { name: 'Ikan & Seafood', icon: '🐟' },
    { name: 'Susu & Olahan', icon: '🥛' },
    { name: 'Siap Saji', icon: '🍱' },
    { name: 'Bahan Pokok', icon: '🌾' },
    { name: 'Cemilan', icon: '🍿' },
    { name: 'Frozen Food', icon: '❄️' },
    { name: 'Sehat & Diet', icon: '🥗' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 relative transition-colors duration-300">
      {/* Header */}
      <div className="p-6 pb-2 bg-white dark:bg-gray-800 shrink-0 z-20 shadow-sm relative transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-pink-100 overflow-hidden border border-gray-100 dark:border-gray-700">
               <img src="https://picsum.photos/100/100?random=1" alt="Avatar" className="w-full h-full object-cover" />
             </div>
             {/* Lokasi Widget - Interactive */}
             <div onClick={() => navigate('LOCATION_SELECT')} className="cursor-pointer">
               <p className="text-xs text-gray-500 dark:text-gray-400">Lokasi Anda,</p>
               <div className="flex items-center gap-1">
                 <h3 className="font-bold text-gray-900 dark:text-white text-sm">Jakarta Pusat</h3>
                 <ChevronRight size={14} className="text-primary" />
               </div>
             </div>
          </div>
          <button onClick={() => navigate('NOTIFICATIONS')} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full relative transition-colors">
            <Bell size={24} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
          </button>
        </div>

        {/* Search Bar - Triggers Overlay */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            className="w-full pl-11 pr-12 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white shadow-sm cursor-text" 
            placeholder="Cari makanan di sekitar..." 
            onClick={() => setShowSearchOverlay(true)}
            readOnly
          />
          <button 
             onClick={() => navigate('EXPLORE')}
             className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
             <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Categories - Fixed in Header */}
        <div className="pb-2">
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             <button 
                onClick={() => setShowCategoryWidget(true)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium shadow-sm whitespace-nowrap border flex items-center gap-1 transition-all ${showCategoryWidget ? 'bg-gray-800 text-white border-gray-800' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
             >
                <Grid size={12} /> Lainnya
             </button>

             {['Semua', 'Tersimpan', 'Roti & Kue', 'Makanan Berat', 'Sayur & Buah', 'Minuman'].map(cat => (
               <button 
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setShowCategoryWidget(false); }}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium shadow-sm whitespace-nowrap border transition-all ${activeCategory === cat ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
               >
                 {cat === 'Tersimpan' && <Bookmark size={10} className="inline mr-1" fill="currentColor" />}
                 {cat}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* SEARCH OVERLAY */}
      {showSearchOverlay && (
        <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col animate-in fade-in duration-200">
           <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex gap-3 items-center">
              <button onClick={() => setShowSearchOverlay(false)}><ChevronLeft size={24} className="text-gray-600 dark:text-gray-300" /></button>
              <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                 <input 
                    autoFocus
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white"
                    placeholder="Cari makanan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                 />
                 {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={16}/></button>}
              </form>
              <button onClick={handleSearchSubmit} className="text-primary font-bold text-sm">Cari</button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
              {/* Keywords */}
              <div className="mb-6">
                 <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Pencarian Populer</h4>
                 <div className="flex flex-wrap gap-2">
                    {['Roti Tawar', 'Nasi Padang', 'Buah Segar', 'Martabak', 'Sayur Organik'].map(k => (
                       <button key={k} onClick={() => { setSearchQuery(k); handleSearchSubmit(); }} className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-primary transition-colors">
                          {k}
                       </button>
                    ))}
                 </div>
              </div>

              {/* Quick Recommendations */}
              <div>
                 <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Rekomendasi</h4>
                 <div className="space-y-3">
                    {[1, 2].map(i => (
                       <div key={i} onClick={() => navigate('PARTNER_DETAIL')} className="flex gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2 shadow-sm active:scale-[0.98] transition-transform">
                          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shrink-0">
                             <img src={`https://picsum.photos/100/100?random=${i+20}`} className="w-full h-full object-cover"/>
                          </div>
                          <div>
                             <h5 className="font-bold text-gray-900 dark:text-white text-sm">Paket Hemat Hari Ini</h5>
                             <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bakery Makmur • 0.5 km</p>
                             <p className="text-primary font-bold text-xs">Rp 12.000</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MORE CATEGORIES MODAL */}
      {showCategoryWidget && (
         <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in" onClick={() => setShowCategoryWidget(false)}>
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Semua Kategori</h3>
                  <button onClick={() => setShowCategoryWidget(false)}><X size={24} className="text-gray-500 dark:text-gray-400" /></button>
               </div>
               
               <div className="grid grid-cols-4 gap-4">
                  {moreCategories.map((cat, idx) => (
                     <button 
                        key={idx} 
                        onClick={() => { setActiveCategory(cat.name); setShowCategoryWidget(false); }}
                        className="flex flex-col items-center gap-2 group"
                     >
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-2xl group-hover:border-primary group-hover:bg-orange-50 dark:group-hover:bg-gray-700 transition-colors">
                           {cat.icon}
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium leading-tight">{cat.name}</span>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}

      {/* Scrollable Content - Forum Feed Style */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 space-y-6 pb-28">
        
        {/* Community Banner */}
        <div className="w-full bg-gradient-to-r from-primary to-orange-400 rounded-3xl p-5 text-white shadow-lg shadow-orange-200 dark:shadow-none relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-lg font-bold mb-1">Forum Berbagi Makanan</h2>
             <p className="text-xs text-orange-50 mb-4 max-w-[70%]">Lihat surplus makanan yang dibagikan mitra hari ini.</p>
             <div className="flex gap-2">
                <button 
                    onClick={() => navigate('MAP_VIEW')}
                    className="bg-white text-primary px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Peta Lokasi
                </button>
                <button 
                  onClick={() => navigate('CREATE_REQUEST')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-orange-700 transition-colors"
                >
                  Buat Request
                </button>
             </div>
           </div>
           <div className="absolute right-[-10px] bottom-[-20px] opacity-20 transform rotate-12">
             <MessageCircle size={100} />
           </div>
        </div>

        {/* FEED MAKANAN */}
        <div>
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {activeCategory === 'Semua' ? 'Baru Dibagikan' : activeCategory === 'Tersimpan' ? 'Makanan Tersimpan' : `Kategori: ${activeCategory}`}
             </h3>
             <button 
                onClick={() => navigate('EXPLORE')} 
                className="text-xs text-primary font-bold cursor-pointer hover:underline"
             >
                Lihat Semua
             </button>
          </div>
          
          <div className="space-y-5">
             {processedFeed.length > 0 ? (
               processedFeed.map((item) => (
                 <div 
                    key={item.id} 
                    className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer group relative"
                    onClick={() => handleReservation(item)}
                 >
                   {/* TAMBAHAN: Badge Rekomendasi AI jika skor tinggi */}
                   {(item as any).matchScore > 20 && (
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-primary to-orange-600 text-white text-[10px] font-bold px-3 py-1 rounded-br-xl z-20 shadow-sm flex items-center gap-1">
                         <Sparkles size={10} /> Paling Cocok Untukmu
                      </div>
                   )}

                   {/* Header Kartu */}
                   <div className="p-3 flex items-center gap-3 border-b border-gray-50 dark:border-gray-700">
                      <img src={item.avatar} className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-600" />
                      <div className="flex-1">
                         <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                           {item.partner}
                         </h4>
                         <div className="flex items-center gap-2 mt-0.5">
                           <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-bold ${item.status === 'Buka' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 text-red-700'}`}>
                             {item.status}
                           </span>
                           <span className="text-[10px] text-gray-500 dark:text-gray-400">• {item.distance}</span>
                         </div>
                      </div>
                      {/* Bookmark Button */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleSave(item.id); }} 
                        className="text-gray-400 hover:text-primary transition-colors z-20"
                      >
                        <Bookmark size={20} fill={savedItems.includes(item.id) ? "currentColor" : "none"} className={savedItems.includes(item.id) ? "text-primary" : ""} />
                      </button>
                   </div>

                   {/* Gambar Utama */}
                   <div className="h-40 bg-gray-100 relative overflow-hidden">
                     <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Food" />
                     
                     {/* Badge Moved Inside Image */}
                     <div className="absolute top-2 right-2 z-10">
                        {item.deliveryType === 'delivery' ? (
                           <span className="flex items-center gap-1 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                              <Truck size={10} /> Dikirim
                           </span>
                        ) : (
                           <span className="flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                              <Store size={10} /> Ambil di Tempat
                           </span>
                        )}
                     </div>

                     <div className="absolute bottom-3 left-3 flex gap-2">
                        {item.tags.map(tag => (
                          <span key={tag} className="bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold text-gray-800 shadow-sm">
                            {tag}
                          </span>
                        ))}
                     </div>
                   </div>

                   {/* Body Kartu */}
                   <div className="p-4">
                     <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight">{item.foodName}</h3>
                     </div>
                     
                     {/* Info tambahan tanggal */}
                     <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-500 dark:text-gray-300 font-medium">
                           <Calendar size={12} /> Dibuat: {item.dateAdded}
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                       <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-medium">
                          <Clock size={14} /> {item.timeLeft}
                       </div>
                       <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                       <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                          <Leaf size={14} /> Sisa {item.quantity}
                       </div>
                     </div>

                     <Button className="w-full py-2.5 text-sm rounded-xl h-10" onClick={(e) => { e.stopPropagation(); handleQuickReservation(item); }}>Ambil Makanan</Button>
                   </div>
                 </div>
               ))
             ) : (
               <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-600">
                  <Info size={40} className="mb-2 opacity-50" />
                  <p className="text-sm">Tidak ada makanan untuk kategori ini.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AddAddressScreen: React.FC<AppScreenProps> = ({ navigate, goBack, globalState, setGlobalState }) => {
// ... rest of the file remains unchanged
  const isEditing = !!globalState?.editingAddress;
  const initialData = globalState?.editingAddress || {};

  const [hasChanges, setHasChanges] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const [selectedIcon, setSelectedIcon] = useState(initialData.iconType || 'home');
  const [selectedColor, setSelectedColor] = useState(initialData.color || 'bg-orange-500');
  const [formData, setFormData] = useState({
    label: initialData.title || '',
    receiver: initialData.receiver || 'Joko Susilo',
    phone: initialData.phone || '+62 812-345-6789',
    provinsi: '',
    kota: '',
    kecamatan: '',
    kelurahan: '',
    rt: '',
    rw: '',
    kodepos: '',
    detail: initialData.desc || '',
  });

  const handleInputChange = (field: string, value: string) => {
     setFormData({ ...formData, [field]: value });
     if (!hasChanges) setHasChanges(true);
  };

  const handleBack = () => {
     if (hasChanges) {
        setShowExitConfirm(true);
     } else {
        setGlobalState('editingAddress', null);
        goBack();
     }
  };

  const icons = [
    { id: 'home', icon: Home, label: 'Rumah' },
    { id: 'office', icon: Building2, label: 'Kantor' },
    { id: 'briefcase', icon: Briefcase, label: 'Kerja' },
    { id: 'store', icon: Store, label: 'Toko' },
    { id: 'coffee', icon: Coffee, label: 'Kafe' },
    { id: 'food', icon: Utensils, label: 'Makan' },
    { id: 'star', icon: Star, label: 'Favorit' },
    { id: 'other', icon: MapPin, label: 'Lainnya' },
  ];

  const colors = [
    { id: 'bg-orange-500', class: 'bg-orange-500' },
    { id: 'bg-red-500', class: 'bg-red-500' },
    { id: 'bg-green-500', class: 'bg-green-500' },
    { id: 'bg-blue-500', class: 'bg-blue-500' },
    { id: 'bg-purple-500', class: 'bg-purple-500' },
    { id: 'bg-pink-500', class: 'bg-pink-500' },
    { id: 'bg-gray-800', class: 'bg-gray-800' },
  ];

  const handleSave = () => {
    // Logic to update globalState addresses
    const newAddress = {
      id: isEditing ? initialData.id : Date.now(),
      title: formData.label || 'Alamat Baru',
      desc: formData.detail || 'Detail alamat...',
      type: selectedIcon,
      receiver: formData.receiver,
      phone: formData.phone
    };

    let updatedAddresses;
    if (isEditing) {
      updatedAddresses = globalState.addresses.map((a: any) => a.id === initialData.id ? newAddress : a);
    } else {
      updatedAddresses = [...(globalState.addresses || []), newAddress];
    }

    setGlobalState('addresses', updatedAddresses);
    setGlobalState('editingAddress', null); 
    goBack();
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 flex flex-col transition-colors duration-300 relative">
       {/* ... existing code ... */}
       {/* Exit Confirmation Modal */}
       {showExitConfirm && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6 animate-in fade-in">
             <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                   <AlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 dark:text-white mb-2">Batalkan Perubahan?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Perubahan yang belum disimpan akan hilang jika Anda kembali.</p>
                <div className="flex gap-3">
                   <Button variant="outline" onClick={() => setShowExitConfirm(false)} className="flex-1 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700">Lanjut Edit</Button>
                   <Button variant="primary" className="flex-1 bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-none" onClick={() => { setGlobalState('editingAddress', null); goBack(); }}>Ya, Batalkan</Button>
                </div>
             </div>
          </div>
       )}

       <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 shrink-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
         <button onClick={handleBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
            <ChevronLeft size={24} />
         </button>
         <h1 className="font-bold text-lg text-gray-900 dark:text-white">{isEditing ? 'Edit Alamat' : 'Tambah Alamat'}</h1>
       </div>
       
       <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-8">
          
          {/* Section: Icon & Color */}
          <div className="space-y-4">
             <label className="text-sm font-bold text-gray-900 dark:text-white block">Ikon Alamat</label>
             <div className="flex gap-4">
                <div className={`w-20 h-20 rounded-2xl ${selectedColor} flex items-center justify-center text-white shadow-lg shrink-0 transition-colors duration-300`}>
                    {(() => {
                      const Icon = icons.find(i => i.id === selectedIcon)?.icon || MapPin;
                      return <Icon size={32} />;
                    })()}
                </div>
                <div className="flex-1 grid grid-cols-4 gap-2">
                   {icons.slice(0,8).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { setSelectedIcon(item.id); if(!hasChanges) setHasChanges(true); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                          selectedIcon === item.id
                            ? 'border-primary bg-orange-50 text-primary dark:bg-gray-800 dark:border-primary'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <item.icon size={16} />
                      </button>
                   ))}
                </div>
             </div>
             
             {/* Color Picker */}
             <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {colors.map((c) => (
                   <button
                      key={c.id}
                      onClick={() => { setSelectedColor(c.id); if(!hasChanges) setHasChanges(true); }}
                      className={`w-8 h-8 rounded-full shrink-0 transition-all ${c.class} ${selectedColor === c.id ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                   ></button>
                ))}
             </div>
          </div>
          
          {/* Form Inputs */}
          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
             <Input 
                label="Label Alamat" 
                placeholder="Contoh: Rumah Budi" 
                icon={<MapPin size={18} />} 
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
             />
             <Input 
                label="Nama Penerima" 
                placeholder="Joko Susilo" 
                icon={<UserIcon size={18} />} 
                value={formData.receiver}
                onChange={(e) => handleInputChange('receiver', e.target.value)}
             />
             <Input 
                label="Nomor Telepon" 
                placeholder="+62 8xx xxxx xxxx" 
                icon={<Phone size={18} />} 
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
             />
             
             {/* Detailed Address Fields Grid */}
             <div className="space-y-3">
               <label className="text-sm font-bold text-gray-900 dark:text-white block">Detail Lokasi</label>
               
               <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Provinsi" value={formData.provinsi} onChange={(e) => handleInputChange('provinsi', e.target.value)} />
                  <Input placeholder="Kota/Kabupaten" value={formData.kota} onChange={(e) => handleInputChange('kota', e.target.value)} />
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Kecamatan" value={formData.kecamatan} onChange={(e) => handleInputChange('kecamatan', e.target.value)} />
                  <Input placeholder="Kelurahan/Desa" value={formData.kelurahan} onChange={(e) => handleInputChange('kelurahan', e.target.value)} />
               </div>
               <div className="grid grid-cols-3 gap-3">
                  <Input placeholder="RT" type="number" value={formData.rt} onChange={(e) => handleInputChange('rt', e.target.value)} />
                  <Input placeholder="RW" type="number" value={formData.rw} onChange={(e) => handleInputChange('rw', e.target.value)} />
                  <Input placeholder="Kode Pos" type="number" value={formData.kodepos} onChange={(e) => handleInputChange('kodepos', e.target.value)} />
               </div>
             </div>
          </div>
       </div>

       <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <Button onClick={handleSave}>Simpan Alamat</Button>
       </div>
    </div>
  );
};

export const NotificationScreen: React.FC<AppScreenProps> = ({ navigate, goBack }) => {
// ... rest of the file remains unchanged
   const [activeTab, setActiveTab] = useState('Semua');
   const categories = ['Semua', 'Pesanan', 'Promo', 'Sistem', 'Sampah'];
   
   const [notifications, setNotifications] = useState([
      { id: 1, title: 'Pesanan Dikonfirmasi', msg: 'Pesanan makanan Anda di Restoran Sederhana telah dikonfirmasi.', time: 'Baru saja', type: 'Pesanan', read: false },
      { id: 2, title: 'Promo Spesial', msg: 'Diskon 50% untuk pengambilan di atas jam 8 malam!', time: '2 jam lalu', type: 'Promo', read: true },
      { id: 3, title: 'Pengingat', msg: 'Jangan lupa ambil pesanan Anda sebelum jam 17:00.', time: '5 jam lalu', type: 'Sistem', read: true },
      { id: 4, title: 'Poin Reward', msg: 'Selamat! Anda mendapatkan 10 poin dari transaksi terakhir.', time: '1 hari lalu', type: 'Promo', read: true },
   ]);

   const filteredNotifs = activeTab === 'Semua' 
      ? notifications.filter(n => n.type !== 'Sampah') // Hide trash from 'All'
      : notifications.filter(n => n.type === activeTab);

   const handleArchive = (id: number) => {
      // In real app: call API
      alert(`Notifikasi #${id} diarsipkan`);
   };

   const handleDelete = (id: number) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, type: 'Sampah' } : n));
      // If already in trash, maybe delete permanently?
      if (activeTab === 'Sampah') {
         setNotifications(prev => prev.filter(n => n.id !== id));
      }
   };

   return (
      <div className="h-full bg-white dark:bg-gray-900 flex flex-col relative transition-colors duration-300">
         <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-4 shrink-0 bg-white dark:bg-gray-900 z-20 shadow-sm">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button onClick={goBack} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-600 dark:text-gray-300">
                     <ChevronLeft size={24} />
                  </button>
                  <h1 className="font-bold text-lg text-gray-900 dark:text-white">Notifikasi</h1>
               </div>
               <button className="text-xs text-primary font-bold">Tandai Dibaca</button>
            </div>
            
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
               {categories.map(cat => (
                  <button 
                     key={cat}
                     onClick={() => setActiveTab(cat)}
                     className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${activeTab === cat ? 'bg-primary text-white border-primary' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'}`}
                  >
                     {cat}
                  </button>
               ))}
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-0 no-scrollbar relative">
            <div className="p-4 text-xs text-center text-gray-400">
               Geser kiri untuk Hapus, kanan untuk Arsip
            </div>
            {filteredNotifs.length > 0 ? filteredNotifs.map((notif) => (
               <SwipeableNotificationItem 
                  key={notif.id} 
                  data={notif} 
                  onArchive={() => handleArchive(notif.id)} 
                  onDelete={() => handleDelete(notif.id)} 
               />
            )) : (
               <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
                  <Bell size={48} className="mb-4 opacity-20" />
                  <p className="text-sm">Tidak ada notifikasi</p>
               </div>
            )}
         </div>
      </div>
   );
};

export const ProfileScreen: React.FC<AppScreenProps> = ({ navigate, userMode, onSwitchMode, toggleTheme, isDarkMode, globalState, setGlobalState }) => {
// ... rest of the file remains unchanged
  const addresses = globalState.addresses || [];

  const handleDeleteAddress = (id: number) => {
     if (window.confirm("Apakah Anda yakin ingin menghapus alamat ini?")) {
        const updated = addresses.filter((a: any) => a.id !== id);
        setGlobalState('addresses', updated);
     }
  };

  const handleEditAddress = (address: any) => {
     setGlobalState('editingAddress', {
        id: address.id,
        title: address.title,
        desc: address.desc,
        iconType: address.type,
        receiver: address.receiver,
        phone: address.phone
     });
     navigate('ADD_ADDRESS');
  };

  return (
    <ScreenLayout>
      <div className="p-6 pb-2">
         <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profil Saya</h1>
         
         <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
               <img src="https://picsum.photos/200/200?random=user" className="w-full h-full object-cover" />
            </div>
            <div>
               <h3 className="font-bold text-lg text-gray-900 dark:text-white">Budi Santoso</h3>
               <p className="text-sm text-gray-500 dark:text-gray-400">budi.santoso@gmail.com</p>
               <Badge color="blue" className="mt-1">{userMode === 'USER' ? 'Pengguna' : 'Mitra'}</Badge>
            </div>
         </div>
      </div>

      <ScrollableContent className="p-0 px-6 pt-0">
         {/* Address Management Section */}
         <Section title="Daftar Alamat" className="dark:text-white">
            <div className="space-y-3">
               {addresses.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">Belum ada alamat tersimpan.</p>
               ) : (
                  addresses.map((addr: any) => (
                     <div key={addr.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex justify-between items-start group shadow-sm">
                        <div className="flex gap-3">
                           <div className="mt-1 text-primary">
                              {addr.type === 'home' ? <Home size={18} /> : addr.type === 'office' ? <Building2 size={18} /> : <MapPin size={18} />}
                           </div>
                           <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <h4 className="font-bold text-sm text-gray-900 dark:text-white">{addr.title}</h4>
                                 {addr.type === 'home' && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold">Utama</span>}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[180px]">{addr.desc}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{addr.receiver} • {addr.phone}</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => handleEditAddress(addr)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:text-orange-500 transition-colors">
                              <Edit2 size={14} />
                           </button>
                           <button onClick={() => handleDeleteAddress(addr.id)} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 size={14} />
                           </button>
                        </div>
                     </div>
                  ))
               )}
               <Button variant="outline" className="w-full border-dashed border-2 hover:bg-gray-50 dark:hover:bg-gray-800 mt-2" onClick={() => { setGlobalState('editingAddress', null); navigate('ADD_ADDRESS'); }}>
                  <Plus size={16} /> Tambah Alamat Baru
               </Button>
            </div>
         </Section>

         <Section title="Akun" className="dark:text-white">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
               <ListItem 
                  icon={<Edit2 size={20} />} 
                  title="Edit Profil" 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200"
                  onClick={() => navigate('EDIT_PROFILE')} 
               />
               <ListItem 
                  icon={<Lock size={20} />} 
                  title="Ganti Kata Sandi" 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200 border-t border-gray-50 dark:border-gray-700"
                  onClick={() => navigate('CHANGE_PASSWORD')} 
               />
               <ListItem 
                  icon={<Bell size={20} />} 
                  title="Notifikasi" 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200 border-t border-gray-50 dark:border-gray-700"
                  onClick={() => navigate('NOTIFICATION_SETTINGS')} 
               />
               {userMode === 'USER' && (
                  <ListItem 
                     icon={<Leaf size={20} />} 
                     title="Laporan Dampak" 
                     className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200 border-t border-gray-50 dark:border-gray-700"
                     onClick={() => navigate('IMPACT_REPORT')} 
                  />
               )}
            </div>
         </Section>

         <Section title="Preferensi" className="dark:text-white">
             <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-700">
                   <div className="flex items-center gap-4">
                      <div className="text-gray-400">{isDarkMode ? <Moon size={20} /> : <Sun size={20} />}</div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">Mode Gelap</p>
                   </div>
                   <button 
                      onClick={toggleTheme}
                      className={`w-11 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}`}
                   >
                      <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${isDarkMode ? 'left-[22px]' : 'left-0.5'}`}></div>
                   </button>
                </div>
                <ListItem 
                  icon={<HelpCircle size={20} />} 
                  title="Bantuan & FAQ" 
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-200"
                  onClick={() => navigate('HELP_FAQ')} 
               />
             </div>
         </Section>
         
         <button 
            onClick={() => navigate('LOGIN')}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors mt-2"
         >
            <LogOut size={20} /> Keluar
         </button>
         
         <div className="h-6"></div>
      </ScrollableContent>
    </ScreenLayout>
  );
};

export const EditProfileScreen: React.FC<AppScreenProps> = ({ navigate, goBack }) => {
   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900">
         <Header title="Edit Profil" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            <div className="flex justify-center mb-6 relative">
               <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white dark:border-gray-800 shadow-sm">
                  <img src="https://picsum.photos/200/200?random=user" className="w-full h-full object-cover" />
               </div>
               <button className="absolute bottom-0 right-[35%] bg-primary text-white p-2 rounded-full border-2 border-white dark:border-gray-800">
                  <Camera size={16} />
               </button>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); goBack(); }}>
               <Input label="Nama Lengkap" defaultValue="Budi Santoso" containerClassName="dark:text-white" />
               <Input label="Email" type="email" defaultValue="budi.santoso@gmail.com" containerClassName="dark:text-white" />
               <Input label="Nomor Telepon" type="tel" defaultValue="+62 812-3456-7890" containerClassName="dark:text-white" />
               <Input label="Bio" defaultValue="Food lover & saver!" containerClassName="dark:text-white" />
               
               <div className="pt-6">
                  <Button type="submit">Simpan Perubahan</Button>
               </div>
            </form>
         </ScrollableContent>
      </ScreenLayout>
   );
};

export const ChangePasswordScreen: React.FC<AppScreenProps> = ({ navigate, goBack }) => {
   const [showOld, setShowOld] = useState(false);
   const [showNew, setShowNew] = useState(false);
   const [showConfirm, setShowConfirm] = useState(false);

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900">
         <Header title="Ganti Kata Sandi" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
               Buat kata sandi baru yang kuat untuk melindungi akun Anda.
            </p>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); goBack(); }}>
               <Input 
                  label="Kata Sandi Lama" 
                  type={showOld ? "text" : "password"}
                  rightIcon={showOld ? <Eye size={20} /> : <Eye size={20} />} // Correct icon logic should be EyeOff/Eye
                  onRightIconClick={() => setShowOld(!showOld)}
                  containerClassName="dark:text-white" 
               />
               <Input 
                  label="Kata Sandi Baru" 
                  type={showNew ? "text" : "password"}
                  rightIcon={showNew ? <Eye size={20} /> : <Eye size={20} />}
                  onRightIconClick={() => setShowNew(!showNew)}
                  containerClassName="dark:text-white" 
               />
               <Input 
                  label="Konfirmasi Kata Sandi Baru" 
                  type={showConfirm ? "text" : "password"}
                  rightIcon={showConfirm ? <Eye size={20} /> : <Eye size={20} />}
                  onRightIconClick={() => setShowConfirm(!showConfirm)}
                  containerClassName="dark:text-white" 
               />
               
               <div className="pt-6">
                  <Button type="submit">Update Kata Sandi</Button>
               </div>
            </form>
         </ScrollableContent>
      </ScreenLayout>
   );
};

export const NotificationSettingsScreen: React.FC<AppScreenProps> = ({ navigate, goBack }) => {
   const [toggles, setToggles] = useState({
      promo: true,
      transaction: true,
      security: true,
      update: false
   });

   const toggle = (key: keyof typeof toggles) => {
      setToggles(prev => ({ ...prev, [key]: !prev[key] }));
   };

   const ToggleItem = ({ title, desc, active, onClick }: { title: string, desc: string, active: boolean, onClick: () => void }) => (
      <div className="flex justify-between items-center py-4 border-b border-gray-50 dark:border-gray-800">
         <div className="pr-4">
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
         </div>
         <button 
            onClick={onClick}
            className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${active ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
         >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-1 transition-all ${active ? 'left-[23px]' : 'left-1'}`}></div>
         </button>
      </div>
   );

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900">
         <Header title="Pengaturan Notifikasi" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            <Section title="Aktivitas" className="dark:text-white">
               <ToggleItem 
                  title="Transaksi & Pesanan" 
                  desc="Notifikasi status pesanan Anda." 
                  active={toggles.transaction} 
                  onClick={() => toggle('transaction')} 
               />
               <ToggleItem 
                  title="Promo & Diskon" 
                  desc="Info promo menarik untuk Anda." 
                  active={toggles.promo} 
                  onClick={() => toggle('promo')} 
               />
            </Section>
            
            <Section title="Sistem" className="dark:text-white">
               <ToggleItem 
                  title="Keamanan Akun" 
                  desc="Peringatan login dan perubahan akun." 
                  active={toggles.security} 
                  onClick={() => toggle('security')} 
               />
               <ToggleItem 
                  title="Update Aplikasi" 
                  desc="Fitur baru dan pembaruan sistem." 
                  active={toggles.update} 
                  onClick={() => toggle('update')} 
               />
            </Section>
         </ScrollableContent>
      </ScreenLayout>
   );
};

export const HelpScreen: React.FC<AppScreenProps> = ({ navigate, goBack }) => {
   const [openIndex, setOpenIndex] = useState<number | null>(null);

   const faqs = [
      { q: "Bagaimana cara melakukan reservasi?", a: "Pilih makanan yang Anda inginkan dari beranda atau peta, lalu klik 'Ambil Makanan'. Ikuti langkah pembayaran dan datang ke lokasi mitra sesuai waktu yang ditentukan." },
      { q: "Apakah makanan yang dijual aman?", a: "Ya, mitra kami berkomitmen untuk hanya menjual makanan yang masih layak konsumsi namun berlebih (surplus). Anda juga bisa menggunakan fitur 'Cek Kualitas' untuk memindai kondisi makanan." },
      { q: "Apa metode pembayaran yang tersedia?", a: "Kami mendukung pembayaran tunai (COD), E-Wallet (GoPay, OVO, Dana), dan transfer bank virtual account." },
      { q: "Bagaimana jika saya ingin membatalkan pesanan?", a: "Pesanan dapat dibatalkan maksimal 15 menit setelah pemesanan atau jika status belum 'Dikemas'. Hubungi layanan pelanggan untuk bantuan lebih lanjut." },
   ];

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900">
         <Header title="Bantuan & FAQ" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            <div className="relative mb-6">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white" placeholder="Cari pertanyaan..." />
            </div>

            <Section title="Pertanyaan Umum" className="dark:text-white">
               <div className="space-y-3">
                  {faqs.map((faq, i) => (
                     <div key={i} className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
                        <button 
                           onClick={() => setOpenIndex(openIndex === i ? null : i)}
                           className="flex justify-between items-center w-full p-4 text-left"
                        >
                           <h4 className="font-bold text-sm text-gray-900 dark:text-white pr-4">{faq.q}</h4>
                           {openIndex === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                        </button>
                        {openIndex === i && (
                           <div className="px-4 pb-4 pt-0 text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-50 dark:border-gray-700 mt-2 pt-3">
                              {faq.a}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </Section>

            <Section title="Hubungi Kami" className="dark:text-white">
               <Card className="flex items-center gap-4 dark:bg-gray-800 dark:border-gray-700">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-300">
                     <MessageCircle size={24} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-gray-900 dark:text-white text-sm">Chat Layanan Pelanggan</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400">Siap membantu 24/7</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-9 px-4">Chat</Button>
               </Card>
            </Section>
         </ScrollableContent>
      </ScreenLayout>
   );
};

// Helper component for Swipe Logic
const SwipeableNotificationItem: React.FC<{ data: any, onArchive: () => void, onDelete: () => void }> = ({ data, onArchive, onDelete }) => {
   const [startX, setStartX] = useState(0);
   const [offsetX, setOffsetX] = useState(0);
   const [isDragging, setIsDragging] = useState(false);

   // Touch Events
   const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.targetTouches[0].clientX);
      setIsDragging(true);
   };

   const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - startX;
      if (diff > -150 && diff < 150) {
         setOffsetX(diff);
      }
   };

   const handleTouchEnd = () => {
      setIsDragging(false);
      if (offsetX > 80) onArchive();
      else if (offsetX < -80) onDelete();
      setOffsetX(0);
   };

   // Mouse Events for testing
   const handleMouseDown = (e: React.MouseEvent) => {
      setStartX(e.clientX);
      setIsDragging(true);
   };

   const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const currentX = e.clientX;
      const diff = currentX - startX;
      if (diff > -150 && diff < 150) {
         setOffsetX(diff);
      }
   };

   const handleMouseUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      if (offsetX > 80) onArchive();
      else if (offsetX < -80) onDelete();
      setOffsetX(0);
   };

   const getBgColor = () => {
      if (offsetX > 30) return 'bg-green-500'; 
      if (offsetX < -30) return 'bg-red-500'; 
      return 'bg-white dark:bg-gray-900';
   };

   return (
      <div 
         className={`relative overflow-hidden border-b border-gray-50 dark:border-gray-800 ${getBgColor()}`}
         onMouseLeave={() => { if(isDragging) { setIsDragging(false); setOffsetX(0); } }}
      >
         <div className={`absolute inset-0 flex items-center justify-between px-6 text-white ${offsetX === 0 ? 'hidden' : ''}`}>
            <Archive size={24} className={offsetX > 0 ? 'opacity-100' : 'opacity-0'} />
            <Trash2 size={24} className={offsetX < 0 ? 'opacity-100' : 'opacity-0'} />
         </div>

         <div 
            className={`p-4 flex gap-4 bg-white dark:bg-gray-900 transition-transform ${isDragging ? '' : 'duration-300'}`}
            style={{ transform: `translateX(${offsetX}px)`, touchAction: 'pan-y' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
         >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
               data.type === 'Pesanan' ? 'bg-green-100 text-green-600' : 
               data.type === 'Promo' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
            }`}>
               {data.type === 'Pesanan' ? <CheckCircle size={20} /> : data.type === 'Promo' ? <Percent size={20} /> : <Info size={20} />}
            </div>
            <div className="flex-1 pointer-events-none select-none">
               <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{data.title}</h4>
                  <span className="text-[10px] text-gray-400">{data.time}</span>
               </div>
               <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{data.msg}</p>
            </div>
         </div>
      </div>
   );
};