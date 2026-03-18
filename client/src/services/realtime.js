export function openOrdersStream() {
  if (typeof EventSource === 'undefined') return null;

  const token = localStorage.getItem('token');
  if (!token) return null;

  // EventSource can't reliably send headers, so the backend accepts ?token=...
  const url = `/api/orders/stream?token=${encodeURIComponent(token)}`;
  return new EventSource(url);
}

