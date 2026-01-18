
import { Product, DeviceInfo, SiteConfig } from './types';

const PRODUCTS_KEY = 'nexus_products';
const LOGS_KEY = 'nexus_visitor_logs';
const CONFIG_KEY = 'nexus_site_config';

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Lavender Bliss Signature',
    description: 'Calming French lavender fields captured in a soy-wax blend for ultimate relaxation.',
    price: 200,
    category: 'Relaxation',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    discountPercentage: 5
  },
  {
    id: '2',
    name: 'Midnight Jasmine Glow',
    description: 'Enchanting floral notes that bloom at night, creating a romantic and mysterious ambiance.',
    price: 275,
    category: 'Floral',
    imageUrl: 'https://images.unsplash.com/photo-1602872030219-cbf917a55be3?auto=format&fit=crop&w=800&q=80',
    discountPercentage: 5
  },
  {
    id: '3',
    name: 'Golden Sandalwood',
    description: 'Warm, earthy, and sophisticated. A timeless scent for the modern home.',
    price: 350,
    category: 'Earthy',
    imageUrl: 'https://images.unsplash.com/photo-1596433809252-260c2745dfdd?auto=format&fit=crop&w=800&q=80',
    discountPercentage: 5
  }
];

const initialConfig: SiteConfig = {
  siteName: 'Mizo Candle',
  heroTitle: 'Illuminate Your Soul',
  heroSubtitle: 'Handcrafted artisanal candles that transform any space into a sanctuary of peace.',
  heroImageUrl: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?auto=format&fit=crop&w=1600&q=80',
  primaryColor: '#d97706',
  masterPasscode: '552008',
  isPublic: true
};

export const getProducts = (): Product[] => {
  const saved = localStorage.getItem(PRODUCTS_KEY);
  return saved ? JSON.parse(saved) : initialProducts;
};

export const saveProducts = (products: Product[]) => {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getSiteConfig = (): SiteConfig => {
  const saved = localStorage.getItem(CONFIG_KEY);
  return saved ? JSON.parse(saved) : initialConfig;
};

export const saveSiteConfig = (config: SiteConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const getVisitorLogs = (): DeviceInfo[] => {
  const saved = localStorage.getItem(LOGS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const addVisitorLog = (log: DeviceInfo) => {
  const current = getVisitorLogs();
  const updated = [log, ...current].slice(0, 100);
  localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
};
