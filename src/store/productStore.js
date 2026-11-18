
import { create } from 'zustand';

import api from '../API/server_api.js';

const useProductStore = create((set, get) => ({
	products: [],
	loading: false,
	loaded: false,
	error: null,

	fetchProducts: async () => {
		// Avoid unnecessary API calls.
		if (get().loaded || get().loading) return;

		set({ loading: true, error: null });

		try {
			const response = await api.get('/api/v1/product/all-products');

			set({
				products: response.data,
				loaded: true,
				loading: false,
			});
		} catch (error) {
			set({
				error: error.message || 'Failed to load products',
				loading: false,
			});
		}
	},

	getProductByCode: (itemCode) =>
		get().products.find((product) => product.itemCode === itemCode),

	setProducts: (products) =>
		set({ products, loaded: true }),

	clearProducts: () =>
		set({
			products: [],
			loaded: false,
			loading: false,
			error: null,
		}),
}));

export default useProductStore;
