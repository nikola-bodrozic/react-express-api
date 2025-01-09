import axios, { AxiosInstance } from 'axios';

export const axiosConfig = {
	baseURL: `http://localhost:4000/api/v1`,
	timeout: 2000,
	withCredentials: true
}
export const axiosClient: AxiosInstance = axios.create(axiosConfig);