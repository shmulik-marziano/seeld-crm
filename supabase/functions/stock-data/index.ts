import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const symbols = [
      '^TA35.TA',    // Tel Aviv 35
      '^GSPC',       // S&P 500
      '^IXIC',       // NASDAQ
      '^DJI',        // Dow Jones
      'BTC-USD'      // Bitcoin
    ];

    const stockData = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`,
            {
              headers: {
                'User-Agent': 'Mozilla/5.0'
              }
            }
          );
          
          const data = await response.json();
          const quote = data.chart.result[0].meta;
          const prevClose = quote.chartPreviousClose || quote.previousClose;
          const currentPrice = quote.regularMarketPrice;
          const change = currentPrice - prevClose;
          const changePercent = (change / prevClose) * 100;

          return {
            symbol: quote.symbol,
            name: getStockName(symbol),
            price: currentPrice.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2)
          };
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error);
          return {
            symbol,
            name: getStockName(symbol),
            price: '0.00',
            change: '0.00',
            changePercent: '0.00'
          };
        }
      })
    );

    return new Response(JSON.stringify(stockData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function getStockName(symbol: string): string {
  const names: Record<string, string> = {
    '^TA35.TA': 'TA-35',
    '^GSPC': 'S&P 500',
    '^IXIC': 'NASDAQ',
    '^DJI': 'DOW',
    'BTC-USD': 'Bitcoin'
  };
  return names[symbol] || symbol;
}
