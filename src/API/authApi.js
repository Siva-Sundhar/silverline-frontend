import api from './server_api';

export const loginWithPassword = async (username, password) => {
	const response = await api.post('/api/v1/auth/login', {
		username,
		password,
	});
	return response.data;
};

export const verifyOtp = async (username, otp) => {
	return await api.post('/api/v1/auth/otp/verify', {
		
			username,
			otp,
		
	});
};

export const resendOtp = async (username) => {
	const response = await api.post('/api/v1/auth/otp/resend', {
		username,
	});

	return response.data;
};
