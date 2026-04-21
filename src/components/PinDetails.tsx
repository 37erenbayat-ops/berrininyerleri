import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Trash2, Calendar, Star, MapPin, Image as ImageIcon, MessageSquare, Plus } from 'lucide-react';
import { Pin, PinType } from '../types';
import { formatDate, cn } from '../lib/utils';
import { GalleryViewer } from './GalleryViewer';

interface PinDetailsProps {
  pin: Partial<Pin>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Pin>) => void;
  onDelete?: (id: string) => void;
}

export const PinDetails: React.FC<PinDetailsProps> = ({ pin, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Pin>>(pin);
  const [isEditing, setIsEditing] = useState(!pin.id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setFormData(pin);
    setIsEditing(!pin.id);
    setShowDeleteConfirm(false);
    setViewerIndex(null);
  }, [pin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    if (pin.id) setIsEditing(false);
  };

  const handleRating = (r: number) => {
    if (!isEditing) return;
    setFormData({ ...formData, rating: r });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    if (!isEditing) return;
    fileInputRef.current?.click();
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress quality to 0.6
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentImages = formData.images || [];
    let processedImages: string[] = [];
    let totalEstimatedSize = JSON.stringify(formData).length;

    for (const file of files as File[]) {
      // Preliminary check to avoid trying to process massive files
      if (file.size > 15 * 1024 * 1024) { 
        console.warn(`File ${file.name} is too large (>15MB). Skipping.`);
        continue;
      }

      try {
        const compressedBase64 = await compressImage(file as File);
        const newTotalSize = totalEstimatedSize + compressedBase64.length;
        
        if (newTotalSize > 900 * 1024) { // Buffer for Firestore's 1MB limit
          alert('Bazı görseller eklenemedi çünkü Firestore limitlerine (1MB) ulaşıldı.');
          break;
        }

        processedImages.push(compressedBase64);
        totalEstimatedSize = newTotalSize;
      } catch (err) {
        console.error("Görsel işleme hatası:", err);
      }
    }

    if (processedImages.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...processedImages]
      }));
    }
  };

  const removeImage = (index: number) => {
    if (!isEditing) return;
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index)
    }));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewerIndex === null || !formData.images) return;
    setViewerIndex((viewerIndex + 1) % formData.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewerIndex === null || !formData.images) return;
    setViewerIndex((viewerIndex - 1 + formData.images.length) % formData.images.length);
  };

  if (!isOpen) return null;

  return (
    <>
      <GalleryViewer 
        images={formData.images}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onPrev={prevImage}
        onNext={nextImage}
      />

      <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-end p-6 pointer-events-none">
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-sm h-[calc(100vh-120px)] glass shadow-2xl rounded-3xl overflow-hidden flex flex-col pointer-events-auto mt-16"
        >
          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-white/20">
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {isEditing ? (formData.id ? 'Düzenle' : 'Yeni Yer Ekle') : formData.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-slate-400">
                <MapPin className="w-3 h-3 text-accent" />
                <span className="text-[10px] uppercase tracking-widest font-bold">
                  {formData.location?.lat.toFixed(4)}, {formData.location?.lng.toFixed(4)}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="flex p-1 bg-slate-200/50 rounded-xl">
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setFormData({ ...formData, type: 'visited' })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    formData.type === 'visited' 
                      ? 'bg-visited text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Gidildi
                </button>
                <button
                  type="button"
                  disabled={!isEditing}
                  onClick={() => setFormData({ ...formData, type: 'wishlist' })}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    formData.type === 'wishlist' 
                      ? 'bg-wishlist text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Hayal
                </button>
              </div>

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lokasyon Adı</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Neresi burası?"
                  className="w-full bg-white/50 border border-transparent focus:border-accent/50 focus:bg-white rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none transition-all disabled:opacity-70 disabled:bg-transparent placeholder:text-slate-300"
                />
              </div>

              {/* Date & Rating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Zaman</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      disabled={!isEditing}
                      value={formData.date || ''}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white/50 border border-transparent focus:border-accent/50 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 focus:outline-none transition-all disabled:opacity-70 disabled:bg-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Deneyim</label>
                  <div className="flex items-center gap-1 py-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        onClick={() => handleRating(s)}
                        className={`w-4 h-4 cursor-pointer transition-colors ${
                          (formData.rating || 0) >= s ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        } ${!isEditing && 'cursor-default'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Hikayen Nedir?</label>
                <textarea
                  disabled={!isEditing}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Anılarını buraya yaz..."
                  rows={4}
                  className="w-full bg-white/50 border border-transparent focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none transition-all disabled:opacity-70 disabled:bg-transparent resize-none placeholder:text-slate-300"
                />
              </div>

              {/* Images Preview placeholder */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center justify-between">
                  Galeri
                  {isEditing && (
                    <input 
                      type="file" 
                      multiple
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {formData.images?.filter(img => !!img).map((img, i) => (
                    <div 
                      key={i} 
                      onClick={() => !isEditing && setViewerIndex(i)}
                      className={cn(
                        "aspect-square rounded-xl overflow-hidden bg-slate-200 relative group border border-white/50 shadow-sm",
                        !isEditing && "cursor-zoom-in"
                      )}
                    >
                      <img src={img || undefined} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add Image Box - Visible in edit mode or when gallery is empty */}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleTriggerUpload}
                      className="aspect-square rounded-xl bg-slate-200/30 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-accent/50 hover:bg-white transition-all group"
                    >
                      <Plus className="w-6 h-6 mb-1 text-slate-300 group-hover:text-accent group-hover:scale-110 transition-all" />
                      <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-accent">Ekle</span>
                    </button>
                  )}

                  {!isEditing && (!formData.images || formData.images.filter(img => !!img).length === 0) && (
                    <div className="col-span-2 py-10 bg-slate-200/30 border border-slate-200/50 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-10" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Henüz görsel yok</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contributor Info */}
              {formData.id && (
                <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/20 flex items-center justify-center text-[10px] font-black text-accent">
                      {formData.createdByName?.[0]}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide italic">{formData.createdByName}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      className="flex-1 bg-accent text-white py-3 rounded-xl font-bold text-sm shadow-xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      {formData.id ? 'Güncelle' : 'Kaydet'}
                    </button>
                    {formData.id && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-3 text-slate-400 hover:text-slate-600 text-xs font-bold transition-all"
                      >
                        Vazgeç
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    {showDeleteConfirm ? (
                      <div className="flex-1 flex flex-col gap-2 bg-red-50/50 p-2 rounded-xl border border-red-100">
                        <span className="text-[10px] font-bold text-red-500 uppercase text-center">Silmek istediğine emin misin?</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onDelete?.(formData.id!)}
                            className="flex-1 bg-red-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                          >
                            Evet, Sil
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 bg-slate-200 text-slate-600 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          className="flex-1 glass py-3 rounded-xl font-bold text-sm hover:bg-slate-200/50 transition-all active:scale-95"
                        >
                          Düzenle
                        </button>
                        {onDelete && formData.id && (
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-3 text-slate-300 hover:text-red-500 rounded-xl transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      </AnimatePresence>
    </>
  );
};

