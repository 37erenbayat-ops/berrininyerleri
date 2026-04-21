import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Pin } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, Plus, MapPin } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  pins: Pin[];
  tempPin: Partial<Pin> | null;
  onMapClick: (lat: number, lng: number) => void;
  onPinClick: (pin: Pin) => void;
}

const MapEvents = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapView: React.FC<MapViewProps> = ({ pins, tempPin, onMapClick, onPinClick }) => {
  const visitedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const wishlistIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const tempIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <div className="w-full h-full relative overflow-hidden">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEvents onClick={onMapClick} />
        
        {pins.map((pin) => (
          <Marker 
            key={pin.id} 
            position={[pin.location.lat, pin.location.lng]}
            icon={pin.type === 'visited' ? visitedIcon : wishlistIcon}
            eventHandlers={{
              click: () => onPinClick(pin),
            }}
          >
            <Popup>
              <div className="p-1 font-sans">
                <h3 className="font-bold text-slate-800">{pin.title}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{pin.type === 'visited' ? 'Gidildi' : 'Hayal'}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {tempPin && !tempPin.id && tempPin.location && (
          <Marker 
            position={[tempPin.location.lat, tempPin.location.lng]}
            icon={tempIcon}
          >
             <Popup autoOpen>
              <div className="p-1 font-sans">
                <h3 className="font-bold text-slate-800 italic">İşaretleniyor...</h3>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Map Overlay Controls - Glassmorphism */}
      <div className="absolute bottom-28 left-8 z-[1000] flex flex-col gap-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-5 rounded-2xl flex flex-col gap-2.5 min-w-[200px]"
        >
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            <Navigation className="w-3.5 h-3.5" />
            <span>Harita Bilgisi</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-visited border border-white" />
            <span className="text-xs font-bold text-slate-600">Gezilen Yerler</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-wishlist border border-white" />
            <span className="text-xs font-bold text-slate-600">Hayaller</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-28 right-8 z-[1000]">
        <div className="glass px-5 py-2.5 rounded-full text-[11px] font-bold text-slate-600 flex items-center gap-2.5 shadow-xl">
          <Plus className="w-4 h-4 text-accent" />
          İşaretlemek için haritaya tıkla
        </div>
      </div>
    </div>
  );
};

