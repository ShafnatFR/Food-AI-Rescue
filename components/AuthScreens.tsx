import React, { useState } from 'react';
import { Eye, EyeOff, Mail, User as UserIcon, Lock, Smartphone, CheckCircle, XCircle, Coffee, Shield } from 'lucide-react';
import { Button, Input, BackButton } from './ui';
import { ScreenName } from '../types';

/* 
  --- SQL LOGIC STRUCTURE (MOCK DATA) ---
  
  Table: users
  | id | email                  | password    | full_name      | role_id |
  |----|------------------------|-------------|----------------|---------|
  | 1  | user@gmail.com         | 123         | Budi Santoso   | 1       |
  | 2  | admin@gmail.com        | 123         | System Admin   | 99      |
  | 3  | mitra@gmail.com        | 123         | Mitra Sukses   | 2       |

  Table: roles
  | id | role_name | description             |
  |----|-----------|-------------------------|
  | 1  | USER      | Regular user            |
  | 2  | PARTNER   | Restaurant/Store Partner|
  | 99 | ADMIN     | System Administrator    |
*/

const MOCK_USERS = [
  {
    id: 1,
    email: 'user@gmail.com',
    password: '123',
    name: 'Budi Santoso',
    role: 'USER' 
  },
  {
    id: 2,
    email: 'admin@gmail.com',
    password: '123',
    name: 'System Admin',
    role: 'ADMIN'
  },
  {
    id: 3,
    email: 'mitra@gmail.com',
    password: '123',
    name: 'Mitra Sukses',
    role: 'PARTNER'
  }
];

interface AuthProps {
  navigate: (screen: ScreenName) => void;
  onLoginSuccess?: (role: 'USER' | 'PARTNER' | 'ADMIN') => void;
  onAdminLogin?: () => void; // Keep for backward compatibility if needed, but main login covers it now
}

export const LoginScreen: React.FC<AuthProps> = ({ navigate, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.email === email && u.password === password);

      if (user) {
        // Login Success
        if (onLoginSuccess) {
          onLoginSuccess(user.role as 'USER' | 'PARTNER' | 'ADMIN');
        } else {
          // Fallback if prop not provided
          navigate('HOME');
        }
      } else {
        // Login Failed
        alert('Email atau password salah! \nCoba:\nUser: user@gmail.com / 123\nMitra: mitra@gmail.com / 123\nAdmin: admin@gmail.com / 123');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleDemoLogin = (role: 'USER' | 'PARTNER' | 'ADMIN') => {
    const demoUser = MOCK_USERS.find(u => u.role === role);
    if (demoUser) {
      setEmail(demoUser.email);
      setPassword(demoUser.password);
    }
    
    setIsLoading(true);
    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess(role);
      } else {
        navigate('HOME');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full p-6 bg-white overflow-y-auto no-scrollbar">
      <div className="flex-1 flex flex-col justify-center items-center py-6">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6">
          <Coffee className="w-8 h-8 text-primary" strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-8 text-center">Please enter your details to sign in.</p>

        <form className="w-full space-y-4" onSubmit={handleLogin}>
          <Input 
            label="Email" 
            type="email" 
            placeholder="user@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input 
            label="Password" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary" />
              <span className="text-gray-600">Remember me</span>
            </label>
            <button type="button" onClick={() => navigate('FORGOT_PASSWORD')} className="text-primary font-medium hover:text-orange-600">
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="mt-6 w-full" variant="primary" isLoading={isLoading}>Sign in</Button>
          
          <Button type="button" variant="outline" className="mt-4 w-full flex items-center justify-center gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Sign in with Google
          </Button>
        </form>

        {/* Demo Login Buttons */}
        <div className="mt-8 w-full">
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-400 font-medium">Akun Demo (Uji Coba)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
             <button 
               onClick={() => handleDemoLogin('USER')}
               disabled={isLoading}
               className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 transition-all group active:scale-95"
             >
               <UserIcon size={20} className="mb-1 text-gray-400 group-hover:text-blue-500" />
               <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-600">Penerima</span>
             </button>
             <button 
               onClick={() => handleDemoLogin('PARTNER')}
               disabled={isLoading}
               className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-100 hover:text-orange-600 transition-all group active:scale-95"
             >
               <Coffee size={20} className="mb-1 text-gray-400 group-hover:text-orange-500" />
               <span className="text-[10px] font-bold text-gray-500 group-hover:text-orange-600">Mitra</span>
             </button>
             <button 
               onClick={() => handleDemoLogin('ADMIN')}
               disabled={isLoading}
               className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-purple-50 hover:border-purple-100 hover:text-purple-600 transition-all group active:scale-95"
             >
               <Shield size={20} className="mb-1 text-gray-400 group-hover:text-purple-500" />
               <span className="text-[10px] font-bold text-gray-500 group-hover:text-purple-600">Admin</span>
             </button>
          </div>
        </div>
      </div>

      <div className="mt-auto py-4 text-center text-sm text-gray-500">
        <p>Don't have an account? <button onClick={() => navigate('SIGNUP')} className="text-primary font-bold hover:underline">Sign up</button></p>
      </div>
    </div>
  );
};

export const SignupScreen: React.FC<AuthProps> = ({ navigate }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-y-auto no-scrollbar">
      <h1 className="text-center text-xl font-bold mb-8 pt-4">Sign Up</h1>
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
        <p className="text-gray-500">Silakan isi detail Anda untuk mendaftar.</p>
      </div>

      <form className="space-y-4 pb-8" onSubmit={(e) => { e.preventDefault(); navigate('HOME'); }}>
        <Input label="Nama Lengkap" placeholder="John Doe" />
        <Input label="Email" type="email" placeholder="john.doe@example.com" />
        <Input 
          label="Kata Sandi" 
          type={showPassword ? "text" : "password"} 
          placeholder="••••••••" 
          rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        <Input 
          label="Konfirmasi Kata Sandi" 
          type={showPassword ? "text" : "password"} 
          placeholder="••••••••" 
          rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          onRightIconClick={() => setShowPassword(!showPassword)}
        />
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 block">Nomor Telepon</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Smartphone size={20} />
              </div>
              <input className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900" placeholder="+62 812 3456 7890" />
            </div>
            <button type="button" className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium hover:bg-gray-200 text-gray-700">Kirim OTP</button>
          </div>
        </div>

        <label className="flex items-start gap-3 mt-4">
          <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" required />
          <span className="text-sm text-gray-600">Saya setuju dengan <a href="#" className="text-primary hover:underline">Syarat dan Ketentuan</a></span>
        </label>

        <Button type="submit" className="mt-6 w-full" variant="primary">Daftar</Button>
        <p className="text-center text-sm text-gray-500 pt-4">Already have an account? <button onClick={() => navigate('LOGIN')} className="text-primary font-bold">Sign In</button></p>
      </form>
    </div>
  );
};

export const ForgotPasswordScreen: React.FC<AuthProps> = ({ navigate }) => (
  <div className="p-6 bg-white h-full flex flex-col">
    <BackButton onClick={() => navigate('LOGIN')} title="Forget Password" />
    
    <div className="flex-1 flex flex-col items-center pt-8">
      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-primary">
        <Lock size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Lupa Kata Sandi?</h2>
      <p className="text-gray-500 text-center mb-8 max-w-xs mx-auto">
        Jangan khawatir! Silakan masukkan alamat email yang terdaftar. Kami akan mengirimkan instruksi pengaturan ulang.
      </p>

      <form className="w-full space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('VERIFICATION'); }}>
        <Input label="Email" type="email" placeholder="tim.jennings@example.com" />
        <Button type="submit" variant="primary" className="w-full">Kirim</Button>
      </form>
    </div>
  </div>
);

export const VerificationScreen: React.FC<AuthProps> = ({ navigate }) => (
  <div className="p-6 bg-white h-full flex flex-col">
    <BackButton onClick={() => navigate('FORGOT_PASSWORD')} title="Verification" />
    
    <div className="flex-1 flex flex-col items-center pt-8">
      <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6 text-primary">
        <Mail size={32} />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">Periksa email Anda!</h2>
      <p className="text-gray-500 text-center mb-8 max-w-xs mx-auto">
        Kami telah mengirimkan kode 4 digit ke <span className="text-gray-900 font-medium">user.email@example.com</span>. Harap periksa kotak masuk dan folder spam Anda.
      </p>

      <form className="w-full space-y-8" onSubmit={(e) => { e.preventDefault(); navigate('NEW_PASSWORD'); }}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 block text-center">Masukkan kode verifikasi</label>
          <div className="flex gap-4 justify-center">
             {[1, 2, 3, 4].map((i) => (
               <input key={i} className="w-14 h-14 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900" maxLength={1} />
             ))}
          </div>
        </div>
        
        <Button type="submit" variant="primary" className="w-full">Verifikasi</Button>
        
        <p className="text-center text-sm text-gray-500">
          Tidak menerima kode? <button type="button" className="text-primary font-medium">Kirim ulang</button> (29)
        </p>
      </form>
    </div>
  </div>
);

export const NewPasswordScreen: React.FC<AuthProps> = ({ navigate }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="p-6 bg-white h-full flex flex-col">
      <BackButton onClick={() => navigate('VERIFICATION')} title="Sandi Baru" />
      
      <div className="flex-1 pt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Buat Akun Anda</h2>
        <p className="text-gray-500 mb-8">Untuk keamanan akun Anda, buatlah kata sandi yang kuat dan mudah diingat.</p>

        <div className="flex justify-center mb-8">
           <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
              <Lock size={32} />
           </div>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate('LOGIN'); }}>
          <Input 
            label="Kata Sandi Baru" 
            type={showPassword ? "text" : "password"} 
            placeholder="Masukkan kata sandi baru Anda" 
            rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onRightIconClick={() => setShowPassword(!showPassword)}
          />
          
          <div className="space-y-2 pl-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <XCircle size={14} /> Harus minimal 8 karakter
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <XCircle size={14} /> Sertakan huruf besar dan kecil
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <XCircle size={14} /> Sertakan angka dan simbol
            </div>
          </div>

          <Input 
            label="Konfirmasi Kata Sandi Baru" 
            type={showPassword ? "text" : "password"} 
            placeholder="Konfirmasi kata sandi baru Anda"
            rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onRightIconClick={() => setShowPassword(!showPassword)} 
          />
          
          <Button type="submit" className="mt-8 w-full" variant="primary">Simpan Kata Sandi</Button>
        </form>
      </div>
    </div>
  );
};