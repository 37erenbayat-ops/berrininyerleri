import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Map as MapIcon, 
  List as ListIcon, 
  LogOut, 
  Settings,
  Heart,
  TrendingUp,
  Globe,
  Camera,
  Layers,
  Star,
  MapPin
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { usePins } from './hooks/usePins';
import { MapView } from './components/MapView';
import { PinDetails } from './components/PinDetails';
import { SettingsPanel } from './components/SettingsPanel';
import { Pin } from './types';
import { cn, formatDate } from './lib/utils';

export default function App() {
  const { user, profile, loading: authLoading, login, logout, updateProfile } = useAuth();
  const { pins, loading: pinsLoading, addPin, updatePin, deletePin } = usePins();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedPin, setSelectedPin] = useState<Partial<Pin> | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'visited' | 'wishlist'>('all');

  React.useEffect(() => {
    if (profile?.accentColor) {
      document.documentElement.style.setProperty('--accent-color', profile.accentColor);
    }
    if (profile?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile?.accentColor, profile?.theme]);

  const stats = {
    visited: pins.filter(p => p.type === 'visited').length,
    wishlist: pins.filter(p => p.type === 'wishlist').length,
    countries: new Set(pins.map(p => p.location.address?.split(', ').pop()).filter(Boolean)).size,
    favorites: pins.filter(p => p.isFavorite).length
  };

  const filteredPins = pins.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || p.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleMapClick = (lat: number, lng: number) => {
    if (!user) return;
    setSelectedPin({
      location: { lat, lng },
      type: 'visited',
      rating: 0,
      images: []
    });
    setIsDetailsOpen(true);
  };

  const handlePinClick = (pin: Pin) => {
    setSelectedPin(pin);
    setIsDetailsOpen(true);
  };

  const handleSavePin = async (data: Partial<Pin>) => {
    if (data.id) {
      await updatePin(data.id, data);
    } else {
      await addPin(data);
    }
    setIsDetailsOpen(false);
    setSelectedPin(null);
  };

  const handleDeletePin = async (id: string) => {
    // Relying on internal PinDetails confirmation instead of window.confirm for iframe stability
    await deletePin(id);
    setIsDetailsOpen(false);
    setSelectedPin(null);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-stone-50">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-16 h-16 bg-stone-800 rounded-3xl flex items-center justify-center shadow-2xl"
        >
          <MapIcon className="text-white w-8 h-8" />
        </motion.div>
        <p className="mt-6 font-serif text-stone-500 italic animate-pulse">Berrin'in Yerleri hazırlanıyor...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col md:flex-row bg-stone-900 text-white overflow-hidden">
        <div className="flex-1 relative h-1/2 md:h-full">
          <img 
            src="https://picsum.photos/seed/travel/1920/1080?blur=4" 
            alt="Travel background" 
            className="absolute inset-0 w-full h-full object-cover opacity-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent flex flex-col justify-end p-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl font-serif font-bold mb-4">Berrin’in Yerleri</h1>
              <p className="text-xl text-stone-300 max-w-md leading-relaxed">
                Dünyayı keşfetme serüvenini ölümsüzleştir. Gittiğin yerler, hayalini kurduğun rotalar tek bir haritada.
              </p>
            </motion.div>
          </div>
        </div>
        <div className="w-full md:w-[450px] bg-stone-50 flex flex-col items-center justify-center p-12 gap-8">
          <div className="text-center">
            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">Hoş Geldin</h2>
            <p className="text-stone-500">Maceraya devam etmek için giriş yap</p>
          </div>
          
          <button 
            onClick={login}
            className="w-full bg-stone-800 hover:bg-stone-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-stone-800/20"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 bg-white rounded-full p-0.5" alt="" />
            Google ile Giriş Yap
          </button>

          <div className="pt-8 border-t border-stone-200 w-full">
            <p className="text-xs text-center text-stone-400 font-medium uppercase tracking-[0.2em] leading-loose">
              "Dünya bir kitaptır ve seyahat etmeyenler onun sadece bir sayfasını okurlar."
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-[#e2e8f0] overflow-hidden text-slate-800 font-sans relative">
      {/* Background Dots */}
      <div className="absolute inset-0 map-background-dots z-0" />

      {/* Header bar - Floating Frosted Glass */}
      <header className="absolute top-6 left-6 right-6 h-16 px-6 glass rounded-2xl flex items-center justify-between z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-lg border-2 border-white transform rotate-[-45deg] relative">
               <div className="w-2 h-2 bg-white rounded-full translate-x-[1px] translate-y-[1px]" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 hidden md:block">
              Berrin’in Yerleri
            </h1>
          </div>
          
          <div className="relative group w-48 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Şehir veya Anı Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-200/50 border border-transparent focus:border-white/50 focus:bg-white rounded-full pl-11 pr-4 py-2 text-sm focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-800 leading-tight">{profile?.displayName}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-accent leading-none">Gezgin</span>
            </div>
            <img src={profile?.photoURL || undefined} alt="" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sidebar logic replaced by floating bottom nav */}
      <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 glass px-2 py-2 rounded-2xl shadow-2xl flex items-center gap-1 z-50">
        <button 
          onClick={() => setView('map')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
            view === 'map' ? "bg-accent text-white shadow-md" : "text-slate-500 hover:bg-slate-200/50"
          )}
        >
          <MapIcon className="w-4 h-4" />
          <span className="hidden md:inline">Harita Görünümü</span>
        </button>
        <button 
          onClick={() => setView('list')}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
            view === 'list' ? "bg-accent text-white shadow-md" : "text-slate-500 hover:bg-slate-200/50"
          )}
        >
          <ListIcon className="w-4 h-4" />
          <span className="hidden md:inline">Liste Görünümü</span>
        </button>
        <button 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-200/50 transition-all"
        >
          <Heart className="w-4 h-4" />
        </button>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-200/50 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>
      </nav>

      <SettingsPanel
        profile={profile}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={updateProfile}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 h-full overflow-hidden">
        {/* View Switcher Container */}
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === 'map' ? (
              <motion.div 
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full"
              >
                <MapView 
                  pins={filteredPins} 
                  tempPin={selectedPin}
                  onMapClick={handleMapClick}
                  onPinClick={handlePinClick}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full h-full overflow-y-auto pt-32 pb-32 px-8 custom-scrollbar"
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPins.length === 0 ? (
                    <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-slate-400">
                      <Globe className="w-20 h-20 mb-6 opacity-10" />
                      <p className="text-lg font-medium">Buralar henüz keşfedilmemiş...</p>
                    </div>
                  ) : filteredPins.map(pin => (
                    <motion.div
                      layoutId={pin.id}
                      key={pin.id}
                      onClick={() => handlePinClick(pin)}
                      className="group glass p-6 flex flex-col gap-5 cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white",
                          pin.type === 'visited' ? "bg-visited" : "bg-wishlist"
                        )}>
                          {pin.type === 'visited' ? 'Gidildi' : 'Hayal'}
                        </div>
                        {pin.rating && pin.rating > 0 && (
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={cn("w-3 h-3", i < pin.rating! ? "fill-current" : "text-slate-300")} />
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                        {pin.title}
                      </h3>
                      
                      <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed h-15">
                        {pin.notes || 'Anı henüz yazılmamış...'}
                      </p>

                      <div className="mt-auto pt-5 flex items-center justify-between border-t border-slate-200/50">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-accent" />
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {pin.date ? formatDate(pin.date) : 'Tarih Yok'}
                          </span>
                        </div>
                        {pin.isFavorite && <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats Overlay - Floating Panels */}
        <div className="absolute left-8 top-32 flex flex-col gap-4 pointer-events-none z-30">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="glass px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center min-w-[140px]"
          >
            <div className="text-2xl font-black text-accent leading-none">{stats.visited}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gidilen Yerler</div>
          </motion.div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="glass px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center min-w-[140px]"
          >
            <div className="text-2xl font-black text-accent leading-none">{stats.countries}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ülkeler</div>
          </motion.div>
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass px-6 py-4 rounded-2xl shadow-xl flex flex-col items-center min-w-[140px]"
          >
            <div className="text-2xl font-black text-accent leading-none">{stats.wishlist}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Hedefler</div>
          </motion.div>
        </div>
      </main>


      {/* Detail & Add Panel */}
      <PinDetails 
        pin={selectedPin || {}} 
        isOpen={isDetailsOpen} 
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedPin(null);
        }}
        onSave={handleSavePin}
        onDelete={handleDeletePin}
      />
    </div>
  );
}
