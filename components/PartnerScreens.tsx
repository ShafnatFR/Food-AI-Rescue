
import React, { useState } from 'react';
import { Bell, User, UploadCloud, X, ChevronRight, AlertTriangle, Package, TrendingUp, CheckCircle, ChevronLeft, Search, Plus, Loader2 } from 'lucide-react';
import { ScreenName } from '../types';
import { Button } from './ui';
import { extractFoodMetadata } from '../services/geminiService';

interface PartnerProps {
  navigate: (screen: ScreenName) => void;
}

// --- SUB-COMPONENTS (WIDGETS) ---

const MetricCard: React.FC<{ label: string; value: string; trend: string; icon: any; color: string }> = ({ label, value, trend, icon: Icon, color }) => (
  <div className="border border-gray-100 rounded-2xl p-4 shadow-sm bg-white">
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs text-gray-500">{label}</p>
      <Icon size={14} className={color} />
    </div>
    <h4 className="font-bold text-lg text-gray-900">{value}</h4>
    <p className="text-[10px] text-green-500 flex items-center gap-1 font-medium"><TrendingUp size={10} /> {trend}</p>
  </div>
);

const IssueCard: React.FC<{ title: string; desc: string; type: 'red' | 'orange' }> = ({ title, desc, type }) => {
  const styles = {
    red: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', sub: 'text-red-400', icon: 'text-red-500' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', sub: 'text-orange-400', icon: 'text-orange-500' }
  };
  const s = styles[type];
  return (
    <div className={`${s.bg} ${s.border} rounded-xl p-4`}>
      <div className="flex items-start gap-3 mb-2">
        <AlertTriangle className={s.icon} size={18} />
        <div>
          <h4 className={`font-bold ${s.text} text-sm`}>{title}</h4>
          <p className={`${s.sub} text-xs`}>{desc}</p>
        </div>
      </div>
      <Button variant="outline" className={`h-8 py-0 text-xs ${s.text} border-current bg-white w-full hover:${s.bg}`}>Lihat Detail</Button>
    </div>
  );
};

const StockChart: React.FC = () => (
  <section>
    <h3 className="font-bold text-gray-900 mb-1">Tingkat Stok per Waktu</h3>
    <p className="text-xs text-gray-400 mb-4">Tren stok produk selama 6 bulan terakhir.</p>
    <div className="bg-white rounded-xl h-48 flex items-end justify-between gap-2 pt-8">
      {[40, 65, 45, 80, 55, 90, 30, 70, 50, 60, 45, 85].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
          <div className="w-full bg-orange-200 rounded-t-sm transition-all duration-300 group-hover:bg-primary" style={{ height: `${h}%` }}></div>
        </div>
      ))}
    </div>
    <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
      <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span>
    </div>
    <div className="flex gap-4 justify-center mt-6">
      <div className="flex items-center gap-2 text-[10px] text-gray-500"><div className="w-2 h-2 rounded-full bg-orange-400"></div> Elektronik</div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500"><div className="w-2 h-2 rounded-full bg-blue-300"></div> Pakaian</div>
      <div className="flex items-center gap-2 text-[10px] text-gray-500"><div className="w-2 h-2 rounded-full bg-gray-300"></div> Rumah Tangga</div>
    </div>
  </section>
);

// --- MAIN SCREENS ---

export const PartnerDashboard: React.FC<PartnerProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 shrink-0 bg-white z-10 flex justify-between items-center border-b border-gray-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-primary"><div className="w-4 h-4 border-2 border-current rotate-45"></div></div>
          <h1 className="font-bold text-lg text-gray-900">Partner Dashboard</h1>
        </div>
        <div className="flex gap-3">
          <button className="relative p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><Bell size={24} /><span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span></button>
          <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><User size={24} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-28">
        <section>
          <h3 className="font-bold text-gray-900 mb-3">Peringatan & Isu</h3>
          <div className="space-y-3">
            <IssueCard title="Peringatan Stok Rendah" desc="Stok rendah: Hanya tersisa 20 unit." type="red" />
            <IssueCard title="Masalah Kualitas" desc="Masalah kualitas terdeteksi pada batch terbaru." type="orange" />
          </div>
        </section>
        <section>
          <h3 className="font-bold text-gray-900 mb-3">Ringkasan Metrik</h3>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Penjualan Bulan Ini" value="Rp 25.000.000" trend="+12%" icon={Package} color="text-orange-300" />
            <MetricCard label="Total Pesanan" value="1,240" trend="+5%" icon={Package} color="text-blue-300" />
            <MetricCard label="Produk Terjual" value="850" trend="+8%" icon={Package} color="text-purple-300" />
            <MetricCard label="Pelanggan Baru" value="320" trend="+15%" icon={Package} color="text-green-300" />
          </div>
        </section>
        <StockChart />
        <div className="fixed bottom-24 right-6 z-30"><Button className="w-auto h-14 rounded-full px-6 shadow-xl shadow-orange-200" onClick={() => navigate('UPLOAD_PRODUCT')}>+ Tambah</Button></div>
      </div>
    </div>
  );
};

export const PartnerInventory: React.FC<PartnerProps> = ({ navigate }) => {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const categories = ["Semua", "Buah & Sayur", "Roti & Pastri", "Makanan Olahan", "Minuman"];
  const products = [
    { id: 1, name: "Apel Organik Segar", price: "Rp 25.000", stockPercent: 75, image: "https://picsum.photos/seed/apple/200/200" },
    { id: 2, name: "Roti Gandum Utuh", price: "Rp 32.000", stockPercent: 30, image: "https://picsum.photos/seed/bread/200/200" },
    { id: 3, name: "Susu Segar Murni", price: "Rp 48.000", stockPercent: 90, image: "https://picsum.photos/seed/milk/200/200" },
    { id: 4, name: "Yoghurt Rendah Lemak", price: "Rp 18.000", stockPercent: 15, image: "https://picsum.photos/seed/yoghurt/200/200" }
  ];
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6 pb-2 shrink-0 bg-white z-10 shadow-sm"><h1 className="text-xl font-bold text-center text-gray-900">Inventory</h1></div>
      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 pb-28">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100"><img src="https://picsum.photos/seed/person/200/200" alt="Profile" className="w-full h-full object-cover" /></div>
              <div><h3 className="font-bold text-gray-900 text-sm">PT. Maju Bersama</h3><div className="flex items-center gap-1.5 mt-0.5"><p className="text-xs text-gray-500">Status:</p><span className="text-xs font-bold text-gray-900">Online</span></div></div>
           </div>
           <div className="flex items-center gap-2"><span className="text-xs text-gray-500">Aktif</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div></label></div>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary" placeholder="Cari produk..." /></div>
          <Button className="w-auto px-6 rounded-xl text-sm" onClick={() => navigate('UPLOAD_PRODUCT')}><Plus size={18} className="mr-1" /> Tambah</Button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {categories.map((cat) => (<button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-primary/20 text-primary-hover border border-primary/20' : 'bg-gray-50 text-gray-600 border border-transparent'}`}>{cat}</button>))}
        </div>
        <div className="space-y-4">
           {products.map((product) => (
             <div key={product.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0"><img src={product.image} alt={product.name} className="w-full h-full object-cover" /></div>
                <div className="flex-1"><h4 className="font-bold text-gray-900 text-sm mb-1">{product.name}</h4><p className="text-gray-500 text-xs mb-3">{product.price}</p><div className="flex items-center gap-3"><div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${product.stockPercent}%` }}></div></div><span className="text-xs text-gray-600 font-medium whitespace-nowrap">{product.stockPercent}% Stok</span></div></div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export const PartnerTransactions: React.FC<PartnerProps> = ({ navigate }) => {
  return (
    <div className="flex flex-col h-full bg-white">
       <div className="p-6 shrink-0 bg-white z-10 border-b border-gray-50 flex items-center justify-between shadow-sm"><h1 className="text-xl font-bold text-gray-900 mx-auto">Transaksi</h1></div>
       <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar pb-28">
         <section>
           <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-900">Volume Transaksi Bulanan</h3><select className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none"><option>2024</option></select></div>
           <div className="flex h-40 items-end gap-3"><div className="flex flex-col justify-between h-full text-[10px] text-gray-400 py-1"><span>Rp 3 Jt</span><span>Rp 2 Jt</span><span>Rp 1 Jt</span><span>Rp 0 Jt</span></div><div className="flex-1 flex items-end justify-between gap-2 h-full border-b border-gray-100 pb-1">{[45, 60, 50, 75, 65, 85, 80].map((h, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1 group"><div className="w-full bg-orange-300 rounded-t-md transition-all group-hover:bg-primary" style={{ height: `${h}%` }}></div></div>))}</div></div>
           <div className="flex justify-between text-[10px] text-gray-400 mt-2 pl-8"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span><span>Jul</span></div>
         </section>
         <section>
           <h3 className="font-bold text-gray-900 mb-4">Transaksi Terbaru</h3>
           <div className="space-y-6">
             {[
               { name: "Budi Santoso", date: "28 Juli 2024", amount: "+Rp 150.000", status: "Selesai", color: "text-green-500", img: 12 },
               { name: "Dewi Lestari", date: "25 Juli 2024", amount: "-Rp 120.000", status: "Gagal", color: "text-red-500", img: 13 },
               { name: "Ahmad Fauzi", date: "24 Juli 2024", amount: "+Rp 500.000", status: "Selesai", color: "text-green-500", img: 14 },
               { name: "Rina Wijaya", date: "23 Juli 2024", amount: "-Rp 90.000", status: "Tertunda", color: "text-orange-500", img: 15 },
               { name: "Hadi Prasetyo", date: "22 Juli 2024", amount: "+Rp 300.000", status: "Selesai", color: "text-green-500", img: 16 }
             ].map((tx, i) => (
               <div key={i} className="flex items-center gap-4">
                 <img src={`https://picsum.photos/100/100?random=${tx.img}`} alt={tx.name} className="w-10 h-10 rounded-full object-cover" />
                 <div className="flex-1"><h4 className="font-bold text-gray-900 text-sm">{tx.name}</h4><p className="text-gray-400 text-xs">{tx.date}</p></div>
                 <div className="text-right"><p className={`font-bold text-sm ${tx.color}`}>{tx.amount}</p><span className={`text-[10px] px-2 py-0.5 rounded-full ${tx.status === 'Selesai' ? 'bg-green-50 text-green-600' : tx.status === 'Gagal' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>{tx.status}</span></div>
               </div>
             ))}
           </div>
         </section>
       </div>
    </div>
  );
};

export const UploadProduct: React.FC<PartnerProps> = ({ navigate }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ingredients, setIngredients] = useState("");
  const [category, setCategory] = useState("Pilih Kategori...");
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files?.[0]) {
       const file = e.target.files[0];
       const reader = new FileReader();
       reader.onload = async () => {
         const base64 = reader.result as string;
         setImage(base64);
         setIsAnalyzing(true);
         try {
            const metadata = await extractFoodMetadata("Identifikasi makanan ini", base64);
            if (metadata) {
                setCategory(metadata.category || "Makanan Berat");
                if (metadata.tags && metadata.tags.length > 0) setIngredients(metadata.tags.join(", "));
            }
         } catch (error) { console.error(error); } finally { setIsAnalyzing(false); }
       };
       reader.readAsDataURL(file);
     }
  };
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-50 flex items-center gap-4 shrink-0 bg-white z-10 shadow-sm">
         <button onClick={() => navigate('PARTNER_INVENTORY')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"><ChevronLeft size={24} /></button>
         <h1 className="font-bold text-lg text-gray-900">Upload Produk (AI)</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar pb-8">
         <div>
            <label className="block font-bold text-gray-900 mb-3">Unggah Foto Produk</label>
            <div className="h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center bg-gray-50 relative overflow-hidden group hover:bg-gray-100 transition-colors">
               {image ? (
                 <><img src={image} className="w-full h-full object-cover" alt="Upload" /><button onClick={() => setImage(null)} className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"><X size={16} /></button></>
               ) : (
                 <><div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-gray-400"><UploadCloud size={20} /></div><span className="text-sm text-gray-500">Ukuran file maksimum: 5MB</span><input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} /></>
               )}
            </div>
         </div>
         {isAnalyzing && (<div className="flex items-center gap-2 text-primary text-sm font-bold mb-4 animate-pulse bg-orange-50 p-3 rounded-xl"><Loader2 className="animate-spin" size={16} />AI sedang identifikasi...</div>)}
         <div>
           <label className="block font-bold text-gray-900 mb-3">Bahan-bahan (Auto-fill)</label>
           <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary resize-none h-24 mb-3" placeholder="Masukkan bahan-bahan..." />
         </div>
         <div>
           <label className="block font-bold text-gray-900 mb-3">Pilih Kategori</label>
           <div className="relative"><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm text-gray-500 focus:outline-none appearance-none"><option>Pilih Kategori...</option><option>Makanan Berat</option><option>Minuman</option><option>Roti & Kue</option><option>Buah & Sayur</option></select><ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400" size={16} /></div>
         </div>
         <div className="flex justify-between items-center mt-6"><Button variant="outline" className="w-auto px-6 py-2 h-auto text-xs">Batal</Button><Button className="w-auto px-6 py-2 h-auto text-xs" onClick={() => navigate('SUCCESS')}>Upload Sekarang</Button></div>
      </div>
    </div>
  );
};

export const SuccessScreen: React.FC<PartnerProps> = ({ navigate }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 bg-white text-center">
     <div className="mb-6 relative"><div className="w-48 h-40 bg-blue-50 rounded-xl flex items-end justify-center pb-0 overflow-hidden"><div className="w-24 h-24 bg-blue-200 rounded-t-full relative top-2"></div><div className="absolute inset-0 flex items-center justify-center"><CheckCircle size={64} className="text-primary fill-white" /></div></div></div>
     <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil disimpan!</h2>
     <p className="text-gray-500 text-sm mb-8 max-w-xs">Data Anda telah berhasil disimpan dan diproses.</p>
     <Button onClick={() => navigate('PARTNER_INVENTORY')}>Kembali ke Beranda</Button>
  </div>
);
