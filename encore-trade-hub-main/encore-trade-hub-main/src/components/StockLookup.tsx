import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface StockPrice {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
  timestamp: string;
}

const StockLookup = () => {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState<StockPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStockPrice = async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // For indices
      if (symbol === 'NIFTY' || symbol === 'SENSEX' || symbol === 'BANKNIFTY') {
        const endpoint = symbol === 'NIFTY' ? 'NSEI' : 
                        symbol === 'SENSEX' ? 'BSESN' : 
                        'BANKNIFTY';
        const response = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${endpoint}.NS&apikey=7PUG9XFEDPZFDXG2`
        );
        const data = await response.json();
        
        if (data['Global Quote']) {
          const quote = data['Global Quote'];
          const price = parseFloat(quote['05. price']);
          const change = parseFloat(quote['09. change']);
          const changePercent = parseFloat(quote['10. change percent']);
          
          setStockData({
            symbol: symbol.toUpperCase(),
            price: price.toFixed(2),
            change: change.toFixed(2),
            changePercent: (changePercent).toFixed(2),
            timestamp: quote['07. latest trading day']
          });
          return;
        }
      }

      // For regular stocks
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}.BSE&apikey=7PUG9XFEDPZFDXG2`
      );
      const data = await response.json();

      if (data['Global Quote']) {
        const quote = data['Global Quote'];
        const price = parseFloat(quote['05. price']);
        const change = parseFloat(quote['09. change']);
        const changePercent = parseFloat(quote['10. change percent']);
        
        setStockData({
          symbol: symbol.toUpperCase(),
          price: price.toFixed(2),
          change: change.toFixed(2),
          changePercent: (changePercent).toFixed(2),
          timestamp: quote['07. latest trading day']
        });
      } else {
        setError('Stock not found. Please check the symbol.');
      }
    } catch (error) {
      setError('Error fetching stock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStockPrice();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full md:w-auto">
          Stock Price Lookup
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stock Price Lookup</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="symbol">Stock Symbol (e.g., SBIN, RELIANCE)</Label>
            <div className="flex gap-2">
              <Input
                id="symbol"
                placeholder="Enter stock symbol"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Lookup'}
              </Button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {stockData && (
            <Card className="p-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{stockData.symbol}</span>
                  <span className="text-gray-500">as of {stockData.timestamp}</span>
                </div>
                <div className="text-2xl font-bold">₹{stockData.price}</div>
                <div className={`flex items-center ${parseFloat(stockData.change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{parseFloat(stockData.change) >= 0 ? '▲' : '▼'}</span>
                  <span className="ml-1">
                    {stockData.change} ({stockData.changePercent}%)
                  </span>
                </div>
              </div>
            </Card>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StockLookup;
