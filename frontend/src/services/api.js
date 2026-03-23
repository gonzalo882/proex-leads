const BASE = import.meta.env.VITE_API_URL || '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro');
  }
  return res.json();
}

export const api = {
  getLeads: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req('GET', `/leads${qs ? '?' + qs : ''}`);
  },
  createLead: (data) => req('POST', '/leads', data),
  updateLead: (id, data) => req('PATCH', `/leads/${id}`, data),
  deleteLead: (id) => req('DELETE', `/leads/${id}`),
};
