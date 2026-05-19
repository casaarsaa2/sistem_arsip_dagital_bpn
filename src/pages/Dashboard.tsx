import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookText, FileText, Database, ArrowUpRight, Map, Files } from 'lucide-react';
import { cn } from "@/src/lib/utils";

const data = [
  { name: 'Mei 15', buku: 40, suratUkur: 15, warkah: 24 },
  { name: 'Mei 16', buku: 30, suratUkur: 12, warkah: 13 },
  { name: 'Mei 17', buku: 20, suratUkur: 45, warkah: 98 },
  { name: 'Mei 18', buku: 27, suratUkur: 22, warkah: 39 },
  { name: 'Mei 19', buku: 18, suratUkur: 28, warkah: 48 },
];

const COLORS = ['#3b82f6', '#10b981'];

export function Dashboard() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <Card className="border-slate-200 shadow-xs rounded p-3 bg-white flex flex-col justify-between h-24 transition-all hover:bg-slate-50">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Buku Tanah</p>
            <h3 className="text-xl font-bold text-slate-900 leading-none">12,450</h3>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +12%
            </span>
            <BookText size={16} className="text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded p-3 bg-white flex flex-col justify-between h-24 transition-all hover:bg-slate-50">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Surat Ukur</p>
            <h3 className="text-xl font-bold text-slate-900 leading-none">5,630</h3>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +8.1%
            </span>
            <Map size={16} className="text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded p-3 bg-white flex flex-col justify-between h-24 transition-all hover:bg-slate-50">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Warkah</p>
            <h3 className="text-xl font-bold text-slate-900 leading-none">8,920</h3>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-[10px] text-emerald-600 font-bold flex items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +5.4%
            </span>
            <Files size={16} className="text-emerald-600 opacity-20" />
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded p-3 bg-white flex flex-col justify-between h-24 transition-all hover:bg-slate-50">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Peminjaman</p>
            <h3 className="text-xl font-bold text-slate-900 leading-none">42</h3>
          </div>
          <div className="mt-auto">
             <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[15%]"></div>
             </div>
             <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold">Berkas Aktif</p>
          </div>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded p-3 bg-white flex flex-col justify-between h-24 transition-all hover:bg-slate-50">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Input Hari Ini</p>
            <h3 className="text-xl font-bold text-slate-900 leading-none">128</h3>
          </div>
          <div className="text-[10px] text-blue-600 font-bold underline cursor-pointer mt-auto">Lihat Rincian</div>
        </Card>

        <Card className="border-slate-200 shadow-xs rounded p-3 bg-white flex flex-col justify-between h-24 transition-all hover:bg-slate-50">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Uptime Sistem</p>
            <h3 className="text-xl font-bold text-slate-900 leading-none">99.9%</h3>
          </div>
          <div className="flex items-center mt-auto">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">Optimal</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-8 border-slate-200 shadow-xs rounded overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex justify-between items-center">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Statistik Penginputan</h3>
            <div className="flex space-x-1">
               <button className="text-[9px] font-bold uppercase px-2 py-1 border border-slate-200 bg-white rounded hover:bg-slate-50 transition-colors">7 Hari</button>
               <button className="text-[9px] font-bold uppercase px-2 py-1 text-slate-400 hover:text-slate-600">30 Hari</button>
            </div>
          </div>
          <CardContent className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b', fontWeight: 500}} 
                  dy={5}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b', fontWeight: 500}} 
                />
                <Tooltip 
                  contentStyle={{fontSize: '11px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="buku" fill="#1e3a8a" radius={[2, 2, 0, 0]} barSize={15} />
                <Bar dataKey="suratUkur" fill="#3b82f6" radius={[2, 2, 0, 0]} barSize={15} />
                <Bar dataKey="warkah" fill="#10b981" radius={[2, 2, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-slate-200 shadow-xs rounded overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 bg-slate-50">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Peringatan Terbaru</h3>
          </div>
          <CardContent className="p-3 space-y-3 overflow-y-auto">
             {[
               { title: "SLA Berkas", text: "12 berkas di Kec. Banjarmasin Barat melebihi batas waktu.", color: "bg-red-500" },
               { title: "Maintenance", text: "Update database sistem dijadwalkan pukul 23:00 malam ini.", color: "bg-amber-500" },
               { title: "Verifikasi Baru", text: "Pendaftaran PTSL baru memerlukan validasi NIB segera.", color: "bg-blue-500" }
             ].map((alert, i) => (
               <div key={i} className="flex space-x-3 p-2 bg-slate-50 rounded border border-slate-100 hover:border-slate-200 transition-colors cursor-pointer">
                  <div className={cn("w-1 h-auto shrink-0 rounded-full", alert.color)}></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-800 leading-none mb-1">{alert.title}</p>
                    <p className="text-[9px] text-slate-500 line-clamp-2">{alert.text}</p>
                  </div>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
