export type PinType = 'visited' | 'wishlist';

export interface Pin {
  id?: string;
  title: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  type: PinType;
  date?: string;
  notes?: string;
  rating?: number;
  images?: string[];
  createdBy: string;
  createdByName: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
  isFavorite?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  theme?: 'light' | 'dark';
  accentColor?: string;
}

export interface Comment {
  id?: string;
  pinId: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: any;
}
