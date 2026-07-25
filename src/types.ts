export type ObjectCategory = 'toy' | 'camera' | 'journal' | 'art' | 'keepsake' | 'gadget';

export type HandoffMethod = 'direct_pass' | 'hidden_drop' | 'coffee_shop' | 'bench_leave' | 'community_box';

export type ThreadStatus = 'in_transit' | 'hidden_waiting' | 'retired';

export interface HandoffStep {
  id: string;
  stepNumber: number;
  locationName: string;
  neighborhood: string;
  lat: number;
  lng: number;
  timestamp: string; // ISO string or human formatted
  finderName: string;
  finderHandle: string;
  finderAvatar?: string;
  photoUrl: string;
  note: string;
  handoffMethod: HandoffMethod;
  dropSecret?: string; // Clue for the next stranger
  distanceFromPrevMiles: number;
  weather?: string;
}

export interface DriftObjectThread {
  id: string;
  code: string; // e.g., DRIFT-NYC-8821
  title: string;
  category: ObjectCategory;
  description: string;
  createdAt: string;
  originLocation: string;
  originLat: number;
  originLng: number;
  currentStatus: ThreadStatus;
  coverImage: string;
  totalDistanceMiles: number;
  totalKeepers: number;
  activeDays: number;
  steps: HandoffStep[];
  tags: string[];
  creatorName: string;
  creatorHandle: string;
}

export type MapTileTheme = 'dark' | 'light' | 'outdoors';

export interface NYCPoint {
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
}
