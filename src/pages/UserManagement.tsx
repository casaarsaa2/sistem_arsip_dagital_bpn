import * as React from "react";
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { User, UserRole } from '../types';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreVertical, UserPlus, Shield, User as UserIcon, Trash2, CheckCircle2, XCircle, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/src/lib/utils";
import { useAuth } from '../lib/auth';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'PETUGAS_ARSIP' as UserRole,
  });

  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initUsers = async () => {
      const { db } = await (await import('../lib/firebase')).getFirebase();
      if (!db) {
        setLoading(false);
        return;
      }
      
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        const userList = snapshot.docs.map(doc => ({
          ...doc.data(),
          uid: doc.id
        })) as User[];
        setUsers(userList);
        setLoading(false);
      });
    };

    initUsers();
    return () => unsubscribe?.();
  }, []);

  const handleOpenForm = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        displayName: user.displayName,
        email: user.email,
        password: '',
        role: user.role,
      });
    } else {
      setEditingUser(null);
      setFormData({
        displayName: '',
        email: '',
        password: '',
        role: 'PETUGAS_ARSIP',
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveUser = async () => {
    if (!formData.displayName || !formData.email) {
      toast.error("Nama dan ID Pengguna wajib diisi");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Kata Sandi wajib diisi untuk pengguna baru");
      return;
    }

    try {
      const { db } = await (await import('../lib/firebase')).getFirebase();
      if (!db) return;

      if (editingUser) {
        // Update
        await updateDoc(doc(db, 'users', editingUser.uid), {
          displayName: formData.displayName,
          role: formData.role,
        });
        toast.success("Profil pengguna diperbarui");
      } else {
        // Create skeleton profile with temporary password
        // Note: In this simulation, we store the password in the pre-profile 
        // so the system can verify it later if we want custom login, 
        // but for now we'll just store it so the admin knows what it is.
        const tempUid = formData.email.replace(/[^a-zA-Z0-9]/g, '_');
        await setDoc(doc(db, 'users', tempUid), {
          displayName: formData.displayName,
          email: formData.email,
          role: formData.role,
          tempPassword: formData.password, // Only used for simulation/reference
          isActive: true,
          createdAt: serverTimestamp(),
        });
        toast.success("Pengguna berhasil ditambahkan ke sistem");
      }
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan data pengguna");
    }
  };

  const handleUpdateRole = async (uid: string, newRole: UserRole) => {
    try {
      const { db } = await (await import('../lib/firebase')).getFirebase();
      if (!db) return;
      await updateDoc(doc(db, 'users', uid), {
        role: newRole
      });
      toast.success(`Role diperbarui ke ${newRole}`);
    } catch (error) {
      toast.error("Gagal memperbarui role");
    }
  };

  const toggleActiveStatus = async (uid: string, currentStatus: boolean) => {
    try {
      const { db } = await (await import('../lib/firebase')).getFirebase();
      if (!db) return;
      await updateDoc(doc(db, 'users', uid), {
        isActive: !currentStatus
      });
      toast.success(`User ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
    } catch (error) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (userToDelete.uid === currentUser?.uid) {
      toast.error("Anda tidak bisa menghapus akun Anda sendiri");
      return;
    }

    if (userToDelete.role === 'SUPER_ADMIN' && currentUser?.role !== 'SUPER_ADMIN') {
      toast.error("Hanya Super Admin yang bisa menghapus Super Admin");
      return;
    }

    if (!window.confirm(`PERINGATAN KRITIS: Menghapus pengguna ${userToDelete.displayName} akan mencabut semua hak aksesnya ke sistem secara permanen. Lanjutkan?`)) return;

    try {
      const { db } = await (await import('../lib/firebase')).getFirebase();
      if (!db) return;
      await deleteDoc(doc(db, 'users', userToDelete.uid));
      toast.success("Pengguna dihapus");
    } catch (error) {
      toast.error("Gagal menghapus pengguna");
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200 text-[9px] font-bold uppercase">Super Admin</Badge>;
      case 'ADMIN':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200 text-[9px] font-bold uppercase">Admin</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-slate-200 text-[9px] font-bold uppercase">Petugas</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-mono text-xs uppercase animate-pulse">Memuat Data Pengguna...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Manajemen Pengguna</h2>
          <p className="text-[11px] text-slate-500 font-medium">Kelola hak akses dan peran petugas sistem.</p>
        </div>
        <Button 
          className="bg-[#1e3a8a] hover:bg-[#1e40af] h-9 px-4 rounded space-x-2 text-white"
          onClick={() => handleOpenForm()}
        >
          <UserPlus size={16} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tambah User</span>
        </Button>
      </div>

      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Nama & Email</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Role</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Status</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Terdaftar</TableHead>
              <TableHead className="h-9 w-[40px] px-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user, idx) => (
              <TableRow key={user.uid} className={cn(
                "hover:bg-slate-50/50 transition-colors",
                idx % 2 === 1 && "bg-[#f1f5f9]/30"
              )}>
                <TableCell className="px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-500">
                      <UserIcon size={14} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-[11px] leading-tight">{user.displayName}</p>
                      <p className="text-[10px] text-slate-500 leading-tight">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2">
                  {getRoleBadge(user.role)}
                </TableCell>
                <TableCell className="px-4 py-2">
                  <div className={cn(
                    "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                    user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                  )}>
                    {user.isActive ? "Aktif" : "Non-Aktif"}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-2 text-[10px] text-slate-500 font-medium">
                  {user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString('id-ID') : new Date(user.createdAt).toLocaleDateString('id-ID')) : '-'}
                </TableCell>
                <TableCell className="px-0 py-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center justify-center h-7 w-7 rounded hover:bg-slate-100 transition-colors mx-auto">
                      <MoreVertical size={14} className="text-slate-400" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded p-1 w-40 border-slate-200">
                      <DropdownMenuItem 
                        className="rounded text-[10px] font-bold uppercase py-1.5 cursor-pointer"
                        onClick={() => handleOpenForm(user)}
                      >
                        <Edit size={12} className="mr-2 text-slate-500" /> Edit User
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="rounded text-[10px] font-bold uppercase py-1.5 cursor-pointer"
                        onClick={() => handleUpdateRole(user.uid, 'ADMIN')}
                      >
                        <Shield size={12} className="mr-2 text-blue-500" /> Atur Sebagai Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="rounded text-[10px] font-bold uppercase py-1.5 cursor-pointer"
                        onClick={() => handleUpdateRole(user.uid, 'PETUGAS_ARSIP')}
                      >
                        <UserIcon size={12} className="mr-2 text-slate-500" /> Atur Sebagai Petugas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="rounded text-[10px] font-bold uppercase py-1.5 cursor-pointer"
                        onClick={() => toggleActiveStatus(user.uid, user.isActive)}
                      >
                        {user.isActive ? <XCircle size={12} className="mr-2 text-amber-500" /> : <CheckCircle2 size={12} className="mr-2 text-emerald-500" />}
                        {user.isActive ? "Non-Aktifkan" : "Aktifkan"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="rounded text-[10px] font-bold uppercase py-1.5 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
                        onClick={() => handleDeleteUser(user)}
                      >
                        <Trash2 size={12} className="mr-2" /> Hapus User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-[#1e3a8a] px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-white font-bold">{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Nama Lengkap</Label>
              <Input 
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
                placeholder="Masukkan nama lengkap..."
                className="h-10 rounded border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">ID Pengguna (Tanpa Spasi)</Label>
              <Input 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="ID Petugas atau Email"
                disabled={!!editingUser}
                className="h-10 rounded border-slate-200"
              />
            </div>
            {!editingUser && (
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Kata Sandi Default</Label>
                <Input 
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="Minimal 6 karakter..."
                  className="h-10 rounded border-slate-200"
                />
              </div>
            )}
            <div className="space-y-1.5" key={editingUser ? `edit-${editingUser.uid}` : 'new-user'}>
              <Label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Peran (Role)</Label>
              <Select 
                value={formData.role} 
                onValueChange={(val: UserRole) => setFormData({...formData, role: val})}
              >
                <SelectTrigger className="h-10 rounded border-slate-200 uppercase text-[10px] font-bold">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent className="rounded border-slate-200">
                  <SelectItem value="PETUGAS_ARSIP" className="text-[10px] font-bold uppercase">Petugas Arsip</SelectItem>
                  <SelectItem value="ADMIN" className="text-[10px] font-bold uppercase">Administrator</SelectItem>
                  <SelectItem value="SUPER_ADMIN" className="text-[10px] font-bold uppercase">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded text-[10px] font-bold uppercase tracking-widest h-10 px-6">Batal</Button>
            <Button 
              onClick={handleSaveUser}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded text-[10px] font-bold uppercase tracking-widest h-10 px-6"
            >
              Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
