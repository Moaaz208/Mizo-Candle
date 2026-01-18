
import React from 'react';
import { View } from '../types';

interface NavbarProps {
  siteName: string;
  currentView: View;
  onViewChange: (view: View) => void;
}

const Navbar: React.FC<NavbarProps> = ({ siteName, currentView, onViewChange }) => {
  return (
    <nav className="sticky top-0 z-50 glass border-b px-6 py-4 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer" 
        onClick={() => onViewChange(View.SHOWCASE)}
      >
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg shadow-xl overflow-hidden">
          {siteName.charAt(0)}
        </div>
        <span className="font-bold text-xl tracking-tight text-gray-900 hidden sm:inline">{siteName}</span>
      </div>

      <div className="flex bg-gray-100 p-1 rounded-2xl gap-1">
        {[
          { id: View.SHOWCASE, label: 'Store' },
          { id: View.AI_LAB, label: 'AI Studio' },
          { id: View.ADMIN, label: 'Admin' },
          { id: View.MONITOR, label: 'Spy Logs' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={`px-3 md:px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 ${
              currentView === tab.id 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
