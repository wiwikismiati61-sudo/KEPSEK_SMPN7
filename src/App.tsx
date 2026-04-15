import * as React from "react";
import { Plus, Trash2, Download, Upload, ExternalLink, Settings, LayoutDashboard, Search, X, Edit2, Globe } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { AppLink } from "./types";
import { cn } from "@/lib/utils";

const DEFAULT_LINKS: AppLink[] = [
  { id: "1", title: "Dapodik", url: "https://dapo.kemdikbud.go.id/", icon: "Globe" },
  { id: "2", title: "PMM", url: "https://guru.kemdikbud.go.id/", icon: "Globe" },
  { id: "3", title: "Arkas", url: "https://arkas.kemdikbud.go.id/", icon: "Globe" },
  { id: "4", title: "E-Kinerja", url: "https://kinerja.bkn.go.id/", icon: "Globe" },
];

export default function App() {
  const [links, setLinks] = React.useState<AppLink[]>(() => {
    const saved = localStorage.getItem("kepsek_links");
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });
  const [activeLink, setActiveLink] = React.useState<AppLink | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingLink, setEditingLink] = React.useState<AppLink | null>(null);
  const [newLink, setNewLink] = React.useState({ title: "", url: "" });

  React.useEffect(() => {
    localStorage.setItem("kepsek_links", JSON.stringify(links));
  }, [links]);

  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddLink = () => {
    if (!newLink.title || !newLink.url) {
      toast.error("Judul dan URL harus diisi");
      return;
    }
    
    let formattedUrl = newLink.url;
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (editingLink) {
      setLinks(links.map(l => l.id === editingLink.id ? { ...l, title: newLink.title, url: formattedUrl } : l));
      toast.success("Link berhasil diperbarui");
    } else {
      const link: AppLink = {
        id: Math.random().toString(36).substr(2, 9),
        title: newLink.title,
        url: formattedUrl,
        icon: "Globe"
      };
      setLinks([...links, link]);
      toast.success("Link berhasil ditambahkan");
    }
    
    setIsAddDialogOpen(false);
    setEditingLink(null);
    setNewLink({ title: "", url: "" });
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLinks(links.filter(l => l.id !== id));
    if (activeLink?.id === id) setActiveLink(null);
    toast.success("Link berhasil dihapus");
  };

  const handleEditLink = (link: AppLink, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLink(link);
    setNewLink({ title: link.title, url: link.url });
    setIsAddDialogOpen(true);
  };

  const handleBackup = () => {
    const data = JSON.stringify({ links }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-kepsek-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup berhasil diunduh");
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.links && Array.isArray(data.links)) {
          setLinks(data.links);
          toast.success("Data berhasil diimpor");
        } else {
          throw new Error("Format file tidak valid");
        }
      } catch (err) {
        toast.error("Gagal mengimpor data: Format tidak valid");
      }
    };
    reader.readAsText(file);
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-slate-950 text-slate-50 overflow-hidden font-sans">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 glass-sidebar flex flex-col z-20"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">KEPSEK</h1>
                <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">SMPN 7 Pasuruan</p>
              </div>
            </div>

            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input 
                placeholder="Cari aplikasi..." 
                className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 transition-all rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Menu Utama</span>
              <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
                setIsAddDialogOpen(open);
                if (!open) {
                  setEditingLink(null);
                  setNewLink({ title: "", url: "" });
                }
              }}>
                <DialogTrigger render={
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                  </Button>
                } />
                <DialogContent className="glass-card border-white/10 text-slate-50">
                  <DialogHeader>
                    <DialogTitle className="font-display text-xl">{editingLink ? "Edit Link" : "Tambah Link Baru"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">Nama Aplikasi</label>
                      <Input 
                        placeholder="Contoh: Dapodik" 
                        value={newLink.title}
                        onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-400">URL Link</label>
                      <Input 
                        placeholder="https://..." 
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                    <Button onClick={handleAddLink} className="bg-blue-600 hover:bg-blue-500 text-white">
                      {editingLink ? "Simpan Perubahan" : "Tambah Sekarang"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4">
            <div className="space-y-2 pb-6">
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link) => (
                  <motion.div
                    key={link.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setActiveLink(link)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActiveLink(link);
                        }
                      }}
                      className={cn(
                        "w-full group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                        activeLink?.id === link.id 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                          : "hover:bg-white/5 text-slate-300 hover:text-white"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                        activeLink?.id === link.id ? "bg-white/20" : "bg-white/5 group-hover:bg-white/10"
                      )}>
                        <Globe className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{link.title}</p>
                        <p className={cn(
                          "text-[10px] truncate opacity-50",
                          activeLink?.id === link.id ? "text-white" : "text-slate-400"
                        )}>{link.url}</p>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-md hover:bg-white/20"
                          onClick={(e) => handleEditLink(link, e)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-md hover:bg-red-500/20 hover:text-red-400"
                          onClick={(e) => handleDeleteLink(link.id, e)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="p-6 mt-auto border-t border-white/5 bg-black/20">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackup}
                className="bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-2 rounded-xl h-10"
              >
                <Download className="w-3.5 h-3.5" /> Backup
              </Button>
              <div className="relative">
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-xs gap-2 rounded-xl h-10"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <AnimatePresence mode="wait">
                {activeLink ? (
                  <motion.div 
                    key={activeLink.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3"
                  >
                    <h2 className="font-display font-bold text-lg">{activeLink.title}</h2>
                    <Separator orientation="vertical" className="h-4 bg-white/10" />
                    <a 
                      href={activeLink.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      {activeLink.url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400 text-sm font-medium"
                  >
                    Pilih aplikasi dari sidebar untuk memulai
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-white">Admin KEPSEK</span>
                <span className="text-[10px] text-slate-500">SMPN 7 Pasuruan</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 bg-slate-900 relative">
            <AnimatePresence mode="wait">
              {activeLink ? (
                <motion.div
                  key={activeLink.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full"
                >
                  <iframe 
                    src={activeLink.url} 
                    className="w-full h-full border-none"
                    title={activeLink.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center mb-8 mx-auto border border-white/10">
                      <LayoutDashboard className="w-12 h-12 text-blue-500" />
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4">Selamat Datang</h3>
                    <p className="text-slate-400 leading-relaxed mb-8">
                      Dashboard KEPSEK SMPN 7 Pasuruan. Kelola semua link aplikasi administrasi sekolah Anda dalam satu tempat yang aman dan terorganisir.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                          <Plus className="w-4 h-4 text-blue-400" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tambah</p>
                        <p className="text-sm text-slate-300">Tambah link aplikasi baru dengan mudah.</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                          <Download className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Backup</p>
                        <p className="text-sm text-slate-300">Simpan data Anda dan pulihkan kapan saja.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          </div>
        </main>

        <Toaster position="top-right" theme="dark" closeButton />
      </div>
    </TooltipProvider>
  );
}
