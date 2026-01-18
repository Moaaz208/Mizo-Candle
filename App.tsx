
import React, { useState, useEffect } from 'react';
import { View, Product, DeviceInfo, SiteConfig } from './types';
import { getProducts, saveProducts, addVisitorLog, getSiteConfig, saveSiteConfig } from './store';
import Navbar from './components/Navbar';
import ProductShowcase from './components/ProductShowcase';
import AdminPanel from './components/AdminPanel';
import DeviceMonitor from './components/DeviceMonitor';
import AuthGateway from './components/AuthGateway';
import AIChat from './components/AIChat';
import AILaboratory from './components/AILaboratory';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.SHOWCASE);
  const [products, setProducts] = useState<Product[]>([]);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(getSiteConfig());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [targetView, setTargetView] = useState<View | null>(null);
  
  useEffect(() => {
    setProducts(getProducts());

    // Check for API key for Veo/Imagen models
    const checkApiKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    const getDeviceType = () => {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile";
      return "Computer";
    };

    const getLocation = (): Promise<{lat?: number, lng?: number}> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve({}); return; }
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({}),
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      });
    };

    const captureDeviceInfo = async () => {
      let ip = 'Unknown';
      let country = 'Unknown';
      try {
        // Using ipapi.co for detailed location including country
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        ip = data.ip;
        country = data.country_name;
      } catch (e) {
        console.error("Failed to fetch GeoIP", e);
      }

      const loc = await getLocation();

      const info: DeviceInfo = {
        ip: ip,
        country: country,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        cores: navigator.hardwareConcurrency,
        // @ts-ignore
        memory: navigator.deviceMemory,
        latitude: loc.lat,
        longitude: loc.lng,
        deviceType: getDeviceType(),
      };

      try {
        // @ts-ignore
        if (navigator.getBattery) {
          // @ts-ignore
          const battery = await navigator.getBattery();
          info.batteryLevel = `${Math.round(battery.level * 100)}%`;
        }
      } catch (e) {}

      addVisitorLog(info);
    };

    captureDeviceInfo();
  }, []);

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    saveProducts(newProducts);
  };

  const handleUpdateConfig = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    saveSiteConfig(newConfig);
  };

  const navigateTo = (view: View) => {
    if (!isAuthenticated && (view === View.ADMIN || view === View.MONITOR || view === View.AI_LAB)) {
      setTargetView(view);
      return;
    }
    setCurrentView(view);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    if (targetView) {
      setCurrentView(targetView);
      setTargetView(null);
    }
  };

  const handleOpenKeySelector = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const isSiteLocked = !siteConfig.isPublic && !isAuthenticated;

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0 ${isSiteLocked ? 'overflow-hidden' : ''}`}>
      {targetView && (
        <AuthGateway 
          passcode={siteConfig.masterPasscode} 
          onSuccess={handleAuthSuccess} 
          onCancel={() => setTargetView(null)}
          isGlobalLock={isSiteLocked}
        />
      )}

      {!isSiteLocked && (
        <>
          <Navbar siteName={siteConfig.siteName} currentView={currentView} onViewChange={navigateTo} />
          
          <main className="flex-grow">
            {currentView === View.SHOWCASE && (
              <ProductShowcase config={siteConfig} products={products} />
            )}
            {currentView === View.ADMIN && (
              <AdminPanel 
                products={products} 
                onUpdateProducts={handleUpdateProducts} 
                siteConfig={siteConfig}
                onUpdateConfig={handleUpdateConfig}
                onInstallRequest={() => {}}
                canInstall={!!deferredPrompt}
                onLogout={() => setIsAuthenticated(false)}
              />
            )}
            {currentView === View.MONITOR && (
              <DeviceMonitor />
            )}
            {currentView === View.AI_LAB && (
              <AILaboratory 
                hasApiKey={hasApiKey} 
                onOpenKeySelector={handleOpenKeySelector}
                onUpdateProducts={handleUpdateProducts}
                products={products}
              />
            )}
          </main>

          <AIChat />

          <footer className="bg-white border-t py-8 text-center text-gray-400 text-xs hidden md:block">
            &copy; {new Date().getFullYear()} {siteConfig.siteName}. Secured System.
          </footer>

          <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t flex justify-around items-center py-3 z-[80]">
            {[
              { id: View.SHOWCASE, icon: '🏪', label: 'Store' },
              { id: View.AI_LAB, icon: '✨', label: 'AI Lab' },
              { id: View.ADMIN, icon: '⚙️', label: 'Admin' },
              { id: View.MONITOR, icon: '🕵️', label: 'Logs' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex flex-col items-center gap-1 transition-all ${currentView === item.id ? 'text-black scale-110' : 'text-gray-400 opacity-60'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {isSiteLocked && (
        <AuthGateway 
          passcode={siteConfig.masterPasscode} 
          onSuccess={handleAuthSuccess} 
          onCancel={() => {}} 
          isGlobalLock={true}
        />
      )}
    </div>
  );
};

export default App;
