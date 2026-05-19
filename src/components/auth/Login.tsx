import * as React from "react";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database, Lock, User as UserIcon } from 'lucide-react';
import { useAuth } from "@/src/lib/auth";
import { toast } from "sonner";
import { auth as firebaseAuth, db } from "@/src/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const { login } = useAuth();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (isRegistering) {
      try {
        if (!firebaseAuth) throw new Error("Firebase not ready");
        
        // Map 'admin' to internal email
        const finalEmail = email === 'admin' ? 'admin@bpn.go.id' : (email.includes('@') ? email : `${email}@bpn.go.id`);
        const userCred = await createUserWithEmailAndPassword(firebaseAuth, finalEmail, password);
        
        if (displayName || email === 'admin') {
          const finalName = displayName || (email === 'admin' ? 'Super Admin' : '');
          await updateProfile(userCred.user, { displayName: finalName });
        }
        
        toast.success("Registrasi berhasil. Silahkan masuk.");
        setIsRegistering(false);
      } catch (error: any) {
        toast.error("Registrasi Gagal: " + (error.message || "Email sudah digunakan"));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const finalEmail = email.includes('@') ? email : `${email}@bpn.go.id`;
      
      await login(finalEmail, password);
      toast.success("Login berhasil");
    } catch (error: any) {
      console.error(error);
      let message = "Otentikasi Gagal";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        message = "Email atau password salah. Jika Anda pengguna baru, silahkan gunakan menu Daftar.";
      } else if (error.code === 'auth/user-disabled') {
        message = "Akun Anda telah dinonaktifkan. Silahkan hubungi admin.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Terlalu banyak percobaan login. Silahkan coba lagi nanti.";
      } else {
        message = error.message || "Email atau password salah";
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#1e3a8a] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1e40af] rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded shadow-2xl relative z-10 overflow-hidden border border-slate-700/50">
        <div className="p-10 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-8">
            <img src="/Logo_BPN.png" alt="BPN Logo" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight uppercase">Sistem Informasi Arsip</h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Kantor Pertanahan Banjarmasin</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {isRegistering ? "Daftar Akun Baru" : "Otentikasi Petugas"}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">Sistem manajemen data pertanahan terpadu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider ml-1">Nama Lengkap</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input 
                    placeholder="NAMA LENGKAP" 
                    className="pl-9 h-11 bg-slate-50 border-slate-200 rounded text-xs focus:bg-white"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider ml-1">ID Pengguna</label>
              <div className="relative">
                <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  type="text"
                  placeholder="Masukkan ID Petugas..." 
                  className="pl-9 h-11 bg-slate-50 border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 font-medium"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider ml-1">Kata Sandi</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="pl-9 h-11 bg-slate-50 border-slate-200 rounded text-xs focus:bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded text-[11px] font-bold uppercase tracking-widest transition-all mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : isRegistering ? "Daftar Akun" : "Masuk Sistem"}
            </Button>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[10px] text-[#1e3a8a] hover:underline font-bold uppercase tracking-wider"
              >
                {isRegistering ? "Sudah punya akun? Masuk di sini" : "Pengguna baru? Daftar di sini"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">
              Kementerian Agraria dan Tata Ruang / BPN RI
            </p>
          </div>
        </div>

        <div className="hidden md:flex bg-[#1e3a8a] p-12 flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
             <div className="w-16 h-1 bg-white/20 mb-6 rounded-full"></div>
             <p className="text-white font-bold text-lg leading-snug tracking-tight mb-4 italic">
                "Melayani dengan profesional, terpercaya, and modern untuk kepastian hukum."
             </p>
              <div className="flex items-center space-x-3 mt-6">
                 <img src="/Logo_BPN.png" alt="BPN Logo" className="w-8 h-8 object-contain" />
                 <div>
                   <p className="text-white text-[11px] font-bold uppercase">Administrator</p>
                   <p className="text-white/50 text-[9px]">Pusat Data Pertanahan</p>
                 </div>
              </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
             <div className="bg-white/5 border border-white/10 rounded p-3">
                <p className="text-white/40 text-[8px] uppercase font-bold mb-1">SLA Target</p>
                <div className="flex items-baseline space-x-1">
                  <p className="text-white font-bold text-lg leading-none">94%</p>
                  <span className="text-emerald-400 text-[8px] font-bold">+1.2%</span>
                </div>
             </div>
             <div className="bg-white/5 border border-white/10 rounded p-3">
                <p className="text-white/40 text-[8px] uppercase font-bold mb-1">Server Latency</p>
                <p className="text-white font-bold text-lg leading-none">24ms</p>
             </div>
          </div>

          {/* Decorative grid pattern */}
          <div className="absolute inset-0 opacity-10" 
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }}
          />
        </div>
      </div>
    </div>
  );
}
