import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getCountryInfo } from '../utils/countryCurrency.js';

const initialState = {
	token: null,
	email: null,
	country: null,
	currency: null,
	currencySymbol: null,
	locale: null,
	ledgerName: null,
	role: null,
	taxMode: null,
	taxType: null,
	customers: [],
	products: [],
	productsLoaded: false,
	purchases: [],
	loading: false,
	error: null,
};

export const useAppStore = create(
	persist(
		(set) => ({
			...initialState,

			login: (data) => {
				const { currency, localeISO } = getCountryInfo('USA');
				set({
					token: data.token,
					email: data.email,
					country: data.country,
					currency: currency || 'USD',
					locale: localeISO || 'en-US',
					currencySymbol: data.currencySymbol || '$',
					ledgerName: data.ledgerName,
					role: data.role,
					taxMode: data.taxMode,
					taxType: data.taxType,
				});
			},

			logout: () => {
				set({
					...initialState,
				});
				sessionStorage.removeItem('app-auth-storage');
			},

			setCustomers: (customers) => {
				set({ customers });
			},

			setProducts: (items) => {
				set({ items, productsLoaded: true });
			},

			setPurchases: (purchases) => {
				set({ purchases });
			},

			setLoading: (loading) => {
				set({ loading });
			},

			setError: (error) => {
				set({ error });
			},
		}),
		{
			name: 'app-auth-storage',

			// Use sessionStorage instead of localStorage
			storage: createJSONStorage(() => sessionStorage),

			// Store only authentication information
			partialize: (state) => ({
				token: state.token,
				email: state.email,
				country: state.country,
				currency: state.currency,
				locale: state.locale,
				currencySymbol: state.currencySymbol,
				ledgerName: state.ledgerName,
				role: state.role,
				taxMode: state.taxMode,
				taxType: state.taxType,
			}),
		},
	),
);
