import { useState, useCallback } from 'react';

import { useAppStore } from '../store/useAppStore';
import { getAllProducts, getProductByCode } from '../API/productApi';

const useProducts = () => {
	const items = useAppStore((state) => state.items);
	const productsLoaded = useAppStore((state) => state.productsLoaded);
	const setItems = useAppStore((state) => state.setProducts);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Fetch all products
	const fetchProducts = useCallback(
		async (force = false) => {
			if (productsLoaded && !force) return items;

			setLoading(true);
			setError(null);

			try {
				const response = await getAllProducts();

				setItems(response.data);

				return response.data;
			} catch (err) {
				setError(err.response?.data?.message || 'Unable to fetch products');
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[productsLoaded, items, setItems],
	);

	// Get product by ID
	const fetchProductByCode = async (itemCode) => {
		const response = await getProductByCode(itemCode);
		return response.data;
	};

	// Create product
	// const addProduct = async (data) => {
	// 	const response = await createProduct(data);

	// 	setItems([...items, response.data]);

	// 	return response.data;
	// };

	// Update product
	// const editProduct = async (id, data) => {
	// 	const response = await updateProduct(id, data);

	// 	setItems(
	// 		items.map((item) =>
	// 			item.id === id ? response.data : item,
	// 		),
	// 	);

	// 	return response.data;
	// };

	return {
		items,
		loading,
		error,
		fetchProducts,
	};
};

export default useProducts;
