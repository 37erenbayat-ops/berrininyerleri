import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface GalleryViewerProps {
  images: string[] | undefined;
  index: number | null;
  onClose: () => void;
  onPrev: (e: React.MouseEvent) => void;
  onNext: (e: React.MouseEvent) => void;
}

export const GalleryViewer: React.FC<GalleryViewerProps> = ({ images, index, onClose, onPrev, onNext }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (index === null || !images) return;
      if (e.key === 'ArrowRight') {
        const fakeE = { stopPropagation: () => {} } as any;
        onNext(fakeE);
      } else if (e.key === 'ArrowLeft') {
        const fakeE = { stopPropagation: () => {} } as any;
        onPrev(fakeE);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, images, onNext, onPrev, onClose]);

  if (index === null || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[5000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
        onClick={onClose}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-3 text-white/50 hover:text-white transition-colors z-[6000]"
        >
          <X className="w-8 h-8" />
        </button>

        {images.length > 1 && (
          <>
            <button 
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/20 transition-all bg-white/10 backdrop-blur-md rounded-full z-[6000] border border-white/20 shadow-2xl"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button 
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white hover:bg-white/20 transition-all bg-white/10 backdrop-blur-md rounded-full z-[6000] border border-white/20 shadow-2xl"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </>
        )}

        <motion.div 
          key={index}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative max-w-full max-h-full flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <img 
            src={images[index]} 
            alt="" 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
            referrerPolicy="no-referrer"
          />
          <div className="glass px-6 py-2 rounded-full text-white/70 text-xs font-bold tracking-widest uppercase">
            {index + 1} / {images.length}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
