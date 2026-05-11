'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { buyShares, createStock, fetchMyStock, fetchPortfolio, fetchStocks, updateStockPrice } from '../services/api';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState({ walletBalance: 0, holdings: [] });
  const [stocks, setStocks] = useState([]);
  const [myStock, setMyStock] = useState(null);
  const [prices, setPrices] = useState({});
  const [error, setError] = useState('');
  
  const [tickerInput, setTickerInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [buyTicker, setBuyTicker] = useState('');
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(localStorage.getItem('pex_token'));
  }, []);

  const handleSocketMessage = useCallback((message) => {
    if (message.type === 'TICKER_UPDATE') {
      setPrices((prev) => ({ ...prev, [message.payload.ticker]: message.payload.price }));
    }
  }, []);

  const wsStatus = useWebSocket(token, handleSocketMessage);

  const loadData = async () => {
    try {
      const [portRes, stocksRes, myRes] = await Promise.all([
        fetchPortfolio(),
        fetchStocks(),
        fetchMyStock()
      ]);
      setPortfolio(portRes);
      setStocks(stocksRes.stocks);
      setMyStock(myRes.stock);
      
      const initPrices = stocksRes.stocks.reduce((m, s) => ({ ...m, [s.ticker]: s.price }), {});
      setPrices(initPrices);
      
      if (stocksRes.stocks.length > 0 && !buyTicker) {
        setBuyTicker(stocksRes.stocks[0].ticker);
      }
    } catch (err) {
      setError('Failed to load data');
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  const totalNetWorth = useMemo(() => {
    const holdingsValue = portfolio.holdings.reduce((sum, item) => {
      const currentPrice = prices[item.ticker] ?? item.currentPrice ?? 0;
      return sum + (item.sharesOwned * currentPrice);
    }, 0);
    return portfolio.walletBalance + holdingsValue;
  }, [portfolio, prices]);

  const onBuy = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await buyShares(buyTicker, Number(buyQuantity));
      setPortfolio(prev => {
        const exists = prev.holdings.find(h => h.ticker === res.ticker);
        const newHoldings = exists 
          ? prev.holdings.map(h => h.ticker === res.ticker ? { 
              ...h, 
              sharesOwned: res.sharesOwned, 
              averagePrice: res.averagePrice // Обновляем цену покупки
            } : h)
          : [...prev.holdings, { 
              ticker: res.ticker, 
              sharesOwned: res.sharesOwned, 
              averagePrice: res.averagePrice 
            }];
        return { ...prev, walletBalance: res.walletBalance, holdings: newHoldings };
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateStock = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await createStock(tickerInput, Number(priceInput));
      setMyStock(res.stock);
      setStocks(prev => [...prev, res.stock]);
      setPrices(prev => ({ ...prev, [res.stock.ticker]: res.stock.price }));
      setPriceInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await updateStockPrice(myStock.ticker, Number(priceInput));
      setMyStock(res.stock);
      setPriceInput('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-shell">
      <div className="main-layout">
        <div className="content-area">
          <header className="app-header">
            <div>
              <h1>Net Worth: ${totalNetWorth.toFixed(2)}</h1>
              <p>Wallet Balance: ${portfolio.walletBalance.toFixed(2)}</p>
            </div>
            <div style={{textAlign: 'right'}}>
                <span className={`status-pill ${wsStatus}`}>{wsStatus}</span>
            </div>
          </header>

          {error && <div className="error-message">{error}</div>}

          <div className="dashboard-grid">
            <section className="section-card">
              <h2>Market Terminal</h2>
              <form onSubmit={onBuy}>
                <label style={{color: '#94a3b8', fontSize: '12px'}}>Select Ticker</label>
                <select value={buyTicker} onChange={e => setBuyTicker(e.target.value)}>
                  {stocks.map(s => (
                    <option key={s.ticker} value={s.ticker}>
                      {s.ticker} (${(prices[s.ticker] || s.price).toFixed(2)})
                    </option>
                  ))}
                </select>
                <label style={{color: '#94a3b8', fontSize: '12px'}}>Quantity</label>
                <input type="number" min="1" value={buyQuantity} onChange={e => setBuyQuantity(e.target.value)} />
                <button type="submit">Buy Shares</button>
              </form>
            </section>

            <section className="section-card">
              <h2>{myStock ? `Manage $${myStock.ticker}` : 'IPO: Create Your Stock'}</h2>
              {myStock ? (
                <form onSubmit={handleUpdatePrice}>
                  <p style={{marginBottom: '15px', color: '#94a3b8'}}>Current Price: <strong>${(prices[myStock.ticker] || myStock.price).toFixed(2)}</strong></p>
                  <label style={{color: '#94a3b8', fontSize: '12px'}}>New Market Price</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="Enter new price..." 
                    value={priceInput} 
                    onChange={e => setPriceInput(e.target.value)} 
                  />
                  <button type="submit">Update Price</button>
                </form>
              ) : (
                <form onSubmit={handleCreateStock}>
                  <label style={{color: '#94a3b8', fontSize: '12px'}}>Ticker Symbol (e.g. BTC)</label>
                  <input 
                    placeholder="TICKER" 
                    value={tickerInput} 
                    onChange={e => setTickerInput(e.target.value.toUpperCase())} 
                  />
                  <label style={{color: '#94a3b8', fontSize: '12px'}}>Initial Listing Price</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    value={priceInput} 
                    onChange={e => setPriceInput(e.target.value)} 
                  />
                  <button type="submit" style={{background: 'var(--success)'}}>Create Asset</button>
                </form>
              )}
            </section>
          </div>
        </div>

        {/* Правая панель (Счетчики с P&L) */}
        <aside className="assets-sidebar">
          <h2>Portfolio Assets</h2>
          <div className="holdings-list">
            {portfolio.holdings.length === 0 && <p style={{color: '#94a3b8', textAlign: 'center'}}>No assets in portfolio</p>}
            {portfolio.holdings.map(item => {
              const currentPrice = prices[item.ticker] || 0;
              const avgBuyPrice = item.averagePrice || 0;
              const profit = (currentPrice - avgBuyPrice) * item.sharesOwned;
              const isProfit = profit >= 0;

              return (
                <div key={item.ticker} className="asset-counter">
                  <div className="asset-info">
                    <span className="asset-ticker">{item.ticker}</span>
                    <span className="asset-price" style={{ color: isProfit ? '#10b981' : '#ef4444' }}>
                      ${currentPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <div style={{fontSize: '11px', color: '#94a3b8', marginBottom: '8px'}}>
                    Avg. Buy: ${avgBuyPrice.toFixed(2)}
                  </div>

                  <div className="asset-count">
                    <span className="count-label">Units</span>
                    <span className="count-value">{item.sharesOwned}</span>
                  </div>

                  <div className="asset-total" style={{ color: isProfit ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                    P/L: {isProfit ? '+' : ''}${profit.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}