import React, { useState, useEffect } from 'react';
import { MapPin, Search, Star, Clock, ShoppingBag, Leaf, DollarSign, Award, Share2, Heart, Filter, CheckCircle, User as UserIcon, Phone, FileText, Send, X, Home, Info, ChevronRight, Store, Wallet, CreditCard, Banknote, ChevronDown, ChevronLeft, Building2, MessageCircle, Calendar } from 'lucide-react';
import { ScreenName } from '../types';
import { Button, Input, ScreenLayout, Header, ScrollableContent, Section, Card, Badge, ListItem } from './ui';
import { analyzeImpact } from '../services/geminiService';

interface FeatureProps {
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
}

// --- 1. EXPLORE SCREEN ---
export const ExploreScreen: React.FC<FeatureProps> = ({ navigate, goBack }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const filters = ["Semua", "Terdekat", "Termurah", "Terbaru", "Paling Populer"];
  
  // Data Mockup
  const allFoodFeed = [
    { id: 1, partner: "Bakery Pagi Sore", status: "Buka", foodName: "Roti Manis & Donat", distance: "0.5 km", timeLeft: "s/d 21:00", quantity: "5 Paket", image: "https://picsum.photos/400/200?random=101", tags: ["Roti", "Manis"], price: "15.000", dateAdded: "Hari ini" },
    { id: 2, partner: "Restoran Padang Murah", status: "Buka", foodName: "Nasi Lauk Campur", distance: "1.2 km", timeLeft: "s/d 17:00", quantity: "2 Porsi", image: "https://picsum.photos/400/200?random=102", tags: ["Berat", "Halal"], price: "20.000", dateAdded: "Hari ini" },
    { id: 3, partner: "Hotel Bintang Lima", status: "Tutup", foodName: "Pastry & Buah Potong", distance: "3.0 km", timeLeft: "s/d 10:00", quantity: "10+ Paket", image: "https://picsum.photos/400/200?random=103", tags: ["Mewah"], price: "25.000", dateAdded: "Kemarin" },
    { id: 4, partner: "Warteg Bahari Jaya", status: "Buka", foodName: "Paket Sayur & Lauk", distance: "0.3 km", timeLeft: "s/d 20:00", quantity: "4 Porsi", image: "https://picsum.photos/400/200?random=104", tags: ["Murah"], price: "10.000", dateAdded: "Hari ini" }
  ];

  const filteredItems = allFoodFeed.filter(item => 
     item.foodName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.partner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenLayout bgClass="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Custom Header for Search */}
      <div className="p-4 bg-white dark:bg-gray-800 shadow-sm shrink-0 z-10 transition-colors">
         <div className="flex items-center gap-3 mb-3">
             <Button variant="ghost" size="sm" className="p-2 w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300" onClick={goBack}>
               <ChevronRight size={24} className="rotate-180" />
             </Button>
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                   autoFocus
                   className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary text-gray-900 dark:text-white" 
                   placeholder="Cari makanan, mitra..." 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <button onClick={() => setShowFilterModal(true)} className="p-2.5 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-600"><Filter size={20} /></button>
         </div>
         {/* Filter Chips */}
         <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map(filter => (
               <button 
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${activeFilter === filter ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
               >
                  {filter}
               </button>
            ))}
         </div>
      </div>

      {/* Content */}
      <ScrollableContent className="bg-gray-50 dark:bg-gray-900">
         {filteredItems.length > 0 ? filteredItems.map(item => (
            <Card key={item.id} onClick={() => navigate('PARTNER_DETAIL')} className="p-0 overflow-hidden flex h-32 group border-0 shadow-sm dark:bg-gray-800 dark:border-gray-700">
               <div className="w-32 bg-gray-200 dark:bg-gray-700 shrink-0 relative">
                  <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2"><Badge color="green" className="backdrop-blur-sm bg-white/90">{item.distance}</Badge></div>
               </div>
               <div className="flex-1 p-3 flex flex-col justify-between">
                  <div>
                     <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1 mb-1">{item.foodName}</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1"><Store size={10} /> {item.partner}</p>
                     
                     <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                           <Calendar size={10} /> {item.dateAdded}
                        </span>
                     </div>
                  </div>
                  <div className="flex justify-between items-end border-t border-gray-50 dark:border-gray-700 pt-2">
                     <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-[10px] font-bold"><Clock size={12} /> {item.timeLeft}</div>
                     <span className="font-bold text-gray-900 dark:text-white text-sm">Rp {item.price}</span>
                  </div>
               </div>
            </Card>
         )) : (
            <div className="flex flex-col items-center justify-center pt-20 text-gray-400">
               <Search size={48} className="mb-4 opacity-20" />
               <p className="text-sm font-medium">Makanan tidak ditemukan</p>
            </div>
         )}
      </ScrollableContent>

      {/* Filter Modal */}
      {showFilterModal && (
         <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">Filter Pencarian</h3>
                  <button onClick={() => setShowFilterModal(false)}><X size={24} className="text-gray-500 dark:text-gray-400" /></button>
               </div>
               
               <div className="space-y-6">
                  <div>
                     <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Kategori</h4>
                     <div className="flex flex-wrap gap-2">
                        {["Semua", "Makanan Berat", "Roti & Kue", "Minuman", "Cemilan"].map(c => (
                           <button key={c} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-orange-50 hover:border-primary hover:text-primary transition-colors">{c}</button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-3">Harga</h4>
                     <div className="flex gap-4 items-center">
                        <input className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm dark:text-white" placeholder="Min" />
                        <span className="text-gray-400">-</span>
                        <input className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm dark:text-white" placeholder="Max" />
                     </div>
                  </div>
               </div>
               
               <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button onClick={() => setShowFilterModal(false)}>Terapkan Filter</Button>
               </div>
            </div>
         </div>
      )}
    </ScreenLayout>
  );
};

// ... other screens ...

export const LocationSelectScreen: React.FC<FeatureProps> = ({ navigate, goBack, setGlobalState }) => {
   
   const handleSelectAddress = (address: any) => {
      setGlobalState('selectedAddress', address);
      goBack();
   };

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900">
         <Header title="Pilih Lokasi" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <div className="p-4">
            <div className="relative mb-6">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary dark:text-white" placeholder="Cari alamat atau lokasi..." />
            </div>

            <Card onClick={() => handleSelectAddress({ title: 'Lokasi Saat Ini', desc: 'Jalan Kebon Jeruk No. 1', type: 'other' })} className="flex items-center gap-4 mb-6 hover:bg-gray-50 dark:bg-blue-900/10 dark:border-blue-900/30 transition-colors border-dashed border-2 bg-blue-50/50 border-blue-200">
               <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Send size={20} /></div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Gunakan Lokasi Saat Ini</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Aktifkan GPS untuk akurasi</p>
               </div>
            </Card>

            <Section title="Alamat Tersimpan" className="dark:text-white">
               <div className="space-y-2">
                  <ListItem 
                     icon={<Building2 size={20} className="text-blue-500" />} 
                     title="Kantor" 
                     subtitle="Gedung Pencakar Langit Lt. 5, Jakarta Pusat" 
                     className="dark:text-gray-300"
                     onClick={() => handleSelectAddress({ title: 'Kantor', desc: 'Gedung Pencakar Langit Lt. 5, Jakarta Pusat', tag: 'Utama', type: 'office' })} 
                  />
                  <ListItem 
                     icon={<Home size={20} className="text-orange-500" />} 
                     title="Rumah" 
                     subtitle="Jl. Melati No. 12, Jakarta Selatan" 
                     className="dark:text-gray-300"
                     onClick={() => handleSelectAddress({ title: 'Rumah', desc: 'Jl. Melati No. 12, Jakarta Selatan', type: 'home' })} 
                  />
               </div>
            </Section>
         </div>
      </ScreenLayout>
   );
};

export const CreateRequestScreen: React.FC<FeatureProps> = ({ navigate, goBack, globalState }) => {
   const selectedAddress = globalState?.selectedAddress;

   const getAddressIcon = (type: string) => {
      if (type === 'home') return <Home size={18} />;
      if (type === 'office') return <Building2 size={18} />;
      return <MapPin size={18} />;
   };

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900">
         <Header title="Buat Request Makanan" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            <Card className="bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800 flex gap-3 mb-2">
               <Info size={20} className="text-orange-500 shrink-0 mt-0.5" />
               <p className="text-xs text-orange-800 dark:text-orange-300 leading-relaxed">Permintaan Anda akan muncul di Forum Berbagi. Mitra di sekitar Anda dapat melihat dan merespons.</p>
            </Card>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate('HOME'); alert("Request berhasil dibuat!"); }}>
               <Input label="Judul Request" placeholder="Contoh: Butuh nasi kotak..." icon={<FileText size={18} />} containerClassName="dark:text-white" />
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Deskripsi Kebutuhan</label>
                  <textarea className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-primary resize-none h-32 text-sm" placeholder="Jelaskan detail kebutuhan..."></textarea>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <Input label="Jumlah Porsi" type="number" placeholder="10" containerClassName="dark:text-white" />
                  <Input label="Waktu Dibutuhkan" type="datetime-local" containerClassName="dark:text-white" />
               </div>
               
               {/* Address Selection */}
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Lokasi Pengantaran</label>
                  <div 
                     onClick={() => navigate('LOCATION_SELECT')} 
                     className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group shadow-sm"
                  >
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full mt-0.5">
                           {selectedAddress ? getAddressIcon(selectedAddress.type) : <MapPin size={18} />}
                        </div>
                        <div>
                           {selectedAddress ? (
                              <>
                                 <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAddress.title}</p>
                                    {selectedAddress.tag && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">{selectedAddress.tag}</span>}
                                 </div>
                                 <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px] truncate">{selectedAddress.desc}</p>
                              </>
                           ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Pilih Alamat...</p>
                           )}
                        </div>
                     </div>
                     <ChevronRight size={14} className="text-gray-400" />
                  </div>
               </div>

               <div className="pt-4"><Button type="submit">Kirim Request</Button></div>
            </form>
         </ScrollableContent>
      </ScreenLayout>
   );
};

export const MapViewScreen: React.FC<FeatureProps> = ({ navigate, goBack }) => {
  const [selectedPin, setSelectedPin] = useState<number | null>(null);
  const pins = [{ id: 1, lat: 30, lng: 40 }, { id: 2, lat: 50, lng: 60 }, { id: 3, lat: 45, lng: 30 }];

  return (
    <div className="flex flex-col h-full bg-gray-100 relative overflow-hidden">
      <div className="absolute top-6 left-4 right-4 z-20 flex gap-3">
        <button onClick={goBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md text-gray-700"><ChevronRight size={24} className="rotate-180" /></button>
        <div className="flex-1 bg-white rounded-full shadow-md flex items-center px-4 h-10"><Search size={18} className="text-gray-400 mr-2" /><span className="text-sm text-gray-400">Cari lokasi...</span></div>
        <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-md"><Filter size={18} /></button>
      </div>

      <div className="w-full h-full bg-blue-50 relative" onClick={() => setSelectedPin(null)}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        {pins.map((pin) => (
           <button key={pin.id} onClick={(e) => { e.stopPropagation(); setSelectedPin(pin.id); }} className={`absolute transform -translate-x-1/2 -translate-y-full transition-all duration-300 ${selectedPin === pin.id ? 'scale-125 z-10' : 'scale-100'}`} style={{ top: `${pin.lat}%`, left: `${pin.lng}%` }}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${selectedPin === pin.id ? 'bg-primary text-white' : 'bg-white text-primary'}`}><MapPin size={20} fill="currentColor" /></div>
              <div className="w-2 h-1 bg-black/20 rounded-full mx-auto mt-1 blur-[1px]"></div>
           </button>
        ))}
      </div>

      {selectedPin && (
         <div className="absolute bottom-6 left-4 right-4 animate-in slide-in-from-bottom-10 z-20">
            <Card className="flex gap-4">
               <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0"><img src={`https://picsum.photos/200/200?random=${selectedPin}`} className="w-full h-full object-cover" /></div>
               <div className="flex-1">
                  <div className="flex justify-between items-start">
                     <h3 className="font-bold text-gray-900">Restoran Mitra #{selectedPin}</h3>
                     <Badge color="green">Buka</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">Padang • 0.8 km</p>
                  <div className="flex items-center gap-1 text-xs font-semibold text-orange-500 mb-3"><Star size={12} fill="currentColor" /> 4.8 (200+)</div>
                  <Button size="sm" className="h-9 w-full" onClick={() => navigate('PARTNER_DETAIL')}>Lihat Makanan</Button>
               </div>
            </Card>
         </div>
      )}
    </div>
  );
};

export const PartnerDetailScreen: React.FC<FeatureProps> = ({ navigate, goBack, setGlobalState, globalState }) => {
  const [cart, setCart] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const item = globalState?.reservationItem;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 relative transition-colors duration-300">
      {/* Immersive Header */}
      <div className="h-64 bg-gray-200 relative shrink-0">
        <img src={item?.image || "https://picsum.photos/600/400?random=food"} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="absolute top-6 left-4 right-4 flex justify-between items-center text-white z-20">
          <button onClick={goBack} className="w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/30"><ChevronRight size={24} className="rotate-180" /></button>
          <div className="flex gap-3">
             <button className="w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/30"><Share2 size={20} /></button>
             <button onClick={() => setIsLiked(!isLiked)} className={`w-10 h-10 bg-black/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-black/30 ${isLiked ? 'text-red-500' : 'text-white'}`}><Heart size={20} fill={isLiked ? "currentColor" : "none"} /></button>
          </div>
        </div>
        <div className="absolute bottom-10 left-6 text-white z-10">
           <h1 className="text-2xl font-bold mb-1 drop-shadow-md">{item?.partner || "Restoran Sederhana"}</h1>
           <div className="flex items-center gap-3 text-sm font-medium opacity-90 drop-shadow-sm">
              <span className="flex items-center gap-1"><Star size={14} fill="currentColor" className="text-yellow-400" /> 4.8</span>
              <span>• Masakan Padang • 0.8 km</span>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-t-3xl -mt-6 relative z-10 px-6 pt-8 pb-24 no-scrollbar transition-colors">
         {/* Action Button: Chat Admin */}
         <div className="mb-6 flex justify-end">
            <a 
               href="https://wa.me/6281234567890" 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-xs font-bold hover:bg-green-600 transition-colors shadow-sm"
            >
               <MessageCircle size={16} /> Chat Penjual
            </a>
         </div>

         {/* Stats */}
         <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
            {[
               { icon: Clock, label: "Waktu Ambil", val: "14:00 - 15:00", color: "text-primary" },
               { icon: ShoppingBag, label: "Tersedia", val: "5 Paket", color: "text-green-600" },
               { icon: Leaf, label: "Dampak", val: "2.5 kg CO2", color: "text-green-500" }
            ].map((s, i) => (
               <Card key={i} className="min-w-[120px] flex flex-col items-center text-center p-3 dark:bg-gray-800 dark:border-gray-700">
                  <s.icon className={`${s.color} mb-1`} size={20} />
                  <span className="text-[10px] text-gray-400 font-medium">{s.label}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">{s.val}</span>
               </Card>
            ))}
         </div>

         <Section title="Selamatkan Makanan" className="dark:text-white">
            {[1, 2].map((i) => (
               <Card key={i} className="flex gap-4 mb-4 dark:bg-gray-800 dark:border-gray-700">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0"><img src={`https://picsum.photos/200/200?random=${i + 10}`} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                     <h4 className="font-bold text-gray-900 dark:text-white mb-1">Paket Nasi Padang Random</h4>
                     <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">Berisi nasi, sayur nangka, daun singkong...</p>
                     <div className="flex justify-between items-end">
                        <div><span className="text-xs text-gray-400 line-through">Rp 35.000</span><p className="font-bold text-primary text-lg">Rp 15.000</p></div>
                        <Button size="sm" className="w-auto h-8" onClick={() => setCart(cart + 1)}>+ Tambah</Button>
                     </div>
                  </div>
               </Card>
            ))}
         </Section>
      </div>

      {cart > 0 && (
         <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4 pb-8 shadow-[0_-5px_10px_rgba(0,0,0,0.05)] z-20 animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center mb-3">
               <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total ({cart} item)</span>
               <span className="font-bold text-gray-900 dark:text-white text-lg">Rp {15000 * cart}</span>
            </div>
            <Button onClick={() => {
                setGlobalState('reservationItem', item);
                navigate('RESERVATION_FORM');
            }}>Reservasi Sekarang</Button>
         </div>
      )}
    </div>
  );
};

export const ReservationFormScreen: React.FC<FeatureProps> = ({ navigate, goBack, globalState, setGlobalState }) => {
   const [selectedPayment, setSelectedPayment] = useState<string>('cash');
   const selectedAddress = globalState?.selectedAddress || { title: 'Kantor', desc: 'Gedung Pencakar Langit Lt. 5, Jakarta Pusat', tag: 'Utama', type: 'office' };
   
   // Access item passed from Home or Detail
   const item = globalState?.reservationItem;
   const isPickupOnly = item?.deliveryType === 'pickup';

   const handleConfirmPayment = () => {
      const newHistoryItem = {
         id: Date.now(),
         name: item?.partner || "Restoran Sederhana",
         item: item?.foodName || "Paket Nasi Padang",
         date: "Hari ini",
         price: selectedPayment !== 'cash' && selectedPayment !== 'bca' ? 'Rp 17.000' : 'Rp 16.000',
         status: "Dikemas", // Initial status
         type: isPickupOnly ? 'pickup' : 'delivery',
         img: 11
      };

      const updatedHistory = [newHistoryItem, ...globalState.historyItems];
      setGlobalState('historyItems', updatedHistory);
      navigate('RESERVATION_SUCCESS');
   };

   const paymentMethods = [
     { id: 'gopay', name: 'GoPay', type: 'E-Wallet', balance: 'Rp 120.000', icon: <Wallet size={18} /> },
     { id: 'ovo', name: 'OVO', type: 'E-Wallet', balance: 'Rp 45.000', icon: <Wallet size={18} /> },
     { id: 'bca', name: 'BCA Virtual Account', type: 'Transfer', balance: null, icon: <CreditCard size={18} /> },
     { id: 'cash', name: 'Bayar di Tempat (Cash)', type: 'Tunai', balance: null, icon: <Banknote size={18} /> },
   ];

   const getAddressIcon = (type: string) => {
      if (type === 'home') return <Home size={18} />;
      if (type === 'office') return <Building2 size={18} />;
      return <MapPin size={18} />;
   };

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900 transition-colors duration-300">
         <Header title="Konfirmasi Reservasi" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            {/* Order Summary */}
            <Card className="bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800 flex gap-4">
               <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0"><img src={item?.image || "https://picsum.photos/200/200?random=11"} className="w-full h-full object-cover" /></div>
               <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item?.foodName || "Paket Makanan"}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item?.partner || "Mitra Restoran"}</p>
                  <p className="text-primary font-bold">Rp 15.000</p>
                  {isPickupOnly && <Badge color="orange" className="mt-1">Ambil di Tempat</Badge>}
               </div>
            </Card>

            {/* Address Selection (Conditional) */}
            {isPickupOnly ? (
               <Section title="Lokasi Pengambilan" className="dark:text-white">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                     <div className="p-2 bg-orange-50 text-orange-600 rounded-full mt-0.5">
                        <Store size={18} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{item?.partner || "Lokasi Mitra"}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Jl. Jendral Sudirman No. 10, Jakarta Pusat (0.5 km)</p>
                        <a href="#" className="text-xs text-primary font-bold mt-2 inline-block">Lihat di Peta</a>
                     </div>
                  </div>
               </Section>
            ) : (
               <Section title="Lokasi Pengantaran" className="dark:text-white">
                  <div 
                     onClick={() => navigate('LOCATION_SELECT')} 
                     className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group shadow-sm"
                  >
                     <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full mt-0.5">
                           {getAddressIcon(selectedAddress.type)}
                        </div>
                        <div>
                           <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedAddress.title}</p>
                              {selectedAddress.tag && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">{selectedAddress.tag}</span>}
                           </div>
                           <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-[200px] truncate">{selectedAddress.desc}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 text-primary text-xs font-bold">
                        Ubah <ChevronRight size={14} />
                     </div>
                  </div>
               </Section>
            )}

            {/* Data Pengambil */}
            <Section title="Data Pemesan" className="dark:text-white">
               <div className="space-y-4">
                  <Input label="Nama Lengkap" icon={<UserIcon size={18} />} defaultValue="Joko Susilo" containerClassName="dark:text-white" />
                  <Input label="Nomor Telepon" icon={<Phone size={18} />} defaultValue="+62 812-345-6789" containerClassName="dark:text-white" />
                  <div className="space-y-1.5">
                     <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">Catatan Tambahan</label>
                     <textarea className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none" placeholder="Contoh: Saya akan datang agak telat..."></textarea>
                  </div>
               </div>
            </Section>

            {/* Payment Methods */}
            <Section title="Metode Pembayaran" className="dark:text-white">
               <div className="space-y-3">
                  {paymentMethods.map((method) => (
                     <div 
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${selectedPayment === method.id ? 'border-primary bg-orange-50/30 ring-1 ring-primary' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'}`}
                     >
                        <div className="flex items-center gap-3">
                           <div className={`p-2 rounded-full ${selectedPayment === method.id ? 'bg-orange-100 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                              {method.icon}
                           </div>
                           <div>
                              <p className={`text-sm font-bold ${selectedPayment === method.id ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{method.name}</p>
                              {method.balance && <p className="text-xs text-gray-500 dark:text-gray-400">Saldo: {method.balance}</p>}
                           </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedPayment === method.id ? 'border-primary bg-primary' : 'border-gray-300 dark:border-gray-600'}`}>
                           {selectedPayment === method.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                     </div>
                  ))}
               </div>
            </Section>

            {/* Price Summary */}
            <Card className="bg-gray-50 border-gray-100 dark:bg-gray-800 dark:border-gray-700">
               <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Subtotal</span><span className="font-bold text-gray-900 dark:text-white">Rp 15.000</span></div>
                  <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Biaya Layanan</span><span className="font-bold text-gray-900 dark:text-white">Rp 1.000</span></div>
                  {selectedPayment !== 'cash' && selectedPayment !== 'bca' && (
                     <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400 font-medium">Biaya Admin E-Wallet</span><span className="font-bold text-gray-900 dark:text-white">Rp 1.000</span></div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-base font-bold text-gray-900 dark:text-white">
                     <span>Total Bayar</span>
                     <span>Rp {selectedPayment !== 'cash' && selectedPayment !== 'bca' ? '17.000' : '16.000'}</span>
                  </div>
               </div>
            </Card>
         </ScrollableContent>
         <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <Button onClick={handleConfirmPayment}>
               Konfirmasi & Bayar {selectedPayment === 'cash' ? '(Tunai)' : ''}
            </Button>
         </div>
      </ScreenLayout>
   );
};

export const HistoryScreen: React.FC<FeatureProps> = ({ navigate, goBack, globalState }) => {
  const [activeTab, setActiveTab] = useState<'Dikemas' | 'Dikirim' | 'Selesai'>('Dikemas');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);

  const historyItems = globalState.historyItems || [];

  const filterItems = (tab: string) => {
     return historyItems.filter((item: any) => {
        if (tab === 'Selesai') return item.status === 'Selesai' || item.status === 'Dibatalkan';
        if (tab === 'Dikemas') return item.status === 'Dikemas' || item.status === 'Menunggu Konfirmasi';
        if (tab === 'Dikirim') return item.status === 'Dikirim' || item.status === 'Siap Diambil';
        return false;
     });
  };

  const displayedItems = filterItems(activeTab);

  const handleReorder = (item: any) => {
     // alert(`Memesan ulang: ${item.name}`); // Removed alert for smoother UX
     navigate('PARTNER_DETAIL');
  };

  const handleReview = (item: any) => {
     setReviewTarget(item);
     setShowReviewModal(true);
  };

  return (
    <ScreenLayout bgClass="bg-white dark:bg-gray-900 transition-colors duration-300">
       <Header title="Riwayat Pengambilan" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
       
       {/* Tabs */}
       <div className="flex border-b border-gray-100 dark:border-gray-800">
          {['Dikemas', 'Dikirim', 'Selesai'].map((tab) => (
             <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                   activeTab === tab 
                   ? 'border-primary text-primary' 
                   : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
             >
                {tab}
             </button>
          ))}
       </div>

       <ScrollableContent>
          {displayedItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center pt-20 text-gray-400 dark:text-gray-600">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Belum ada pesanan di sini.</p>
             </div>
          ) : (
             displayedItems.map((item: any) => (
                <Card key={item.id} className="flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">
                   <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0"><img src={`https://picsum.photos/100/100?random=${item.img}`} className="w-full h-full object-cover" /></div>
                      <div className="flex-1">
                         <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</h4>
                            <Badge color={item.status === 'Selesai' ? 'green' : item.status === 'Dibatalkan' ? 'red' : 'orange'}>{item.status}</Badge>
                         </div>
                         <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{item.item} • {item.date}</p>
                         <p className="font-bold text-primary text-sm">{item.price}</p>
                      </div>
                   </div>
                   
                   {/* Action Buttons for Completed Items */}
                   {activeTab === 'Selesai' && item.status === 'Selesai' && (
                      <div className="flex gap-3 border-t border-gray-100 dark:border-gray-700 pt-3">
                         <Button size="sm" variant="outline" className="flex-1 py-2 text-xs h-9 dark:bg-gray-800 dark:text-white dark:border-gray-600" onClick={() => handleReview(item)}>Beri Ulasan</Button>
                         <Button size="sm" className="flex-1 py-2 text-xs h-9" onClick={() => handleReorder(item)}>Pesan Lagi</Button>
                      </div>
                   )}
                </Card>
             ))
          )}
       </ScrollableContent>

       {/* Review Modal */}
       {showReviewModal && (
          <div className="absolute inset-0 z-50 bg-black/50 flex flex-col justify-end animate-in fade-in">
             <div className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 animate-in slide-in-from-bottom">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-lg text-gray-900 dark:text-white">Beri Ulasan</h3>
                   <button onClick={() => setShowReviewModal(false)}><X size={24} className="text-gray-500 dark:text-gray-400" /></button>
                </div>
                <div className="flex flex-col items-center mb-6">
                   <div className="w-16 h-16 bg-gray-200 rounded-xl mb-3 overflow-hidden"><img src={`https://picsum.photos/100/100?random=${reviewTarget?.img}`} className="w-full h-full object-cover" /></div>
                   <h4 className="font-bold text-gray-900 dark:text-white">{reviewTarget?.name}</h4>
                   <p className="text-xs text-gray-500 dark:text-gray-400">{reviewTarget?.item}</p>
                </div>
                <div className="flex justify-center gap-2 mb-6">
                   {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={32} className="text-gray-300 cursor-pointer hover:text-yellow-400 hover:fill-yellow-400 transition-colors" />
                   ))}
                </div>
                <textarea className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:outline-none focus:border-primary dark:text-white mb-6" placeholder="Tulis pengalaman Anda..." rows={3}></textarea>
                <Button onClick={() => setShowReviewModal(false)}>Kirim Ulasan</Button>
             </div>
          </div>
       )}
    </ScreenLayout>
  );
};

export const ReservationSuccessScreen: React.FC<FeatureProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-white dark:bg-gray-900 text-center transition-colors duration-300">
       <div className="mb-6 relative">
          <div className="w-48 h-40 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-end justify-center pb-0 overflow-hidden">
             <div className="w-24 h-24 bg-green-200 dark:bg-green-800 rounded-t-full relative top-2"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle size={64} className="text-green-600 dark:text-green-400 fill-white dark:fill-gray-900" />
             </div>
          </div>
       </div>
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reservasi Berhasil!</h2>
       <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-xs">Makanan Anda telah diamankan. Silakan datang sesuai waktu pengambilan.</p>
       
       <div className="w-full space-y-3 flex flex-col items-center">
          <Button className="w-auto px-8" onClick={() => navigate('HISTORY')}>Lihat Tiket</Button>
          <Button variant="outline" className="w-auto px-8 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800" onClick={() => navigate('HOME')}>Kembali ke Beranda</Button>
       </div>
    </div>
  );
};

export const ImpactReportScreen: React.FC<FeatureProps> = ({ navigate, goBack, globalState }) => {
   // Ambil riwayat user dari Global State
   const history = globalState.historyItems || [];
   
   // State untuk data dampak
   const [impactData, setImpactData] = useState({
      co2: "Menghitung...",
      money: "Menghitung...",
      desc: "Sedang menganalisis dampak lingkungan Anda..."
   });

   useEffect(() => {
      const calculateImpact = async () => {
         // Jika tidak ada history, set default
         if (history.length === 0) {
            setImpactData({ co2: "0 kg", money: "Rp 0", desc: "Belum ada makanan yang diselamatkan." });
            return;
         }

         // 1. Hitung total uang secara manual (lebih akurat)
         let totalMoney = 0;
         const foodItems: string[] = [];
         
         history.forEach((h: any) => {
            if (h.status === 'Selesai') {
               // Bersihkan string harga "Rp 25.000" -> 25000
               const price = parseInt(h.price.replace(/[^0-9]/g, '')) || 0;
               totalMoney += price;
               foodItems.push(h.item); // Kumpulkan nama makanan
            }
         });

         // 2. Minta AI menghitung dampak lingkungan (CO2) berdasarkan daftar makanan
         try {
            // Kita kirim ringkasan makanan ke AI
            const summaryText = foodItems.join(", ");
            // Only call AI if there are items
            if (foodItems.length > 0) {
              const aiResult = await analyzeImpact(summaryText, `${foodItems.length} porsi`);
              
              setImpactData({
                co2: aiResult.co2Saved,
                money: `Rp ${totalMoney.toLocaleString('id-ID')}`, // Gunakan hitungan real uang kita
                desc: aiResult.nutritionSummary || "Anda telah berkontribusi besar mengurangi limbah pangan!"
              });
            } else {
               setImpactData({ co2: "0 kg", money: "Rp 0", desc: "Belum ada makanan yang diselamatkan." });
            }
         } catch (e) {
            console.error("Gagal hitung dampak", e);
            setImpactData({ co2: "Calculating...", money: `Rp ${totalMoney.toLocaleString('id-ID')}`, desc: "Data dampak belum tersedia." });
         }
      };

      calculateImpact();
   }, [history]);

   return (
      <ScreenLayout bgClass="bg-white dark:bg-gray-900 transition-colors duration-300">
         <Header title="Laporan Dampak" onBack={goBack} className="dark:bg-gray-900 dark:border-gray-800 dark:text-white" />
         <ScrollableContent>
            {/* Hero Card dengan Data Dinamis */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-700 rounded-3xl p-6 text-white relative overflow-hidden mb-6 shadow-lg shadow-green-200 dark:shadow-none animate-in slide-in-from-bottom">
               <div className="relative z-10">
                  <p className="text-green-100 text-sm font-medium mb-1">Total Penyelamatan Makanan</p>
                  {/* Tampilkan CO2 dari AI */}
                  <h2 className="text-4xl font-bold mb-4">{impactData.co2}</h2>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-3 py-1 text-xs">
                     <Leaf size={14} />
                     <span>Setara mencegah emisi gas metana</span>
                  </div>
               </div>
               <Leaf className="absolute -bottom-10 -right-10 text-white opacity-10 rotate-12" size={200} />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
               <Card className="bg-orange-50 border-orange-100 dark:bg-orange-900/10 dark:border-orange-800">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-200 mb-3">
                     <DollarSign size={20} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uang Dihemat</p>
                  {/* Tampilkan Uang Real */}
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white">{impactData.money}</h4>
               </Card>
               <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-800">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-200 mb-3">
                     <Leaf size={20} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Analisis Gizi</p>
                   {/* Tampilkan Ringkasan AI */}
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white line-clamp-3">{impactData.desc}</h4>
               </Card>
            </div>

            {/* Achievements */}
            <Section title="Pencapaian Anda" className="dark:text-white">
               <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800">
                     <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600"><Award size={24} /></div>
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Pahlawan Pangan</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Selamatkan 10 makanan bulan ini</p>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-yellow-500 w-[80%]"></div>
                        </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800 opacity-60">
                     <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400"><Award size={24} /></div>
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Influencer Hijau</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Ajak 5 teman bergabung</p>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
                           <div className="h-full bg-gray-400 w-[20%]"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </Section>
         </ScrollableContent>
      </ScreenLayout>
   );
};