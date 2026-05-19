import * as React from "react";
import { 
  BarChart3, 
  BookText, 
  FileText, 
  Home, 
  LogOut, 
  Search, 
  Menu,
  Database,
  Users,
  Map,
  Files
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  title: string;
  icon: React.ElementType;
  id: string;
}

const navItems: NavItem[] = [
  { title: "Beranda", icon: Home, id: "dashboard" },
  { title: "Buku Tanah", icon: BookText, id: "buku-tanah" },
  { title: "Surat Ukur", icon: Map, id: "surat-ukur" },
  { title: "Warkah", icon: Files, id: "warkah" },
  { title: "Peminjaman", icon: Database, id: "loans" },
  { title: "Pengguna", icon: Users, id: "users" },
];

interface ShellProps {
  children: React.ReactNode;
  activeId: string;
  onNavigate: (id: string) => void;
  user: any;
  onLogout: () => void;
}

export function Shell({ children, activeId, onNavigate, user, onLogout }: ShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const filteredNavItems = navItems.filter(item => {
    if (item.id === 'users') {
      return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';
    }
    return true;
  });

  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'ADMIN': return 'Admin';
      case 'PETUGAS_ARSIP': return 'Petugas Arsip';
      default: return 'User';
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* ... (rest of mobile sidebar overlay) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-12 flex items-center px-4 bg-[#1e3a8a] text-white space-x-2 shrink-0">
          <img src="/Logo_BPN.png" alt="BPN Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-[10px] font-bold leading-none uppercase tracking-tight">ATR / BPN</h1>
            <p className="text-[8px] opacity-70 uppercase leading-none">Kota Banjarmasin</p>
          </div>
          <button className="ml-auto" onClick={() => setIsMobileMenuOpen(false)}>
            <Menu size={18} className="text-white" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center space-x-2.5 px-3 py-2 rounded transition-colors group",
                activeId === item.id
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              <item.icon size={16} className={activeId === item.id ? "text-blue-700" : "text-slate-400 group-hover:text-blue-500"} />
              <span className="text-[11px]">{item.title}</span>
            </button>
          ))}
        </nav>
        {/* ... */}

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <Button 
            variant="ghost" 
            className="w-full h-8 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2"
            onClick={onLogout}
          >
            <LogOut size={14} className="mr-2" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Keluar</span>
          </Button>
        </div>
      </aside>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-slate-200">
        <div className="h-12 flex items-center px-4 bg-[#1e3a8a] text-white space-x-2 shrink-0">
          <img src="/Logo_BPN.png" alt="BPN Logo" className="w-8 h-8 object-contain" />
          <div>
            <h1 className="text-[10px] font-bold leading-none uppercase tracking-tight">ATR / BPN</h1>
            <p className="text-[8px] opacity-70 uppercase leading-none">Kota Banjarmasin</p>
          </div>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center space-x-2.5 px-3 py-2 rounded transition-colors group",
                activeId === item.id
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-blue-600"
              )}
            >
              <item.icon size={16} className={activeId === item.id ? "text-blue-700" : "text-slate-400 group-hover:text-blue-500"} />
              <span className="text-[11px]">{item.title}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2 px-2 py-2 mb-2">
            <div className="w-7 h-7 rounded bg-amber-400 flex items-center justify-center text-slate-900 font-bold text-[10px]">
              {user?.displayName?.[0] || "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-[10px] font-bold truncate text-slate-800">{user?.displayName || "Admin"}</p>
              <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full h-8 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded px-2"
            onClick={onLogout}
          >
            <LogOut size={14} className="mr-2" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Keluar</span>
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] relative w-full overflow-hidden">
        <header className="h-12 bg-[#1e3a8a] text-white flex items-center justify-between px-4 sm:px-6 shrink-0 shadow-sm z-10 w-full">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button className="md:hidden p-1 hover:bg-blue-700/50 rounded transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={20} className="text-white" />
            </button>
            <h2 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">
              {navItems.find(i => i.id === activeId)?.title || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative group hidden lg:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
              <input 
                type="text" 
                placeholder="Cari berkas..." 
                className="pl-9 pr-4 py-1.5 bg-blue-800/50 text-blue-100 border border-blue-700/50 rounded text-[10px] w-48 xl:w-64 placeholder-blue-300/70 focus:outline-none focus:bg-blue-800/80 transition-all font-medium"
              />
            </div>
            <div className="h-6 w-px bg-blue-700/50 hidden sm:block"></div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold leading-none">{user?.displayName}</p>
              <p className="text-[9px] opacity-70">{getRoleName(user?.role)}</p>
            </div>
            <div className="w-7 h-7 rounded bg-amber-400 flex items-center justify-center text-slate-900 font-bold text-[10px] sm:hidden">
              {user?.displayName?.[0] || "A"}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 custom-scrollbar">
          <div className="max-w-(--breakpoint-2xl) mx-auto w-full">
            {children}
          </div>
        </div>

        <footer className="h-6 bg-slate-100 border-t border-slate-200 px-4 flex items-center justify-between text-[8px] sm:text-[9px] text-slate-500 shrink-0">
          <div className="flex space-x-2 sm:space-x-4">
            <span className="hidden xs:inline">System: <span className="text-emerald-600 font-bold uppercase">Online</span></span>
            <span>v2.4.1</span>
          </div>
          <div className="truncate ml-2">ATR/BPN Kota Banjarmasin &copy; 2024</div>
        </footer>
      </main>
    </div>
  );
}
