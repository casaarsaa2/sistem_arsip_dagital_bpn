import * as React from "react";
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  setDoc, 
  deleteDoc,
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { Location } from '../types';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Edit, MapPin, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/error-handler';

const INITIAL_LOCATIONS = [
  { 
    kec: "Banjarmasin Selatan", 
    kels: ["Basirih Selatan", "Kelayan Barat", "Kelayan Dalam", "Kelayan Selatan", "Kelayan Tengah", "Kelayan Timur", "Mantuil", "Murung Raya", "Pekauman", "Pemurus Baru", "Pemurus Dalam", "Tanjung Pagar"] 
  },
  { 
    kec: "Banjarmasin Tengah", 
    kels: ["Antasan Besar", "Gadang", "Kelayan Luar", "Kertak Baru Ilir", "Kertak Baru Ulu", "Mawar", "Melayu", "Pasar Lama", "Pekapuran Laut", "Seberang Mesjid", "Sungai Baru", "Teluk Dalam"] 
  },
  { 
    kec: "Banjarmasin Utara", 
    kels: ["Alalak Selatan", "Alalak Tengah", "Alalak Utara", "Antasan Kecil Timur (AKT)", "Pangeran", "Surgi Mufti", "Sungai Jingah", "Sungai Miai", "Kuin Utara"] 
  },
  { 
    kec: "Banjarmasin Timur", 
    kels: ["Benua Anyar", "Karang Mekar", "Kebun Bunga", "Kuripan", "Pekapuran Raya", "Pemurus Luar", "Pengambangan", "Sungai Bilu", "Sungai Lulut"] 
  },
  { 
    kec: "Banjarmasin Barat", 
    kels: ["Basirih", "Belitung Selatan", "Belitung Utara", "Kuin Cerucuk", "Kuin Selatan", "Pelambuan", "Telaga Biru", "Telawang", "Teluk Tiram"] 
  }
];

export function LocationManagement() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'KECAMATAN' as 'KECAMATAN' | 'KELURAHAN',
    parentId: '',
  });

  React.useEffect(() => {
    let unsubscribe: () => void;
    
    const init = async () => {
      const collectionPath = 'locations';
      try {
        if (!db) return;

        const q = collection(db, collectionPath);
        unsubscribe = onSnapshot(q, (snapshot) => {
          const locs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Location));
          setLocations(locs);
          setLoading(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.LIST, collectionPath);
          setLoading(false);
        });
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    init();
    return () => unsubscribe?.();
  }, []);

  const handleSeedData = async () => {
    if (!window.confirm("Ini akan menambahkan daftar wilayah default. Data yang sudah ada tidak akan dihapus. Lanjutkan?")) return;
    
    try {
      if (!db) return;

      const batch = writeBatch(db);
      
      INITIAL_LOCATIONS.forEach(item => {
        const kecId = item.kec.toLowerCase().replace(/\s+/g, '-');
        const kecRef = doc(db, 'locations', kecId);
        batch.set(kecRef, {
          name: item.kec,
          type: 'KECAMATAN'
        });

        item.kels.forEach(kel => {
          const kelId = `${kecId}-${kel.toLowerCase().replace(/\s+/g, '-')}`;
          const kelRef = doc(db, 'locations', kelId);
          batch.set(kelRef, {
            name: kel,
            type: 'KELURAHAN',
            parentId: kecId
          });
        });
      });

      await batch.commit();
      toast.success("Data wilayah berhasil diinisialisasi");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menginisialisasi data wilayah");
    }
  };

  const handleOpenForm = (loc?: Location) => {
    if (loc) {
      setEditingLocation(loc);
      setFormData({
        name: loc.name,
        type: loc.type,
        parentId: loc.parentId || '',
      });
    } else {
      setEditingLocation(null);
      setFormData({
        name: '',
        type: 'KECAMATAN',
        parentId: '',
      });
    }
    setIsFormOpen(true);
  };

  const handleSaveLocation = async () => {
    if (!formData.name) return toast.error("Nama wajib diisi");
    if (formData.type === 'KELURAHAN' && !formData.parentId) return toast.error("Kecamatan wajib dipilih untuk Kelurahan");

    try {
      if (!db) return;

      const id = editingLocation?.id || formData.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'locations', id), {
        name: formData.name,
        type: formData.type,
        ...(formData.type === 'KELURAHAN' ? { parentId: formData.parentId } : {}),
      }, { merge: true });

      toast.success("Wilayah berhasil disimpan");
      setIsFormOpen(false);
    } catch (error) {
      toast.error("Gagal menyimpan data wilayah");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Hapus wilayah ${name}?`)) return;

    try {
      if (!db) return;

      await deleteDoc(doc(db, 'locations', id));
      toast.success("Wilayah berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus wilayah");
    }
  };

  const kecamatans = locations.filter(l => l.type === 'KECAMATAN');
  const kelurahans = locations.filter(l => l.type === 'KELURAHAN');

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 text-sm font-medium">Memuat data wilayah...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none mb-1">Manajemen Wilayah</h2>
          <p className="text-[11px] text-slate-500 font-medium">Kelola data Kecamatan dan Kelurahan di Kota Banjarmasin.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            className="h-9 px-4 rounded space-x-2 border-slate-200 text-slate-600"
            onClick={handleSeedData}
          >
            <RefreshCw size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Reset/Seed</span>
          </Button>
          <Button 
            className="bg-[#1e3a8a] hover:bg-[#1e40af] h-9 px-4 rounded space-x-2 text-white"
            onClick={() => handleOpenForm()}
          >
            <Plus size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Tambah Wilayah</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kecamatan List */}
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Daftar Kecamatan</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{kecamatans.length}</span>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-bold px-4">Nama Kecamatan</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kecamatans.map(kec => (
                <TableRow key={kec.id} className="hover:bg-slate-50 px-4">
                  <TableCell className="font-bold text-slate-700 py-3 px-4">{kec.name}</TableCell>
                  <TableCell className="flex justify-end space-x-1 py-3 px-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded" onClick={() => handleOpenForm(kec)}>
                      <Edit size={14} className="text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(kec.id, kec.name)}>
                      <Trash2 size={14} className="text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Kelurahan List */}
        <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Daftar Kelurahan</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{kelurahans.length}</span>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] uppercase font-bold px-4">Nama Kelurahan</TableHead>
                <TableHead className="text-[10px] uppercase font-bold px-4">Kecamatan</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kelurahans.map(kel => (
                <TableRow key={kel.id} className="hover:bg-slate-50 px-4">
                  <TableCell className="font-bold text-slate-700 py-3 px-4">{kel.name}</TableCell>
                  <TableCell className="text-[10px] font-bold text-slate-500 px-4 uppercase">{kecamatans.find(k => k.id === kel.parentId)?.name || '-'}</TableCell>
                  <TableCell className="flex justify-end space-x-1 py-3 px-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded" onClick={() => handleOpenForm(kel)}>
                      <Edit size={14} className="text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded hover:bg-red-50 hover:text-red-600" onClick={() => handleDelete(kel.id, kel.name)}>
                      <Trash2 size={14} className="text-slate-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl w-[95vw] rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-white z-[100] focus:outline-none">
          <div className="bg-[#1e3a8a] px-10 py-8">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl font-bold tracking-tight">{editingLocation ? "Edit Wilayah" : "Tambah Wilayah Baru"}</DialogTitle>
              <p className="text-blue-100/70 text-xs font-medium mt-1 uppercase tracking-widest">Manajemen Struktur Wilayah</p>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-8 bg-white">
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase text-slate-400 tracking-widest pl-1">Jenis Wilayah</Label>
              <Select 
                value={formData.type} 
                onValueChange={(val: any) => setFormData({...formData, type: val})}
                disabled={!!editingLocation}
              >
                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm shadow-none focus:ring-4 focus:ring-blue-50 transition-all">
                  <SelectValue placeholder="Pilih Jenis" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-[110] rounded-2xl shadow-2xl">
                  <SelectItem value="KECAMATAN" className="focus:bg-blue-50 py-3 font-semibold text-slate-700">Kecamatan</SelectItem>
                  <SelectItem value="KELURAHAN" className="focus:bg-blue-50 py-3 font-semibold text-slate-700">Kelurahan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <Label className="text-[11px] font-bold uppercase text-slate-400 tracking-widest pl-1">Nama Wilayah</Label>
              <Input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Masukkan nama..."
                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>

            {formData.type === 'KELURAHAN' && (
              <div className="space-y-3">
                <Label className="text-[11px] font-bold uppercase text-slate-400 tracking-widest pl-1">Induk Kecamatan</Label>
                <Select 
                  value={formData.parentId} 
                  onValueChange={(val) => setFormData({...formData, parentId: val})}
                >
                  <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-sm shadow-none focus:ring-4 focus:ring-blue-50 transition-all">
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 z-[110] rounded-2xl shadow-2xl">
                    {kecamatans.map(k => (
                      <SelectItem key={k.id} value={k.id} className="focus:bg-blue-50 py-3 font-semibold text-slate-700">{k.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="p-10 pt-0 bg-white flex sm:justify-between items-center">
            <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] h-12 px-8 hover:bg-slate-50 text-slate-400 hover:text-slate-600">Batal</Button>
            <Button 
              onClick={handleSaveLocation}
              className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] h-12 px-12 shadow-xl shadow-blue-900/20 transition-all active:scale-95"
            >
              Simpan Wilayah
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
