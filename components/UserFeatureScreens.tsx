import React, { useState } from 'react';
import { ChevronLeft, Navigation, PlusCircle, Home, Map as MapIcon, CheckCircle } from 'lucide-react';
import { ScreenName } from '../types';
import { Button, ScreenLayout, Header, ScrollableContent, Section, Card } from './ui';
import { ManualLocationForm } from './LocationComponents';

interface FeatureProps {
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  globalState: any;
  setGlobalState: (key: string, value: any) => void;
}

export const LocationSelectScreen: React.FC<FeatureProps> = ({ goBack, globalState, setGlobalState }) => {
   const [isGps, setIsGps] = useState(false);
   const [showManualForm, setShowManualForm] = useState(false);
   
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

   const handleGps = () => {
      setIsGps(true);
      navigator.geolocation.getCurrentPosition(
         (pos) => {
            setGlobalState('currentLocationName', '📍 Lokasi GPS Aktif');
            setIsGps(false);
            goBack();
         },
         () => { alert("GPS gagal."); setIsGps(false); }
      );
   };

   const handleManualSave = () => {
     if (!formData.manualTitle || !formData.fullAddress || !formData.city) {
       alert("Mohon lengkapi detail alamat wajib (Label, Alamat, Kota).");
       return;
     }

     const detailedAddress = `${formData.fullAddress}, RT.${formData.rt}/RW.${formData.rw}, ${formData.city}, ${formData.province}, ${formData.country} (${formData.postalCode})`;

     const newAddress = {
       id: Date.now(),
       title: formData.manualTitle,
       desc: detailedAddress,
       notes: formData.notes,
       photo: formData.locationPhoto,
       type: 'manual',
       receiver: globalState.user?.name || 'User',
       phone: globalState.user?.phone || ''
     };

     setGlobalState('addresses', [...(globalState.addresses || []), newAddress]);
     setGlobalState('currentLocationName', formData.manualTitle);
     goBack();
   };

   return (
      <ScreenLayout bgClass="bg-gray-50">
         <Header title="Pilih Lokasi" onBack={goBack} />
         <ScrollableContent>
            <Section>
               <Button variant="primary" className="w-full h-14 bg-white border border-slate-200 text-slate-900 shadow-none hover:bg-slate-50 flex items-center justify-start px-5" onClick={handleGps} isLoading={isGps}>
                  <Navigation size={18} className="mr-2 text-primary" /> 
                  <span className="font-bold text-sm">Gunakan Lokasi Saat Ini</span>
               </Button>
            </Section>

            <Section>
               {!showManualForm ? (
                  <button onClick={() => setShowManualForm(true)} className="w-full py-4 px-5 bg-white border border-dashed border-slate-300 rounded-2xl flex items-center justify-center gap-2 text-primary font-bold text-sm hover:bg-orange-50 transition-colors">
                     <PlusCircle size={20} /> Tambah Alamat Manual Lengkap
                  </button>
               ) : (
                  <ManualLocationForm 
                    formData={formData} 
                    setFormData={setFormData} 
                    onSave={handleManualSave} 
                    onCancel={() => setShowManualForm(false)} 
                  />
               )}
            </Section>

            <Section title="Alamat Tersimpan">
               <div className="space-y-3">
                  {(globalState.addresses || []).map((addr: any) => (
                     <Card key={addr.id} className={`flex gap-4 p-4 border transition-all ${globalState.currentLocationName === addr.title ? 'border-primary ring-1 ring-primary/10' : 'border-slate-100'}`} onClick={() => { setGlobalState('currentLocationName', addr.title); goBack(); }}>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
                           {addr.type === 'home' ? <Home size={18} className="text-primary"/> : <MapIcon size={18} className="text-primary"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-center"><h4 className="font-bold text-sm text-slate-900 truncate">{addr.title}</h4>{globalState.currentLocationName === addr.title && <CheckCircle size={16} className="text-primary" />}</div>
                           <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{addr.desc}</p>
                        </div>
                     </Card>
                  ))}
               </div>
            </Section>
         </ScrollableContent>
      </ScreenLayout>
   );
};

// ... other screens remain as defined previously but isolated ...
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

// Added compatibility alias to satisfy standard name import in some App.tsx versions
export { ReservationSuccessScreenExtended as ReservationSuccessScreen };
