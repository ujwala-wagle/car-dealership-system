const API_BASE = 'http://localhost:5000/api';

export const api = {
  // Auth
  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Vehicles
  async getVehicles(token) {
    const res = await fetch(`${API_BASE}/vehicles`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async searchVehicles(token, queryParams) {
    const query = new URLSearchParams();
    if (queryParams.make) query.append('make', queryParams.make);
    if (queryParams.category) query.append('category', queryParams.category);
    if (queryParams.minPrice) query.append('minPrice', queryParams.minPrice);
    if (queryParams.maxPrice) query.append('maxPrice', queryParams.maxPrice);

    const res = await fetch(`${API_BASE}/vehicles/search?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async createVehicle(token, data) {
    const res = await fetch(`${API_BASE}/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateVehicle(token, id, data) {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteVehicle(token, id) {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async purchaseVehicle(token, id) {
    const res = await fetch(`${API_BASE}/vehicles/${id}/purchase`, {
      method: 'POST',
      headers: { credentials: 'omit', Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  async restockVehicle(token, id, quantity) {
    const res = await fetch(`${API_BASE}/vehicles/${id}/restock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return res.json();
  },
};
