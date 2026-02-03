import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  },
}));

export const useCartStore = create((set) => ({
  items: JSON.parse(localStorage.getItem('cart')) || [],
  totalPrice: 0,

  addItem: (item) => {
    set((state) => {
      const existingItem = state.items.find((i) => i._id === item._id);
      let newItems;
      if (existingItem) {
        newItems = state.items.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      } else {
        newItems = [...state.items, { ...item, quantity: item.quantity || 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  removeItem: (itemId) => {
    set((state) => {
      const newItems = state.items.filter((i) => i._id !== itemId);
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  updateQuantity: (itemId, quantity) => {
    set((state) => {
      const newItems = state.items.map((i) =>
        i._id === itemId ? { ...i, quantity: Math.max(1, quantity) } : i
      );
      localStorage.setItem('cart', JSON.stringify(newItems));
      return { items: newItems };
    });
  },

  clearCart: () => {
    set({ items: [] });
    localStorage.removeItem('cart');
  },

  getTotalPrice: () => {
    const state = useCartStore.getState();
    return state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));

export const useLocationStore = create((set) => ({
  userLocation: null,
  isLoadingLocation: false,
  error: null,

  setUserLocation: (location) => set({ userLocation: location }),
  setLoadingLocation: (isLoading) => set({ isLoadingLocation: isLoading }),
  setError: (error) => set({ error }),

  requestLocation: async () => {
    set({ isLoadingLocation: true });
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          set({
            userLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            isLoadingLocation: false,
          });
        },
        (error) => {
          set({ error: error.message, isLoadingLocation: false });
        }
      );
    } else {
      set({ error: 'Geolocation not supported', isLoadingLocation: false });
    }
  },
}));
