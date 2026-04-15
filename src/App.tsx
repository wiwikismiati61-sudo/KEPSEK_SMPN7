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
  { id: "1", title: "PORTO FOLIO PRESTASI", url: "https://sites.google.com/view/portofolioprestasinurfadilahsp/profil", icon: "Globe" },
];

export default function App() {
  const [links, setLinks] = React.useState<AppLink[]>(DEFAULT_LINKS);
  const [activeLink, setActiveLink] = React.useState<AppLink | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [editingLink, setEditingLink] = React.useState<AppLink | null>(null);
  const [newLink, setNewLink] = React.useState({ title: "", url: "" });

  // Load links from API on mount
  React.useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch("/api/links");
        const data = await response.json();
        if (data && Array.isArray(data) && data.length > 0) {
          setLinks(data);
        }
      } catch (error) {
        console.error("Failed to fetch links:", error);
        // Fallback to localStorage if API fails
        const saved = localStorage.getItem("kepsek_links");
        if (saved) setLinks(JSON.parse(saved));
      }
    };
    fetchLinks();
  }, []);

  // Save links to API whenever they change
  const saveLinks = async (updatedLinks: AppLink[]) => {
    setLinks(updatedLinks);
    localStorage.setItem("kepsek_links", JSON.stringify(updatedLinks));
    try {
      await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: updatedLinks }),
      });
    } catch (error) {
      console.error("Failed to save links to server:", error);
      toast.error("Gagal menyimpan ke server, data tersimpan di browser");
    }
  };

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

    let updatedLinks: AppLink[];
    if (editingLink) {
      updatedLinks = links.map(l => l.id === editingLink.id ? { ...l, title: newLink.title, url: formattedUrl } : l);
      toast.success("Link berhasil diperbarui");
    } else {
      const link: AppLink = {
        id: Math.random().toString(36).substr(2, 9),
        title: newLink.title,
        url: formattedUrl,
        icon: "Globe"
      };
      updatedLinks = [...links, link];
      toast.success("Link berhasil ditambahkan");
    }
    
    saveLinks(updatedLinks);
    setIsAddDialogOpen(false);
    setEditingLink(null);
    setNewLink({ title: "", url: "" });
  };

  const handleDeleteLink = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedLinks = links.filter(l => l.id !== id);
    saveLinks(updatedLinks);
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
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.links && Array.isArray(data.links)) {
          await saveLinks(data.links);
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
      <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl"
        >
          <div className="p-6 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg leading-tight">KEPSEK</h1>
                <p className="text-xs text-white/80 font-medium tracking-wider uppercase">SMPN 7 Pasuruan</p>
              </div>
            </div>

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input 
                placeholder="Cari aplikasi..." 
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 transition-all rounded-xl border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4 flex items-center justify-between px-6 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu Utama</span>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) {
                setEditingLink(null);
                setNewLink({ title: "", url: "" });
              }
            }}>
              <DialogTrigger render={
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100">
                  <Plus className="w-4 h-4 text-slate-600" />
                </Button>
              } />
              <DialogContent className="bg-white border-slate-200 text-slate-900">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl text-slate-900">{editingLink ? "Edit Link" : "Tambah Link Baru"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">Nama Aplikasi</label>
                    <Input 
                      placeholder="Contoh: Dapodik" 
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">URL Link</label>
                    <Input 
                      placeholder="https://..." 
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Batal</Button>
                  <Button onClick={handleAddLink} className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-none">
                    {editingLink ? "Simpan Perubahan" : "Tambah Sekarang"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-3 pb-6">
              <AnimatePresence mode="popLayout">
                {filteredLinks.map((link, index) => {
                  const colors = [
                    "bg-pink-500 shadow-pink-200",
                    "bg-purple-500 shadow-purple-200",
                    "bg-indigo-500 shadow-indigo-200",
                    "bg-blue-500 shadow-blue-200",
                    "bg-cyan-500 shadow-cyan-200",
                    "bg-teal-500 shadow-teal-200"
                  ];
                  const colorClass = colors[index % colors.length];
                  
                  return (
                    <motion.div
                      key={link.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
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
                          "w-full group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
                          activeLink?.id === link.id 
                            ? "bg-white shadow-2xl scale-[1.02] ring-1 ring-slate-100" 
                            : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg text-white",
                          activeLink?.id === link.id ? colorClass : "bg-slate-200 group-hover:bg-slate-300"
                        )}>
                          <Globe className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "font-bold truncate text-sm tracking-tight",
                            activeLink?.id === link.id ? "text-slate-900" : "text-slate-700"
                          )}>{link.title}</p>
                          <p className="text-[10px] truncate opacity-60 text-slate-500">{link.url}</p>
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-slate-200"
                            onClick={(e) => handleEditLink(link, e)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg hover:bg-red-100 hover:text-red-500"
                            onClick={(e) => handleDeleteLink(link.id, e)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="p-6 mt-auto border-t border-slate-100 bg-slate-50/50">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBackup}
                className="bg-white border-slate-200 hover:bg-slate-50 text-xs gap-2 rounded-xl h-10 shadow-sm"
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
                  className="w-full bg-white border-slate-200 hover:bg-slate-50 text-xs gap-2 rounded-xl h-10 shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" /> Upload
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50">
          <header className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md z-10">
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
                    <h2 className="font-display font-bold text-lg text-slate-900">{activeLink.title}</h2>
                    <Separator orientation="vertical" className="h-4 bg-slate-200" />
                    <a 
                      href={activeLink.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors"
                    >
                      Buka di Tab Baru <ExternalLink className="w-3 h-3" />
                    </a>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-400 text-sm font-medium"
                  >
                    Pilih menu untuk menampilkan konten
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Online</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900">Admin KEPSEK</span>
                <span className="text-[10px] text-slate-500">SMPN 7 Pasuruan</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-0.5 shadow-lg">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fadilah" 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 bg-white relative">
            <AnimatePresence mode="wait">
              {activeLink ? (
                <motion.div
                  key={activeLink.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
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
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md"
                  >
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-purple-200">
                      <LayoutDashboard className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-display font-bold mb-4 text-slate-900">Selamat Datang</h3>
                    <p className="text-slate-500 leading-relaxed mb-8">
                      Dashboard Portofolio Prestasi. Kelola dan tampilkan pencapaian Anda dengan desain yang ceria dan profesional.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-left">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center mb-3">
                          <Plus className="w-5 h-5 text-pink-600" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tambah</p>
                        <p className="text-sm text-slate-600 font-medium">Tambah prestasi baru.</p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-left">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
                          <Download className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Backup</p>
                        <p className="text-sm text-slate-600 font-medium">Simpan data prestasi.</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-200/20 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-200/20 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          </div>
        </main>
        <Toaster position="top-right" theme="light" closeButton />
      </div>
    </TooltipProvider>
  );
}
