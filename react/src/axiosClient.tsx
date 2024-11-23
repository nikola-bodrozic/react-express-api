import axios, { AxiosInstance } from 'axios';
const baseURL = `http://localhost:4000`;


export const axiosClient: AxiosInstance= axios.create({
	baseURL,
	timeout: 2000,
	withCredentials: true
});