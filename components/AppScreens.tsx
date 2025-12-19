
import React, { useState } from 'react';
import { Settings, LogOut, Heart, Bookmark, History as HistoryIcon, Edit2, Lock, MapPin, Sun, Moon, HelpCircle, Bell, ChevronRight } from 'lucide-react';
import { ScreenName } from '../types';
import { Header, ScreenLayout, ScrollableContent, ListItem, Card, Section, Badge, Button, Input } from './ui';
import { HomeHeader, HomeSearch, CategoryTabs, HomePromoBanner, FoodFeedCard } from './HomeComponents';
import { ProfileAvatarUploader, PhoneInputModule } from './ProfileComponents';

const calculateMatchScore = (item: any) => {
  let score = 0;
  const distance = parseFloat(item.distance.split(' ')[0]);
  if (distance < 1.0) score += 50;
  else if (distance < 3.0) score += 30;
  else score += 10;
  if (item.timeLeft.includes("s/d 12:00") || item.timeLeft.includes("Segera")) score += 40;
  const qty = parseInt(item.quantity.split(' ')[0]);
  if (qty < 3) score += 15;
  return score;
};

// --- SUB-COMPONENTS (WIDGETS) ---

const ProfileHeader: React.FC<{ user: any; mode: string }> = ({ user, mode }) => (
  <div className="p-6 pb-2">
    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-6">Profil Saya</h1>
    <div className="flex items-center gap-4 mb-6">
      <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm shrink-0">
        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-50 truncate">{user.name}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
        <Badge color="blue" className="mt-1">{mode === 'USER' ? 'Penerima' : 'Mitra'}</Badge>
      </div>
    </div>
  </div>
);

const ProfileActionsSection: React.FC<{ navigate: (s: ScreenName) => void }> = ({ navigate }) => (
  <Section title="Aktivitas" className="px-4">
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
      <ListItem icon={<Heart size={20} className="text-red-500" />} title="Favorit Saya" onClick={() => navigate('FAVORITES')} />
      <ListItem icon={<Bookmark size={20} className="text-blue-500" />} title="Tersimpan" onClick={() => navigate('SAVED_ITEMS')} />
      <ListItem icon={<HistoryIcon size={20} className="text-orange-500" />} title="Riwayat Pesanan" onClick={() => navigate('HISTORY')} />
    </div>
  </Section>
);

const ProfileSettingsSection: React.FC<{ navigate: (s: ScreenName) => void }> = ({ navigate }) => (
  <Section title="Akun" className="px-4">
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
      <ListItem icon={<Edit2 size={20} />} title="Edit Profil" onClick={() => navigate('EDIT_PROFILE')} />
      <ListItem icon={<Lock size={20} />} title="Ganti Kata Sandi" onClick={() => navigate('CHANGE_PASSWORD')} />
      <ListItem icon={<MapPin size={20} />} title="Daftar Alamat" onClick={() => navigate('LOCATION_SELECT')} />
    </div>
  </Section>
);

const ProfilePreferencesSection: React.FC<{ isDarkMode: boolean; toggleTheme: () => void; navigate: (s: ScreenName) => void }> = ({ isDarkMode, toggleTheme, navigate }) => (
  <Section title="Preferensi" className="px-4">
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-50 dark:divide-slate-800/50">
        <div className="flex items-center justify-between py-3.5 px-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-xl">
                {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <p className="font-bold text-sm text-slate-900 dark:text-slate-50">Mode Gelap</p>
           </div>
           <button onClick={toggleTheme} className={`w-11 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}><div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${isDarkMode ? 'left-[22px]' : 'left-0.5'}`}></div></button>
        </div>
       <ListItem icon={<HelpCircle size={20} />} title="Bantuan & FAQ" onClick={() => navigate('HELP_FAQ')} />
    </div>
  </Section>
);

// --- MAIN SCREENS ---

export const HomeScreen: React.FC<any> = ({ navigate, setGlobalState, globalState }) => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const savedItems = globalState.savedItems || [];
  const user = globalState.user || { name: 'User', avatar: 'https://picsum.photos/100/100?random=1' };

  const allFoodFeed = [
    { id: 1, partner: "Bakery Pagi Sore", status: "Buka", foodName: "Roti Manis & Donat Sisa Produksi", distance: "0.5 km", timeLeft: "Hari ini, s/d 21:00", quantity: "5 Paket", image: "https://picsum.photos/400/200?random=101", avatar: "https://picsum.photos/100/100?random=1", category: "Roti & Kue", deliveryType: 'pickup' },
    { id: 2, partner: "Restoran Padang Murah", status: "Buka", foodName: "Nasi Lauk Campur (Layak Makan)", distance: "1.2 km", timeLeft: "Hari ini, s/d 17:00", quantity: "2 Porsi", image: "https://picsum.photos/400/200?random=102", avatar: "https://picsum.photos/100/100?random=2", category: "Makanan Berat", deliveryType: 'delivery' },
    { id: 3, partner: "Toko Buah Segar Jaya", status: "Buka", foodName: "Paket Buah Potong & Jus", distance: "2.0 km", timeLeft: "Hari ini, s/d 19:00", quantity: "8 Paket", image: "https://picsum.photos/400/200?random=103", avatar: "https://picsum.photos/100/100?random=3", category: "Sayur & Buah", deliveryType: 'pickup' },
    { id: 4, partner: "Kopi Senja", status: "Buka", foodName: "Es Kopi Susu Gula Aren", distance: "0.8 km", timeLeft: "Hari ini, s/d 22:00", quantity: "4 Cup", image: "https://picsum.photos/400/200?random=104", avatar: "https://picsum.photos/100/100?random=4", category: "Minuman", deliveryType: 'delivery' }
  ];

  const toggleSave = (id: number) => {
    const newSaved = savedItems.includes(id) ? savedItems.filter((i: number) => i !== id) : [...savedItems, id];
    setGlobalState('savedItems', newSaved);
  };

  const filteredFeed = activeCategory === 'Semua' 
    ? allFoodFeed 
    : activeCategory === 'Tersimpan' 
      ? allFoodFeed.filter(item => savedItems.includes(item.id)) 
      : allFoodFeed.filter(item => item.category === activeCategory);
  
  const processedFeed = filteredFeed
    .map(item => ({ ...item, matchScore: calculateMatchScore(item) }))
    .sort((a, b) => b.matchScore - a.matchScore);

  return (
    <ScreenLayout bgClass="bg-slate-50 dark:bg-slate-950">
      <div className="p-6 pb-2 bg-white dark:bg-slate-900 shrink-0 z-20 shadow-sm relative transition-colors duration-300">
        <HomeHeader 
          user={user} 
          locationName={globalState.currentLocationName || 'Jakarta Pusat'} 
          onProfileClick={() => navigate('PROFILE')} 
          onLocationClick={() => navigate('LOCATION_SELECT')} 
          onNotificationClick={() => navigate('NOTIFICATIONS')} 
        />
        <HomeSearch onSearchClick={() => navigate('EXPLORE')} onFilterClick={() => navigate('EXPLORE')} />
        <CategoryTabs activeCategory={activeCategory} onCategoryChange={setActiveCategory} onMoreClick={() => {}} />
      </div>
      <ScrollableContent className="p-6 pt-2 pb-28">
        <HomePromoBanner onMapClick={() => navigate('MAP_VIEW')} onRequestClick={() => navigate('CREATE_REQUEST')} />
        <div className="space-y-5 mt-6">
           {processedFeed.map((item) => (
             <FoodFeedCard 
                key={item.id} 
                item={item} 
                isSaved={savedItems.includes(item.id)} 
                onSaveToggle={toggleSave}
                onClick={() => { setGlobalState('reservationItem', item); navigate('PARTNER_DETAIL'); }}
                onActionClick={() => { setGlobalState('reservationItem', item); navigate('RESERVATION_FORM'); }}
             />
           ))}
        </div>
      </ScrollableContent>
    </ScreenLayout>
  );
};

export const ProfileScreen: React.FC<any> = ({ navigate, userMode, toggleTheme, isDarkMode, globalState }) => {
  const user = globalState.user || { name: 'User', email: 'user@example.com', avatar: '', role: 'USER' };
  
  return (
    <ScreenLayout>
      <ProfileHeader user={user} mode={userMode} />
      <ScrollableContent className="p-0 px-2 pt-0 pb-28">
         <ProfileActionsSection navigate={navigate} />
         <ProfileSettingsSection navigate={navigate} />
         <ProfilePreferencesSection isDarkMode={isDarkMode} toggleTheme={toggleTheme} navigate={navigate} />
         <div className="px-4 pt-4">
            <button onClick={() => navigate('LOGIN')} className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors"><LogOut size={20} /> Keluar</button>
         </div>
      </ScrollableContent>
    </ScreenLayout>
  );
};

export const EditProfileScreen: React.FC<any> = ({ goBack, globalState, setGlobalState }) => {
  const [name, setName] = useState(globalState.user?.name || '');
  const [email, setEmail] = useState(globalState.user?.email || '');
  const [avatar, setAvatar] = useState(globalState.user?.avatar || '');
  const [phone, setPhone] = useState((globalState.user?.phone || '').replace('+62', '').trim());

  const handleSave = () => {
    setGlobalState('user', { ...globalState.user, name, email, phone: `+62 ${phone}`, avatar });
    goBack();
  };

  return (
    <ScreenLayout>
      <Header title="Edit Profil" onBack={goBack} />
      <ScrollableContent>
        <ProfileAvatarUploader avatar={avatar} onAvatarChange={setAvatar} />
        <div className="space-y-6">
          <Input label="Nama Lengkap" value={name} onChange={(e: any) => setName(e.target.value)} />
          <Input label="Email Terdaftar" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
          <PhoneInputModule value={phone} onChange={setPhone} />
        </div>
        <div className="pt-10">
           <Button className="w-full shadow-orange-500/20 text-slate-900" onClick={handleSave}>Simpan Perubahan</Button>
           <button onClick={goBack} className="w-full text-center mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 py-2">Batal</button>
        </div>
      </ScrollableContent>
    </ScreenLayout>
  );
};

export const NotificationScreen: React.FC<any> = ({ goBack }) => (
  <ScreenLayout>
    <Header title="Notifikasi" onBack={goBack} />
    <ScrollableContent>
      <div className="text-center py-20">
        <Bell size={48} className="mx-auto text-slate-300 mb-4 opacity-50" />
        <p className="text-slate-500 font-medium">Belum ada notifikasi baru.</p>
        <p className="text-xs text-slate-400 mt-1">Kami akan memberi tahu Anda jika ada surplus makanan di sekitar.</p>
      </div>
    </ScrollableContent>
  </ScreenLayout>
);

export const ChangePasswordScreen: React.FC<any> = ({ goBack }) => (
  <ScreenLayout>
    <Header title="Ganti Kata Sandi" onBack={goBack} />
    <ScrollableContent>
      <div className="space-y-4">
        <Input label="Kata Sandi Lama" type="password" placeholder="••••••••" />
        <Input label="Kata Sandi Baru" type="password" placeholder="••••••••" />
        <Input label="Konfirmasi Kata Sandi Baru" type="password" placeholder="••••••••" />
        <Button className="w-full mt-6">Simpan Sandi Baru</Button>
      </div>
    </ScrollableContent>
  </ScreenLayout>
);

export const NotificationSettingsScreen: React.FC<any> = ({ goBack }) => (
  <ScreenLayout>
    <Header title="Pengaturan Notifikasi" onBack={goBack} />
    <ScrollableContent>
      <Section title="Pesan & Update">
        <div className="space-y-3">
          {[
            { title: 'Notifikasi Push', desc: 'Aktifkan untuk update real-time' },
            { title: 'Email Penawaran', desc: 'Info surplus makanan di email' },
            { title: 'Update Keamanan', desc: 'Informasi keamanan akun penting' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-slate-50">{item.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
              <button className="w-11 h-6 bg-primary rounded-full relative transition-colors">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </button>
            </div>
          ))}
        </div>
      </Section>
    </ScrollableContent>
  </ScreenLayout>
);

export const AddAddressScreen: React.FC<any> = ({ goBack }) => (
  <ScreenLayout>
    <Header title="Tambah Alamat" onBack={goBack} />
    <ScrollableContent>
      <div className="space-y-4">
        <Input label="Nama Alamat" placeholder="Rumah, Kantor, dll" />
        <Input label="Alamat Lengkap" placeholder="Jl. Raya No. 123..." />
        <Input label="Catatan" placeholder="Lantai, nomor kamar, patokan..." />
        <Button className="w-full mt-6">Simpan Alamat</Button>
      </div>
    </ScrollableContent>
  </ScreenLayout>
);

export const HelpScreen: React.FC<any> = ({ goBack }) => (
  <ScreenLayout>
    <Header title="Bantuan & FAQ" onBack={goBack} />
    <ScrollableContent>
      <Section title="Pertanyaan Umum">
        <div className="space-y-3">
          <Card className="p-4">
            <h4 className="font-bold text-sm mb-2 text-slate-900 dark:text-slate-100">Bagaimana cara menyelamatkan makanan?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Pilih makanan di sekitar Anda, tekan 'Ambil', dan kunjungi mitra sesuai instruksi penjemputan.</p>
          </Card>
          <Card className="p-4">
            <h4 className="font-bold text-sm mb-2 text-slate-900 dark:text-slate-100">Apakah makanan ini aman?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Semua makanan yang dibagikan telah melalui verifikasi visual AI dan panduan kebersihan mitra.</p>
          </Card>
        </div>
      </Section>
    </ScrollableContent>
  </ScreenLayout>
);
