const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('pex_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Server error');
  return payload;
}

export async function register(values) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(values) });
}

export async function login(values) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(values) });
}

export async function fetchPortfolio() {
  return request('/trade/portfolio');
}

export async function fetchStocks() {
  return request('/stocks');
}

export async function fetchMyStock() {
  return request('/stocks/mine');
}

export async function createStock(ticker, price) {
  return request('/stocks', {
    method: 'POST',
    body: JSON.stringify({ ticker, price })
  });
}

export async function updateStockPrice(ticker, price) {
  return request(`/stocks/${ticker}`, {
    method: 'PUT',
    body: JSON.stringify({ price })
  });
}

export async function buyShares(ticker, quantity) {
  return request('/trade/buy', {
    method: 'POST',
    body: JSON.stringify({ ticker, quantity })
  });
}