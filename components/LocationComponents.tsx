
import React, { useRef } from 'react';
import { Camera, X, Navigation } from 'lucide-react';
import { Input, Button, Card } from './ui';

export const ManualLocationForm: React.FC<any> = ({ 
  formData, 
  setFormData, 
  onSave, 
  onCancel 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNumericInput = (field: string, val: string, max: number) => {
    const sanitized = val.replace(/[^\d]/g, '').slice(0, max);
    setFormData({ ...formData, [field]: sanitized });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => setFormData({ ...formData, locationPhoto: reader.result as string });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <Card className="p-5 animate-in slide-in-from-top-2 border-primary/20 bg-orange-50/10 dark:bg-gray-800/50">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Formulir Alamat Manual</h4>
        <button onClick={onCancel} className="text-slate-400"><X size={18}/></button>
      </div>
      
      <div className="space-y-4">
        <Input 
          label="Label Lokasi" 
          placeholder="Rumah, Kost, dll" 
          value={formData.manualTitle} 
          onChange={e => setFormData({...formData, manualTitle: e.target.value})} 
        />
        
        <div className="grid grid-cols-2 gap-3">
          <Input label="Negara" value={formData.country} readOnly />
          <Input 
            label="Provinsi" 
            placeholder="DKI Jakarta" 
            value={formData.province} 
            onChange={e => setFormData({...formData, province: e.target.value})} 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input 
            label="Kota/Kabupaten" 
            placeholder="Jakarta Selatan" 
            value={formData.city} 
            onChange={e => setFormData({...formData, city: e.target.value})} 
          />
          <Input 
            label="Kode Pos" 
            inputMode="numeric" 
            placeholder="12345" 
            value={formData.postalCode} 
            onChange={e => handleNumericInput('postalCode', e.target.value, 5)} 
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input 
            label="RT" 
            inputMode="numeric" 
            placeholder="001" 
            value={formData.rt} 
            onChange={e => handleNumericInput('rt', e.target.value, 3)} 
          />
          <Input 
            label="RW" 
            inputMode="numeric" 
            placeholder="002" 
            value={formData.rw} 
            onChange={e => handleNumericInput('rw', e.target.value, 3)} 
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">Alamat Lengkap</label>
          <textarea 
            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary h-20 resize-none" 
            placeholder="Jalan, Blok, No..." 
            value={formData.fullAddress} 
            onChange={e => setFormData({...formData, fullAddress: e.target.value})} 
          />
        </div>

        <Input 
          label="Catatan Patokan" 
          placeholder="Seberang toko roti..." 
          value={formData.notes} 
          onChange={e => setFormData({...formData, notes: e.target.value})} 
        />

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-900 dark:text-slate-200 block">Foto Lokasi (Opsional)</label>
          <div 
            className="w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex items-center justify-center bg-white dark:bg-slate-800 cursor-pointer overflow-hidden" 
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.locationPhoto ? (
               <img src={formData.locationPhoto} className="w-full h-full object-cover" alt="Loc" />
            ) : (
               <div className="text-center text-slate-400">
                 <Camera size={24} className="mx-auto mb-1"/>
                 <p className="text-[10px]">Klik upload foto</p>
               </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
        </div>

        <Button className="w-full" onClick={onSave}>Simpan & Gunakan</Button>
      </div>
    </Card>
  );
};
