
import React, { useState, useEffect } from 'react';
import { Home, CheckCircle, User as UserIcon, Store, FileText, BarChart3, Users, ShieldCheck } from 'lucide-react';
import { ScreenName } from './types';
import { LoginScreen, SignupScreen, ForgotPasswordScreen, VerificationScreen, NewPasswordScreen } from './components/AuthScreens';
// Corrected imports to match available exports in components/AppScreens.tsx
import { HomeScreen, ProfileScreen, NotificationScreen, EditProfileScreen, ChangePasswordScreen, NotificationSettingsScreen, AddAddressScreen, HelpScreen } from './components/AppScreens';
import { QualityCheckScreen } from './components/QualityCheck';
import { PartnerDashboard, PartnerTransactions, UploadProduct, SuccessScreen, PartnerInventory } from './components/PartnerScreens';
import { AdminDashboard, AdminUsers, AdminProducts, AdminReports, AdminSettings, AdminSidebar } from './components/AdminScreens';
import { MapViewScreen, PartnerDetailScreen, ImpactReportScreen, ReservationSuccessScreenExtended, ReservationFormScreen, HistoryScreen, ExploreScreen, LocationSelectScreen, CreateRequestScreen, SavedItemsScreen, FavoriteItemsScreen } from './components/UserFeatureScreens';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('LOGIN');
  const [userMode, setUserMode] = useState<'USER' | 'PARTNER' | 'ADMIN'>('USER');
  const [history, setHistory] = useState<ScreenName[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const loadInitialState = () => {
    try {
      const saved = localStorage.getItem('foodRescueState');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      user: { name: 'Budi Santoso', email: 'budi.santoso@gmail.com', phone: '+62 812-3456-7890', bio: 'Food lover & saver!', avatar: 'https://picsum.photos/200/200?random=user', role: 'USER' },
      savedItems: [],
      favorites: [],
      qualityHistory: [],
      currentLocationName: 'Jakarta Pusat',
      addresses: [
        { id: 1, title: 'Rumah', desc: 'Jl. Melati No. 12, Jakarta Selatan', type: 'home', receiver: 'Budi Santoso', phone: '+62 812-3456-7890' },
        { id: 2, title: 'Kantor', desc: 'Gedung Pencakar Langit Lt. 5, Jakarta Pusat', type: 'office', receiver: 'Budi Santoso', phone: '+62 812-3456-7890' }
      ],
      historyItems: [
        { id: 101, name: "Bakery Pagi Sore", item: "5x Roti Manis", date: "28 Okt 2024", price: "25.000", status: "Selesai", type: 'pickup', img: 1 },
        { id: 104, name: "Sate Khas Senayan", item: "10 Tusuk Sate", date: "Hari ini", price: "50.000", status: "Dikemas", type: 'delivery', img: 4 }
      ]
    };
  };

  const [globalState, setGlobalState] = useState<any>(loadInitialState());

  useEffect(() => {
    localStorage.setItem('foodRescueState', JSON.stringify(globalState));
    if (globalState.user?.role) setUserMode(globalState.user.role);
  }, [globalState]);

  const navigate = (screen: ScreenName) => {
    setHistory((prev) => [...prev, currentScreen]);
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setHistory((prev) => {
      const newHistory = [...prev];
      const previousScreen = newHistory.pop();
      if (previousScreen) setCurrentScreen(previousScreen);
      return newHistory;
    });
  };

  const updateGlobalState = (key: string, value: any) => setGlobalState((prev: any) => ({ ...prev, [key]: value }));

  const props = { navigate, goBack, globalState, setGlobalState: updateGlobalState, isDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) };

  const renderMobileScreen = () => {
    switch (currentScreen) {
      case 'LOGIN': return <LoginScreen navigate={navigate} onLoginSuccess={(role) => { updateGlobalState('user', { ...globalState.user, role }); setUserMode(role); setHistory([]); setCurrentScreen(role === 'ADMIN' ? 'ADMIN_DASHBOARD' : role === 'PARTNER' ? 'PARTNER_DASHBOARD' : 'HOME'); }} />;
      case 'HOME': return <HomeScreen {...props} />;
      case 'PROFILE': return <ProfileScreen {...props} userMode={userMode as any} />;
      case 'CHECK_QUALITY': return <QualityCheckScreen {...props} />;
      case 'EXPLORE': return <ExploreScreen {...props} />;
      case 'MAP_VIEW': return <MapViewScreen {...props} />;
      case 'PARTNER_DETAIL': return <PartnerDetailScreen {...props} />;
      case 'RESERVATION_FORM': return <ReservationFormScreen {...props} />;
      case 'RESERVATION_SUCCESS': return <ReservationSuccessScreenExtended {...props} />;
      case 'ADD_ADDRESS': return <AddAddressScreen {...props} />;
      case 'LOCATION_SELECT': return <LocationSelectScreen {...props} />;
      case 'FAVORITES': return <FavoriteItemsScreen {...props} />;
      case 'EDIT_PROFILE': return <EditProfileScreen {...props} />;
      case 'CREATE_REQUEST': return <CreateRequestScreen {...props} />;
      case 'HISTORY': return <HistoryScreen {...props} />;
      case 'SAVED_ITEMS': return <SavedItemsScreen {...props} />;
      case 'SIGNUP': return <SignupScreen navigate={navigate} />;
      case 'FORGOT_PASSWORD': return <ForgotPasswordScreen navigate={navigate} />;
      case 'VERIFICATION': return <VerificationScreen navigate={navigate} />;
      case 'NEW_PASSWORD': return <NewPasswordScreen navigate={navigate} />;
      case 'CHANGE_PASSWORD': return <ChangePasswordScreen {...props} />;
      case 'NOTIFICATION_SETTINGS': return <NotificationSettingsScreen {...props} />;
      case 'NOTIFICATIONS': return <NotificationScreen {...props} />;
      case 'HELP_FAQ': return <HelpScreen {...props} />;
      case 'PARTNER_DASHBOARD': return <PartnerDashboard navigate={navigate} />;
      case 'PARTNER_INVENTORY': return <PartnerInventory navigate={navigate} />;
      case 'TRANSACTIONS': return <PartnerTransactions navigate={navigate} />;
      case 'UPLOAD_PRODUCT': return <UploadProduct navigate={navigate} />;
      case 'SUCCESS': return <SuccessScreen navigate={navigate} />;
      default: return <LoginScreen navigate={navigate} />;
    }
  };

  const isMainMobileScreen = ['HOME', 'PROFILE', 'CHECK_QUALITY', 'PARTNER_DASHBOARD', 'PARTNER_INVENTORY', 'TRANSACTIONS'].includes(currentScreen);

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center font-sans ${isDarkMode ? 'dark' : ''}`}>
      <div className="w-full h-[100dvh] md:h-[844px] md:w-[390px] bg-white md:rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-hidden relative bg-white dark:bg-gray-900 transition-colors">
          {renderMobileScreen()}
        </div>
        {isMainMobileScreen && (
          <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-4 flex justify-evenly items-center z-50 rounded-t-2xl shadow-lg">
             {userMode === 'USER' ? (
               <>
                 <button onClick={() => { setHistory([]); setCurrentScreen('HOME'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'HOME' ? 'text-primary' : 'text-gray-400'}`}><Home size={24}/><span className="text-[10px]">Beranda</span></button>
                 <button onClick={() => { setHistory([]); setCurrentScreen('CHECK_QUALITY'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'CHECK_QUALITY' ? 'text-primary' : 'text-gray-400'}`}><CheckCircle size={24}/><span className="text-[10px]">Cek Kualitas</span></button>
                 <button onClick={() => { setHistory([]); setCurrentScreen('PROFILE'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-primary' : 'text-gray-400'}`}><UserIcon size={24}/><span className="text-[10px]">Profil</span></button>
               </>
             ) : (
               <>
                 <button onClick={() => { setHistory([]); setCurrentScreen('PARTNER_DASHBOARD'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'PARTNER_DASHBOARD' ? 'text-primary' : 'text-gray-400'}`}><Home size={24}/><span className="text-[10px]">Beranda</span></button>
                 <button onClick={() => { setHistory([]); setCurrentScreen('TRANSACTIONS'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'TRANSACTIONS' ? 'text-primary' : 'text-gray-400'}`}><FileText size={24}/><span className="text-[10px]">Transaksi</span></button>
                 <button onClick={() => { setHistory([]); setCurrentScreen('PARTNER_INVENTORY'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'PARTNER_INVENTORY' ? 'text-primary' : 'text-gray-400'}`}><Store size={24}/><span className="text-[10px]">Mitra</span></button>
                 <button onClick={() => { setHistory([]); setCurrentScreen('PROFILE'); }} className={`flex flex-col items-center gap-1 ${currentScreen === 'PROFILE' ? 'text-primary' : 'text-gray-400'}`}><UserIcon size={24}/><span className="text-[10px]">Profil</span></button>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
