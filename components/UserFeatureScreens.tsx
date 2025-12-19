
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Navigation, PlusCircle, Home, Map as MapIcon, CheckCircle, Search, MapPin, ExternalLink, Activity, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { ScreenName } from '../types';
import { Button, ScreenLayout, Header, ScrollableContent, Section, Card, Badge } from './ui';
import { ManualLocationForm } from './LocationComponents';
import { searchLocationByCoords, searchLocationByQuery, LocationInfo } from '../services/geminiService';

interface FeatureProps {
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
}

export const LocationSelectScreen: React.FC<FeatureProps> = ({ goBack, globalState, setGlobalState }) => {
   const [isGpsLoading, setIsGpsLoading] = useState(false);
   const [showManualForm, setShowManualForm] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [isSearching, setIsSearching] = useState(false);
   const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
   const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
   
   const [formData, setFormData] = useState({
     manualTitle: "",
     country: "Indonesia",
     province: "",
     city: "",
     rt: "",
     rw: "",
     postalCode: "",
     fullAddress: "",
     notes: "",
     locationPhoto: null as string | null
   });

   useEffect(() => {
     // Gunakan akurasi tinggi sejak awal agar konteks pencarian di sekitar pengguna benar
     navigator.geolocation.getCurrentPosition(
       (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
       () => console.warn("Akses lokasi terbatas tanpa GPS."),
       { enableHighAccuracy: true, timeout: 5000 }
     );
   }, []);

   const handleGps = () => {
      setIsGpsLoading(true);
      setShowManualForm(false);
      
      navigator.geolocation.getCurrentPosition(
         async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              console.log(`Detecting Address for Coords: ${latitude}, ${longitude}`);
              
              const result = await searchLocationByCoords(latitude, longitude);
              
              // MENGISI DATA KE FORM BERDASARKAN HASIL EKSTRAKSI AI
              setFormData({
                manualTitle: result.placeName || "Lokasi GPS",
                country: "Indonesia",
                province: result.province || "",
                city: result.city || "",
                rt: result.rt || "",
                rw: result.rw || "",
                postalCode: result.postalCode || "",
                fullAddress: result.address || `Koordinat: ${latitude}, ${longitude}`,
                notes: "",
                locationPhoto: null
              });
              
              // OTOMATIS TAMPILKAN FORM UNTUK KONFIRMASI PENGGUNA
              setShowManualForm(true);
            } catch (err) {
              alert("Gagal mengurai detail alamat. Silakan isi form manual.");
              setShowManualForm(true);
            } finally {
              setIsGpsLoading(false);
            }
         },
         (err) => { 
           alert(`GPS Error: ${err.message}. Pastikan GPS perangkat aktif dan izin diberikan.`); 
           setShowManualForm(true);
           setIsGpsLoading(false); 
         },
         { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
   };

   const handleSearch = async () => {
     if (!searchQuery.trim()) return;
     setIsSearching(true);
     try {
       const results = await searchLocationByQuery(searchQuery, userCoords?.lat, userCoords?.lng);
       setSearchResults(results);
     } catch (err) {
       console.error(err);
     } finally {
       setIsSearching(false);
     }
   };

   const handleSelectSearchResult = (loc: LocationInfo) => {
     setFormData({
       manualTitle: loc.placeName,
       country: "Indonesia",
       province: loc.province || "",
       city: loc.city || "",
       rt: "",
       rw: "",
       postalCode: loc.postalCode || "",
       fullAddress: loc.address || "",
       notes: "",
       locationPhoto: null
     });
     setShowManualForm(true);
     setSearchResults([]);
   };

   const handleManualSave = () => {
     if (!formData.manualTitle || !formData.fullAddress || !formData.city) {
       alert("Mohon lengkapi Label, Alamat Lengkap, dan Kota.");
       return;
     }

     const detailedAddress = `${formData.fullAddress}, ${formData.city}${formData.province ? ', ' + formData.province : ''}`;

     const newAddress = {
       id: Date.now(),
       title: formData.manualTitle,
       desc: detailedAddress,
       notes: formData.notes,
       photo: formData.locationPhoto,
       type: 'gps', 
       receiver: globalState.user?.name || 'User',
       phone: globalState.user?.phone || ''
     };

     setGlobalState('addresses', [newAddress, ...(globalState.addresses || [])]);
     setGlobalState('currentLocationName', formData.manualTitle);
     goBack();
   };

   return (
      <ScreenLayout bgClass="bg-slate-50 dark:bg-gray-950">
         <Header title="Atur Lokasi Pengiriman" onBack={goBack} />
         <ScrollableContent className="p-6 space-y-6">
            
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cari Tempat atau Alamat</p>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  className="w-full h-14 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl pl-12 pr-20 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm"
                  placeholder="Contoh: Gedung Sate, Bandung..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <button 
                  onClick={handleSearch}
                  disabled={!searchQuery.trim() || isSearching}
                  className="absolute right-2 top-2 bottom-2 bg-slate-900 text-white px-4 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Cari"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  {searchResults.map((res, i) => (
                    <Card key={i} className="p-4 border-none shadow-sm flex items-center gap-4 group hover:bg-primary/5 transition-all" onClick={() => handleSelectSearchResult(res)}>
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{res.placeName}</h4>
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1">{res.address}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                    </Card>
                  ))}
                  <button onClick={() => setSearchResults([])} className="w-full text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Bersihkan Hasil</button>
                </div>
              )}
            </div>

            <Section>
               <Button 
                variant="outline" 
                className="w-full h-16 bg-white dark:bg-gray-900 border-2 border-slate-100 dark:border-gray-800 text-slate-900 dark:text-white shadow-none hover:border-primary transition-all flex items-center justify-start px-6 rounded-3xl" 
                onClick={handleGps} 
                isLoading={isGpsLoading}
               >
                  <div className="bg-orange-500 p-2 rounded-xl text-white mr-4 shadow-lg shadow-orange-500/20">
                    <Navigation size={20} /> 
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-xs uppercase tracking-tight">Gunakan GPS Presisi</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Verifikasi lokasi akurat (E-KYC)</span>
                  </div>
               </Button>
            </Section>

            <Section>
               {!showManualForm ? (
                  <button onClick={() => setShowManualForm(true)} className="w-full py-5 px-6 bg-white dark:bg-gray-900 border-2 border-dashed border-slate-200 dark:border-gray-800 rounded-3xl flex items-center justify-center gap-3 text-primary font-black text-xs uppercase tracking-widest hover:bg-orange-50 dark:hover:bg-primary/5 transition-all">
                     <PlusCircle size={20} /> Tambah Alamat Manual
                  </button>
               ) : (
                  <div className="animate-in slide-in-from-top-4 duration-500">
                    <ManualLocationForm 
                      formData={formData} 
                      setFormData={setFormData} 
                      onSave={handleManualSave} 
                      onCancel={() => setShowManualForm(false)} 
                    />
                  </div>
               )}
            </Section>

            <Section title="📍 Alamat Tersimpan">
               <div className="space-y-3">
                  {(globalState.addresses || []).map((addr: any) => (
                     <Card 
                      key={addr.id} 
                      className={`flex gap-4 p-5 border-2 transition-all rounded-3xl relative overflow-hidden ${globalState.currentLocationName === addr.title ? 'border-primary bg-primary/5 shadow-md' : 'border-slate-100 dark:border-gray-800 shadow-sm'}`} 
                      onClick={() => { setGlobalState('currentLocationName', addr.title); goBack(); }}
                     >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${globalState.currentLocationName === addr.title ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 dark:bg-gray-800 text-slate-400'}`}>
                           {addr.type === 'home' ? <Home size={22}/> : <Navigation size={22}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center mb-1">
                             <h4 className="font-black text-sm text-slate-900 dark:text-white truncate flex items-center gap-2">
                               {addr.title}
                               <Badge color="blue" className="text-[7px] px-1.5 py-0 rounded uppercase tracking-tighter">AI Verified</Badge>
                             </h4>
                             <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${globalState.currentLocationName === addr.title ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-200 dark:border-gray-700 text-transparent'}`}>
                               <CheckCircle size={14} strokeWidth={3} />
                             </div>
                           </div>
                           <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed font-medium">{addr.desc}</p>
                        </div>
                     </Card>
                  ))}
               </div>
            </Section>
         </ScrollableContent>
      </ScreenLayout>
   );
};

export const ExploreScreen: React.FC<any> = ({ navigate, goBack }) => (<ScreenLayout><Header title="Explore" onBack={goBack}/><ScrollableContent>Explore Content</ScrollableContent></ScreenLayout>);
export const PartnerDetailScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Detail" onBack={goBack}/><ScrollableContent>Detail Content</ScrollableContent></ScreenLayout>);
export const ReservationFormScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Reservation" onBack={goBack}/><ScrollableContent>Form Content</ScrollableContent></ScreenLayout>);
export const ReservationSuccessScreenExtended: React.FC<any> = ({ navigate }) => (<ScreenLayout><ScrollableContent>Success!</ScrollableContent></ScreenLayout>);
export const FavoriteItemsScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Favorites" onBack={goBack}/><ScrollableContent>Favorites</ScrollableContent></ScreenLayout>);
export const SavedItemsScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Saved" onBack={goBack}/><ScrollableContent>Saved</ScrollableContent></ScreenLayout>);
export const CreateRequestScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Request" onBack={goBack}/><ScrollableContent>Request Form</ScrollableContent></ScreenLayout>);
export const HistoryScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="History" onBack={goBack}/><ScrollableContent>History List</ScrollableContent></ScreenLayout>);
export const ImpactReportScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Impact" onBack={goBack}/><ScrollableContent>Impact Report</ScrollableContent></ScreenLayout>);
export const MapViewScreen: React.FC<any> = ({ goBack }) => (<ScreenLayout><Header title="Map" onBack={goBack}/><ScrollableContent>Map View</ScrollableContent></ScreenLayout>);

export { ReservationSuccessScreenExtended as ReservationSuccessScreen };
