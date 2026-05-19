import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Download,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Database
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Archive, ArchiveType } from "../types";
import { useArchives } from "../lib/hooks";
import { useLoans } from "../lib/loanHooks";
import { ArchiveForm } from "@/src/components/archive/ArchiveForm";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useAuth } from '../lib/auth';

interface ArchiveListProps {
  type: ArchiveType;
}

export function ArchiveList({ type }: ArchiveListProps) {
  const [search, setSearch] = React.useState("");
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isLoanOpen, setIsLoanOpen] = React.useState(false);
  const [editingArchive, setEditingArchive] = React.useState<Archive | null>(null);
  const [loanArchive, setLoanArchive] = React.useState<Archive | null>(null);
  const [borrowerName, setBorrowerName] = React.useState("");
  const [loanNotes, setLoanNotes] = React.useState("");
  
  const { archives, loading, addArchive, updateArchive, removeArchive } = useArchives(type);
  const { createLoan } = useLoans();
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  const filtered = archives.filter(a => {
    const term = search.toLowerCase();
    return (
      a.namaPemegangHak.toLowerCase().includes(term) ||
      (a.noHak?.toLowerCase().includes(term)) ||
      (a.noDI208?.toLowerCase().includes(term)) ||
      (a.noSU?.toLowerCase().includes(term))
    );
  });

  const handleSubmit = async (values: any) => {
    try {
      if (editingArchive) {
        await updateArchive(editingArchive.id, values);
        toast.success("Arsip berhasil diperbarui");
      } else {
        await addArchive({ ...values, type });
        toast.success("Arsip baru berhasil ditambahkan");
      }
      setIsFormOpen(false);
      setEditingArchive(null);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan arsip. Pastikan Firebase sudah Aktif.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus arsip ini?")) {
      try {
        await removeArchive(id);
        toast.success("Arsip berhasil dihapus");
      } catch (error) {
        toast.error("Gagal menghapus arsip");
      }
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 text-sm font-medium">Memuat data arsip...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-1.5">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Cari nama, nomor..." 
              className="pl-8 h-9 w-full sm:w-64 rounded bg-white border-slate-200 text-xs focus:bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="rounded h-9 w-9 shrink-0 border-slate-200">
            <Filter size={16} className="text-slate-500" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="outline" className="rounded h-9 px-3 space-x-1.5 border-slate-200 text-slate-600">
            <Download size={16} />
            <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider">Ekspor</span>
          </Button>
          <Button 
            className="bg-[#1e3a8a] hover:bg-[#1e40af] rounded h-9 px-3 space-x-1.5 text-white"
            onClick={() => {
              setEditingArchive(null);
              setIsFormOpen(true);
            }}
          >
            <Plus size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Arsip Baru</span>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          <Table className="high-density-text">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Nomor</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Pemegang Hak</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Wilayah</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4">Lokasi Simpan</TableHead>
              <TableHead className="h-9 font-bold text-slate-600 text-[10px] uppercase tracking-wider px-4 text-center">Status</TableHead>
              <TableHead className="h-9 w-[40px] px-0"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-48 text-center bg-slate-50/30">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-40">
                    <Database size={32} className="text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 italic">Data arsip tidak ditemukan</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((archive, idx) => (
                <TableRow key={archive.id} className={cn(
                  "hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0",
                  idx % 2 === 1 && "bg-[#f1f5f9]/50"
                )}>
                  <TableCell className="px-4 py-2 font-bold text-blue-800 text-[11px] font-mono">
                    {type === 'BUKU_TANAH' ? (archive.noHak || "-") : type === 'SURAT_UKUR' ? (archive.noSU || "-") : (archive.noDI208 || "-")}
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 leading-none">{archive.namaPemegangHak}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                        {type === 'BUKU_TANAH' ? archive.jenisHak : type === 'SURAT_UKUR' ? `Tahun SU: ${archive.tahunSU || '-'}` : archive.jenisWarkah}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="space-y-0.5">
                      <p className="text-slate-700 text-[11px] font-medium leading-none">{archive.kelurahan}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">{archive.kecamatan}</p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center space-x-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">R:{archive.rak}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">S:{archive.shaft}</span>
                      {(archive.boks || archive.bundel) && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                          {(type === 'BUKU_TANAH' || type === 'SURAT_UKUR') ? 'BND:' + archive.bundel : 'BKS:' + archive.boks}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-center">
                    <span className={cn(
                      "status-chip",
                      archive.status === 'Available' ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    )}>
                      {archive.status === 'Available' ? 'Tersedia' : 'Dipinjam'}
                    </span>
                  </TableCell>
                  <TableCell className="px-0 py-2 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center justify-center h-7 w-7 rounded hover:bg-slate-100 transition-colors mx-auto">
                        <MoreVertical size={14} className="text-slate-400" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded p-1 w-32 border-slate-200 shadow-lg">
                        <DropdownMenuItem className="rounded text-[10px] font-bold uppercase tracking-tight py-1.5 cursor-pointer">
                          <Eye size={12} className="mr-2 text-slate-400" /> <span>Detail</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded text-[10px] font-bold uppercase tracking-tight py-1.5 cursor-pointer text-blue-700 focus:text-blue-800 focus:bg-blue-50"
                          onClick={() => {
                            if (archive.status === 'Available') {
                              setLoanArchive(archive);
                              setIsLoanOpen(true);
                            } else {
                              toast.error("Arsip sedang dipinjam");
                            }
                          }}
                        >
                          <Database size={14} /> <span>Pinjam Arsip</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="rounded-lg space-x-2 py-2 cursor-pointer"
                          onClick={() => {
                            setEditingArchive(archive);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit size={14} className="text-slate-500" /> <span>Edit</span>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <DropdownMenuItem 
                            className="rounded-lg space-x-2 py-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDelete(archive.id)}
                          >
                            <Trash2 size={14} /> <span>Hapus</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[1200px] w-[95vw] p-0 overflow-hidden sm:rounded-[40px] border-none shadow-2xl bg-white focus:outline-none">
          <div className="bg-white p-6 sm:p-8 max-h-[95dvh] overflow-y-auto custom-scrollbar">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {editingArchive ? "Perbarui Data Arsip" : "Tambah Arsip Baru"}
              </DialogTitle>
              <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                Silakan lengkapi informasi formulir di bawah ini dengan benar untuk manajemen arsip digital Kantor Pertanahan.
              </p>
            </DialogHeader>
            <div className="mt-2">
              <ArchiveForm 
                type={type} 
                onSubmit={handleSubmit} 
                initialValues={editingArchive ? (editingArchive as any) : undefined} 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isLoanOpen} onOpenChange={setIsLoanOpen}>
        <DialogContent className="max-w-md sm:rounded-[32px] border-none shadow-2xl p-6 sm:p-8 w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold">Input Peminjaman</DialogTitle>
            <p className="text-xs sm:text-sm text-slate-500">
              Mencatat peminjaman arsip: <span className="font-bold text-slate-900">{loanArchive?.namaPemegangHak}</span>
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Peminjam</Label>
              <Input 
                placeholder="Masukkan nama lengkap..." 
                className="rounded-xl border-slate-200 h-12"
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Catatan (Opsional)</Label>
              <Textarea 
                placeholder="Alasan peminjaman / detail tambahan..." 
                className="rounded-xl border-slate-200 min-h-[100px]"
                value={loanNotes}
                onChange={(e) => setLoanNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsLoanOpen(false)} className="rounded-xl">Batal</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 h-11 font-bold"
              onClick={async () => {
                if (!borrowerName) return toast.error("Nama peminjam wajib diisi");
                try {
                  await createLoan(loanArchive!.id, borrowerName, loanNotes);
                  toast.success("Peminjaman berhasil dicatat");
                  setIsLoanOpen(false);
                  setBorrowerName("");
                  setLoanNotes("");
                } catch (error) {
                  toast.error("Gagal mencatat peminjaman");
                }
              }}
            >
              Simpan Peminjaman
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

