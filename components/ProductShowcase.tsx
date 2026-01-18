
import React from 'react';
import { Product, SiteConfig } from '../types';

interface ProductShowcaseProps {
  products: Product[];
  config: SiteConfig;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ products, config }) => {
  return (
    <div className="animate-fadeIn">
      {/* Dynamic Hero Section */}
      <section className="relative h-[65vh] flex items-center justify-center overflow-hidden mb-16">
        <div className="absolute inset-0 z-0">
          <img 
            src={config.heroImageUrl} 
            alt="Mizo Candle Hero" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <div className="inline-block px-4 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full mb-6">
            Handcrafted in Egypt
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tight drop-shadow-2xl">
            {config.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 leading-relaxed max-w-2xl mx-auto drop-shadow-md">
            {config.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="container mx-auto px-6 mb-20">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">The Collection</h2>
          <div className="h-[2px] flex-grow mx-8 bg-gray-100"></div>
          <span className="text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Special 5% Discount Applied</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => {
            const discount = product.discountPercentage || 0;
            const finalPrice = product.price * (1 - discount / 100);
            
            return (
              <div 
                key={product.id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full"
              >
                <div className="aspect-[1/1] overflow-hidden relative">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  {discount > 0 && (
                    <div className="absolute top-6 right-6 bg-red-500 text-white font-black text-xs px-3 py-2 rounded-2xl shadow-lg">
                      -{discount}%
                    </div>
                  )}
                  <div className="absolute bottom-6 left-6">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-black shadow-sm">
                      {product.category}
                    </span>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
                    {product.description}
                  </p>
                  
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex flex-col">
                      {discount > 0 && (
                        <span className="text-sm text-gray-400 line-through font-bold">
                          {product.price} EGP
                        </span>
                      )}
                      <span className="text-3xl font-black text-gray-900">
                        {finalPrice.toFixed(0)} <span className="text-sm font-medium">EGP</span>
                      </span>
                    </div>
                  </div>

                  <button 
                    className="w-full py-4 px-6 rounded-2xl font-black transition-all duration-300 transform active:scale-95 shadow-lg shadow-amber-100 flex items-center justify-center gap-2"
                    style={{ backgroundColor: config.primaryColor, color: '#fff' }}
                  >
                    <span>Order Now</span>
                    <span className="text-xl">🕯️</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProductShowcase;
