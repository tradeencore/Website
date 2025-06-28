import React, { useEffect, useRef, memo } from 'react';

function TickerTape() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;

    // Widget configuration
    script.innerHTML = JSON.stringify({
      symbols: [
        {
          proName: 'FOREXCOM:SPXUSD',
          title: 'S&P 500'
        },
        {
          proName: 'FOREXCOM:NSXUSD',
          title: 'Nasdaq 100'
        },
        {
          proName: 'FX_IDC:EURUSD',
          title: 'EUR/USD'
        },
        {
          proName: 'BITSTAMP:BTCUSD',
          title: 'Bitcoin'
        },
        {
          proName: 'BITSTAMP:ETHUSD',
          title: 'Ethereum'
        },
        {
          description: 'SENSEX',
          proName: 'BSE:SENSEX'
        },
        {
          description: 'Gold',
          proName: 'TVC:GOLD'
        }
      ],
      displayMode: 'adaptive',
      colorTheme: 'dark',
      isTransparent: false,
      showSymbolLogo: true,
      locale: 'en'
    });

    // Add the script to the container
    if (container.current) {
      container.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (container.current) {
        const scripts = container.current.getElementsByTagName('script');
        Array.from(scripts).forEach(script => script.remove());
      }
    };
  }, []);

  return (
    <div ref={container} className="tradingview-widget-container bg-[var(--tv-background)] h-10 overflow-hidden border-b border-[var(--tv-border-color)]">
      <div className="tradingview-widget-container__widget h-full"></div>
    </div>
  );
}

export default memo(TickerTape);
