import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Palette, User, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsPanelProps {
  profile: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ profile, isOpen, onClose, onUpdate }) => {
  const colors = [
    { name: 'Sky Blue', hex: '#4a90e2' },
    { name: 'Rose', hex: '#e11d48' },
    { name: 'Amber', hex: '#d97706' },
    { name: 'Emerald', hex: '#059669' },
    { name: 'Violet', hex: '#7c3aed' },
    { name: 'Slate', hex: '#475569' }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-md glass rounded-3xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/20 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Palette className="w-5 h-5 text-accent" />
              Site Ayarları
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            <section className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Tema Rengi (Accent)
              </label>
              <div className="grid grid-cols-6 gap-3">
                {colors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => onUpdate({ accentColor: c.hex })}
                    className={`aspect-square rounded-full border-2 transition-all ${
                      profile?.accentColor === c.hex ? 'border-white scale-110 shadow-lg' : 'border-transparent scale-100'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Görünüm Modu
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => onUpdate({ theme: 'light' })}
                  className={`flex-1 py-3 glass rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all ${
                    profile?.theme === 'light' ? 'bg-white shadow-md ring-2 ring-accent/20' : 'opacity-50'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Aydınlık
                </button>
                <button
                  onClick={() => onUpdate({ theme: 'dark' })}
                  className={`flex-1 py-3 glass rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all ${
                    profile?.theme === 'dark' ? 'bg-slate-800 text-white border-transparent' : 'opacity-50'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Karanlık
                </button>
              </div>
            </section>

            <section className="pt-6 border-t border-white/20">
              <div className="flex items-center gap-4 bg-white/30 p-4 rounded-2xl">
                <img src={profile?.photoURL || undefined} className="w-12 h-12 rounded-full border-2 border-white" alt="" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="font-bold text-slate-800">{profile?.displayName}</h3>
                  <p className="text-xs text-slate-500">{profile?.email}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="p-6 pt-0">
            <button
              onClick={onClose}
              className="w-full bg-accent text-white py-3 rounded-xl font-bold shadow-lg shadow-accent/20"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
