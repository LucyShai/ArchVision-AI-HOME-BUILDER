export interface HomeStyle {
  id: string;
  name: string;
  description: string;
  icon: string; // Icon name reference
  imageUrl: string;
}

export interface DesignConfig {
  styleId: string;
  bedrooms: number;
  levels: number;
  bathrooms: number;
  lotSize: number;
  features: string[];
  customPrompt: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  type: 'blueprint' | 'exterior';
  timestamp: number;
  config: DesignConfig;
  prompt: string;
}

export interface Draft {
  id: string;
  name: string;
  timestamp: number;
  config: DesignConfig;
  images?: GeneratedImage[];
}

export enum ViewMode {
  HOME = 'home',
  GENERATE = 'generate',
  LIBRARY = 'library',
  COMPARE = 'compare'
}

export const HOME_STYLES: HomeStyle[] = [
  {
    id: 'modern-minimalist',
    name: 'Modern Minimalist',
    description: 'Clean lines, open spaces, floor-to-ceiling windows.',
    icon: 'Building2',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'traditional-family',
    name: 'Traditional Family',
    description: 'Classic architecture, warm materials, welcoming porches.',
    icon: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'luxury-villa',
    name: 'Luxury Villa',
    description: 'Grand entrance, premium materials, elegant design.',
    icon: 'Castle',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'compact-urban',
    name: 'Compact Urban',
    description: 'Space-efficient, modern urban design, vertical living.',
    icon: 'Building',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'eco-friendly',
    name: 'Eco-Friendly Sustainable',
    description: 'Green roof, solar panels, natural materials, passive design.',
    icon: 'Leaf',
    imageUrl: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=600&auto=format&fit=crop'
  }
];

export const AVAILABLE_FEATURES = [
  'Swimming Pool', 'Home Office', 'Garage', 
  'Basement', 'Rooftop Terrace', 'Garden',
  'Solar Panels', 'Smart Home System', 'Wine Cellar',
  'Home Gym', 'Guest Suite', 'Media Room'
];