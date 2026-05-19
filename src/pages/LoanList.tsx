import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  RotateCcw, 
  CheckCircle2,
  Clock,
  User,
  Calendar
} from "lucide-react";
import { useLoans } from "../lib/loanHooks";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

export function LoanList() {
  const { loans, loading, returnLoan } = useLoans();

  const handleReturn = async (loanId: string, archiveId: string) => {
    if (!window.confirm("Pastikan berkas fisik sudah diterima kembali. Lanjutkan?")) return;
    try {
      await returnLoan(loanId, archiveId);
      toast.success("Arsip telah dikembalikan");
    } catch (error) {
      toast.error("Gagal memproses pengembalian");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 italic">Memuat data peminjaman...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-white p-3 border border-slate-200 rounded shadow-sm">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Log Peminjaman Berkas</h2>
          <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tight mt-0.5">Monitoring pergerakan arsip fisik</p>
        </div>
        <div className="flex space-x-1">
           <Button variant="outline" size="sm" className="h-7 text-[9px] font-bold uppercase tracking-wider rounded border-slate-200">Export</Button>
           <Button size="sm" className="h-7 text-[9px] font-bold uppercase tracking-wider rounded bg-[#1e3a8a] text-white">Filter</Button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
        <Table className="high-density-text">
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-4 font-bold text-slate-600 border-r border-slate-100 last:border-r-0">PETUGAS / PEMINJAM</TableHead>
              <TableHead className="h-9 px-4 font-bold text-slate-600 border-r border-slate-100 last:border-r-0">WAKTU PINJAM</TableHead>
              <TableHead className="h-9 px-4 font-bold text-slate-600 border-r border-slate-100 last:border-r-0">STATUS</TableHead>
              <TableHead className="h-9 px-4 font-bold text-slate-600 border-r border-slate-100 last:border-r-0">CATATAN</TableHead>
              <TableHead className="h-9 px-4 w-[120px] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 opacity-40">
                    <Clock size={40} className="text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Belum ada riwayat peminjaman</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              loans.map((loan, index) => (
                <TableRow key={loan.id} className={cn(
                  "hover:bg-blue-50/30 transition-colors border-b border-slate-100 last:border-0",
                  index % 2 === 1 && "bg-[#f1f5f9]/50"
                )}>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-600">
                        <User size={12} />
                      </div>
                      <span className="font-bold text-slate-900 uppercase tracking-tight">{loan.borrowerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <div className="flex items-center space-x-1.5 text-slate-600">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="font-medium">{format(new Date(loan.loanDate), 'dd/MM/yy HH:mm')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-2">
                    <span className={cn(
                      "status-chip",
                      loan.status === 'Active' ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {loan.status === 'Active' ? 'Outstanding' : 'Returned'}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-2 truncate max-w-[200px]">
                    <span className="text-slate-500 font-medium">{loan.notes || "No additional notes"}</span>
                  </TableCell>
                  <TableCell className="px-4 py-2 text-right">
                    {loan.status === 'Active' && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                        onClick={() => handleReturn(loan.id, loan.archiveId)}
                      >
                        <RotateCcw size={10} className="mr-1" /> Kembalikan
                      </Button>
                    )}
                    {loan.status === 'Returned' && (
                      <div className="inline-flex items-center text-emerald-600 text-[9px] font-bold uppercase px-2 py-1">
                        <CheckCircle2 size={12} className="mr-1" /> Selesai
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
