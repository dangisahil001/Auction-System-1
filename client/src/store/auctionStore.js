import { create } from 'zustand';
import api from '../lib/api';

export const useAuctionStore = create((set, get) => ({
  auctions: [],
  currentAuction: null,
  pagination: null,
  isLoading: false,
  filters: {
    status: '',
    category: '',
    search: '',
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  fetchAuctions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auctions', { params: { ...get().filters, ...params } });
      set({
        auctions: response.data.auctions,
        pagination: response.data.pagination,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchAuctionById: async (id) => {
    set({ isLoading: true });
    try {
      const response = await api.get(`/auctions/${id}`);
      set({ currentAuction: response.data.auction, isLoading: false });
      return response.data.auction;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createAuction: async (data) => {
    try {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'images' && data.images) {
          data.images.forEach((image) => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, data[key]);
        }
      });

      const response = await api.post('/auctions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAuction: async (id, data) => {
    try {
      const response = await api.put(`/auctions/${id}`, data);
      set({ currentAuction: response.data.auction });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateCurrentPrice: (price, totalBids, highestBidder) => {
    const auction = get().currentAuction;
    if (auction) {
      set({
        currentAuction: {
          ...auction,
          currentPrice: price,
          totalBids,
          highestBidder,
        },
      });
    }
  },

  setRemainingTime: (remainingTime) => {
    const auction = get().currentAuction;
    if (auction) {
      set({
        currentAuction: {
          ...auction,
          remainingTime,
        },
      });
    }
  },
}));
