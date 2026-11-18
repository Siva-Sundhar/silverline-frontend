import api from "./server_api";

export const getAllProducts =  () => {
	return api.get('/api/v1/product/all-products');
};

export const getProductByCode =  (itemCode) => {
	return api.get(`api/v1/product/${itemCode}`);
};

export const searchProducts =  (keyword) => {
	return api.get('/api/v1/product/search', {
		params: { keyword },
	});
};
