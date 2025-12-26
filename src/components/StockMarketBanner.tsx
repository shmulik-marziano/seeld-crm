import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface StockData {
  name: string;
  price: string;
  change: string;
  changePercent: string;
}

const StockMarketBanner = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('stock-data');
        
        if (error) throw error;
        
        if (data && Array.isArray(data)) {
          setStocks(data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stock data:', error);
        // Fallback to mock data
        setStocks([
          { name: 'תל אביב 35', price: '2,045.23', change: '12.45', changePercent: '0.61' },
          { name: 'S&P 500', price: '4,567.89', change: '23.45', changePercent: '0.52' },
          { name: 'NASDAQ', price: '14,234.56', change: '89.12', changePercent: '0.63' },
          { name: 'DOW JONES', price: '34,567.12', change: '156.78', changePercent: '0.45' },
          { name: 'Bitcoin', price: '43,234.56', change: '1,234.56', changePercent: '2.94' }
        ]);
        setLoading(false);
      }
    };

    fetchStocks();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStocks, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 py-3 overflow-hidden relative">
        <div className="absolute inset-0 chip-pattern opacity-10" />
        <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-white">
          <Loader2 className="animate-spin" size={20} />
          <span className="text-sm font-medium">טוען נתוני שוק...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 py-3 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 chip-pattern opacity-10" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute top-0 right-0 w-64 h-full bg-white/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Scrolling Stock Data */}
      <div className="relative z-10">
        <div className="flex animate-marquee gap-8">
          {[...stocks, ...stocks].map((stock, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-2 glass-effect rounded-lg flex-shrink-0 hover:bg-white/20 transition-all"
            >
              <div className="flex flex-col items-start min-w-[120px]">
                <span className="text-white font-bold text-sm">{stock.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{stock.price}</span>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded ${
                  parseFloat(stock.change) >= 0 
                    ? 'bg-secondary-500/30 text-secondary-100' 
                    : 'bg-destructive/30 text-red-200'
                }`}>
                  {parseFloat(stock.change) >= 0 ? (
                    <TrendingUp size={14} />
                  ) : (
                    <TrendingDown size={14} />
                  )}
                  <span className="text-xs font-bold">
                    {parseFloat(stock.changePercent) >= 0 ? '+' : ''}
                    {stock.changePercent}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockMarketBanner;
