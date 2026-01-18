
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  discountPercentage?: number;
}

export interface SiteConfig {
  siteName: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  primaryColor: string;
  masterPasscode: string;
  isPublic: boolean;
}

export interface DeviceInfo {
  ip: string;
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  viewportSize: string;
  connectionType?: string;
  timestamp: string;
  timezone: string;
  batteryLevel?: string;
  cores?: number;
  memory?: number;
  latitude?: number;
  longitude?: number;
  deviceType?: string;
  country?: string;
}

export enum View {
  SHOWCASE = 'showcase',
  ADMIN = 'admin',
  MONITOR = 'monitor',
  LOCKED = 'locked',
  AI_LAB = 'ai_lab'
}
